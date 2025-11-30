# Admin Panel Documentation

This document provides comprehensive information about the admin panel implementation for the RideFast application.

## Overview

The admin panel is a comprehensive management system that allows administrators to manage users, drivers, pricing, zones, fleet, analytics, and wallet operations. It's built with React, Next.js, TypeScript, and Redux Toolkit, following the same patterns as the main application.

## Features

### 🔐 Authentication
- **Admin Login**: Secure authentication for admin users
- **Role-based Access**: Support for ADMIN and SUPER_ADMIN roles
- **Session Management**: Persistent login with localStorage
- **Route Protection**: Automatic redirection based on authentication status

### 👥 User Management
- **User CRUD Operations**: Create, read, update, and delete users
- **Role Management**: Assign and modify user roles (NORMAL_USER, ADMIN, SUPER_ADMIN)
- **User Details**: View and edit user information including name, email, phone
- **Password Management**: Reset user passwords

### 🚗 Driver Management
- **Driver CRUD Operations**: Complete driver lifecycle management
- **Location Tracking**: Monitor driver locations and status
- **Rating Management**: View and manage driver ratings
- **KYC Management**: Handle driver KYC documents and verification

### 💰 Pricing Management
- **Dynamic Pricing**: Configure base fare, per-km rates, and time-based charges
- **Surge Pricing**: Set surge multipliers for peak hours
- **Fee Management**: Manage cancellation fees and minimum fares
- **Real-time Updates**: Apply pricing changes immediately

### 🗺️ Zone Management
- **Service Zones**: Define and manage service coverage areas
- **Geographic Boundaries**: Set polygon coordinates for zones
- **Zone Status**: Activate/deactivate zones as needed
- **Zone Analytics**: Track performance by zone

### 🚛 Fleet Management
- **Real-time Tracking**: Monitor driver locations and status
- **Fleet Statistics**: View available, on-ride, and offline drivers
- **Driver Details**: Access comprehensive driver information
- **Map Integration**: Visual representation of fleet distribution

### 📊 Analytics Dashboard
- **Performance Metrics**: Track rides, revenue, and user engagement
- **Heatmap Visualization**: Geographic distribution of ride requests
- **Zone Analytics**: Performance analysis by service zones
- **Time-based Reports**: Historical data and trends

### 💳 Wallet Management
- **User Wallets**: Credit and manage user wallet balances
- **Driver Wallets**: Handle driver earnings and payments
- **Transaction History**: Track all wallet transactions
- **Financial Reports**: Monitor platform financial health

## Technical Architecture

### State Management
- **Redux Toolkit**: Centralized state management
- **Admin Slice**: Dedicated admin authentication state
- **Admin Reducers**: Comprehensive API integration
- **Type Safety**: Full TypeScript support

### API Integration
- **RESTful Endpoints**: Complete backend API integration
- **Authentication**: Bearer token authentication
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators

### Component Structure
```
components/Admin/
├── AdminDashboardLayout.tsx      # Main admin layout
├── AdminGuardComponent.tsx       # Route protection
├── AdminLoginForm.tsx            # Admin authentication
├── UserManagement.tsx            # User CRUD operations
├── DriverManagement.tsx          # Driver management
├── PricingManagement.tsx         # Pricing configuration
├── ZoneManagement.tsx            # Zone management
├── FleetManagement.tsx           # Fleet monitoring
├── AnalyticsDashboard.tsx        # Analytics and reporting
└── WalletManagement.tsx          # Wallet operations
```

### Page Structure
```
app/admin/
├── layout.tsx                    # Admin layout wrapper
├── login/page.tsx               # Admin login
├── dashboard/page.tsx           # Main dashboard
├── users/page.tsx               # User management
├── drivers/page.tsx              # Driver management
├── pricing/page.tsx             # Pricing management
├── zones/page.tsx                # Zone management
├── fleet/page.tsx                # Fleet management
├── analytics/page.tsx           # Analytics dashboard
└── wallet/page.tsx               # Wallet management
```

## API Endpoints

### Authentication
- `POST /api/v1/admin/login` - Admin login

### User Management
- `GET /api/admin/users` - List users (paginated)
- `GET /api/admin/users/{id}` - Get user by ID
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

### Driver Management
- `GET /api/admin/drivers` - List drivers (paginated)
- `GET /api/admin/drivers/{id}` - Get driver by ID
- `POST /api/admin/drivers` - Create driver
- `PUT /api/admin/drivers/{id}` - Update driver
- `DELETE /api/admin/drivers/{id}` - Delete driver

### Driver KYC
- `GET /api/admin/kyc/drivers/{id}` - Get driver KYC
- `PUT /api/admin/kyc/drivers/{id}/files/{name}` - Upload KYC file
- `DELETE /api/admin/kyc/drivers/{id}/files/{name}` - Delete KYC file
- `GET /api/admin/kyc/drivers/{id}/files/{name}/download` - Download KYC file

### Pricing Management
- `GET /api/v1/admin/pricing` - Get pricing configuration
- `PUT /api/v1/admin/pricing` - Update pricing configuration

