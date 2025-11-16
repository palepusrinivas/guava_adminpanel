# Banner Setup - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    /admin/banner-setup                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BANNER SETUP COMPONENT                        │
│              (components/Admin/BannerSetup.tsx)                  │
│                                                                   │
│  ┌─────────────────┐      ┌──────────────────┐                 │
│  │  Add New Banner │      │   Banner List     │                 │
│  │     Form        │      │  with Filtering   │                 │
│  └────────┬────────┘      └────────┬──────────┘                 │
│           │                        │                             │
│           └────────────┬───────────┘                             │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                     REDUX STATE LAYER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              BANNER SLICE (bannerSlice.ts)                │  │
│  │  • State: banners[], isLoading, error, filter             │  │
│  │  • Actions: setFilter, clearError, setSelected            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │         ADMIN REDUCERS (adminReducers.ts)                 │  │
│  │  • getBanners() - Async Thunk                             │  │
│  │  • getBannerById(id) - Async Thunk                        │  │
│  │  • createBanner(formData) - Async Thunk                   │  │
│  │  • updateBanner(id, formData) - Async Thunk               │  │
│  │  • deleteBanner(id) - Async Thunk                         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │              STORE (store.ts)                             │  │
│  │  banner: bannerReducer                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            API ROUTES (apiRoutes.ts)                      │  │
│  │  • adminBannersUrl                                        │  │
│  │  • adminBannerByIdUrl(id)                                 │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │            CONFIG (config.ts)                             │  │
│  │  ENDPOINTS.ADMIN.BANNERS: "/api/admin/banners"           │  │
│  │  ENDPOINTS.ADMIN.BANNER_BY_ID: "/api/admin/banners/:id"  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │          AXIOS CONFIG (axiosConfig.ts)                    │  │
│  │  • adminAxios instance                                    │  │
│  │  • Auth headers                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│                                                                   │
│  GET    /api/admin/banners                                      │
│  GET    /api/admin/banners/:id                                  │
│  POST   /api/admin/banners                                      │
│  PUT    /api/admin/banners/:id                                  │
│  DELETE /api/admin/banners/:id                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 File Structure & Relationships

```
ride_fast_frontend/
│
├── app/
│   └── admin/
│       ├── layout.tsx                    [Wraps with AdminDashboardLayout]
│       │                                           ↓
│       └── banner-setup/
│           └── page.tsx ──────────────────────→ Renders BannerSetup.tsx
│                                                  │
│                                                  ↓
├── components/
│   └── Admin/
│       ├── AdminDashboardLayout.tsx ─────────→ Navigation with PROMOTION
│       │                                        MANAGEMENT section
│       │
│       └── BannerSetup.tsx ───┬──────────────→ Main banner component
│                               │                • Form (Formik)
│                               │                • Image upload
│                               │                • Banner list
│                               │                • Filter tabs
│                               ↓
│                          Uses Redux hooks
│                               ↓
│
├── utils/
│   ├── slices/
│   │   └── bannerSlice.ts ───────────────────→ State definition
│   │        • Banner interface               • Reducers
│   │        • BannerState interface           • Extra reducers
│   │                                          • Export actions
│   │                                                  ↓
│   ├── reducers/
│   │   └── adminReducers.ts ─────────────────→ Async operations
│   │        • getBanners()                     Uses ↓
│   │        • createBanner()
│   │        • updateBanner()                   adminBannersUrl
│   │        • deleteBanner()                   adminBannerByIdUrl
│   │                                                  ↓
│   ├── store/
│   │   └── store.ts ─────────────────────────→ Redux store config
│   │        • Combines all reducers           Imports ↓
│   │        • banner: bannerReducer
│   │        • Export typed hooks              bannerSlice.reducer
│   │
│   ├── apiRoutes.ts ─────────────────────────→ URL builders
│   │    • adminBannersUrl                      Uses ↓
│   │    • adminBannerByIdUrl(id)
│   │                                           config.ENDPOINTS
│   │                                                  ↓
│   └── config.ts ────────────────────────────→ Configuration
│        • API_BASE_URL                        • ENDPOINTS.ADMIN.BANNERS
│        • ENDPOINTS definitions               • ENDPOINTS.ADMIN.BANNER_BY_ID
│
└── Documentation/
    ├── BANNER_SETUP_IMPLEMENTATION.md ───────→ Full implementation guide
    ├── BANNER_QUICK_START.md ────────────────→ Quick reference
    ├── BANNER_SETUP_SUMMARY.md ──────────────→ Summary of changes
    └── BANNER_ARCHITECTURE.md ───────────────→ This file
```

