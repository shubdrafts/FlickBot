import React, { useState, useEffect } from 'react';
import { getBackdropUrl } from '../services/api';
import { handleWatchNowRedirect } from '../config/streaming';

export default function HeroSection({ movies = [], onSelectMovie }) {
  const top5 = movies.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play slideshow every 5 seconds if not hovered
  useEffect(() => {
    if (top5.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % top5.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [top5.length, isHovered]);

  // Keep index within bounds if top5 changes
  useEffect(() => {
    if (currentIndex >= top5.length && top5.length > 0) {
      setCurrentIndex(0);
    }
  }, [top5.length, currentIndex]);

  if (!top5 || top5.length === 0) {
    return (
      <section class="mb-8 relative rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl h-[340px] sm:h-[400px] flex items-center justify-center">
        <div class="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  const currentMovie = top5[currentIndex] || top5[0];
  const title = currentMovie.title || currentMovie.original_title || 'Featured Content';
  const overview = currentMovie.overview || 'Experience this top trending release on FlickBot.';
  const backdrop = getBackdropUrl(currentMovie.backdrop_path || currentMovie.poster_path);

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? top5.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % top5.length);
  };

  const handleWatchNow = (e) => {
    e.stopPropagation();
    handleWatchNowRedirect(currentMovie);
  };

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      class="mb-8 relative rounded-2xl overflow-hidden glass-panel border border-white/10 group shadow-2xl transition-all"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-surface via-surface/75 to-transparent z-10 pointer-events-none"></div>
      <div class="h-[340px] sm:h-[420px] w-full relative">
        {/* Backdrop Image */}
        <img
          key={currentMovie.id || currentIndex}
          src={backdrop}
          alt={title}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 animate-fadeIn"
        />

        {/* Content Container */}
        <div class="absolute bottom-0 left-0 p-6 sm:p-10 z-20 max-w-2xl">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold shadow-md">
              <span class="material-symbols-outlined text-[16px]">local_fire_department</span> Trending #{currentIndex + 1}
            </span>
            {top5.length > 1 && (
              <span class="text-xs text-on-surface-variant/80 font-semibold glass-pill px-2.5 py-1 rounded-full">
                {currentIndex + 1} of {top5.length}
              </span>
            )}
          </div>
          
          <h1 class="font-headline-xl text-headline-xl sm:text-[36px] mb-3 text-white drop-shadow-md leading-tight">
            {title}
          </h1>
          <p class="text-on-surface-variant text-body-md line-clamp-2 mb-6 max-w-xl">
            {overview}
          </p>

          <div class="flex flex-wrap gap-4 items-center">
            <button
              onClick={handleWatchNow}
              class="bg-primary text-on-primary font-bold px-8 py-3 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <span class="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Watch Now
            </button>
            <button
              onClick={() => onSelectMovie(currentMovie.id)}
              class="glass-pill px-8 py-3 rounded-full border border-white/20 hover:bg-white/15 transition-all font-bold text-white flex items-center gap-2"
            >
              <span class="material-symbols-outlined">info</span>
              Details
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {top5.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              class="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full glass-panel border border-white/15 text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all opacity-80 group-hover:opacity-100"
              title="Previous Slide"
            >
              <span class="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>
            <button
              onClick={nextSlide}
              class="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full glass-panel border border-white/15 text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all opacity-80 group-hover:opacity-100"
              title="Next Slide"
            >
              <span class="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>
          </>
        )}

        {/* Bottom Slide Dot Indicators */}
        {top5.length > 1 && (
          <div class="absolute bottom-4 right-6 z-30 flex items-center gap-2">
            {top5.map((m, idx) => (
              <button
                key={m.id || idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                class={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-primary shadow-lg shadow-primary/50'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Go to slide ${idx + 1}: ${m.title || m.original_title}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
