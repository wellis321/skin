<script lang="ts">
	import { goto } from '$app/navigation';
	import { runFaceAnalysisInBrowser } from '$lib/browser/faceAnalysis';
	import type { SkinAnalysisResult } from '$lib/types/skin';

	const STORAGE_KEY = 'skinAssessmentResult';

	let step = $state<'instructions' | 'capture'>('instructions');
	let selectedFile: File | null = $state(null);
	let previewUrl: string | null = $state(null);
	let uploading = $state(false);
	let error = $state<string | null>(null);
	let captureMode = $state<'upload' | 'camera'>('upload');
	let cameraActive = $state(false);
	let cameraError = $state<string | null>(null);
	let videoEl: HTMLVideoElement | undefined = $state();
	let stream: MediaStream | null = null;

	function goToCapture() {
		step = 'capture';
		error = null;
	}

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		selectedFile = null;
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			error = 'Please choose an image file (e.g. JPEG, PNG or WebP).';
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			error = 'Image must be under 10MB.';
			return;
		}
		error = null;
		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
	}

	const THUMB_MAX = 320;

	/** Create a small thumbnail (max 320px) as base64, preserving WebP when possible to avoid JPEG re-compression. */
	async function createThumbnailBase64(imgUrl: string, mimeType?: string): Promise<string | null> {
		return new Promise((resolve) => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				try {
					const w = img.naturalWidth;
					const h = img.naturalHeight;
					const scale = Math.min(1, THUMB_MAX / Math.max(w, h));
					const cw = Math.round(w * scale);
					const ch = Math.round(h * scale);
					const canvas = document.createElement('canvas');
					canvas.width = cw;
					canvas.height = ch;
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						resolve(null);
						return;
					}
					ctx.drawImage(img, 0, 0, cw, ch);
					// Preserve WebP when upload was WebP to avoid lossy JPEG re-compression (which can add artifacts)
					let dataUrl: string;
					if (mimeType === 'image/webp') {
						try {
							const webp = canvas.toDataURL('image/webp', 0.92);
							if (webp.startsWith('data:image/webp')) {
								dataUrl = webp;
							} else {
								dataUrl = canvas.toDataURL('image/jpeg', 0.92);
							}
						} catch {
							dataUrl = canvas.toDataURL('image/jpeg', 0.92);
						}
					} else {
						dataUrl = canvas.toDataURL('image/jpeg', 0.92);
					}
					resolve(dataUrl);
				} catch {
					resolve(null);
				}
			};
			img.onerror = () => resolve(null);
			img.src = imgUrl;
		});
	}

	/** Load image into an HTMLImageElement so browser face-api can run on it. */
	function loadImageAsElement(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('Image failed to load'));
			img.src = url;
		});
	}

	async function submitPhoto() {
		if (!selectedFile) return;
		uploading = true;
		error = null;
		try {
			const formData = new FormData();
			formData.set('image', selectedFile);

			// Run server (sharp-only) and browser face detection in parallel
			const imageUrl = previewUrl ?? URL.createObjectURL(selectedFile);
			let serverResult: SkinAnalysisResult;
			let browserFace: Awaited<ReturnType<typeof runFaceAnalysisInBrowser>> = null;

			const serverPromise = fetch('/api/analyse', { method: 'POST', body: formData }).then(
				async (res) => {
					if (!res.ok) {
						const data = await res.json().catch(() => ({}));
						throw new Error(data.error ?? `Request failed (${res.status})`);
					}
					return res.json() as Promise<SkinAnalysisResult>;
				}
			);

			const facePromise = loadImageAsElement(imageUrl)
				.then((img) => runFaceAnalysisInBrowser(img))
				.catch((e) => {
					console.warn('[assess] Browser face detection failed:', e);
					return null;
				});

			[serverResult, browserFace] = await Promise.all([serverPromise, facePromise]);
			if (imageUrl !== previewUrl) URL.revokeObjectURL(imageUrl);

			// Merge: server gives wrinkles/spots/feedback; browser adds face regions, details, structure
			const result: SkinAnalysisResult = {
				...serverResult,
				...(browserFace?.faceRegions && { faceRegions: browserFace.faceRegions }),
				...(browserFace?.faceDetails && { faceDetails: browserFace.faceDetails }),
				...(browserFace?.structureScore != null && {
					structureScore: browserFace.structureScore
				})
			};

			let thumbnailBase64: string | null = null;
			if (previewUrl) {
				thumbnailBase64 = await createThumbnailBase64(previewUrl, selectedFile.type);
			}
			try {
				const payload = thumbnailBase64
					? { result, thumbnailBase64 }
					: { result };
				sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
			} catch {
				error = 'Could not save results. Please try again.';
				uploading = false;
				return;
			}
			goto('/results');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
		} finally {
			uploading = false;
		}
	}

	function backToInstructions() {
		stopCamera();
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		selectedFile = null;
		error = null;
		cameraError = null;
		captureMode = 'upload';
		step = 'instructions';
	}

	$effect(() => {
		if (videoEl && stream) {
			videoEl.srcObject = stream;
			videoEl.play().catch(() => {});
		}
	});

	async function startCamera() {
		cameraError = null;
		try {
			stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
			cameraActive = true;
		} catch (err) {
			cameraError = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
		cameraActive = false;
		if (videoEl) videoEl.srcObject = null;
	}

	function captureFromVideo() {
		if (!videoEl || !stream) return;
		const canvas = document.createElement('canvas');
		canvas.width = videoEl.videoWidth;
		canvas.height = videoEl.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(videoEl, 0, 0);
		canvas.toBlob(
			(blob) => {
				if (!blob) return;
				stopCamera();
				const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				selectedFile = file;
				previewUrl = URL.createObjectURL(file);
				error = null;
				captureMode = 'upload';
			},
			'image/jpeg',
			0.92
		);
	}

	function switchToUpload() {
		stopCamera();
		captureMode = 'upload';
		cameraError = null;
	}

	function switchToCamera() {
		captureMode = 'camera';
		cameraError = null;
		startCamera();
	}
</script>

<main class="min-h-screen px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-xl">
		{#if step === 'instructions'}
			<div class="text-center">
				<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
					Get ready for your assessment
				</h1>
				<p class="mt-4 text-stone-600">
					For the best results, please follow these steps before taking or uploading your photo.
				</p>
				<ul class="mt-8 space-y-4 text-left sm:mx-auto sm:max-w-md">
					<li class="flex gap-3">
						<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-200 text-sm font-medium text-stone-700"
							>1</span
						>
						<span>Remove glasses so we can see your skin clearly.</span>
					</li>
					<li class="flex gap-3">
						<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-200 text-sm font-medium text-stone-700"
							>2</span
						>
						<span>Use good, even lighting—natural light is ideal.</span>
					</li>
					<li class="flex gap-3">
						<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-200 text-sm font-medium text-stone-700"
							>3</span
						>
						<span>Face the camera straight on.</span>
					</li>
					<li class="flex gap-3">
						<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-200 text-sm font-medium text-stone-700"
							>4</span
						>
						<span>Use a neutral expression.</span>
					</li>
				</ul>
				<p class="mt-8 text-sm text-stone-500">
					We analyse your photo for texture and evenness and give you scores and feedback on wrinkles, lines and spots.
				</p>
				<div class="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
					<img src="/api/qr?path=/assess" alt="QR code for assessment page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
					<div>
						<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
						<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open this page and take a selfie there.</p>
					</div>
				</div>
				<button
					type="button"
					onclick={goToCapture}
					class="mt-10 inline-flex items-center justify-center rounded-md bg-stone-900 px-8 py-4 text-base font-medium text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Continue
				</button>
			</div>
		{:else}
			<div>
				<h2 class="text-2xl font-semibold text-stone-900">Add your photo</h2>
				<p class="mt-2 text-stone-600">
					Upload an image of your face or take a photo with your camera. We’ll analyse texture, evenness and structure to produce your scores and recommendations for skin and facial tone.
				</p>
				<div class="mt-6">
					{#if previewUrl}
						<div class="flex flex-col items-center rounded-xl border-2 border-stone-200 bg-stone-50/50 p-6">
							<!-- svelte-ignore a11y_img_redundant_alt -->
							<img
								src={previewUrl}
								alt="Your photo"
								class="max-h-64 w-auto rounded-lg object-contain"
							/>
							<button
								type="button"
								onclick={() => { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = null; selectedFile = null; captureMode = 'upload'; error = null; }}
								class="mt-3 text-sm font-medium text-stone-600 underline hover:text-stone-800"
							>
								Change photo
							</button>
						</div>
					{:else if captureMode === 'camera'}
						<div class="flex flex-col items-center rounded-xl border-2 border-stone-200 bg-stone-900 p-4">
							{#if cameraError}
								<p class="text-red-400" role="alert">{cameraError}</p>
								<button
									type="button"
									onclick={startCamera}
									class="mt-3 rounded-md bg-stone-700 px-4 py-2 text-sm text-white hover:bg-stone-600"
								>
									Try again
								</button>
							{:else if cameraActive}
								<video
									bind:this={videoEl}
									autoplay
									playsinline
									muted
									class="max-h-64 w-auto rounded-lg object-contain"
								></video>
								<button
									type="button"
									onclick={captureFromVideo}
									class="mt-3 rounded-md bg-white px-6 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100"
								>
									Capture photo
								</button>
							{:else}
								<p class="text-stone-400">Starting camera…</p>
							{/if}
							<button
								type="button"
								onclick={switchToUpload}
								class="mt-3 text-sm text-stone-400 underline hover:text-stone-300"
							>
								Upload a file instead
							</button>
						</div>
					{:else}
						<div class="flex flex-col gap-3">
							<label
								class="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-8 transition hover:border-stone-400 hover:bg-stone-50 focus-within:ring-2 focus-within:ring-stone-500 focus-within:ring-offset-2"
							>
								<input
									type="file"
									accept="image/*"
									capture="user"
									class="sr-only"
									onchange={handleFileChange}
									disabled={uploading}
								/>
								<span class="text-stone-500">Click to upload a file</span>
							</label>
							<button
								type="button"
								onclick={switchToCamera}
								class="rounded-md border-2 border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
							>
								Take photo with camera
							</button>
						</div>
					{/if}
				</div>
				{#if error}
					<p class="mt-3 text-sm text-red-600" role="alert">{error}</p>
				{/if}
				<div class="mt-6 flex flex-wrap gap-3">
					<button
						type="button"
						onclick={backToInstructions}
						class="rounded-md border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						Back
					</button>
					<button
						type="button"
						onclick={submitPhoto}
						disabled={!selectedFile || uploading}
						class="inline-flex items-center justify-center rounded-md bg-stone-900 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
					>
						{uploading ? 'Analysing…' : 'Use this photo'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</main>
