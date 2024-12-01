const theme = {
	infer: () => {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const current = prefersDark ? 'dark' : 'light';
		localStorage.setItem("theme", current);

		return current;
	},
	apply: () => {
		const current = localStorage.getItem("theme") || theme.infer();
		document.documentElement.setAttribute('data-theme', current);
	},
	toggle: () => {
		const current = localStorage.getItem("theme") || theme.infer();
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

window['theme'] = theme;