import React from 'react';
import { getPosterUrl } from '../services/api';

export default function AiBento({ watchHistory, onSelectMovie, onShowAiPicks }) {
  const displayHistory = watchHistory && watchHistory.length > 0 ? watchHistory.slice(0, 3) : [];

  return (
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* AI Recommendation Banner */}
      <div class="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row gap-6 items-center border border-white/10 relative overflow-hidden">
        <div class="w-28 h-28 flex-shrink-0 bg-primary-container/20 rounded-full flex items-center justify-center relative overflow-hidden border border-primary/30 shadow-inner">
          <div class="absolute inset-0 shimmer"></div>
          <span class="material-symbols-outlined text-[52px] text-primary-container">smart_toy</span>
        </div>
        <div>
          <h4 class="font-headline-lg text-headline-lg text-primary-fixed mb-2">Personalized AI Picks</h4>
          <p class="text-on-surface-variant font-body-md mb-4">Powered by Gemini AI. Get tailored recommendations based on your favorite film genres, directors, and mood.</p>
          <button
            onClick={onShowAiPicks}
            class="text-primary font-bold flex items-center gap-2 group hover:underline"
          >
            <span>Show AI Recommendations</span> 
            <span class="material-symbols-outlined group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Watch History Widget */}
      <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col justify-between">
        <div>
          <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">Watch History</h4>
          <div class="flex flex-col gap-3">
            {displayHistory.length === 0 ? (
              <p class="text-xs text-on-surface-variant">No recently viewed titles.</p>
            ) : (
              displayHistory.map((m, idx) => (
                <div
                  key={m.id || idx}
                  onClick={() => onSelectMovie(m.id)}
                  class="flex items-center gap-3 group cursor-pointer"
                >
                  <div class="w-10 h-10 rounded bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
                    <img
                      class="w-full h-full object-cover"
                      alt={m.title || 'Movie'}
                      src={getPosterUrl(m.poster_path, 'w185')}
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[13px] font-bold text-white truncate group-hover:text-primary transition-colors">
                      {m.title || m.original_title}
                    </p>
                    <div class="w-full h-1.5 bg-white/10 rounded-full mt-1">
                      <div class="w-[85%] h-full bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
