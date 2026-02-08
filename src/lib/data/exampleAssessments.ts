/**
 * Example assessment data for demo/screenshots. Use ?demo=1 on /progress to show this
 * so you can take marketing images of what users see when they track their progress.
 * Shape matches what progress +page.server.ts returns.
 */
import type { FaceDetails } from '$lib/types/skin';

export type ExampleAssessment = {
	id: string;
	createdAt: Date;
	overallScore: number;
	wrinklesScore: number;
	wrinklesForehead: number | null;
	wrinklesCrowFeet: number | null;
	wrinklesFineLines: number | null;
	spotsScore: number;
	spotsBlemishes: number | null;
	spotsHyperpigmentation: number | null;
	structureScore?: number;
	hasImage: boolean;
	faceDetails: FaceDetails | undefined;
};

/** Example assessments over ~5–6 months with an improving trend. Use for /progress?demo=1 screenshots. */
export function getExampleAssessments(): ExampleAssessment[] {
	const base = new Date();
	const month = (n: number) => {
		const d = new Date(base);
		d.setMonth(d.getMonth() - n);
		return d;
	};
	const day = (m: number, d: number) => {
		const date = new Date(base);
		date.setMonth(date.getMonth() - m);
		date.setDate(d);
		return date;
	};

	const faceDetailsFemale38: FaceDetails = {
		age: 38,
		gender: 'female',
		genderProbability: 0.92,
		expressions: { neutral: 0.85, happy: 0.1 }
	};
	const faceDetailsFemale37: FaceDetails = {
		age: 37,
		gender: 'female',
		genderProbability: 0.93,
		expressions: { neutral: 0.88, happy: 0.08 }
	};
	const faceDetailsFemale36: FaceDetails = {
		age: 36,
		gender: 'female',
		genderProbability: 0.94,
		expressions: { neutral: 0.9 }
	};

	return [
		{
			id: 'demo-1',
			createdAt: day(5, 3),
			overallScore: 54,
			wrinklesScore: 50,
			wrinklesForehead: 48,
			wrinklesCrowFeet: 52,
			wrinklesFineLines: 50,
			spotsScore: 58,
			spotsBlemishes: 56,
			spotsHyperpigmentation: 60,
			structureScore: 52,
			hasImage: false,
			faceDetails: faceDetailsFemale38
		},
		{
			id: 'demo-2',
			createdAt: day(5, 18),
			overallScore: 56,
			wrinklesScore: 52,
			wrinklesForehead: 50,
			wrinklesCrowFeet: 54,
			wrinklesFineLines: 52,
			spotsScore: 60,
			spotsBlemishes: 58,
			spotsHyperpigmentation: 62,
			structureScore: 54,
			hasImage: false,
			faceDetails: undefined
		},
		{
			id: 'demo-3',
			createdAt: day(4, 5),
			overallScore: 59,
			wrinklesScore: 54,
			wrinklesForehead: 52,
			wrinklesCrowFeet: 56,
			wrinklesFineLines: 54,
			spotsScore: 64,
			spotsBlemishes: 62,
			spotsHyperpigmentation: 66,
			structureScore: 58,
			hasImage: false,
			faceDetails: faceDetailsFemale38
		},
		{
			id: 'demo-4',
			createdAt: day(4, 22),
			overallScore: 61,
			wrinklesScore: 56,
			wrinklesForehead: 54,
			wrinklesCrowFeet: 58,
			wrinklesFineLines: 56,
			spotsScore: 66,
			spotsBlemishes: 64,
			spotsHyperpigmentation: 68,
			structureScore: 60,
			hasImage: false,
			faceDetails: faceDetailsFemale38
		},
		{
			id: 'demo-5',
			createdAt: day(3, 8),
			overallScore: 64,
			wrinklesScore: 58,
			wrinklesForehead: 56,
			wrinklesCrowFeet: 60,
			wrinklesFineLines: 58,
			spotsScore: 70,
			spotsBlemishes: 68,
			spotsHyperpigmentation: 72,
			structureScore: 64,
			hasImage: false,
			faceDetails: undefined
		},
		{
			id: 'demo-6',
			createdAt: day(3, 25),
			overallScore: 66,
			wrinklesScore: 60,
			wrinklesForehead: 58,
			wrinklesCrowFeet: 62,
			wrinklesFineLines: 60,
			spotsScore: 72,
			spotsBlemishes: 70,
			spotsHyperpigmentation: 74,
			structureScore: 66,
			hasImage: false,
			faceDetails: faceDetailsFemale37
		},
		{
			id: 'demo-7',
			createdAt: day(2, 4),
			overallScore: 68,
			wrinklesScore: 62,
			wrinklesForehead: 60,
			wrinklesCrowFeet: 64,
			wrinklesFineLines: 62,
			spotsScore: 74,
			spotsBlemishes: 72,
			spotsHyperpigmentation: 76,
			structureScore: 68,
			hasImage: false,
			faceDetails: faceDetailsFemale37
		},
		{
			id: 'demo-8',
			createdAt: day(2, 20),
			overallScore: 70,
			wrinklesScore: 64,
			wrinklesForehead: 62,
			wrinklesCrowFeet: 66,
			wrinklesFineLines: 64,
			spotsScore: 76,
			spotsBlemishes: 74,
			spotsHyperpigmentation: 78,
			structureScore: 70,
			hasImage: false,
			faceDetails: faceDetailsFemale37
		},
		{
			id: 'demo-9',
			createdAt: day(1, 6),
			overallScore: 72,
			wrinklesScore: 66,
			wrinklesForehead: 64,
			wrinklesCrowFeet: 68,
			wrinklesFineLines: 66,
			spotsScore: 78,
			spotsBlemishes: 76,
			spotsHyperpigmentation: 80,
			structureScore: 72,
			hasImage: false,
			faceDetails: undefined
		},
		{
			id: 'demo-10',
			createdAt: day(1, 24),
			overallScore: 74,
			wrinklesScore: 68,
			wrinklesForehead: 66,
			wrinklesCrowFeet: 70,
			wrinklesFineLines: 68,
			spotsScore: 80,
			spotsBlemishes: 78,
			spotsHyperpigmentation: 82,
			structureScore: 74,
			hasImage: false,
			faceDetails: faceDetailsFemale36
		},
		{
			id: 'demo-11',
			createdAt: day(0, 2),
			overallScore: 76,
			wrinklesScore: 70,
			wrinklesForehead: 68,
			wrinklesCrowFeet: 72,
			wrinklesFineLines: 70,
			spotsScore: 82,
			spotsBlemishes: 80,
			spotsHyperpigmentation: 84,
			structureScore: 76,
			hasImage: false,
			faceDetails: faceDetailsFemale36
		},
		{
			id: 'demo-12',
			createdAt: month(0),
			overallScore: 78,
			wrinklesScore: 72,
			wrinklesForehead: 70,
			wrinklesCrowFeet: 74,
			wrinklesFineLines: 72,
			spotsScore: 84,
			spotsBlemishes: 82,
			spotsHyperpigmentation: 86,
			structureScore: 78,
			hasImage: false,
			faceDetails: faceDetailsFemale36
		}
	];
}
