/**
 * Global fetch wrapper for secure API communication.
 * Automatically appends the JWT bearer token to each request,
 * and handles session expiration by redirecting to /login.
 */
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Session expired or invalid token - log out user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Smoothly redirect to login
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
    
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  return response;
}

export async function apiUpload(url, file, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
    
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  return response;
}

export default apiFetch;
