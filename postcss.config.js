/**
 * PostCSS Configuration - TailwindCSS v4 Compatible
 * 
 * Updated for TailwindCSS v4.0.0 compatibility
 * - Removed legacy TailwindCSS plugin (handled by @tailwindcss/vite now)
 * - Optimized for stable hot reloading
 */
export default {
  plugins: {
    // Use postcss-nesting for CSS nesting support
    'postcss-nesting': {},
    // TailwindCSS v4 is handled by @tailwindcss/vite, not PostCSS plugin
    autoprefixer: {},
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true,
      },
      // Prevent redundant processing
      browsers: 'last 2 versions',
    },
  },
  // Add source map in development only to prevent unnecessary processing
  sourceMap: process.env.NODE_ENV === 'development',
  // Add cache settings to prevent reprocessing unchanged files
  // This helps prevent the hot reload loops
  map: process.env.NODE_ENV === 'development' ? { inline: false } : false,
};
