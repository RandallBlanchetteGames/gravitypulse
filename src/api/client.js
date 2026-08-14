const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const getAuthHeaders = () => {
  const token = localStorage.getItem('gp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  async register(email, password, displayName) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async updateStats(matchStats) {
    const res = await fetch(`${API_BASE_URL}/stats/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ matchStats })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Stats update failed');
    return data;
  },

  async updateName(displayName) {
    const res = await fetch(`${API_BASE_URL}/user/name`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ displayName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update name');
    return data;
  },

  async getProfile(userId) {
    const res = await fetch(`${API_BASE_URL}/stats/profile/${userId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  async getLeaderboard() {
    const res = await fetch(`${API_BASE_URL}/stats/leaderboard`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch leaderboard');
    return data;
  }
};
