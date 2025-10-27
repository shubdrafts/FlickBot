// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// TMDb base
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Helper: fetch JSON with error handling
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

// 1) Get genre list (cache in-memory for simplicity)
let genreCache = null;
app.get('/api/genres', async (req, res) => {
  try {
    if (genreCache) return res.json(genreCache);
    const url = `${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}&language=en-US`;
    const data = await fetchJson(url);
    genreCache = data;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2) Search endpoint: accepts { title, genre, year }
app.post('/api/search', async (req, res) => {
  try {
    const { title, genre, year } = req.body || {};

    // If title exists -> search
    if (title && title.trim().length > 0) {
      const q = encodeURIComponent(title.trim());
      const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${q}&language=en-US&page=1&include_adult=false`;
      const data = await fetchJson(url);
      return res.json(data);
    }

    // Else use discover
    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      language: 'en-US',
      sort_by: 'popularity.desc',
      page: '1',
      include_adult: 'false'
    });

    if (year) params.append('year', String(year));

    if (genre) {
      // get genres if needed
      if (!genreCache) {
        const gdata = await fetchJson(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}&language=en-US`);
        genreCache = gdata;
      }
      const found = genreCache.genres.find(g => g.name.toLowerCase() === genre.toLowerCase());
      if (found) {
        params.append('with_genres', String(found.id));
      } else if (!isNaN(Number(genre))) {
        params.append('with_genres', String(genre));
      }
    }

    const url = `${TMDB_BASE}/discover/movie?${params.toString()}`;
    const data = await fetchJson(url);
    return res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) Movie details endpoint
app.get('/api/movie/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const url = `${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=videos,images,credits`;
    const data = await fetchJson(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4) Chat endpoint -> Gemini v1 generateContent (fixed)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!GEMINI_KEY) return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });

    // ✅ Correct endpoint for new Gemini API
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
            //   text: `You are FlickBot, a helpful movie assistant. Reply concisely and conversationally about movies.\n\nUser: ${message}`
            text: `You are FlickBot, a helpful movie assistant. Reply concisely and use **Markdown** formatting (bold, lists, line breaks) for readability.\n\nUser: ${message}`

            }
          ]
        }
      ]
    };

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ error: `Gemini API error: ${r.status} - ${txt}` });
    }

    const json = await r.json();

    // Extract text safely
    const botReply =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      json?.candidates?.[0]?.content?.[0]?.parts?.[0]?.text ||
      'No response from model';

    res.json({ reply: botReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FlickBot server running on http://localhost:${PORT}`);
});
