import sharp from 'sharp';
import type { SkinAnalysisResult } from '$lib/types/skin';
import { getFaceRegionBuffers } from './faceRegions';

const ANALYSIS_SIZE = 200; // Resize for fast analysis

/**
 * Sharp-only analysis (texture/evenness). No face detection.
 * Used when the client runs face detection in the browser and merges results.
 */
export async function analyseSkinSharpOnly(imageData: ArrayBuffer): Promise<SkinAnalysisResult> {
	try {
		const buffer = Buffer.from(imageData);
		const { textureScore, evennessScore } = await computeImageMetrics(buffer);
		const result = scoresFromMetrics(textureScore, evennessScore);
		const { whatsWorking, needsAttention, recommendations } = generateFeedback(
			result.wrinkles,
			result.spots,
			undefined
		);
		const productSuggestions = getProductSuggestions(
			result.wrinkles,
			result.spots,
			undefined
		);
		return {
			overallScore: Math.round(result.overallScore),
			wrinkles: result.wrinkles,
			spots: result.spots,
			whatsWorking,
			needsAttention,
			recommendations,
			productSuggestions
		};
	} catch {
		return getMockAnalysis();
	}
}

/**
 * Full server-side analysis (face detection + sharp). Used when optional tfjs-node/face-api are installed (e.g. local dev).
 * In production (Vercel) we use analyseSkinSharpOnly and browser-based face detection.
 */
export async function analyseSkin(imageData: ArrayBuffer): Promise<SkinAnalysisResult> {
	try {
		const buffer = Buffer.from(imageData);
		const regions = await getFaceRegionBuffers(buffer);
		let wrinkles: SkinAnalysisResult['wrinkles'];
		let spots: SkinAnalysisResult['spots'];
		let overallScore: number;

		let faceRegions: SkinAnalysisResult['faceRegions'] = undefined;
		let faceDetails: SkinAnalysisResult['faceDetails'] = undefined;
		let structureScore: number | undefined = undefined;
		if (regions) {
			console.info('[skinAnalysis] Face detected — using region-based forehead & eye analysis.');
			const [foreheadMetrics, leftEyeMetrics, rightEyeMetrics, globalMetrics] = await Promise.all([
				computeImageMetrics(regions.buffers.forehead),
				computeImageMetrics(regions.buffers.leftEye),
				computeImageMetrics(regions.buffers.rightEye),
				computeImageMetrics(buffer)
			]);
			const crowFeetTexture =
				(leftEyeMetrics.textureScore + rightEyeMetrics.textureScore) / 2;
			const result = scoresFromRegionMetrics(
				foreheadMetrics.textureScore,
				crowFeetTexture,
				globalMetrics.evennessScore
			);
			wrinkles = result.wrinkles;
			spots = result.spots;
			overallScore = result.overallScore;
			faceRegions = {
				imageWidth: regions.imageWidth,
				imageHeight: regions.imageHeight,
				regions: regions.regions
			};
			if (regions.faceDetails) {
				faceDetails = {
					age: regions.faceDetails.age,
					gender: regions.faceDetails.gender,
					genderProbability: regions.faceDetails.genderProbability,
					expressions: regions.faceDetails.expressions
				};
			}
			structureScore = regions.structureScore;
		} else {
			const { textureScore, evennessScore } = await computeImageMetrics(buffer);
			const result = scoresFromMetrics(textureScore, evennessScore);
			wrinkles = result.wrinkles;
			spots = result.spots;
			overallScore = result.overallScore;
		}

		const { whatsWorking, needsAttention, recommendations } = generateFeedback(
			wrinkles,
			spots,
			structureScore
		);
		const productSuggestions = getProductSuggestions(wrinkles, spots, structureScore);

		return {
			overallScore: Math.round(overallScore),
			wrinkles,
			spots,
			whatsWorking,
			needsAttention,
			recommendations,
			productSuggestions,
			...(structureScore != null && { structureScore }),
			...(faceRegions && { faceRegions }),
			...(faceDetails && { faceDetails })
		};
	} catch {
		return getMockAnalysis();
	}
}

