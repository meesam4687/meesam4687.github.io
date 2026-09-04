<script>
	import { theme } from '$lib/theme.svelte.js';
	import favicon from '$lib/assets/favicon.ico';

	/** @type {HTMLButtonElement | null} */
	let buttonRef = $state(null);

	function handleToggle() {
		if (buttonRef) {
			theme.toggle(buttonRef);
		}
	}
</script>

<header class="navbar">
	<div class="nav-container">
		<div class="brand">
			<a href="/" class="brand-link">
				<img src={favicon} alt="Meesam" class="brand-icon" />
				<span class="brand-name">meesam<span class="brand-accent">.app</span></span>
			</a>
		</div>

		<div class="nav-actions">
			<button
				bind:this={buttonRef}
				onclick={handleToggle}
				class="theme-toggle"
				aria-label={theme.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
				title={theme.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			>
				<div class="toggle-track">
					<div
						class="icon-wrapper"
						style="opacity: {theme.isAnimating ? 0 : 1};"
					>
						{#if theme.current === 'dark'}
							<svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
							</svg>
						{:else}
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
						{/if}
					</div>
				</div>
			</button>
		</div>
	</div>
</header>

<style>
	.navbar {
		width: 100%;
		position: sticky;
		top: 0;
		z-index: 50;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border-subtle);
		background-color: var(--bg-card);
		transition: background-color 0.3s ease, border-color 0.3s ease;
	}

	.nav-container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand-link {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-weight: 700;
		font-size: 1.15rem;
		letter-spacing: -0.02em;
		transition: opacity 0.2s ease;
	}

	.brand-link:hover {
		opacity: 0.85;
	}

	.brand-icon {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		object-fit: cover;
		display: block;
	}

	.brand-accent {
		color: var(--accent-primary);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.theme-toggle {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background-color: var(--toggle-bg);
		border: 1px solid var(--toggle-border);
		color: var(--toggle-icon);
		box-shadow: var(--shadow-sm);
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		padding: 0;
	}

	.theme-toggle:hover {
		transform: scale(1.06);
		box-shadow: 0 0 16px var(--accent-glow);
		border-color: var(--accent-primary);
	}

	.theme-toggle:active {
		transform: scale(0.96);
	}

	.toggle-track {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
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
