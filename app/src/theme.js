// theme.js — Dark/Light theme management
// Exports: initTheme(), toggleTheme(), getTheme()

const STORAGE_KEY = 'unity-roadmap-theme';
let currentTheme = 'dark';

/**
 * Initialize theme from localStorage or default to 'dark'.
 * Sets the data-theme attribute on <html>.
 */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  currentTheme = saved === 'light' ? 'light' : 'dark';
  applyTheme();
}

/**
 * Toggle between 'dark' and 'light' themes.
 * Saves preference to localStorage and updates the DOM.
 */
export function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, currentTheme);
  applyTheme();
}

/**
 * Get the current theme string.
 * @returns {'dark' | 'light'}
 */
export function getTheme() {
  return currentTheme;
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
}
