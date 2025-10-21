# Admin Modernization Migration Guide

## Overview
This guide helps migrate from the old admin system to the new modernized admin dashboard with standardized configuration.

## Key Changes

### 1. Standardized Backend Configuration
- **Port**: All components now use port 4000
- **Auto-discovery**: Automatic endpoint detection
- **Fallback**: Graceful fallback to alternative ports

### 2. Enhanced Apollo Client Setup
- **Error Handling**: Improved error handling and logging
- **WebSocket**: Better WebSocket connection management
- **Caching**: Optimized caching strategies

### 3. New Admin Features
- **Modern UI**: Updated with latest design patterns
- **Better Performance**: Optimized rendering and data fetching
- **Real-time Updates**: Enhanced WebSocket integration

## Migration Steps

### Step 1: Update Environment Variables
```bash
# Old configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:8001/
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:8001/

# New standardized configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:4000/
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/
```

### Step 2: Update Apollo Client Configuration
The new setup includes:
- Automatic endpoint discovery
- Better error handling
- Improved WebSocket management

### Step 3: Test Configuration
Run the configuration test suite:
```bash
# In browser console
testConfiguration.runAllTests()
```

### Step 4: Verify Backend Compatibility
Ensure your backend supports:
- CORS for ports 3000-3001
- GraphQL subscriptions
- Authentication headers

## Configuration Files

### Backend Configuration (`backend-config.ts`)
```typescript
export const BACKEND_CONFIG = {
  PORT: 4000,
  HTTP_URL: 'http://localhost:4000/graphql',
  WS_URL: 'ws://localhost:4000/graphql',
  FALLBACK_PORTS: [3001, 8001, 5000, 8000],
  CORS_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
};
```

### Apollo Client Setup (`useSetApollo.tsx`)
```typescript
// Standardized configuration with auto-discovery
const serverUrl = SERVER_URL || 'http://localhost:4000/';
const wsUrl = WS_SERVER_URL || 'ws://localhost:4000/';
```

## Testing

### Manual Testing
1. Start backend: `cd dev-backend && npm run dev`
2. Start admin: `cd enatega-multivendor-admin && npm run dev`
3. Open http://localhost:3000
4. Check browser console for connection status

### Automated Testing
```bash
# Run configuration tests
npm run test:config

# Run integration tests
npm run test:integration
```

## Troubleshooting

### Common Issues

#### Backend Not Found
- Check if backend is running on port 4000
- Verify CORS configuration
- Check network connectivity

#### WebSocket Connection Failed
- Ensure WebSocket server is running
- Check firewall settings
- Verify WebSocket URL configuration

#### Authentication Issues
- Check token storage
- Verify authentication headers
- Ensure backend authentication is working

### Debug Mode
Enable debug logging:
```typescript
// In Apollo client setup
connectToDevTools: process.env.NODE_ENV === 'development'
```

## Performance Improvements

### Before (Old Admin)
- Manual port configuration
- Basic error handling
- Limited caching
- No auto-discovery

### After (New Admin)
- Automatic endpoint discovery
- Enhanced error handling
- Optimized caching
- Real-time updates
- Better performance monitoring

## Rollback Plan

If issues occur, you can rollback by:
1. Reverting environment variables
2. Using old Apollo client configuration
3. Disabling auto-discovery features

## Support

For issues or questions:
- Check the configuration test results
- Review browser console logs
- Consult the development documentation
- Contact the development team

