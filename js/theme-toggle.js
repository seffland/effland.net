document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');

    // Function to update UI based on current theme
    function updateThemeUI() {
        // Check if we're in dark mode
        if (document.documentElement.classList.contains('dark')) {
            // Show sun icon in dark mode (to switch to light)
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        } else {
            // Show moon icon in light mode (to switch to dark)
            themeToggleLightIcon.classList.add('hidden');
            themeToggleDarkIcon.classList.remove('hidden');
        }
    }

    // Set initial icon state
    updateThemeUI();

    // Toggle the theme when the button is clicked
    themeToggleBtn.addEventListener('click', function() {
        // Toggle dark class
        document.documentElement.classList.toggle('dark');
        
        // Update localStorage based on new state
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }

        // Update the UI to match current theme
        updateThemeUI();
    });
});