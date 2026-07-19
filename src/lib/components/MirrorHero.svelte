<script lang="ts">
	/**
	 * Port ultra-fidèle de Desktop/test (Wonderland mirror + GSAP)
	 * + code asynchrone par tuile (CodeTile)
	 * + mobile : inclinaison du téléphone à la place de la souris
	 */
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import CodeTile from '$lib/components/CodeTile.svelte';
	import {
		prefersMotionPointer,
		requestOrientationPermission,
		subscribeDeviceMotion,
		orientationSupported
	} from '$lib/utils/deviceMotion';

	const PHOTO = '/background/moi.jpg';
	const TILE_COUNT = 6;
	const HARDNESS: Array<'soft' | 'medium' | 'hard'> = [
		'soft',
		'medium',
		'soft',
		'medium',
		'soft',
		'hard'
	];

	let rootEl: HTMLDivElement;
	let mirrorElements: Element[] = [];
	let isMobileMotion = false;
	let menuOpen = false;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function closeMenuOnBackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			menuOpen = false;
		}
	}

	onMount(() => {
		const banner = rootEl.querySelector('.banner') as HTMLElement;
		const hero = rootEl.querySelector('#hero') as HTMLElement;
		const bottomInfo = rootEl.querySelector('#bottom-info') as HTMLElement;

		const overs = () => Array.from(rootEl.querySelectorAll('.mirror-over'));
		const codeBehind = () => rootEl.querySelectorAll('.code-over__behind');
		const codeWeave = () => rootEl.querySelectorAll('.code-over__weave');
		const codeSlip = () => rootEl.querySelectorAll('.code-over__slip');
		const codeFront = () => rootEl.querySelectorAll('.code-over__front');
		const codeOvers = () => Array.from(rootEl.querySelectorAll('.code-over'));
		const lightsLeft = () => Array.from(rootEl.querySelectorAll('.mirror-img__left .mirror-light'));
		const lightsRight = () => Array.from(rootEl.querySelectorAll('.mirror-img__right .mirror-light'));
		const codeBase = () => rootEl.querySelectorAll('.banner-code-layer--base');
		const photoEls = () => rootEl.querySelectorAll('.banner-img img, .mirror img');

		let mirrorTween: gsap.core.Timeline | null = null;

		function animateMirror(clientX: number, movementX: number) {
			if (!Number.isFinite(clientX) || !Number.isFinite(movementX)) return;
			const width = window.innerWidth || 1;
			const procentLight = Math.min(
				Math.max((Math.floor((clientX / width) * 100) - 20) * 2, 0) - 100,
				0
			);
			const t = Math.min(Math.max(clientX / width, 0), 1);
			const codeAlpha = 0.55 + Math.sin(t * Math.PI) * 0.4;
			const photoAlpha = 0.45 + (1 - codeAlpha) * 0.55;
			const dir = movementX < 0 ? -1 : 1;

			try {
				mirrorTween?.kill();
			} catch {
				/* ignore */
			}

			mirrorTween = gsap
				.timeline({ defaults: { ease: 'power1.out', overwrite: 'auto' } })
				.to(overs(), {
					duration: 1,
					x: clientX / 7,
					stagger: movementX < 0 ? -0.2 : 0.2,
					ease: 'power1.out'
				})
				.to(
					overs(),
					{
						duration: 0.5,
						alpha: 0.9,
						stagger: movementX < 0 ? -0.17 : 0.17,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					overs(),
					{
						duration: 0.5,
						alpha: 1,
						stagger: movementX < 0 ? -0.2 : 0.2,
						ease: 'power1.out'
					},
					'<0.5'
				)
				/* Croisement : vitesses scindées pour passer derrière / devant les bandes */
				.to(
					codeBehind(),
					{
						duration: 1.2,
						x: -clientX / 6.2,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					codeWeave(),
					{
						duration: 1.15,
						x: -clientX / 9.5,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					codeSlip(),
					{
						duration: 1.25,
						/* légèrement avec l’image → glisse sous la bande droite */
						x: clientX / 22 - clientX / 14,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					codeFront(),
					{
						duration: 1.1,
						x: -clientX / 11,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					codeOvers(),
					{
						duration: 0.55,
						alpha: 0.72 + t * 0.22,
						stagger: dir * 0.12,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					codeBase(),
					{
						duration: 1.2,
						x: clientX / 16,
						y: (0.5 - t) * 10,
						opacity: codeAlpha * 0.92,
						ease: 'power2.out'
					},
					'<'
				)
				.to(
					photoEls(),
					{
						duration: 1,
						opacity: photoAlpha,
						ease: 'sine.inOut'
					},
					'<'
				)
				.to(
					lightsLeft(),
					{
						duration: 0.7,
						x: procentLight,
						stagger: movementX < 0 ? -0.1 : 0.1
					},
					'<-0.2'
				)
				.to(
					lightsRight(),
					{
						duration: 0.7,
						x: -procentLight,
						stagger: movementX < 0 ? -0.1 : 0.1
					},
					'<-0.2'
				);
		}

		function setWidthMirror() {
			const wraps = rootEl.querySelectorAll('.mirror-wrapp');
			wraps.forEach((mirror) => {
				const widthMirror = (mirror as HTMLElement).offsetWidth + 'px';
				mirror.querySelectorAll('.mirror img').forEach((mirrorImg) => {
					(mirrorImg as HTMLImageElement).style.width = widthMirror;
				});
			});

			/* Aligner la largeur des tuiles code sur celle des tuiles image */
			const tile = rootEl.querySelector('.banner-img--repeat img') as HTMLImageElement | null;
			if (tile && tile.offsetWidth > 0) {
				rootEl.style.setProperty('--tile-w', `${tile.offsetWidth}px`);
			}
		}

		setWidthMirror();
		window.addEventListener('resize', setWidthMirror);
		rootEl.querySelectorAll('.banner-img--repeat img').forEach((img) => {
			img.addEventListener('load', setWidthMirror);
		});

		/** Interaction miroir : souris (desktop) ou inclinaison (mobile) */
		let hoveringBanner = false;
		let stopMotion: (() => void) | null = null;
		let motionStarted = false;
		isMobileMotion = prefersMotionPointer();
		if (isMobileMotion) {
			rootEl.classList.add('is-mobile-motion');
		}

		const onBannerMove = (e: MouseEvent) => {
			if (isMobileMotion) return;
			if (hoveringBanner || banner.classList.contains('active')) {
				animateMirror(e.clientX, e.movementX);
			}
		};

		const startMotionTracking = () => {
			if (motionStarted || !isMobileMotion) return;
			motionStarted = true;
			try {
				stopMotion = subscribeDeviceMotion(({ xNorm, movementX }) => {
					/* Uniquement hero ouvert — sinon flood GSAP et crash mobile */
					if (!banner.classList.contains('active')) return;
					const clientX = xNorm * window.innerWidth;
					try {
						animateMirror(clientX, movementX);
					} catch {
						/* ignore frame errors */
					}
				});
			} catch {
				motionStarted = false;
				return;
			}
			gsap.to(rootEl.querySelectorAll('.wonderland-full'), {
				alpha: 0,
				ease: 'sine.in',
				duration: 0.4
			});
		};

		const enableMotionFromGesture = async () => {
			if (!isMobileMotion || motionStarted) return;
			if (!orientationSupported()) return;
			try {
				const state = await requestOrientationPermission();
				if (state === 'granted') {
					startMotionTracking();
				}
			} catch {
				/* permission / API crash — on ignore le gyro */
			}
		};

		const expandHero = () => {
			if (hero.classList.contains('full')) return;

			hero.classList.add('full');
			bottomInfo.classList.add('scroll');

			gsap
				.timeline({
					defaults: { ease: 'none' }
				})
				.to(rootEl.querySelectorAll('.wonderland-descr'), {
					scaleY: 0,
					alpha: 0,
					ease: 'sine.in',
					transformOrigin: 'top',
					duration: 0.8
				})
				.to(
					rootEl.querySelectorAll('.wonderland-full'),
					{
						scaleY: 0,
						alpha: 0,
						ease: 'sine.in',
						transformOrigin: 'top',
						duration: 0.8
					},
					'<'
				)
				.to(
					overs(),
					{
						duration: 2,
						x: 0,
						alpha: 1,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					codeOvers(),
					{
						duration: 2,
						x: 0,
						alpha: 0.9,
						ease: 'power1.out'
					},
					'<'
				)
				.call(() => {
					banner.classList.add('active');
					mirrorElements = [banner];
					setWidthMirror();
				});
		};

		const collapseHero = () => {
			if (!hero.classList.contains('full')) return;

			hero.classList.remove('full');
			bottomInfo.classList.remove('scroll');
			banner.classList.remove('active');
			mirrorElements = [];

			gsap
				.timeline({
					defaults: { ease: 'none' }
				})
				.to(
					overs(),
					{
						duration: 2,
						x: '-10%',
						alpha: 0.7,
						overwrite: true,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					codeOvers(),
					{
						duration: 2,
						x: '8%',
						alpha: 0.65,
						overwrite: true,
						ease: 'power1.out'
					},
					'<'
				)
				.to(
					rootEl.querySelectorAll('.wonderland-descr'),
					{
						scaleY: 1,
						alpha: 1,
						ease: 'sine.in',
						transformOrigin: 'top',
						duration: 0.5
					},
					'<+0.5'
				)
				.to(
					rootEl.querySelectorAll('.wonderland-full'),
					{
						scaleY: isMobileMotion && motionStarted ? 0 : 1,
						alpha: isMobileMotion && motionStarted ? 0 : 1,
						ease: 'sine.in',
						transformOrigin: 'top',
						duration: 0.5
					},
					'<'
				)
				.to(
					lightsLeft(),
					{
						duration: 0.7,
						x: '-100%',
						stagger: 0.1
					},
					'<'
				)
				.to(
					lightsRight(),
					{
						duration: 0.7,
						x: '100%',
						stagger: 0.1
					},
					'<'
				);
		};

		const onBannerClick = async () => {
			if (hero.classList.contains('full')) {
				collapseHero();
				return;
			}
			await enableMotionFromGesture();
			expandHero();
		};

		const onEnter = () => {
			if (isMobileMotion) return;
			hoveringBanner = true;
			if (!hero.classList.contains('full')) {
				gsap.to(rootEl.querySelectorAll('.wonderland-full'), {
					alpha: 0,
					ease: 'sine.in',
					duration: 0.4
				});
			}
		};

		const onLeave = () => {
			if (isMobileMotion) return;
			hoveringBanner = false;
			if (!hero.classList.contains('full')) {
				gsap.to(rootEl.querySelectorAll('.wonderland-full'), {
					alpha: 1,
					ease: 'sine.in',
					duration: 0.4
				});
			}
		};

		banner.addEventListener('click', onBannerClick);
		banner.addEventListener('mouseenter', onEnter);
		banner.addEventListener('mouseleave', onLeave);
		banner.addEventListener('mousemove', onBannerMove, true);

		return () => {
			window.removeEventListener('resize', setWidthMirror);
			banner.removeEventListener('click', onBannerClick);
			banner.removeEventListener('mouseenter', onEnter);
			banner.removeEventListener('mouseleave', onLeave);
			banner.removeEventListener('mousemove', onBannerMove, true);
			stopMotion?.();
			try {
				mirrorTween?.kill();
			} catch {
				/* ignore */
			}
		};
	});
</script>

<div class="mirror-hero-root" class:is-mobile-motion={isMobileMotion} bind:this={rootEl}>
	<header class="header">
		<a href="/" class="header-brand" on:click={closeMenu}>
			<h1 class="header-title">Steven Bachimont</h1>
		</a>
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
	<nav
		class="header-menu"
		class:is-open={menuOpen}
		aria-label="Navigation principale"
		on:click={closeMenuOnBackdrop}
	>
		<a href="/#about-section" class="header-item" on:click={closeMenu}>about</a>
		<a href="/web" class="header-item" on:click={closeMenu}>works</a>
		<a href="/contact" class="header-item" on:click={closeMenu}>contact</a>
	</nav>

	<div class="main">
		<div class="smooth-wrapper">
			<div id="smooth-content">
				<section id="hero" class="hero">
					<div class="wonderland">
						<button class="wonderland-full" type="button" tabindex="-1" aria-hidden="true"></button>
					</div>

					<div class="banner mirror-wrapp">
						<div class="banner-img banner-img--repeat">
							{#each Array(6) as _}
								<img src={PHOTO} alt="" />
							{/each}
						</div>
						<div class="mirror">
							<div class="mirror-main">
								<div class="mirror-item mirror-left">
									<div class="mirror-img mirror-img__mask">
										<img src={PHOTO} alt="" />
									</div>
									<div class="mirror-img">
										<img src={PHOTO} alt="" />
									</div>
								</div>
								<div class="mirror-item mirror-center">
									<div class="mirror-img mirror-img__mask">
										<img src={PHOTO} alt="" />
									</div>
									<div class="mirror-img">
										<img src={PHOTO} alt="" />
									</div>
								</div>
								<div class="mirror-item mirror-right">
									<div class="mirror-img mirror-img__mask">
										<img src={PHOTO} alt="" />
									</div>
									<div class="mirror-img">
										<img src={PHOTO} alt="" />
									</div>
								</div>
							</div>
							<!-- Base code au-dessus du miroir principal, sous les bandes -->
							<div class="banner-code-stack banner-code-stack--base" aria-hidden="true">
								<div class="banner-code-layer banner-code-layer--base banner-code-layer--repeat">
									{#each Array(TILE_COUNT) as _, colIndex}
										<CodeTile
											showCursor={colIndex % 2 === 0}
											hardness={HARDNESS[colIndex % HARDNESS.length]}
										/>
									{/each}
								</div>
							</div>
							<!-- Code entrelacé aux bandes image (z-index croisés) -->
							<div class="mirror-additional" aria-hidden="true">
								<div class="code-over code-over__behind">
									<CodeTile showCursor={false} hardness="soft" />
									<CodeTile showCursor={false} hardness="medium" />
								</div>
								<div class="mirror-item mirror-over mirror-over__left">
									<div class="mirror-img mirror-img__left">
										<img src={PHOTO} alt="" />
										<div class="mirror-light"></div>
									</div>
									<div class="mirror-img mirror-img__main">
										<img src={PHOTO} alt="" />
									</div>
									<div class="mirror-img mirror-img__right">
										<img src={PHOTO} alt="" />
										<div class="mirror-light"></div>
									</div>
								</div>
								<div class="code-over code-over__weave">
									<CodeTile showCursor={true} hardness="medium" />
								</div>
								<div class="mirror-item mirror-over mirror-over__center">
									<div class="mirror-img mirror-img__left">
										<img src={PHOTO} alt="" />
										<div class="mirror-light"></div>
									</div>
									<div class="mirror-img mirror-img__main">
										<img src={PHOTO} alt="" />
									</div>
									<div class="mirror-img mirror-img__right">
										<img src={PHOTO} alt="" />
										<div class="mirror-light"></div>
									</div>
								</div>
								<div class="code-over code-over__slip">
									<CodeTile showCursor={false} hardness="soft" />
								</div>
								<div class="mirror-item mirror-over mirror-over__right">
									<div class="mirror-img mirror-img__left">
										<img src={PHOTO} alt="" />
										<div class="mirror-light"></div>
									</div>
									<div class="mirror-img mirror-img__main">
										<img src={PHOTO} alt="" />
									</div>
									<div class="mirror-img mirror-img__right">
										<img src={PHOTO} alt="" />
										<div class="mirror-light"></div>
									</div>
								</div>
								<div class="code-over code-over__front">
									<CodeTile showCursor={false} hardness="soft" />
									<CodeTile showCursor={false} hardness="hard" />
								</div>
							</div>
						</div>
						<div class="banner-info">
							<div class="banner-title banner-title--desk">Photo.code_dev</div>
							<div class="banner-left">
								<img src={PHOTO} alt="" />
								<div class="banner-title banner-title--mobile">Photo.code_dev</div>
								<div class="banner-social">
									<a
										href="https://github.com/stevenbachimont"
										class="banner-social__item"
										target="_blank"
										rel="noopener noreferrer"
										on:click|stopPropagation>GitHub</a
									>
									<a
										href="https://laligneargentique.fr"
										class="banner-social__item"
										target="_blank"
										rel="noopener noreferrer"
										on:click|stopPropagation>La Ligne</a
									>
									<a href="/contact" class="banner-social__item" on:click|stopPropagation>Contact</a>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="bottom-info" class="bottom-info" aria-hidden="true">
					<div class="wonderland-line line-stroke bottom-marquee">
						<div class="line-stroke__wrapp">
							<div class="line-stroke__item line-stroke__1">
								<div>photographie / code / argentique / développement /</div>
								<div>photographie / code / argentique / développement /</div>
								<div>photographie / code / argentique / développement /</div>
							</div>
							<div class="line-stroke__item line-stroke__2">
								<div>photographie / code / argentique / développement /</div>
								<div>photographie / code / argentique / développement /</div>
								<div>photographie / code / argentique / développement /</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</div>
