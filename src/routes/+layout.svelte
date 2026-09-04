<script>
	import '$lib/styles/app.css';
	import favicon from '$lib/assets/favicon.ico';
	import Navbar from '$lib/components/Navbar.svelte';
	import Snowfall from '$lib/components/Snowfall.svelte';
	import CustomCursor from '$lib/components/CustomCursor.svelte';
	import CelestialTransition from '$lib/components/CelestialTransition.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>I'm Meesam</title>
	<meta name="keywords" content="meesam4687 meesam 4687 meesam_4687 meesam3379 meesam 3379 meesam_3379" />
</svelte:head>

<div class="app-layout">
	<CustomCursor />
	<Snowfall />
	<Navbar />
	<main class="main-content">
		{@render children()}
	</main>
	<CelestialTransition />
</div>

<style>
	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 2;
	}
</style>
