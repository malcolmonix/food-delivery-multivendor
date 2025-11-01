# Multivendor Web - Consumer App

Next.js consumer application integrated with MenuVerse Firebase backend for restaurant ordering.

## 🚀 Current Status: FULLY WORKING
- ✅ Restaurant listings from MenuVerse Firebase
- ✅ Menu item display with categories and pricing
- ✅ Working cart system with localStorage persistence
- ✅ Responsive design with modern Tailwind UI

## Quick Start
```bash
npm install
npm run dev
```
Opens at: http://localhost:3000

## Key Features
- **Restaurant Browse**: View restaurants from MenuVerse database
- **Menu Display**: Restaurant detail pages with categorized menu items
- **Cart Management**: Add/remove items, quantity control, persistent storage
- **Modern UI**: Responsive design with Tailwind CSS

## MenuVerse Integration
- **Database**: Firebase Firestore (`chopchop-67750`)
- **Collections**: `eateries/` and `eateries/{id}/menu_items`
- **Authentication**: Anonymous Firebase auth (no login required)
- **API Service**: `lib/services/menuverse-api.ts`

## File Structure
```
lib/
├── services/menuverse-api.ts   # Firebase integration
├── context/cart.context.tsx    # Cart state management
└── firebase/menuverse.ts       # Firebase config

pages/
├── index.tsx                   # Restaurant listings
├── restaurant/[id].tsx         # Restaurant detail pages
└── cart.tsx                    # Cart management
```

## Environment Variables
Create `.env.local`:
```
# No environment variables required
# MenuVerse integration uses built-in configuration
```
- PostCSS: `postcss.config.js`
- Directives in `styles/globals.css`:
	```css
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
	```

## Firebase Authentication
- Login page: `/login`
- Google sign-in via popup
- Phone login with invisible reCAPTCHA and SMS code
- Server verification example: `/api/user/me`

### Firebase Console checklist
1. Authentication → Sign-in method
	 - Enable Google
	 - Enable Phone
2. Authentication → Settings
	 - Authorized domains: add `localhost` (and any dev domain)
3. Authentication → Sign-in method → Phone → Test phone numbers
	 - Add test numbers (no SMS sent). Example:
		 - `+15555550100` with code `123456`
4. Google provider: ensure your project has a public-facing name and support email set.

### Debug page (recommended)
Open `/dev/auth-debug` to:
- View the current client user (uid, email, phoneNumber)
- Show your ID token
- Call the protected API `/api/user/me` with `Authorization: Bearer <token>`

## Using the ID token in API calls
Use the helpers in `lib/hooks/use-firebase-token.ts`:

```ts
import { authenticatedFetch, getAuthHeaders } from '@/lib/hooks/use-firebase-token';

// Simple: automatically attaches the token
const res = await authenticatedFetch('/api/user/me');

// Manual headers
const headers = await getAuthHeaders();
const res2 = await fetch('/api/other', { headers });
```

On the server, validate tokens with `lib/firebase/server.ts` (`requireAuth` / `verifyIdToken`).

## Header
An auth-aware header shows user name/avatar and a sign out button. It is included globally in `_app.tsx`.

## Troubleshooting
- If Google avatar fails to render with `next/image`, ensure `next.config.mjs` includes
	`lh3.googleusercontent.com` under `images.remotePatterns`.
- If phone login doesn’t receive SMS during development, use Firebase “Test phone numbers” to bypass SMS.