## 🔄 Data Flow

### 1. Create Banner Flow
```
User fills form
      ↓
Click SUBMIT
      ↓
BannerSetup.tsx: formik.handleSubmit()
      ↓
Create FormData with image
      ↓
dispatch(createBanner(formData))
      ↓
adminReducers.ts: createBanner async thunk
      ↓
axios POST /api/admin/banners (multipart/form-data)
      ↓
Backend processes request, saves image, returns banner
      ↓
bannerSlice.ts: createBanner.fulfilled
      ↓
Update state: banners.unshift(newBanner)
      ↓
dispatch(getBanners()) to refresh list
      ↓
Component re-renders with new banner
```

### 2. Get Banners Flow
```
Component mounts
      ↓
useEffect(() => { dispatch(getBanners()) }, [])
      ↓
adminReducers.ts: getBanners async thunk
      ↓
bannerSlice.ts: getBanners.pending
      ↓
Update state: isLoading = true
      ↓
Component shows loading spinner
      ↓
axios GET /api/admin/banners
      ↓
Backend returns banner array
      ↓
bannerSlice.ts: getBanners.fulfilled
      ↓
Update state: banners = payload, isLoading = false
      ↓
Component renders banner list
```

### 3. Filter Banners Flow
```
User clicks filter tab (All/Active/Inactive)
      ↓
dispatch(setFilter('active'))
      ↓
bannerSlice.ts: setFilter reducer
      ↓
Update state: filter = 'active'
      ↓
Component re-renders
      ↓
filteredBanners = banners.filter(b => b.active)
      ↓
Display filtered results
```

### 4. Delete Banner Flow
```
User clicks Delete button
      ↓
Confirm dialog appears
      ↓
User confirms deletion
      ↓
dispatch(deleteBanner(bannerId))
      ↓
adminReducers.ts: deleteBanner async thunk
      ↓
axios DELETE /api/admin/banners/:id
      ↓
Backend deletes banner, returns success
      ↓
bannerSlice.ts: deleteBanner.fulfilled
      ↓
Update state: banners = banners.filter(b => b.id !== deletedId)
      ↓
dispatch(getBanners()) to refresh
      ↓
Component re-renders without deleted banner
```

### 5. Toggle Status Flow
```
User clicks Activate/Deactivate
      ↓
handleToggleStatus(banner)
      ↓
Create FormData with updated active status
      ↓
dispatch(updateBanner({ bannerId, bannerData }))
      ↓
adminReducers.ts: updateBanner async thunk
      ↓
axios PUT /api/admin/banners/:id (multipart/form-data)
      ↓
Backend updates banner, returns updated banner
      ↓
bannerSlice.ts: updateBanner.fulfilled
      ↓
Update state: replace banner in array
      ↓
dispatch(getBanners()) to refresh
      ↓
Component re-renders with updated status
```

## 🔐 Authentication Flow

```
User accesses /admin/banner-setup
      ↓
AdminLayout checks pathname
      ↓
Not /admin/login → Wrap with AdminGuardComponent
      ↓
AdminGuardComponent checks auth state
      ↓
No token or admin → Redirect to /admin/login
      ↓
Has token → Wrap with AdminDashboardLayout
      ↓
AdminDashboardLayout checks admin role
      ↓
Role !== ADMIN/SUPER_ADMIN → Redirect to /admin/login
      ↓
Valid admin → Render sidebar + children
      ↓
Children = BannerSetup component
      ↓
All API calls use adminAxios with auth headers
```

## 📦 Component Hierarchy

