/**
 * Browser-based face detection using TensorFlow.js and face-api.
 * Runs in the client so the server stays small (no tfjs-node on Vercel).
 */
import type { FaceDetails, FaceRegions, FaceRegionPolygon, FaceRegionRect } from '$lib/types/skin';

const MODELS_BASE = '/models';
const MIN_REGION_SIZE = 16;
const EYE_PADDING_RATIO = 0.4;
const FOREHEAD_BROW_MARGIN = 0.15;

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
	const normalized = Math.min(1, Math.max(0, (avgSlope - 0.2) / 0.8));
	return Math.round(100 * normalized);
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

function clampBox(
	box: { x: number; y: number; width: number; height: number },
	imgW: number,
	imgH: number
): FaceRegionRect {
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

export interface BrowserFaceResult {
	faceRegions: FaceRegions;
	faceDetails?: FaceDetails;
	structureScore?: number;
}

let modelsLoaded = false;

async function ensureModelsLoaded(): Promise<void> {
	if (modelsLoaded) return;
	const faceapi = (await import('@vladmandic/face-api')) as typeof import('@vladmandic/face-api');
	await faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_BASE);
	await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_BASE);
	await faceapi.nets.ageGenderNet.loadFromUri(MODELS_BASE);
	await faceapi.nets.faceExpressionNet.loadFromUri(MODELS_BASE);
	modelsLoaded = true;
}

/**
 * Run face detection in the browser on an image element.
 * Returns face regions, details (age, gender, expressions), and structure score, or null if no face or on error.
 */
export async function runFaceAnalysisInBrowser(
	image: HTMLImageElement
): Promise<BrowserFaceResult | null> {
	try {
		await ensureModelsLoaded();
		const faceapi = (await import('@vladmandic/face-api')) as typeof import('@vladmandic/face-api');
		const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3, maxResults: 1 });
		const result = await faceapi
			.detectSingleFace(image, options)
			.withFaceLandmarks()
			.withAgeAndGender()
			.withFaceExpressions();
		if (!result?.detection || !result?.landmarks) return null;

		const box = result.detection.box;
		const landmarks = result.landmarks;
		const origW = image.naturalWidth || image.width;
		const origH = image.naturalHeight || image.height;

		const leftEyebrow = landmarks.getLeftEyeBrow().map((p) => ({ x: p.x, y: p.y }));
		const rightEyebrow = landmarks.getRightEyeBrow().map((p) => ({ x: p.x, y: p.y }));
		const eyebrowTopY = Math.min(
			...leftEyebrow.map((p) => p.y),
			...rightEyebrow.map((p) => p.y)
		);
		const faceTop = box.y;
		const leftBrowMinX = Math.min(...leftEyebrow.map((p) => p.x));
		const rightBrowMaxX = Math.max(...rightEyebrow.map((p) => p.x));
		const browSpan = rightBrowMaxX - leftBrowMinX;
		const margin = browSpan * FOREHEAD_BROW_MARGIN;
		const topLeftX = Math.max(0, leftBrowMinX - margin);
		const topRightX = Math.min(origW, rightBrowMaxX + margin);
		const leftBrowAvgY = leftEyebrow.reduce((s, p) => s + p.y, 0) / leftEyebrow.length;
		const rightBrowAvgY = rightEyebrow.reduce((s, p) => s + p.y, 0) / rightEyebrow.length;

		const foreheadPolygon: FaceRegionPolygon['points'] = [
			{ x: topLeftX, y: Math.max(0, faceTop) },
			{ x: topRightX, y: Math.max(0, faceTop) },
			{ x: Math.min(origW, rightBrowMaxX + margin), y: Math.min(origH, rightBrowAvgY) },
			{ x: Math.max(0, leftBrowMinX - margin), y: Math.min(origH, leftBrowAvgY) }
		];

		const polyMinX = Math.min(...foreheadPolygon.map((p) => p.x));
		const polyMaxX = Math.max(...foreheadPolygon.map((p) => p.x));
		const polyMinY = Math.min(...foreheadPolygon.map((p) => p.y));
		const polyMaxY = Math.max(...foreheadPolygon.map((p) => p.y));
		const foreheadRect = clampBox(
			{ x: polyMinX, y: polyMinY, width: polyMaxX - polyMinX, height: polyMaxY - polyMinY },
			origW,
			origH
		);

		const leftEyePoints = landmarks.getLeftEye().map((p) => ({ x: p.x, y: p.y }));
		const rightEyePoints = landmarks.getRightEye().map((p) => ({ x: p.x, y: p.y }));
		const leftEyeBox = clampBox(boxFromPoints(leftEyePoints, EYE_PADDING_RATIO), origW, origH);
		const rightEyeBox = clampBox(boxFromPoints(rightEyePoints, EYE_PADDING_RATIO), origW, origH);

		const jawPoints = (landmarks.getJawOutline?.() ?? []).map((p) => ({ x: p.x, y: p.y }));
		const structureScore = computeStructureScoreFromJaw(jawPoints);

		const resultAny = result as {
			age?: number;
			gender?: string;
			genderProbability?: number;
			expressions?: Record<string, number>;
		};
		let faceDetails: FaceDetails | undefined;
		if (
			typeof resultAny.age === 'number' &&
			(resultAny.gender === 'male' || resultAny.gender === 'female')
		) {
			faceDetails = {
				age: Math.round(resultAny.age),
				gender: resultAny.gender,
				genderProbability:
					typeof resultAny.genderProbability === 'number' ? resultAny.genderProbability : 0,
				expressions: resultAny.expressions
			};
		}

		return {
			faceRegions: {
				imageWidth: origW,
				imageHeight: origH,
				regions: {
					forehead: { points: foreheadPolygon },
					leftEye: leftEyeBox,
					rightEye: rightEyeBox
				}
			},
			...(faceDetails && { faceDetails }),
			...(structureScore != null && { structureScore })
		};
	} catch (err) {
		console.error('[faceAnalysis] Browser face detection failed:', err);
		return null;
	}
}
