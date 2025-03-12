/**
 * GitHub Profile Integration
 * Handles fetching and displaying GitHub contributions and repositories
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply dark mode to GitHub contribution graph if needed
    applyDarkModeToContributionsGraph();
    
    // Listen for theme changes to update the graph
    document.getElementById('theme-toggle').addEventListener('click', function() {
        // Wait briefly for the theme to change before updating
        setTimeout(applyDarkModeToContributionsGraph, 100);
    });
    
    // Fetch GitHub repositories
    fetchGitHubRepos();
});

/**
 * Applies appropriate filters to the GitHub contributions graph based on theme
 */
function applyDarkModeToContributionsGraph() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const contributionsImg = document.getElementById('github-contributions');
    
    if (contributionsImg) {
        if (isDarkMode) {
            // In dark mode, invert the colors and adjust brightness for better visibility
            contributionsImg.style.filter = 'invert(0.85) hue-rotate(180deg) brightness(1.5) contrast(1.2)';
        } else {
            // In light mode, use normal colors
            contributionsImg.style.filter = 'brightness(1) contrast(1)';
        }
    }
}

/**
 * Fetches and displays GitHub repositories
 */
function fetchGitHubRepos() {
    fetch('https://api.github.com/users/seffland/repos?sort=updated&per_page=4')
        .then(response => {
            if (!response.ok) {
                throw new Error('GitHub API request failed');
            }
            return response.json();
        })
        .then(repos => {
            // Hide loading spinner
            const loadingElement = document.getElementById('repos-loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // Show repositories
            const reposContainer = document.getElementById('repos-list');
            if (!reposContainer) return;
            
            if (repos.length === 0) {
                reposContainer.innerHTML = `
                    <div class="col-span-full text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p class="text-gray-600 dark:text-gray-400">No public repositories found.</p>
                    </div>
                `;
                return;
            }
            
            repos.forEach(repo => {
                // Create card for each repository
                const card = document.createElement('div');
                card.className = 'bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow';
                
                // Format date
                const updatedDate = new Date(repo.updated_at);
                const formattedDate = updatedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                card.innerHTML = `
                    <h4 class="font-medium text-primary dark:text-white">
                        <a href="${repo.html_url}" target="_blank" class="hover:underline">
                            ${repo.name}
                        </a>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        ${repo.description || 'No description available'}
                    </p>
                    <div class="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span class="mr-3">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #3b82f6; margin-right: 4px;"></span>
                            ${repo.language || 'Unknown'}
                        </span>
                        <span>Updated on ${formattedDate}</span>
                    </div>
                `;
                
                // Log for debugging
                console.log('Repo language:', repo.language);
                
                reposContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching GitHub repos:', error);
            const loadingElement = document.getElementById('repos-loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            const reposContainer = document.getElementById('repos-list');
            if (reposContainer) {
                reposContainer.innerHTML = `
                    <div class="col-span-full text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p class="text-red-500 dark:text-red-400">
                            Unable to load repositories. Please try again later.
                        </p>
                    </div>
                `;
            }
        });
}