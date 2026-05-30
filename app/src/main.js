// main.js — Entry point: wires all modules together
// Imports all modules and orchestrates the application lifecycle

import './styles/index.css';
import { initTheme, toggleTheme } from './theme.js';
import { initRouter, navigateTo, getCurrentPath } from './router.js';
import { initMarkdown, renderMarkdown, renderMermaidDiagrams } from './markdown.js';
import { initSidebar, setActiveItem, updateSidebarProgress } from './sidebar.js';
import { initProgress, getCheckboxState, setCheckboxState, getTotalProgress } from './progress.js';
import { initSearch } from './search.js';

// ── Constants ────────────────────────────────────────────────────
const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

let contentIndex = null;

// ── Bootstrap ────────────────────────────────────────────────────

async function init() {
  // 1. Theme
  initTheme();

  // 2. Markdown renderer
  initMarkdown();

  // 3. Progress tracking
  initProgress();

  // 4. Fetch content index
  try {
    const res = await fetch(`${BASE_PATH}/content-index.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    contentIndex = await res.json();
  } catch (err) {
    console.error('Failed to load content index:', err);
    showFatalError();
    return;
  }

  // 5. Sidebar navigation
  initSidebar(contentIndex, navigateTo);
  refreshProgress();

  // 6. Search
  initSearch(contentIndex, BASE_PATH);

  // 7. Theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleTheme();
      // Update mermaid diagrams with new theme if any exist
      renderMermaidDiagrams();
    });
  }

  // 8. Event delegation for content interactions
  setupContentDelegation();

  // 9. Start router (triggers initial navigation)
  initRouter(handleNavigation);
}

// ── Navigation Handler ───────────────────────────────────────────

async function handleNavigation(path) {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;

  // Show loading skeleton
  contentEl.innerHTML = loadingSkeleton();

  try {
    const url = `${BASE_PATH}/content/${path}`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 404) {
        contentEl.innerHTML = renderUpdatingNotice(path);
      } else {
        contentEl.innerHTML = render404();
      }
      postRender(path);
      return;
    }

    const mdContent = await res.text();

    // Home page has special rendering
    if (path === 'README.md') {
      contentEl.innerHTML = renderHomePage(mdContent, contentIndex);
    } else {
      contentEl.innerHTML = renderMarkdown(mdContent, path);
    }

    // Post-render hooks
    postRender(path);

  } catch (err) {
    console.error('Navigation error:', err);
    contentEl.innerHTML = render404();
    postRender(path);
  }
}

/**
 * Post-render tasks: sidebar, breadcrumb, checkboxes, mermaid, scroll, progress.
 */
function postRender(path) {
  // Highlight active sidebar item
  setActiveItem(path);

  // Update breadcrumb
  updateBreadcrumb(path);

  // Restore checkbox states
  restoreCheckboxes(path);

  // Render mermaid diagrams
  renderMermaidDiagrams();

  // Scroll to top (or to hash anchor)
  const hash = window.location.hash;
  const anchorMatch = hash.match(/#.*#(.+)$/);
  if (anchorMatch) {
    const el = document.getElementById(anchorMatch[1]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ── Home Page ────────────────────────────────────────────────────

function renderHomePage(mdContent, index) {
  const renderedMd = renderMarkdown(mdContent, 'README.md');

  // Build section cards
  let sectionCards = '';
  if (index.sections) {
    sectionCards = index.sections.map(section => {
      const fileCount = countSectionFiles(section);
      const href = section.files && section.files.length > 0
        ? '#/' + section.files[0].path.replace(/\.md$/, '')
        : '#/';
      return (
        `<a class="section-card" href="${href}">` +
          `<div class="section-card-icon">${section.icon || '📁'}</div>` +
          `<div class="section-card-title">${section.title}</div>` +
          `<div class="section-card-count">${fileCount} bài viết</div>` +
        `</a>`
      );
    }).join('');
  }

  // Build timeline (career progression)
  const timelineLevels = [
    { icon: '🌱', title: 'Intern', duration: '0-3 tháng', desc: 'Học cơ bản Unity, C# và workflow' },
    { icon: '🌿', title: 'Fresher', duration: '3-6 tháng', desc: 'Nắm vững core systems và patterns' },
    { icon: '🌳', title: 'Junior', duration: '6-12 tháng', desc: 'Xây dựng dự án hoàn chỉnh' },
    { icon: '🌲', title: 'Mid-Level', duration: '1-2 năm', desc: 'Architecture và optimization' },
    { icon: '🏔️', title: 'Senior', duration: '2+ năm', desc: 'Hệ thống phức tạp và mentoring' },
  ];

  const timeline = timelineLevels.map(level => (
    `<div class="timeline-item">` +
      `<div class="timeline-icon">${level.icon}</div>` +
      `<div class="timeline-content">` +
        `<div class="timeline-title">${level.title}</div>` +
        `<div class="timeline-duration">${level.duration}</div>` +
        `<div class="timeline-desc">${level.desc}</div>` +
      `</div>` +
    `</div>`
  )).join('');

  return (
    `<div class="home-hero">` +
      `<h1 class="home-title">🎮 Lộ Trình Unity Developer</h1>` +
      `<p class="home-subtitle">Từ Intern đến Senior — Tài liệu toàn diện bằng Tiếng Việt</p>` +
      `<div class="home-roadmap">` +
        `<div class="home-progress-summary">` +
          `<span class="home-progress-label">Tiến độ tổng thể</span>` +
          `<span class="home-progress-value" id="home-progress-value">${getProgressText()}</span>` +
        `</div>` +
      `</div>` +
    `</div>` +
    `<div class="home-sections">` +
      `<h2 class="home-sections-title">📚 Các Phần Chính</h2>` +
      `<div class="home-sections-grid">${sectionCards}</div>` +
    `</div>` +
    `<div class="home-timeline">` +
      `<h2>⏱️ Timeline Tham Khảo</h2>` +
      `<div class="timeline-container">${timeline}</div>` +
    `</div>` +
    `<div class="home-content">${renderedMd}</div>`
  );
}

// ── Breadcrumb ───────────────────────────────────────────────────

function updateBreadcrumb(path) {
  const breadcrumb = document.getElementById('breadcrumb');
  if (!breadcrumb) return;

  if (path === 'README.md') {
    breadcrumb.innerHTML = `<span class="breadcrumb-current">🏠 Trang chủ</span>`;
    return;
  }

  const parts = path.replace(/\.md$/, '').split('/');

  // Find section info
  let sectionTitle = parts[0];
  let fileTitle = parts[parts.length - 1];

  if (contentIndex && contentIndex.sections) {
    for (const section of contentIndex.sections) {
      // Check if this section matches the first path segment
      if (section.files) {
        for (const f of section.files) {
          if (f.path === path) {
            sectionTitle = section.title;
            fileTitle = f.title;
          }
        }
      }
      if (section.subsections) {
        for (const sub of section.subsections) {
          if (sub.files) {
            for (const f of sub.files) {
              if (f.path === path) {
                sectionTitle = section.title;
                fileTitle = f.title;
              }
            }
          }
        }
      }
    }
  }

  // Find section README path for the link
  const sectionDir = parts[0];
  const sectionReadme = `${sectionDir}/README`;

  let html = `<a href="#/" class="breadcrumb-link">🏠 Trang chủ</a>`;
  html += `<span class="breadcrumb-sep">/</span>`;

  if (parts.length > 1) {
    html += `<a href="#/${sectionReadme}" class="breadcrumb-link">${escapeHtml(sectionTitle)}</a>`;
    html += `<span class="breadcrumb-sep">/</span>`;
    html += `<span class="breadcrumb-current">${escapeHtml(fileTitle)}</span>`;
  } else {
    html += `<span class="breadcrumb-current">${escapeHtml(sectionTitle)}</span>`;
  }

  breadcrumb.innerHTML = html;
}

// ── Checkbox Handling ────────────────────────────────────────────

function restoreCheckboxes(filePath) {
  const checkboxItems = document.querySelectorAll('.checkbox-item');
  checkboxItems.forEach(item => {
    const index = parseInt(item.dataset.checkboxIndex, 10);
    if (isNaN(index)) return;

    const isChecked = getCheckboxState(filePath, index);
    const input = item.querySelector('input[type="checkbox"]');

    if (isChecked) {
      item.classList.add('checked');
      if (input) input.checked = true;
    } else {
      item.classList.remove('checked');
      if (input) input.checked = false;
    }
  });
}

function setupContentDelegation() {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;

  contentEl.addEventListener('click', (e) => {
    // ── Checkbox clicks ──
    const checkboxItem = e.target.closest('.checkbox-item');
    if (checkboxItem) {
      e.preventDefault();
      const index = parseInt(checkboxItem.dataset.checkboxIndex, 10);
      if (isNaN(index)) return;

      const filePath = getCurrentPath();
      const currentState = getCheckboxState(filePath, index);
      const newState = !currentState;

      setCheckboxState(filePath, index, newState);
      checkboxItem.classList.toggle('checked', newState);

      const input = checkboxItem.querySelector('input[type="checkbox"]');
      if (input) input.checked = newState;

      refreshProgress();
      return;
    }

    // ── Code copy button ──
    const copyBtn = e.target.closest('.code-copy');
    if (copyBtn) {
      e.preventDefault();
      const encodedCode = copyBtn.dataset.code;
      const code = decodeURIComponent(encodedCode || '');

      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Đã sao chép!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Sao chép';
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback: textarea copy
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          copyBtn.textContent = 'Đã sao chép!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Sao chép';
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch (_) { /* ignore */ }
        document.body.removeChild(ta);
      });
      return;
    }
  });
}

// ── Progress Display ─────────────────────────────────────────────

function refreshProgress() {
  if (!contentIndex) return;
  const progress = getTotalProgress(contentIndex);
  updateSidebarProgress(progress);

  // Also update home page progress if visible
  const homeProgress = document.getElementById('home-progress-value');
  if (homeProgress) {
    homeProgress.textContent = getProgressText();
  }
}

function getProgressText() {
  if (!contentIndex) return '0%';
  const p = getTotalProgress(contentIndex);
  return `${p.totalChecked}/${p.totalCheckboxes} (${p.percentage}%)`;
}

// ── Loading & Error States ───────────────────────────────────────

function loadingSkeleton() {
  return (
    `<div class="loading-skeleton">` +
      `<div class="loading-line" style="width:60%"></div>` +
      `<div class="loading-line" style="width:90%"></div>` +
      `<div class="loading-line" style="width:75%"></div>` +
      `<div class="loading-line" style="width:85%"></div>` +
      `<div class="loading-line" style="width:40%"></div>` +
    `</div>`
  );
}

function renderUpdatingNotice(path) {
  return (
    `<div class="updating-notice">` +
      `<div class="updating-dot"></div>` +
      `<h2>📝 Nội dung đang được cập nhật</h2>` +
      `<p>Phần <strong>${escapeHtml(path)}</strong> đang được viết và sẽ sớm được cập nhật. Vui lòng quay lại sau!</p>` +
      `<a href="#/">← Về trang chủ</a>` +
    `</div>`
  );
}

function render404() {
  return (
    `<div class="updating-notice">` +
      `<h2>🔍 Không tìm thấy trang</h2>` +
      `<p>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>` +
      `<a href="#/">← Về trang chủ</a>` +
    `</div>`
  );
}

function showFatalError() {
  const contentEl = document.getElementById('content');
  if (contentEl) {
    contentEl.innerHTML = (
      `<div class="updating-notice">` +
        `<h2>⚠️ Lỗi tải dữ liệu</h2>` +
        `<p>Không thể tải chỉ mục nội dung. Vui lòng thử tải lại trang.</p>` +
        `<button onclick="location.reload()">Tải lại</button>` +
      `</div>`
    );
  }
}

// ── Utility ──────────────────────────────────────────────────────

function countSectionFiles(section) {
  let count = section.files ? section.files.length : 0;
  if (section.subsections) {
    for (const sub of section.subsections) {
      count += sub.files ? sub.files.length : 0;
    }
  }
  return count;
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

// ── Start Application ────────────────────────────────────────────
init();
