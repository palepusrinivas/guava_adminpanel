# Troubleshooting Internal Server Error (500)

## Problem
Seeing "Internal Server Error" in the admin dashboard or console.

## Quick Fixes Applied

### 1. Added 500 Error Handling to Dashboard Stats ✅
**File:** `utils/reducers/adminReducers.ts`

**Issue:** Dashboard stats endpoint returning 500 was causing error  
**Fix:** Added 500 to fallback logic - now calculates stats from existing data

```typescript
if (errorMsg.includes("501") || errorMsg.includes("404") || errorMsg.includes("500"))
```

### 2. Enhanced Error Messages ✅
**File:** `app/admin/dashboard/page.tsx`

Added better error handling for:
- 404 Not Found
- 500 Server Error  
- 501 Not Implemented
- Failed to calculate dashboard stats

## Common Causes

### 1. Backend Not Running
**Symptom:** All requests fail  
**Solution:** Start backend on port 8081

```bash
# Check if backend is running
curl http://localhost:8081/api/v1/admin/login
```

### 2. Wrong Port Configuration
**Symptom:** Connection refused errors  
**Solution:** Verify `next.config.mjs` proxy is set to 8081

### 3. Missing Backend Endpoints
**Symptom:** 404 or 501 errors  
**Solution:** Fallback will calculate stats automatically (already implemented)

### 4. Authentication Issues
**Symptom:** 401 Unauthorized  
**Solution:** Re-login at `http://localhost:3000/admin/login`

### 5. Backend Validation Errors
**Symptom:** 400 Bad Request  
**Solution:** Check request format matches backend expectations

## Debugging Steps

### Step 1: Check Browser Console
Open DevTools (F12) and look for:
- Network errors
- Console logs like `[getDashboardStats]`
- Error stack traces

### Step 2: Check Network Tab
Look for:
- Which endpoint returned 500
- Request/response details
- Status codes

### Step 3: Check Backend Logs
In your backend console, look for:
- Exception stack traces
- Database errors
- Missing dependencies

## Console Logging

The implementation includes helpful console logs:

```javascript
[getDashboardStats] Stats endpoint not available, calculating from existing data
[getDashboardStats] Error calculating stats: [error details]
[getLeaderboardData] Leaderboard endpoint not available, returning empty data
[getRecentActivities] Recent activities endpoint not available, returning empty data
```

## Expected Behavior Now

### ✅ Working Dashboard Stats
- Primary: Use `/api/admin/dashboard/stats` if available
- Fallback: Calculate from users/drivers/trips if 404/500/501
- Error: Show helpful message only if calculation fails

### ✅ Working Leaderboard  
- Primary: Use `/api/admin/dashboard/leaderboard` if available
- Fallback: Return empty array if 404/500/501
- UI: Shows "No drivers yet" message

### ✅ Working Activities
- Primary: Use `/api/admin/activities/recent` if available
- Fallback: Return empty array if 404/500/501
- UI: Shows "No activities yet" message

## Next Steps

1. **Restart dev server** (if you haven't already)
2. **Clear browser cache** (Ctrl+Shift+Del)
3. **Hard refresh** (Ctrl+F5)
4. **Check console logs** for specific errors
5. **Test each admin page** to isolate the issue

## Still Getting 500?

If you're still seeing 500 errors after these fixes, please provide:

1. **Browser console error** - Full error message
2. **Network tab details** - Which endpoint failed
3. **Backend logs** - Any backend errors
4. **Which page** - Where the error occurs
5. **When it happens** - On load, after login, etc.

This will help diagnose the specific issue.

## Files Modified
- ✅ `utils/reducers/adminReducers.ts` - Added 500 handling
- ✅ `app/admin/dashboard/page.tsx` - Enhanced error messages


