# RideFast - Ride Sharing Application

A modern ride-sharing application built with Next.js, TypeScript, and Redux Toolkit, similar to Rapido or Ola. This application allows customers to book rides conveniently and drivers to manage their rides.

## Features

- **User Authentication**: Login/Register for both users and drivers
- **Ride Booking**: Easy ride booking with location autocomplete
- **Real-time Tracking**: Track ride status and driver location
- **Driver Dashboard**: Manage rides, view earnings, and ride history
- **User Dashboard**: View ride history and manage profile
- **Payment Integration**: Secure payment processing
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS, Material-UI
- **Maps**: LocationIQ API
- **Forms**: Formik with Yup validation
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running on port 8080

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ride_fast_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_LOCATIONIQ_API_KEY=your_locationiq_api_key
NEXT_PUBLIC_APP_NAME=RideFast
NEXT_PUBLIC_APP_DESCRIPTION=A Ride Sharing Application similar to that of Rapido or Ola where a customer can book their ride conveniently
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ride_fast_frontend/
├── app/                    # Next.js app directory
│   ├── bookRide/          # Ride booking pages
│   ├── driver/            # Driver dashboard pages
│   ├── login/             # Authentication pages
│   ├── register/          # Registration pages
│   └── profile/           # User profile pages
├── components/            # Reusable components
│   ├── Auth/              # Authentication components
│   ├── BookRide/          # Ride booking components
│   ├── DriverDashBoard/   # Driver dashboard components
│   ├── HomePage/          # Homepage components
│   └── Payment/           # Payment components
├── utils/                 # Utility functions and configurations
│   ├── reducers/          # Redux reducers
│   ├── slices/            # Redux slices
│   ├── store/             # Redux store configuration
│   ├── apiRoutes.ts       # API endpoint definitions
│   ├── config.ts          # Application configuration
│   └── constants.ts       # Application constants
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The application integrates with a backend API that should be running on `http://localhost:8080` by default. The API endpoints include:

- Authentication (login, register, profile)
- Ride management (request, accept, start, complete)
- User and driver data management

## Configuration

The application configuration is centralized in `utils/config.ts`. You can modify:

- API base URL
- Feature flags
- UI theme colors
- Default values
- API endpoints

## Features Overview

### User Features
- User registration and login
- Ride booking with location search
- Real-time ride tracking
- Ride history and payment
- Profile management

### Driver Features
- Driver registration and login
- Ride allocation and management
- Ride acceptance and completion
- Earnings tracking
- Ride history

### Admin Features
- Company dashboard
- User and driver management
- Analytics and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
