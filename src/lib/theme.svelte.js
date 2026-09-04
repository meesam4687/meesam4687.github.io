import { browser } from '$app/environment';

/**
 * @typedef {Object} AnimationOrigin
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} AnimationData
 * @property {'light' | 'dark'} from
 * @property {'light' | 'dark'} to
 * @property {AnimationOrigin} origin
 */

class ThemeManager {
	/** @type {'light' | 'dark'} */
	current = $state('light');
	/** @type {boolean} */
	isAnimating = $state(false);
	/** @type {AnimationData | null} */
	animationData = $state(null);

	constructor() {
		if (browser) {
			const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
			const saved = sessionStorage.getItem('theme');

			if (saved === 'dark' || saved === 'light') {
				this.current = saved;
			} else {
				this.current = prefersDark ? 'dark' : 'light';
			}
			this.applyTheme(this.current);

			const mql = window.matchMedia('(prefers-color-scheme: dark)');
			/**
			 * @param {MediaQueryListEvent} e
			 */
			const handler = (e) => {
				if (!sessionStorage.getItem('theme')) {
					this.current = e.matches ? 'dark' : 'light';
					this.applyTheme(this.current);
				}
			};

			if (mql.addEventListener) {
				mql.addEventListener('change', handler);
			} else if (/** @type {any} */ (mql).addListener) {
				/** @type {any} */ (mql).addListener(handler);
			}
		}
	}

	/**
	 * @param {'light' | 'dark'} theme
	 */
	applyTheme(theme) {
		if (!browser) return;
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	/**
	 * @param {HTMLElement | null} buttonElement
	 */
	toggle(buttonElement) {
		if (this.isAnimating) return;

		let origin = { x: window.innerWidth - 60, y: 35, width: 40, height: 40 };
		if (buttonElement && buttonElement.getBoundingClientRect) {
			const rect = buttonElement.getBoundingClientRect();
			origin = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
				width: rect.width,
				height: rect.height
			};
		}

		/** @type {'light' | 'dark'} */
		const nextTheme = this.current === 'dark' ? 'light' : 'dark';
		const prevTheme = this.current;

		this.isAnimating = true;
		this.animationData = {
			from: prevTheme,
			to: nextTheme,
			origin
		};
	}

	finishAnimation() {
		if (this.animationData) {
			this.current = this.animationData.to;
			this.applyTheme(this.current);
			if (browser) {
				sessionStorage.setItem('theme', this.current);
			}
		}
		this.isAnimating = false;
		this.animationData = null;
	}
}

export const theme = new ThemeManager();
