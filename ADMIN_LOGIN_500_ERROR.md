# Admin Login 500 Error Troubleshooting

## Problem
Admin login endpoint `/api/v1/admin/login` returns 500 Internal Server Error.

## Current Status
✅ Frontend is correctly configured  
✅ API calls are going to correct endpoint  
✅ Error handling improved  
❌ Backend returning 500 error  

## What's Working

### Frontend Configuration ✅
- Endpoint: `/api/v1/admin/login` (from `utils/config.ts`)
- Proxy: `http://localhost:8081` (from `next.config.mjs`)
- Request body: `{ username: string, password: string }`
- Headers: No auth token required for login

### Error Handling ✅  
Enhanced logging added to capture:
- Request URL
- Request credentials (username visible, password masked)
- Response status
- Response data
- Error details

## What to Check

### 1. Backend is Running
Verify your backend is running on port 8081:

```bash
# Test if backend is accessible
curl http://localhost:8081/api/v1/admin/login

# Should NOT return "Connection refused"
```

### 2. Backend Logs
Check your backend console/logs for:
- Java stack traces
- Database connection errors
- Exception details
- Missing dependencies

### 3. Request Format
The backend might expect a different format:

**Current format:**
```json
{
  "username": "murthy@testing.com",
  "password": "mmurthy123"
}
```

**Possible expected formats:**
```json
{
  "email": "murthy@testing.com",
  "password": "mmurthy123"
}
```

```json
{
  "username": "murthy@testing.com",
  "password": "mmurthy123",
  "role": "ADMIN"
}
```

### 4. Backend Dependencies
Common 500 causes:
- Database not connected
- Missing environment variables
- Bean creation failed
- Service implementation missing
- Authentication service error

### 5. Check Swagger/API Docs
If your backend has Swagger UI:
- Navigate to: `http://localhost:8081/swagger-ui.html` or `/api-docs`
- Find `/api/v1/admin/login` endpoint
- Check expected request body format
- Test directly from Swagger

## Debugging Steps

### Step 1: Check Console Logs
After refresh, you should see in browser console:

```
[adminSlice] Attempting login to: /api/v1/admin/login
[adminSlice] Credentials: {username: 'murthy@testing.com', password: '***'}
[adminSlice] Login error details: {status: 500, statusText: '...', data: {...}}
```

This will show the exact error from backend.

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try login again
4. Look for `/api/v1/admin/login` request
5. Check:
   - Request payload
   - Response status
   - Response preview

### Step 3: Test Backend Directly
Try calling the backend directly (bypassing Next.js):

```bash
curl -X POST http://localhost:8081/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"murthy@testing.com","password":"mmurthy123"}'
```

This will show the raw backend response.

### Step 4: Check Backend Spring Boot Logs
Look for errors like:
- `Application startup failed`
- `BeanDefinitionStoreException`
- `AuthenticationServiceException`
- Database connection errors
- JPA/Hibernate errors

## Common Solutions

### Solution 1: Fix Backend Request Format
If backend expects different format, update `adminSlice.ts`:

```typescript
// If backend expects "email" instead of "username"
const response = await adminAxios.post(config.ENDPOINTS.ADMIN.LOGIN, {
  email: credentials.username,
  password: credentials.password
});
```

### Solution 2: Add Missing Headers
If backend requires specific headers:

```typescript
const response = await adminAxios.post(
  config.ENDPOINTS.ADMIN.LOGIN, 
  credentials,
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
);
```

### Solution 3: Check Backend Spring Profile
Your backend might need specific profile enabled:
- Check `application.properties` or `application.yml`
- Enable correct profile: `spring.profiles.active=dev`
- Check database configuration

## Files Modified

### Enhanced Error Logging ✅
**File:** `utils/slices/adminSlice.ts`
- Added detailed console logging
- Improved error message extraction
- Shows full error details

### Enhanced Error Display ✅
**File:** `app/admin/dashboard/page.tsx`
- Better error messages
- Shows specific status codes

## Next Steps

1. **Check backend logs** for specific error
2. **Test backend directly** using curl/Swagger
3. **Verify request format** matches backend expectations
4. **Check database** is connected
5. **Verify backend dependencies** are loaded

## Need Help?

Please provide:
1. **Backend logs** - Full stack trace
2. **Network tab details** - Response payload
3. **Swagger output** - If available
4. **Database status** - Is it connected?
5. **Backend version** - Spring Boot version

## Quick Test

Run this in your terminal to test backend:

```bash
curl -v POST http://localhost:8081/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"murthy@testing.com","password":"mmurthy123"}'
```

Copy the full output including:
- HTTP status code
- Response headers
- Response body
- Any error messages

This will help identify the exact issue.


