# Multivendor Web (Demo)

This Next.js app demonstrates Firebase Authentication (Google + Phone) with a modern Tailwind UI.

## Prerequisites
- Node 18+
- Firebase project with Authentication enabled

## Environment
Create `.env.local` in `multivendor-web/`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## Install & Run
```
npm install
npm run dev
```

## Tailwind CSS
- Version: v3
- Config: `tailwind.config.js`
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
