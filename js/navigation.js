document.addEventListener('DOMContentLoaded', function() {
    const pages = [
        { path: 'index.html', name: 'Home', root: true },
        { path: 'pages/projects.html', name: 'Projects' },
        { path: 'pages/weather.html', name: 'Weather' },
        { path: 'pages/movies.html', name: 'Movies' },
        { path: 'pages/database.html', name: 'Database' },
        { path: 'pages/contact.html', name: 'Contact' }
    ];
    
    const navElement = document.getElementById('main-nav');
    if (!navElement) return;
    
    const currentPath = window.location.pathname;
    let navHTML = '<ul class="space-x-4">';
    
    pages.forEach(page => {
        // Determine if this is the current page
        const isCurrentPage = currentPath.endsWith(page.path) || 
                             (page.root && (currentPath === '/' || currentPath.endsWith('/index.html')));
        
        // Set the path correctly based on whether we're in the root or a subfolder
        let href = page.path;
        if (!page.root && !currentPath.includes('/pages/')) {
            href = page.path; // Already correctly set
        } else if (page.root && currentPath.includes('/pages/')) {
            href = '../' + page.path;
        }
        
        // Create the li element with appropriate styling
        navHTML += `<li class="inline-block">
            <a href="${href}" class="text-white hover:text-secondary transition-colors${isCurrentPage ? ' font-medium underline' : ''}">
                ${page.name}
            </a>
        </li>`;
    });
    
    navHTML += '</ul>';
    navElement.innerHTML = navHTML;
});