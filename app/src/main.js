// main.js — Entry point: wires all modules together
// Imports all modules and orchestrates the application lifecycle

import './styles/index.css';
import { initTheme, toggleTheme } from './theme.js';
import { initRouter, navigateTo, getCurrentPath } from './router.js';
import { initMarkdown, renderMarkdown, renderMermaidDiagrams } from './markdown.js';
import { initSidebar, setActiveItem, updateSidebarProgress } from './sidebar.js';
import { initProgress, getCheckboxState, setCheckboxState, getTotalProgress, getBookProgress, setBookProgress, clearBookProgress } from './progress.js';
import { initSearch } from './search.js';
import { initSkillTree } from './skilltree.js';
import { initTOC } from './toc.js';

// ── Constants ────────────────────────────────────────────────────
const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

let contentIndex = null;
let unityDocsMap = null;

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

  // 4.1 Fetch Unity Docs Map
  try {
    const res = await fetch(`${BASE_PATH}/unity-docs-map.json`);
    if (res.ok) {
      unityDocsMap = await res.json();
      window.unityDocsMap = unityDocsMap;
    }
  } catch (err) {
    console.warn('Failed to load unity-docs-map.json:', err);
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
  // Remove reader-active by default
  document.body.classList.remove('reader-active');

  const contentEl = document.getElementById('content');
  if (!contentEl) return;

  // Intercept Book Library routing
  if (path.startsWith('book/')) {
    handleBookNavigation(path);
    return;
  }

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
      setTimeout(() => {
        initHomeProfile();
        initSkillTree(contentIndex);
      }, 0);
    } else if (isRoadmapLevelReadme(path)) {
      contentEl.innerHTML = renderLevelPage(mdContent, path, contentIndex);
    } else if (path === '08-Knowledge-Base/README.md') {
      contentEl.innerHTML = renderKnowledgeBaseHome(contentIndex);
    } else {
      let html = renderMarkdown(mdContent, path);
      const filename = path.split('/').pop();
      const pageId = filename.replace(/\.md$/i, '');
      if (unityDocsMap && unityDocsMap[pageId]) {
        const cardHtml = renderUnityDocsCard(pageId, unityDocsMap[pageId]);
        // Insert cardHtml right after the h1 tag if present, or at the very top
        const h1Match = html.match(/(<h1[^>]*>.*?<\/h1>)/i);
        if (h1Match) {
          const h1Tag = h1Match[1];
          html = html.replace(h1Tag, `${h1Tag}\n${cardHtml}`);
        } else {
          html = cardHtml + html;
        }
      }
      contentEl.innerHTML = html;
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

  // Render Table of Contents
  initTOC(path);

  // Render mermaid diagrams
  renderMermaidDiagrams();

  // Set up Unity Docs card events if present
  setupUnityDocsCardEvents(path);

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
  const profile = getPlayerProfile();
  const progress = getTotalProgress(index);
  const boardLevels = getBoardLevels(index);
  const supportSections = getSupportSections(index);
  const currentLevel = getCurrentLevel(progress.percentage);

  const levelCards = boardLevels.map((level, idx) => {
    const stepNumber = String(idx + 1).padStart(2, '0');
    const filesText = `${countSectionFiles(level.section)} nhiệm vụ`;
    return (
      `<a class="board-level level-${idx + 1}" href="${level.href}">` +
        `<span class="level-step">${stepNumber}</span>` +
        `<span class="level-icon">${level.icon}</span>` +
        `<span class="level-name">${escapeHtml(level.title)}</span>` +
        `<span class="level-desc">${escapeHtml(level.desc)}</span>` +
        `<span class="level-meta">${filesText}</span>` +
      `</a>`
    );
  }).join('');

  const supportCards = supportSections.map(section => {
    const href = section.files && section.files.length > 0
      ? '#/' + section.files[0].path.replace(/\.md$/, '')
      : '#/';
    return (
      `<a class="support-card" href="${href}">` +
        `<span class="support-icon">${section.icon || '📁'}</span>` +
        `<span class="support-title">${escapeHtml(section.title)}</span>` +
        `<span class="support-meta">${countSectionFiles(section)} bài</span>` +
      `</a>`
    );
  }).join('');

  return (
    `<section class="game-home-shell">` +
      `<div class="game-hero">` +
        `<div class="hero-copy">` +
          `<span class="hero-kicker">Unity Developer Roadmap</span>` +
          `<h1 class="game-title">Bản đồ thăng cấp Unity Developer</h1>` +
          `<p class="game-subtitle">Chọn nhân vật, đặt tên, đi từng level và mở khóa kiến thức theo lộ trình rõ ràng từ nền tảng đến portfolio.</p>` +
          `<div class="hero-actions">` +
            `<a href="#/01-Intern/README" class="primary-quest-btn">Bắt đầu Level 1</a>` +
            `<a href="#/00-Overview/self-assessment" class="secondary-quest-btn">Tự đánh giá</a>` +
          `</div>` +
        `</div>` +
        `<form class="player-card" id="player-profile-form">` +
          `<div class="player-card-top">` +
            `<span class="player-rank">Người chơi</span>` +
            `<span class="player-progress" id="home-progress-value">${getProgressText()}</span>` +
          `</div>` +
          `<div class="avatar-picker" role="radiogroup" aria-label="Chọn nhân vật">` +
            `${renderAvatarOptions(profile.avatar)}` +
          `</div>` +
          `<label class="player-name-field">` +
            `<span>Tên nhân vật</span>` +
            `<input id="player-name-input" name="playerName" maxlength="28" value="${escapeHtml(profile.name)}" placeholder="Nhập tên của bạn">` +
          `</label>` +
          `<button class="save-player-btn" type="submit">Lưu nhân vật</button>` +
          `<p class="player-save-note" id="player-save-note">Đang ở ${currentLevel}</p>` +
        `</form>` +
      `</div>` +
      `<div class="board-stage">` +
        `<div class="board-grid"></div>` +
        `<div class="board-path" aria-label="Lộ trình level">${levelCards}</div>` +
      `</div>` +
      `<section class="quest-panel">` +
        `<div>` +
          `<span class="panel-kicker">Nhiệm vụ phụ</span>` +
          `<h2>Kho kiến thức, indie track và phỏng vấn</h2>` +
        `</div>` +
        `<div class="support-grid">${supportCards}</div>` +
      `</section>` +
      `<section class="visual-rules">` +
        `<div class="rule-card"><strong>Đi theo level</strong><span>Mỗi level gom README, skills, projects, checklist và resources thành một chặng học có mục tiêu.</span></div>` +
        `<div class="rule-card"><strong>Đánh dấu hoàn thành</strong><span>Checklist trong bài học vẫn lưu tiến độ riêng bằng localStorage.</span></div>` +
        `<div class="rule-card"><strong>Sơ đồ trực quan</strong><span>Các diagram trong markdown được render thành khối tương tác thay vì giữ dạng text khô.</span></div>` +
      `</section>` +
    `</section>`
  );
}

