document.addEventListener('DOMContentLoaded', function() {
    const weatherMap = document.getElementById('weather-map');
    
    // Update weather map based on theme (initial setup)
    updateWeatherMapTheme();
    
    // Listen for theme changes
    document.addEventListener('themeChanged', function() {
        updateWeatherMapTheme();
        updateUVColors();
    });
    
    function updateWeatherMapTheme() {
        if (weatherMap) {
            const isDark = document.documentElement.classList.contains('dark');
            const currentSrc = weatherMap.src;
            
            if (isDark) {
                if (currentSrc.includes('darkMode=false') || !currentSrc.includes('darkMode=')) {
                    weatherMap.src = currentSrc.includes('?') 
                        ? currentSrc.replace(/(&darkMode=false|$)/, '&darkMode=true') 
                        : currentSrc + '?darkMode=true';
                }
            } else {
                if (currentSrc.includes('darkMode=true')) {
                    weatherMap.src = currentSrc.replace('&darkMode=true', '&darkMode=false');
                }
            }
        }
    }
    
    // Your Tempest API credentials
    const stationId = '134901';
    const token = 'e938eec3-3816-4bd9-9b8e-3d85d878ca1e';
    
    // Make sure loading indicator is visible and weather data is hidden on page load
    document.getElementById('loading-indicator').classList.remove('hidden');
    document.getElementById('current-conditions').classList.add('hidden');
    
    // Set a timeout to show a message if the API is taking too long
    const loadingTimeout = setTimeout(() => {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (!loadingIndicator.classList.contains('hidden')) {
            loadingIndicator.innerHTML = `
                <div class="text-yellow-600 dark:text-yellow-400">
                    <p>Weather data is taking longer than expected to load.</p>
                    <p class="text-sm mt-2">Please wait a moment...</p>
                </div>
            `;
        }
    }, 10000); // 10 seconds timeout
    
    // Fetch current weather data
    fetchWeatherData(stationId, token, loadingTimeout);
    
    // Refresh data every 5 minutes
    setInterval(() => {
        // Show loading indicator when refreshing data
        document.getElementById('loading-indicator').classList.remove('hidden');
        document.getElementById('current-conditions').classList.add('hidden');
        
        // Set a new timeout for the refresh
        const refreshTimeout = setTimeout(() => {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (!loadingIndicator.classList.contains('hidden')) {
                loadingIndicator.innerHTML = `
                    <div class="text-yellow-600 dark:text-yellow-400">
                        <p>Weather data refresh is taking longer than expected.</p>
                        <p class="text-sm mt-2">Please wait a moment...</p>
                    </div>
                `;
            }
        }, 10000); // 10 seconds timeout
        
        fetchWeatherData(stationId, token, refreshTimeout);
    }, 5 * 60 * 1000);
});

async function fetchWeatherData(stationId, token, timeoutId) {
    try {
        // Fetch current observations
        const response = await fetch(`https://swd.weatherflow.com/swd/rest/observations/station/${stationId}?token=${token}`);
        const data = await response.json();
        
        // Clear the timeout since we got a response
        if (timeoutId) clearTimeout(timeoutId);
        
        if (data.status?.status_code !== 0) {
            throw new Error('API Error: ' + (data.status?.status_message || 'Unknown error'));
        }
        
        // Update the UI with the weather data
        updateWeatherUI(data);
        
        // Hide loading indicator and show weather data
        document.getElementById('loading-indicator').classList.add('hidden');
        document.getElementById('current-conditions').classList.remove('hidden');
    } catch (error) {
        // Clear the timeout since we got a response (even if it's an error)
        if (timeoutId) clearTimeout(timeoutId);
        
        console.error('Error fetching weather data:', error);
        document.getElementById('loading-indicator').innerHTML = `
            <div class="text-red-500 dark:text-red-400">
                <p>Error loading weather data.</p>
                <p class="text-sm mt-2">Please try again later.</p>
            </div>
        `;
        // Keep the error message visible and hide the weather data
        document.getElementById('current-conditions').classList.add('hidden');
    }
}

