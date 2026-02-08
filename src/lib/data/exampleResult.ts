/**
 * Example skin analysis result for demo/screenshots. Use ?demo=1 on /results to show
 * a full results page (scores, structure, recommendations, product suggestions, face details)
 * without running a real assessment.
 */
import type { SkinAnalysisResult } from '$lib/types/skin';

/** Full example result for /results?demo=1 screenshots. */
export function getExampleResult(): SkinAnalysisResult {
	return {
		overallScore: 74,
		wrinkles: {
			score: 70,
			forehead: 68,
			crowFeet: 72,
			fineLines: 70,
			summary:
				'Moderate signs of lines. Forehead and eye area could benefit from targeted care and face yoga techniques.'
		},
		spots: {
			score: 78,
			blemishes: 76,
			hyperpigmentation: 80,
			summary:
				'Skin clarity is good. A few areas of uneven tone; gentle exfoliation and sun protection will help maintain this.'
		},
		whatsWorking: [
			'Skin texture is smooth in most areas',
			'Good hydration balance',
			'Under-eye area shows minimal puffiness',
			'Even tone is improving with your routine'
		],
		needsAttention: [
			'Forehead lines may deepen with expression and sun',
			'Some uneven skin tone around cheeks'
		],
		recommendations: [
			'Consider face yoga for forehead and crow\'s feet (Full Face Rejuvenation or Radiant Eyes & Cheeks)',
			'Use SPF daily and a gentle vitamin C serum for tone',
			'Weekly gua sha to support circulation and lift',
			'Jawline and neck exercises can support structure long-term'
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
				id: 'sculpted-chin',
				title: 'Sculpted Chin / Neck – Beyond Gravity',
				description:
					'Focus on jawline, double chin and neck tone. Neck stretches, platysma toning, gua sha sculpting and lymph drainage. Fights gravity and supports structure.',
				theme: 'Jawline & neck'
			},
			{
				id: 'one-to-one',
				title: 'One-to-One Zoom Programme',
				description:
					'4 x 45 mins over 1 month. Tailored support, custom exercises, progress reviews. Noticeable lift, tone and radiance.',
				theme: 'Tailored support'
			}
		],
		structureScore: 72,
		faceDetails: {
			age: 38,
			gender: 'female',
			genderProbability: 0.92,
			expressions: { neutral: 0.85, happy: 0.1 }
		}
	};
}

/** Variant for "focus areas" or "improving" screenshots: lower scores and different recommendations. */
export function getExampleResultVariant(
	variant: 'improving' | 'focus-areas'
): SkinAnalysisResult {
	if (variant === 'improving') {
		return {
			...getExampleResult(),
			overallScore: 62,
			wrinkles: {
				score: 58,
				forehead: 55,
				crowFeet: 60,
				fineLines: 59,
				summary:
					'Visible lines in forehead and eye area. Face yoga and consistent skincare can help improve texture and firmness over time.'
			},
			spots: {
				score: 66,
				blemishes: 64,
				hyperpigmentation: 68,
				summary:
					'Some uneven tone and minor blemishes. Vitamin C and SPF, plus gentle exfoliation, will support clarity.'
			},
			whatsWorking: [
				'Your skin has potential to improve with a consistent routine',
				'Under-eye area can be supported with gentle massage and hydration'
			],
			needsAttention: [
				'Forehead and eye area could benefit from targeted care',
				'Some uneven skin tone; gentle exfoliation and SPF can help',
				'Jawline and neck can benefit from structure support—face yoga and gua sha fight gravity.'
			],
			recommendations: [
				'Focus on jawline and neck: Sculpted Chin/Neck (Beyond Gravity) and gua sha can support structure and fight sagging.',
				'Consider face yoga for forehead and crow\'s feet (Full Face Rejuvenation or Radiant Eyes & Cheeks)',
				'Use SPF daily and a gentle vitamin C serum for tone',
				'Weekly gua sha can support circulation and lift'
			],
			structureScore: 58,
			faceDetails: {
				age: 38,
				gender: 'female',
				genderProbability: 0.91,
				expressions: { neutral: 0.88 }
			}
		};
	}
	// focus-areas: similar to default but emphasises spots and texture
	return {
		...getExampleResult(),
		overallScore: 68,
		wrinkles: {
			score: 64,
			forehead: 62,
			crowFeet: 66,
			fineLines: 64,
			summary:
				'Moderate texture in forehead and eye area. Face yoga and gua sha can help improve firmness and reduce the appearance of lines.'
		},
		spots: {
			score: 72,
			blemishes: 70,
			hyperpigmentation: 74,
			summary:
				'Some uneven tone and hyperpigmentation. Consistent SPF and a vitamin C serum will help even out skin tone.'
		},
		needsAttention: [
			'Forehead lines may deepen with expression and sun',
			'Some uneven skin tone around cheeks and jaw',
			'Focus on sun protection to prevent further pigmentation'
		],
		recommendations: [
			'Use SPF daily and a gentle vitamin C serum for tone',
			'Consider face yoga for forehead and crow\'s feet',
			'Weekly gua sha to support circulation and lift'
		],
		structureScore: 68
	};
}
