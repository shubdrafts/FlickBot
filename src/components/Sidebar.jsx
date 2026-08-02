import React from 'react';

export default function Sidebar({
  genres,
  selectedGenre,
  setSelectedGenre,
  selectedYear,
  setSelectedYear,
  activeTab,
  onTabChange,
  onOpenChat
}) {
  return (
    <aside class="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 z-30 border-r border-white/10 bg-surface/40 backdrop-blur-2xl flex-col pt-6 pb-8">
      <div class="px-6 mb-6">
        <p class="text-label-sm font-label-sm text-on-surface-variant/60 uppercase tracking-widest mb-3">Discover</p>
        <nav class="flex flex-col gap-1">
          <button
            onClick={() => onTabChange('discover')}
            class={`flex items-center gap-3 py-3 px-6 font-label-md text-label-md transition-all text-left w-full rounded-r-full ${
              activeTab === 'discover'
                ? 'bg-primary/20 text-primary-fixed border-l-4 border-primary'
                : 'text-on-surface-variant hover:bg-white/5 hover:text-primary'
            }`}
          >
            <span class="material-symbols-outlined">explore</span>
            <span>Discover</span>
          </button>
          <button
            onClick={() => onTabChange('library')}
            class={`flex items-center gap-3 py-3 px-6 font-label-md text-label-md transition-all text-left w-full rounded-r-full ${
              activeTab === 'library'
                ? 'bg-primary/20 text-primary-fixed border-l-4 border-primary'
                : 'text-on-surface-variant hover:bg-white/5 hover:text-primary'
            }`}
          >
            <span class="material-symbols-outlined">video_library</span>
            <span>Library</span>
          </button>
          <button
            onClick={() => onTabChange('watchlist')}
            class={`flex items-center gap-3 py-3 px-6 font-label-md text-label-md transition-all text-left w-full rounded-r-full ${
              activeTab === 'watchlist'
                ? 'bg-primary/20 text-primary-fixed border-l-4 border-primary'
                : 'text-on-surface-variant hover:bg-white/5 hover:text-primary'
            }`}
          >
            <span class="material-symbols-outlined">bookmark</span>
            <span>Watchlist</span>
          </button>
        </nav>
      </div>

      {/* Advanced Filters Section */}
      <div class="px-6 mt-2 border-t border-white/5 pt-6">
        <p class="text-label-sm font-label-sm text-on-surface-variant/60 uppercase tracking-widest mb-3">Refine</p>
        <div class="flex flex-col gap-3">
          <div class="space-y-1">
            <label class="text-[11px] text-on-surface-variant/70 ml-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              class="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-label-md text-on-surface focus:ring-1 focus:ring-primary/50 outline-none cursor-pointer"
            >
              <option value="" class="bg-surface-container text-white">All Genres</option>
              {genres.map((g) => (
                <option key={g.id || g.name} value={g.name} class="bg-surface-container text-white">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[11px] text-on-surface-variant/70 ml-1">Release Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              class="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-label-md text-on-surface focus:ring-1 focus:ring-primary/50 outline-none cursor-pointer"
            >
              <option value="" class="bg-surface-container text-white">All Years</option>
              <option value="2026" class="bg-surface-container text-white">2026</option>
              <option value="2025" class="bg-surface-container text-white">2025</option>
              <option value="2024" class="bg-surface-container text-white">2024</option>
              <option value="2023" class="bg-surface-container text-white">2023</option>
              <option value="2022" class="bg-surface-container text-white">2022</option>
              <option value="2021" class="bg-surface-container text-white">2021</option>
              <option value="2020" class="bg-surface-container text-white">2020</option>
              <option value="2010" class="bg-surface-container text-white">2010s Classics</option>
              <option value="2000" class="bg-surface-container text-white">2000s Classics</option>
            </select>
          </div>
          <button
            onClick={onOpenChat}
            class="mt-3 bg-primary-container text-on-primary-container font-bold py-3 rounded-full hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20"
          >
            <span class="material-symbols-outlined text-[20px]">smart_toy</span>
            Ask AI Assistant
          </button>
        </div>
      </div>
    </aside>
  );
}
