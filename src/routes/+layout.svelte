<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import SiteCursor from '$lib/components/SiteCursor.svelte';

	let pageLoaded = false;

	/** @type {boolean} */
	$: isHome = $page.url.pathname === '/';

	onMount(() => {
		setTimeout(() => {
			pageLoaded = true;
		}, 600);
	});
</script>

<div class="page-loader" class:fade-out={pageLoaded}></div>
<SiteCursor />

<div class="site" class:fade-in={pageLoaded}>
	{#if !isHome}
		<header class="header">
			<a href="/" class="header-brand">
				<span class="header-title">Steven Bachimont</span>
			</a>
			<div class="header-menu">
				<a href="/#about-section" class="header-item">about</a>
				<a href="/web" class="header-item">works</a>
				<a href="/contact" class="header-item">contact</a>
			</div>
			<a href="/web" class="header-burger" aria-label="Menu">
				<span></span>
				<span></span>
			</a>
		</header>
	{/if}

	<main class="site-main">
		<slot />
	</main>

	<footer class="site-footer">
		<div>
			<a href="/">Steven Bachimont</a>
			<span> / </span>
			<a href="/web">works</a>
			<span> / </span>
			<a href="/#about-section">about</a>
			<span> / </span>
			<a href="/contact">contact</a>
		</div>
		<div>
			<a href="https://github.com/stevenbachimont" target="_blank" rel="noopener noreferrer">GitHub</a>
			<span> / </span>
			<a href="https://laligneargentique.fr" target="_blank" rel="noopener noreferrer"
				>La Ligne Argentique</a
			>
		</div>
	</footer>
</div>

<style>
	.page-loader {
		position: fixed;
		inset: 0;
		background: #000;
		z-index: 10000;
		opacity: 1;
		transition: opacity 0.8s ease-out;
		pointer-events: none;
	}

	.page-loader.fade-out {
		opacity: 0;
	}

	.site {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: #000;
		opacity: 0;
		transition: opacity 0.8s ease-in;
	}

	.site.fade-in {
		opacity: 1;
	}

	.site-main {
		flex: 1;
		padding: 0;
		background: #000;
	}

	:global(.header-burger) {
		text-decoration: none;
	}
</style>
