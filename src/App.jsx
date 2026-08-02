import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import MoviesGrid from './components/MoviesGrid';
import AiBento from './components/AiBento';
import MovieModal from './components/MovieModal';
import ChatAssistant from './components/ChatAssistant';
import Footer from './components/Footer';
import { fetchGenres, searchMoviesApi } from './services/api';

export default function App() {
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeTab, setActiveTab] = useState('discover');
  const [activeNav, setActiveNav] = useState('dashboard');

  const [sectionTitle, setSectionTitle] = useState('Trending Movies & Series');
  const [sectionSubtitle, setSectionSubtitle] = useState('Handpicked visual masterpieces for your viewing pleasure.');

  const [watchlist, setWatchlist] = useState(() => {
    return JSON.parse(localStorage.getItem('flickbotWatchlist')) || [];
  });

  const [watchHistory, setWatchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('flickbotWatchHistory')) || [];
  });

  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Sync Watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('flickbotWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Sync Watch History to localStorage
  useEffect(() => {
    localStorage.setItem('flickbotWatchHistory', JSON.stringify(watchHistory));
  }, [watchHistory]);

  // Fetch Genres on mount
  useEffect(() => {
    fetchGenres()
      .then((data) => {
        if (data && data.genres) {
          setGenres(data.genres);
        }
      })
      .catch((err) => console.error('Failed to load genres:', err));
  }, []);

  // Strict Search Movies & TV Shows helper
  const performSearch = useCallback(async (title = '', genre = '', year = '', type = 'movie') => {
    setIsLoadingMovies(true);
    try {
      const data = await searchMoviesApi({ title, genre, year, type });
      let results = data.results || [];

      // Enforce strict type isolation: Movies section ONLY displays movies; TV Shows section ONLY displays TV series
      if (type === 'movie') {
        results = results.filter((item) => item.media_type === 'movie' || (!item.first_air_date && !!item.title));
      } else if (type === 'tv') {
        results = results.filter((item) => item.media_type === 'tv' || !!item.first_air_date || (!!item.name && !item.release_date));
      }

      setMovies(results);
    } catch (err) {
      console.error('Search failed:', err);
      setMovies([]);
    } finally {
      setIsLoadingMovies(false);
    }
  }, []);

  // Determine active media type based on activeNav
  const currentMediaType = activeNav === 'tvshows' ? 'tv' : 'movie';

  // Initial load
  useEffect(() => {
    performSearch('', '', '', currentMediaType);
  }, [performSearch]);

  // Re-search when filter dropdowns change
  useEffect(() => {
    if (activeTab !== 'watchlist') {
      performSearch(searchQuery, selectedGenre, selectedYear, currentMediaType);
    }
  }, [selectedGenre, selectedYear, activeNav]);

  // Handle Top Navbar section clicks (Dashboard, Movies, TV Shows)
  const handleNavClick = (navTab) => {
    setActiveNav(navTab);
    setActiveTab('discover');
    const mediaType = navTab === 'tvshows' ? 'tv' : 'movie';

    if (navTab === 'dashboard') {
      setSectionTitle('Trending Movies & Series');
      setSectionSubtitle('Handpicked visual masterpieces for your viewing pleasure.');
    } else if (navTab === 'movies') {
      setSectionTitle('Explore Feature Movies');
      setSectionSubtitle('Browse top rated films, blockbusters, and cinema classics.');
    } else if (navTab === 'tvshows') {
      setSectionTitle('Top TV Shows & Series');
      setSectionSubtitle('Binge-worthy television shows, anime, and mini-series.');
    }

    performSearch(searchQuery, selectedGenre, selectedYear, mediaType);
  };

  // Handle FlickBot logo click (Home page reset)
  const handleLogoClick = () => {
    setActiveNav('dashboard');
    setActiveTab('discover');
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setSectionTitle('Trending Movies & Series');
    setSectionSubtitle('Handpicked visual masterpieces for your viewing pleasure.');
    performSearch('', '', '', 'movie');
  };

  // Handle Search submit from Navbar
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setActiveTab('discover');
    setSectionTitle(query ? `Search results for "${query}"` : (activeNav === 'tvshows' ? 'Top TV Shows & Series' : 'Trending Movies'));
    setSectionSubtitle('Handpicked visual masterpieces for your viewing pleasure.');
    performSearch(query, selectedGenre, selectedYear, currentMediaType);
  };

  // Handle Tab switches from Sidebar
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'discover') {
      setSectionTitle(activeNav === 'tvshows' ? 'Top TV Shows & Series' : 'Trending Movies & Series');
      setSectionSubtitle('Handpicked visual masterpieces for your viewing pleasure.');
      setSelectedGenre('');
      setSelectedYear('');
      setSearchQuery('');
      performSearch('', '', '', currentMediaType);
    } else if (tab === 'library') {
      setSectionTitle('Classic Library (2010s & Older)');
      setSectionSubtitle('All-time cinematic legends and high-rated masterpieces.');
      performSearch('', '', '2010', currentMediaType);
    } else if (tab === 'watchlist') {
      setSectionTitle('My Saved Watchlist');
      setSectionSubtitle('Your personal collection of saved movies & shows.');
      setMovies(watchlist);
    }
  };

  // Toggle Watchlist item
  const handleToggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.id === movie.id);
      if (exists) {
        return prev.filter((item) => item.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  // Track movie viewed into Watch History
  const handleMovieViewed = (movie) => {
    if (!movie || !movie.id) return;
    setWatchHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== movie.id);
      return [movie, ...filtered].slice(0, 10);
    });
  };

  // Search trigger from chatbot bold movie title click
  const handleSearchFromChat = (movieTitle) => {
    setSearchQuery(movieTitle);
    setActiveTab('discover');
    setSectionTitle(`Search results for "${movieTitle}"`);
    performSearch(movieTitle, '', '', currentMediaType);
  };

  const handleShowAiPicks = () => {
    setIsChatOpen(true);
  };

  return (
    <div class="min-h-screen bg-background text-on-surface font-body-md relative select-none">
      {/* Atmospheric Background Glow Orbs */}
      <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[140px] rounded-full"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/15 blur-[120px] rounded-full"></div>
      </div>

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearchSubmit}
        activeNav={activeNav}
        onNavClick={handleNavClick}
        onLogoClick={handleLogoClick}
      />

      <div class="flex min-h-[calc(100vh-64px)] relative z-10">
        {/* Left Sidebar */}
        <Sidebar
          genres={genres}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* Main Content Area */}
        <main class="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-margin-desktop min-w-0">
          {/* Top 5 Trending Slideshow Hero */}
          <HeroSection
            movies={movies}
            onSelectMovie={(id) => setSelectedMovieId(id)}
          />

          {/* Movies & Shows Grid */}
          <MoviesGrid
            movies={activeTab === 'watchlist' ? watchlist : movies}
            isLoading={isLoadingMovies}
            sectionTitle={sectionTitle}
            sectionSubtitle={sectionSubtitle}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={(id) => setSelectedMovieId(id)}
            onViewAll={() => handleTabChange('discover')}
          />

          {/* AI Bento + Watch History */}
          <AiBento
            watchHistory={watchHistory}
            onSelectMovie={(id) => setSelectedMovieId(id)}
            onShowAiPicks={handleShowAiPicks}
          />

          {/* Footer */}
          <Footer />
        </main>
      </div>

      {/* Movie / Show Details Modal */}
      <MovieModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
        watchlist={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
        onMovieViewed={handleMovieViewed}
      />

      {/* AI Chatbot Assistant */}
      <ChatAssistant
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onSearchMovieTitle={handleSearchFromChat}
      />
    </div>
  );
}
