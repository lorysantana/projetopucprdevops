const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function apiFetch(path, { token, ...options } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = (data && data.message) || 'Erro ao comunicar com a API.';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { status: response.status, data };
}

export function login(email, senha) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

export function listUsers(token) {
  return apiFetch('/api/users', { token });
}

export function getUser(token, id) {
  return apiFetch(`/api/users/${id}`, { token });
}

export function createUser(token, payload) {
  return apiFetch('/api/users', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function updateUser(token, id, payload) {
  return apiFetch(`/api/users/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteUser(token, id) {
  return apiFetch(`/api/users/${id}`, {
    method: 'DELETE',
    token,
  });
}
