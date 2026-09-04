<script lang="ts">
	import { onMount } from 'svelte';
	import borken from '$lib/assets/borken.jpg';

	interface TrailNode {
		id: number;
		x: number;
		y: number;
		opacity: number;
		scale: number;
	}

	interface TrailPoint {
		id: number;
		x: number;
		y: number;
		time: number;
	}

	let visible = $state(false);
	let isHovering = $state(false);
	let isClicking = $state(false);
	let isCharging = $state(false);
	let lockedIn = $state(false);
	let blownUp = $state(false);

	let mouseX = $state(-100);
	let mouseY = $state(-100);
	let displayX = $state(-100);
	let displayY = $state(-100);

	let currentSize = $state(24);
	let currentBoxShadow = $state('');
	let screenBrightness = $state(0);
	let flashOpacity = $state(0);
	let trailNodes = $state<TrailNode[]>([]);

	let animFrame: number | undefined;

	function getGlow(b1: number, b2: number, b3: number, b4: number, b5: number, inset: number, a4 = 0.75, a5 = 0.45): string {
		return `0 0 ${b1.toFixed(1)}px #ffffff, 0 0 ${b2.toFixed(1)}px rgba(255,255,255,0.95), 0 0 ${b3.toFixed(1)}px #95b7ed, 0 0 ${b4.toFixed(1)}px rgba(149,183,237,${a4}), 0 0 ${b5.toFixed(1)}px rgba(96,165,250,${a5}), inset 0 0 ${inset.toFixed(1)}px #ffffff`;
	}

	onMount(() => {
		const isDesktopFinePointer =
			window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
			window.innerWidth > 768;

		if (!isDesktopFinePointer) return;

		let trailHistory: TrailPoint[] = [];
		let pointCounter = 0;
		let lastSpawnPos = { x: -999, y: -999 };

		let isMouseDown = false;
		let holdStartTime = 0;
		let flashStartTime = 0;
		let frozenX = -100;
		let frozenY = -100;
		let holdDuration = 0;
		let lastTime = performance.now();

		function handleMouseMove(e: MouseEvent) {
			if (lockedIn) return;
			visible = true;
			mouseX = e.clientX;
			mouseY = e.clientY;

			if (!isCharging && Math.hypot(mouseX - lastSpawnPos.x, mouseY - lastSpawnPos.y) > 3) {
				lastSpawnPos = { x: mouseX, y: mouseY };
				trailHistory.push({
					id: ++pointCounter,
					x: mouseX,
					y: mouseY,
					time: performance.now()
				});
			}
		}

		function handleMouseDown(e: MouseEvent) {
			if (e.button !== 0 || lockedIn || blownUp) return;
			isMouseDown = true;
			holdStartTime = performance.now();
			isClicking = true;
		}

		function handleMouseUp(e: MouseEvent) {
			if (e.button !== 0) return;
			isClicking = false;
			if (lockedIn) return;
			isMouseDown = false;
		}

		function handleMouseLeave() {
			visible = false;
			if (!lockedIn) {
				isMouseDown = false;
				isClicking = false;
			}
		}

		function handleMouseEnter() {
			if (!blownUp) visible = true;
		}

		function checkHoverTarget(target: EventTarget | null): boolean {
			return target instanceof Element && !!target.closest('a, button, [role="button"], input, textarea, select, .theme-toggle, .social-circle-btn');
		}

		function handleMouseOver(e: MouseEvent) {
			isHovering = checkHoverTarget(e.target);
		}

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mouseup', handleMouseUp);
		document.documentElement.addEventListener('mouseleave', handleMouseLeave);
		document.documentElement.addEventListener('mouseenter', handleMouseEnter);
		document.addEventListener('mouseover', handleMouseOver, { passive: true });

		const maxLifetime = 240;

		function updateLoop(now: number) {
			const dt = Math.min(now - lastTime, 50);
			lastTime = now;

			if (!lockedIn) {
				if (isMouseDown) {
					holdDuration = now - holdStartTime;
					if (holdDuration >= 7000) {
						lockedIn = true;
						frozenX = mouseX;
						frozenY = mouseY;
					}
				} else {
					holdDuration = Math.max(0, holdDuration - dt * 3.5);
				}

				displayX = mouseX;
				displayY = mouseY;

				if (holdDuration <= 3000) {
					isCharging = false;
					currentSize = isClicking ? 19 : (isHovering ? 36 : 24);
					currentBoxShadow = '';
					screenBrightness = 0;
				} else {
					isCharging = true;
					const g = Math.min((holdDuration - 3000) / 4000, 1);
					currentSize = 19 + 71 * g;
					screenBrightness = Math.pow(g, 2) * 0.35;
					currentBoxShadow = getGlow(
						10 + 20 * g,
						20 + 40 * g,
						40 + 60 * g,
						70 + 90 * g,
						110 + 110 * g,
						10 + 15 * g
					);
				}
			} else if (!blownUp) {
				displayX = frozenX;
				displayY = frozenY;
				isCharging = true;

				const e = Math.min(Math.max((now - holdStartTime - 7000) / 2400, 0), 1);
				currentSize = 90 + 3800 * Math.pow(e, 2.6);
				screenBrightness = 0.35 + 0.65 * Math.pow(e, 1.5);
				currentBoxShadow = getGlow(
					30 + 50 * e,
					60 + 90 * e,
					100 + 150 * e,
					160 + 200 * e,
					220 + 260 * e,
					25 + 30 * e,
					0.85,
					0.6
				);

				if (e >= 1) {
					blownUp = true;
					flashStartTime = now;
					flashOpacity = 1;
					if (typeof document !== 'undefined') {
						document.documentElement.classList.add('exploded');
						document.body.classList.add('exploded');
						document.body.style.overflow = 'hidden';
						document.documentElement.style.overflow = 'hidden';
					}
				}
			} else {
				flashOpacity = Math.max(0, 1 - (now - flashStartTime) / 1000);
				screenBrightness = 0;
			}

			if (!isCharging && !lockedIn && !blownUp) {
				trailHistory = trailHistory.filter((pt) => now - pt.time < maxLifetime);
				trailNodes = trailHistory.map((pt) => {
					const progress = (now - pt.time) / maxLifetime;
					return {
						id: pt.id,
						x: pt.x,
						y: pt.y,
						opacity: Math.max(0, (1 - progress) * 0.45),
						scale: Math.max(0.15, 0.85 - progress * 0.5)
					};
				});
			} else {
				trailNodes = [];
				trailHistory = [];
			}

			animFrame = requestAnimationFrame(updateLoop);
		}

		animFrame = requestAnimationFrame(updateLoop);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mouseup', handleMouseUp);
			document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
			document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
			document.removeEventListener('mouseover', handleMouseOver);
			if (animFrame) cancelAnimationFrame(animFrame);
			if (typeof document !== 'undefined') {
				document.documentElement.classList.remove('exploded');
				document.body.classList.remove('exploded');
				document.body.style.overflow = '';
				document.documentElement.style.overflow = '';
			}
		};
	});
