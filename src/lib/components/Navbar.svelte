<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import favicon from '$lib/assets/favicon.ico';
	import clearDay from '$lib/assets/clear-day.svg';
	import clearNight from '$lib/assets/clear-night.svg';

	let buttonRef = $state<HTMLButtonElement | null>(null);

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
				{#if theme.current === 'dark'}
					<img
						src={clearNight}
						alt="Dark mode"
						class="theme-icon-svg"
						style="opacity: {theme.isAnimating ? 0 : 1};"
					/>
				{:else}
					<img
						src={clearDay}
						alt="Light mode"
						class="theme-icon-svg"
						style="opacity: {theme.isAnimating ? 0 : 1};"
					/>
				{/if}
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
		border-radius: 16px;
		background-color: var(--toggle-bg);
		border: none;
		transition: background-color 0.2s ease, transform 0.1s ease;
		padding: 0;
	}

	.theme-toggle:hover {
		background-color: var(--toggle-hover);
	}

	.theme-toggle:active {
		transform: scale(0.96);
	}

	.theme-icon-svg {
		width: 28px;
		height: 28px;
		object-fit: contain;
		display: block;
		pointer-events: none;
		user-select: none;
		transition: opacity 0.15s ease;
	}
</style>