```
app/admin/banner-setup/page.tsx
  └── BannerSetup (client component)
       ├── Form Section
       │    ├── Title Input
       │    ├── Description Textarea (with counter)
       │    ├── Redirect Link Input
       │    ├── Time Period Select
       │    ├── Image Upload Area
       │    │    ├── Drag & Drop Zone
       │    │    └── Image Preview
       │    └── Submit Button
       │
       └── Banner List Section
            ├── Header (with count)
            ├── Filter Tabs
            │    ├── All Tab
            │    ├── Active Tab
            │    └── Inactive Tab
            │
            └── Banner Grid
                 └── Banner Card (repeated)
                      ├── Image
                      ├── Title
                      ├── Description
                      ├── Time Period
                      ├── Status Badge
                      └── Action Buttons
                           ├── Activate/Deactivate
                           └── Delete
```

## 🎨 State Structure

```typescript
// Root State
{
  banner: {
    banners: Banner[],        // Array of all banners
    selectedBanner: Banner | null,  // Currently selected banner
    isLoading: boolean,       // Loading state
    error: string | null,     // Error message
    filter: 'all' | 'active' | 'inactive'  // Current filter
  },
  // ... other slices
}

// Banner Interface
interface Banner {
  id: number;
  title: string;
  shortDescription: string;
  redirectLink: string;
  timePeriod: string;
  imageUrl: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## 🔌 API Contract

### Request Format (Create/Update)
```typescript
// Content-Type: multipart/form-data
FormData {
  title: string;               // "50% Off"
  shortDescription: string;    // "Get amazing discounts..."
  redirectLink: string;        // "https://example.com"
  timePeriod: string;         // "1month"
  bannerImage: File;          // Binary image file
  active?: boolean;           // true (optional for create)
}
```

### Response Format (All operations)
```json
{
  "id": 1,
  "title": "50% Off",
  "shortDescription": "Get amazing discounts on your rides",
  "redirectLink": "https://example.com/offer",
  "timePeriod": "1month",
  "imageUrl": "https://cdn.example.com/banner-123.jpg",
  "active": true,
  "createdAt": "2025-10-30T10:30:00Z",
  "updatedAt": "2025-10-30T10:30:00Z"
}
```

### Error Response Format
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Banner title is required",
  "path": "/api/admin/banners",
  "timestamp": "2025-10-30T10:30:00Z"
}
```

## 🧩 Key Dependencies

```json
{
  "react": "^18.x",
  "next": "^14.x",
  "@reduxjs/toolkit": "^1.9.x",
  "react-redux": "^8.x",
  "formik": "^2.x",
  "yup": "^1.x",
  "axios": "^1.x"
}
```

## 🎯 Design Patterns Used

1. **Container/Component Pattern**
   - Page component: Simple wrapper
   - BannerSetup: Smart component with logic

2. **Redux Toolkit Pattern**
   - Slice-based state management
   - Async thunks for API calls
   - Immutable state updates

3. **Form Management Pattern**
   - Formik for form state
   - Yup for validation schema
   - Controlled components

4. **Composition Pattern**
   - Reusable filter tabs
   - Banner card components
   - Upload area component

5. **Separation of Concerns**
   - UI logic in components
   - Business logic in Redux
   - API calls in reducers
   - Configuration in config files

## 📊 Performance Considerations

1. **Image Optimization**
   - Next.js Image component for banners
   - Lazy loading for banner list
   - Image size validation (5MB max)

2. **State Management**
   - Normalized state structure
   - Efficient filter implementation
   - Memoized selectors (if needed)

3. **API Calls**
   - Single fetch on mount
   - Optimistic updates possible
   - Error boundary for failures

4. **Rendering**
   - Conditional rendering for states
   - Key props for list items
   - Debounced search (future enhancement)

---

## 🔍 Debugging Guide

### Check Redux State
```javascript
// In browser console with Redux DevTools
store.getState().banner
```

### Check API Calls
```javascript
// In browser Network tab
// Filter by: /api/admin/banners
// Check request/response payloads
```

### Check Component State
```javascript
// Add to BannerSetup.tsx
console.log('Banners:', banners);
console.log('Filter:', filter);
console.log('Loading:', isLoading);
```

---

**Architecture Status**: ✅ **COMPLETE & PRODUCTION-READY**

This architecture provides:
- ✅ Scalability for future features
- ✅ Maintainability with clear separation
- ✅ Testability with isolated components
- ✅ Performance optimization
- ✅ Type safety with TypeScript
- ✅ Error handling at all levels


