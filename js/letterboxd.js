document.addEventListener('DOMContentLoaded', function() {
    // Initialize Letterboxd feed
    if (document.getElementById('recent-activity')) {
        fetchLetterboxdRSS('https://letterboxd.com/seffland/rss/', 'recent-activity', 10);
    }
});

async function fetchLetterboxdRSS(url, elementId, limit) {
    try {
        // Use a CORS proxy to fetch the RSS feed
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(corsProxy + encodeURIComponent(url));
        const data = await response.text();
        
        // Parse the XML
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'application/xml');
        const items = xml.querySelectorAll('item');
        
        // Process the items
        processMovieItems(items, elementId, limit, url);
        
    } catch (error) {
        console.error('Error fetching Letterboxd RSS:', error);
        document.getElementById(elementId).innerHTML = `
            <p class="text-red-500 text-center dark:text-red-400">
                Error loading data from Letterboxd. 
                <a href="${url}" target="_blank" class="underline">
                    View directly on Letterboxd
                </a>
            </p>
        `;
    }
}

function processMovieItems(items, elementId, limit, url) {
    // Get the container element
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    // Create the movie grid
    const movieGrid = document.createElement('div');
    movieGrid.className = 'movie-grid';
    
    // Process each item up to the limit
    const itemsToShow = Array.from(items).slice(0, limit);
    
    // If no items were found
    if (itemsToShow.length === 0) {
        container.innerHTML = `
            <p class="text-gray-500 dark:text-gray-400 text-center">
                No items found. 
                <a href="${url}" target="_blank" class="text-secondary hover:underline">
                    View on Letterboxd
                </a>
            </p>
        `;
        return;
    }
    
    itemsToShow.forEach(item => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = item.querySelector('description').textContent;
        
        // Extract the image URL from the description
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
        const imgUrl = imgMatch ? imgMatch[1] : '';
        
        // Extract the rating if available
        const ratingMatch = title.match(/★+/);
        const rating = ratingMatch ? ratingMatch[0] : '';
        
        // Clean the title (remove rating)
        const cleanTitle = title.replace(/★+\s*/, '');
        
        // Create movie card
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card relative dark:bg-gray-700';
        
        // Create movie content
        movieCard.innerHTML = `
            <a href="${link}" target="_blank" class="block">
                <img src="${imgUrl}" alt="${cleanTitle}" class="movie-poster w-full">
                ${rating ? `<span class="movie-rating">${rating}</span>` : ''}
                <h4 class="text-sm font-medium mt-2 line-clamp-2">${cleanTitle}</h4>
            </a>
        `;
        
        movieGrid.appendChild(movieCard);
    });
    
    container.appendChild(movieGrid);
}