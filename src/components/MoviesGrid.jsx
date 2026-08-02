import React from 'react';
import MovieCard from './MovieCard';

export default function MoviesGrid({
  movies,
  isLoading,
  sectionTitle,
  sectionSubtitle,
  watchlist,
  onToggleWatchlist,
  onSelectMovie,
  onViewAll
}) {
  return (
    <section class="mb-10">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-white">{sectionTitle}</h2>
          <p class="text-on-surface-variant font-body-md opacity-70">{sectionSubtitle}</p>
        </div>
        <button
          onClick={onViewAll}
          class="text-primary hover:underline font-label-md text-label-md flex items-center gap-1 transition-all"
        >
          View All <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[300px]">
        {isLoading ? (
          <div class="col-span-full py-20 text-center text-on-surface-variant/70">
            <div class="inline-block w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="font-label-md">Connecting to TMDb Universe...</p>
          </div>
        ) : !movies || movies.length === 0 ? (
          <div class="col-span-full py-16 text-center glass-panel rounded-2xl p-8 border border-white/10">
            <span class="material-symbols-outlined text-[48px] text-on-surface-variant/50 mb-2">movie_off</span>
            <h3 class="font-bold text-white text-lg mb-1">No Movies Found</h3>
            <p class="text-on-surface-variant text-sm">Try broadening your search query or select another genre!</p>
          </div>
        ) : (
          movies.map((m) => {
            const isSaved = watchlist.some((item) => item.id === m.id);
            return (
              <MovieCard
                key={m.id}
                movie={m}
                isSaved={isSaved}
                onToggleWatchlist={onToggleWatchlist}
                onSelectMovie={onSelectMovie}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
