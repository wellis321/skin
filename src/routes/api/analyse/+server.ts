import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyseSkinSharpOnly } from '$lib/server/skinAnalysis';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: RequestHandler = async ({ request }) => {
	try {
		const contentType = request.headers.get('content-type') ?? '';
		let imageBuffer: ArrayBuffer;

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('image') ?? formData.get('file');
			if (!file || !(file instanceof File)) {
				return json({ error: 'No image file in form (use field "image" or "file")' }, { status: 400 });
			}
			if (file.size > MAX_SIZE) {
				return json({ error: 'Image too large (max 10MB)' }, { status: 400 });
			}
			imageBuffer = await file.arrayBuffer();
		} else if (contentType.includes('application/json')) {
			const body = await request.json();
			const base64 = body?.image ?? body?.data;
			if (typeof base64 !== 'string') {
				return json({ error: 'JSON body must include "image" or "data" (base64 string)' }, {
					status: 400
				});
			}
			const binary = atob(base64.replace(/^data:image\/\w+;base64,/, ''));
			const bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
			if (bytes.length > MAX_SIZE) {
				return json({ error: 'Image too large (max 10MB)' }, { status: 400 });
			}
			imageBuffer = bytes.buffer;
		} else {
			return json(
				{ error: 'Content-Type must be multipart/form-data or application/json' },
				{ status: 400 }
			);
		}

		const result = await analyseSkinSharpOnly(imageBuffer);
		return json(result);
	} catch (err) {
		console.error('analyse error:', err);
		return json({ error: 'Analysis failed' }, { status: 500 });
	}
};
