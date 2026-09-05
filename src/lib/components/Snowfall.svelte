<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';
	import hitsoundUrl from '$lib/assets/hitsound.ogg';

	let canvasRef = $state<HTMLCanvasElement | null>(null);
	let isEasterEggActive = $state(false);

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
		isChosenTarget?: boolean;
		mergeStartX?: number;
		mergeStartY?: number;
		mergeStartRadius?: number;
		mergeStartOpacity?: number;
		assignedCircleIndex?: number;
	}

	interface ClickImpulse {
		x: number;
		y: number;
		startTime: number;
		cps: number;
		maxRadius: number;
		strength: number;
	}

	interface OsuCircle {
		id: number;
		number: number;
		x: number;
		y: number;
		radius: number;
		currentRadius: number;
		color: string;
		state: 'active' | 'flying' | 'expanding_to_circle';
		transitionStart: number;
		transitionDuration: number;
		startX: number;
		startY: number;
		targetX: number;
		targetY: number;
	}

	interface HitEffect {
		x: number;
		y: number;
		startTime: number;
		color: string;
	}

	let exitEasterEggHandler: (() => void) | null = null;

	function easeInOutCubic(t: number): number {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	function easeOutBack(t: number): number {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
	}

	let audioCtx: AudioContext | null = null;
	let hitsoundBuf: AudioBuffer | null = null;

	function initHitsound() {
		try {
			const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			if (!AudioContextClass) return;
			audioCtx = new AudioContextClass();
			fetch(hitsoundUrl)
				.then((res) => res.arrayBuffer())
				.then((buf) => audioCtx!.decodeAudioData(buf))
				.then((decoded) => {
					hitsoundBuf = decoded;
				})
				.catch(() => {});
		} catch {}
	}

	function playHitsound() {
		if (audioCtx && hitsoundBuf) {
			if (audioCtx.state === 'suspended') {
				audioCtx.resume().catch(() => {});
			}
			const source = audioCtx.createBufferSource();
			source.buffer = hitsoundBuf;
			source.connect(audioCtx.destination);
			source.start(0);
		} else {
			new Audio(hitsoundUrl).play().catch(() => {});
		}
	}

	onMount(() => {
		if (!canvasRef) return;
		const canvas = canvasRef;
		const context = canvas.getContext('2d');
		if (!context) return;
		const ctx = context;
		initHitsound();

		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);
		let dpr = window.devicePixelRatio || 1;

		let mouseX = -9999;
		let mouseY = -9999;
		let isMouseInside = false;

		let clickTimes: number[] = [];
		let clickImpulses: ClickImpulse[] = [];

		let easterEggMode: 'idle' | 'slowing' | 'merging' | 'osu' = 'idle';
		let xPressCount = 0;
		let zPressCount = 0;
		let lastKey: 'x' | 'z' | null = null;
		let lastAlternationTime = 0;
		let speedFactor = 1.0;
		let targetSpeedFactor = 1.0;

		let mergeStartTime = 0;
		const MERGE_DURATION = 900;

		let osuCircles: OsuCircle[] = [];
		let hitEffects: HitEffect[] = [];

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			dpr = window.devicePixelRatio || 1;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			if (osuCircles.length > 0) {
				const padX = Math.max(60, width * 0.1);
				const padY = Math.max(60, height * 0.1);
				osuCircles.forEach((c) => {
					c.x = Math.max(padX, Math.min(width - padX, c.x));
					c.y = Math.max(padY, Math.min(height - padY, c.y));
				});
			}
		}
		resize();
		window.addEventListener('resize', resize, { passive: true });

		const particleCount = 75;

		function createSnowParticle(initialRandom = false): SnowParticle {
			const depth = Math.random();
			return {
				x: Math.random() * (width + 60) - 30,
				y: initialRandom ? Math.random() * (height + 40) - 20 : -15 - Math.random() * 30,
				vx: (Math.random() - 0.5) * 0.35,
				vy: 0.55 + depth * 0.95,
				radius: 1.6 + depth * 3.2,
				swayPhase: Math.random() * Math.PI * 2,
				swaySpeed: 0.0018 + Math.random() * 0.002,
				swayAmplitude: 0.45 + Math.random() * 0.55,
				opacity: 0.25 + depth * 0.6,
				blurAmount: depth > 0.7 ? 4 : 2,
				hasShineBorder: depth > 0.65
			};
		}

		const particles: SnowParticle[] = Array.from({ length: particleCount }, () => createSnowParticle(true));

		function getNewCirclePosition(excludeCircleId: number): { x: number; y: number } {
			const padX = Math.max(80, width * 0.12);
			const padY = Math.max(80, height * 0.14);
			let best = { x: padX + Math.random() * (width - padX * 2), y: padY + Math.random() * (height - padY * 2) };
			let maxMinDist = -1;

			for (let attempt = 0; attempt < 35; attempt++) {
				const candX = padX + Math.random() * (width - padX * 2);
				const candY = padY + Math.random() * (height - padY * 2);

				let minDist = Infinity;
				for (const other of osuCircles) {
					if (other.id !== excludeCircleId) {
						minDist = Math.min(minDist, Math.hypot(candX - other.x, candY - other.y));
					}
				}

				if (minDist > 140) return { x: candX, y: candY };
				if (minDist > maxMinDist) {
					maxMinDist = minDist;
					best = { x: candX, y: candY };
				}
			}
			return best;
		}

		function startEasterEggMerge(now: number) {
			if (easterEggMode === 'merging' || easterEggMode === 'osu') return;
			easterEggMode = 'merging';
			isEasterEggActive = true;

			if (typeof document !== 'undefined') {
				document.documentElement.classList.add('osu-mode');
				document.body.classList.add('osu-mode');
			}
			mergeStartTime = now;

			const indices = Array.from({ length: particles.length }, (_, i) => i)
				.sort(() => Math.random() - 0.5)
				.slice(0, 4);

			const padX = Math.max(80, width * 0.12);
			const padY = Math.max(80, height * 0.14);

			osuCircles = indices.map((particleIdx, i) => {
				const p = particles[particleIdx];
				const clampedX = Math.max(padX, Math.min(width - padX, p.x));
				const clampedY = Math.max(padY, Math.min(height - padY, p.y));
				p.x = clampedX;
				p.y = clampedY;

				return {
					id: i,
					number: i + 1,
					x: clampedX,
					y: clampedY,
					radius: 42,
					currentRadius: p.radius,
					color: '#ffffff',
					state: 'active',
					transitionStart: 0,
					transitionDuration: 0,
					startX: clampedX,
					startY: clampedY,
					targetX: clampedX,
					targetY: clampedY
				};
			});

			particles.forEach((p, idx) => {
				const chosenIdx = indices.indexOf(idx);
				p.isChosenTarget = chosenIdx !== -1;
				p.mergeStartX = p.x;
				p.mergeStartY = p.y;
				p.mergeStartRadius = p.radius;
				p.mergeStartOpacity = p.opacity;

				if (chosenIdx !== -1) {
					p.assignedCircleIndex = chosenIdx;
				} else {
					let bestDist = Infinity;
					let bestCircleIdx = 0;
					osuCircles.forEach((c, cIdx) => {
						const d = Math.hypot(p.x - c.x, p.y - c.y);
						if (d < bestDist) {
							bestDist = d;
							bestCircleIdx = cIdx;
						}
					});
					p.assignedCircleIndex = bestCircleIdx;
				}
			});
		}

		function tryHitCircle(x: number, y: number, now: number): boolean {
			if (easterEggMode !== 'osu') return false;

			for (let i = 0; i < osuCircles.length; i++) {
				const c = osuCircles[i];
				if (c.state !== 'active') continue;

				if (Math.hypot(x - c.x, y - c.y) <= c.radius * 1.15) {
					hitEffects.push({
						x: c.x,
						y: c.y,
						startTime: now,
						color: c.color
					});

					playHitsound();

					const nextPos = getNewCirclePosition(c.id);
					c.state = 'flying';
					c.startX = c.x;
					c.startY = c.y;
					c.targetX = nextPos.x;
					c.targetY = nextPos.y;
					c.transitionStart = now;
					c.transitionDuration = 550;
					return true;
				}
			}
			return false;
		}

		function exitEasterEgg() {
			if (easterEggMode === 'idle') return;
			easterEggMode = 'idle';
			isEasterEggActive = false;
			xPressCount = 0;
			zPressCount = 0;
			lastKey = null;
			targetSpeedFactor = 1.0;
			speedFactor = 1.0;

			if (typeof document !== 'undefined') {
				document.documentElement.classList.remove('osu-mode');
				document.body.classList.remove('osu-mode');
			}

			for (let i = 0; i < particles.length; i++) {
				Object.assign(particles[i], createSnowParticle(true));
			}

			osuCircles = [];
			hitEffects = [];
		}

		exitEasterEggHandler = exitEasterEgg;

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

			if (easterEggMode === 'osu' && e.button === 0) {
				if (tryHitCircle(e.clientX, e.clientY, now)) {
					return;
				}
			}

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

		function handleKeyDown(e: KeyboardEvent) {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			if (e.key === 'Escape' && (easterEggMode === 'osu' || easterEggMode === 'merging')) {
				exitEasterEgg();
				return;
			}

			const key = e.key.toLowerCase();

			if (easterEggMode === 'osu') {
				if ((key === 'x' || key === 'z') && !e.repeat) {
					tryHitCircle(mouseX, mouseY, performance.now());
				}
				return;
			}

			if (easterEggMode === 'idle' || easterEggMode === 'slowing') {
				if (key === 'x' || key === 'z') {
					if (e.repeat) return;
					const now = performance.now();

					if (now - lastAlternationTime > 1500) {
						xPressCount = key === 'x' ? 1 : 0;
						zPressCount = key === 'z' ? 1 : 0;
					} else if (key !== lastKey) {
						if (key === 'x') xPressCount++;
						if (key === 'z') zPressCount++;
					} else {
						xPressCount = key === 'x' ? 1 : 0;
						zPressCount = key === 'z' ? 1 : 0;
					}
					lastKey = key;
					lastAlternationTime = now;

					const pairs = Math.min(xPressCount, zPressCount);
					if (pairs > 0) {
						easterEggMode = 'slowing';
						const progress = Math.min(pairs / 12, 1);
						targetSpeedFactor = Math.max(0.06, 1 - progress * 0.94);
					} else {
						targetSpeedFactor = 1.0;
					}

					if (xPressCount >= 12 && zPressCount >= 12) {
						startEasterEggMerge(now);
					}
				} else if (!['shift', 'control', 'alt', 'meta', 'capslock', 'tab'].includes(key)) {
					xPressCount = 0;
					zPressCount = 0;
					lastKey = null;
					targetSpeedFactor = 1.0;
					if (easterEggMode === 'slowing') {
						easterEggMode = 'idle';
					}
				}
			}
		}

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		document.documentElement.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('keydown', handleKeyDown);

		let colorValue =
			(typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ||
			theme.current === 'dark'
				? 255
				: 0;
		let animFrameId: number | undefined;
		let lastTime = performance.now();

		function drawSnow(ctx: CanvasRenderingContext2D, p: SnowParticle, colorVal: number) {
			const { x, y, radius, opacity, blurAmount, hasShineBorder } = p;
			if (opacity <= 0.01 || radius <= 0.2) return;

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

		function drawOsuCircle(ctx: CanvasRenderingContext2D, c: OsuCircle) {
			const { x, y, currentRadius, number } = c;
			if (currentRadius <= 0.5) return;

			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, currentRadius, 0, Math.PI * 2);

			ctx.lineWidth = Math.max(10, currentRadius * 0.24);
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
			ctx.stroke();

			ctx.lineWidth = Math.max(6.5, currentRadius * 0.16);
			ctx.strokeStyle = '#ffffff';
			ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
			ctx.shadowBlur = 8;
			ctx.stroke();

			if (currentRadius > 14) {
				const fontSize = Math.round(currentRadius * 0.82);
				ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", -apple-system, sans-serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				ctx.shadowBlur = 0;
				ctx.lineWidth = 3.5;
				ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
				ctx.strokeText(String(number), x, y + 1);

				ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
				ctx.shadowBlur = 5;
				ctx.fillStyle = '#ffffff';
				ctx.fillText(String(number), x, y + 1);
			}

			ctx.restore();
		}

		function drawParticleMode(ctx: CanvasRenderingContext2D, c: OsuCircle, colorVal: number) {
			ctx.save();
			ctx.shadowColor = '#ffffff';
			ctx.shadowBlur = 10;
			ctx.fillStyle = `rgba(${colorVal}, ${colorVal}, ${colorVal}, 0.95)`;
			ctx.beginPath();
			ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
			ctx.fill();

			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 1.6;
			ctx.stroke();
			ctx.restore();
		}

		function drawHitEffects(ctx: CanvasRenderingContext2D, now: number) {
			for (let i = hitEffects.length - 1; i >= 0; i--) {
				const hit = hitEffects[i];
				const elapsed = now - hit.startTime;
				const duration = 420;
				if (elapsed >= duration) {
					hitEffects.splice(i, 1);
					continue;
				}
				const progress = elapsed / duration;
				const fade = 1 - progress;

				ctx.save();
				const rippleRadius = 42 + progress * 52;
				ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.9})`;
				ctx.lineWidth = 2.8 * fade;
				ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
				ctx.shadowBlur = 8 * fade;
				ctx.beginPath();
				ctx.arc(hit.x, hit.y, rippleRadius, 0, Math.PI * 2);
				ctx.stroke();

				const floatY = hit.y - 12 - progress * 26;
				ctx.font = `800 ${Math.round(22 * (1 + 0.15 * (1 - progress)))}px "Plus Jakarta Sans", -apple-system, sans-serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				ctx.lineWidth = 3 * fade;
				ctx.strokeStyle = `rgba(0, 0, 0, ${fade * 0.85})`;
				ctx.strokeText('300', hit.x, floatY);

				ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
				ctx.shadowBlur = 6 * fade;
				ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
				ctx.fillText('300', hit.x, floatY);

				ctx.restore();
			}
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

			if (easterEggMode === 'slowing') {
				if (now - lastAlternationTime > 1500) {
					xPressCount = 0;
					zPressCount = 0;
					lastKey = null;
					targetSpeedFactor = 1.0;
					easterEggMode = 'idle';
				}
			}

			speedFactor += (targetSpeedFactor - speedFactor) * Math.min(dt * 4.5, 1);

			if (easterEggMode === 'idle' || easterEggMode === 'slowing') {
				for (let i = 0; i < particles.length; i++) {
					const p = particles[i];
					const sway = Math.sin(now * p.swaySpeed + p.swayPhase) * p.swayAmplitude;

					p.x += (p.vx + sway) * (dt * 60) * speedFactor;
					p.y += p.vy * (dt * 60) * speedFactor;

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
			} else if (easterEggMode === 'merging') {
				const mergeProgress = Math.min((now - mergeStartTime) / MERGE_DURATION, 1);
				const ease = easeInOutCubic(mergeProgress);

				particles.forEach((p) => {
					if (!p.isChosenTarget && p.assignedCircleIndex !== undefined) {
						const targetCircle = osuCircles[p.assignedCircleIndex];
						if (targetCircle && p.mergeStartX !== undefined && p.mergeStartY !== undefined) {
							p.x = p.mergeStartX + (targetCircle.x - p.mergeStartX) * ease;
							p.y = p.mergeStartY + (targetCircle.y - p.mergeStartY) * ease;
							p.opacity = (p.mergeStartOpacity ?? 0.5) * (1 - ease);
							p.radius = Math.max(0.1, (p.mergeStartRadius ?? 2) * (1 - ease * 0.85));
							drawSnow(ctx, p, colorVal);
						}
					}
				});

				osuCircles.forEach((c) => {
					c.currentRadius = 3.5 + (c.radius - 3.5) * ease;
					drawOsuCircle(ctx, c);
				});

				if (mergeProgress >= 1) {
					easterEggMode = 'osu';
					osuCircles.forEach((c) => {
						c.currentRadius = c.radius;
						c.state = 'active';
					});
				}
			} else if (easterEggMode === 'osu') {
				drawHitEffects(ctx, now);

				osuCircles.forEach((c) => {
					if (c.state === 'flying') {
						const t = Math.min((now - c.transitionStart) / c.transitionDuration, 1);
						const easeFly = easeInOutCubic(t);
						const arcOffset = Math.sin(t * Math.PI) * -30;
						c.x = c.startX + (c.targetX - c.startX) * easeFly;
						c.y = c.startY + (c.targetY - c.startY) * easeFly + arcOffset;
						c.currentRadius = 4;
						drawParticleMode(ctx, c, colorVal);

						if (t >= 1) {
							c.x = c.targetX;
							c.y = c.targetY;
							c.state = 'expanding_to_circle';
							c.transitionStart = now;
							c.transitionDuration = 220;
						}
					} else if (c.state === 'expanding_to_circle') {
						const t = Math.min((now - c.transitionStart) / c.transitionDuration, 1);
						const scale = easeOutBack(t);
						c.currentRadius = Math.max(4, c.radius * scale);
						drawOsuCircle(ctx, c);

						if (t >= 1) {
							c.currentRadius = c.radius;
							c.state = 'active';
						}
					} else {
						drawOsuCircle(ctx, c);
					}
				});
			}

			animFrameId = requestAnimationFrame(render);
		}

		animFrameId = requestAnimationFrame(render);

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', handleMouseMove);
			document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('keydown', handleKeyDown);
			if (animFrameId) cancelAnimationFrame(animFrameId);
			if (typeof document !== 'undefined') {
				document.documentElement.classList.remove('osu-mode');
				document.body.classList.remove('osu-mode');
			}
		};
	});

	function handleExitClick() {
		if (exitEasterEggHandler) {
			exitEasterEggHandler();
		}
	}
