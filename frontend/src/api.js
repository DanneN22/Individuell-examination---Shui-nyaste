// frontend/src/api.js
export const API_BASE = process.env.REACT_APP_API_BASE || 'https://danielnorrby.signin.aws.amazon.com/console';

export async function fetchMessages() {
  const r = await fetch(`${API_BASE}/messages`);
  return r.json();
}
export async function postMessage(username, text) {
  const r = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username, text }),
  });
  return r.json();
}
export async function updateMessage(id, text) {
  const r = await fetch(`${API_BASE}/messages/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ text }),
  });
  return r.json();
}
export async function deleteMessage(id) {
  const r = await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE' });
  return r;
}
export async function fetchUserMessages(username) {
  const r = await fetch(`${API_BASE}/messages/user/${encodeURIComponent(username)}`);
  return r.json();
}
