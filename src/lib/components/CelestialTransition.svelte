<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';
	import clearDay from '$lib/assets/clear-day.svg';
	import clearNight from '$lib/assets/clear-night.svg';

	interface CelestialBodyState {
		type: 'sun' | 'moon';
		x: number;
		y: number;
		scale: number;
		rotation: number;
	}

	let active = $state(false);
	let bodyA = $state<CelestialBodyState | null>(null);
	let bodyB = $state<CelestialBodyState | null>(null);
	let animFrame: number | undefined;

	function easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	function easeInQuad(t: number): number {
		return t * t;
	}

	$effect(() => {
		if (theme.isAnimating && theme.animationData && !active) {
			startCelestialFlight(theme.animationData);
		}
	});

	function startCelestialFlight(data: { from: 'light' | 'dark'; to: 'light' | 'dark'; origin: { x: number; y: number } }) {
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

		function step(now: number) {
			const elapsed = now - startTime;

			if (!hasDepartedOutOfBounds && elapsed <= departDuration) {
				const p = Math.min(elapsed / departDuration, 1);
				const ease = easeInQuad(p);
				const currentAngle = dockAngle - ease * sweep;
				const x = cx + radius * Math.cos(currentAngle);
				const y = cy + radius * Math.sin(currentAngle);
				const scale = 1 + ease * 3.5;
				const iconSize = 26 * scale;

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
					<img src={clearDay} alt="" class="theme-icon sun-icon" />
				{:else}
					<img src={clearNight} alt="" class="theme-icon moon-icon" />
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
					<img src={clearDay} alt="" class="theme-icon sun-icon" />
				{:else}
					<img src={clearNight} alt="" class="theme-icon moon-icon" />
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
		width: 26px;
		height: 26px;
		display: flex;
		align-items: center;
		justify-content: center;
		will-change: transform;
	}

	.theme-icon {
		width: 26px;
		height: 26px;
		object-fit: contain;
		display: block;
		pointer-events: none;
	}
</style>
