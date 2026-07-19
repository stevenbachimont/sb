<script lang="ts">
	import { onMount } from 'svelte';

	let cursorEl: HTMLDivElement;
	/** default | compact (navbar / liens) | explore (banner) */
	let mode: 'default' | 'compact' | 'explore' = 'default';
	let click = false;

	function getMode(el: EventTarget | null): 'default' | 'compact' | 'explore' {
		if (!(el instanceof Element)) return 'default';

		/* Zones « explorer » uniquement */
		if (el.closest('.banner, .mirror-wrapp')) {
			return 'explore';
		}

		/* Navbar / liens : rester petit, se resserrer au survol */
		if (
			el.closest(
				'.header a, .header-brand, .header-item, .header-burger, .header-title, .header, .site-footer a, a, button, [role="button"], input, textarea, select, label'
			)
		) {
			return 'compact';
		}

		return 'default';
	}

	onMount(() => {
		/* Pas de curseur custom sur tactile / mobile */
		const fine = window.matchMedia('(pointer: fine)').matches;
		const hover = window.matchMedia('(hover: hover)').matches;
		if (!fine || !hover || window.innerWidth <= 768) {
			cursorEl.style.display = 'none';
			document.documentElement.classList.remove('has-site-cursor');
			return;
		}

		document.documentElement.classList.add('has-site-cursor');

		const onMove = (e: MouseEvent) => {
			cursorEl.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
			mode = getMode(e.target);
		};
		const onDown = () => {
			click = true;
		};
		const onUp = () => {
			click = false;
		};

		document.addEventListener('mousemove', onMove, { passive: true });
		document.addEventListener('mousedown', onDown);
		document.addEventListener('mouseup', onUp);

		return () => {
			document.documentElement.classList.remove('has-site-cursor');
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mousedown', onDown);
			document.removeEventListener('mouseup', onUp);
		};
	});
</script>

<div
	class="cursor"
	class:compact={mode === 'compact'}
	class:watch={mode === 'explore'}
	class:click
	bind:this={cursorEl}
	aria-hidden="true"
>
	<span class="cursor-label">
		explorer
		<svg viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path
				d="M10.1047 6.08511L11 7.05319L5.5 13L1.02459e-06 7.05319L0.895301 6.08511L4.86046 10.3723L4.86046 -1.02689e-06L6.13953 -1.01163e-06L6.13953 10.3723L10.1047 6.08511Z"
				fill="white"
			/>
		</svg>
	</span>
</div>
