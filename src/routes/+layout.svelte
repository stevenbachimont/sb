<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import SiteCursor from '$lib/components/SiteCursor.svelte';

	let pageLoaded = false;
	let menuOpen = false;

	/** @type {boolean} */
	$: isHome = $page.url.pathname === '/';

	$: if ($page.url.pathname) {
		menuOpen = false;
	}

	onMount(() => {
		setTimeout(() => {
			pageLoaded = true;
		}, 600);
	});

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<svelte:head>
	{#if menuOpen}
		<style>
			body {
				overflow: hidden;
			}
		</style>
	{/if}
</svelte:head>

<div class="page-loader" class:fade-out={pageLoaded}></div>
<SiteCursor />

<div class="site" class:fade-in={pageLoaded}>
	{#if !isHome}
		<header class="header">
			<a href="/" class="header-brand" on:click={closeMenu}>
				<span class="header-title">Steven Bachimont</span>
			</a>
			<nav class="header-menu" class:is-open={menuOpen} aria-label="Navigation principale">
				<a href="/#about-section" class="header-item" on:click={closeMenu}>about</a>
				<a href="/web" class="header-item" on:click={closeMenu}>works</a>
				<a href="/contact" class="header-item" on:click={closeMenu}>contact</a>
			</nav>
			<button
				type="button"
				class="header-burger"
				class:is-open={menuOpen}
				aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
				aria-expanded={menuOpen}
				on:click={toggleMenu}
			>
				<span></span>
				<span></span>
			</button>
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
		min-height: 100dvh;
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
</style>
