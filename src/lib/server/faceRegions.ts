/**
 * Face and region detection using @vladmandic/face-api.
 * Detects one face, 68 landmarks, and crops forehead + left/right eye regions
 * for per-region texture/evenness analysis. Used only on server (Node).
 */
import path from 'node:path';
import sharp from 'sharp';

const DETECTION_MAX_SIZE = 512;
const EYE_PADDING_RATIO = 0.4; // expand eye box by 40% for crow's feet area
const MIN_REGION_SIZE = 16;
/** Forehead width = brow span plus this fraction on each side (avoids hair/background). */
const FOREHEAD_BROW_MARGIN = 0.12;

export interface FaceRegionBuffers {
	forehead: Buffer;
	leftEye: Buffer;
	rightEye: Buffer;
}

/** Rectangle in original image pixel coordinates (left, top, width, height). */
export interface FaceRegionRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

/** Polygon for tilted regions (e.g. forehead following brow line). */
export interface FaceRegionPolygon {
	points: Array<{ x: number; y: number }>;
}

/** Age, gender and expressions from face-api (optional, when models are run). */
export interface FaceRegionDetails {
	age: number;
	gender: 'male' | 'female';
	genderProbability: number;
	expressions: Record<string, number>;
}

/** Buffers for analysis plus region rects/polygon, image size, optional face details and structure score. */
export interface FaceRegionResult {
	buffers: FaceRegionBuffers;
	imageWidth: number;
	imageHeight: number;
	regions: {
		forehead: FaceRegionPolygon;
		leftEye: FaceRegionRect;
		rightEye: FaceRegionRect;
	};
	/** Present when age/gender/expression models were run. */
	faceDetails?: FaceRegionDetails;
	/** Structure/firmness score 0–100 from jaw outline geometry (sharper jaw = higher). */
	structureScore?: number;
}

let faceApiReady: Promise<{
	faceapi: typeof import('@vladmandic/face-api');
	tf: typeof import('@tensorflow/tfjs-node');
}> | null = null;

async function getFaceApi() {
	if (faceApiReady) return faceApiReady;
	faceApiReady = (async () => {
		// tfjs-node must be loaded before face-api
		const tf = await import('@tensorflow/tfjs-node');
		const faceapi = (await import('@vladmandic/face-api')) as typeof import('@vladmandic/face-api');
		await tf.default.setBackend('tensorflow');
		await tf.default.ready();
		const modelPath = path.join(process.cwd(), 'node_modules/@vladmandic/face-api/model');
		await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
		await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
		await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
		await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
		return { faceapi, tf: tf.default };
	})();
	return faceApiReady;
}

function boxFromPoints(
	points: Array<{ x: number; y: number }>,
	paddingRatio: number
): { x: number; y: number; width: number; height: number } {
	if (points.length === 0)
		return { x: 0, y: 0, width: MIN_REGION_SIZE, height: MIN_REGION_SIZE };
	let minX = points[0].x;
	let maxX = points[0].x;
	let minY = points[0].y;
	let maxY = points[0].y;
	for (const p of points) {
		minX = Math.min(minX, p.x);
		maxX = Math.max(maxX, p.x);
		minY = Math.min(minY, p.y);
		maxY = Math.max(maxY, p.y);
	}
	const w = maxX - minX || MIN_REGION_SIZE;
	const h = maxY - minY || MIN_REGION_SIZE;
	const padW = w * paddingRatio;
	const padH = h * paddingRatio;
	return {
		x: Math.max(0, minX - padW),
		y: Math.max(0, minY - padH),
		width: w + 2 * padW,
		height: h + 2 * padH
	};
}

/**
 * Structure score 0–100 from jaw outline (68-point: 0–16). Sharper jaw contour = higher score.
 * Uses left/right jaw slopes from chin (point 8) to corners; steeper slope = more defined jaw.
 */
function computeStructureScoreFromJaw(jawPoints: Array<{ x: number; y: number }>): number | undefined {
	if (jawPoints.length < 17) return undefined;
	const chin = jawPoints[8];
	const left = jawPoints[0];
	const right = jawPoints[16];
	const dxL = Math.abs(chin.x - left.x) || 1;
	const dxR = Math.abs(chin.x - right.x) || 1;
	const slopeL = (chin.y - left.y) / dxL;
	const slopeR = (chin.y - right.y) / dxR;
	const avgSlope = (Math.abs(slopeL) + Math.abs(slopeR)) / 2;
	// Typical slopes ~0.3–1.2; map to 0–100 (higher slope = sharper = higher score)
	const normalized = Math.min(1, Math.max(0, (avgSlope - 0.2) / 0.8));
	return Math.round(100 * normalized);
}