</script>

{#if blownUp}
	<img src={borken} alt="Broken screen" class="easter-egg-broken-img" aria-hidden="true" />
{/if}

{#if flashOpacity > 0}
	<div class="easter-egg-flash" style="opacity: {flashOpacity};" aria-hidden="true"></div>
{/if}

{#if screenBrightness > 0 && !blownUp}
	<div
		class="easter-egg-brightener"
		style="
			opacity: {screenBrightness};
			background: radial-gradient(circle at {displayX}px {displayY}px, #ffffff 0%, rgba(255,255,255,0.9) 35%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.5) 100%);
		"
		aria-hidden="true"
	></div>
{/if}

{#if visible && !blownUp}
	{#if !isCharging && !lockedIn}
		{#each trailNodes as node (node.id)}
			<div
				class="osu-trail-node"
				style="
					transform: translate3d({node.x}px, {node.y}px, 0) translate(-50%, -50%) scale({node.scale});
					opacity: {node.opacity};
				"
				aria-hidden="true"
			></div>
		{/each}
	{/if}

	<div
		class="osu-cursor"
		class:hovering={isHovering && !isCharging && !lockedIn}
		class:clicking={isClicking && !isCharging && !lockedIn}
		class:charging={isCharging || lockedIn}
		style="
			transform: translate3d({displayX}px, {displayY}px, 0) translate(-50%, -50%);
			{isCharging || lockedIn ? `width: ${currentSize}px; height: ${currentSize}px; box-shadow: ${currentBoxShadow};` : ''}
		"
		aria-hidden="true"
	></div>
{/if}

<style>
	.osu-cursor {
		position: fixed;
		top: 0;
		left: 0;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		pointer-events: none;
		z-index: 100000;
		background-color: #ffffff;
		border: 1.5px solid rgba(0, 0, 0, 0.25);
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
		transition: width 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
			height 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.3s ease;
		will-change: transform;
	}

	:global(html.dark) .osu-cursor {
		border: 1.5px solid rgba(255, 255, 255, 0.5);
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.85), 0 0 24px #95b7ed;
	}

	.osu-cursor.hovering {
		width: 36px;
		height: 36px;
		box-shadow: 0 0 22px rgba(149, 183, 237, 0.75);
	}

	:global(html.dark) .osu-cursor.hovering {
		box-shadow: 0 0 28px rgba(149, 183, 237, 0.9), 0 0 45px rgba(149, 183, 237, 0.4);
	}

	.osu-cursor.clicking {
		width: 19px;
		height: 19px;
	}

	.osu-cursor.charging {
		transition: none !important;
		border: none !important;
	}

	.easter-egg-brightener {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 99997;
		backdrop-filter: brightness(1.25);
		will-change: opacity;
	}

	.easter-egg-flash {
		position: fixed;
		inset: 0;
		background-color: #ffffff;
		pointer-events: none;
		z-index: 999999;
		will-change: opacity;
	}

	.easter-egg-broken-img {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		object-fit: fill;
		display: block;
		z-index: 999998;
		cursor: default !important;
		user-select: none;
	}

	.osu-trail-node {
		position: fixed;
		top: 0;
		left: 0;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		pointer-events: none;
		z-index: 99999;
		background-color: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
		filter: blur(1.2px);
		will-change: transform, opacity;
	}

	:global(html.dark) .osu-trail-node {
		border: none;
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 18px #95b7ed;
	}

	@media (hover: hover) and (pointer: fine) and (min-width: 769px) {
		:global(html:not(.exploded), body:not(.exploded), html:not(.exploded) a, html:not(.exploded) button, html:not(.exploded) input, html:not(.exploded) select, html:not(.exploded) textarea, html:not(.exploded) [role="button"]) {
			cursor: none !important;
		}
	}

	@media (max-width: 768px), (pointer: coarse), (hover: none) {
		.osu-cursor,
		.osu-trail-node {
			display: none !important;
		}
	}
</style>
