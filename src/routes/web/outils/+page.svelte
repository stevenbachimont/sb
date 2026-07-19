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
	<h1 class="site-page__title">Outils & Technologies</h1>
	<p class="site-page__lead">La boîte à outils — frontend, backend, infra.</p>

	<div class="cols">
		<div>
			<h3>Frontend</h3>
			<ul>
				<li>SvelteKit — expert</li>
				<li>React — avancé</li>
				<li>Vue.js — intermédiaire</li>
				<li>TypeScript — intermédiaire</li>
			</ul>
		</div>
		<div>
			<h3>Backend</h3>
			<ul>
				<li>Node.js — avancé</li>
				<li>Express — avancé</li>
				<li>MySQL / SQLite</li>
			</ul>
		</div>
		<div>
			<h3>Outils</h3>
			<ul>
				<li>Docker</li>
				<li>Git / GitHub</li>
				<li>Vite</li>
			</ul>
		</div>
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

	.cols {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.4rem;
		margin-top: 0.35rem;
	}

	h3 {
		font-size: 0.16rem;
		text-transform: uppercase;
		font-weight: 400;
		margin: 0 0 0.15rem;
		color: #fff;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		font-size: 0.14rem;
		opacity: 0.85;
		margin-bottom: 0.08rem;
		color: #fff;
	}

	@media (max-width: 700px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
</style>
