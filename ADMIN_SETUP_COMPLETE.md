# Admin UI Connection Setup - COMPLETED

## Summary
Successfully configured the admin UI to connect to the backend API on port 8081.

## Changes Made

### 1. Updated API Base URL Configuration
**File:** `utils/config.ts`
- Changed default API_BASE_URL from `https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net` to `http://localhost:8081`
- This affects all API calls that use the `config` object

### 2. Updated Next.js API Proxy Configuration
**File:** `next.config.mjs`
- Changed rewrite destination from Render production backend to `http://localhost:8081/api/:path*`
- This ensures all `/api/*` requests are proxied to your local backend
- Commented out the production backend URL for easy switching

### 3. Updated Axios Configuration for SSR
**File:** `utils/axiosConfig.ts`
- Updated adminAxios baseURL from `localhost:8080` to `localhost:8081` for server-side rendering
- Client-side requests still use empty baseURL to leverage Next.js rewrites

### 4. Fixed Admin Dashboard Stats Requests
**Files:** `utils/reducers/adminReducers.ts`
- Previously: Requests used absolute URLs that bypassed Next.js rewrites
- Now: Uses relative endpoints like `/api/admin/dashboard/stats` which go through the proxy
- This fixes the "Dashboard Stats Unavailable" error

### 5. Fixed Admin Login Request
**File:** `utils/slices/adminSlice.ts`
- Changed from using `axios.post(adminLoginUrl)` to `adminAxios.post(config.ENDPOINTS.ADMIN.LOGIN)`
- Now uses relative URL `/api/v1/admin/login` that goes through Next.js proxy
- Ensures login requests are properly routed to the correct backend

## Environment Configuration (Optional)
If you need to customize the API URL without changing code, create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_PUBLIC_LOCATIONIQ_API_KEY=your_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

## Admin Login Endpoint
The admin login is configured to use:
- **Endpoint:** `POST /api/v1/admin/login`
- **Location:** `utils/config.ts` → `ENDPOINTS.ADMIN.LOGIN`
- **Component:** `app/admin/login/page.tsx`
- **Redux Action:** `utils/slices/adminSlice.ts` → `adminLogin`

## Testing the Connection

### 1. Start Your Backend Server
Make sure your backend is running on port 8081:
```bash
# Your backend should be listening on http://localhost:8081
```

### 2. Restart the Next.js Dev Server
The Next.js config changes require a server restart:
```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Test Admin Login
1. Navigate to `http://localhost:3000/admin/login`
2. Enter your admin credentials
3. The request will go to: `POST http://localhost:8081/api/v1/admin/login`
4. On success, you'll be redirected to `/admin/dashboard`

### 4. Verify Dashboard Stats
1. After successful login, check the admin dashboard
2. The dashboard stats should now load (or show proper error messages from the backend)
3. If the backend endpoint `/api/admin/dashboard/stats` returns 501, you'll see a helpful message

## Troubleshooting

### If login fails:
1. **Check backend is running:** `curl http://localhost:8081/api/v1/admin/login` (should not return connection refused)
2. **Check admin credentials:** Use valid admin username/password
3. **Check browser console:** Look for network errors or CORS issues
4. **Check backend logs:** Verify the request reached the backend

### If dashboard shows errors:
1. **401 Unauthorized:** Token may have expired, try logging in again
2. **404 Not Found:** Endpoint may not exist in your backend version
3. **500/501:** Backend feature not implemented (expected - UI shows helpful message)
4. **CORS errors:** Backend needs to allow requests from `http://localhost:3000`

### To switch back to production backend:
In `next.config.mjs`, swap the commented lines:
```javascript
// destination: "http://localhost:8081/api/:path*",
destination: "https://ride-fast-app-backend-latest.onrender.com/api/:path*",
```
Then restart the dev server.

## Next Steps
1. **Restart your dev server:** `npm run dev`
2. **Test admin login** at `http://localhost:3000/admin/login`
3. **Verify dashboard** loads correctly
4. **Check all admin features** work as expected

## Files Modified
- ✅ `utils/config.ts` - Updated default API URL to 8081
- ✅ `next.config.mjs` - Updated proxy destination to 8081
- ✅ `utils/axiosConfig.ts` - Updated SSR baseURL to 8081
- ✅ `utils/reducers/adminReducers.ts` - Fixed dashboard API calls to use relative URLs
- ✅ `utils/slices/adminSlice.ts` - Fixed admin login to use adminAxios with relative URLs
- ✅ `app/admin/dashboard/page.tsx` - Already configured correctly

## API Endpoints Being Used
All admin endpoints are configured in `utils/config.ts` → `ENDPOINTS.ADMIN`:
- Login: `/api/v1/admin/login`
- Dashboard Stats: `/api/admin/dashboard/stats`
- Leaderboard: `/api/admin/dashboard/leaderboard`
- Recent Activities: `/api/admin/activities/recent`
- Recent Transactions: `/api/admin/analytics/recent-transactions`
- Recent Trips: `/api/admin/analytics/recent-trips`

All these endpoints will be proxied to `http://localhost:8081` when accessed from the Next.js app.

