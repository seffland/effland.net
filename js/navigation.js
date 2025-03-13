document.addEventListener('DOMContentLoaded', function() {
    const navElement = document.getElementById('main-nav');
    if (!navElement) return;
    
    // Define all pages with their properties
    const pages = [
        { id: 'home', title: 'Home', path: 'index.html', root: true },
        { id: 'projects', title: 'Projects', path: 'pages/projects.html' },
        { id: 'weather', title: 'Weather', path: 'pages/weather.html' },
        { id: 'movies', title: 'Movies', path: 'pages/movies.html' },
        { id: 'database', title: 'Database', path: 'pages/database.html' },
        { id: 'contact', title: 'Contact', path: 'pages/contact.html' }
    ];
    
    // Get current page path for active state detection
    const currentPath = window.location.pathname.toLowerCase();
    
    // Check if we're in the root directory or in the pages directory
    const isInPagesDirectory = currentPath.includes('/pages/');
    
    // Create the navigation HTML
    let navHTML = '<ul class="space-x-4">';
    
    pages.forEach(page => {
        // Determine if current page for styling
        const isCurrentPage = 
            (page.root && (currentPath.endsWith('/index.html') || currentPath === '/' || currentPath.endsWith('/'))) ||
            (!page.root && currentPath.includes(page.path.toLowerCase()));
        
        // Calculate proper path based on current directory
        let href;
        if (isInPagesDirectory) {
            href = page.root ? '../index.html' : page.path.replace('pages/', '');
        } else {
            href = page.path;
        }
        
        // Add list item to navigation
        navHTML += `
            <li class="inline-block">
                <a href="${href}" class="text-white hover:text-secondary transition-colors${isCurrentPage ? ' font-medium underline' : ''}">
                    ${page.title}
                </a>
            </li>
        `;
    });
    
    navHTML += '</ul>';
    navElement.innerHTML = navHTML;
});