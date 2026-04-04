export type AuthUser = { id: number | string; email: string; role: string };

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

