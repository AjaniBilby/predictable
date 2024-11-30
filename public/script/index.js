const theme = {
	infer: () => {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const theme = prefersDark ? 'dark' : 'light';
		localStorage.setItem("theme", theme);

		return theme;
	},
	apply: () => {
		const theme = localStorage.getItem("theme") || InferTheme();
		document.documentElement.setAttribute('data-theme', theme);
	},
	toggle: () => {
		const current = localStorage.getItem("theme") || InferTheme();
		if (current === "dark") localStorage.setItem("theme", "light");
		else localStorage.setItem("theme", "dark");

		theme.apply();
	}
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
	theme.infer();
	theme.apply();
});
theme.apply();