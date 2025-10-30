# Google Maps API Setup Guide 🗺️

## Quick Setup (5 minutes)

### Step 1: Get Your API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - ✅ **Maps JavaScript API** (Required)
     - ✅ **Drawing on Maps** (Required)
     - ⭐ Places API (Optional, for search features)

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "API Key"
   - Copy the generated key

5. **Secure Your API Key (Recommended)**
   - Click "Edit API key" (pencil icon)
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add: `http://localhost:3000/*` (for development)
     - Add: `https://yourdomain.com/*` (for production)
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose: Maps JavaScript API, Places API
   - Click "Save"

### Step 2: Configure Your Project

Create a file named `.env.local` in your project root:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy... (your actual key here)
```

**⚠️ Important:**
- File must be named exactly `.env.local`
- Must be in the project root (same level as `package.json`)
- Must start with `NEXT_PUBLIC_` for Next.js to expose it to the browser
- **NEVER commit this file to Git** (it's already in `.gitignore`)

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test It!

1. Open: `http://localhost:3000/admin/login`
2. Login to admin panel
3. Go to: **Zones** in the sidebar
4. You should see the Google Map loaded!

---

## Verification

### ✅ Success Indicators:

- Map displays correctly
- You can drag/pan the map
- Zoom controls work
- Polygon drawing tool appears on the map
- No error messages in browser console

### ❌ If Map Shows Error:

**"Google Maps API Key not configured"**
- Check `.env.local` file exists
- Verify the variable name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Restart the dev server

**"This page can't load Google Maps correctly"**
- API key is invalid or expired
- Required APIs not enabled (check Step 1.3)
- API key restrictions too strict

**Blank gray area instead of map**
- Check browser console for errors
- Verify Maps JavaScript API is enabled
- Check API key restrictions allow localhost

---

## Free Tier Limits

Google Maps offers a generous free tier:

- **$200 free credit per month**
- Approximately **28,000 map loads per month for free**
- **100,000 directions requests per month for free**

For a development project, this is more than enough!

---

## Environment Variables Reference

Your `.env.local` should look like this:

```env
# Google Maps (Required for Zone Management)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBk8...your_actual_key

# API Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# LocationIQ (Alternative location service)
NEXT_PUBLIC_LOCATIONIQ_API_KEY=pk.1dca78a113a7c45533e83e6c9f2196ae

# App Config
NEXT_PUBLIC_APP_NAME=RideFast
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## Troubleshooting

### Problem: "RefererNotAllowedMapError"

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your API key
3. Under "Application restrictions":
   - Add `http://localhost:3000/*`
   - Add `http://localhost:*/*`
4. Save and wait 1-2 minutes for changes to propagate

### Problem: "ApiNotActivatedMapError"

**Solution:**
1. Go to APIs & Services → Library
2. Search "Maps JavaScript API"
3. Click "Enable"
4. Refresh your browser

### Problem: Map loads but no drawing tool

**Solution:**
1. Check "Drawing on Maps" is enabled
2. Verify in console: no JavaScript errors
3. Clear browser cache
4. Restart dev server

---

## Security Best Practices

### For Development:
```env
# .env.local (not committed to Git)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_dev_key
```

### For Production:
1. Create a separate API key for production
2. Restrict to your production domain only
3. Use environment variables in your hosting platform (Vercel, Netlify, etc.)
4. Monitor usage in Google Cloud Console

### Never:
- ❌ Commit API keys to Git
- ❌ Share API keys publicly
- ❌ Use production keys in development
- ❌ Leave keys unrestricted

---

## Alternative: Using Environment Variables in Hosting

### Vercel
```bash
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Enter your production key
```

### Netlify
1. Go to Site Settings → Build & Deploy → Environment
2. Add variable: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Paste your production key

### Docker
```dockerfile
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

---

## Testing Without API Key

If you don't want to set up Google Maps yet, the component will show:

> "Google Maps API Key not configured"
> "Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables"

You can still use the old zone management interface:
- Edit `app/admin/zones/page.tsx`
- Use the original `ZoneManagement` component instead

---

## Need Help?

**Official Documentation:**
- https://developers.google.com/maps/documentation/javascript/get-api-key
- https://cloud.google.com/maps-platform/pricing

**Common Questions:**
- "Do I need a credit card?" - Yes, but you won't be charged within free tier
- "What if I exceed free tier?" - Google will notify you, but won't auto-charge
- "Can I use for production?" - Yes, just monitor your usage

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **File Name** | `.env.local` |
| **Variable Name** | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| **Required APIs** | Maps JavaScript API, Drawing on Maps |
| **Free Tier** | $200/month (~28,000 loads) |
| **Restrictions** | Add `http://localhost:3000/*` |
| **Documentation** | https://developers.google.com/maps |

---

Happy Mapping! 🗺️✨

