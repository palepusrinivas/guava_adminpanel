# Banner Setup Implementation Guide

## Overview
A comprehensive banner management system has been added to the admin dashboard, matching the design from your reference image. The implementation includes full CRUD operations, image upload functionality, and a beautiful teal-themed UI.

## Features Implemented

### 1. Banner Management Component (`components/Admin/BannerSetup.tsx`)
- **Add New Banner Form** with the following fields:
  - Banner Title (required, max 100 chars)
  - Short Description (required, max 800 chars with live counter)
  - Redirect Link (required, must be valid URL)
  - Time Period dropdown (1 week to permanent)
  - Banner Image upload with drag & drop support
  - Image preview before submission
  - Supports .jpg, .jpeg, .png, .webp formats
  - Maximum file size: 5 MB
  - Recommended ratio: 3:1

- **Banner List Section** with:
  - Filter tabs: All, Active, Inactive
  - Total banner count display
  - Banner cards with image preview
  - Toggle active/inactive status
  - Delete banner functionality
  - Responsive grid layout (1-3 columns based on screen size)

### 2. Redux State Management
- **Banner Slice** (`utils/slices/bannerSlice.ts`):
  - State for banners, loading, errors, and filters
  - Actions for CRUD operations
  - Filter state management

- **Admin Reducers** (`utils/reducers/adminReducers.ts`):
  - `getBanners`: Fetch all banners
  - `getBannerById`: Fetch single banner
  - `createBanner`: Create new banner with image upload
  - `updateBanner`: Update banner details
  - `deleteBanner`: Remove banner

### 3. API Integration
- **Endpoints added** to `utils/config.ts`:
  - `BANNERS: "/api/admin/banners"`
  - `BANNER_BY_ID: "/api/admin/banners/:id"`

- **API Routes** in `utils/apiRoutes.ts`:
  - `adminBannersUrl`: Base endpoint for banners
  - `adminBannerByIdUrl(id)`: Endpoint for specific banner operations

### 4. Navigation Structure
Updated `components/Admin/AdminDashboardLayout.tsx` with:
- **Sectioned Navigation** matching the design:
  - DASHBOARD (Dashboard, Heat Map, Fleet View)
  - ZONE MANAGEMENT (Zones)
  - TRIP MANAGEMENT (Trips)
  - **PROMOTION MANAGEMENT (Banner Setup)** ← NEW
  - USER MANAGEMENT (Users, Drivers)
  - OTHER (Pricing, Fleet, Analytics, Wallet)

- Color scheme updated to teal for active states
- Hierarchical menu structure with section headers

### 5. Page Route
- **Route**: `/admin/banner-setup`
- **File**: `app/admin/banner-setup/page.tsx`
- Fully integrated with admin layout and authentication

## Design Features

### Color Scheme
- Primary: Teal (#14B8A6 / teal-500, teal-600)
- Active state: Teal-100 background with teal-900 text
- Error: Red (#EF4444)
- Success: Green (#10B981)

### UI Components
- Rounded corners on all cards and inputs
- Shadow effects for depth
- Smooth transitions and hover effects
- Responsive design for all screen sizes
- Form validation with error messages
- Loading states with spinners
- Drag and drop image upload area

## Usage

### Accessing the Page
1. Navigate to `/admin/banner-setup` in your admin dashboard
2. Or click "Banner Setup" in the left sidebar under "PROMOTION MANAGEMENT"

### Creating a Banner
1. Fill in the banner title (e.g., "50% Off")
2. Add a short description (max 800 characters)
3. Enter a redirect link (must be a valid URL)
4. Select a time period from the dropdown
5. Upload a banner image:
   - Click the upload area or drag & drop an image
   - Supported formats: .jpg, .jpeg, .png, .webp
   - Maximum size: 5 MB
   - Recommended ratio: 3:1
6. Click "SUBMIT" button

### Managing Banners
- **Filter**: Use All/Active/Inactive tabs to filter banners
- **Activate/Deactivate**: Click the respective button on each banner card
- **Delete**: Click the "Delete" button (confirmation prompt will appear)
- **View Count**: Total banners displayed in the top right

## Backend Requirements

The backend should implement the following endpoints:

### GET /api/admin/banners
Returns array of all banners:
```json
[
  {
    "id": 1,
    "title": "50% Off",
    "shortDescription": "Get 50% off on your first ride",
    "redirectLink": "https://example.com",
    "timePeriod": "1month",
    "imageUrl": "https://cdn.example.com/banner1.jpg",
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/admin/banners/:id
Returns single banner with same structure as above.

### POST /api/admin/banners
Accepts FormData with:
- `title`: string
- `shortDescription`: string
- `redirectLink`: string (URL)
- `timePeriod`: string
- `bannerImage`: File
- `active`: boolean (optional, defaults to true)

Returns created banner object.

### PUT /api/admin/banners/:id
Accepts FormData with same fields as POST.
Returns updated banner object.

### DELETE /api/admin/banners/:id
Deletes banner and returns 204 No Content or success message.

## File Structure

```
ride_fast_frontend/
├── app/
│   └── admin/
│       └── banner-setup/
│           └── page.tsx                    # Banner setup page route
├── components/
│   └── Admin/
│       ├── AdminDashboardLayout.tsx        # Updated with new navigation
│       └── BannerSetup.tsx                 # Main banner component
├── utils/
│   ├── slices/
│   │   └── bannerSlice.ts                  # Banner Redux slice
│   ├── reducers/
│   │   └── adminReducers.ts                # Added banner reducers
│   ├── store/
│   │   └── store.ts                        # Added banner reducer to store
│   ├── apiRoutes.ts                        # Added banner API routes
│   └── config.ts                           # Added banner endpoints
└── BANNER_SETUP_IMPLEMENTATION.md          # This file
```

## Testing Checklist

- [ ] Can navigate to banner setup page from admin dashboard
- [ ] Form validation works correctly (all required fields)
- [ ] Character counter updates for description field
- [ ] Image upload works with click and drag-drop
- [ ] Image preview displays correctly
- [ ] Can submit form and create banner
- [ ] Banners display in the list section
- [ ] Filter tabs work (All, Active, Inactive)
- [ ] Can toggle banner status (active/inactive)
- [ ] Can delete banners
- [ ] Total banner count is accurate
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Navigation sections display correctly
- [ ] Active navigation item highlighted in teal

## Troubleshooting

### Image Upload Issues
- Ensure the backend accepts `multipart/form-data`
- Check file size doesn't exceed 5 MB
- Verify file format is supported (.jpg, .jpeg, .png, .webp)

### API Connection Issues
- Verify `NEXT_PUBLIC_API_BASE_URL` in environment variables
- Check admin authentication token is valid
- Ensure banner endpoints are implemented on backend

### Navigation Not Showing
- Clear browser cache and reload
- Check admin user has proper role (ADMIN or SUPER_ADMIN)
- Verify user is logged in to admin panel

## Next Steps

Consider adding these enhancements:
1. Banner analytics (views, clicks)
2. Banner scheduling (start/end dates)
3. Multi-language support
4. Banner position/priority ordering
5. A/B testing capabilities
6. Bulk upload functionality
7. Banner templates
8. Image editing capabilities

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API is running
3. Check network tab for failed requests
4. Review Redux state in Redux DevTools
5. Ensure all dependencies are installed (`npm install`)

---

**Implementation Date**: 2025-10-30
**Status**: ✅ Complete and Ready for Use


