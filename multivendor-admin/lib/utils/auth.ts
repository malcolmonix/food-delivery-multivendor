export type User = {
  userId: string;
  token: string;
  email: string;
  userType: string;
};

const KEY = 'user-Multivendor-Admin';

export function saveUser(u: User) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(u));
}

export function loadUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

export function hasToken() {
  return !!loadUser()?.token;
}
