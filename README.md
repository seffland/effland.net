# Effland.net

Personal website built with HTML, Tailwind CSS, and JavaScript.

## Development

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