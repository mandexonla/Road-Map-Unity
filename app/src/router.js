// router.js — Hash-based SPA routing
// Exports: initRouter(onNavigate), navigateTo(path), getCurrentPath()

let onNavigateCallback = null;

/**
 * Initialize the hash-based router.
 * @param {(path: string) => void} onNavigate - Called with the .md file path on every navigation.
 */
export function initRouter(onNavigate) {
  onNavigateCallback = onNavigate;

  window.addEventListener('hashchange', () => {
    const path = hashToPath(window.location.hash);
    onNavigateCallback(path);
  });

  // Trigger initial navigation
  const path = hashToPath(window.location.hash);
  onNavigateCallback(path);
}

/**
 * Navigate to a content path by setting the hash.
 * @param {string} path - The .md file path (e.g., '01-Intern/README.md')
 */
export function navigateTo(path) {
  const hashPath = path.replace(/\.md$/, '');
  window.location.hash = '#/' + hashPath;
}

/**
 * Get the current content path from the hash.
 * @returns {string} The .md file path
 */
export function getCurrentPath() {
  return hashToPath(window.location.hash);
}

/**
 * Convert a hash string to a .md file path.
 * '#/01-Intern/README' → '01-Intern/README.md'
 * '#/' or '' → 'README.md'
 */
function hashToPath(hash) {
  // Remove '#/' prefix
  let path = hash.replace(/^#\/?/, '').trim();

  if (!path) {
    return 'README.md';
  }

  // Ensure .md extension
  if (!path.endsWith('.md')) {
    path += '.md';
  }

  return path;
}
