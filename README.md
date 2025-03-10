# Effland.net

Personal website for Steven Effland.

## Project Structure

```
effland.net/
├── dist/                  # Compiled assets
│   └── output.css         # Compiled Tailwind CSS
├── pages/                 # HTML pages
│   ├── contact.html
│   ├── movies.html
│   ├── projects.html
│   └── weather.html
├── src/                   # Source files
│   ├── css/               # CSS files
│   │   ├── fallback.css   # Fallback CSS
│   │   └── movies.css     # Movie-specific styles
│   ├── js/                # JavaScript files
│   └── input.css          # Tailwind CSS source
├── index.html             # Homepage
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind configuration
└── README.md              # Project documentation
```

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

## Development

This website is built with:
- HTML5
- Tailwind CSS
- JavaScript

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

## License

© 2025 Effland.net. All rights reserved.

## Deployment to Cloudflare Pages

This site is configured to deploy automatically to Cloudflare Pages. Here are the deployment settings:

### Build Settings
- Build command: `npm install && npm run build`
- Build output directory: `.` (root directory)
- Node.js version: 18 (or latest LTS)

### Build Process
1. Cloudflare Pages will automatically:
   - Install Node.js dependencies
   - Run the build command to compile Tailwind CSS
   - Deploy the site with the compiled CSS

### File Structure
- `src/input.css`: Source Tailwind CSS file
- `dist/output.css`: Compiled and minified CSS (auto-generated)
- `*.html`: Static HTML files
- `tailwind.config.js`: Tailwind configuration
- `.gitignore`: Git ignore rules

### Important Notes
- The `dist/output.css` file is tracked in Git and needed for deployment
- Node modules are excluded from Git but installed during build
- Environment variables can be configured in Cloudflare Pages dashboard if needed

## Local Development vs Production
- Development: Uses watch mode (`npm run dev`)
- Production: Builds minified CSS (`npm run build`)

## Troubleshooting
If the site isn't styling properly after deployment:
1. Check that `dist/output.css` is present in the repository
2. Verify the build command completed successfully in Cloudflare Pages logs
3. Ensure all HTML files reference the correct CSS path: `href="dist/output.css"` 