function clampBox(
	box: { x: number; y: number; width: number; height: number },
	imgW: number,
	imgH: number
): { left: number; top: number; width: number; height: number } {
	let { x, y, width, height } = box;
	if (width < MIN_REGION_SIZE) width = MIN_REGION_SIZE;
	if (height < MIN_REGION_SIZE) height = MIN_REGION_SIZE;
	if (x < 0) {
		width += x;
		x = 0;
	}
	if (y < 0) {
		height += y;
		y = 0;
	}
	if (x + width > imgW) width = imgW - x;
	if (y + height > imgH) height = imgH - y;
	if (width < MIN_REGION_SIZE) width = MIN_REGION_SIZE;
	if (height < MIN_REGION_SIZE) height = MIN_REGION_SIZE;
	return {
		left: Math.round(x),
		top: Math.round(y),
		width: Math.round(width),
		height: Math.round(height)
	};
}

/**
 * Detect one face, get 68 landmarks, and crop forehead + left/right eye regions
 * from the original image. Returns buffers plus region rects and image size for overlays,
 * or null if no face is detected or models fail.
 */
export async function getFaceRegionBuffers(imageBuffer: Buffer): Promise<FaceRegionResult | null> {
	try {
		const { faceapi, tf } = await getFaceApi();
		const meta = await sharp(imageBuffer).metadata();
		const origW = meta.width ?? 0;
		const origH = meta.height ?? 0;
		if (origW < 32 || origH < 32) return null;

		// Resize for faster detection; use PNG to avoid JPEG compression artifacts affecting detection/crops
		const scale = Math.min(1, DETECTION_MAX_SIZE / Math.max(origW, origH));
		const detW = Math.round(origW * scale);
		const detH = Math.round(origH * scale);
		const resized = await sharp(imageBuffer)
			.resize(detW, detH, { fit: 'fill' })
			.png()
			.toBuffer();

		const tfAny = tf as unknown as { tidy: (fn: () => unknown) => unknown };
		const faceapiTf = faceapi.tf as unknown as {
			node: { decodeImage: (buf: Buffer, channels: number) => { shape: number[]; dispose: () => void } };
			split: (t: unknown, n: number, axis: number) => unknown[];
			stack: (tensors: unknown[], axis: number) => unknown;
			reshape: (t: unknown, shape: number[]) => unknown;
			expandDims: (t: unknown, axis: number) => unknown;
		};
		const tensor = tfAny.tidy(() => {
			const decode = faceapiTf.node.decodeImage(resized, 3);
			const shape = decode.shape as number[];
			if (shape[2] === 4) {
				const channels = faceapiTf.split(decode, 4, 2);
				const rgb = faceapiTf.stack([channels[0], channels[1], channels[2]], 2);
				return faceapiTf.reshape(rgb, [1, shape[0], shape[1], 3]);
			}
			return faceapiTf.expandDims(decode, 0);
		}) as { dispose: () => void };

		const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3, maxResults: 1 });
		const result = await faceapi
			.detectSingleFace(tensor as import('@vladmandic/face-api').TNetInput, options)
			.withFaceLandmarks()
			.withAgeAndGender()
			.withFaceExpressions();
		if (tensor && typeof tensor.dispose === 'function') tensor.dispose();

		if (!result?.detection || !result?.landmarks) return null;

		// Extract age, gender, expressions (face-api adds these when chained)
		const resultAny = result as {
			age?: number;
			gender?: string;
			genderProbability?: number;
			expressions?: { neutral: number; happy: number; sad: number; angry: number; fearful: number; disgusted: number; surprised: number };
		};
		let faceDetails: FaceRegionDetails | undefined;
		if (
			typeof resultAny.age === 'number' &&
			(resultAny.gender === 'male' || resultAny.gender === 'female')
		) {
			faceDetails = {
				age: Math.round(resultAny.age),
				gender: resultAny.gender,
				genderProbability: typeof resultAny.genderProbability === 'number' ? resultAny.genderProbability : 0,
				expressions: resultAny.expressions
					? {
							neutral: resultAny.expressions.neutral,
							happy: resultAny.expressions.happy,
							sad: resultAny.expressions.sad,
							angry: resultAny.expressions.angry,
							fearful: resultAny.expressions.fearful,
							disgusted: resultAny.expressions.disgusted,
							surprised: resultAny.expressions.surprised
						}
					: {}
			};
		}

		type FaceResult = {
			detection?: { box: { x: number; y: number; width: number; height: number } };
			alignedRect?: { box: { x: number; y: number; width: number; height: number } };
			landmarks: {
				getLeftEyeBrow: () => Array<{ x: number; y: number }>;
				getRightEyeBrow: () => Array<{ x: number; y: number }>;
				getLeftEye: () => Array<{ x: number; y: number }>;
				getRightEye: () => Array<{ x: number; y: number }>;
				getJawOutline: () => Array<{ x: number; y: number }>;
			};
		};
		const res = result as FaceResult;
		const box = res.detection?.box ?? res.alignedRect?.box;
		if (!box) return null;
		const landmarks = res.landmarks;

		// Scale factor from detection image back to original
		const sx = origW / detW;
		const sy = origH / detH;

		const leftEyebrow = landmarks.getLeftEyeBrow().map((p) => ({ x: p.x * sx, y: p.y * sy }));
		const rightEyebrow = landmarks.getRightEyeBrow().map((p) => ({ x: p.x * sx, y: p.y * sy }));
		const eyebrowTopY = Math.min(
			...leftEyebrow.map((p) => p.y),
			...rightEyebrow.map((p) => p.y)
		);
		const faceTop = box.y * sy;
		const foreheadHeight = Math.max(MIN_REGION_SIZE, eyebrowTopY - faceTop);

		// Forehead: use brow span (with small margin) so we stay on skin and don't include hair/background
		const leftBrowMinX = Math.min(...leftEyebrow.map((p) => p.x));
		const rightBrowMaxX = Math.max(...rightEyebrow.map((p) => p.x));
		const browSpan = rightBrowMaxX - leftBrowMinX;
		const margin = browSpan * FOREHEAD_BROW_MARGIN;
		const topLeftX = Math.max(0, leftBrowMinX - margin);
		const topRightX = Math.min(origW, rightBrowMaxX + margin);
		const leftBrowAvgY = leftEyebrow.reduce((s, p) => s + p.y, 0) / leftEyebrow.length;
		const rightBrowAvgY = rightEyebrow.reduce((s, p) => s + p.y, 0) / rightEyebrow.length;

		// Polygon: trapezoid from face top to brow line, width = brow span + margin (not full face box)
		const foreheadPolygon: FaceRegionPolygon['points'] = [
			{ x: topLeftX, y: Math.max(0, faceTop) },
			{ x: topRightX, y: Math.max(0, faceTop) },
			{ x: Math.min(origW, rightBrowMaxX + margin), y: Math.min(origH, rightBrowAvgY) },
			{ x: Math.max(0, leftBrowMinX - margin), y: Math.min(origH, leftBrowAvgY) }
		];

		// Crop for measurement: bounding box of the polygon (same tight region, no full face width)
		const polyMinX = Math.min(...foreheadPolygon.map((p) => p.x));
		const polyMaxX = Math.max(...foreheadPolygon.map((p) => p.x));
		const polyMinY = Math.min(...foreheadPolygon.map((p) => p.y));
		const polyMaxY = Math.max(...foreheadPolygon.map((p) => p.y));
		const foreheadRect = clampBox(
			{
				x: polyMinX,
				y: polyMinY,
				width: polyMaxX - polyMinX,
				height: polyMaxY - polyMinY
			},
			origW,
			origH
		);

		const leftEyePoints = landmarks.getLeftEye().map((p) => ({ x: p.x * sx, y: p.y * sy }));
		const rightEyePoints = landmarks.getRightEye().map((p) => ({ x: p.x * sx, y: p.y * sy }));
		const leftEyeBox = clampBox(
			boxFromPoints(leftEyePoints, EYE_PADDING_RATIO),
			origW,
			origH
		);
		const rightEyeBox = clampBox(
			boxFromPoints(rightEyePoints, EYE_PADDING_RATIO),
			origW,
			origH
		);

		const jawPoints = (landmarks.getJawOutline?.() ?? []).map((p) => ({ x: p.x * sx, y: p.y * sy }));
		const structureScore = computeStructureScoreFromJaw(jawPoints);

		const [foreheadBuf, leftEyeBuf, rightEyeBuf] = await Promise.all([
			sharp(imageBuffer).extract(foreheadRect).toBuffer(),
			sharp(imageBuffer).extract(leftEyeBox).toBuffer(),
			sharp(imageBuffer).extract(rightEyeBox).toBuffer()
		]);

		return {
			buffers: { forehead: foreheadBuf, leftEye: leftEyeBuf, rightEye: rightEyeBuf },
			imageWidth: origW,
			imageHeight: origH,
			regions: {
				forehead: { points: foreheadPolygon },
				leftEye: leftEyeBox,
				rightEye: rightEyeBox
			},
			...(faceDetails && { faceDetails }),
			...(structureScore != null && { structureScore })
		};
	} catch (err) {
		// Log so you can see why region-based analysis didn't run (e.g. tfjs-node not loading, no face)
		console.error('[faceRegions] Face detection failed, using fallback:', err instanceof Error ? err.message : err);
		return null;
	}
}
