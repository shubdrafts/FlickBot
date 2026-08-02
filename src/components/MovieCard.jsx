import React from 'react';
import { getPosterUrl } from '../services/api';
import { handleWatchNowRedirect } from '../config/streaming';

export default function MovieCard({ movie, isSaved, onToggleWatchlist, onSelectMovie }) {
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const poster = getPosterUrl(movie.poster_path);
  const title = movie.title || movie.original_title || 'Untitled';

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    onToggleWatchlist(movie);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    handleWatchNowRedirect(movie);
  };

  return (
    <div
      onClick={() => onSelectMovie(movie.id)}
      class="group movie-card-hover cursor-pointer"
    >
      <div class="relative aspect-[2/3] rounded-xl overflow-hidden glass-panel mb-3 p-[1px] border border-white/10 shadow-lg">
        <div class="w-full h-full rounded-xl overflow-hidden relative">
          <img
            src={poster}
            alt={title}
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Hover Overlay */}
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={handlePlayClick}
              class="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xl hover:scale-110 active:scale-95 transition-all"
              title="Watch Now Stream"
            >
              <span class="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </button>
            <button
              onClick={handleWatchlistClick}
              class={`w-11 h-11 rounded-full glass-panel flex items-center justify-center hover:bg-white/20 transition-all ${
                isSaved ? 'text-primary' : 'text-white'
              }`}
              title="Add to Watchlist"
            >
              <span class="material-symbols-outlined">{isSaved ? 'check' : 'bookmark_add'}</span>
            </button>
          </div>

          {/* TMDb Rating Badge */}
          <div class="absolute top-2.5 right-2.5 glass-panel px-2.5 py-0.5 rounded-full text-[11px] font-bold text-primary flex items-center gap-1 border border-white/10 shadow-md">
            <span class="material-symbols-outlined text-[13px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {rating}
          </div>
        </div>
      </div>
      <h3 class="font-label-md text-label-md text-white group-hover:text-primary transition-colors truncate font-semibold">
        {title}
      </h3>
      <p class="text-label-sm text-on-surface-variant/70 text-xs mt-0.5">
        {year ? `${year} • ` : ''}TMDb
      </p>
    </div>
  );
}
