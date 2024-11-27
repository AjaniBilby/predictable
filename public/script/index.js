// Function to set the theme based on system preferences
function applyThemeBasedOnPreference() {
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}

// Apply the theme on initial load
applyThemeBasedOnPreference();

// Listen for changes in system preferences and update the theme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
	applyThemeBasedOnPreference();
});