// progress.js — Checkbox progress tracking with localStorage persistence
// Exports: initProgress(), getCheckboxState(), setCheckboxState(), getFileProgress(), getTotalProgress(), resetProgress()

const STORAGE_KEY = 'unity-roadmap-progress';
let progressData = {};

/**
 * Load progress data from localStorage.
 * @returns {object} The progress data object
 */
export function initProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    progressData = saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.warn('Failed to load progress data:', e);
    progressData = {};
  }
  return progressData;
}

/**
 * Get the checked state of a specific checkbox.
 * @param {string} filePath - The .md file path
 * @param {number} index - The checkbox index within the file
 * @returns {boolean}
 */
export function getCheckboxState(filePath, index) {
  if (!progressData[filePath]) return false;
  return !!progressData[filePath][String(index)];
}

/**
 * Set the checked state of a specific checkbox and persist.
 * @param {string} filePath - The .md file path
 * @param {number} index - The checkbox index within the file
 * @param {boolean} checked - Whether the checkbox is checked
 */
export function setCheckboxState(filePath, index, checked) {
  if (!progressData[filePath]) {
    progressData[filePath] = {};
  }
  progressData[filePath][String(index)] = checked;
  save();
}

/**
 * Get the progress for a specific file.
 * @param {string} filePath - The .md file path
 * @returns {{ checked: number, total: number }}
 */
export function getFileProgress(filePath) {
  const fileData = progressData[filePath] || {};
  const indices = Object.keys(fileData);
  const checked = indices.filter(k => fileData[k]).length;
  return { checked, total: indices.length };
}

/**
 * Calculate total progress across all files in the content index.
 * @param {object} contentIndex - The parsed content-index.json
 * @returns {{ totalChecked: number, totalCheckboxes: number, percentage: number }}
 */
export function getTotalProgress(contentIndex) {
  let totalChecked = 0;
  let totalCheckboxes = 0;

  const processFile = (file) => {
    if (file.checkboxCount && file.checkboxCount > 0) {
      totalCheckboxes += file.checkboxCount;
      const fileData = progressData[file.path] || {};
      const checked = Object.values(fileData).filter(Boolean).length;
      totalChecked += Math.min(checked, file.checkboxCount);
    }
  };

  // Home page
  if (contentIndex.home && contentIndex.home.checkboxCount > 0) {
    processFile(contentIndex.home);
  }

  // All sections
  if (contentIndex.sections) {
    for (const section of contentIndex.sections) {
      if (section.files) {
        section.files.forEach(processFile);
      }
      if (section.subsections) {
        for (const sub of section.subsections) {
          if (sub.files) {
            sub.files.forEach(processFile);
          }
        }
      }
    }
  }

  const percentage = totalCheckboxes > 0
    ? Math.round((totalChecked / totalCheckboxes) * 100)
    : 0;

  return { totalChecked, totalCheckboxes, percentage };
}

/**
 * Reset all progress data.
 * @returns {object} Empty progress object
 */
export function resetProgress() {
  progressData = {};
  localStorage.removeItem(STORAGE_KEY);
  return progressData;
}

// ── Internal ─────────────────────────────────────────────────────

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
  } catch (e) {
    console.warn('Failed to save progress data:', e);
  }
}

// ── Book progress ────────────────────────────────────────────────

export function getBookProgress(bookId) {
  try {
    const data = localStorage.getItem('unity-roadmap-books-progress');
    if (!data) return null;
    const progress = JSON.parse(data);
    return progress[bookId] || null;
  } catch (e) {
    console.warn('Failed to load book progress:', e);
    return null;
  }
}

export function setBookProgress(bookId, page) {
  try {
    const data = localStorage.getItem('unity-roadmap-books-progress') || '{}';
    const progress = JSON.parse(data);
    progress[bookId] = { page, timestamp: Date.now() };
    localStorage.setItem('unity-roadmap-books-progress', JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save book progress:', e);
  }
}

export function clearBookProgress(bookId) {
  try {
    const data = localStorage.getItem('unity-roadmap-books-progress');
    if (!data) return;
    const progress = JSON.parse(data);
    delete progress[bookId];
    localStorage.setItem('unity-roadmap-books-progress', JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to clear book progress:', e);
  }
}

