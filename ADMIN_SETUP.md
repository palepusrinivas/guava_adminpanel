# Admin Panel Setup Guide

This guide will help you set up and test the admin panel with your backend API running on `http://localhost:8080`.

## 🚀 Quick Start

### 1. Prerequisites
- Backend API running on `http://localhost:8080`
- Admin user credentials (username/password)
- Node.js and npm installed

### 2. Access the Admin Panel
1. Start your frontend application: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Login with your admin credentials

### 3. Test API Connection
1. Navigate to: `http://localhost:3000/admin/test`
2. Click "Run All Tests" to verify API connectivity
3. Check test results for any issues

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=RideFast
NEXT_PUBLIC_APP_DESCRIPTION=A Ride Sharing Application
```

### Backend API Requirements
Your backend should have the following endpoints available:

#### Authentication
- `POST /api/v1/admin/login` - Admin login

#### User Management
- `GET /api/admin/users` - List users (with pagination)
- `GET /api/admin/users/{id}` - Get user by ID
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

#### Driver Management
- `GET /api/admin/drivers` - List drivers (with pagination)
- `GET /api/admin/drivers/{id}` - Get driver by ID
- `POST /api/admin/drivers` - Create driver
- `PUT /api/admin/drivers/{id}` - Update driver
- `DELETE /api/admin/drivers/{id}` - Delete driver

#### Driver KYC
- `GET /api/admin/kyc/drivers/{id}` - Get driver KYC
- `PUT /api/admin/kyc/drivers/{id}/files/{name}` - Upload KYC file
- `DELETE /api/admin/kyc/drivers/{id}/files/{name}` - Delete KYC file
- `GET /api/admin/kyc/drivers/{id}/files/{name}/download` - Download KYC file

#### Pricing Management
- `GET /api/v1/admin/pricing` - Get pricing configuration
- `PUT /api/v1/admin/pricing` - Update pricing configuration

#### Zone Management
- `GET /api/admin/zones` - List zones
- `GET /api/admin/zones/{id}` - Get zone by ID
- `POST /api/admin/zones` - Create zone
- `PUT /api/admin/zones/{id}` - Update zone
- `DELETE /api/admin/zones/{id}` - Delete zone

#### Fleet Management
- `GET /api/admin/fleet/locations` - Get fleet locations

#### Wallet Management
- `POST /api/admin/wallet/credit/user/{id}` - Credit user wallet
- `POST /api/admin/wallet/credit/driver/{id}` - Credit driver wallet

#### Analytics
- `GET /api/admin/analytics/heatmap` - Get analytics heatmap

## 🧪 Testing

### 1. API Connection Test
Visit `http://localhost:3000/admin/test` to run automated tests:

- **Admin Login Test**: Verifies authentication
- **Get Users Test**: Tests user management API
- **Get Drivers Test**: Tests driver management API
- **Get Pricing Test**: Tests pricing configuration API

### 2. Manual Testing
1. **Login**: Try logging in with admin credentials
2. **Dashboard**: Check if dashboard loads with statistics
3. **User Management**: Create, edit, and delete users
4. **Driver Management**: Manage driver accounts
5. **Pricing**: Update pricing configuration
6. **Zones**: Create and manage service zones
7. **Fleet**: Monitor driver locations
8. **Analytics**: View performance metrics
9. **Wallet**: Credit user and driver wallets

## 🔒 Security

### Authentication
- All admin routes require authentication
- Bearer token authentication for API calls
- Automatic logout on token expiry
- Role-based access control (ADMIN/SUPER_ADMIN)

### Authorization
- Route protection for admin-only access
- API endpoint security
- Input validation and sanitization

## 🐛 Troubleshooting

### Common Issues

#### 1. Login Issues
**Problem**: Cannot login to admin panel
**Solutions**:
- Verify backend is running on `http://localhost:8080`
- Check admin credentials are correct
- Ensure `/api/v1/admin/login` endpoint is working
- Check browser console for errors

#### 2. API Connection Issues
**Problem**: API calls failing
**Solutions**:
- Verify backend API is accessible
- Check CORS configuration on backend
- Ensure all required endpoints are implemented
- Check network tab in browser dev tools

#### 3. Permission Errors
**Problem**: Access denied errors
**Solutions**:
- Verify user has ADMIN or SUPER_ADMIN role
- Check token is valid and not expired
- Ensure proper authentication headers

#### 4. Data Loading Issues
**Problem**: Data not loading in admin panels
**Solutions**:
- Check API response format matches expected structure
- Verify pagination parameters
- Check for JavaScript errors in console

### Debug Tools

#### Browser Dev Tools
1. **Network Tab**: Monitor API requests and responses
2. **Console Tab**: Check for JavaScript errors
3. **Application Tab**: Verify localStorage tokens

#### Redux DevTools
1. Install Redux DevTools browser extension
2. Monitor state changes
3. Debug action dispatches

## 📱 Features Overview

### Dashboard
- System overview and key metrics
- Recent activities
- Quick actions
- System status

### User Management
- List all users with pagination
- Create new users
- Edit user details and roles
- Delete users
- Search and filter users

### Driver Management
- List all drivers with pagination
- Create new drivers
- Edit driver information
- Manage driver KYC documents
- Delete drivers

### Pricing Management
- Configure base fare and rates
- Set surge pricing multipliers
- Manage cancellation fees
- Update minimum fare requirements

### Zone Management
- Create service zones
- Define geographic boundaries
- Activate/deactivate zones
- Monitor zone performance

### Fleet Management
- Real-time driver locations
- Driver status monitoring
- Fleet statistics
- Driver details and performance

### Analytics
- Performance metrics
- Revenue tracking
- User engagement
- Zone-based analytics
- Heatmap visualization

### Wallet Management
- Credit user wallets
- Credit driver wallets
- Transaction history
- Financial reporting

## 🚀 Deployment

### Production Setup
1. Update `NEXT_PUBLIC_API_BASE_URL` to production API URL
2. Configure proper CORS settings on backend
3. Set up SSL certificates for HTTPS
4. Configure environment variables
5. Build and deploy frontend

### Environment Configuration
```env
# Production
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=RideFast Admin
NEXT_PUBLIC_APP_DESCRIPTION=Admin Panel for RideFast
```

## 📞 Support

If you encounter any issues:

1. **Check the test page**: Visit `/admin/test` for API connectivity
2. **Review logs**: Check browser console and network tab
3. **Verify backend**: Ensure all API endpoints are working
4. **Check documentation**: Review API endpoint documentation

## 🔄 Updates

The admin panel is designed to be easily extensible:

- **New Features**: Add new components in `components/Admin/`
- **New Pages**: Create new pages in `app/admin/`
- **API Integration**: Add new reducers in `utils/reducers/`
- **State Management**: Extend admin slice as needed

---

**Ready to go!** Your admin panel is now fully configured and ready to manage your ride-sharing platform. 🎉
