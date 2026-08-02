// app.js — FlickBot v2 Application Logic connected directly to Render Backend (TMDb + Gemini)
const API_BASE = "https://flickbot.onrender.com";

// DOM Element References
const searchBarInput = document.getElementById('searchBarInput');
const searchBarBtn = document.getElementById('searchBarBtn');
const genreSelect = document.getElementById('genreSelect');
const yearSelect = document.getElementById('yearSelect');
const askAiBtn = document.getElementById('askAiBtn');

const filterBtnDiscover = document.getElementById('filterBtnDiscover');
const filterBtnTrending = document.getElementById('filterBtnTrending');
const filterBtnLibrary = document.getElementById('filterBtnLibrary');
const filterBtnWatchlist = document.getElementById('filterBtnWatchlist');

const heroSection = document.getElementById('heroSection');
const heroBackdropImg = document.getElementById('heroBackdropImg');
const heroTitle = document.getElementById('heroTitle');
const heroOverview = document.getElementById('heroOverview');
const heroWatchBtn = document.getElementById('heroWatchBtn');
const heroDetailsBtn = document.getElementById('heroDetailsBtn');

const moviesGrid = document.getElementById('moviesGrid');
const sectionTitle = document.getElementById('sectionTitle');
const sectionSubtitle = document.getElementById('sectionSubtitle');
const viewAllBtn = document.getElementById('viewAllBtn');
const aiPicksBtn = document.getElementById('aiPicksBtn');

