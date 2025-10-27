// public/app.js
const API_BASE = "https://flickbot.onrender.com"; // ✅ Replace with your actual Render URL

const searchBtn = document.getElementById('searchBtn');
const titleInput = document.getElementById('titleInput');
const genreInput = document.getElementById('genreInput');
const yearInput = document.getElementById('yearInput');
const moviesGrid = document.getElementById('moviesGrid');

const popup = document.getElementById('popup');
const popupContent = document.getElementById('popupContent');
const closePopup = document.getElementById('closePopup');

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatWindow = document.getElementById('chatWindow');

// -------------------- GENRE FETCH --------------------
async function fetchGenres() {
  try {
    const r = await fetch(`${API_BASE}/api/genres`);
    if (!r.ok) throw new Error('Genres fetch error');
    const json = await r.json();
    return json.genres || [];
  } catch (e) {
    console.warn('Could not fetch genres', e);
    return [];
  }
}

// -------------------- MOVIE SEARCH --------------------
async function searchMovies() {
  moviesGrid.innerHTML = '<div class="note">Loading...</div>';
  const payload = {
    title: titleInput.value.trim(),
    genre: genreInput.value.trim(),
    year: yearInput.value.trim()
  };
  const r = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  renderMovies(data.results || []);
}

// -------------------- MOVIE GRID RENDER --------------------
function renderMovies(movies) {
  if (!movies || movies.length === 0) {
    moviesGrid.innerHTML = '<div class="note">No movies found. Try different filters.</div>';
    return;
  }
  moviesGrid.innerHTML = '';
  movies.forEach(m => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const poster = m.poster_path
      ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Image';
    card.innerHTML = `
      <img src="${poster}" alt="${escapeHtml(m.title)}" loading="lazy"/>
      <div class="title">${escapeHtml(m.title)}
        <div style="font-size:12px;color:#9aa6b2;margin-top:6px">
          ${m.release_date ? m.release_date.slice(0, 4) : ''}
        </div>
      </div>
    `;
    card.addEventListener('click', () => openMoviePopup(m.id));
    moviesGrid.appendChild(card);
  });
}

// -------------------- MOVIE POPUP --------------------
async function openMoviePopup(id) {
  popup.classList.remove('hidden');
  popupContent.innerHTML = '<div class="note">Loading details...</div>';
  const r = await fetch(`${API_BASE}/api/movie/${id}`);
  const data = await r.json();

  const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '';
  let html = `
    <div style="display:flex;gap:18px">
      <div style="flex:0 0 200px">
        <img src="${poster}" style="width:100%;border-radius:8px" alt="poster"/>
      </div>
      <div style="flex:1">
        <h2>${escapeHtml(data.title || '')}
          <span style="color:#9aa6b2;font-size:14px">(${(data.release_date || '').slice(0, 4)})</span>
        </h2>
        <p style="color:#cbd6de">${escapeHtml(data.tagline || data.original_title || '')}</p>
        <p>${escapeHtml(data.overview || 'No overview available.')}</p>
        <p style="font-size:13px;color:#9aa6b2">
          Runtime: ${data.runtime || 'N/A'} mins • Rating: ${data.vote_average || 'N/A'} • Votes: ${data.vote_count || 0}
        </p>
        <div style="margin-top:12px"><strong>Genres:</strong> ${(data.genres || []).map(g => g.name).join(', ') || 'N/A'}</div>
        <div style="margin-top:12px"><strong>Cast:</strong> ${(data.credits && data.credits.cast ? data.credits.cast.slice(0, 6).map(c => c.name).join(', ') : 'N/A')}</div>
      </div>
    </div>
  `;

  // trailer
  if (data.videos && data.videos.results && data.videos.results.length) {
    const trailer = data.videos.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || data.videos.results[0];
    if (trailer) {
      html += `
        <div style="margin-top:16px">
          <strong>Trailer:</strong>
          <div style="margin-top:8px">
            <iframe width="100%" height="360" src="https://www.youtube.com/embed/${trailer.key}"
              frameborder="0" allowfullscreen></iframe>
          </div>
        </div>`;
    }
  }

  popupContent.innerHTML = html;
}

closePopup.addEventListener('click', () => popup.classList.add('hidden'));

// -------------------- CHAT SYSTEM --------------------
chatForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  appendMessage('user', text);
  chatInput.value = '';

  const placeholder = appendMessage('bot', '…');

  try {
    const r = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await r.json();

    if (data.reply) {
      let html = marked.parse(data.reply);

      // clickable movie titles
      html = html.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
        const movieTitle = p1.trim();
        return `<a href="#" class="movie-link" data-title="${movieTitle}">${movieTitle}</a>`;
      });

      placeholder.innerHTML = html;

      placeholder.querySelectorAll('.movie-link').forEach(link => {
        link.addEventListener('click', ev => {
          ev.preventDefault();
          const movieTitle = ev.target.dataset.title;
          titleInput.value = movieTitle;
          genreInput.value = '';
          yearInput.value = '';
          searchMovies();
        });
      });
    } else {
      throw new Error(data.error || 'No reply');
    }
  } catch (err) {
    placeholder.className = 'chat-message bot';
    placeholder.textContent = 'Error: ' + err.message;
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// appendMessage returns the created message element
function appendMessage(who, text) {
  const div = document.createElement('div');
  div.className = 'chat-message ' + (who === 'user' ? 'user' : 'bot');
  div.innerHTML = escapeHtml(text);
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return div;
}

// Escape HTML utility
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]
  );
}

// -------------------- INIT --------------------
searchBtn.addEventListener('click', searchMovies);

window.addEventListener('load', () => {
  titleInput.value = '';
  genreInput.value = '';
  yearInput.value = '';
  searchMovies();
});
