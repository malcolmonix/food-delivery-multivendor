# Enatega Multi-vendor Food Delivery - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18-20
- npm or yarn
- Git

### Automated Setup
```bash
# Make setup script executable and run
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Backend Setup (Port 4000)
```bash
cd dev-backend
npm install
npm run seed  # Creates SQLite database
npm run dev   # Starts on port 4000
```

#### 2. Admin Dashboard (Port 3000)
```bash
cd enatega-multivendor-admin
npm install
npm run dev   # Starts on port 3000
```

#### 3. Customer Web (Port 3001)
```bash
cd enatega-multivendor-web
npm install
npm start     # Starts on port 3001
```

#### 4. Mobile Apps
```bash
# Customer App
cd enatega-multivendor-app
npm install
npm start

# Rider App
cd enatega-multivendor-rider
npm install
npm start

# Store App
cd enatega-multivendor-store
npm install
npm start
```

## 🔧 Configuration

### Standardized Ports
- **Backend**: 4000 (GraphQL API)
- **Admin Dashboard**: 3000
- **Customer Web**: 3001
- **Mobile Apps**: Expo development server

### Environment Variables
All applications use standardized environment variables:

```env
# Backend Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:4000/
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/
PORT=4000
```

### Database
- **Development**: SQLite (`dev-backend/data.db`)
- **Production**: MongoDB (configured separately)

## 🏗️ Architecture

### Backend (Port 4000)
- **Technology**: Node.js + Express + Apollo GraphQL
- **Database**: SQLite (dev) / MongoDB (prod)
- **Features**: 
  - GraphQL API with subscriptions
  - CORS enabled for ports 3000-3001
  - Automatic database seeding
  - Authentication system

### Admin Dashboard (Port 3000)
- **Technology**: Next.js + Apollo Client
- **Features**:
  - Restaurant management
  - Order tracking
  - User management
  - Analytics dashboard
  - Real-time updates via WebSocket

### Customer Web (Port 3001)
- **Technology**: React + Apollo Client
- **Features**:
  - Restaurant browsing
  - Order placement
  - Payment integration
  - Order tracking

### Mobile Apps
- **Technology**: React Native + Expo
- **Features**:
  - Cross-platform mobile apps
  - Push notifications
  - Offline support
  - Real-time tracking

## 🔄 Development Workflow

### Starting Development
1. Start backend: `cd dev-backend && npm run dev`
2. Start admin: `cd enatega-multivendor-admin && npm run dev`
3. Start web: `cd enatega-multivendor-web && npm start`
4. Start mobile: `cd enatega-multivendor-app && npm start`

### Testing
```bash
# Backend tests
cd dev-backend && npm test

# Admin tests
cd enatega-multivendor-admin && npm test

# Web tests
cd enatega-multivendor-web && npm test
```

### Building for Production
```bash
# Admin dashboard
cd enatega-multivendor-admin && npm run build

# Customer web
cd enatega-multivendor-web && npm run build

# Mobile apps
cd enatega-multivendor-app && eas build
```

## 🐛 Troubleshooting

### Common Issues

#### Backend not starting
- Check if port 4000 is available
- Verify Node.js version (18-20)
- Run `npm install` in `dev-backend`

#### Admin dashboard connection issues
- Ensure backend is running on port 4000
- Check CORS configuration
- Verify environment variables

#### Mobile app issues
- Clear Expo cache: `expo start -c`
- Check device network connection
- Verify backend URL in app configuration

### Port Conflicts
If you encounter port conflicts, you can:
1. Change ports in respective `package.json` files
2. Update environment variables
3. Update CORS configuration in backend

## 📚 Additional Resources

- [Official Documentation](https://enatega.com/multi-vendor-doc/)
- [GraphQL Playground](http://localhost:4000/graphql)
- [Admin Dashboard](http://localhost:3000)
- [Customer Web](http://localhost:3001)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