// Modal Elements
const movieModal = document.getElementById('movieModal');
const closeMovieModalBtn = document.getElementById('closeMovieModalBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalPosterImg = document.getElementById('modalPosterImg');
const modalTitle = document.getElementById('modalTitle');
const modalTagline = document.getElementById('modalTagline');
const modalRuntime = document.getElementById('modalRuntime');
const modalRating = document.getElementById('modalRating');
const modalVotes = document.getElementById('modalVotes');
const modalGenres = document.getElementById('modalGenres');
const modalOverview = document.getElementById('modalOverview');
const modalCastContainer = document.getElementById('modalCastContainer');
const modalPlayBtn = document.getElementById('modalPlayBtn');
const modalWatchlistBtn = document.getElementById('modalWatchlistBtn');
const trailerIframe = document.getElementById('trailerIframe');
const trailerSection = document.getElementById('trailerSection');

// AI Chatbot Elements
const chatFabBtn = document.getElementById('chatFabBtn');
const chatAssistantWindow = document.getElementById('chatAssistantWindow');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatClearBtn = document.getElementById('chatClearBtn');
const chatMessagesContainer = document.getElementById('chatMessagesContainer');
const chatInputText = document.getElementById('chatInputText');
const chatSendBtn = document.getElementById('chatSendBtn');
const watchHistoryList = document.getElementById('watchHistoryList');

// State Storage
let currentMovies = [];
let currentFeaturedMovie = null;
let watchlist = JSON.parse(localStorage.getItem('flickbotWatchlist')) || [];
let watchHistory = JSON.parse(localStorage.getItem('flickbotWatchHistory')) || [];
let chatHistory = JSON.parse(localStorage.getItem('flickbotChatHistory')) || [];

// Helper: Image Path Generator from TMDb
function getPosterUrl(path, size = 'w500') {
  if (!path) return 'https://via.placeholder.com/500x750/1d2024/ffe5a0?text=No+Poster';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function getBackdropUrl(path) {
  if (!path) return 'https://via.placeholder.com/1280x720/1d2024/ffe5a0?text=No+Backdrop';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w1280${path}`;
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]
  );
}

// -------------------- API FETCHERS (TMDb via Render Backend) --------------------

// Populate Genres Select from /api/genres
async function loadGenres() {
  try {
    const res = await fetch(`${API_BASE}/api/genres`);
    const data = await res.json();
    const genres = data.genres || [];
    genreSelect.innerHTML = '<option value="">All Genres</option>';
    genres.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.name;
      opt.textContent = g.name;
      genreSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed loading genres from Render backend:', err);
  }
}

// Search or Discover Movies from TMDb via /api/search
async function searchMovies(overrideTitle = '', overrideGenre = '', overrideYear = '') {
  moviesGrid.innerHTML = `
    <div class="col-span-full py-20 text-center text-on-surface-variant/70">
      <div class="inline-block w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="font-label-md">Connecting to TMDb Universe...</p>
    </div>
  `;

  const payload = {
    title: overrideTitle !== '' ? overrideTitle : searchBarInput.value.trim(),
    genre: overrideGenre !== '' ? overrideGenre : genreSelect.value,
    year: overrideYear !== '' ? overrideYear : yearSelect.value
  };

  try {
    const res = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    currentMovies = data.results || [];

    if (currentMovies.length > 0) {
      renderHero(currentMovies[0]);
    }
    
    renderMovies(currentMovies);
  } catch (err) {
    console.error('Search failed:', err);
    moviesGrid.innerHTML = `<div class="col-span-full py-12 text-center text-error font-semibold">Failed to fetch TMDb movies from backend. Retrying...</div>`;
  }
}

// -------------------- UI RENDERERS --------------------

// Render Hero Featured Section from TMDb Result
function renderHero(movie) {
  if (!movie) return;
  currentFeaturedMovie = movie;
  heroTitle.textContent = movie.title || movie.original_title || 'Featured Movie';
  heroOverview.textContent = movie.overview || 'Experience this cinematic release on FlickBot.';
  heroBackdropImg.src = getBackdropUrl(movie.backdrop_path || movie.poster_path);
  
  heroWatchBtn.onclick = () => openMoviePopup(movie.id);
  heroDetailsBtn.onclick = () => openMoviePopup(movie.id);
}

// Render Movie Cards in Grid from TMDb Results
function renderMovies(movies) {
  if (!movies || movies.length === 0) {
    moviesGrid.innerHTML = `
      <div class="col-span-full py-16 text-center glass-panel rounded-2xl p-8 border border-white/10">
        <span class="material-symbols-outlined text-[48px] text-on-surface-variant/50 mb-2">movie_off</span>
        <h3 class="font-bold text-white text-lg mb-1">No Movies Found</h3>
        <p class="text-on-surface-variant text-sm">Try broadening your search query or select another genre!</p>
      </div>
    `;
    return;
  }

  moviesGrid.innerHTML = '';
  movies.forEach(m => {
    const rating = m.vote_average ? m.vote_average.toFixed(1) : 'N/A';
    const year = m.release_date ? m.release_date.slice(0, 4) : '';
    const poster = getPosterUrl(m.poster_path);
    const isSaved = watchlist.some(item => item.id === m.id);

    const card = document.createElement('div');
    card.className = 'group movie-card-hover cursor-pointer';
    card.innerHTML = `
      <div class="relative aspect-[2/3] rounded-xl overflow-hidden glass-panel mb-3 p-[1px] border border-white/10 shadow-lg">
        <div class="w-full h-full rounded-xl overflow-hidden relative">
          <img src="${poster}" alt="${escapeHtml(m.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          
          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button class="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xl hover:scale-110 active:scale-95 transition-all">
              <span class="material-symbols-outlined fill" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
            </button>
            <button class="toggle-watchlist-btn w-11 h-11 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/20 transition-all ${isSaved ? 'text-primary' : ''}">
              <span class="material-symbols-outlined">${isSaved ? 'check' : 'bookmark_add'}</span>
            </button>
          </div>

          <!-- TMDb Rating Badge -->
          <div class="absolute top-2.5 right-2.5 glass-panel px-2.5 py-0.5 rounded-full text-[11px] font-bold text-primary flex items-center gap-1 border border-white/10 shadow-md">
            <span class="material-symbols-outlined text-[13px] fill" style="font-variation-settings: 'FILL' 1;">star</span> ${rating}
          </div>
        </div>
      </div>
      <h3 class="font-label-md text-label-md text-white group-hover:text-primary transition-colors truncate font-semibold">${escapeHtml(m.title)}</h3>
      <p class="text-label-sm text-on-surface-variant/70 text-xs mt-0.5">${year ? year + ' • ' : ''}TMDb</p>
    `;

    // Click Event handler
    card.addEventListener('click', (e) => {
      if (e.target.closest('.toggle-watchlist-btn')) {
        e.stopPropagation();
        toggleWatchlist(m);
        renderMovies(currentMovies);
        return;
      }
      openMoviePopup(m.id);
    });

    moviesGrid.appendChild(card);
  });
}

// Render Watch History Widget dynamically
function renderWatchHistoryWidget() {
  if (!watchHistoryList) return;
  if (watchHistory.length === 0) {
    // Default fallback from current movies
    if (currentMovies.length > 0) {
      watchHistory = currentMovies.slice(0, 2);
    }
  }

  if (watchHistory.length === 0) {
    watchHistoryList.innerHTML = `<p class="text-xs text-on-surface-variant">No recently viewed titles.</p>`;
    return;
  }

  watchHistoryList.innerHTML = watchHistory.slice(0, 3).map(m => `
    <div class="flex items-center gap-3 group cursor-pointer" onclick="openMoviePopup(${m.id})">
      <div class="w-10 h-10 rounded bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
        <img class="w-full h-full object-cover" alt="${escapeHtml(m.title)}" src="${getPosterUrl(m.poster_path, 'w185')}"/>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[13px] font-bold text-white truncate group-hover:text-primary transition-colors">${escapeHtml(m.title)}</p>
        <div class="w-full h-1.5 bg-white/10 rounded-full mt-1"><div class="w-[75%] h-full bg-primary rounded-full"></div></div>
      </div>
    </div>
  `).join('');
}

// -------------------- MOVIE POPUP MODAL (TMDb /api/movie/:id) --------------------
async function openMoviePopup(id) {
  movieModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Loading indicator inside modal
  modalTitle.textContent = 'Loading...';
  modalTagline.textContent = 'Fetching TMDb details';
  modalOverview.textContent = 'Retrieving full overview, credits, and video trailers from TMDb API...';
  modalCastContainer.innerHTML = '<div class="text-xs text-on-surface-variant">Loading cast...</div>';
  trailerIframe.src = '';

  try {
    const res = await fetch(`${API_BASE}/api/movie/${id}`);
    const data = await res.json();

    // Add to Watch History
    if (!watchHistory.some(item => item.id === data.id)) {
      watchHistory.unshift(data);
      if (watchHistory.length > 10) watchHistory.pop();
      localStorage.setItem('flickbotWatchHistory', JSON.stringify(watchHistory));
      renderWatchHistoryWidget();
    }

    modalTitle.textContent = data.title || data.original_title || 'Movie Details';
    modalTagline.textContent = data.tagline ? `"${data.tagline}"` : (data.release_date ? `Released ${data.release_date.slice(0,4)}` : '');
    modalOverview.textContent = data.overview || 'No synopsis available for this title.';
    modalPosterImg.src = getPosterUrl(data.poster_path);

    modalRuntime.textContent = data.runtime ? `${data.runtime} min` : 'N/A';
    modalRating.textContent = data.vote_average ? `${data.vote_average.toFixed(1)} / 10` : 'N/A';
    modalVotes.textContent = data.vote_count ? `${data.vote_count.toLocaleString()} Votes` : 'N/A';
    modalGenres.textContent = (data.genres || []).map(g => g.name).join(', ') || 'N/A';

    // Watchlist state toggle
    const isSaved = watchlist.some(item => item.id === data.id);
    modalWatchlistBtn.innerHTML = `
      <span class="material-symbols-outlined">${isSaved ? 'check' : 'add'}</span>
      ${isSaved ? 'In Watchlist' : 'Add to Watchlist'}
    `;
    modalWatchlistBtn.onclick = () => {
      toggleWatchlist(data);
      const nowSaved = watchlist.some(item => item.id === data.id);
      modalWatchlistBtn.innerHTML = `
        <span class="material-symbols-outlined">${nowSaved ? 'check' : 'add'}</span>
        ${nowSaved ? 'In Watchlist' : 'Add to Watchlist'}
      `;
    };

    // Render Cast from TMDb Credits
    const cast = data.credits && data.credits.cast ? data.credits.cast.slice(0, 6) : [];
    if (cast.length > 0) {
      modalCastContainer.innerHTML = cast.map(c => `
        <div class="flex items-center gap-2.5 glass-pill px-3 py-1.5 rounded-full border border-white/10">
          <img src="${c.profile_path ? getPosterUrl(c.profile_path, 'w185') : 'https://via.placeholder.com/100x100/1d2024/ffe5a0?text=Actor'}" class="w-8 h-8 rounded-full object-cover border border-white/20" alt="${escapeHtml(c.name)}"/>
          <div>
            <p class="font-label-md text-xs text-white leading-tight font-semibold">${escapeHtml(c.name)}</p>
            <p class="text-[10px] text-on-surface-variant/70 leading-tight">${escapeHtml(c.character || 'Cast')}</p>
          </div>
        </div>
      `).join('');
    } else {
      modalCastContainer.innerHTML = '<span class="text-xs text-on-surface-variant">No cast information available</span>';
    }

    // Video Trailer Embed from TMDb Videos
    const videos = data.videos && data.videos.results ? data.videos.results : [];
    const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];
    if (trailer && trailer.key) {
      trailerSection.classList.remove('hidden');
      trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`;
      modalPlayBtn.onclick = () => {
        trailerSection.scrollIntoView({ behavior: 'smooth' });
      };
    } else {
      trailerIframe.src = '';
      trailerSection.classList.add('hidden');
    }
  } catch (err) {
    console.error('Error fetching movie details:', err);
  }
}

