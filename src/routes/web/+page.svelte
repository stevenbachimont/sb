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
	<h1 class="site-page__title">Développement Web</h1>
	<p class="site-page__lead">
		Projets, outils et technologies — le code comme matière, comme le grain de l’argentique.
	</p>

	<div class="web-links">
		<a href="/web/portfolioWeb">Portfolio Web →</a>
		<a href="/web/outils">Outils & Technologies →</a>
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

	.web-links {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin-top: 0.4rem;
	}

	.web-links a {
		font-size: 0.22rem;
		text-transform: uppercase;
		color: #fff;
		text-decoration: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding-bottom: 0.12rem;
		max-width: 5rem;
	}

	.web-links a:hover {
		opacity: 0.7;
		transform: none;
	}

	@media (max-width: 768px) {
		.web-links a {
			font-size: 0.2rem;
			max-width: none;
		}
	}
</style>