function updateWeatherUI(data) {
    const obs = data.obs[0];
    
    // Format temperature
    const tempF = (obs.air_temperature * 9/5 + 32).toFixed(1);
    document.getElementById('temperature').textContent = `${tempF}°F`;
    
    // Set conditions based on precipitation and other factors
    let conditions = 'Clear';
    let iconClass = 'wi wi-day-sunny';
    
    if (obs.precip_accum_local_day > 0) {
        conditions = 'Rainy';
        iconClass = 'wi wi-rain';
    } else if (obs.relative_humidity > 90) {
        conditions = 'Foggy';
        iconClass = 'wi wi-fog';
    } else if (obs.wind_avg > 15) {
        conditions = 'Windy';
        iconClass = 'wi wi-strong-wind';
    } else if (obs.cloud_cover > 0.7) {
        conditions = 'Cloudy';
        iconClass = 'wi wi-cloudy';
    } else if (obs.cloud_cover > 0.3) {
        conditions = 'Partly Cloudy';
        iconClass = 'wi wi-day-cloudy';
    }
    
    document.getElementById('conditions').textContent = conditions;
    document.getElementById('weather-icon').className = iconClass;
    
    // Feels like temperature
    const feelsLikeF = (obs.feels_like * 9/5 + 32).toFixed(1);
    document.getElementById('feels-like').textContent = `Feels like: ${feelsLikeF}°F`;
    
    // Other weather details
    document.getElementById('humidity').textContent = `${Math.round(obs.relative_humidity)}%`;
    
    // Wind direction as cardinal direction
    const windDirection = getCardinalDirection(obs.wind_direction);
    const windSpeedMph = (obs.wind_avg * 2.237).toFixed(1); // Convert m/s to mph
    document.getElementById('wind').textContent = `${windSpeedMph} mph ${windDirection}`;
    
    // Pressure in inHg
    const pressureInHg = (obs.sea_level_pressure * 0.02953).toFixed(2); // Convert mb to inHg
    document.getElementById('pressure').textContent = `${pressureInHg} inHg`;
    
    // Precipitation
    const precipIn = (obs.precip_accum_local_day * 0.0393701).toFixed(2); // Convert mm to inches
    document.getElementById('precipitation').textContent = `${precipIn} in`;
    
    // UV Index with color coding
    const uvElement = document.getElementById('uv');
    const uvValue = obs.uv.toFixed(1);
    uvElement.textContent = uvValue;
    
    // Apply UV index color classes
    updateUVColors(obs.uv);
    
    // Solar Radiation
    document.getElementById('solar').textContent = `${obs.solar_radiation.toFixed(0)} W/m²`;
    
    // Last updated time
    const lastUpdated = new Date(obs.timestamp * 1000).toLocaleTimeString();
    document.getElementById('last-updated').textContent = lastUpdated;
}

function getCardinalDirection(angle) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 22.5) % 16;
    return directions[index];
}

function updateUVColors(uvValue) {
    const uvElement = document.getElementById('uv');
    if (!uvElement) return;
    
    // For when called without a parameter (just for dark mode switch)
    if (uvValue === undefined) {
        uvValue = parseFloat(uvElement.textContent);
    }
    
    // Reset classes
    uvElement.className = 'font-semibold dark:text-white';
    
    // Apply UV index color based on value and theme
    if (document.documentElement.classList.contains('dark')) {
        if (uvValue < 3) {
            uvElement.classList.add('text-green-400');
        } else if (uvValue < 6) {
            uvElement.classList.add('text-yellow-300');
        } else if (uvValue < 8) {
            uvElement.classList.add('text-orange-300');
        } else if (uvValue < 11) {
            uvElement.classList.add('text-red-300');
        } else {
            uvElement.classList.add('text-purple-300');
        }
    } else {
        if (uvValue < 3) {
            uvElement.classList.add('text-green-600');
        } else if (uvValue < 6) {
            uvElement.classList.add('text-yellow-600');
        } else if (uvValue < 8) {
            uvElement.classList.add('text-orange-600');
        } else if (uvValue < 11) {
            uvElement.classList.add('text-red-600');
        } else {
            uvElement.classList.add('text-purple-600');
        }
    }
}