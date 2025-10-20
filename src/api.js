// simple fetch wrapper that injects Authorization header when token present
const API_BASE = process.env.REACT_APP_API_URL || '';

// Debug: print API base at runtime (helps verify env is loaded)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.debug('API_BASE =', API_BASE);
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const token = localStorage.getItem('mp_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, { ...options, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(data && data.message ? data.message : 'API error');
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}

export async function register(username, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchPosts() {
  return request('/api/posts');
}

export async function createPost(title, body) {
  return request('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ title, body }),
  });
}

export async function editPost(id, updates) {
  return request(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deletePost(id) {
  return request(`/api/posts/${id}`, { method: 'DELETE' });
}

export async function addComment(postId, content) {
  return request(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function editComment(postId, commentId, content) {
  // We don't have a dedicated edit endpoint yet server-side; we'll implement client-side optimistic update by calling delete+recreate if needed.
  // But we'll add a new endpoint later. For now assume server supports PUT /api/posts/:postId/comments/:commentId
  return request(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(postId, commentId) {
  return request(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export default { request };
