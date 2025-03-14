# Effland.net

Personal website for Steven Effland.

## Project Structure

```
effland.net/
├── dist/                  # Compiled assets
│   └── output.css         # Compiled Tailwind CSS
├── pages/                 # HTML pages
│   ├── contact.html       # Contact information
│   ├── database.html      # PostgreSQL database dashboard
│   ├── movies.html        # Movie recommendations and reviews
│   ├── projects.html      # Portfolio of development projects
│   └── weather.html       # Weather dashboard
├── src/                   # Source files
│   ├── css/               # CSS files
│   │   ├── fallback.css   # Fallback CSS
│   │   └── movies.css     # Movie-specific styles
│   ├── js/                # JavaScript files
│   │   ├── github.js      # GitHub contributions calendar
│   │   └── weather.js     # Weather data fetching and display
│   └── input.css          # Tailwind CSS source
├── workers/               # Cloudflare Workers
│   └── database.js        # Database API Worker
├── .env                   # Environment variables (not tracked by Git)
├── .gitignore             # Git ignore rules
├── github-proxy.js        # Local proxy for GitHub API
├── index.html             # Homepage
├── package.json           # Project dependencies
├── package-lock.json      # Dependency lock file
├── tailwind.config.js     # Tailwind configuration
└── README.md              # Project documentation
```

## Features

- Responsive design using Tailwind CSS
- GitHub contribution calendar on Projects page
- Weather data integration with OpenWeatherMap API
- PostgreSQL database integration via Cloudflare Workers
- Contact form with form validation
- Movie recommendations with filtering and sorting

## GitHub Calendar Setup

The GitHub contribution calendar on the Projects page requires a local proxy server to work correctly when running the site locally. This is due to CORS restrictions when accessing the GitHub API from a local file.

### Running the Proxy Server

1. Make sure you have Node.js installed on your system
2. Open a terminal in the project root directory
3. Run the proxy server:
   ```
   node github-proxy.js
   ```
4. You should see a message indicating the server is running at http://localhost:3000
5. Keep this terminal window open while viewing the website
6. Load or refresh the Projects page in your browser

### Troubleshooting

If you see "Unable to load GitHub contributions at this time" on the Projects page, check that:

1. The proxy server is running
2. You're using the correct GitHub username in the code
3. Your network allows connections to GitHub's API

## Database Integration

The database page connects to a Neon PostgreSQL database using Cloudflare Workers. This allows secure database access without exposing credentials in client-side code.

### Required Environment Variables

For local development, set these in your `.env` file:
```
PGUSER=effland.db_owner
PGPASSWORD=your_password
```

For Cloudflare deployment, set this in the Cloudflare Pages dashboard:
```
DATABASE_URL=postgresql://effland.db_owner:password@ep-winter-dew-a4an0kvq-pooler.us-east-1.aws.neon.tech/effland.db?sslmode=require
```

### Features of the Database Page
- Database connection status indicator
- Table explorer with data viewer
- Custom SQL query interface (SELECT queries only)
- Secure connection handling via Cloudflare Workers

## Development

This website is built with:
- HTML5
- Tailwind CSS
- JavaScript
- Cloudflare Workers (for database access)

1. Install dependencies:
```bash
npm install
```

2. Run development server (watches for changes):
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
WEATHER_API_KEY=your_openweathermap_api_key
GITHUB_USERNAME=your_github_username
PGUSER=effland.db_owner
PGPASSWORD=your_password
```

The `.env` file is excluded from Git to keep sensitive information private.

## License

© 2025 Effland.net. All rights reserved.

## Deployment to Cloudflare Pages

This site is configured to deploy automatically to Cloudflare Pages. Here are the deployment settings:

### Build Settings
- Build command: `npm install && npm run build`
- Build output directory: `.` (root directory)
- Node.js version: 18 (or latest LTS)

### Environment Variables
Configure these in the Cloudflare Pages dashboard:
- `WEATHER_API_KEY`: Your OpenWeatherMap API key
- `GITHUB_USERNAME`: Your GitHub username
- `DATABASE_URL`: Your Neon PostgreSQL connection string

### Cloudflare Workers
The database functionality requires a Cloudflare Worker:
1. Deploy the worker in `workers/database.js` to Cloudflare
2. Configure the worker route to match `/api/database/*`
3. Bind the environment variables in the Cloudflare dashboard

### Build Process
1. Cloudflare Pages will automatically:
   - Install Node.js dependencies
   - Run the build command to compile Tailwind CSS
   - Deploy the site with the compiled CSS

### Important Notes
- The `dist/output.css` file is tracked in Git and needed for deployment
- Node modules are excluded from Git but installed during build
- Environment variables should be configured in Cloudflare Pages dashboard