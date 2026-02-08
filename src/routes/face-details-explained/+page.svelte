<script lang="ts">
	import { getThemedImage } from '$lib/data/placeholderImages';
</script>

<svelte:head>
	<title>How face details are produced – Skin Assessment</title>
</svelte:head>

<main class="min-h-screen bg-stone-50/50 px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-3xl">
		<!-- Hero -->
		<header class="text-center">
			<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
				How face details are produced
			</h1>
			<p class="mt-4 text-lg text-stone-600">
				When we detect a face in your photo, we can optionally show estimated age, gender and expression.
				This page explains how those figures are produced and what the scores mean.
			</p>
		</header>

		<!-- Hero image -->
		<div class="mt-10 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
			<img
				src={getThemedImage(0, 800)}
				alt=""
				width="800"
				height="400"
				class="h-48 w-full object-cover sm:h-64"
			/>
		</div>

		<!-- What we show -->
		<section class="mt-14 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
			<h2 class="text-xl font-semibold text-stone-900">What we show</h2>
			<p class="mt-3 text-stone-700">
				Face details are optional estimates, not part of your core skin assessment. If you choose to include them,
				you’ll see:
			</p>
			<ul class="mt-4 space-y-3 text-stone-700">
				<li class="flex gap-3">
					<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-200 text-xs font-semibold text-stone-600">1</span>
					<strong>Estimated age</strong> — a single number in years (e.g. 34).
				</li>
				<li class="flex gap-3">
					<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-200 text-xs font-semibold text-stone-600">2</span>
					<strong>Gender</strong> — male or female, with a confidence percentage (e.g. male 99%).
				</li>
				<li class="flex gap-3">
					<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-200 text-xs font-semibold text-stone-600">3</span>
					<strong>Expression</strong> — up to three emotions with probabilities (e.g. neutral 93%, surprised 7%).
				</li>
			</ul>
		</section>

		<!-- How the figures are produced -->
		<section class="mt-10">
			<h2 class="text-xl font-semibold text-stone-900">How the figures are produced</h2>
			<p class="mt-3 text-stone-700">
				We use the same face detection that powers the region overlays (forehead, eyes). Once a face is detected
				and aligned, we run two extra neural networks on the face image:
			</p>

			<!-- Image: age & gender -->
			<div class="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
				<img
					src={getThemedImage(1, 800)}
					alt=""
					width="800"
					height="300"
					class="h-40 w-full object-cover sm:h-52"
				/>
			</div>

			<ol class="mt-6 space-y-6">
				<li class="flex gap-4">
					<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-200 text-sm font-semibold text-stone-800">1</span>
					<div>
						<h3 class="font-semibold text-stone-900">Age and gender</h3>
						<p class="mt-1 text-stone-700">
							One model predicts age (regression) and gender (classification).
							It was trained on large public face datasets where age and gender labels were available (e.g.
							<a href="https://talhassner.github.io/home/projects/Adience/Adience-data.html" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">Adience</a>,
							<a href="https://data.vision.ee.ethz.ch/cvl/rrothe/imdb-wiki/" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">IMDb-Wiki</a>–style benchmarks). The model sees the aligned face and outputs an age in years and
							probabilities for male/female; we show the predicted gender and the higher probability as a percentage.
						</p>
					</div>
				</li>

				<!-- Placeholder: Expression pipeline -->
				<li class="flex gap-4">
					<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-200 text-sm font-semibold text-stone-800">2</span>
					<div class="min-w-0 flex-1">
						<div class="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
							<img
								src={getThemedImage(2, 800)}
								alt=""
								width="800"
								height="300"
								class="h-40 w-full object-cover sm:h-52"
							/>
						</div>
						<h3 class="mt-4 font-semibold text-stone-900">Expression</h3>
						<p class="mt-1 text-stone-700">
							A second model predicts seven emotions: neutral, happy, sad, angry,
							fearful, disgusted, surprised. It was trained on face datasets with expression labels (e.g.
							<a href="https://en.wikipedia.org/wiki/Facial_expression_recognition" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">facial expression recognition</a> datasets such as
							<a href="https://www.kaggle.com/datasets/msambare/fer2013" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">FER2013</a>). The model outputs a probability for each; we show the top three so you can see the
							dominant expression and alternatives.
						</p>
					</div>
				</li>
			</ol>

			<p class="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 text-stone-700">
				Both models are provided by the
				<a href="https://github.com/vladmandic/face-api" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">face-api</a> library
				(<a href="https://www.tensorflow.org/js" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">TensorFlow.js</a>) and run on our server. They are
				pretrained; we do not train them on your data. No face details are stored unless you save your
				assessment, and you can choose not to include them at all.
			</p>
		</section>

		<!-- What the scores mean -->
		<section class="mt-14">
			<h2 class="text-xl font-semibold text-stone-900">What the scores mean</h2>
			<p class="mt-2 text-stone-600">Each face-detail output and how we display it.</p>
			<dl class="mt-6 grid gap-4 sm:grid-cols-1">
				<div class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
					<dt class="font-semibold text-stone-900">Estimated age</dt>
					<dd class="mt-2 text-stone-700">
						A single number in years. It is an estimate from the model’s training; it can be off by several
						years depending on lighting, pose and how similar your face is to the training data. We round to
						the nearest whole number.
					</dd>
				</div>
				<div class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
					<dt class="font-semibold text-stone-900">Gender and percentage</dt>
					<dd class="mt-2 text-stone-700">
						The model outputs probabilities for “male” and “female”. We show the label with the higher
						probability (e.g. male) and that probability as a percentage (e.g. 99%). So “male (99%)” means
						the model assigned 99% probability to male and 1% to female. This is a statistical output, not a
						biological determination.
					</dd>
				</div>
				<div class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
					<dt class="font-semibold text-stone-900">Expression</dt>
					<dd class="mt-2 text-stone-700">
						Seven emotions are scored from 0 to 1 (probabilities). We show the top three so you see the
						dominant expression (e.g. neutral 93%) and the next most likely (e.g. surprised 7%). The model
						was trained on posed and natural expressions; results depend on your expression in the photo and
						lighting.
					</dd>
				</div>
			</dl>
		</section>

		<!-- Datasets and models -->
		<section class="mt-14 rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm sm:p-8">
			<h2 class="text-xl font-semibold text-stone-900">Datasets and models</h2>
			<p class="mt-3 text-stone-700">
				The age/gender and expression models come from the face-api ecosystem (TensorFlow.js). They are
				typically trained on public benchmarks such as:
			</p>
			<ul class="mt-4 space-y-2 text-stone-700">
				<li>
					<strong>Age and gender</strong> — Models are often trained on datasets like
					<a href="https://talhassner.github.io/home/projects/Adience/Adience-data.html" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">Adience</a> (age and gender
					estimation) or
					<a href="https://data.vision.ee.ethz.ch/cvl/rrothe/imdb-wiki/" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">IMDb-Wiki</a>–style face datasets with age and gender labels. The exact training data
					depends on the face-api model pack you use; we use the models shipped with
					<a href="https://github.com/vladmandic/face-api" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline"><code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">@vladmandic/face-api</code></a>.
				</li>
				<li>
					<strong>Expression</strong> — Typically trained on emotion-labelled face datasets (e.g.
					<a href="https://www.kaggle.com/datasets/msambare/fer2013" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">FER2013</a>,
					<a href="https://www.mohammadmahoor.com/pages/databases/affectnet/" target="_blank" rel="noopener noreferrer" class="font-medium text-stone-700 underline hover:no-underline">AffectNet</a>-style
					data) with seven or more expression categories. Again, we use the expression model provided by the
					library.
				</li>
			</ul>
			<p class="mt-5 rounded-lg border border-stone-200 bg-white p-4 text-stone-700">
				We do not retrain these models or add your photos to any dataset. They run only to produce the optional
				face-detail estimates when you choose to include them. For full control, you can leave “Include face
				details” unchecked so age, gender and expression are never shown.
			</p>
		</section>

		<!-- Footer nav -->
		<nav class="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200 pt-8 text-sm">
			<a href="/results" class="font-medium text-stone-700 underline hover:no-underline">Back to results</a>
			<span class="text-stone-300" aria-hidden="true">|</span>
			<a href="/how-it-works" class="font-medium text-stone-700 underline hover:no-underline">How it works (skin assessment)</a>
		</nav>
	</div>
</main>