### Zone Management
- `GET /api/admin/zones` - List zones
- `GET /api/admin/zones/{id}` - Get zone by ID
- `POST /api/admin/zones` - Create zone
- `PUT /api/admin/zones/{id}` - Update zone
- `DELETE /api/admin/zones/{id}` - Delete zone

### Fleet Management
- `GET /api/admin/fleet/locations` - Get fleet locations

### Wallet Management
- `POST /api/admin/wallet/credit/user/{id}` - Credit user wallet
- `POST /api/admin/wallet/credit/driver/{id}` - Credit driver wallet

### Analytics
- `GET /api/admin/analytics/heatmap` - Get analytics heatmap

## Usage Guide

### Getting Started
1. **Access Admin Panel**: Navigate to `/admin/login`
2. **Login**: Use admin credentials (username/password)
3. **Dashboard**: View system overview and key metrics
4. **Navigation**: Use sidebar to access different modules

### User Management
1. **View Users**: Navigate to Users section
2. **Create User**: Click "Add New User" button
3. **Edit User**: Click "Edit" on any user row
4. **Delete User**: Click "Delete" and confirm action

### Driver Management
1. **View Drivers**: Navigate to Drivers section
2. **Create Driver**: Click "Add New Driver" button
3. **Edit Driver**: Click "Edit" on any driver row
4. **Manage KYC**: Upload and manage driver documents

### Pricing Configuration
1. **Access Pricing**: Navigate to Pricing section
2. **Edit Pricing**: Click "Edit Pricing" button
3. **Update Values**: Modify pricing parameters
4. **Save Changes**: Apply new pricing configuration

### Zone Management
1. **View Zones**: Navigate to Zones section
2. **Create Zone**: Click "Add New Zone" button
3. **Define Boundaries**: Set polygon coordinates
4. **Activate/Deactivate**: Toggle zone status

### Fleet Monitoring
1. **View Fleet**: Navigate to Fleet section
2. **Switch Views**: Toggle between list and map views
3. **Driver Details**: Click on any driver for details
4. **Real-time Updates**: Monitor live driver status

### Analytics
1. **Dashboard**: Navigate to Analytics section
2. **Date Range**: Select time period for analysis
3. **Metrics**: View key performance indicators
4. **Reports**: Generate detailed reports

### Wallet Operations
1. **Access Wallet**: Navigate to Wallet section
2. **Credit User**: Click "Credit User Wallet"
3. **Credit Driver**: Click "Credit Driver Wallet"
4. **Transaction History**: View all transactions

## Security Features

### Authentication
- **Secure Login**: Encrypted password transmission
- **Session Management**: Automatic logout on token expiry
- **Role Validation**: Server-side role verification

### Authorization
- **Route Protection**: Admin-only access to admin routes
- **API Security**: Bearer token authentication
- **Permission Checks**: Role-based feature access

### Data Protection
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Secure form submissions

## Error Handling

### User Experience
- **Loading States**: Visual feedback during operations
- **Error Messages**: Clear, actionable error messages
- **Success Notifications**: Confirmation of successful operations

### Technical Error Handling
- **API Errors**: Comprehensive error catching
- **Network Issues**: Graceful handling of connectivity problems
- **Validation Errors**: Field-specific error messages

## Performance Optimization

### Code Splitting
- **Lazy Loading**: Dynamic imports for admin components
- **Bundle Optimization**: Minimal bundle size for admin features

### Caching
- **API Caching**: Intelligent data caching
- **State Persistence**: Redux state persistence

### UI Optimization
- **Responsive Design**: Mobile-friendly admin interface
- **Loading States**: Smooth user experience
- **Efficient Rendering**: Optimized component updates

## Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting

### Component Patterns
- **Functional Components**: Modern React patterns
- **Custom Hooks**: Reusable logic extraction
- **Error Boundaries**: Graceful error handling

### Testing
- **Unit Tests**: Component testing
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user flows

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net
NEXT_PUBLIC_ADMIN_ENABLED=true
```

### Build Configuration
- **Production Build**: Optimized for production
- **Environment Specific**: Different configs for dev/staging/prod
- **Security Headers**: Secure HTTP headers

## Troubleshooting

### Common Issues
1. **Login Problems**: Check credentials and network
2. **Permission Errors**: Verify admin role assignment
3. **API Errors**: Check backend connectivity
4. **Data Loading**: Verify API endpoints

### Debug Tools
- **Redux DevTools**: State inspection
- **Network Tab**: API request monitoring
- **Console Logs**: Error tracking

## Support

For technical support or questions about the admin panel:
1. Check the troubleshooting section
2. Review API documentation
3. Contact the development team

## Future Enhancements

### Planned Features
- **Advanced Analytics**: More detailed reporting
- **Bulk Operations**: Mass user/driver management
- **Audit Logs**: Comprehensive activity tracking
- **Mobile App**: Native admin mobile app

### Integration Opportunities
- **Third-party Analytics**: Google Analytics integration
- **Payment Gateways**: Additional payment options
- **Communication**: Email/SMS notifications
- **Reporting**: Advanced reporting tools

---

This admin panel provides a comprehensive solution for managing the RideFast platform, with robust security, excellent user experience, and scalable architecture.
