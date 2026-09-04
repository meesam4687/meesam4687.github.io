<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';

	let canvasRef = $state<HTMLCanvasElement | null>(null);

	interface SnowParticle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		swayPhase: number;
		swaySpeed: number;
		swayAmplitude: number;
		opacity: number;
		blurAmount: number;
		hasShineBorder: boolean;
	}

	interface ClickImpulse {
		x: number;
		y: number;
		startTime: number;
		cps: number;
		maxRadius: number;
		strength: number;
	}

	onMount(() => {
		if (!canvasRef) return;
		const canvas = canvasRef;
		const context = canvas.getContext('2d');
		if (!context) return;
		const ctx = context;

		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);
		let dpr = window.devicePixelRatio || 1;

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			dpr = window.devicePixelRatio || 1;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		resize();
		window.addEventListener('resize', resize, { passive: true });

		let mouseX = -9999;
		let mouseY = -9999;
		let isMouseInside = false;

		let clickTimes: number[] = [];
		let clickImpulses: ClickImpulse[] = [];

		function handleMouseMove(e: MouseEvent) {
			mouseX = e.clientX;
			mouseY = e.clientY;
			isMouseInside = true;
		}

		function handleMouseLeave() {
			isMouseInside = false;
			mouseX = -9999;
			mouseY = -9999;
		}

		function handleMouseDown(e: MouseEvent) {
			const now = performance.now();
			clickTimes.push(now);
			clickTimes = clickTimes.filter((t) => now - t <= 1000);
			const cps = clickTimes.length;

			clickImpulses.push({
				x: e.clientX,
				y: e.clientY,
				startTime: now,
				cps,
				maxRadius: 150 + Math.min(cps, 15) * 18,
				strength: 12 + Math.min(cps, 15) * 4
			});
		}

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		document.documentElement.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('mousedown', handleMouseDown);

		const particleCount = 75;

		function createSnowParticle(initialRandom = false): SnowParticle {
			const x = Math.random() * (width + 60) - 30;
			const y = initialRandom ? Math.random() * (height + 40) - 20 : -15 - Math.random() * 30;
			const depth = Math.random();
			const radius = 1.6 + depth * 3.2;
			const vy = 0.55 + depth * 0.95;
			const vx = (Math.random() - 0.5) * 0.35;
			const hasShineBorder = depth > 0.65;

			return {
				x,
				y,
				vx,
				vy,
				radius,
				swayPhase: Math.random() * Math.PI * 2,
				swaySpeed: 0.0018 + Math.random() * 0.002,
				swayAmplitude: 0.45 + Math.random() * 0.55,
				opacity: 0.25 + depth * 0.6,
				blurAmount: depth > 0.7 ? 4 : 2,
				hasShineBorder
			};
		}

		const particles: SnowParticle[] = Array.from({ length: particleCount }, () => createSnowParticle(true));

		let colorValue =
			(typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ||
			theme.current === 'dark'
				? 255
				: 0;
		let animFrameId: number | undefined;
		let lastTime = performance.now();

		function drawSnow(ctx: CanvasRenderingContext2D, p: SnowParticle, colorVal: number) {
			const { x, y, radius, opacity, blurAmount, hasShineBorder } = p;

			ctx.save();
			ctx.shadowColor = `rgba(${colorVal}, ${colorVal}, ${colorVal}, ${opacity * 0.8})`;
			ctx.shadowBlur = blurAmount;
			ctx.fillStyle = `rgba(${colorVal}, ${colorVal}, ${colorVal}, ${opacity})`;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();

			if (hasShineBorder) {
				ctx.strokeStyle = `rgba(${colorVal}, ${colorVal}, ${colorVal}, ${Math.min(1, opacity + 0.25)})`;
				ctx.lineWidth = 0.85;
				ctx.stroke();
			}

			ctx.restore();
		}

		function render(now: number) {
			const dt = Math.min((now - lastTime) / 1000, 0.1);
			lastTime = now;

			clickTimes = clickTimes.filter((t) => now - t <= 1000);
			const currentCPS = clickTimes.length;
			clickImpulses = clickImpulses.filter((imp) => now - imp.startTime < 600);

			const targetColor = theme.current === 'dark' ? 255 : 0;
			colorValue += (targetColor - colorValue) * Math.min(dt * 3.5, 1);
			const colorVal = Math.round(colorValue);

			ctx.clearRect(0, 0, width, height);

			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				const sway = Math.sin(now * p.swaySpeed + p.swayPhase) * p.swayAmplitude;

				p.x += (p.vx + sway) * (dt * 60);
				p.y += p.vy * (dt * 60);

				if (isMouseInside) {
					const dx = p.x - mouseX;
					const dy = p.y - mouseY;
					const dist = Math.hypot(dx, dy);
					const repelRadius = 100 + Math.min(currentCPS, 15) * 12;

					if (dist < repelRadius && dist > 0.001) {
						const factor = Math.pow(1 - dist / repelRadius, 1.4);
						const push = factor * 3.8 * (1 + currentCPS * 0.35) * (dt * 60);
						p.x += (dx / dist) * push;
						p.y += (dy / dist) * push;
					}
				}

				for (let j = 0; j < clickImpulses.length; j++) {
					const imp = clickImpulses[j];
					const waveAge = (now - imp.startTime) / 600;
					const waveDist = Math.hypot(p.x - imp.x, p.y - imp.y);

					if (waveDist < imp.maxRadius && waveDist > 0.001) {
						const waveFactor = Math.sin(Math.PI * waveAge) * (1 - waveDist / imp.maxRadius);
						if (waveFactor > 0) {
							const push = waveFactor * (imp.strength * 0.3);
							p.x += ((p.x - imp.x) / waveDist) * push;
							p.y += ((p.y - imp.y) / waveDist) * push;
						}
					}
				}

				if (p.y > height + 20 || p.x < -40 || p.x > width + 40) {
					const fresh = createSnowParticle(false);
					Object.assign(p, fresh);
				}

				drawSnow(ctx, p, colorVal);
			}

			animFrameId = requestAnimationFrame(render);
		}

		animFrameId = requestAnimationFrame(render);

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', handleMouseMove);
			document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('mousedown', handleMouseDown);
			if (animFrameId) cancelAnimationFrame(animFrameId);
		};
	});
</script>

<canvas
	bind:this={canvasRef}
	class="snow-canvas"
	aria-hidden="true"
></canvas>

<style>
	.snow-canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}
</style>
