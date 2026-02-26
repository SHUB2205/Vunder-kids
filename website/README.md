# Fisiko Website

Landing page and legal documents for the Fisiko sports app.

## Pages

- `/` - Landing page
- `/terms` - Terms and Conditions
- `/privacy-policy` - Privacy Policy
- `/eula` - End User License Agreement
- `/support` - Support and FAQ

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Vercel will auto-detect Next.js and deploy

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Configuration

- `next.config.js` - Static export with trailing slashes for proper routing
- `vercel.json` - Vercel-specific routing configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Notes

- Uses Next.js 14 App Router
- Static export (`output: 'export'`) for optimal Vercel hosting
- Trailing slashes enabled to prevent 404 issues on direct page access
