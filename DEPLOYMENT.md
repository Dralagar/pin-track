# Deployment Checklist

## Pre-Deployment

### ✅ Code Quality
- [x] All imports fixed (using `store.server` for server components)
- [x] No linter errors
- [x] All pages properly importing dependencies
- [x] Navigation items properly configured (boss-only items marked)

### ✅ PWA Setup
- [x] Manifest.json created
- [x] Service worker created
- [x] PWA meta tags added to layout
- [ ] **TODO: Create app icons** (see ICONS.md)
  - icon-192.png (192x192)
  - icon-512.png (512x512)

### ✅ Functionality
- [x] Reconciliation page renders correctly
- [x] Inventory page renders correctly
- [x] Navigation properly filters boss-only items
- [x] All API routes using correct imports

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Test the Build
```bash
npm start
```

### 3. Environment Variables
Ensure you have:
- No sensitive data in code
- Database path configured correctly (.pintrack/db.json)

### 4. Deploy to Platform

#### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel
```

#### Other Platforms
- Ensure Node.js 18+ is available
- Set build command: `npm run build`
- Set start command: `npm start`
- Ensure `.pintrack` directory is writable

### 5. PWA Installation

After deployment, users can:
- **Android**: Open in Chrome, tap menu → "Add to Home screen"
- **iOS**: Open in Safari, tap share → "Add to Home Screen"

## Post-Deployment

- [ ] Test all pages load correctly
- [ ] Test navigation works
- [ ] Test PWA installation on mobile devices
- [ ] Verify service worker is registered
- [ ] Test offline functionality (limited)

## Notes

- The app uses a local JSON database (`.pintrack/db.json`)
- For production, consider migrating to a proper database
- Service worker provides basic caching but API calls still need network
- Icons are required for PWA installation to work properly