function closeMoviePopup() {
  movieModal.classList.add('hidden');
  document.body.style.overflow = '';
  trailerIframe.src = '';
}

closeMovieModalBtn.addEventListener('click', closeMoviePopup);
modalBackdrop.addEventListener('click', closeMoviePopup);

// -------------------- WATCHLIST MANAGEMENT --------------------
function toggleWatchlist(movie) {
  const index = watchlist.findIndex(item => item.id === movie.id);
  if (index > -1) {
    watchlist.splice(index, 1);
  } else {
    watchlist.push(movie);
  }
  localStorage.setItem('flickbotWatchlist', JSON.stringify(watchlist));
}

// -------------------- AI CHATBOT LOGIC (/api/chat) --------------------
function toggleChatWindow() {
  chatAssistantWindow.classList.toggle('hidden');
}

chatFabBtn.addEventListener('click', toggleChatWindow);
closeChatBtn.addEventListener('click', toggleChatWindow);

function renderChatHistory() {
  chatMessagesContainer.innerHTML = `
    <div class="chatbot-msg bot text-xs">
      👋 Hi! I am <strong>FlickBot</strong>. Ask me for movie recommendations, cast info, or plot summaries!
    </div>
  `;
  chatHistory.forEach(msg => appendChatMsg(msg.role, msg.content, false));
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function saveChatHistory() {
  localStorage.setItem('flickbotChatHistory', JSON.stringify(chatHistory));
}

function appendChatMsg(role, content, save = true) {
  const div = document.createElement('div');
  div.className = `chatbot-msg ${role} text-xs`;

  if (role === 'bot') {
    let parsedHtml = marked.parse(content);
    parsedHtml = parsedHtml.replace(/\*\*(.*?)\*\*/g, `<strong class="movie-link" data-title="$1">$1</strong>`);
    div.innerHTML = parsedHtml;
  } else {
    div.textContent = content;
  }

  chatMessagesContainer.appendChild(div);
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

  if (save) {
    chatHistory.push({ role, content });
    saveChatHistory();
  }

  attachMovieLinkListeners();
  return div;
}

function attachMovieLinkListeners() {
  chatMessagesContainer.querySelectorAll('.movie-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = link.getAttribute('data-title');
      if (title) {
        searchBarInput.value = title;
        searchMovies(title);
      }
    });
  });
}

