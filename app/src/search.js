// search.js — Client-side full-text search with modal UI
// Exports: initSearch(contentIndex, basePath)

let searchIndex = [];
let isModalOpen = false;
let selectedResultIndex = -1;
let indexReady = false;

/**
 * Initialize the search system: build index, attach event listeners.
 * @param {object} contentIndex - The parsed content-index.json
 * @param {string} basePath - Base path for fetching content files
 */
export function initSearch(contentIndex, basePath) {
  setupEventListeners();
  buildSearchIndex(contentIndex, basePath);
}

// ── Event Listeners ──────────────────────────────────────────────

function setupEventListeners() {
  const searchBtn = document.getElementById('search-btn');
  const searchBackdrop = document.getElementById('search-backdrop');
  const searchInput = document.getElementById('search-input');

  // Open modal
  if (searchBtn) {
    searchBtn.addEventListener('click', openModal);
  }

  // Ctrl+K / Cmd+K shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (isModalOpen) {
        closeModal();
      } else {
        openModal();
      }
    }

    // Escape to close
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });

  // Close on backdrop click
  if (searchBackdrop) {
    searchBackdrop.addEventListener('click', closeModal);
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value.trim());
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      const results = document.querySelectorAll('.search-result-item');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedResultIndex = Math.min(selectedResultIndex + 1, results.length - 1);
        highlightResult(results);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedResultIndex = Math.max(selectedResultIndex - 1, 0);
        highlightResult(results);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedResultIndex >= 0 && results[selectedResultIndex]) {
          results[selectedResultIndex].click();
        }
      }
    });
  }
}

// ── Modal controls ───────────────────────────────────────────────

function openModal() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  if (modal) modal.classList.remove('hidden');
  if (input) {
    input.value = '';
    input.focus();
  }
  if (results) {
    results.innerHTML = `<div class="search-placeholder">Nhập từ khóa để tìm kiếm...</div>`;
  }

  selectedResultIndex = -1;
  isModalOpen = true;
}

function closeModal() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');

  if (modal) modal.classList.add('hidden');
  if (input) input.value = '';

  isModalOpen = false;
  selectedResultIndex = -1;
}

// ── Index Building ───────────────────────────────────────────────

async function buildSearchIndex(contentIndex, basePath) {
  searchIndex = [];

  const fetchFile = async (file, sectionTitle) => {
    try {
      const url = `${basePath}/content/${file.path}`;
      const res = await fetch(url);
      if (res.ok) {
        const content = await res.text();
        searchIndex.push({
          path: file.path,
          title: file.title || file.id,
          section: sectionTitle,
          content: content,
        });
      }
    } catch (err) {
      // Silently skip files that can't be fetched
    }
  };

  const promises = [];

  // Home page
  if (contentIndex.home) {
    promises.push(fetchFile(contentIndex.home, 'Trang chủ'));
  }

  // All sections
  if (contentIndex.sections) {
    for (const section of contentIndex.sections) {
      if (section.files) {
        for (const file of section.files) {
          promises.push(fetchFile(file, section.title));
        }
      }
      if (section.subsections) {
        for (const sub of section.subsections) {
          if (sub.files) {
            for (const file of sub.files) {
              promises.push(fetchFile(file, `${section.title} › ${sub.title}`));
            }
          }
        }
      }
    }
  }

  // Fetch all in background (non-blocking)
  await Promise.allSettled(promises);
  indexReady = true;
}

// ── Search Algorithm ─────────────────────────────────────────────

function performSearch(query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  selectedResultIndex = -1;

  if (!query) {
    resultsContainer.innerHTML = `<div class="search-placeholder">Nhập từ khóa để tìm kiếm...</div>`;
    return;
  }

  if (!indexReady) {
    resultsContainer.innerHTML = `<div class="search-placeholder">Đang tải dữ liệu tìm kiếm...</div>`;
    return;
  }

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    resultsContainer.innerHTML = `<div class="search-placeholder">Nhập từ khóa để tìm kiếm...</div>`;
    return;
  }

  // Score and filter
  const scored = [];

  for (const item of searchIndex) {
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();

    // All words must appear somewhere in title or content
    const allMatch = words.every(w => titleLower.includes(w) || contentLower.includes(w));
    if (!allMatch) continue;

    // Calculate score: title matches weighted 10x
    let score = 0;
    for (const w of words) {
      if (titleLower.includes(w)) score += 10;
      if (contentLower.includes(w)) score += 1;
    }

    // Extract snippet around first match in content
    const snippet = extractSnippet(item.content, words);

    scored.push({ ...item, score, snippet });
  }

  // Sort by score descending, take top 10
  scored.sort((a, b) => b.score - a.score);
  const topResults = scored.slice(0, 10);

  // Render results
  if (topResults.length === 0) {
    resultsContainer.innerHTML = `<div class="search-placeholder">Không tìm thấy kết quả</div>`;
    return;
  }

  resultsContainer.innerHTML = topResults.map(result => {
    const href = '#/' + result.path.replace(/\.md$/, '');
    const highlightedTitle = highlightText(result.title, words);
    const highlightedSnippet = highlightText(result.snippet, words);

    return (
      `<a class="search-result-item" href="${href}" data-search-result>` +
        `<div class="search-result-title">${highlightedTitle}</div>` +
        `<span class="search-result-section">${escapeHtml(result.section)}</span>` +
        `<div class="search-result-snippet">${highlightedSnippet}</div>` +
      `</a>`
    );
  }).join('');

  // Close modal on result click
  resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => closeModal());
  });
}

// ── Helpers ──────────────────────────────────────────────────────

function extractSnippet(content, words) {
  // Strip markdown syntax for cleaner snippets
  const plain = content
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, '')        // inline code
    .replace(/[#*_~>\[\]!|]/g, '')  // markdown chars
    .replace(/\n+/g, ' ')           // newlines to spaces
    .replace(/\s+/g, ' ')           // collapse whitespace
    .trim();

  const lowerPlain = plain.toLowerCase();

  // Find first match position
  let firstMatchPos = -1;
  for (const w of words) {
    const pos = lowerPlain.indexOf(w);
    if (pos !== -1 && (firstMatchPos === -1 || pos < firstMatchPos)) {
      firstMatchPos = pos;
    }
  }

  if (firstMatchPos === -1) {
    return plain.substring(0, 120) + (plain.length > 120 ? '...' : '');
  }

  const start = Math.max(0, firstMatchPos - 50);
  const end = Math.min(plain.length, firstMatchPos + 100);
  let snippet = plain.substring(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < plain.length) snippet += '...';

  return snippet;
}

function highlightText(text, words) {
  let result = escapeHtml(text);
  for (const word of words) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    result = result.replace(regex, '<span class="search-highlight">$1</span>');
  }
  return result;
}

function highlightResult(results) {
  results.forEach((r, i) => {
    if (i === selectedResultIndex) {
      r.classList.add('selected');
      r.scrollIntoView({ block: 'nearest' });
    } else {
      r.classList.remove('selected');
    }
  });
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}
