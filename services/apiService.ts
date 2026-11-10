import { SyncPayload, SyncResponse, UserSettings, Task, Session, DistractionRule, Achievement } from '@/types';

const TOKEN_KEY = 'focus_sprout_auth_token';
const USER_KEY = 'focus_sprout_user_profile';
const GUEST_ID_KEY = 'focus_sprout_guest_id';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getGuestId(): string {
  if (typeof window === 'undefined') return 'guest_user_default';
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const guestId = getGuestId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Id': guestId,
    'X-Client-Platform': 'web',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data as T;
}

export const apiService = {
  async register(params: { email: string; password?: string; name?: string; sproutName?: string; initialPayload?: SyncPayload }) {
    const res = await request<{ success: boolean; token: string; user: any; data: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(params: { email: string; password?: string }) {
    const res = await request<{ success: boolean; token: string; user: any; data: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredToken(res.token);
    return res;
  },

  logout() {
    setStoredToken(null);
  },

  async getMe() {
    return request<{ success: boolean; user: any }>('/api/auth/me');
  },

  async sync(payload?: SyncPayload): Promise<SyncResponse> {
    if (payload) {
      return request<SyncResponse>('/api/sync', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return request<SyncResponse>('/api/sync');
  },

  async seedDemo() {
    return request<{ success: boolean }>('/api/backup', { method: 'PATCH' });
  },

  async exportBackup() {
    return request<any>('/api/backup');
  },

  async importBackup(data: any) {
    return request<{ success: boolean; user: any }>('/api/backup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async clearAll() {
    return request<{ success: boolean }>('/api/backup', { method: 'DELETE' });
  },
};