function getMockAnalysis(): SkinAnalysisResult {
	return {
		overallScore: 72,
		wrinkles: {
			score: 68,
			forehead: 65,
			crowFeet: 70,
			fineLines: 72,
			summary:
				'Moderate signs of lines. Forehead and eye area could benefit from targeted care and face yoga techniques.'
		},
		spots: {
			score: 76,
			blemishes: 78,
			hyperpigmentation: 74,
			summary:
				'Skin clarity is good. A few areas of uneven tone; gentle exfoliation and sun protection will help maintain this.'
		},
		whatsWorking: [
			'Skin texture is smooth in most areas',
			'Good hydration balance',
			'Under-eye area shows minimal puffiness'
		],
		needsAttention: [
			'Forehead lines may deepen with expression and sun',
			'Some uneven skin tone around cheeks'
		],
		recommendations: [
			'Consider face yoga for forehead and crow\'s feet (Full Face Rejuvenation or Radiant Eyes & Cheeks)',
			'Use SPF daily and a gentle vitamin C serum for tone',
			'Weekly gua sha to support circulation and lift'
		],
		productSuggestions: [
			{
				id: 'face-yoga-workshop',
				title: 'Weekly Online Group Workshops',
				description:
					'Full face rejuvenation, strong eyelids, radiant eyes, sculpted chin/neck. Step-by-step learning, personalised feedback.',
				price: '£20 (45 mins)',
				theme: 'Full face rejuvenation'
			},
			{
				id: 'one-to-one',
				title: 'One-to-One Zoom Programme',
				description:
					'4 x 45 mins over 1 month. Tailored support, custom exercises, progress reviews. Noticeable lift, tone and radiance.',
				theme: 'Tailored support'
			}
		]
	};
}

interface ImageMetrics {
	textureScore: number; // 0 = smooth, 1 = high texture (more lines/wrinkles)
	evennessScore: number; // 0 = even, 1 = uneven (more spots/patches)
}

async function computeImageMetrics(buffer: Buffer): Promise<ImageMetrics> {
	// Light blur (sigma 0.5) reduces sensitivity to compression artifacts (WebP/JPEG blockiness, resize noise)
	// so "perfect" skin isn't penalised by encoding artefacts
	const { data, info } = await sharp(buffer)
		.resize(ANALYSIS_SIZE, ANALYSIS_SIZE, { fit: 'inside' })
		.blur(0.5)
		.grayscale()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const w = info.width ?? ANALYSIS_SIZE;
	const h = info.height ?? ANALYSIS_SIZE;

	const pixels = new Uint8Array(data);
	const n = pixels.length;

	// Luminance mean
	let sum = 0;
	for (let i = 0; i < n; i++) sum += pixels[i];
	const mean = sum / n;

	// Variance of luminance = texture (higher variance = more detail/lines)
	let variance = 0;
	for (let i = 0; i < n; i++) {
		const d = pixels[i] - mean;
		variance += d * d;
	}
	variance = n > 0 ? variance / n : 0;
	const std = Math.sqrt(variance);
	// Normalise texture: 0-30 std is typical; map to 0-1 (higher = more texture)
	const textureScore = Math.min(1, Math.max(0, (std - 10) / 25));

	// Evenness: variance of local patch means (grid) = uneven colour
	const patchSize = Math.max(2, Math.floor(Math.min(w, h) / 8));
	const patchesX = Math.floor(w / patchSize);
	const patchesY = Math.floor(h / patchSize);
	const patchMeans: number[] = [];
	for (let py = 0; py < patchesY; py++) {
		for (let px = 0; px < patchesX; px++) {
			let patchSum = 0;
			let count = 0;
			for (let dy = 0; dy < patchSize && py * patchSize + dy < h; dy++) {
				for (let dx = 0; dx < patchSize && px * patchSize + dx < w; dx++) {
					const idx = (py * patchSize + dy) * w + (px * patchSize + dx);
					patchSum += pixels[idx];
					count++;
				}
			}
			if (count > 0) patchMeans.push(patchSum / count);
		}
	}
	const patchMeanAvg =
		patchMeans.length > 0 ? patchMeans.reduce((a, b) => a + b, 0) / patchMeans.length : mean;
	let patchVariance = 0;
	for (const p of patchMeans) {
		const d = p - patchMeanAvg;
		patchVariance += d * d;
	}
	patchVariance = patchMeans.length > 0 ? patchVariance / patchMeans.length : 0;
	const patchStd = Math.sqrt(patchVariance);
	// Normalise evenness: higher patch variance = more uneven (spots)
	const evennessScore = Math.min(1, Math.max(0, patchStd / 20));

	return { textureScore, evennessScore };
}

