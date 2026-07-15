const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'esifit_token';

export class ApiError extends Error {
  constructor(
    public code: string,
    message?: string,
    public status?: number
  ) {
    super(message ?? code);
    this.name = 'ApiError';
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      typeof data.error === 'string' ? data.error : 'REQUEST_FAILED',
      typeof data.message === 'string' ? data.message : undefined,
      res.status
    );
  }

  return data as T;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phoneVerified?: boolean;
  role: 'USER' | 'COACH' | 'ADMIN';
  subscriptionTier: 'FREE' | 'ECONOMY' | 'VIP' | 'ELITE';
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  goal?: string;
  activityLevel?: string;
  injuries?: string;
  assignedCoachId?: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: ApiUser;
}

export interface MeResponse {
  user: ApiUser;
  entitlements: {
    role: ApiUser['role'];
    subscriptionTier: ApiUser['subscriptionTier'];
  };
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutUser(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me');
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function requestPhoneOtp(phone: string): Promise<void> {
  await apiFetch('/auth/phone/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyPhoneOtp(phone: string, code: string, name?: string): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/phone/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code, name }),
  });
}
