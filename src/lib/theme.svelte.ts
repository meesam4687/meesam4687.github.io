import { browser } from '$app/environment';

export interface AnimationOrigin {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface AnimationData {
	from: 'light' | 'dark';
	to: 'light' | 'dark';
	origin: AnimationOrigin;
}

class ThemeManager {
	current = $state<'light' | 'dark'>('light');
	isAnimating = $state(false);
	animationData = $state<AnimationData | null>(null);

	constructor() {
		if (browser) {
			const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
			const saved = sessionStorage.getItem('theme');

			this.current = (saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light');
			this.applyTheme(this.current);

			window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener('change', (e) => {
				if (!sessionStorage.getItem('theme')) {
					this.current = e.matches ? 'dark' : 'light';
					this.applyTheme(this.current);
				}
			});
		}
	}

	applyTheme(theme: 'light' | 'dark') {
		if (!browser) return;
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}

	toggle(buttonElement: HTMLElement | null) {
		if (this.isAnimating) return;

		let origin = { x: window.innerWidth - 60, y: 35, width: 40, height: 40 };
		if (buttonElement?.getBoundingClientRect) {
			const rect = buttonElement.getBoundingClientRect();
			origin = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
				width: rect.width,
				height: rect.height
			};
		}

		this.isAnimating = true;
		this.animationData = {
			from: this.current,
			to: this.current === 'dark' ? 'light' : 'dark',
			origin
		};
	}

	finishAnimation() {
		if (this.animationData) {
			this.current = this.animationData.to;
			this.applyTheme(this.current);
			if (browser) sessionStorage.setItem('theme', this.current);
		}
		this.isAnimating = false;
		this.animationData = null;
	}
}

export const theme = new ThemeManager();
