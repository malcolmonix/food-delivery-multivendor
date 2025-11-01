# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## 🚀 Get Running in 3 Steps

### 1. **Start the Web Frontend**
```bash
cd multivendor-web
npm install
npm run dev
```
- Opens at: http://localhost:3000
- Shows restaurants from MenuVerse Firebase

### 2. **Start Admin Dashboard** (Optional)
```bash
cd multivendor-admin  
npm install
npm run dev
```
- Opens at: http://localhost:3001
- Admin interface for managing content

### 3. **Legacy Backend** (If needed)
```bash
cd sqlite-backend
npm install
npm start
```
- Runs at: http://localhost:4000
- GraphQL API (being phased out in favor of MenuVerse)

## ✅ What You'll See

1. **Homepage**: Restaurant listings from MenuVerse Firebase
2. **Restaurant Pages**: Menu items with categories and pricing
3. **Cart**: Working cart system with add/remove functionality
4. **Admin**: Dashboard for content management

## 🔧 Configuration

The system is pre-configured to work with:
- **MenuVerse Firebase**: `chopchop-67750` project
- **Collection Structure**: `eateries/{eateryId}/menu_items`
- **Anonymous Authentication**: No login required for testing

## 🚨 Troubleshooting

**Restaurants not showing?**
- Check browser console for Firebase errors
- Verify internet connection (Firebase requires online access)

**Cart not working?**
- Clear localStorage: `localStorage.clear()` in browser console
- Refresh the page

**Admin login issues?**
- Use development mode without authentication
- Check admin console for error messages

---

**Need help?** Check the `docs/` folder for detailed technical documentation.