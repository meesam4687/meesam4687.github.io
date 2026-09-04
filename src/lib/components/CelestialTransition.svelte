<script>
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte.js';

	let active = $state(false);

	/**
	 * @typedef {Object} CelestialBodyState
	 * @property {'sun' | 'moon'} type
	 * @property {number} x
	 * @property {number} y
	 * @property {number} scale
	 * @property {number} rotation
	 */

	/** @type {CelestialBodyState | null} */
	let bodyA = $state(null);
	/** @type {CelestialBodyState | null} */
	let bodyB = $state(null);

	/** @type {number | undefined} */
	let animFrame;

	/**
	 * @param {number} t
	 * @returns {number}
	 */
	function easeOutCubic(t) {
		return 1 - Math.pow(1 - t, 3);
	}

	/**
	 * @param {number} t
	 * @returns {number}
	 */
	function easeInQuad(t) {
		return t * t;
	}

	$effect(() => {
		if (theme.isAnimating && theme.animationData && !active) {
			startCelestialFlight(theme.animationData);
		}
	});

	/**
	 * @param {import('$lib/theme.svelte.js').AnimationData} data
	 */
	function startCelestialFlight(data) {
		active = true;
		const { from, to, origin } = data;
		const w = window.innerWidth;
		const h = window.innerHeight;

		theme.applyTheme(to);

		const cx = w * 0.45;
		const cy = h * 0.75;
		const radius = Math.hypot(origin.x - cx, origin.y - cy);
		const dockAngle = Math.atan2(origin.y - cy, origin.x - cx);

		const sweep = 2.2;

		const startTime = performance.now();
		const departDuration = 600;
		const arriveStart = 350;
		const arriveDuration = 650;
		const totalDuration = arriveStart + arriveDuration;

		let hasDepartedOutOfBounds = false;

		/**
		 * @param {number} now
		 */
		function step(now) {
			const elapsed = now - startTime;

			if (!hasDepartedOutOfBounds && elapsed <= departDuration) {
				const p = Math.min(elapsed / departDuration, 1);
				const ease = easeInQuad(p);
				
				const currentAngle = dockAngle - ease * sweep;
				const x = cx + radius * Math.cos(currentAngle);
				const y = cy + radius * Math.sin(currentAngle);

				const scale = 1 + ease * 3.5;
				const iconSize = 22 * scale;

				const isOutOfBounds = (
					x < -iconSize ||
					x > w + iconSize ||
					y < -iconSize ||
					y > h + iconSize ||
					p >= 1
				);

				if (isOutOfBounds) {
					hasDepartedOutOfBounds = true;
					bodyA = null;
				} else {
					bodyA = {
						type: from === 'light' ? 'sun' : 'moon',
						x,
						y,
						scale,
						rotation: ease * 90
					};
				}
			} else {
				bodyA = null;
			}

			if (elapsed >= arriveStart && elapsed < totalDuration) {
				const p = Math.min((elapsed - arriveStart) / arriveDuration, 1);
				const ease = easeOutCubic(p);

				const currentAngle = (dockAngle + sweep) - ease * sweep;
				const x = cx + radius * Math.cos(currentAngle);
				const y = cy + radius * Math.sin(currentAngle);

				const scale = 4.5 - ease * 3.5;

				bodyB = {
					type: to === 'light' ? 'sun' : 'moon',
					x,
					y,
					scale,
					rotation: (1 - ease) * -90
				};
			}

			if (elapsed < totalDuration) {
				animFrame = requestAnimationFrame(step);
			} else {
				bodyA = null;
				bodyB = null;
				active = false;
				theme.finishAnimation();
			}
		}

		animFrame = requestAnimationFrame(step);
	}

	onMount(() => {
		return () => {
			if (animFrame) cancelAnimationFrame(animFrame);
		};
	});
</script>

{#if active && theme.animationData}
	<div class="celestial-overlay" aria-hidden="true">
		{#if bodyA}
			<div
				class="celestial-actor {bodyA.type}"
				style="
					transform: translate3d({bodyA.x}px, {bodyA.y}px, 0) translate(-50%, -50%) scale({bodyA.scale}) rotate({bodyA.rotation}deg);
				"
			>
				{#if bodyA.type === 'sun'}
					<svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="4"></circle>
						<path d="M12 2v2"></path>
						<path d="M12 20v2"></path>
						<path d="m4.93 4.93 1.41 1.41"></path>
						<path d="m17.66 17.66 1.41 1.41"></path>
						<path d="M2 12h2"></path>
						<path d="M20 12h2"></path>
						<path d="m6.34 17.66-1.41 1.41"></path>
						<path d="m19.07 4.93-1.41 1.41"></path>
					</svg>
				{:else}
					<svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
					</svg>
				{/if}
			</div>
		{/if}

		{#if bodyB}
			<div
				class="celestial-actor {bodyB.type}"
				style="
					transform: translate3d({bodyB.x}px, {bodyB.y}px, 0) translate(-50%, -50%) scale({bodyB.scale}) rotate({bodyB.rotation}deg);
				"
			>
				{#if bodyB.type === 'sun'}
					<svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="4"></circle>
						<path d="M12 2v2"></path>
						<path d="M12 20v2"></path>
						<path d="m4.93 4.93 1.41 1.41"></path>
						<path d="m17.66 17.66 1.41 1.41"></path>
						<path d="M2 12h2"></path>
						<path d="M20 12h2"></path>
						<path d="m6.34 17.66-1.41 1.41"></path>
						<path d="m19.07 4.93-1.41 1.41"></path>
					</svg>
				{:else}
					<svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
					</svg>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.celestial-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 9999;
		overflow: hidden;
	}

	.celestial-actor {
		position: absolute;
		top: 0;
		left: 0;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		will-change: transform;
	}

	.theme-icon {
		width: 22px;
		height: 22px;
		stroke-width: 2.2;
	}

	.sun-icon {
		color: #f59e0b;
		fill: rgba(245, 158, 11, 0.15);
	}

	.moon-icon {
		color: #95b7ed;
		fill: rgba(149, 183, 237, 0.2);
	}
</style>
