const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

//admin
export type ApiError = { error?: string };

function getToken() {
  return localStorage.getItem('admin_token');
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error((data && data.error) || `API error: ${res.status}`);
    return data as T;
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error((data && data.error) || `API error: ${res.status}`);
    return data as T;
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error((data && data.error) || `API error: ${res.status}`);
    return data as T;
  },

  async del(endpoint: string): Promise<void> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });
    if (res.status === 204) return;
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error((data && data.error) || `API error: ${res.status}`);
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: formData,
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error((data && data.error) || `API error: ${res.status}`);
    return data as T;
  },
};


