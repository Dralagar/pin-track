# PWA Icons Setup

To make the app installable on Android and iOS, you need to create app icons.

## Required Icons

Create the following icon files in the `public` directory:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

## How to Create Icons

### Option 1: Online Tools
- Use [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- Use [RealFaviconGenerator](https://realfavicongenerator.net/)
- Use [Favicon.io](https://favicon.io/)

### Option 2: Design Tools
1. Create a square image (at least 512x512) with your app logo
2. Use design tools like:
   - Figma
   - Adobe Photoshop
   - Canva
   - GIMP (free)

### Option 3: Quick SVG to PNG
1. Create an SVG logo
2. Convert to PNG using:
   - Online converters
   - ImageMagick: `convert logo.svg -resize 192x192 icon-192.png`
   - Inkscape (free)

## Icon Design Tips

- Use a simple, recognizable logo
- Ensure good contrast for visibility
- Use the theme color (#10b981 - emerald green) as background
- Keep important elements centered
- Test on both light and dark backgrounds

## Quick Start

If you want to quickly test, you can:
1. Create a simple colored square with "PT" text
2. Export as PNG at 192x192 and 512x512 sizes
3. Place in the `public` folder

The app will work without icons, but users won't be able to install it as a PWA until icons are added.
