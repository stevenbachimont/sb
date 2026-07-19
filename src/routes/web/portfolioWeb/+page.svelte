<script lang="ts">
	import { onMount } from 'svelte';

	let isVisible = false;

	onMount(() => {
		setTimeout(() => {
			isVisible = true;
		}, 80);
	});
</script>

<section class="site-page" class:is-visible={isVisible}>
	<h1 class="site-page__title">Portfolio Web</h1>
	<p class="site-page__lead">
		Projets de développement — bientôt répertoriés ici. Patience.
	</p>

	<div class="tech-stack">
		<span>SvelteKit</span>
		<span>TypeScript</span>
		<span>React</span>
		<span>Node.js</span>
		<span>Docker</span>
	</div>
</section>

<style>
	.site-page {
		opacity: 0;
		transform: translateY(0.15rem);
		transition:
			opacity 0.8s ease,
			transform 0.8s ease;
	}

	.site-page.is-visible {
		opacity: 1;
		transform: none;
	}

	.tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.35rem;
		margin-top: 0.4rem;
		font-size: 0.14rem;
		text-transform: uppercase;
		opacity: 0.75;
	}
</style>