</script>

<canvas
	bind:this={canvasRef}
	class="snow-canvas"
	class:easter-egg-active={isEasterEggActive}
	aria-hidden="true"
></canvas>

{#if isEasterEggActive}
	<button
		class="osu-exit-btn"
		onclick={handleExitClick}
		title="Exit easter egg (or press Escape)"
		aria-label="Exit easter egg"
	>
		<span class="exit-icon" aria-hidden="true">✕</span>
		<span>Exit</span>
		<kbd class="exit-kbd">ESC</kbd>
	</button>
{/if}

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

	.snow-canvas.easter-egg-active {
		pointer-events: auto;
		z-index: 99990;
	}

	.osu-exit-btn {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 99995;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 1.15rem;
		border-radius: 9999px;
		background: var(--bg-card);
		color: var(--text-primary);
		border: 1.5px solid var(--border-subtle);
		box-shadow: var(--shadow-md), 0 0 15px rgba(149, 183, 237, 0.2);
		font-family: var(--font-sans);
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
		animation: osuBtnSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		user-select: none;
	}

	.osu-exit-btn:hover {
		transform: translateY(-2px) scale(1.03);
		border-color: var(--accent-primary);
		box-shadow: var(--shadow-lg), 0 0 20px rgba(149, 183, 237, 0.45);
	}

	.osu-exit-btn:active {
		transform: translateY(0) scale(0.96);
	}

	.exit-icon {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--accent-primary);
	}

	.exit-kbd {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: 5px;
		background: var(--accent-subtle);
		color: var(--accent-primary);
		font-weight: 700;
		border: 1px solid var(--border-subtle);
		letter-spacing: 0.05em;
	}

	@keyframes osuBtnSlideUp {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
