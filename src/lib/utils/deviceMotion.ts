export type MotionSample = {
	/** Position X normalisée 0–1 (gauche → droite) */
	xNorm: number;
	/** Delta horizontal approximatif (px viewport) pour le stagger GSAP */
	movementX: number;
};

type OrientationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
}

/** true si on privilégie le gyro plutôt que la souris */
export function prefersMotionPointer(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		window.matchMedia('(pointer: coarse)').matches ||
		window.matchMedia('(hover: none)').matches ||
		window.innerWidth <= 768
	);
}

export function orientationSupported(): boolean {
	return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

export async function requestOrientationPermission(): Promise<OrientationPermissionState> {
	if (!orientationSupported()) return 'unsupported';

	const DOE = DeviceOrientationEvent as unknown as {
		requestPermission?: () => Promise<'granted' | 'denied'>;
	};

	if (typeof DOE.requestPermission === 'function') {
		try {
			const state = await DOE.requestPermission();
			return state === 'granted' ? 'granted' : 'denied';
		} catch {
			return 'denied';
		}
	}

	return 'granted';
}

/**
 * Écoute l’inclinaison du téléphone et renvoie une position X utilisable
 * comme un clientX souris (parallaxe miroir).
 *
 * gamma : inclinaison gauche/droite (−90…90)
 * beta  : légère contribution avant/arrière pour enrichir le geste
 */
export function subscribeDeviceMotion(
	onSample: (sample: MotionSample) => void,
	options: { gammaRange?: number } = {}
): () => void {
	const range = options.gammaRange ?? 32;
	let lastXNorm = 0.5;
	let raf = 0;
	let pending: MotionSample | null = null;

	const flush = () => {
		raf = 0;
		if (!pending) return;
		try {
			onSample(pending);
		} catch {
			/* ignore callback errors */
		}
		pending = null;
	};

	const onOrientation = (e: DeviceOrientationEvent) => {
		try {
			const gamma = typeof e.gamma === 'number' ? e.gamma : 0;
			const beta = typeof e.beta === 'number' ? e.beta : 0;
			/* beta centré autour de ~45° (téléphone tenu devant soi) */
			const betaOffset = clamp((beta - 45) / 50, -1, 1);
			const tilt = clamp(gamma / range + betaOffset * 0.18, -1, 1);
			const xNorm = clamp((tilt + 1) / 2, 0, 1);
			const movementX =
				(xNorm - lastXNorm) * (typeof window !== 'undefined' ? window.innerWidth || 1 : 1);
			lastXNorm = xNorm;
			pending = { xNorm, movementX };
			if (!raf) raf = requestAnimationFrame(flush);
		} catch {
			/* ignore bad orientation samples */
		}
	};

	window.addEventListener('deviceorientation', onOrientation, { passive: true });

	return () => {
		window.removeEventListener('deviceorientation', onOrientation);
		if (raf) cancelAnimationFrame(raf);
	};
}
