// sidebar.js — Sidebar navigation, mobile toggle, and progress display
// Exports: initSidebar(contentIndex, onNavigate), setActiveItem(path), updateSidebarProgress(progressData)

/**
 * Build and initialize the sidebar navigation from the content index.
 * @param {object} contentIndex - The parsed content-index.json
 * @param {(path: string) => void} onNavigate - Navigation callback (unused directly, routing handled by hash links)
 */
export function initSidebar(contentIndex, onNavigate) {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  // ── Build navigation HTML ────────────────────────────────────
  let html = '';

  for (const section of contentIndex.sections) {
    const totalFiles = countSectionFiles(section);
    html += `<div class="nav-section">`;
    html += `<button class="nav-section-header" data-section-id="${section.id}">`;
    html += `<span class="nav-section-icon">${section.icon || '📁'}</span>`;
    html += `<span class="nav-section-title">${section.title}</span>`;
    html += `<span class="nav-section-badge">${totalFiles}</span>`;
    html += `<span class="nav-section-arrow">›</span>`;
    html += `</button>`;
    html += `<div class="nav-section-items">`;

    // Direct files
    if (section.files && section.files.length > 0) {
      for (const file of section.files) {
        html += buildNavItem(file);
      }
    }

    // Subsections
    if (section.subsections && section.subsections.length > 0) {
      for (const sub of section.subsections) {
        html += `<div class="nav-subsection">`;
        html += `<div class="nav-subsection-header">`;
        html += `<span class="nav-section-icon">${sub.icon || '📂'}</span>`;
        html += `<span>${sub.title}</span>`;
        html += `</div>`;

        if (sub.files && sub.files.length > 0) {
          for (const file of sub.files) {
            html += buildNavItem(file);
          }
        }

        html += `</div>`; // .nav-subsection
      }
    }

    html += `</div>`; // .nav-section-items
    html += `</div>`; // .nav-section
  }

  // ── Append Book Library Section ──────────────────────────────────
  if (contentIndex.books) {
    const totalBooks = Object.values(contentIndex.books).reduce((acc, cat) => acc + cat.length, 0);
    html += `<div class="nav-section">`;
    html += `<button class="nav-section-header" data-section-id="books">`;
    html += `<span class="nav-section-icon">📚</span>`;
    html += `<span class="nav-section-title">Tủ Sách Lập Trình</span>`;
    html += `<span class="nav-section-badge">${totalBooks}</span>`;
    html += `<span class="nav-section-arrow">›</span>`;
    html += `</button>`;
    html += `<div class="nav-section-items">`;
    
    html += `<a class="nav-item" href="#/book/library" data-path="book/library.md">`;
    html += `<span class="nav-item-icon">🏛️</span>`;
    html += `<span class="nav-item-title">Xem Tất Cả Sách</span>`;
    html += `</a>`;
    
    const catTitles = {
      'Core': 'Nền tảng C# / .NET',
      'GameDesigner': 'Thiết Kế Game',
      'Levelup': 'Nâng Cao Kỹ Năng',
      'Multiplay': 'Game Nhiều Người Chơi',
      'Optimize': 'Tối Ưu Hóa Game'
    };
    
    for (const catName of Object.keys(contentIndex.books)) {
      const catBooks = contentIndex.books[catName];
      if (catBooks.length === 0) continue;
      const displayTitle = catTitles[catName] || catName;
      
      html += `<a class="nav-item" href="#/book/category/${catName}" data-path="book/category/${catName}.md" style="padding-left: 24px;">`;
      html += `<span class="nav-item-icon">📁</span>`;
      html += `<span class="nav-item-title">${displayTitle}</span>`;
      html += `</a>`;
    }
    
    html += `</div>`; // .nav-section-items
    html += `</div>`; // .nav-section
  }

  sidebarNav.innerHTML = html;

  // ── Section header toggle ────────────────────────────────────
  sidebarNav.addEventListener('click', (e) => {
    const header = e.target.closest('.nav-section-header');
    if (header) {
      const section = header.closest('.nav-section');
      if (section) {
        section.classList.toggle('expanded');
      }
    }
  });

  // ── Mobile sidebar controls ──────────────────────────────────
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', openSidebar);
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on nav item click (mobile)
  sidebarNav.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem && window.innerWidth < 1024) {
      closeSidebar();
    }
  });
}

/**
 * Set the active navigation item and expand its parent section.
 * @param {string} path - The current .md file path
 */
export function setActiveItem(path) {
  // Remove active from all items
  const allItems = document.querySelectorAll('.nav-item');
  allItems.forEach(item => item.classList.remove('active'));

  // Find and activate the matching item
  const activeItem = document.querySelector(`.nav-item[data-path="${path}"]`);
  if (activeItem) {
    activeItem.classList.add('active');

    // Expand the parent section if collapsed
    const parentSection = activeItem.closest('.nav-section');
    if (parentSection && !parentSection.classList.contains('expanded')) {
      parentSection.classList.add('expanded');
    }

    // Scroll into view within the sidebar
    activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/**
 * Update the progress bar in the sidebar.
 * @param {{ totalChecked: number, totalCheckboxes: number, percentage: number }} progressData
 */
export function updateSidebarProgress(progressData) {
  const progressBar = document.getElementById('total-progress');
  const progressText = document.getElementById('progress-text');

  if (progressBar) {
    progressBar.style.width = `${progressData.percentage}%`;
  }

  if (progressText) {
    progressText.textContent = `${progressData.percentage}%`;
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function buildNavItem(file) {
  const href = '#/' + file.path.replace(/\.md$/, '');
  const icon = getFileIcon(file.title);
  const title = file.title || file.id;
  return (
    `<a class="nav-item" href="${href}" data-path="${file.path}">` +
      `<span class="nav-item-icon">${icon}</span>` +
      `<span class="nav-item-title">${title}</span>` +
    `</a>`
  );
}

function getFileIcon(title) {
  // If the title already starts with an emoji, use it
  if (title && /^[\u{1F000}-\u{1FFFF}|\u{2600}-\u{27BF}|\u{FE00}-\u{FEFF}]/u.test(title)) {
    return '';
  }
  return '📄';
}

function countSectionFiles(section) {
  let count = section.files ? section.files.length : 0;
  if (section.subsections) {
    for (const sub of section.subsections) {
      count += sub.files ? sub.files.length : 0;
    }
  }
  return count;
}
