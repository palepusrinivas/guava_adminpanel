# Banner Setup - Quick Start Guide

## 🚀 Quick Access
**URL**: `http://localhost:3000/admin/banner-setup`

**Location in Sidebar**: Admin Portal → PROMOTION MANAGEMENT → Banner Setup

## ✨ What's New

### New Admin Navigation Structure
The sidebar now has organized sections:
```
📊 DASHBOARD
   - Dashboard
   - Heat Map
   - Fleet View

🌍 ZONE MANAGEMENT
   - Zones

🚕 TRIP MANAGEMENT
   - Trips

🎯 PROMOTION MANAGEMENT  ← NEW!
   - Banner Setup        ← NEW!

👥 USER MANAGEMENT
   - Users
   - Drivers

📦 OTHER
   - Pricing, Fleet, Analytics, Wallet
```

## 📋 Quick Feature Overview

### Add Banner Form
1. **Title**: Short catchy title (max 100 chars)
2. **Description**: Detailed info (max 800 chars)
3. **Link**: Where users go when clicking banner
4. **Period**: How long banner stays active
5. **Image**: Upload with drag-drop (max 5MB, 3:1 ratio)

### Banner List
- **3 Filters**: All, Active, Inactive
- **Actions per banner**: 
  - Toggle Active/Inactive status
  - Delete banner
- **Display**: Grid layout with image preview
- **Counter**: Total banners shown in header

## 🎨 Design Highlights

- **Color**: Teal/mint green theme (#14B8A6)
- **Layout**: Clean cards with shadows
- **Upload**: Interactive drag-drop zone
- **Responsive**: Works on all devices
- **Validation**: Real-time form validation
- **Loading**: Smooth loading states

## 🔧 Technical Details

### New Files Created
1. `utils/slices/bannerSlice.ts` - State management
2. `utils/reducers/adminReducers.ts` - API calls (updated)
3. `components/Admin/BannerSetup.tsx` - Main component
4. `app/admin/banner-setup/page.tsx` - Page route
5. `utils/store/store.ts` - Store config (updated)
6. `utils/config.ts` - API endpoints (updated)
7. `utils/apiRoutes.ts` - Route helpers (updated)
8. `components/Admin/AdminDashboardLayout.tsx` - Navigation (updated)

### Backend Endpoints Required
```
GET    /api/admin/banners          - List all banners
GET    /api/admin/banners/:id      - Get single banner
POST   /api/admin/banners          - Create banner
PUT    /api/admin/banners/:id      - Update banner
DELETE /api/admin/banners/:id      - Delete banner
```

## 🧪 Testing Steps

1. **Login** to admin panel at `/admin/login`
2. **Navigate** to Banner Setup from sidebar
3. **Create** a test banner:
   - Title: "Welcome Offer"
   - Description: "Get 20% off on your first 3 rides"
   - Link: "https://example.com"
   - Period: "1 month"
   - Upload any image
4. **Verify** banner appears in list
5. **Test** filter tabs (All/Active/Inactive)
6. **Toggle** banner status
7. **Delete** test banner

## 📱 Responsive Breakpoints

- **Mobile** (< 768px): 1 column grid, collapsible sidebar
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (> 1024px): 3 column grid, fixed sidebar

## ⚠️ Important Notes

1. **Backend Required**: Ensure banner endpoints are implemented
2. **Authentication**: Only ADMIN/SUPER_ADMIN can access
3. **Image Size**: Max 5MB per image
4. **Image Format**: .jpg, .jpeg, .png, .webp only
5. **URL Validation**: Redirect link must be valid URL

## 🎯 Common Use Cases

### Promotional Banners
- Flash sales (1 week period)
- Seasonal offers (1-3 months)
- Festival discounts (2-4 weeks)

### Informational Banners
- New feature announcements (permanent)
- Service updates (1 month)
- Safety guidelines (permanent)

### Event Banners
- Special events (custom period)
- Partnerships (3-6 months)
- Referral programs (permanent)

## 🔍 Troubleshooting

**Q: Banner Setup not showing in sidebar?**
- Clear cache and refresh
- Verify admin login
- Check user role is ADMIN or SUPER_ADMIN

**Q: Image upload failing?**
- Check file size < 5MB
- Verify format is supported
- Ensure backend accepts multipart/form-data

**Q: Banners not loading?**
- Open browser console for errors
- Check network tab for API calls
- Verify backend endpoints are working

**Q: Can't create banner?**
- Fill all required fields (marked with *)
- Ensure redirect link is valid URL
- Check image is uploaded

## 📞 Need Help?

1. Check `BANNER_SETUP_IMPLEMENTATION.md` for detailed docs
2. Review Redux DevTools for state issues
3. Check browser console for JavaScript errors
4. Verify API endpoints with network inspector

---

**Status**: ✅ Ready to Use
**Version**: 1.0.0
**Last Updated**: October 30, 2025


