// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "https://flickbot.onrender.com";

async function fetchApi(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    // If request to API_BASE fails and endpoint was relative, attempt local fallback
    if (!endpoint.startsWith('http') && API_BASE !== '') {
      console.warn(`Primary API call to ${url} failed. Trying relative endpoint ${endpoint}...`);
      const localRes = await fetch(endpoint, options);
      if (localRes.ok) {
        return await localRes.json();
      }
    }
    throw err;
  }
}

export async function fetchGenres() {
  return await fetchApi('/api/genres');
}

export async function searchMoviesApi({ title = '', genre = '', year = '', type = 'movie' }) {
  return await fetchApi('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, genre, year, type })
  });
}

export async function fetchMovieDetails(id) {
  return await fetchApi(`/api/movie/${id}`);
}

export async function sendChatMessage(message) {
  return await fetchApi('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
}

export function getPosterUrl(path, size = 'w500') {
  if (!path) return 'https://placehold.co/500x750/1d2024/ffe5a0?text=No+Poster';
  if (path.startsWith('http')) return path;
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `https://image.tmdb.org/t/p/${size}${formattedPath}`;
}

export function getBackdropUrl(path) {
  if (!path) return 'https://placehold.co/1280x720/1d2024/ffe5a0?text=No+Backdrop';
  if (path.startsWith('http')) return path;
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `https://image.tmdb.org/t/p/w1280${formattedPath}`;
}
