/** Rectangle in original image pixel coordinates (for region overlays). */
export interface FaceRegionRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

/** Polygon in original image pixel coordinates (for tilted regions like forehead). */
export interface FaceRegionPolygon {
	points: Array<{ x: number; y: number }>;
}

/** Face regions identified by the assessment (when AI detection ran). Used to draw overlays on the photo. */
export interface FaceRegions {
	imageWidth: number;
	imageHeight: number;
	regions: {
		/** Forehead as a quadrilateral (top face + brow line) so it tilts with the head. */
		forehead: FaceRegionPolygon;
		leftEye: FaceRegionRect;
		rightEye: FaceRegionRect;
	};
}

/** Optional face details from face-api when a face is detected (age, gender, expressions). */
export interface FaceDetails {
	/** Estimated age in years. */
	age: number;
	/** Predicted gender. */
	gender: 'male' | 'female';
	/** Confidence for gender (0–1). */
	genderProbability?: number;
	/** Emotion probabilities (neutral, happy, sad, angry, fearful, disgusted, surprised). */
	expressions?: Record<string, number>;
}

export interface SkinAnalysisResult {
	overallScore: number;
	wrinkles: WrinkleAnalysis;
	spots: SpotAnalysis;
	whatsWorking: string[];
	needsAttention: string[];
	recommendations: string[];
	productSuggestions: ProductSuggestion[];
	/** Optional structure/firmness score (0–100) from jaw landmarks; used for structure-aware recommendations. */
	structureScore?: number;
	/** Present when face detection ran and regions were identified (for showing overlays on the photo). */
	faceRegions?: FaceRegions;
	/** Present when face detection ran (estimated age, gender, dominant expression). Can be removed later if not needed. */
	faceDetails?: FaceDetails;
}

export interface WrinkleAnalysis {
	score: number;
	forehead: number;
	crowFeet: number;
	fineLines: number;
	summary: string;
}

export interface SpotAnalysis {
	score: number;
	blemishes: number;
	hyperpigmentation: number;
	summary: string;
}

export interface ProductSuggestion {
	id: string;
	title: string;
	description: string;
	price?: string;
	theme?: string;
}