function initHomeProfile() {
  const form = document.getElementById('player-profile-form');
  if (!form) return;

  const note = document.getElementById('player-save-note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('player-name-input');
    const avatarInput = form.querySelector('input[name="avatar"]:checked');
    const profile = {
      name: (nameInput?.value || 'Unity Learner').trim() || 'Unity Learner',
      avatar: avatarInput?.value || 'knight',
    };

    localStorage.setItem('unity-roadmap-player', JSON.stringify(profile));
    if (note) {
      note.textContent = `Đã lưu ${profile.name}`;
      note.classList.add('saved');
      setTimeout(() => note.classList.remove('saved'), 1200);
    }
  });
}

function getPlayerProfile() {
  try {
    const saved = localStorage.getItem('unity-roadmap-player');
    if (saved) {
      return { name: 'Unity Learner', avatar: 'knight', ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load player profile:', e);
  }
  return { name: 'Unity Learner', avatar: 'knight' };
}

function renderAvatarOptions(selectedAvatar) {
  const avatars = [
    { id: 'knight', label: 'Hiệp sĩ', icon: '🛡️' },
    { id: 'mage', label: 'Pháp sư', icon: '✨' },
    { id: 'ranger', label: 'Xạ thủ', icon: '🏹' },
    { id: 'builder', label: 'Builder', icon: '🧰' },
  ];

  return avatars.map(avatar => {
    const checked = avatar.id === selectedAvatar ? ' checked' : '';
    return (
      `<label class="avatar-option" title="${avatar.label}">` +
        `<input type="radio" name="avatar" value="${avatar.id}"${checked}>` +
        `<span>${avatar.icon}</span>` +
      `</label>`
    );
  }).join('');
}

function getBoardLevels(index) {
  const levelMeta = {
    '01-Intern': 'Làm quen Unity Editor, C# cơ bản, GameObject và MonoBehaviour.',
    '02-Junior': 'Xây hệ thống gameplay nhỏ, UI, physics và vòng lặp hoàn chỉnh.',
    '03-Mid-Level': 'Thiết kế module, tối ưu hiệu năng và quản lý dự án lớn hơn.',
    '04-Senior': 'Kiến trúc hệ thống, mentoring, profiling sâu và quyết định kỹ thuật.',
  };

  return (index.sections || [])
    .filter(section => levelMeta[section.id])
    .map(section => ({
      section,
      title: section.title.replace(/^Level\s+\d+:\s*/i, ''),
      icon: section.icon || '🎮',
      desc: levelMeta[section.id],
      href: section.files && section.files.length > 0
        ? '#/' + section.files[0].path.replace(/\.md$/, '')
        : '#/',
    }));
}

function getSupportSections(index) {
  const supportIds = new Set([
    '00-Overview',
    '05-Technical-Deep-Dives',
    '06-Indie-Track',
    '07-Interview-and-Portfolio',
    '08-Knowledge-Base',
  ]);

  return (index.sections || []).filter(section => supportIds.has(section.id));
}

function getCurrentLevel(percentage) {
  if (percentage >= 75) return 'Level 4: Senior';
  if (percentage >= 50) return 'Level 3: Mid-Level';
  if (percentage >= 25) return 'Level 2: Junior';
  return 'Level 1: Intern';
}

function isRoadmapLevelReadme(path) {
  return /^0[1-4]-[^/]+\/README\.md$/.test(path);
}

function renderLevelPage(mdContent, path, index) {
  const renderedMd = renderMarkdown(mdContent, path);
  const sectionId = path.split('/')[0];
  const section = (index.sections || []).find(item => item.id === sectionId);

  if (!section) return renderedMd;

  const tabs = [
    { id: 'README', label: 'Tổng quan', desc: 'Bức tranh level, mục tiêu và phạm vi cần nắm.' },
    { id: 'skills', label: 'Kỹ năng', desc: 'Kiến thức cốt lõi cần hiểu thật chắc.' },
    { id: 'projects', label: 'Dự án', desc: 'Bài thực hành để biến kiến thức thành sản phẩm.' },
    { id: 'checklist', label: 'Checklist', desc: 'Tự đánh giá và lưu tiến độ hoàn thành.' },
    { id: 'resources', label: 'Tài nguyên', desc: 'Link học thêm, sách, video và tài liệu hỗ trợ.' },
  ];

  const fileMap = new Map((section.files || []).map(file => [file.id, file]));
  const quickLinks = tabs
    .filter(tab => fileMap.has(tab.id))
    .map(tab => {
      const file = fileMap.get(tab.id);
      const activeClass = file.path === path ? ' active' : '';
      return (
        `<a class="level-tab${activeClass}" href="#/${file.path.replace(/\.md$/, '')}">` +
          `<span>${tab.label}</span>` +
          `<small>${tab.desc}</small>` +
        `</a>`
      );
    })
    .join('');

  return (
    `<section class="level-hub">` +
      `<div class="level-hub-header">` +
        `<span class="level-hub-kicker">Roadmap level</span>` +
        `<h1>${escapeHtml(section.title)}</h1>` +
        `<p>Tất cả nội dung của level này được gom vào một cửa vào duy nhất. Dùng các tab bên dưới để nhảy nhanh tới checklist, dự án, kỹ năng và tài nguyên.</p>` +
      `</div>` +
      `<nav class="level-tabs" aria-label="Nội dung trong level">${quickLinks}</nav>` +
    `</section>` +
    `<div class="level-content">${renderedMd}</div>`
  );
}

function renderKnowledgeBaseHome(index) {
  const section = (index.sections || []).find(item => item.id === '08-Knowledge-Base');
  const groups = section?.subsections || [];
  const featuredIds = new Set([
    'gameobject-component',
    'monobehaviour-lifecycle',
    'transform',
    'scriptableobject',
    'object-pooling',
    'addressables',
    'memory-model',
    'rendering-pipeline-internals',
  ]);

  const groupCards = groups.map(group => {
    const topics = group.files || [];
    const sample = topics.slice(0, 5).map(file => (
      `<a href="#/${file.path.replace(/\.md$/, '')}">${escapeHtml(cleanTitle(file.title))}</a>`
    )).join('');

    return (
      `<section class="kb-group-card">` +
        `<div class="kb-group-heading">` +
          `<span>${group.icon || '📚'}</span>` +
          `<div><h2>${escapeHtml(group.title)}</h2><p>${topics.length} chủ đề chi tiết</p></div>` +
        `</div>` +
        `<div class="kb-topic-list">${sample}</div>` +
      `</section>`
    );
  }).join('');

  const featured = groups
    .flatMap(group => group.files || [])
    .filter(file => featuredIds.has(file.id))
    .map(file => (
      `<a class="kb-feature-card" href="#/${file.path.replace(/\.md$/, '')}">` +
        `<span class="kb-feature-label">Concept</span>` +
        `<strong>${escapeHtml(cleanTitle(file.title))}</strong>` +
        `<span>Giải thích bản chất, cách Unity vận hành bên trong, ví dụ code, lỗi hay gặp và best practices.</span>` +
      `</a>`
    ))
    .join('');

  return (
    `<section class="kb-docs-home">` +
      `<div class="kb-hero">` +
        `<span class="kb-kicker">Unity Knowledge Base</span>` +
        `<h1>Tài liệu Unity tiếng Việt, giải thích tới gốc</h1>` +
        `<p>Thiết kế theo tinh thần docs Unity: dễ quét, dễ tra cứu, chia theo cấp độ. Khác ở chỗ mỗi bài vẫn đào sâu như roadmap hiện tại: bản chất, engine hoạt động thế nào, ví dụ, trade-off và lỗi thường gặp.</p>` +
        `<div class="kb-search-strip">Tìm bằng Ctrl+K hoặc chọn nhóm kiến thức bên dưới</div>` +
      `</div>` +
      `<div class="kb-feature-grid">${featured}</div>` +
      `<div class="kb-groups">${groupCards}</div>` +
    `</section>`
  );
}

function cleanTitle(title) {
  return String(title || '')
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\s]+/u, '')
    .trim();
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

    // ── Virtual Inspector Component Header clicks ──
    const compHeader = e.target.closest('.comp-header');
    if (compHeader) {
      e.preventDefault();
      const comp = compHeader.closest('.inspector-component');
      if (comp) {
        const isExpanded = comp.classList.contains('expanded');
        comp.classList.toggle('expanded', !isExpanded);
        const arrow = compHeader.querySelector('.comp-arrow');
        if (arrow) {
          arrow.textContent = isExpanded ? '▶' : '▼';
        }
      }
      return;
    }

    // ── Lifecycle Step clicks ──
    const step = e.target.closest('.lifecycle-step');
    if (step) {
      e.preventDefault();
      const isActive = step.classList.contains('active');
      
      // Close other steps
      const timeline = step.closest('.lifecycle-timeline');
      if (timeline) {
        const allSteps = timeline.querySelectorAll('.lifecycle-step');
        allSteps.forEach(s => {
          if (s !== step) s.classList.remove('active');
        });
      }
      
      step.classList.toggle('active', !isActive);
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

// ── Book Library Custom Logic ────────────────────────────────────

function getBookGradient(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)',
    'linear-gradient(135deg, #3b82f6, #06b6d4, #10b981)',
    'linear-gradient(135deg, #f59e0b, #eab308, #f43f5e)',
    'linear-gradient(135deg, #14b8a6, #0ea5e9, #6366f1)',
    'linear-gradient(135deg, #ef4444, #f97316, #eab308)',
    'linear-gradient(135deg, #8b5cf6, #ec4899, #f43f5e)',
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

async function handleBookNavigation(path) {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;

  const parts = path.replace(/\.md$/, '').split('/');
  const subRoute = parts[1]; // 'library', 'category', 'read'

  if (subRoute === 'library') {
    contentEl.innerHTML = renderLibraryDashboard();
    postRenderBook(path, 'Tủ Sách Lập Trình');
  } 
  else if (subRoute === 'category') {
    const catName = parts[2];
    contentEl.innerHTML = renderLibraryCategory(catName);
    const catTitles = {
      'Core': 'Nền tảng C# / .NET',
      'GameDesigner': 'Thiết Kế Game',
      'Levelup': 'Nâng Cao Kỹ Năng',
      'Multiplay': 'Game Nhiều Người Chơi',
      'Optimize': 'Tối Ưu Hóa Game'
    };
    const title = catTitles[catName] || catName;
    postRenderBook(path, title);
  } 
  else if (subRoute === 'read') {
    const catName = parts[2];
    const bookId = parts[3];
    
    const catBooks = contentIndex.books ? contentIndex.books[catName] : [];
    const book = catBooks ? catBooks.find(b => b.id === bookId) : null;
    
    if (!book) {
      contentEl.innerHTML = render404();
      postRenderBook(path, 'Không Tìm Thấy Sách');
      return;
    }
    
    document.body.classList.add('reader-active');
    contentEl.innerHTML = renderBookReader(book, catName);
    
    initBookReaderEvents(book.id, book.path);
    postRenderBook(path, book.title);
  } 
  else {
    contentEl.innerHTML = render404();
    postRenderBook(path, '404');
  }
}

function postRenderBook(path, pageTitle) {
  setActiveItem(path);
  updateBookBreadcrumb(path, pageTitle);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function updateBookBreadcrumb(path, pageTitle) {
  const breadcrumb = document.getElementById('breadcrumb');
  if (!breadcrumb) return;

  const parts = path.replace(/\.md$/, '').split('/');
  const subRoute = parts[1];

  let html = `<a href="#/" class="breadcrumb-link">🏠 Trang chủ</a>`;
  html += `<span class="breadcrumb-sep">/</span>`;
  
  if (subRoute === 'library') {
    html += `<span class="breadcrumb-current">📚 Tủ Sách Lập Trình</span>`;
  } else if (subRoute === 'category') {
    html += `<a href="#/book/library" class="breadcrumb-link">📚 Tủ Sách</a>`;
    html += `<span class="breadcrumb-sep">/</span>`;
    html += `<span class="breadcrumb-current">${escapeHtml(pageTitle)}</span>`;
  } else if (subRoute === 'read') {
    const catName = parts[2];
    const catTitles = {
      'Core': 'Nền tảng C# / .NET',
      'GameDesigner': 'Thiết Kế Game',
      'Levelup': 'Nâng Cao Kỹ Năng',
      'Multiplay': 'Game Nhiều Người Chơi',
      'Optimize': 'Tối Ưu Hóa Game'
    };
    const catTitle = catTitles[catName] || catName;
    html += `<a href="#/book/library" class="breadcrumb-link">📚 Tủ Sách</a>`;
    html += `<span class="breadcrumb-sep">/</span>`;
    html += `<a href="#/book/category/${catName}" class="breadcrumb-link">${escapeHtml(catTitle)}</a>`;
    html += `<span class="breadcrumb-sep">/</span>`;
    html += `<span class="breadcrumb-current">${escapeHtml(pageTitle)}</span>`;
  }

  breadcrumb.innerHTML = html;
}

function renderLibraryDashboard() {
  const catTitles = {
    'Core': 'Nền tảng C# / .NET',
    'GameDesigner': 'Thiết Kế Game',
    'Levelup': 'Nâng Cao Kỹ Năng',
    'Multiplay': 'Game Nhiều Người Chơi',
    'Optimize': 'Tối Ưu Hóa Game'
  };

  const catIcons = {
    'Core': '💻',
    'GameDesigner': '🎨',
    'Levelup': '🚀',
    'Multiplay': '🌐',
    'Optimize': '⚡'
  };

  const catDescs = {
    'Core': 'Tài liệu nền tảng về C#, CLR, tối ưu mã nguồn .NET và OOP trong Unity.',
    'GameDesigner': 'Lý thuyết game design, tâm lý học người chơi, thiết kế màn chơi và UX.',
    'Levelup': 'Cấu trúc dữ liệu & giải thuật, design patterns, và kiến trúc hệ thống game nâng cao.',
    'Multiplay': 'Lập trình mạng multiplayer, đồng bộ trạng thái, socket và thiết kế server-client.',
    'Optimize': 'Profiling, quản lý RAM/VRAM, tối ưu hóa CPU/GPU render pipeline trong Unity.'
  };

  let cardsHtml = '';
  if (contentIndex && contentIndex.books) {
    for (const catName of Object.keys(contentIndex.books)) {
      const booksList = contentIndex.books[catName];
      if (booksList.length === 0) continue;
      const displayTitle = catTitles[catName] || catName;
      const icon = catIcons[catName] || '📚';
      const desc = catDescs[catName] || 'Tài liệu hữu ích cho lập trình game Unity.';
      
      let coversStack = '';
      const sampleBooks = booksList.slice(0, 3);
      sampleBooks.forEach((b, idx) => {
        coversStack += `<div class="library-cover-mini cover-stack-${idx + 1}" style="background: ${getBookGradient(b.title)}"></div>`;
      });

      cardsHtml += `
        <a href="#/book/category/${catName}" class="category-card-premium">
          <div class="category-card-glow"></div>
          <div class="category-card-icon">${icon}</div>
          <div class="category-card-info">
            <h3>${escapeHtml(displayTitle)}</h3>
            <p>${escapeHtml(desc)}</p>
            <div class="category-card-meta">
              <span>📂 ${booksList.length} cuốn sách</span>
            </div>
          </div>
          <div class="mini-covers-stack">
            ${coversStack}
          </div>
        </a>
      `;
    }
  }

  return `
    <div class="library-landing">
      <div class="library-hero">
        <h1 class="library-hero-title">📚 Tủ Sách Lập Trình Game</h1>
        <p class="library-hero-subtitle">Kho sách và tài liệu kỹ thuật Unity & Game Development miễn phí dành cho cộng đồng Việt Nam.</p>
      </div>
      <div class="library-grid">
        ${cardsHtml}
      </div>
    </div>
  `;
}

function renderLibraryCategory(catName) {
  const catTitles = {
    'Core': 'Nền tảng C# / .NET',
    'GameDesigner': 'Thiết Kế Game',
    'Levelup': 'Nâng Cao Kỹ Năng',
    'Multiplay': 'Game Nhiều Người Chơi',
    'Optimize': 'Tối Ưu Hóa Game'
  };

  const displayTitle = catTitles[catName] || catName;
  const catBooks = contentIndex.books ? contentIndex.books[catName] : [];

  if (!catBooks || catBooks.length === 0) {
    return `
      <div class="library-landing">
        <div class="library-header-actions" style="margin-bottom: 24px;">
          <a href="#/book/library" class="back-link" style="text-decoration: none; color: var(--accent); font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Quay lại Thư Viện
          </a>
        </div>
        <h2>📂 ${escapeHtml(displayTitle)}</h2>
        <div class="updating-notice">
          <p>Hiện tại chưa có sách nào trong danh mục này.</p>
        </div>
      </div>
    `;
  }

  let booksHtml = '';
  for (const book of catBooks) {
    const progress = getBookProgress(book.id);
    const progressBadge = progress 
      ? `<div class="book-progress-badge">📖 Đang đọc: trang ${progress.page}</div>` 
      : '';
      
    booksHtml += `
      <div class="book-item-card">
        <div class="book-cover-container">
          <div class="book-cover" style="background: ${getBookGradient(book.title)}">
            <div class="book-cover-spine"></div>
            <div class="book-cover-inner">
              <span class="book-cover-logo">🎮</span>
              <h4 class="book-cover-title">${escapeHtml(book.title)}</h4>
              <span class="book-cover-author">Unity Roadmap</span>
            </div>
          </div>
          ${progressBadge}
        </div>
        <div class="book-info">
          <h3>${escapeHtml(book.title)}</h3>
          <div class="book-meta">Dung lượng: ${book.size}</div>
          <div class="book-actions">
            <a href="#/book/read/${catName}/${book.id}" class="book-btn read-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Đọc Sách
            </a>
            <a href="${BASE_PATH}/${book.path}" download class="book-btn download-btn" title="Tải xuống PDF">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Tải Về
            </a>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="library-landing">
      <div class="library-header-actions" style="margin-bottom: 24px;">
        <a href="#/book/library" class="back-link" style="text-decoration: none; color: var(--accent); font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Quay lại Thư Viện
        </a>
      </div>
      <div class="library-section-header">
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-top: 0; margin-bottom: 8px; background: var(--accent-gradient); -webkit-background-clip: text; color: transparent;">📂 ${escapeHtml(displayTitle)}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 32px;">Danh sách tài liệu và sách hướng dẫn chuyên môn.</p>
      </div>
      <div class="books-grid">
        ${booksHtml}
      </div>
    </div>
  `;
}

function renderBookReader(book, catName) {
  const progress = getBookProgress(book.id);
  const savedPage = progress ? progress.page : 1;

  return `
    <div class="book-reader-view">
      <div class="reader-control-panel">
        <a href="#/book/category/${catName}" class="reader-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Trở Lại
        </a>
        <div class="reader-title-container">
          <span class="reader-book-icon">📖</span>
          <span class="reader-book-title">${escapeHtml(book.title)}</span>
        </div>
        <div class="reader-progress-controls">
          <label for="reader-page-input">Trang:</label>
          <input type="number" id="reader-page-input" min="1" value="${savedPage}">
          <button id="reader-save-btn" class="reader-btn-primary">Lưu vị trí</button>
          <button id="reader-reset-btn" class="reader-btn-secondary">Reset</button>
        </div>
        <a href="${BASE_PATH}/${book.path}" download class="reader-download-btn" title="Tải PDF về máy">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Tải File
        </a>
      </div>
      <div class="reader-iframe-container">
        <iframe id="reader-iframe" src="${BASE_PATH}/${book.path}#page=${savedPage}"></iframe>
      </div>
    </div>
  `;
}

function initBookReaderEvents(bookId, bookPath) {
  const pageInput = document.getElementById('reader-page-input');
  const saveBtn = document.getElementById('reader-save-btn');
  const resetBtn = document.getElementById('reader-reset-btn');
  const iframe = document.getElementById('reader-iframe');
  
  if (!pageInput || !saveBtn || !resetBtn || !iframe) return;
  
  saveBtn.addEventListener('click', () => {
    const pageVal = parseInt(pageInput.value, 10);
    if (isNaN(pageVal) || pageVal < 1) {
      alert('Vui lòng nhập số trang hợp lệ (lớn hơn 0).');
      return;
    }
    setBookProgress(bookId, pageVal);
    iframe.src = `${BASE_PATH}/${bookPath}#page=${pageVal}`;
    showToast(`Đã lưu vị trí: Trang ${pageVal}`);
  });
  
  resetBtn.addEventListener('click', () => {
    pageInput.value = 1;
    clearBookProgress(bookId);
    iframe.src = `${BASE_PATH}/${bookPath}#page=1`;
    showToast('Đã reset tiến trình đọc (về trang 1).');
  });
}

function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'app-toast show';
  
  setTimeout(() => {
    toast.className = 'app-toast';
  }, 3000);
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

// ── Unity Docs Card Helpers ──────────────────────────────────────

function renderUnityDocsCard(pageId, data) {
  const manuals = (data.manual || []).map(item => {
    const searchUrl = `https://docs.unity3d.com/Manual/${encodeURIComponent(item.replace(/\s+/g, ''))}.html`;
    return `<li><a href="${searchUrl}" target="_blank" rel="noopener noreferrer">📖 Unity Manual: ${item}</a></li>`;
  }).join('');

  const apis = (data.api || []).map(item => {
    const searchUrl = `https://docs.unity3d.com/ScriptReference/${encodeURIComponent(item.replace(/\s+/g, ''))}.html`;
    return `<li><a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="api-code-link"><code>${item}</code></a></li>`;
  }).join('');

  const practices = (data.practice || []).map((item, idx) => {
    const checkKey = `practice-${pageId}-${idx}`;
    return `
      <div class="practice-check-item">
        <label class="checkbox-container">
          <input type="checkbox" id="${checkKey}" data-practice-key="${checkKey}">
          <span class="checkmark"></span>
          <span class="practice-text">${escapeHtml(item)}</span>
        </label>
      </div>
    `;
  }).join('');

  const checklists = (data.checklist || []).map(item => `<li>💡 ${escapeHtml(item)}</li>`).join('');

  return `
    <div class="unity-docs-learning-card" id="unity-docs-card-${pageId}">
      <div class="card-badge">
        <span class="badge-level">${data.level}</span>
        <span class="badge-topic">OFFICIAL DOCS PATHWAY</span>
      </div>
      <h3 class="card-heading">🎯 BẢN ĐỒ HỌC UNITY DOCS</h3>
      
      <div class="card-tabs">
        <button class="card-tab-btn active" data-tab="docs">📖 Tài Liệu Cần Đọc</button>
        <button class="card-tab-btn" data-tab="checklist">💡 Cần Hiểu Đúng</button>
        <button class="card-tab-btn" data-tab="practice">🏆 Thử Thách Thực Hành</button>
      </div>
      
      <div class="card-tab-content active" data-tab-content="docs">
        <div class="docs-section">
          <h4>📚 Tài liệu chính chủ:</h4>
          <ul>${manuals}</ul>
        </div>
        <div class="docs-section" style="margin-top: 15px;">
          <h4>💻 Scripting API cần biết:</h4>
          <ul>${apis}</ul>
        </div>
      </div>
      
      <div class="card-tab-content" data-tab-content="checklist">
        <div class="checklist-section">
          <h4>⚠️ Ghi nhớ quan trọng để tránh Bug:</h4>
          <ul>${checklists}</ul>
        </div>
      </div>
      
      <div class="card-tab-content" data-tab-content="practice">
        <div class="practice-section">
          <h4>🎯 Hoàn thành thử thách sau để vượt qua bài học:</h4>
          <div class="practice-list">${practices}</div>
          <div class="practice-progress-bar">
            <div class="practice-progress-fill" id="practice-progress-fill-${pageId}" style="width: 0%"></div>
          </div>
          <span class="practice-progress-text" id="practice-progress-text-${pageId}">Tiến độ: 0%</span>
        </div>
      </div>
    </div>
  `;
}

function setupUnityDocsCardEvents(path) {
  const filename = path.split('/').pop();
  const pageId = filename.replace(/\.md$/i, '');
  const card = document.getElementById(`unity-docs-card-${pageId}`);
  if (!card) return;

  const tabBtns = card.querySelectorAll('.card-tab-btn');
  const tabContents = card.querySelectorAll('.card-tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      card.querySelector(`.card-tab-content[data-tab-content="${tabName}"]`).classList.add('active');
    });
  });

  const checkboxes = card.querySelectorAll('input[type="checkbox"]');
  
  function updatePracticeProgress() {
    const total = checkboxes.length;
    if (total === 0) return;
    let checkedCount = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) checkedCount++;
    });
    
    const percentage = Math.round((checkedCount / total) * 100);
    const fill = document.getElementById(`practice-progress-fill-${pageId}`);
    const text = document.getElementById(`practice-progress-text-${pageId}`);
    
    if (fill) fill.style.width = `${percentage}%`;
    if (text) text.innerText = `Tiến độ thử thách: ${percentage}% (đã đạt ${checkedCount}/${total})`;
  }

  checkboxes.forEach(cb => {
    const key = cb.dataset.practiceKey;
    const saved = localStorage.getItem(`unity-roadmap-${key}`);
    if (saved === 'true') {
      cb.checked = true;
    }
    
    cb.addEventListener('change', () => {
      localStorage.setItem(`unity-roadmap-${key}`, cb.checked ? 'true' : 'false');
      updatePracticeProgress();
    });
  });

  updatePracticeProgress();
}

// ── Start Application ────────────────────────────────────────────
init();
