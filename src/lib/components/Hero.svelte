<script lang="ts">
	import bird from '$lib/assets/bird.png';
	import cookieSvg from '$lib/assets/12materialcookie.svg';

	let copiedDiscord = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	function copyDiscordUsername(e: MouseEvent) {
		e.preventDefault();
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText('meesam4687');
			copiedDiscord = true;
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copiedDiscord = false;
			}, 2000);
		}
	}
</script>

<section class="hero-section">
	<div class="hero-container">
		<div class="avatar-column">
			<div class="avatar-wrapper">
				<img
					src={cookieSvg}
					alt=""
					class="avatar-cookie-spinner"
					aria-hidden="true"
				/>
				<div class="avatar-frame">
					<img src={bird} alt="Meesam's profile" class="avatar-img" />
				</div>
			</div>
		</div>

		<div class="content-column">
			<h1 class="hero-title">
				I'm <span class="accent-title">Meesam</span>,<br />
				I make
				<a
					href="https://github.com/meesam4687?tab=repositories"
					target="_blank"
					rel="noopener noreferrer"
					class="random-stuff-link"
					title="View my GitHub repositories"
				>
					random stuff
				</a>
			</h1>

			<div class="socials-wrapper">
				<p class="socials-label">you can find me at:</p>
				
				<div class="socials-row">
					<a
						href="https://github.com/meesam4687/"
						target="_blank"
						rel="noopener noreferrer"
						class="social-circle-btn"
						aria-label="GitHub (@meesam4687)"
						title="GitHub (@meesam4687)"
					>
						<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
						</svg>
					</a>

					<a
						href="https://x.com/meesam4687"
						target="_blank"
						rel="noopener noreferrer"
						class="social-circle-btn"
						aria-label="Twitter / X (@meesam4687)"
						title="Twitter / X (@meesam4687)"
					>
						<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
					</a>

					<button
						onclick={copyDiscordUsername}
						class="social-circle-btn discord-btn"
						class:copied={copiedDiscord}
						aria-label="Copy Discord username: meesam4687"
						title={copiedDiscord ? "Copied 'meesam4687'!" : "Discord (Click to copy: meesam4687)"}
					>
						{#if copiedDiscord}
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
							<span class="copied-tooltip">copied!</span>
						{:else}
							<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
								<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-section {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 80px);
		padding: 2rem 1.5rem;
		width: 100%;
	}

	.hero-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 3.5rem;
		width: auto;
		max-width: 100%;
		margin: 0 auto;
	}

	.avatar-column {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-cookie-spinner {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 126%;
		height: 126%;
		pointer-events: none;
		user-select: none;
		z-index: 1;
		animation: spinCookie 28s linear infinite;
		transform-origin: center center;
		will-change: transform;
	}

	:global(html:not(.dark)) .avatar-cookie-spinner {
		filter: invert(1) opacity(0.4);
	}

	:global(html.dark) .avatar-cookie-spinner {
		filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.25));
	}

	@keyframes spinCookie {
		from {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.avatar-cookie-spinner {
			animation: none;
			transform: translate(-50%, -50%);
		}
	}

	.avatar-frame {
		position: relative;
		z-index: 2;
		width: 370px;
		height: 370px;
		border-radius: 50%;
		overflow: hidden;
		-webkit-mask-image: radial-gradient(circle closest-side at center, #000000 92%, rgba(0, 0, 0, 0.4) 97%, transparent 100%);
		mask-image: radial-gradient(circle closest-side at center, #000000 92%, rgba(0, 0, 0, 0.4) 97%, transparent 100%);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.content-column {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.35rem;
		justify-content: center;
	}

	.hero-title {
		font-size: 2.85rem;
		font-weight: 800;
		line-height: 1.25;
		letter-spacing: -0.035em;
		color: var(--text-primary);
		white-space: nowrap;
	}

	.accent-title {
		color: var(--accent-primary);
	}

	.random-stuff-link {
		position: relative;
		display: inline-block;
		color: var(--text-primary);
		text-decoration: none;
		border-radius: 6px;
		padding: 2px;
		transition: color 0.22s ease;
		z-index: 1;
		cursor: pointer;
	}

	.random-stuff-link::before {
		content: '';
		position: absolute;
		left: 0;
		bottom: 2px;
		width: 100%;
		height: 3.5px;
		background-color: var(--accent-primary);
		border-radius: 4px;
		transition: height 0.26s cubic-bezier(0.34, 1.56, 0.64, 1),
			bottom 0.26s cubic-bezier(0.34, 1.56, 0.64, 1),
			border-radius 0.2s ease;
		z-index: -1;
	}

	.random-stuff-link:hover {
		color: #000000 !important;
	}

	.random-stuff-link:hover::before {
		height: 85%;
		bottom: 0;
		border-radius: 6px;
	}

	.socials-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.socials-label {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: lowercase;
		letter-spacing: 0.02em;
	}

	.socials-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	.social-circle-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background-color: var(--bg-card);
		border: 1.5px solid var(--border-subtle);
		color: var(--text-primary);
		transition: border-color 0.2s ease, color 0.2s ease;
		cursor: pointer;
		padding: 0;
	}

	.social-circle-btn:hover {
		border-color: var(--accent-primary);
	}

	.social-circle-btn.copied {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.check-icon {
		color: var(--accent-primary);
		animation: popIn 0.2s ease;
	}

	.copied-tooltip {
		position: absolute;
		top: -30px;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--text-primary);
		color: var(--bg-primary);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
		padding: 3px 7px;
		border-radius: 6px;
		white-space: nowrap;
		pointer-events: none;
		animation: popIn 0.2s ease;
		box-shadow: var(--shadow-sm);
	}

	@keyframes popIn {
		0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
		100% { transform: translateX(-50%) scale(1); opacity: 1; }
	}

	@media (max-width: 768px) {
		.hero-container {
			flex-direction: column;
			text-align: center;
			gap: 2rem;
		}

		.avatar-frame {
			width: min(280px, 78vw);
			height: min(280px, 78vw);
		}

		.content-column {
			align-items: center;
		}

		.hero-title {
			font-size: 2.25rem;
			white-space: normal;
		}

		.socials-wrapper {
			align-items: center;
		}
	}
</style>
