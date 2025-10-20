// minimal auth helper: store username and token in localStorage
export function setAuth({ username, token }) {
  localStorage.setItem('mp_user', JSON.stringify({ username }));
  localStorage.setItem('mp_token', token);
}

export function clearAuth() {
  localStorage.removeItem('mp_user');
  localStorage.removeItem('mp_token');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('mp_user')) || null;
  } catch (e) {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('mp_token');
}