/** Build wrinkle/spot scores from per-region texture (forehead, crow's feet) and global evenness. */
function scoresFromRegionMetrics(
	foreheadTexture: number,
	crowFeetTexture: number,
	evennessScore: number
): {
	wrinkles: SkinAnalysisResult['wrinkles'];
	spots: SkinAnalysisResult['spots'];
	overallScore: number;
} {
	const toScore = (t: number) => Math.round(Math.max(0, Math.min(100, 100 - t * 55)));
	const forehead = toScore(foreheadTexture);
	const crowFeet = toScore(crowFeetTexture);
	const fineLines = toScore(crowFeetTexture); // same region as crow's feet
	const wrinkleScore = Math.round((forehead + crowFeet + fineLines) / 3);

	const spotsRaw = 100 - evennessScore * 50;
	const spotScore = Math.round(Math.max(0, Math.min(100, spotsRaw)));
	const blemishes = Math.round(Math.max(0, Math.min(100, spotScore + (evennessScore - 0.5) * 10)));
	const hyperpigmentation = Math.round(
		Math.max(0, Math.min(100, spotScore + (evennessScore - 0.5) * 6))
	);

	const overallScore = wrinkleScore * 0.5 + spotScore * 0.5;

	const wrinkleSummary =
		wrinkleScore >= 75
			? 'Skin appears smooth with minimal visible lines. Keep up your current routine.'
			: wrinkleScore >= 50
				? 'Moderate signs of lines. Forehead and eye area could benefit from targeted care and face yoga techniques.'
				: 'Visible texture and lines. Face yoga, hydration and sun protection can help improve appearance over time.';

	const spotSummary =
		spotScore >= 75
			? 'Skin clarity is good with even tone. Gentle exfoliation and SPF will help maintain this.'
			: spotScore >= 50
				? 'Some uneven tone. Gentle exfoliation, vitamin C and sun protection will help.'
				: 'Uneven tone detected. Consider a consistent routine with SPF and targeted serums.';

	return {
		wrinkles: {
			score: wrinkleScore,
			forehead,
			crowFeet,
			fineLines,
			summary: wrinkleSummary
		},
		spots: {
			score: spotScore,
			blemishes: Math.max(0, Math.min(100, blemishes)),
			hyperpigmentation: Math.max(0, Math.min(100, hyperpigmentation)),
			summary: spotSummary
		},
		overallScore
	};
}

function scoresFromMetrics(
	textureScore: number,
	evennessScore: number
): {
	wrinkles: SkinAnalysisResult['wrinkles'];
	spots: SkinAnalysisResult['spots'];
	overallScore: number;
} {
	// Map texture (0=smooth, 1=textured) to wrinkle score (0-100, higher = better)
	const wrinkleRaw = 100 - textureScore * 55; // 45-100 range
	const wrinkleScore = Math.round(Math.max(0, Math.min(100, wrinkleRaw)));
	// Slight variation for sub-scores (based on same metric)
	const forehead = Math.round(Math.max(0, Math.min(100, wrinkleScore + (textureScore - 0.5) * 10)));
	const crowFeet = Math.round(Math.max(0, Math.min(100, wrinkleScore + (textureScore - 0.5) * 6)));
	const fineLines = Math.round(Math.max(0, Math.min(100, wrinkleScore + (textureScore - 0.5) * 8)));

	// Map evenness (0=even, 1=uneven) to spots score
	const spotsRaw = 100 - evennessScore * 50;
	const spotScore = Math.round(Math.max(0, Math.min(100, spotsRaw)));
	const blemishes = Math.round(Math.max(0, Math.min(100, spotScore + (evennessScore - 0.5) * 10)));
	const hyperpigmentation = Math.round(Math.max(0, Math.min(100, spotScore + (evennessScore - 0.5) * 6)));

	const overallScore = wrinkleScore * 0.5 + spotScore * 0.5;

	const wrinkleSummary =
		wrinkleScore >= 75
			? 'Skin appears smooth with minimal visible lines. Keep up your current routine.'
			: wrinkleScore >= 50
				? 'Moderate signs of lines. Forehead and eye area could benefit from targeted care and face yoga techniques.'
				: 'Visible texture and lines. Face yoga, hydration and sun protection can help improve appearance over time.';

	const spotSummary =
		spotScore >= 75
			? 'Skin clarity is good with even tone. Gentle exfoliation and SPF will help maintain this.'
			: spotScore >= 50
				? 'Some uneven tone. Gentle exfoliation, vitamin C and sun protection will help.'
				: 'Uneven tone detected. Consider a consistent routine with SPF and targeted serums.';

	return {
		wrinkles: {
			score: wrinkleScore,
			forehead: Math.max(0, Math.min(100, forehead)),
			crowFeet: Math.max(0, Math.min(100, crowFeet)),
			fineLines: Math.max(0, Math.min(100, fineLines)),
			summary: wrinkleSummary
		},
		spots: {
			score: spotScore,
			blemishes: Math.max(0, Math.min(100, blemishes)),
			hyperpigmentation: Math.max(0, Math.min(100, hyperpigmentation)),
			summary: spotSummary
		},
		overallScore
	};
}

