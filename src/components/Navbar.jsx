import React from 'react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onSearch,
  activeNav,
  onNavClick,
  onLogoClick
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <nav class="w-full h-16 sticky top-0 z-40 border-b border-white/15 bg-surface/70 backdrop-blur-3xl flex justify-between items-center px-4 md:px-margin-desktop shadow-md">
      <div class="flex items-center gap-6">
        <a
          href="#"
          class="flex items-center gap-2 group cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            if (onLogoClick) onLogoClick();
          }}
          title="FlickBot Home"
        >
          <span class="material-symbols-outlined text-primary-container text-[28px] group-hover:rotate-12 transition-transform">movie_filter</span>
          <span class="font-headline-lg text-[26px] font-bold text-primary-container tracking-tight">FlickBot</span>
        </a>
        <div class="hidden md:flex items-center gap-6 ml-6">
          <button
            onClick={() => onNavClick('dashboard')}
            class={`font-body-md text-body-md transition-all ${
              activeNav === 'dashboard'
                ? 'text-primary font-bold border-b-2 border-primary pb-1'
                : 'text-on-surface-variant hover:bg-white/10 hover:text-primary px-3 py-1 rounded-full'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavClick('movies')}
            class={`font-body-md text-body-md transition-all ${
              activeNav === 'movies'
                ? 'text-primary font-bold border-b-2 border-primary pb-1'
                : 'text-on-surface-variant hover:bg-white/10 hover:text-primary px-3 py-1 rounded-full'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onNavClick('tvshows')}
            class={`font-body-md text-body-md transition-all ${
              activeNav === 'tvshows'
                ? 'text-primary font-bold border-b-2 border-primary pb-1'
                : 'text-on-surface-variant hover:bg-white/10 hover:text-primary px-3 py-1 rounded-full'
            }`}
          >
            TV Shows
          </button>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <form onSubmit={handleSubmit} class="glass-panel rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10 focus-within:border-primary/50 transition-colors">
          <span class="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            class="bg-transparent border-none outline-none focus:ring-0 text-label-md font-label-md w-36 sm:w-56 text-on-surface placeholder:text-on-surface-variant/50"
            placeholder="Search universe..."
            type="text"
          />
          <button type="submit" class="text-xs text-primary hover:underline font-bold px-1">Go</button>
        </form>
      </div>
    </nav>
  );
}
