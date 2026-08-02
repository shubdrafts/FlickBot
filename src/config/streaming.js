// src/config/streaming.js

/**
 * Central Streaming Platform Provider Configurations & URL Templates
 * Modify base URLs or route structures here to update redirection formats app-wide.
 */
export const STREAMING_CONFIG = {
  // Active primary provider ('multimovies' | 'skyflixer')
  DEFAULT_PROVIDER: 'multimovies',
  FALLBACK_PROVIDER: 'skyflixer',

  PROVIDERS: {
    multimovies: {
      name: 'MultiMovies',
      baseUrl: 'https://multimovies.motorcycles',
      // Format: /movies/{slug}/ or /tvshows/{slug}/
      moviePath: '/movies/{slug}/',
      tvPath: '/tvshows/{slug}/',
    },
    skyflixer: {
      name: 'SkyFlixer',
      baseUrl: 'https://skyflixer.fun',
      // Format: /movie/{slug}-{year} or /tv-shows/{slug}-{year}
      moviePath: '/movie/{slug}-{year}',
      tvPath: '/tv-shows/{slug}-{year}',
    }
  }
};

/**
 * Converts a title string into a clean URL-friendly slug.
 * Example: "Spider-Man: Brand New Day" -> "spider-man-brand-new-day"
 * Example: "Chainsaw Man - The Movie: Reze Arc" -> "chainsaw-man-the-movie-reze-arc"
 */
export function slugifyTitle(title) {
  if (!title) return '';
  return title
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics / accents
    .replace(/[^a-z0-9\s-]/g, '')    // Remove non-alphanumeric except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-')            // Replace spaces with hyphens
    .replace(/-+/g, '-');            // Replace consecutive hyphens with single hyphen
}

/**
 * Generates the direct watch URL for a movie or TV show for a specified provider.
 * @param {Object} item - Movie/Show object containing title, release_date/first_air_date, media_type
 * @param {string} providerKey - 'multimovies' | 'skyflixer'
 * @returns {string} - Complete formatted URL
 */
export function generateWatchUrl(item, providerKey = STREAMING_CONFIG.DEFAULT_PROVIDER) {
  if (!item) return STREAMING_CONFIG.PROVIDERS.multimovies.baseUrl;

  const provider = STREAMING_CONFIG.PROVIDERS[providerKey] || STREAMING_CONFIG.PROVIDERS.multimovies;
  const rawTitle = item.title || item.name || item.original_title || item.original_name || '';
  const slug = slugifyTitle(rawTitle);

  const rawDate = item.release_date || item.first_air_date || '';
  const year = rawDate ? rawDate.slice(0, 4) : '2024';

  const isTv = item.media_type === 'tv' || !!item.first_air_date || (item.name && !item.title);
  const pathTemplate = isTv ? provider.tvPath : provider.moviePath;

  const formattedPath = pathTemplate
    .replace('{slug}', slug)
    .replace('{year}', year);

  return `${provider.baseUrl}${formattedPath}`;
}

/**
 * Main action handler when clicking "Watch Now"
 * Launches the formatted watch URL in a new tab.
 * @param {Object} item - Movie or TV Show object
 * @param {string} [overrideProvider] - Optional provider key
 */
export function handleWatchNowRedirect(item, overrideProvider) {
  if (!item) return;

  const providerKey = overrideProvider || STREAMING_CONFIG.DEFAULT_PROVIDER;
  const watchUrl = generateWatchUrl(item, providerKey);
  
  // Open watch link in a new browser window/tab
  window.open(watchUrl, '_blank', 'noopener,noreferrer');
}
