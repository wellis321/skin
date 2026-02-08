import type { RequestHandler } from './$types';
import { toBuffer } from 'qrcode';

export const GET: RequestHandler = async ({ url: requestUrl }) => {
	const path = requestUrl.searchParams.get('path') ?? requestUrl.searchParams.get('url') ?? '';
	const fullUrl = path.startsWith('http') ? path : `${requestUrl.origin}${path.startsWith('/') ? '' : '/'}${path}`;

	try {
		const buffer = await toBuffer(fullUrl, {
			type: 'png',
			width: 256,
			margin: 2
		});
		return new Response(new Uint8Array(buffer), {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (e) {
		return new Response('Invalid QR request', { status: 400 });
	}
};
