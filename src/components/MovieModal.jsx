import React, { useState, useEffect, useRef } from 'react';
import { fetchMovieDetails, getPosterUrl } from '../services/api';
import { handleWatchNowRedirect } from '../config/streaming';

export default function MovieModal({ movieId, onClose, watchlist, onToggleWatchlist, onMovieViewed }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const trailerRef = useRef(null);

  useEffect(() => {
    if (!movieId) return;

    let isMounted = true;
    setIsLoading(true);
    setDetails(null);

    fetchMovieDetails(movieId)
      .then((data) => {
        if (!isMounted) return;
        setDetails(data);
        setIsLoading(false);
        if (onMovieViewed) {
          onMovieViewed(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching movie details:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  if (!movieId) return null;

  const isSaved = details && watchlist.some((item) => item.id === details.id);

  const cast = details?.credits?.cast ? details.credits.cast.slice(0, 6) : [];
  const videos = details?.videos?.results || [];
  const trailer = videos.find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];

  const handleWatchPrimary = () => {
    if (details) handleWatchNowRedirect(details, 'multimovies');
  };

  const handleWatchFallback = () => {
    if (details) handleWatchNowRedirect(details, 'skyflixer');
  };

  return (
    <div class="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-8 overflow-y-auto">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        class="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      ></div>

      {/* Main Glass Card Container */}
      <div class="glass-panel w-full max-w-[1100px] rounded-2xl flex flex-col shadow-2xl relative z-10 border border-white/15 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          class="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/20 transition-all z-20 text-white flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>

        {isLoading || !details ? (
          <div class="p-12 text-center text-on-surface-variant">
            <div class="inline-block w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <h2 class="text-xl font-bold text-white mb-2">Loading Movie Details...</h2>
            <p class="text-sm">Fetching TMDB overview, credits, and video trailers</p>
          </div>
        ) : (
          <>
            <div class="flex flex-col lg:flex-row p-6 sm:p-10 gap-8">
              {/* Left Poster */}
              <div class="flex-shrink-0 w-full lg:w-72 mx-auto lg:mx-0">
                <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                  <img
                    class="w-full h-full object-cover"
                    alt={details.title}
                    src={getPosterUrl(details.poster_path)}
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
                  <div class="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <span class="glass-pill px-3 py-1 text-primary font-bold rounded-full text-label-sm">
                      {details.media_type === 'tv' ? 'TV SERIES HD' : '4K ULTRA HD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Details */}
              <div class="flex flex-col flex-grow min-w-0">
                <div class="mb-4">
                  <h1 class="font-headline-xl text-[32px] sm:text-headline-xl text-white mb-1">
                    {details.title || details.original_title}
                  </h1>
                  <p class="font-body-md text-primary/90 italic tracking-wide">
                    {details.tagline ? `"${details.tagline}"` : (details.release_date ? `Released ${details.release_date.slice(0, 4)}` : '')}
                  </p>
                </div>

                {/* Metadata Chips */}
                <div class="flex flex-wrap gap-2.5 mb-6">
                  <div class="glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs">
                    <span class="material-symbols-outlined text-primary-container text-[18px]">schedule</span>
                    <span>{details.runtime ? `${details.runtime} min` : 'N/A'}</span>
                  </div>
                  <div class="glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs">
                    <span class="material-symbols-outlined text-primary-container text-[18px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span class="font-bold">{details.vote_average ? `${details.vote_average.toFixed(1)} / 10` : 'N/A'}</span>
                  </div>
                  <div class="glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs">
                    <span class="material-symbols-outlined text-primary-container text-[18px]">group</span>
                    <span>{details.vote_count ? `${details.vote_count.toLocaleString()} Votes` : 'N/A'}</span>
                  </div>
                  <div class="glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs">
                    <span class="material-symbols-outlined text-primary-container text-[18px]">movie</span>
                    <span>{(details.genres || []).map((g) => g.name).join(', ') || 'N/A'}</span>
                  </div>
                </div>

                {/* Synopsis */}
                <div class="mb-6">
                  <h3 class="font-label-sm text-on-surface-variant/80 uppercase tracking-widest mb-2 text-[11px]">Synopsis</h3>
                  <p class="font-body-md text-on-surface leading-relaxed text-sm sm:text-base">
                    {details.overview || 'No synopsis available for this title.'}
                  </p>
                </div>

                {/* Cast Section */}
                <div class="mb-6">
                  <h3 class="font-label-sm text-on-surface-variant/80 uppercase tracking-widest mb-3 text-[11px]">Leading Cast</h3>
                  <div class="flex flex-wrap gap-4">
                    {cast.length > 0 ? (
                      cast.map((c, i) => (
                        <div key={c.id || i} class="flex items-center gap-2.5 glass-pill px-3 py-1.5 rounded-full border border-white/10">
                          <img
                            src={c.profile_path ? getPosterUrl(c.profile_path, 'w185') : 'https://via.placeholder.com/100x100/1d2024/ffe5a0?text=Actor'}
                            class="w-8 h-8 rounded-full object-cover border border-white/20"
                            alt={c.name}
                          />
                          <div>
                            <p class="font-label-md text-xs text-white leading-tight font-semibold">{c.name}</p>
                            <p class="text-[10px] text-on-surface-variant/70 leading-tight">{c.character || 'Cast'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span class="text-xs text-on-surface-variant">No cast information available</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div class="flex flex-wrap gap-4 mt-auto">
                  <button
                    onClick={handleWatchPrimary}
                    class="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-container/20"
                    title="Stream on MultiMovies"
                  >
                    <span class="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    Watch Now (MultiMovies)
                  </button>
                  <button
                    onClick={handleWatchFallback}
                    class="glass-pill px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20"
                    title="Stream on SkyFlixer"
                  >
                    <span class="material-symbols-outlined">alt_route</span>
                    SkyFlixer Server
                  </button>
                  <button
                    onClick={() => onToggleWatchlist(details)}
                    class="glass-pill px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 hover:bg-white/20 transition-all"
                  >
                    <span class="material-symbols-outlined">{isSaved ? 'check' : 'add'}</span>
                    {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                  </button>
                </div>
              </div>
            </div>

            {/* Video Trailer Section */}
            {trailer && trailer.key && (
              <div ref={trailerRef} class="w-full border-t border-white/10 p-6 sm:p-10">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-headline-lg text-headline-lg text-white text-xl sm:text-2xl">Official Trailer</h3>
                  <div class="flex gap-2">
                    <span class="material-symbols-outlined text-primary-container">hd</span>
                    <span class="material-symbols-outlined text-on-surface-variant">closed_caption</span>
                  </div>
                </div>
                <div class="relative w-full aspect-video rounded-xl overflow-hidden glass-panel border border-white/10 shadow-inner bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
                    title="Official Trailer"
                    class="w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  ></iframe>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
