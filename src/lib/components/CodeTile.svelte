<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import codeExamples from '$lib/codeLines.json';

	type Fragment = { text: string; type: string };
	type CodeLine = Fragment[];

	export let showCursor = true;
	/** soft | medium | hard — dureté hétérogène */
	export let hardness: 'soft' | 'medium' | 'hard' = 'medium';

	let displayedLines: CodeLine[] = [];
	let cancelled = false;

	/** Décalages visuels aléatoires (par tuile) */
	const offsetY = `${(Math.random() * 42 - 12).toFixed(1)}%`;
	const offsetX = `${(Math.random() * 22 - 11).toFixed(1)}%`;
	const scale = 0.82 + Math.random() * 0.4;
	const startDelay = 150 + Math.random() * 3200;
	const speedFactor = 0.5 + Math.random() * 1.25;

	const hardnessMap = {
		soft: { opacity: 0.42 + Math.random() * 0.2, contrast: 1.05, weight: 400, blend: 'soft-light' },
		medium: { opacity: 0.68 + Math.random() * 0.18, contrast: 1.25, weight: 500, blend: 'overlay' },
		hard: { opacity: 0.88 + Math.random() * 0.12, contrast: 1.55, weight: 600, blend: 'plus-lighter' }
	} as const;

	const h = hardnessMap[hardness];
	const opacity = h.opacity;
	const contrast = h.contrast;
	const fontWeight = h.weight;
	const blend = h.blend;
	const shadow =
		hardness === 'hard'
			? '0 0 1px rgba(255,255,255,0.35)'
			: hardness === 'medium'
				? '0 0 0.5px rgba(255,255,255,0.15)'
				: 'none';

	function getRandomExample(): CodeLine[] {
		return codeExamples[Math.floor(Math.random() * codeExamples.length)] as CodeLine[];
	}

	async function typeCodeLoop() {
		await new Promise((r) => setTimeout(r, startDelay));

		while (!cancelled) {
			const codeLines = getRandomExample();
			displayedLines = [];

			await new Promise((r) => setTimeout(r, 250 + Math.random() * 1400));
			if (cancelled) break;

			for (let i = 0; i < codeLines.length; i++) {
				if (cancelled) break;
				let line: Fragment[] = [];
				for (const frag of codeLines[i]) {
					if (cancelled) break;
					const baseDelay =
						(frag.type === 'comment' ? 45 : frag.type === 'string' ? 35 : frag.type === 'keyword' ? 55 : 30) *
						speedFactor;
					for (let k = 1; k <= frag.text.length; k++) {
						if (cancelled) break;
						line = [...line, { text: frag.text.slice(0, k), type: frag.type }];
						displayedLines = [...displayedLines.slice(0, i), line];
						await new Promise((r) => setTimeout(r, baseDelay + Math.random() * 40 * speedFactor));
						line = [...line.slice(0, -1)];
					}
					line = [...line, frag];
					displayedLines = [...displayedLines.slice(0, i), line];

					if (Math.random() < 0.15) {
						await new Promise((r) => setTimeout(r, 80 + Math.random() * 220));
					}
				}
				await new Promise((r) => setTimeout(r, (60 + Math.random() * 180) * speedFactor));
			}

			await new Promise((r) => setTimeout(r, 900 + Math.random() * 2200));
			if (Math.random() < 0.4) {
				displayedLines = [];
				await new Promise((r) => setTimeout(r, 200 + Math.random() * 800));
			}
		}
	}

	onMount(() => {
		typeCodeLoop();
	});

	onDestroy(() => {
		cancelled = true;
	});
</script>

<div
	class="mirror-code"
	class:hardness-soft={hardness === 'soft'}
	class:hardness-medium={hardness === 'medium'}
	class:hardness-hard={hardness === 'hard'}
	style="--code-oy: {offsetY}; --code-ox: {offsetX}; --code-scale: {scale}; --code-op: {opacity}; --code-contrast: {contrast}; --code-weight: {fontWeight}; --code-blend: {blend}; --code-shadow: {shadow};"
	aria-hidden="true"
>
	<div class="mirror-code__inner">
		{#each displayedLines as line, index}
			<div class="code-line">
				<span class="line-number">{index + 1}</span>
				<span class="line-content">
					{#each line as frag}
						<span class={frag.type}>{frag.text}</span>
					{/each}
					{#if showCursor && index === displayedLines.length - 1}
						<span class="code-cursor">|</span>
					{/if}
				</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.mirror-code {
		position: relative;
		flex: 0 0 auto;
		height: 100%;
		width: var(--tile-w, 28vh);
		overflow: hidden;
		background: transparent;
		opacity: var(--code-op, 0.75);
		mix-blend-mode: var(--code-blend, soft-light);
		filter: contrast(var(--code-contrast, 1.2));
	}

	.mirror-code__inner {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 6% 8%;
		font-family: 'Fira Code', 'Fira Mono', Consolas, monospace;
		font-size: clamp(12px, 1.5vw, 24px);
		font-weight: var(--code-weight, 500);
		line-height: 1.4;
		text-align: left;
		color: #e0e0e0;
		overflow: hidden;
		transform: translate(var(--code-ox, 0), var(--code-oy, 0)) scale(var(--code-scale, 1));
		transform-origin: top left;
		will-change: transform;
		text-shadow: var(--code-shadow, none);
	}

	.hardness-hard .mirror-code__inner {
		color: #f2f2f2;
	}

	.hardness-soft .mirror-code__inner {
		color: #b0b0b0;
	}

	.code-line {
		display: flex;
		white-space: pre;
		margin: 0;
	}

	.line-number {
		width: 2.2em;
		flex-shrink: 0;
		color: #5a5a5a;
		text-align: right;
		padding-right: 0.6em;
		font-variant-numeric: tabular-nums;
	}

	.hardness-hard .line-number {
		color: #888;
	}

	.line-content {
		flex: 1;
		min-width: 0;
	}

	.code-cursor {
		color: #fff;
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	:global(.mirror-code .keyword) {
		color: #f0f0f0;
	}
	:global(.mirror-code .function) {
		color: #dddddd;
	}
	:global(.mirror-code .string) {
		color: #b8b8b8;
	}
	:global(.mirror-code .number) {
		color: #c8c8c8;
	}
	:global(.mirror-code .variable) {
		color: #d4d4d4;
	}
	:global(.mirror-code .comment) {
		color: #7a7a7a;
		font-style: italic;
	}
	:global(.mirror-code .property),
	:global(.mirror-code .type),
	:global(.mirror-code .object) {
		color: #c0c0c0;
	}
	:global(.mirror-code .paren),
	:global(.mirror-code .brace),
	:global(.mirror-code .operator),
	:global(.mirror-code .text) {
		color: #a8a8a8;
	}
	:global(.mirror-code .method) {
		color: #cecece;
	}
</style>
