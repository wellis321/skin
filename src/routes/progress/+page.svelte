<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getThemedImage } from '$lib/data/placeholderImages';

	let { data } = $props();

	const demoMode = $derived(data.demoMode ?? false);

	/** Assessments sorted by date ascending for chart (oldest first). */
	const sorted = $derived(
		[...(data.assessments ?? [])].sort((a, b) => {
			const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
			const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
			return ta - tb;
		})
	);

	const hasEnoughForTrend = $derived(sorted.length >= 2);
	const lastN = 3;
	const recentForTrend = $derived(sorted.slice(-lastN));
	const trend = $derived.by(() => {
		if (recentForTrend.length < 2) return null;
		const first = recentForTrend[0].overallScore;
		const last = recentForTrend[recentForTrend.length - 1].overallScore;
		const diff = last - first;
		if (diff > 2) return 'improving';
		if (diff < -2) return 'declining';
		return 'stable';
	});

	const previousScore = $derived(sorted.length >= 2 ? sorted[sorted.length - 2].overallScore : null);
	const latestScore = $derived(sorted.length >= 1 ? sorted[sorted.length - 1].overallScore : null);
	const delta = $derived(
		previousScore != null && latestScore != null ? latestScore - previousScore : null
	);

	// SVG line chart: overall score over time
	const chartWidth = 600;
	const chartHeight = 220;
	const padding = { top: 20, right: 20, bottom: 30, left: 40 };
	const innerWidth = chartWidth - padding.left - padding.right;
	const innerHeight = chartHeight - padding.top - padding.bottom;
	const minScore = 0;
	const maxScore = 100;

	const pathData = $derived.by(() => {
		if (sorted.length === 0) return '';
		const xScale = (i: number) => padding.left + (i / Math.max(1, sorted.length - 1)) * innerWidth;
		const yScale = (v: number) =>
			padding.top + innerHeight - ((v - minScore) / (maxScore - minScore)) * innerHeight;
		const points = sorted.map((a, i) => `${xScale(i)},${yScale(a.overallScore)}`);
		return `M ${points.join(' L ')}`;
	});

	/** Interpolate between two hex colours; t in [0,1]. */
	function lerpHex(c1: string, c2: string, t: number): string {
		const r1 = parseInt(c1.slice(1, 3), 16);
		const g1 = parseInt(c1.slice(3, 5), 16);
		const b1 = parseInt(c1.slice(5, 7), 16);
		const r2 = parseInt(c2.slice(1, 3), 16);
		const g2 = parseInt(c2.slice(3, 5), 16);
		const b2 = parseInt(c2.slice(5, 7), 16);
		const r = Math.round(r1 + (r2 - r1) * t);
		const g = Math.round(g1 + (g2 - g1) * t);
		const b = Math.round(b1 + (b2 - b1) * t);
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	/** Gradient stops for the line: colour by score position in range so the line brightens as the curve increases. */
	const lineGradientStops = $derived.by(() => {
		if (sorted.length < 2) return [];
		const n = sorted.length;
		const scores = sorted.map((a) => a.overallScore);
		const minScoreInData = Math.min(...scores);
		const maxScoreInData = Math.max(...scores);
		const range = maxScoreInData - minScoreInData || 1;
		const stops: Array<{ offset: number; color: string }> = [];
		for (let i = 0; i < n; i++) {
			const t = (sorted[i].overallScore - minScoreInData) / range; // 0 = lowest score, 1 = highest
			const color = lerpHex('#a7f3d0', '#059669', t); // pale green (emerald-200) → bright green (emerald-600)
			stops.push({ offset: i / (n - 1), color });
		}
		return stops;
	});

	const pathDataWrinkles = $derived.by(() => {
		if (sorted.length === 0) return '';
		const xScale = (i: number) => padding.left + (i / Math.max(1, sorted.length - 1)) * innerWidth;
		const yScale = (v: number) =>
			padding.top + innerHeight - ((v - minScore) / (maxScore - minScore)) * innerHeight;
		const points = sorted.map((a, i) => `${xScale(i)},${yScale(a.wrinklesScore)}`);
		return `M ${points.join(' L ')}`;
	});

	const pathDataSpots = $derived.by(() => {
		if (sorted.length === 0) return '';
		const xScale = (i: number) => padding.left + (i / Math.max(1, sorted.length - 1)) * innerWidth;
		const yScale = (v: number) =>
			padding.top + innerHeight - ((v - minScore) / (maxScore - minScore)) * innerHeight;
		const points = sorted.map((a, i) => `${xScale(i)},${yScale(a.spotsScore)}`);
		return `M ${points.join(' L ')}`;
	});

	function toDate(d: string | Date | number | null | undefined): Date | null {
		if (d == null) return null;
		if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
		if (typeof d === 'number') return new Date(d);
		const parsed = new Date(d as string);
		return isNaN(parsed.getTime()) ? null : parsed;
	}
	function formatDate(d: string | Date | number | null | undefined): string {
		const date = toDate(d);
		return date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
	}
	/** Short date for x-axis labels (e.g. 7 Feb). */
	function formatAxisDate(d: string | Date | number | null | undefined): string {
		const date = toDate(d);
		return date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
	}
	/** Show every nth x-axis label when there are many points. */
	const xAxisLabelStep = $derived(sorted.length > 8 ? Math.max(1, Math.floor(sorted.length / 6)) : 1);
	function showXLabel(i: number): boolean {
		return xAxisLabelStep === 1 || i % xAxisLabelStep === 0 || i === sorted.length - 1;
	}

	function xScale(i: number): number {
		return padding.left + (i / Math.max(1, sorted.length - 1)) * innerWidth;
	}
	function yScale(score: number): number {
		return padding.top + innerHeight - ((score - minScore) / (maxScore - minScore)) * innerHeight;
	}

	/** Human-friendly trend for a delta (e.g. +5 → "improved"). */
	function trendLabel(delta: number): string {
		if (delta > 0) return 'improved';
		if (delta < 0) return 'declined';
		return 'unchanged';
	}

	/** e.g. "2 weeks" or "3 months" between two dates. */
	function timeBetween(d1: string | Date | number, d2: string | Date | number): string {
		const a = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
		const b = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime();
		const days = Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
		if (days < 7) return `${days} day${days === 1 ? '' : 's'}`;
		if (days < 60) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? '' : 's'}`;
		if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? '' : 's'}`;
		return `${Math.round(days / 365)} year${Math.round(days / 365) === 1 ? '' : 's'}`;
	}

	let hoveredId = $state<string | null>(null);
	let compareA = $state<string | null>(null);
	let compareB = $state<string | null>(null);

	/** In demo mode, pre-select oldest and newest so the compare section is visible. */
	$effect(() => {
		if (demoMode && sorted.length >= 2 && compareA === null && compareB === null) {
			compareA = sorted[0].id;
			compareB = sorted[sorted.length - 1].id;
		}
	});

	function setCompare(id: string) {
		if (compareA === id) {
			compareA = compareB;
			compareB = null;
			return;
		}
		if (compareB === id) {
			compareB = null;
			return;
		}
		if (!compareA) compareA = id;
		else if (!compareB) compareB = id;
		else {
			compareA = compareB;
			compareB = id;
		}
	}
	function clearCompare() {
		compareA = null;
		compareB = null;
	}

	let deletingId = $state<string | null>(null);
	async function deleteAssessment(id: string) {
		if (!confirm('Delete this assessment? This cannot be undone.')) return;
		deletingId = id;
		try {
			const res = await fetch(`/api/assessments/${id}`, { method: 'DELETE', credentials: 'include' });
			if (!res.ok) {
				alert('Could not delete. Please try again.');
				return;
			}
			if (compareA === id) compareA = null;
			if (compareB === id) compareB = null;
			await invalidateAll();
		} finally {
			deletingId = null;
		}
	}

	const compareAssessments = $derived.by(() => {
		if (!compareA || !compareB) return null;
		const list = data.assessments ?? [];
		const first = list.find((a) => a.id === compareA);
		const second = list.find((a) => a.id === compareB);
		if (!first || !second) return null;
		const t1 = first.createdAt instanceof Date ? first.createdAt.getTime() : new Date(first.createdAt).getTime();
		const t2 = second.createdAt instanceof Date ? second.createdAt.getTime() : new Date(second.createdAt).getTime();
		return t1 <= t2 ? [first, second] : [second, first];
	});
	const compareFirst = $derived(compareAssessments?.[0] ?? null);
	const compareSecond = $derived(compareAssessments?.[1] ?? null);
	const showCompare = $derived(!!(compareFirst && compareSecond));

	/** When second assessment is selected, scroll the Compare panel into view (skip on demo so the page loads at the top). */
	$effect(() => {
		if (!showCompare || demoMode) return;
		const id = setTimeout(() => {
			document.getElementById('compare-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
		return () => clearTimeout(id);
	});

	/** Whether both compared assessments have a structure score (from face detection). */
	const hasStructureCompare = $derived(
		compareFirst != null &&
		compareSecond != null &&
		compareFirst.structureScore != null &&
		compareSecond.structureScore != null
	);

	/** Deltas and time span for the compare panel (earlier → later). */
	const compareDeltas = $derived.by(() => {
		if (!compareFirst || !compareSecond) return null;
		const overallDelta = compareSecond.overallScore - compareFirst.overallScore;
		const wrinklesDelta = compareSecond.wrinklesScore - compareFirst.wrinklesScore;
		const spotsDelta = compareSecond.spotsScore - compareFirst.spotsScore;
		const structureDelta =
			compareFirst.structureScore != null && compareSecond.structureScore != null
				? compareSecond.structureScore - compareFirst.structureScore
				: null;
		const span = timeBetween(compareFirst.createdAt, compareSecond.createdAt);
		return {
			overallDelta,
			wrinklesDelta,
			spotsDelta,
			structureDelta,
			span
		};
	});

	/** Whether both compared assessments have saved face details. */
	const hasFaceDetailsCompare = $derived(
		!!(compareFirst?.faceDetails && compareSecond?.faceDetails)
	);

	/** Bar chart + table items for compare (Overall, Wrinkles, Spots, and Structure when both have it). */
	const compareScoreItems = $derived.by(() => {
		if (!compareFirst || !compareSecond || !compareDeltas) return [];
		const base: Array<{ key: string; earlier: number; later: number; delta: number }> = [
			{ key: 'Overall', earlier: compareFirst.overallScore, later: compareSecond.overallScore, delta: compareDeltas.overallDelta },
			{ key: 'Wrinkles', earlier: compareFirst.wrinklesScore, later: compareSecond.wrinklesScore, delta: compareDeltas.wrinklesDelta },
			{ key: 'Spots', earlier: compareFirst.spotsScore, later: compareSecond.spotsScore, delta: compareDeltas.spotsDelta }
		];
		if (hasStructureCompare && compareFirst.structureScore != null && compareSecond.structureScore != null && compareDeltas.structureDelta != null) {
			base.push({ key: 'Structure', earlier: compareFirst.structureScore, later: compareSecond.structureScore, delta: compareDeltas.structureDelta });
		}
		return base;
	});

	/** Radar chart for compare panel: constants and polygon points (so we avoid @const in template). */
	const RADAR_R = 70;
	const RADAR_CX = 90;
	const RADAR_CY = 90;
	/** 3 axes (no structure) or 4 axes (with structure when both have it). */
	const radarAxes = $derived.by(() => {
		const three = [
			{ label: 'Overall', angle: -90 },
			{ label: 'Wrinkles', angle: 30 },
			{ label: 'Spots', angle: 150 }
		];
		if (hasStructureCompare) {
			return [
				{ label: 'Overall', angle: -90 },
				{ label: 'Wrinkles', angle: 0 },
				{ label: 'Spots', angle: 90 },
				{ label: 'Structure', angle: 180 }
			];
		}
		return three;
	});
	const radarPointsEarlier = $derived.by(() => {
		if (!compareFirst) return '';
		const values = [
			compareFirst.overallScore,
			compareFirst.wrinklesScore,
			compareFirst.spotsScore,
			...(hasStructureCompare && compareFirst.structureScore != null ? [compareFirst.structureScore] : [])
		];
		return radarAxes
			.map((ax, i) => {
				const rad = (ax.angle * Math.PI) / 180;
				const v = values[i] ?? 0;
				return `${RADAR_CX + (v / 100) * RADAR_R * Math.cos(rad)},${RADAR_CY + (v / 100) * RADAR_R * Math.sin(rad)}`;
			})
			.join(' ');
	});
	const radarPointsLater = $derived.by(() => {
		if (!compareSecond) return '';
		const values = [
			compareSecond.overallScore,
			compareSecond.wrinklesScore,
			compareSecond.spotsScore,
			...(hasStructureCompare && compareSecond.structureScore != null ? [compareSecond.structureScore] : [])
		];
		return radarAxes
			.map((ax, i) => {
				const rad = (ax.angle * Math.PI) / 180;
				const v = values[i] ?? 0;
				return `${RADAR_CX + (v / 100) * RADAR_R * Math.cos(rad)},${RADAR_CY + (v / 100) * RADAR_R * Math.sin(rad)}`;
			})
			.join(' ');
	});

	/** Short face-age trend copy when comparing with face details (e.g. "Your estimated age has stayed stable" or "32 → 33 over 3 months"). */
	const faceAgeTrendCopy = $derived.by(() => {
		if (!hasFaceDetailsCompare || !compareFirst?.faceDetails || !compareSecond?.faceDetails || !compareDeltas) return null;
		const a1 = compareFirst.faceDetails.age;
		const a2 = compareSecond.faceDetails.age;
		const delta = a2 - a1;
		const span = compareDeltas.span;
		if (delta === 0) return `Your estimated age has stayed stable over this period (${span}).`;
		if (delta > 0) return `Estimated age: ${a1} → ${a2} over ${span}.`;
		return `Estimated age: ${a1} → ${a2} over ${span}.`;
	});

	/** Dominant expression label from expressions object (e.g. "happy"). */
	function dominantExpression(expressions: Record<string, number> | undefined): string {
		if (!expressions || Object.keys(expressions).length === 0) return '—';
		const entries = Object.entries(expressions);
		const [name] = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
		return name.charAt(0).toUpperCase() + name.slice(1);
	}

	// Pagination for "Your assessments" (most recent first)
	const PAGE_SIZE = 15;
	const assessmentsNewestFirst = $derived([...(data.assessments ?? [])].sort((a, b) => {
		const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
		const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
		return tb - ta;
	}));
	const totalPages = $derived(Math.max(1, Math.ceil(assessmentsNewestFirst.length / PAGE_SIZE)));
	let currentPage = $state(1);
	$effect(() => {
		// Clamp page when list shrinks (e.g. after delete)
		if (currentPage > totalPages && totalPages >= 1) currentPage = totalPages;
	});
	const paginatedAssessments = $derived(
		assessmentsNewestFirst.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);
	const rangeStart = $derived((currentPage - 1) * PAGE_SIZE + 1);
	const rangeEnd = $derived(Math.min(currentPage * PAGE_SIZE, assessmentsNewestFirst.length));
</script>

<svelte:head>
	<title>My progress – Skin Assessment</title>
</svelte:head>

<main class="min-h-screen px-6 pt-6 pb-12 sm:pt-8 sm:pb-16">
	<div class="mx-auto max-w-3xl">
		{#if demoMode}
			<div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
				<p class="text-sm font-medium">Example data for preview — <a href="/sign-up" class="underline hover:no-underline">Sign up</a> to track your own progress.</p>
			</div>
		{/if}
		{#if sorted.length === 0}
			<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">My progress</h1>
			<p class="mt-2 text-stone-600">
				Track your skin assessment scores over time. Add new assessments from the assess flow and save them to see your progress here.
			</p>
			<div class="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
				<p class="text-stone-600">You haven’t saved any assessments yet.</p>
				<p class="mt-2 text-sm text-stone-500">
					Complete an assessment and choose “Save to my progress” on the results page to see your scores here.
				</p>
				<a
					href="/assess"
					class="mt-6 inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Assess my skin
				</a>
			</div>
		{:else}
			{#if hasEnoughForTrend && trend}
				<div class="mt-8 rounded-xl border border-stone-200 bg-white p-4">
					<h2 class="text-lg font-semibold text-stone-900">Trend</h2>
					<p class="mt-1 text-stone-600">
						{#if trend === 'improving'}
							Improving over your last {recentForTrend.length} assessments. Keep it up.
						{:else if trend === 'declining'}
							Overall score has dipped over your last {recentForTrend.length} assessments. Consistency in routine can help.
						{:else}
							Stable over your last {recentForTrend.length} assessments.
						{/if}
					</p>
					{#if delta != null}
						<p class="mt-2 text-sm text-stone-500">
							Vs previous: {delta >= 0 ? '+' : ''}{delta} overall
						</p>
					{/if}
				</div>
			{/if}

			<section class="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
				<h2 class="text-lg font-semibold text-stone-900">Overall score over time</h2>
				<p class="mt-1 text-sm text-stone-600">Hover a point to see the photo from that assessment.</p>
				<p class="mt-1 text-xs text-stone-500">Line gradient: green = improvement (brighter = more), amber = decline (deeper = more).</p>
				<div class="mt-4 relative overflow-visible" role="img" aria-label="Line chart of overall skin score over time">
					<svg
						viewBox="0 0 {chartWidth} {chartHeight}"
						class="min-w-full block"
					>
						<text x={padding.left - 8} y={padding.top} text-anchor="end" class="fill-stone-500 text-xs">100</text>
						<text x={padding.left - 8} y={padding.top + innerHeight / 2} text-anchor="end" class="fill-stone-500 text-xs">50</text>
						<text x={padding.left - 8} y={padding.top + innerHeight} text-anchor="end" class="fill-stone-500 text-xs">0</text>
						<line x1={padding.left} y1={padding.top + innerHeight / 2} x2={padding.left + innerWidth} y2={padding.top + innerHeight / 2} stroke="currentColor" stroke-dasharray="4" class="text-stone-200" />
						<!-- X-axis labels (dates) -->
						{#each sorted as a, i}
							{#if showXLabel(i)}
								<text
									x={xScale(i)}
									y={chartHeight - 8}
									text-anchor="middle"
									class="fill-stone-500 text-xs"
								>
									{formatAxisDate(a.createdAt)}
								</text>
							{/if}
						{/each}
						<defs>
							<linearGradient id="progressLineGradient" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
								{#each lineGradientStops as stop}
									<stop offset={stop.offset} stop-color={stop.color} />
								{/each}
							</linearGradient>
						</defs>
						<path
							d={pathData}
							fill="none"
							stroke="url(#progressLineGradient)"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						{#each sorted as a, i}
							<circle
								cx={xScale(i)}
								cy={yScale(a.overallScore)}
								r="6"
								fill={lineGradientStops[i]?.color ?? '#a8a29e'}
								class="hover:opacity-80 transition-opacity"
								role="button"
								tabindex="0"
								aria-label="Assessment {formatDate(a.createdAt)}, score {a.overallScore}"
								onmouseenter={() => (hoveredId = a.id)}
								onmouseleave={() => (hoveredId = null)}
								onfocus={() => (hoveredId = a.id)}
								onblur={() => (hoveredId = null)}
								onkeydown={(e) => e.key === 'Enter' && (hoveredId = hoveredId === a.id ? null : a.id)}
							/>
						{/each}
					</svg>
					{#if hoveredId}
						{@const hovered = sorted.find((a) => a.id === hoveredId)}
						{#if hovered}
							<div
								class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
								aria-hidden="true"
							>
								<div
									class="rounded-lg border border-stone-200 bg-white p-2 shadow-lg pointer-events-none min-w-[140px]"
								>
									<p class="text-xs font-medium text-stone-700">{formatDate(hovered.createdAt)}</p>
									<p class="text-xs text-stone-500">Overall: {hovered.overallScore}/100</p>
									{#if hovered.hasImage}
										<img
											src="/api/assessments/{hovered.id}/image"
											alt="Photo from {formatDate(hovered.createdAt)}"
											loading="lazy"
											class="mt-2 rounded object-cover"
											width="140"
											height="140"
											style="aspect-ratio: 1;"
										/>
									{:else if demoMode}
										<img
											src={getThemedImage(sorted.findIndex((x) => x.id === hovered.id), 280)}
											alt=""
											class="mt-2 rounded object-cover"
											width="140"
											height="140"
											style="aspect-ratio: 1;"
										/>
									{/if}
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</section>

			{#if showCompare && compareFirst && compareSecond && compareDeltas}
				<section id="compare-panel" class="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-semibold text-stone-900">Compare</h2>
						<button
							type="button"
							onclick={clearCompare}
							class="text-sm font-medium text-stone-600 hover:text-stone-900"
						>
							Clear
						</button>
					</div>
					<p class="mt-1 text-base text-stone-700">Earlier vs later. <strong class="text-stone-900">{compareDeltas.span}</strong> between these assessments.</p>
					{#if faceAgeTrendCopy}
						<p class="mt-2 text-sm text-stone-600">{faceAgeTrendCopy}</p>
					{/if}
					<div class="mt-6 grid grid-cols-2 gap-6">
						<div class="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
							<p class="text-base font-semibold text-stone-800">{formatDate(compareFirst.createdAt)}</p>
							<p class="mt-0.5 text-sm text-stone-600">Overall: {compareFirst.overallScore}/100</p>
							{#if compareFirst.hasImage}
								<img
									src="/api/assessments/{compareFirst.id}/image"
									alt="Earlier"
									loading="lazy"
									class="mx-auto mt-2 rounded object-cover"
									width="160"
									height="160"
									style="aspect-ratio: 1;"
								/>
							{:else if demoMode}
								<img
									src={getThemedImage(0, 320)}
									alt=""
									class="mx-auto mt-2 rounded object-cover object-center"
									width="160"
									height="160"
									style="aspect-ratio: 1;"
								/>
							{:else}
								<div class="mx-auto mt-2 flex h-40 w-40 items-center justify-center rounded bg-stone-200 text-sm text-stone-500">No photo</div>
							{/if}
						</div>
						<div class="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
							<p class="text-base font-semibold text-stone-800">{formatDate(compareSecond.createdAt)}</p>
							<p class="mt-0.5 text-sm text-stone-600">Overall: {compareSecond.overallScore}/100</p>
							{#if compareSecond.hasImage}
								<img
									src="/api/assessments/{compareSecond.id}/image"
									alt="Later"
									loading="lazy"
									class="mx-auto mt-2 rounded object-cover"
									width="160"
									height="160"
									style="aspect-ratio: 1;"
								/>
							{:else if demoMode}
								<img
									src={getThemedImage(1, 320)}
									alt=""
									class="mx-auto mt-2 rounded object-cover object-center"
									width="160"
									height="160"
									style="aspect-ratio: 1;"
								/>
							{:else}
								<div class="mx-auto mt-2 flex h-40 w-40 items-center justify-center rounded bg-stone-200 text-sm text-stone-500">No photo</div>
							{/if}
						</div>
					</div>

					<!-- Pictorial comparison: bar chart + radar -->
					<div class="mt-8 grid gap-8 sm:grid-cols-2">
						<div class="rounded-xl border border-stone-200 bg-stone-50/50 p-5">
							<h3 class="text-base font-semibold text-stone-900">Scores: earlier vs later</h3>
							<p class="mt-1 text-sm text-stone-600">Bar height = score (0–100). Compare at a glance.</p>
							<div class="mt-4 flex items-end justify-around gap-2" style="height: 160px;">
								{#each compareScoreItems as item}
									<div class="flex flex-1 flex-col items-center gap-1">
										<div class="flex w-full items-end justify-center gap-0.5" style="height: 120px;">
											<div
												class="w-6 rounded-t bg-stone-400"
												style="height: {(item.earlier / 100) * 120}px; min-height: 2px;"
												title="Earlier: {item.earlier}"
											></div>
											<div
												class="w-6 rounded-t bg-stone-800"
												style="height: {(item.later / 100) * 120}px; min-height: 2px;"
												title="Later: {item.later}"
											></div>
										</div>
										<span class="text-xs font-medium text-stone-700">{item.key}</span>
										<span class="text-xs text-stone-500">{item.earlier} → {item.later}</span>
									</div>
								{/each}
							</div>
							<div class="mt-3 flex justify-center gap-6 text-xs text-stone-600">
								<span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded bg-stone-400"></span> Earlier</span>
								<span class="flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded bg-stone-800"></span> Later</span>
							</div>
						</div>
						<div class="rounded-xl border border-stone-200 bg-stone-50/50 p-5">
							<h3 class="text-base font-semibold text-stone-900">Shape comparison</h3>
							<p class="mt-1 text-sm text-stone-600">Each shape = one assessment. Bigger in a direction = higher score.</p>
							<div class="mt-4 flex justify-center" role="img" aria-label="Radar chart comparing earlier and later assessment scores">
								<svg viewBox="0 0 180 180" class="max-w-full" width="180" height="180">
									<!-- Grid circles -->
									<circle cx={RADAR_CX} cy={RADAR_CY} r={RADAR_R} fill="none" stroke="#e5e7eb" stroke-width="1" />
									<circle cx={RADAR_CX} cy={RADAR_CY} r={RADAR_R * 0.5} fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3 2" />
									<!-- Axis lines and labels -->
									{#each radarAxes as ax}
										{@const rad = (ax.angle * Math.PI) / 180}
										<line x1={RADAR_CX} y1={RADAR_CY} x2={RADAR_CX + RADAR_R * Math.cos(rad)} y2={RADAR_CY + RADAR_R * Math.sin(rad)} stroke="#d6d3d1" stroke-width="1" />
										<text
											x={RADAR_CX + (RADAR_R + 12) * Math.cos(rad)}
											y={RADAR_CY + (RADAR_R + 12) * Math.sin(rad)}
											text-anchor="middle"
											dominant-baseline="middle"
											class="fill-stone-600 text-[10px] font-medium"
										>{ax.label}</text>
									{/each}
									<!-- Earlier polygon (lighter) -->
									<polygon
										points={radarPointsEarlier}
										fill="#a8a29e"
										fill-opacity="0.35"
										stroke="#78716c"
										stroke-width="1.5"
									/>
									<!-- Later polygon (darker) -->
									<polygon
										points={radarPointsLater}
										fill="none"
										stroke="#292524"
										stroke-width="2"
									/>
								</svg>
							</div>
							<div class="mt-2 flex justify-center gap-6 text-xs text-stone-600">
								<span class="flex items-center gap-1.5"><span class="inline-block h-2 w-4 rounded border-2 border-stone-500 bg-stone-400/40"></span> Earlier</span>
								<span class="flex items-center gap-1.5"><span class="inline-block h-0.5 w-4 border-t-2 border-stone-800"></span> Later</span>
							</div>
						</div>
					</div>

					<!-- Score changes summary -->
					<div class="mt-8 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
						<h3 class="text-base font-semibold text-stone-900">Score changes</h3>
						<p class="mt-1 text-sm text-stone-600">How your scores changed from the earlier to the later assessment.</p>
						<div class="mt-4 overflow-hidden rounded-lg border border-stone-200">
							<table class="w-full text-left text-base" role="table" aria-label="Score comparison">
								<thead>
									<tr class="border-b border-stone-200 bg-stone-100">
										<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Metric</th>
										<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Earlier</th>
										<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Later</th>
										<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Change</th>
									</tr>
								</thead>
								<tbody class="text-stone-800">
									{#each compareScoreItems as item, i}
										<tr class={i === compareScoreItems.length - 1 ? '' : 'border-b border-stone-100'}>
											<td class="px-4 py-3 font-medium text-stone-900">{item.key}</td>
											<td class="px-4 py-3">{item.earlier}/100</td>
											<td class="px-4 py-3">{item.later}/100</td>
											<td class="px-4 py-3">
												{#if item.delta !== 0}
													<span class={item.delta > 0 ? 'font-semibold text-green-700' : 'font-semibold text-amber-700'}>
														{item.delta > 0 ? '+' : ''}{item.delta}
													</span>
													<span class="ml-1 text-stone-600">— {trendLabel(item.delta)}</span>
												{:else}
													<span class="text-stone-500">Unchanged</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						{#if hasFaceDetailsCompare && compareFirst && compareSecond}
							<div class="mt-6 pt-4 border-t border-stone-200">
								<h3 class="text-base font-semibold text-stone-900">Face details</h3>
								<p class="mt-1 text-sm text-stone-600">Age, gender and expression from face detection at the time of each assessment.</p>
								<div class="mt-4 overflow-hidden rounded-lg border border-stone-200">
									<table class="w-full text-left text-base" role="table" aria-label="Face details comparison">
										<thead>
											<tr class="border-b border-stone-200 bg-stone-100">
												<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Metric</th>
												<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Earlier</th>
												<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Later</th>
												<th scope="col" class="px-4 py-3 font-semibold text-stone-900">Change</th>
											</tr>
										</thead>
										<tbody class="text-stone-800">
											<tr class="border-b border-stone-100">
												<td class="px-4 py-3 font-medium text-stone-900">Age</td>
												<td class="px-4 py-3">{compareFirst.faceDetails.age} years</td>
												<td class="px-4 py-3">{compareSecond.faceDetails.age} years</td>
												<td class="px-4 py-3">
													{#if compareSecond.faceDetails.age - compareFirst.faceDetails.age !== 0}
														{@const ageDelta = compareSecond.faceDetails.age - compareFirst.faceDetails.age}
														<span class="font-semibold text-stone-700">
															{ageDelta > 0 ? '+' : ''}{ageDelta} year{ageDelta === 1 || ageDelta === -1 ? '' : 's'}
														</span>
													{:else}
														<span class="text-stone-500">Unchanged</span>
													{/if}
												</td>
											</tr>
											<tr class="border-b border-stone-100">
												<td class="px-4 py-3 font-medium text-stone-900">Gender</td>
												<td class="px-4 py-3">{compareFirst.faceDetails.gender}</td>
												<td class="px-4 py-3">{compareSecond.faceDetails.gender}</td>
												<td class="px-4 py-3">
													{#if compareFirst.faceDetails.gender !== compareSecond.faceDetails.gender}
														<span class="font-semibold text-stone-700">Changed</span>
													{:else}
														<span class="text-stone-500">Same</span>
													{/if}
												</td>
											</tr>
											<tr>
												<td class="px-4 py-3 font-medium text-stone-900">Dominant expression</td>
												<td class="px-4 py-3">{dominantExpression(compareFirst.faceDetails.expressions)}</td>
												<td class="px-4 py-3">{dominantExpression(compareSecond.faceDetails.expressions)}</td>
												<td class="px-4 py-3">
													{#if dominantExpression(compareFirst.faceDetails.expressions) !== dominantExpression(compareSecond.faceDetails.expressions)}
														<span class="font-semibold text-stone-700">Different</span>
													{:else}
														<span class="text-stone-500">Same</span>
													{/if}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						{/if}

						{#if 'wrinklesForehead' in compareFirst && compareFirst.wrinklesForehead != null && compareSecond.wrinklesForehead != null}
							<div class="mt-6 pt-4 border-t border-stone-200">
								<h4 class="text-sm font-semibold text-stone-900">Detail (wrinkles &amp; spots)</h4>
								<div class="mt-3 overflow-hidden rounded-lg border border-stone-200">
									<table class="w-full text-left text-sm" role="table" aria-label="Detail score comparison">
										<thead>
											<tr class="border-b border-stone-200 bg-stone-50">
												<th scope="col" class="px-4 py-2.5 font-medium text-stone-800">Area</th>
												<th scope="col" class="px-4 py-2.5 font-medium text-stone-800">Earlier</th>
												<th scope="col" class="px-4 py-2.5 font-medium text-stone-800">Later</th>
												<th scope="col" class="px-4 py-2.5 font-medium text-stone-800">Change</th>
											</tr>
										</thead>
										<tbody class="text-stone-700">
											<tr class="border-b border-stone-100"><td class="px-4 py-2.5 font-medium text-stone-800">Forehead</td><td class="px-4 py-2.5">{compareFirst.wrinklesForehead}</td><td class="px-4 py-2.5">{compareSecond.wrinklesForehead}</td><td class="px-4 py-2.5">{compareSecond.wrinklesForehead - compareFirst.wrinklesForehead >= 0 ? '+' : ''}{compareSecond.wrinklesForehead - compareFirst.wrinklesForehead}</td></tr>
											<tr class="border-b border-stone-100"><td class="px-4 py-2.5 font-medium text-stone-800">Crow's feet</td><td class="px-4 py-2.5">{compareFirst.wrinklesCrowFeet}</td><td class="px-4 py-2.5">{compareSecond.wrinklesCrowFeet}</td><td class="px-4 py-2.5">{compareSecond.wrinklesCrowFeet - compareFirst.wrinklesCrowFeet >= 0 ? '+' : ''}{compareSecond.wrinklesCrowFeet - compareFirst.wrinklesCrowFeet}</td></tr>
											<tr class="border-b border-stone-100"><td class="px-4 py-2.5 font-medium text-stone-800">Fine lines</td><td class="px-4 py-2.5">{compareFirst.wrinklesFineLines}</td><td class="px-4 py-2.5">{compareSecond.wrinklesFineLines}</td><td class="px-4 py-2.5">{compareSecond.wrinklesFineLines - compareFirst.wrinklesFineLines >= 0 ? '+' : ''}{compareSecond.wrinklesFineLines - compareFirst.wrinklesFineLines}</td></tr>
											<tr class="border-b border-stone-100"><td class="px-4 py-2.5 font-medium text-stone-800">Blemishes</td><td class="px-4 py-2.5">{compareFirst.spotsBlemishes}</td><td class="px-4 py-2.5">{compareSecond.spotsBlemishes}</td><td class="px-4 py-2.5">{compareSecond.spotsBlemishes - compareFirst.spotsBlemishes >= 0 ? '+' : ''}{compareSecond.spotsBlemishes - compareFirst.spotsBlemishes}</td></tr>
											<tr><td class="px-4 py-2.5 font-medium text-stone-800">Hyperpigmentation</td><td class="px-4 py-2.5">{compareFirst.spotsHyperpigmentation}</td><td class="px-4 py-2.5">{compareSecond.spotsHyperpigmentation}</td><td class="px-4 py-2.5">{compareSecond.spotsHyperpigmentation - compareFirst.spotsHyperpigmentation >= 0 ? '+' : ''}{compareSecond.spotsHyperpigmentation - compareFirst.spotsHyperpigmentation}</td></tr>
										</tbody>
									</table>
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/if}

			<!-- My progress heading + description + Picks for you (lower down the page) -->
			<div class="mt-8">
				<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">My progress</h1>
				<p class="mt-2 text-stone-600">
					Track your skin assessment scores over time. Add new assessments from the assess flow and save them to see your progress here.
				</p>
				<div class="mt-6">
					<a
						href="/products/for-you"
						class="inline-flex items-center justify-center rounded-md border-2 border-stone-900 bg-stone-50 px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						Picks for you
					</a>
				</div>
			</div>

			<section class="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h2 class="text-lg font-semibold text-stone-900">Your assessments</h2>
						<p class="mt-1 text-sm text-stone-600">
							Most recent first. Select two to compare photos.
							{#if compareA && !compareB}
								<span class="mt-1 block font-medium text-stone-700">1 of 2 selected — pick another assessment below.</span>
							{:else if compareA && compareB}
								<span class="mt-1 block font-medium text-stone-700">2 selected. See Compare above, or clear and pick again.</span>
							{/if}
						</p>
					</div>
					{#if assessmentsNewestFirst.length > PAGE_SIZE}
						<div class="flex items-center gap-3">
							<span class="text-sm text-stone-600" aria-live="polite">
								Showing {rangeStart}–{rangeEnd} of {assessmentsNewestFirst.length}
							</span>
							<div class="flex gap-1">
								<button
									type="button"
									disabled={currentPage <= 1}
									onclick={() => (currentPage = Math.max(1, currentPage - 1))}
									class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
									aria-label="Previous page"
								>
									Previous
								</button>
								<button
									type="button"
									disabled={currentPage >= totalPages}
									onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
									class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
									aria-label="Next page"
								>
									Next
								</button>
							</div>
						</div>
					{/if}
				</div>
				<ul class="mt-4 space-y-3" role="list">
					{#each paginatedAssessments as a (a.id)}
						{@const isCompareA = compareA === a.id}
						{@const isCompareB = compareB === a.id}
						{@const isSelected = isCompareA || isCompareB}
						<li
							class="flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors {isSelected
								? 'border-stone-900 bg-stone-100 ring-2 ring-stone-900 ring-offset-2'
								: 'border-stone-200 bg-stone-50'}"
						>
							{#if a.hasImage}
								<img
									src="/api/assessments/{a.id}/image"
									alt=""
									loading="lazy"
									class="h-14 w-14 shrink-0 rounded object-cover"
									width="56"
									height="56"
								/>
							{:else if demoMode}
								<img
									src={getThemedImage(paginatedAssessments.findIndex((x) => x.id === a.id), 112)}
									alt=""
									class="h-14 w-14 shrink-0 rounded object-cover object-center"
									width="56"
									height="56"
								/>
							{:else}
								<div class="h-14 w-14 shrink-0 rounded bg-stone-200" aria-hidden="true"></div>
							{/if}
							<div class="min-w-0 flex-1">
								<span class="font-medium text-stone-900">{formatDate(a.createdAt)}</span>
								{#if isSelected}
									<span class="ml-2 rounded bg-stone-800 px-2 py-0.5 text-xs font-medium text-white">
										{isCompareA ? 'Compare 1' : 'Compare 2'}
									</span>
								{/if}
								<span class="text-stone-600"> · Overall: <strong class="text-stone-800">{a.overallScore}</strong>/100 · Wrinkles: {a.wrinklesScore} · Spots: {a.spotsScore}</span>
							</div>
							<button
								type="button"
								onclick={() => setCompare(a.id)}
								class="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium {isSelected
									? 'bg-stone-800 text-white hover:bg-stone-700'
									: 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'}"
								aria-pressed={isSelected}
							>
								{isSelected ? (isCompareA ? 'Selected (1)' : 'Selected (2)') : 'Compare'}
							</button>
							{#if !demoMode}
								<button
									type="button"
									disabled={deletingId === a.id}
									onclick={() => deleteAssessment(a.id)}
									title="Delete this assessment"
									class="shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									aria-label="Delete assessment from {formatDate(a.createdAt)}"
								>
									<span class="inline-flex items-center gap-1.5">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
											<line x1="10" y1="11" x2="10" y2="17" />
											<line x1="14" y1="11" x2="14" y2="17" />
										</svg>
										{deletingId === a.id ? 'Deleting…' : 'Delete'}
									</span>
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			</section>

			<div class="mt-8 flex flex-wrap items-center justify-center gap-8">
				<a
					href="/assess"
					class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Add new assessment
				</a>
				<div class="rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
					<img src="/api/qr?path=/progress" alt="QR code for progress page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
					<div class="text-left">
						<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
						<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open your progress on another device.</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</main>