async function handleSendChat() {
  const text = chatInputText.value.trim();
  if (!text) return;

  appendChatMsg('user', text, true);
  chatInputText.value = '';

  const placeholder = appendChatMsg('bot', 'Thinking...', false);

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    const reply = data.reply || 'No response from FlickBot AI.';

    let parsedHtml = marked.parse(reply);
    parsedHtml = parsedHtml.replace(/\*\*(.*?)\*\*/g, `<strong class="movie-link" data-title="$1">$1</strong>`);
    placeholder.innerHTML = parsedHtml;

    chatHistory.push({ role: 'bot', content: reply });
    saveChatHistory();
    attachMovieLinkListeners();
  } catch (err) {
    placeholder.textContent = 'Error: ' + err.message;
  }

  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

chatSendBtn.addEventListener('click', handleSendChat);
chatInputText.addEventListener('keypress', e => {
  if (e.key === 'Enter') handleSendChat();
});

chatClearBtn.addEventListener('click', () => {
  chatHistory = [];
  localStorage.removeItem('flickbotChatHistory');
  renderChatHistory();
});

// Quick Prompt Chips
document.querySelectorAll('.quick-prompt-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.getAttribute('data-prompt');
    if (prompt) {
      chatInputText.value = prompt;
      handleSendChat();
    }
  });
});