function generateFeedback(
	wrinkles: SkinAnalysisResult['wrinkles'],
	spots: SkinAnalysisResult['spots'],
	structureScore?: number
): {
	whatsWorking: string[];
	needsAttention: string[];
	recommendations: string[];
} {
	const whatsWorking: string[] = [];
	const needsAttention: string[] = [];
	const recommendations: string[] = [];

	if (wrinkles.score >= 70) whatsWorking.push('Skin texture is smooth in most areas');
	else if (wrinkles.score >= 50) needsAttention.push('Forehead and eye area could benefit from targeted care');
	else needsAttention.push('Visible lines may deepen with expression and sun; face yoga can help');

	if (spots.score >= 70) whatsWorking.push('Good skin clarity and even tone');
	else if (spots.score >= 50) needsAttention.push('Some uneven skin tone; gentle exfoliation and SPF can help');
	else needsAttention.push('Uneven tone; consider vitamin C serum and consistent sun protection');

	if (structureScore != null && structureScore < 65) {
		needsAttention.push('Jawline and neck can benefit from structure support—face yoga and gua sha fight gravity.');
		recommendations.push(
			'Focus on jawline and neck: Sculpted Chin/Neck (Beyond Gravity) and gua sha can support structure and fight sagging.'
		);
	}

	if (wrinkles.score < 75) {
		whatsWorking.push('Under-eye area can be supported with gentle massage and hydration');
		recommendations.push(
			'Consider face yoga for forehead and crow\'s feet (Full Face Rejuvenation or Radiant Eyes & Cheeks)'
		);
	}
	recommendations.push('Use SPF daily and a gentle vitamin C serum for tone');
	recommendations.push('Weekly gua sha can support circulation and lift');

	if (whatsWorking.length === 0) whatsWorking.push('Your skin has potential to improve with a consistent routine');
	if (needsAttention.length === 0) needsAttention.push('Keep maintaining your current routine for best results');

	return { whatsWorking, needsAttention, recommendations };
}

function getProductSuggestions(
	wrinkles: SkinAnalysisResult['wrinkles'],
	spots: SkinAnalysisResult['spots'],
	structureScore?: number
): SkinAnalysisResult['productSuggestions'] {
	const suggestions: SkinAnalysisResult['productSuggestions'] = [
		{
			id: 'face-yoga-workshop',
			title: 'Weekly Online Group Workshops',
			description:
				'Full face rejuvenation, strong eyelids, radiant eyes, sculpted chin/neck. Step-by-step learning, personalised feedback.',
			price: '£20 (45 mins)',
			theme: 'Full face rejuvenation'
		},
		{
			id: 'one-to-one',
			title: 'One-to-One Zoom Programme',
			description:
				'4 x 45 mins over 1 month. Tailored support, custom exercises, progress reviews. Noticeable lift, tone and radiance.',
			theme: 'Tailored support'
		}
	];
	if (structureScore != null && structureScore < 65) {
		suggestions.unshift({
			id: 'sculpted-chin',
			title: 'Sculpted Chin / Neck – Beyond Gravity',
			description:
				'Focus on jawline, double chin and neck tone. Neck stretches, platysma toning, gua sha sculpting and lymph drainage. Fights gravity and supports structure.',
			theme: 'Jawline & neck'
		});
	}
	if (wrinkles.score < 65) {
		suggestions.unshift({
			id: 'radiant-eyes',
			title: 'Radiant Eyes & Cheeks – Beyond Glow',
			description:
				'Mid-face rejuvenation and circulation. Cheek sculpting, lymph drainage, under-eye release, breathwork.',
			theme: 'Radiant eyes'
		});
	}
	if (spots.score < 65) {
		suggestions.push({
			id: 'full-face',
			title: 'Full Face Rejuvenation – Beyond Renewal',
			description:
				'Complete shoulders-up workout and relaxation. Face yoga, gua sha, lymphatic sweep, acupressure.',
			theme: 'Full face'
		});
	}
	return suggestions.slice(0, 3); // Max 3 suggestions
}
