// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
const distPath = fs.existsSync(path.join(__dirname, 'dist')) ? path.join(__dirname, 'dist') : path.join(__dirname, 'public');
app.use(express.static(distPath));

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

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

// ✅ SEARCH & DISCOVER ENDPOINT (Strict Movies vs TV Shows Separation)
app.post('/api/search', async (req, res) => {
  try {
    const { title, genre, year, type = 'movie' } = req.body || {};
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    console.log('[SEARCH]', { title, genre, year, type: mediaType });

    // If searching by query text
    if (title && title.trim().length > 0) {
      const params = new URLSearchParams({
        api_key: TMDB_KEY,
        query: title.trim(),
        language: 'en-US',
        page: '1',
        include_adult: 'false'
      });
      if (year) {
        if (mediaType === 'movie') params.append('primary_release_year', String(year));
        else params.append('first_air_date_year', String(year));
      }

      const url = `${TMDB_BASE}/search/${mediaType}?${params.toString()}`;
      const data = await fetchJson(url);

      let results = (data.results || []).map(item => ({
        ...item,
        media_type: mediaType,
        title: item.title || item.name || item.original_name,
        release_date: item.release_date || item.first_air_date || ''
      }));

      if (year) {
        results = results.filter(m => m.release_date && m.release_date.startsWith(String(year)));
      }

      return res.json({ ...data, results });
    }

    // Otherwise discover media
    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      language: 'en-US',
      sort_by: 'popularity.desc',
      include_adult: 'false',
      page: '1'
    });

    if (year) {
      if (mediaType === 'movie') {
        params.append('primary_release_date.gte', `${year}-01-01`);
        params.append('primary_release_date.lte', `${year}-12-31`);
      } else {
        params.append('first_air_date.gte', `${year}-01-01`);
        params.append('first_air_date.lte', `${year}-12-31`);
      }
    }

    if (genre) {
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

    const url = `${TMDB_BASE}/discover/${mediaType}?${params.toString()}`;
    console.log('[DISCOVER URL]', url);
    const data = await fetchJson(url);

    const results = (data.results || []).map(item => ({
      ...item,
      media_type: mediaType,
      title: item.title || item.name || item.original_name,
      release_date: item.release_date || item.first_air_date || ''
    }));

    return res.json({ ...data, results });
  } catch (err) {
    console.error('[SEARCH ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// Movie or TV details
app.get('/api/movie/:id', async (req, res) => {
  try {
    const id = req.params.id;
    try {
      const url = `${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=videos,images,credits`;
      const data = await fetchJson(url);
      return res.json({
        ...data,
        media_type: 'movie',
        title: data.title || data.name,
        release_date: data.release_date || data.first_air_date || ''
      });
    } catch (movieErr) {
      // Try TV show endpoint if movie failed
      const tvUrl = `${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=videos,images,credits`;
      const tvData = await fetchJson(tvUrl);
      return res.json({
        ...tvData,
        media_type: 'tv',
        title: tvData.name || tvData.original_name,
        release_date: tvData.first_air_date || '',
        runtime: tvData.episode_run_time?.[0] || tvData.number_of_episodes || null
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
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
    const botReply =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response from model';

    res.json({ reply: botReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FlickBot server running on http://localhost:${PORT}`);
});