// -------------------- EVENT LISTENERS --------------------

// Search Bar Input
searchBarBtn.addEventListener('click', () => searchMovies());
searchBarInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchMovies();
});

// Sidebar Dropdowns & AI Actions
genreSelect.addEventListener('change', () => searchMovies());
yearSelect.addEventListener('change', () => searchMovies());
askAiBtn.addEventListener('click', () => {
  if (chatAssistantWindow.classList.contains('hidden')) {
    toggleChatWindow();
  }
  chatInputText.focus();
});

aiPicksBtn.addEventListener('click', () => {
  if (chatAssistantWindow.classList.contains('hidden')) {
    toggleChatWindow();
  }
  chatInputText.value = "Recommend me top rated visually stunning animated and sci-fi movies!";
  handleSendChat();
});

// Sidebar Quick Navigation Buttons
filterBtnDiscover.addEventListener('click', () => {
  sectionTitle.textContent = "Trending Movies";
  sectionSubtitle.textContent = "Handpicked visual masterpieces for your viewing pleasure.";
  genreSelect.value = "";
  yearSelect.value = "";
  searchMovies();
});

filterBtnTrending.addEventListener('click', () => {
  sectionTitle.textContent = "Top Trending Right Now";
  sectionSubtitle.textContent = "Most popular movies across the globe today.";
  searchMovies("", "", "2024");
});

filterBtnLibrary.addEventListener('click', () => {
  sectionTitle.textContent = "Classic Film Library";
  sectionSubtitle.textContent = "All-time cinematic legends and high-rated masterpieces.";
  searchMovies("", "", "2010");
});

filterBtnWatchlist.addEventListener('click', () => {
  sectionTitle.textContent = "My Saved Watchlist";
  sectionSubtitle.textContent = "Your personal collection of saved movies.";
  renderMovies(watchlist);
});

// -------------------- INITIALIZATION --------------------
window.addEventListener('DOMContentLoaded', async () => {
  loadGenres();
  await searchMovies();
  renderWatchHistoryWidget();
  renderChatHistory();
});
