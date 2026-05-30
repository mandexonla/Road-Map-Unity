// markdown.js — Markdown rendering with custom extensions
// Exports: initMarkdown(), renderMarkdown(mdContent, filePath), renderMermaidDiagrams()

import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/github-dark.min.css';

hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);

let checkboxIndex = 0;
let currentFilePath = '';

// ASCII art detection characters
const DIAGRAM_CHARS = /[┌┐└┘├┤┬┴┼│─►▼▲◄→←↑↓╔╗╚╝║═╠╣╦╩╬]/;

/**
 * Configure the marked renderer with all custom rendering rules.
 */
export function initMarkdown() {
  const renderer = new marked.Renderer();

  // ── Code blocks ──────────────────────────────────────────────
  renderer.code = function ({ text, lang }) {
    const code = text;
    const language = (lang || '').trim().toLowerCase();

    // Mermaid diagrams
    if (language === 'mermaid') {
      return `<div class="mermaid-container"><pre class="mermaid">${escapeHtml(code)}</pre></div>`;
    }

    // ASCII art diagrams — lines with box-drawing / arrow chars and no language specified
    if ((!language || language === '') && DIAGRAM_CHARS.test(code)) {
      const interactiveHtml = tryRenderInteractiveDiagram(code);
      if (interactiveHtml) {
        return interactiveHtml;
      }
      return `<div class="diagram-block"><pre>${escapeHtml(code)}</pre></div>`;
    }

    // Syntax-highlighted code block
    let highlighted;
    if (language && hljs.getLanguage(language)) {
      try {
        highlighted = hljs.highlight(code, { language }).value;
      } catch (_) {
        highlighted = escapeHtml(code);
      }
    } else {
      highlighted = escapeHtml(code);
    }

    const displayLang = lang || 'text';
    const escapedCode = code.replace(/`/g, '\\`').replace(/\$/g, '\\$');

    return (
      `<div class="code-block-wrapper">` +
        `<div class="code-header">` +
          `<span class="code-lang">${displayLang}</span>` +
          `<button class="code-copy" data-code="${encodeURIComponent(code)}">Sao chép</button>` +
        `</div>` +
        `<pre><code class="hljs">${highlighted}</code></pre>` +
      `</div>`
    );
  };

  // ── Blockquotes → alert boxes ────────────────────────────────
  renderer.blockquote = function ({ raw, text }) {
    // `text` is already the inner rendered HTML
    const inner = (typeof text === 'string' ? text : raw || '').trim();

    // Detect leading emoji
    const emojiMap = [
      { emojis: ['💡'], type: 'tip' },
      { emojis: ['⚠️'], type: 'warning' },
      { emojis: ['🔑', '📌'], type: 'important' },
      { emojis: ['🧪', '🎯'], type: 'important' },
    ];

    let alertType = 'note';
    let icon = '';
    let content = inner;

    for (const { emojis, type } of emojiMap) {
      for (const emoji of emojis) {
        if (inner.includes(emoji)) {
          alertType = type;
          icon = emoji;
          // Strip the emoji from content (it may be inside a <p>)
          content = inner.replace(emoji, '').trim();
          break;
        }
      }
      if (icon) break;
    }

    if (!icon) {
      // Default note icon
      icon = 'ℹ️';
    }

    return (
      `<div class="alert alert-${alertType}">` +
        `<span class="alert-icon">${icon}</span>` +
        `<div class="alert-content">${content}</div>` +
      `</div>`
    );
  };

  // ── List items → checkbox support ────────────────────────────
  renderer.listitem = function ({ text, raw }) {
    const itemText = typeof text === 'string' ? text : (raw || '');

    // Unchecked checkbox
    if (itemText.trimStart().startsWith('[ ]') || itemText.trimStart().startsWith('<input type="checkbox"')) {
      // Handle both raw markdown and pre-parsed checkbox
      let cleanText = itemText
        .replace(/^\s*\[ \]\s*/, '')
        .replace(/<input[^>]*type="checkbox"[^>]*>\s*/i, '');
      const idx = checkboxIndex++;
      return (
        `<li class="checkbox-item" data-checkbox-index="${idx}">` +
          `<input type="checkbox" />` +
          `<span class="checkbox-text">${cleanText}</span>` +
        `</li>`
      );
    }

    // Checked checkbox
    if (itemText.trimStart().startsWith('[x]') || itemText.trimStart().startsWith('[X]') ||
        (itemText.includes('<input') && itemText.includes('checked'))) {
      let cleanText = itemText
        .replace(/^\s*\[[xX]\]\s*/, '')
        .replace(/<input[^>]*type="checkbox"[^>]*checked[^>]*>\s*/i, '');
      const idx = checkboxIndex++;
      return (
        `<li class="checkbox-item checked" data-checkbox-index="${idx}">` +
          `<input type="checkbox" checked />` +
          `<span class="checkbox-text">${cleanText}</span>` +
        `</li>`
      );
    }

    return `<li>${itemText}</li>`;
  };

  // ── Links → SPA routing for .md links ────────────────────────
  renderer.link = function ({ href, title, text }) {
    const linkText = typeof text === 'string' ? text : '';
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';

    if (!href) return `<a${titleAttr}>${linkText}</a>`;

    const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:');
    const isAnchor = href.startsWith('#');

    if (!isExternal && !isAnchor) {
      let relativeHref = href;
      // If it points to a directory (ends with / or has no extension)
      if (relativeHref.endsWith('/')) {
        relativeHref += 'README.md';
      } else {
        const lastSegment = relativeHref.split('/').pop();
        if (!lastSegment.includes('.')) {
          relativeHref += '/README.md';
        }
      }

      if (relativeHref.endsWith('.md')) {
        const resolved = resolveRelativePath(currentFilePath, relativeHref);
        const hashRoute = '#/' + resolved.replace(/\.md$/, '');
        return `<a href="${hashRoute}"${titleAttr}>${linkText}</a>`;
      }
    }

    // External links
    if (isExternal) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener"${titleAttr}>${linkText}</a>`;
    }

    // Default
    return `<a href="${escapeHtml(href)}"${titleAttr}>${linkText}</a>`;
  };

  // ── Headings → with id slugs and difficulty badges ───────────
  renderer.heading = function ({ text, depth }) {
    const headingText = typeof text === 'string' ? text : '';
    const slug = slugify(headingText);
    
    // Extract leading emoji
    const emojiMatch = headingText.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])\s*(.*)$/);
    let emojiSpan = '';
    let displayText = headingText;
    
    if (emojiMatch) {
      emojiSpan = `<span class="heading-emoji">${emojiMatch[1]}</span>`;
      displayText = emojiMatch[2];
    }

    if (depth === 1) {
      let badge = '';
      if (displayText.includes('🟢')) {
        badge = '<span class="difficulty-badge beginner">Beginner</span>';
        displayText = displayText.replace('🟢', '').trim();
      } else if (displayText.includes('🟡')) {
        badge = '<span class="difficulty-badge intermediate">Intermediate</span>';
        displayText = displayText.replace('🟡', '').trim();
      } else if (displayText.includes('🔴')) {
        badge = '<span class="difficulty-badge advanced">Advanced</span>';
        displayText = displayText.replace('🔴', '').trim();
      }

      return `<h1 id="${slug}">${emojiSpan}${displayText}${badge}</h1>`;
    }

    return `<h${depth} id="${slug}">${emojiSpan}${displayText}</h${depth}>`;
  };

  // ── Tables → responsive wrapper ──────────────────────────────
  renderer.table = function ({ header, rows }) {
    // Build table HTML from header and rows
    let thead = '<thead><tr>';
    if (header && header.length > 0) {
      for (const cell of header) {
        const align = cell.align ? ` style="text-align:${cell.align}"` : '';
        const cellText = typeof cell.text === 'string' ? cell.text : '';
        thead += `<th${align}>${cellText}</th>`;
      }
    }
    thead += '</tr></thead>';

    let tbody = '<tbody>';
    if (rows && rows.length > 0) {
      for (const row of rows) {
        tbody += '<tr>';
        for (const cell of row) {
          const align = cell.align ? ` style="text-align:${cell.align}"` : '';
          const cellText = typeof cell.text === 'string' ? cell.text : '';
          tbody += `<td${align}>${cellText}</td>`;
        }
        tbody += '</tr>';
      }
    }
    tbody += '</tbody>';

    return `<div class="table-responsive"><table>${thead}${tbody}</table></div>`;
  };

  // ── Horizontal rules ─────────────────────────────────────────
  renderer.hr = function () {
    return '<hr class="styled-hr" />';
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
  });
}

/**
 * Render markdown content to HTML.
 * @param {string} mdContent - Raw markdown text
 * @param {string} filePath - Current file path for resolving relative links
 * @returns {string} Rendered HTML
 */
export function renderMarkdown(mdContent, filePath) {
  checkboxIndex = 0;
  currentFilePath = filePath || '';
  
  // Clean up and extract navigation links
  let cleanMd = mdContent;
  let prevLink = null;
  let nextLink = null;
  
  // Let's scan all lines to separate navigation lines from body
  const lines = mdContent.split('\n');
  const bodyLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.replace(/\r$/, '').trim();
    
    const hasNavEmoji = line.includes('⬅️') || line.includes('➡️') || line.includes('⏮️') || line.includes('⏭️') || line.includes('◀️') || line.includes('▶️') || line.includes('Bài trước') || line.includes('Bài tiếp theo');
    const hasLink = line.includes('[') && line.includes('](');
    
    if (hasNavEmoji && hasLink) {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      let foundNav = false;
      
      while ((match = linkRegex.exec(line)) !== null) {
        const label = match[1].trim();
        const path = match[2].trim();
        
        const isPrev = label.includes('⬅️') || label.includes('Bài trước') || label.includes('⏮️') || label.includes('◀️') || label.includes('Về trang chủ') || label.includes('Cách dùng') || label.includes('Overview') || label.includes('Index');
        const isNext = label.includes('➡️') || label.includes('Bài tiếp theo') || label.includes('⏭️') || label.includes('▶️') || label.includes('Lên Junior') || label.includes('Lên Mid') || label.includes('Lên Senior') || label.includes('Skills') || label.includes('Projects') || label.includes('Checklist') || label.includes('Performance') || label.includes('checklist');
        
        if (isPrev) {
          prevLink = { label: label.replace(/[⬅️⏮️◀️]/g, '').trim(), path };
          foundNav = true;
        } else if (isNext) {
          nextLink = { label: label.replace(/[➡️⏭️▶️]/g, '').trim(), path };
          foundNav = true;
        }
      }
      
      if (foundNav) {
        continue; // Skip this line from rendering
      }
    }
    
    // Also skip standard dividers right under top navigation
    if (bodyLines.length === 0 && line === '---') {
      continue;
    }
    
    bodyLines.push(rawLine);
  }
  
  cleanMd = bodyLines.join('\n');
  
  let html = marked.parse(cleanMd);
  
  // Append beautiful navigation cards if we found any prev/next links
  if (prevLink || nextLink) {
    let navHtml = '<div class="content-nav">';
    if (prevLink) {
      const resolved = resolveRelativePath(filePath, prevLink.path);
      const hash = '#/' + resolved.replace(/\.md$/, '');
      navHtml += `
        <a class="content-nav-link prev" href="${hash}">
          <small>⬅️ BÀI TRƯỚC</small>
          <span>${escapeHtml(prevLink.label)}</span>
        </a>
      `;
    } else {
      // Empty placeholder for spacing
      navHtml += '<div class="content-nav-spacer"></div>';
    }
    
    if (nextLink) {
      const resolved = resolveRelativePath(filePath, nextLink.path);
      const hash = '#/' + resolved.replace(/\.md$/, '');
      navHtml += `
        <a class="content-nav-link next" href="${hash}">
          <small>BÀI TIẾP THEO ➡️</small>
          <span>${escapeHtml(nextLink.label)}</span>
        </a>
      `;
    }
    navHtml += '</div>';
    html += navHtml;
  }
  
  return html;
}

/**
 * Find and render all mermaid diagram blocks in the current page.
 * Loads mermaid.js lazily from CDN.
 */
export async function renderMermaidDiagrams() {
  const mermaidElements = document.querySelectorAll('.mermaid');
  if (mermaidElements.length === 0) return;

  await loadMermaid();

  try {
    await window.mermaid.run({ nodes: mermaidElements });
  } catch (err) {
    console.warn('Mermaid rendering error:', err);
  }
}

// ── Helpers ──────────────────────────────────────────────────────

let mermaidLoading = null;

async function loadMermaid() {
  if (window.mermaid) {
    // Re-initialize with current theme
    window.mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
    return;
  }

  if (mermaidLoading) return mermaidLoading;

  mermaidLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
    script.onload = () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
      });
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return mermaidLoading;
}

/**
 * Resolve a relative path from a base file path.
 * e.g. resolveRelativePath('01-Intern/README.md', './skills.md') → '01-Intern/skills.md'
 * e.g. resolveRelativePath('01-Intern/README.md', '../02-Junior/README.md') → '02-Junior/README.md'
 */
function resolveRelativePath(basePath, relativePath) {
  const baseParts = basePath.split('/');
  baseParts.pop(); // Remove the filename to get the directory

  const relParts = relativePath.split('/');

  for (const part of relParts) {
    if (part === '.') continue;
    if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }

  return baseParts.join('/');
}

/**
 * Slugify a heading text for use as an HTML id.
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF-]/g, '') // keep letters, numbers, Vietnamese chars, hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

// ── Interactive Diagrams Renderers ─────────────────────────────────

function tryRenderInteractiveDiagram(code) {
  const normalized = code.replace(/\r/g, '');

  if (normalized.includes('INTERN -> JUNIOR -> MID -> SENIOR') || (normalized.includes('TECHNICAL') && normalized.includes('CÔNG TY'))) {
    return renderOverviewDiagram();
  }
  if (normalized.includes('UNITY DEVELOPER') && normalized.includes('Gameplay') && normalized.includes('Tools/Engine')) {
    return renderCareerPathsDiagram();
  }
  if (normalized.includes('TECHNICAL DEEP DIVES') && normalized.includes('Nền tảng')) {
    return renderTechnicalDivesDiagram();
  }
  if (normalized.includes('MANAGED MEMORY') && normalized.includes('NATIVE MEMORY')) {
    return renderMemoryDiagram();
  }
  if (normalized.includes('MỘT GAME INDIE THÀNH CÔNG CẦN:')) {
    return renderIndiePillarsDiagram();
  }
  if (normalized.includes('GameObject "Player"')) {
    return renderInspectorDiagram();
  }
  if (normalized.includes('MỘT FRAME') && normalized.includes('Vòng lặp Vật lý')) {
    return renderLifecycleDiagram();
  }
  
  // New diagrams
  if (normalized.includes('Mô hình chữ T của Senior') && normalized.includes('Kiến thức rộng')) {
    return renderTModelDiagram();
  }
  if (normalized.includes('Học khái niệm → Áp dụng') || normalized.includes('Tự debug → Hỏi')) {
    return renderLearningCycleDiagram();
  }
  if (normalized.includes('C# nền tảng ──► MonoBehaviour')) {
    return renderInternSkillsDiagram();
  }
  if (normalized.includes('C# trung cấp ──► Clean Code')) {
    return renderJuniorSkillsDiagram();
  }
  if (normalized.includes('SOLID + DI + Layering ──►')) {
    return renderMidSkillsDiagram();
  }
  if (normalized.includes('TECHNICAL MASTERY') && normalized.includes('JUDGEMENT') && normalized.includes('LEADERSHIP')) {
    return renderSeniorSkillsDiagram();
  }
  if (normalized.includes('Push → Lint/Format → Compile')) {
    return renderPipelineDiagram();
  }
  if (normalized.includes('Input → Update() → Physics(FixedUpdate)')) {
    return renderFrameLifecycleDiagram();
  }
  if (normalized.includes('main (luôn ổn định)') && normalized.includes('feature/')) {
    return renderGitTreeDiagram();
  }
  if (normalized.includes('Ý tưởng → Prototype') && normalized.includes('TEST: có vui không?')) {
    return renderDesignLoopDiagram();
  }
  if (normalized.includes('Bắt đầu làm game  → Bắt đầu post devlog')) {
    return renderMarketingRoadmapDiagram();
  }
  if (normalized.includes('Screening (CV + portfolio)') && normalized.includes('Coding test')) {
    return renderInterviewStepsDiagram();
  }
  if (normalized.includes('Junior → Mid → Senior → ┬→ Tech Lead')) {
    return renderCareerBranchingDiagram();
  }
  if (normalized.includes('Entity') && normalized.includes('Character') && normalized.includes('FlyingEnemy')) {
    return renderUnityHierarchyDiagram();
  }
  if (normalized.includes('FixedUpdate() của bạn') && normalized.includes('Engine di chuyển các Rigidbody')) {
    return renderPhysicsPipelineDiagram();
  }
  if (normalized.includes('Player (cha)') && normalized.includes('Torch (con)')) {
    return renderParentChildDiagram();
  }
  
  return null;
}

function renderOverviewDiagram() {
  return `
    <div class="interactive-diagram overview-diagram">
      <div class="overview-header">
        <span class="diagram-badge">Lộ Trình Tổng Quan</span>
        <h3>🎮 BẢN ĐỒ TIẾN TRÌNH UNITY DEVELOPER</h3>
      </div>
      
      <!-- Phase Timeline -->
      <div class="overview-phases">
        <a class="phase-card intern" href="#/01-Intern/README">
          <div class="phase-badge">Level 1</div>
          <div class="phase-title">🌱 Intern</div>
          <div class="phase-time">0 - 6 tháng</div>
          <div class="phase-desc">Học cơ bản C#, Editor, và làm game jam nhỏ.</div>
        </a>
        <div class="phase-connector">➔</div>
        <a class="phase-card junior" href="#/02-Junior/README">
          <div class="phase-badge">Level 2</div>
          <div class="phase-title">🌿 Junior</div>
          <div class="phase-time">6 - 18 tháng</div>
          <div class="phase-desc">Nắm vững core systems, UI, 2D/3D physics, và Git.</div>
        </a>
        <div class="phase-connector">➔</div>
        <a class="phase-card mid" href="#/03-Mid-Level/README">
          <div class="phase-badge">Level 3</div>
          <div class="phase-title">🌳 Mid-Level</div>
          <div class="phase-time">1.5 - 3 năm</div>
          <div class="phase-desc">Thiết kế hệ thống độc lập, tối ưu hiệu năng và bộ nhớ.</div>
        </a>
        <div class="phase-connector">➔</div>
        <a class="phase-card senior" href="#/04-Senior/README">
          <div class="phase-badge">Level 4</div>
          <div class="phase-title">🏔️ Senior</div>
          <div class="phase-time">3 - 6+ năm</div>
          <div class="phase-desc">Kiến trúc hệ thống phức tạp, mentor team và định hướng.</div>
        </a>
      </div>
      
      <div class="overview-split-label">3 NHÁNH CHẠY SONG SONG TRONG LỘ TRÌNH</div>
      
      <!-- Split tracks -->
      <div class="overview-tracks">
        <a class="track-card technical" href="#/05-Technical-Deep-Dives/README">
          <div class="track-icon">🔬</div>
          <div class="track-title">Technical Deep Dives</div>
          <div class="track-desc">Đào sâu chuyên môn kỹ thuật: Architecture, Physics, Rendering, Multiplayer.</div>
        </a>
        <a class="track-card studio" href="#/07-Interview-and-Portfolio/README">
          <div class="track-icon">🏢</div>
          <div class="track-title">Công Ty / Studio</div>
          <div class="track-desc">Quy trình làm việc nhóm chuyên nghiệp, Git, Portfolio và phỏng vấn.</div>
        </a>
        <a class="track-card indie" href="#/06-Indie-Track/README">
          <div class="track-icon">🎨</div>
          <div class="track-title">Indie Game Track</div>
          <div class="track-desc">Kỹ năng sinh tồn cho Indie Dev: Game design, Production, Scope, Marketing.</div>
        </a>
      </div>
    </div>
  `;
}

function renderCareerPathsDiagram() {
  return `
    <div class="interactive-diagram career-paths-diagram">
      <div class="diagram-root">
        <span class="diagram-badge">Bản Đồ Vai Trò</span>
        <h3>🎮 UNITY DEVELOPER</h3>
      </div>
      <div class="diagram-connector-vertical"></div>
      <div class="diagram-grid columns-5">
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/gameplay-systems">
          <div class="node-icon">⚔️</div>
          <div class="node-title">Gameplay Programmer</div>
          <div class="node-desc">"Làm cơ chế game, AI, UI, input"</div>
          <span class="node-action">Khám phá ngay →</span>
        </a>
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/tools-and-editor">
          <div class="node-icon">🛠️</div>
          <div class="node-title">Tools/Engine Programmer</div>
          <div class="node-desc">"Làm công cụ cho team, pipeline"</div>
          <span class="node-action">Khám phá ngay →</span>
        </a>
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/graphics-and-rendering">
          <div class="node-icon">🎨</div>
          <div class="node-title">Graphics/Rendering Engineer</div>
          <div class="node-desc">"Shader, VFX, render pipeline"</div>
          <span class="node-action">Khám phá ngay →</span>
        </a>
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/multiplayer-networking">
          <div class="node-icon">🌐</div>
          <div class="node-title">Backend/Multiplayer Engineer</div>
          <div class="node-desc">"Server, netcode, matchmaking"</div>
          <span class="node-action">Khám phá ngay →</span>
        </a>
        <a class="diagram-node" href="#/06-Indie-Track/README">
          <div class="node-icon">⛵</div>
          <div class="node-title">Generalist (Indie Dev)</div>
          <div class="node-desc">"Làm tất cả, từ A đến Z"</div>
          <span class="node-action">Khám phá ngay →</span>
        </a>
      </div>
    </div>
  `;
}

function renderTechnicalDivesDiagram() {
  return `
    <div class="interactive-diagram tech-dives-diagram">
      <div class="diagram-root">
        <span class="diagram-badge">Phân Mảng</span>
        <h3>🔬 TECHNICAL DEEP DIVES</h3>
      </div>
      <div class="diagram-connector-vertical"></div>
      <div class="diagram-grid columns-5">
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/architecture">
          <div class="node-icon">🧱</div>
          <div class="node-title">Nền tảng</div>
          <div class="node-desc">SOLID, Design Patterns, DI</div>
        </a>
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/performance">
          <div class="node-icon">⚡</div>
          <div class="node-title">Hiệu năng</div>
          <div class="node-desc">CPU, GPU, Draw calls, Profiler</div>
        </a>
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/memory-management">
          <div class="node-icon">🧠</div>
          <div class="node-title">Chuyên sâu mảng</div>
          <div class="node-desc">Memory, GC, Addressables, Leak</div>
        </a>
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/build-and-pipeline">
          <div class="node-icon">⚙️</div>
          <div class="node-title">Quy trình kỹ thuật</div>
          <div class="node-desc">Build Pipeline, CI/CD, Asset pipeline</div>
        </a>
        <a class="diagram-node" href="#/05-Technical-Deep-Dives/README">
          <div class="node-icon">🧭</div>
          <div class="node-title">Chọn hướng đi</div>
          <div class="node-desc">Hướng dẫn phát triển chuyên sâu</div>
        </a>
      </div>
    </div>
  `;
}

function renderMemoryDiagram() {
  return `
    <div class="interactive-diagram memory-diagram">
      <div class="memory-columns">
        <div class="memory-column managed">
          <div class="column-header">
            <span class="column-badge managed-badge">C# Managed</span>
            <h4>🧠 MANAGED MEMORY</h4>
          </div>
          <ul class="column-list">
            <li><strong>Thành phần:</strong> Đối tượng C#, class instances, biến động.</li>
            <li><strong>Quản lý:</strong> Tự động dọn dẹp bởi Garbage Collector (GC).</li>
            <li><strong>Lưu ý:</strong> Dễ sinh ra GC Spike gây giật, lag (micro-stutter).</li>
          </ul>
          <div class="column-tip">💡 Hạn chế tạo object trong Update() để giảm GC spike.</div>
        </div>
        <div class="memory-connector-vs">VS</div>
        <div class="memory-column native">
          <div class="column-header">
            <span class="column-badge native-badge">Engine Native</span>
            <h4>🏢 NATIVE MEMORY</h4>
          </div>
          <ul class="column-list">
            <li><strong>Thành phần:</strong> Texture, Mesh, Audio, Asset native, GPU Buffer.</li>
            <li><strong>Quản lý:</strong> Do Lập trình viên chủ động load/unload thủ công.</li>
            <li><strong>Lưu ý:</strong> Dễ gây phình RAM (Memory Leak) dẫn đến crash nếu không giải phóng.</li>
          </ul>
          <div class="column-tip">💡 Sử dụng Addressables để load/unload tài nguyên an toàn.</div>
        </div>
      </div>
    </div>
  `;
}

function renderIndiePillarsDiagram() {
  return `
    <div class="interactive-diagram indie-pillars-diagram">
      <div class="diagram-root">
        <span class="diagram-badge">Cốt lõi</span>
        <h3>⛵ MỘT GAME INDIE THÀNH CÔNG CẦN:</h3>
      </div>
      <div class="diagram-connector-vertical"></div>
      <div class="diagram-grid columns-5">
        <div class="diagram-node static">
          <div class="node-icon">💻</div>
          <div class="node-title">Code</div>
          <div class="node-desc">Lập trình cơ chế (bạn đang học phần này)</div>
        </div>
        <a class="diagram-node" href="#/06-Indie-Track/game-design">
          <div class="node-icon">❤️</div>
          <div class="node-title">Design</div>
          <div class="node-desc">Trái tim của game, tạo độ lôi cuốn & vòng lặp vui</div>
        </a>
        <a class="diagram-node" href="#/06-Indie-Track/art-and-audio">
          <div class="node-icon">🎨</div>
          <div class="node-title">Art/Audio</div>
          <div class="node-desc">Phong cách nghệ thuật ấn tượng, vừa sức hoặc thuê ngoài</div>
        </a>
        <a class="diagram-node" href="#/06-Indie-Track/production-and-scope">
          <div class="node-icon">⏱️</div>
          <div class="node-title">Production</div>
          <div class="node-desc">Quản lý scope nghiêm ngặt để hoàn thành & phát hành game</div>
        </a>
        <a class="diagram-node" href="#/06-Indie-Track/marketing-and-release">
          <div class="node-icon">📢</div>
          <div class="node-title">Marketing</div>
          <div class="node-desc">Tiếp thị sớm, xây dựng wishlist Steam, sống còn thương mại</div>
        </a>
      </div>
    </div>
  `;
}

function renderInspectorDiagram() {
  return `
    <div class="virtual-inspector">
      <div class="inspector-header">
        <div class="inspector-logo">🎮 Unity Inspector</div>
        <div class="inspector-gameobject">
          <input type="checkbox" checked disabled />
          <span class="go-name">Player</span>
          <span class="go-static">Static</span>
        </div>
      </div>
      <div class="inspector-components">
        <div class="inspector-component expanded" data-comp="transform">
          <div class="comp-header">
            <span class="comp-arrow">▼</span>
            <span class="comp-icon">🧭</span>
            <strong>Transform</strong>
          </div>
          <div class="comp-body">
            <div class="comp-row"><span class="comp-label">Position</span><span class="comp-val">X: 0 | Y: 0 | Z: 0</span></div>
            <div class="comp-row"><span class="comp-label">Rotation</span><span class="comp-val">X: 0 | Y: 0 | Z: 0</span></div>
            <div class="comp-row"><span class="comp-label">Scale</span><span class="comp-val">X: 1 | Y: 1 | Z: 1</span></div>
            <div class="comp-desc">📍 <strong>Component bắt buộc:</strong> Xác định vị trí, góc xoay và tỉ lệ của GameObject trong không gian game.</div>
          </div>
        </div>
        <div class="inspector-component" data-comp="renderer">
          <div class="comp-header">
            <span class="comp-arrow">▶</span>
            <span class="comp-icon">🖼️</span>
            <strong>SpriteRenderer</strong>
          </div>
          <div class="comp-body">
            <div class="comp-row"><span class="comp-label">Sprite</span><span class="comp-val">player_idle (Sprite)</span></div>
            <div class="comp-row"><span class="comp-label">Color</span><span class="comp-val color-picker-container"><span class="color-picker-box"></span> White (255,255,255)</span></div>
            <div class="comp-desc">🎨 <strong>Khả năng hiển thị:</strong> Nhận diện hình ảnh vẽ (2D Sprite) và hiển thị nó lên màn hình cho người chơi xem.</div>
          </div>
        </div>
        <div class="inspector-component" data-comp="rigidbody">
          <div class="comp-header">
            <span class="comp-arrow">▶</span>
            <span class="comp-icon">⚙️</span>
            <strong>Rigidbody2D</strong>
          </div>
          <div class="comp-body">
            <div class="comp-row"><span class="comp-label">Body Type</span><span class="comp-val">Dynamic</span></div>
            <div class="comp-row"><span class="comp-label">Mass</span><span class="comp-val">1</span></div>
            <div class="comp-desc">🏋️ <strong>Khả năng vật lý:</strong> Cho phép GameObject chịu tác động của trọng lực, lực đẩy, gia tốc và tương tác va chạm.</div>
          </div>
        </div>
        <div class="inspector-component" data-comp="collider">
          <div class="comp-header">
            <span class="comp-arrow">▶</span>
            <span class="comp-icon">📐</span>
            <strong>BoxCollider2D</strong>
          </div>
          <div class="comp-body">
            <div class="comp-row"><span class="comp-label">Is Trigger</span><span class="comp-val">False</span></div>
            <div class="comp-row"><span class="comp-label">Size</span><span class="comp-val">X: 1 | Y: 1</span></div>
            <div class="comp-desc">📦 <strong>Khả năng va chạm:</strong> Định hình ranh giới vật lý của GameObject để ngăn đi xuyên qua tường hoặc phát hiện sự kiện chạm.</div>
          </div>
        </div>
        <div class="inspector-component" data-comp="script">
          <div class="comp-header">
            <span class="comp-arrow">▶</span>
            <span class="comp-icon">📜</span>
            <strong>PlayerController (Script)</strong>
          </div>
          <div class="comp-body">
            <div class="comp-row"><span class="comp-label">Move Speed</span><span class="comp-val">5.0</span></div>
            <div class="comp-row"><span class="comp-label">Jump Force</span><span class="comp-val">8.0</span></div>
            <div class="comp-desc">⚡ <strong>Hành vi do bạn viết:</strong> Sử dụng code C# tùy biến để định nghĩa logic điều khiển nhân vật, di chuyển, nhảy, bắn súng theo ý muốn.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLifecycleDiagram() {
  return `
    <div class="interactive-diagram lifecycle-diagram">
      <div class="lifecycle-header">
        <span class="lifecycle-badge">Vòng Lặp</span>
        <h3>🔄 CHU TRÌNH MỘT FRAME TRONG UNITY</h3>
        <p class="lifecycle-subtitle">Nhấp vào từng bước để xem chi tiết cách hoạt động</p>
      </div>
      <div class="lifecycle-timeline">
        <div class="lifecycle-step" data-step="input">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-title">Xử lý Input (Input Events)</div>
            <div class="step-details">Unity nhận diện các sự kiện từ chuột, bàn phím, màn hình cảm ứng, tay cầm...</div>
          </div>
        </div>
        <div class="lifecycle-step physics-loop" data-step="physics">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-title">Vòng lặp Vật lý (Physics Loop)</div>
            <div class="step-details">Chạy định kỳ (mỗi 0.02 giây). Có thể chạy nhiều lần hoặc 0 lần trong 1 frame.</div>
            <div class="physics-substeps">
              <div class="substep">⚙️ <strong>FixedUpdate():</strong> Code tính toán vật lý, di chuyển Rigidbody.</div>
              <div class="substep">💥 <strong>Collision/Trigger:</strong> Nhận diện va chạm vật lý.</div>
            </div>
          </div>
        </div>
        <div class="lifecycle-step" data-step="update">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-title">Update() (Logic chính)</div>
            <div class="step-details">Gọi 1 lần/frame. Phù hợp để đọc input, chạy logic cooldown, cập nhật timer, di chuyển không vật lý (nhân với Time.deltaTime).</div>
          </div>
        </div>
        <div class="lifecycle-step" data-step="coroutine">
          <div class="step-num">4</div>
          <div class="step-content">
            <div class="step-title">Coroutine (yield)</div>
            <div class="step-details">Unity tiếp tục thực thi các luồng chạy song song tạm dừng ở các frame trước (yield return null, yield return new WaitForSeconds...).</div>
          </div>
        </div>
        <div class="lifecycle-step" data-step="lateupdate">
          <div class="step-num">5</div>
          <div class="step-content">
            <div class="step-title">LateUpdate()</div>
            <div class="step-details">Gọi 1 lần/frame, chắc chắn sau khi mọi Update() của các đối tượng đã chạy xong. Cực kỳ tối ưu cho Camera bám đuôi nhân vật.</div>
          </div>
        </div>
        <div class="lifecycle-step" data-step="render">
          <div class="step-num">6</div>
          <div class="step-content">
            <div class="step-title">Render & Draw (Vẽ màn hình)</div>
            <div class="step-details">Gửi dữ liệu Mesh, Material tới GPU để vẽ hình ảnh và hiển thị lên màn hình người chơi. Kết thúc frame cũ, chuyển sang frame tiếp theo.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTModelDiagram() {
  return `
    <div class="interactive-diagram t-model-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Mô hình chữ T</span>
        <h3>📐 MÔ HÌNH CHỮ T (T-SHAPED) CỦA SENIOR DEV</h3>
      </div>
      <div class="t-model-container">
        <div class="t-horizontal-bar">
          <div class="t-bar-title">Kiến thức rộng (Generalist)</div>
          <div class="t-bar-pills">
            <span class="t-pill">C# Core</span>
            <span class="t-pill">Unity Editor</span>
            <span class="t-pill">Git</span>
            <span class="t-pill">Vật lý 2D/3D</span>
            <span class="t-pill">UI System</span>
            <span class="t-pill">Audio</span>
            <span class="t-pill">Save/Load</span>
            <span class="t-pill">Math/Vector</span>
          </div>
        </div>
        <div class="t-vertical-stem-container">
          <div class="t-vertical-stem">
            <div class="stem-title">Chuyên sâu 1 mảng (Specialist)</div>
            <div class="stem-options">
              <div class="stem-option" data-desc="⚔️ Gameplay: Thiết kế cơ chế game linh hoạt, AI hành vi phức tạp, combat system, game loop, UI logic & state.">⚔️ Gameplay</div>
              <div class="stem-option" data-desc="🛠️ Tools/Engine: Viết Custom Editor Window, Property Drawers, automation build pipeline giúp tăng 2-3x hiệu suất team.">🛠️ Tools/Engine</div>
              <div class="stem-option" data-desc="🎨 Graphics: Shader Graph/HLSL, Custom Render Passes URP, VFX Graph, tối ưu hóa GPU render.">🎨 Graphics/VFX</div>
              <div class="stem-option" data-desc="🌐 Multiplayer: Netcode for GameObjects, socket server, đồng bộ hóa state, Client Prediction, Server Authority.">🌐 Multiplayer</div>
            </div>
            <div class="stem-desc-bubble">Rê chuột hoặc nhấp vào một mảng chuyên sâu để xem chi tiết...</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLearningCycleDiagram() {
  return `
    <div class="interactive-diagram learning-cycle-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Chu kỳ học</span>
        <h3>🔄 CHU KỲ HỌC TẬP HIỆU QUẢ TRONG LẬP TRÌNH</h3>
      </div>
      <div class="cycle-steps">
        <div class="cycle-step" data-idx="1"><span class="step-icon">📖</span><span class="step-name">1. Học khái niệm</span></div>
        <div class="cycle-arrow">➔</div>
        <div class="cycle-step" data-idx="2"><span class="step-icon">🚀</span><span class="step-name">2. Áp dụng dự án</span></div>
        <div class="cycle-arrow">➔</div>
        <div class="cycle-step" data-idx="3"><span class="step-icon">⚠️</span><span class="step-name">3. Gặp lỗi/Bug</span></div>
        <div class="cycle-arrow">➔</div>
        <div class="cycle-step" data-idx="4"><span class="step-icon">🔍</span><span class="step-name">4. Tự debug</span></div>
      </div>
      <div class="cycle-steps second-row" style="margin-top: 16px;">
        <div class="cycle-step" data-idx="7"><span class="step-icon">📝</span><span class="step-name">7. Ghi chú lại</span></div>
        <div class="cycle-arrow">◄</div>
        <div class="cycle-step" data-idx="6"><span class="step-icon">🧠</span><span class="step-name">6. Hiểu sâu hơn</span></div>
        <div class="cycle-arrow">◄</div>
        <div class="cycle-step" data-idx="5"><span class="step-icon">💬</span><span class="step-name">5. Hỏi/Tra cứu</span></div>
      </div>
      <div class="cycle-desc-box">
        Nhấp vào một bước bất kỳ để xem chi tiết cách thực hiện hiệu quả...
      </div>
    </div>
  `;
}

function renderInternSkillsDiagram() {
  return `
    <div class="interactive-diagram skills-path-diagram intern-skills">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Intern Skills</span>
        <h3>🌱 BẢN ĐỒ PHỤ THUỘC KIẾN THỨC INTERN</h3>
      </div>
      <div class="skills-flow-grid">
        <div class="skill-card active" data-desc="C# Nền Tảng: Biến, vòng lặp, hàm, class, OOP căn bản (kế thừa, đóng gói), List, enum. Bắt buộc phải học vững trước.">C# Nền tảng</div>
        <div class="flow-arrow">➔</div>
        <div class="skill-card" data-desc="MonoBehaviour: Hiểu Awake, Start, Update, FixedUpdate, LateUpdate và cách engine Unity chạy game loop.">MonoBehaviour</div>
        <div class="flow-arrow">➔</div>
        <div class="skill-card" data-desc="Vật lý & Input: Thao tác Rigidbody, Collider, va chạm Collision/Trigger và Input.GetKey để điều khiển nhân vật.">Vật lý + Input</div>
        <div class="flow-arrow">➔</div>
        <div class="skill-card" data-desc="UI & Audio: Sử dụng Canvas, Button, TextMeshPro, AudioSource để làm âm thanh sfx và giao diện điểm số.">UI + Audio</div>
        <div class="flow-arrow">➔</div>
        <div class="skill-card" data-desc="Game Hoàn Chỉnh: Kết hợp toàn bộ kiến thức để tự code xong 2-3 game nhỏ hoàn chỉnh (Pong, Flappy Bird, Brick Breaker).">Game hoàn chỉnh</div>
      </div>
      <div class="git-debug-track">
        <div class="track-line-up"></div>
        <div class="skill-card track-card" data-desc="Git + Debug: Quản lý mã nguồn bằng Git (commit, push, branch), đọc hiểu Console log và đặt breakpoint debug. Học song song.">Git + Debug (Xuyên suốt)</div>
        <div class="track-line-down"></div>
      </div>
      <div class="skill-desc-box">Nhấp vào từng ô kỹ năng để xem chi tiết yêu cầu...</div>
    </div>
  `;
}

function renderJuniorSkillsDiagram() {
  return `
    <div class="interactive-diagram skills-path-diagram junior-skills">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Junior Skills</span>
        <h3>🌿 BẢN ĐỒ PHỤ THUỘC KIẾN THỨC JUNIOR</h3>
      </div>
      <div class="skills-flow-layout">
        <div class="flow-row">
          <div class="skill-card active" data-desc="C# Trung Cấp: Sử dụng nhuần nhuyễn Interface, Abstract Class, Delegate, Event (Action/Func) và Generics.">C# Trung cấp</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Clean Code: Đặt tên biến/hàm rõ ràng, viết hàm ngắn làm đúng 1 việc, áp dụng nguyên tắc KISS, SRP, DRY.">Clean Code</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Design Patterns: Hiểu Singleton (dùng hạn chế), Observer (Sự kiện), State Machine cho AI, Object Pool.">Design Patterns</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Kiến Trúc Cơ Bản: Tư duy tách biệt code logic khỏi UI, giảm coupling chặt chẽ giữa các thành phần.">Kiến Trúc cơ bản</div>
        </div>
        <div class="flow-branch-row">
          <div class="branch-line"></div>
          <div class="branch-arrow">▼</div>
        </div>
        <div class="flow-row">
          <div class="skill-card" data-desc="ScriptableObject: Dùng ScriptableObject làm cấu hình dữ liệu và xây dựng hệ thống sự kiện SO Event Channel sạch sẽ.">ScriptableObject</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Hệ Thống Unity Sâu: Sử dụng BlendTree, Animation Events trong Animator, New Input System, Save/Load JSON.">Hệ thống Unity Sâu</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Profiler & Tối Ưu: Sử dụng Profiler cơ bản để tìm CPU spike, tối ưu GetComponent, pooling và quản lý conflict Git.">Profiler + Tối ưu + Git</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card success-card" data-desc="Sẵn sàng đi làm: Sở hữu portfolio tốt gồm dự án code sạch, hiểu Agile/Scrum và có kỹ năng phỏng vấn cơ bản.">Sẵn sàng đi làm</div>
        </div>
      </div>
      <div class="skill-desc-box">Nhấp vào từng ô kỹ năng để xem chi tiết yêu cầu...</div>
    </div>
  `;
}

function renderMidSkillsDiagram() {
  return `
    <div class="interactive-diagram skills-path-diagram mid-skills">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Mid-Level Skills</span>
        <h3>🌳 BẢN ĐỒ PHỤ THUỘC KIẾN THỨC MID-LEVEL</h3>
      </div>
      <div class="skills-flow-layout">
        <div class="flow-row">
          <div class="skill-card active" data-desc="SOLID + DI + Layering: Áp dụng SOLID triệt để, tiêm phụ thuộc qua VContainer/Zenject, thiết kế tách lớp MVC/MVP/MVVM.">SOLID + DI + Layering</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Tư Duy Hệ Thống: Thiết kế mô-đun hóa độc lập, vẽ sơ đồ thiết kế hệ thống và ghi nhận ADR.">Tư duy hệ thống</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Tự Dựng Hệ Thống Lớn: Khả năng tự mình thiết kế và dựng trọn vẹn các hệ thống lớn (Inventory, Combat).">Tự dựng hệ thống lớn</div>
        </div>
        <div class="flow-branch-row">
          <div class="branch-line-complex"></div>
        </div>
        <div class="flow-row">
          <div class="skill-card" data-desc="Async + Addressables: Sử dụng UniTask cho lập trình bất đồng bộ hiệu năng cao, dùng Addressables quản lý nạp/giải phóng asset.">Async + Addressables</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card" data-desc="Tối Ưu Chuyên Nghiệp: Profile sâu bộ nhớ bằng Memory Profiler, tìm draw call qua Frame Debugger, tối ưu CPU/GPU/RAM.">Tối ưu chuyên nghiệp</div>
          <div class="skill-card" data-desc="Chuyên Sâu 1 Mảng: Đào sâu chuyên môn T-shaped về Gameplay, Editor Tools, Graphics/Shader, hoặc Multiplayer.">Chuyên sâu 1 mảng</div>
        </div>
        <div class="flow-branch-row">
          <div class="branch-arrow-center">▼</div>
        </div>
        <div class="flow-row">
          <div class="skill-card" data-desc="Testing + CI/CD + Doc: Viết Unit Test và Play Mode Test, tự động hóa build/deploy CI/CD (GitHub Actions), viết technical doc.">Testing + CI/CD + Doc</div>
          <div class="flow-arrow">➔</div>
          <div class="skill-card success-card" data-desc="Sẵn sàng lên Senior: Khả năng làm việc độc lập hoàn toàn, mentor đồng đội và đưa quyết định kiến trúc.">Sẵn sàng dẫn dắt (Senior)</div>
        </div>
      </div>
      <div class="skill-desc-box">Nhấp vào từng ô kỹ năng để xem chi tiết yêu cầu...</div>
    </div>
  `;
}

function renderSeniorSkillsDiagram() {
  return `
    <div class="interactive-diagram senior-pillars-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Senior Competencies</span>
        <h3>🏔️ BA TRỤ CỘT NĂNG LỰC CỦA SENIOR DEVELOPER</h3>
      </div>
      <div class="senior-pillars">
        <div class="senior-pillar technical">
          <div class="pillar-header">🔬 TECHNICAL MASTERY</div>
          <ul class="pillar-items">
            <li class="pillar-item" data-desc="Hiểu Unity dưới mui xe: cơ chế serialization, native/managed memory, custom rendering pass, player loop.">Hiểu Unity sâu</li>
            <li class="pillar-item" data-desc="Thiết kế hệ thống chạy nhiều năm nhiều người, quản lý nợ kỹ thuật, cấu trúc modular qua Assembly Definitions.">Kiến trúc hệ thống lớn</li>
            <li class="pillar-item" data-desc="Trở thành chuyên gia đầu ngành (T-shaped) trong một mảng lớn: Gameplay, Tools, Graphics, hay Multiplayer.">Chuyên gia 1 mảng</li>
            <li class="pillar-item" data-desc="Xây dựng ngân sách hiệu năng (performance budget), tối ưu hóa toàn bộ pipeline asset/runtime CPU/GPU.">Tối ưu cấp hệ thống</li>
          </ul>
        </div>
        <div class="senior-pillar judgement">
          <div class="pillar-header">⚖️ JUDGEMENT</div>
          <ul class="pillar-items">
            <li class="pillar-item" data-desc="Đánh giá trade-off (đánh đổi) rõ ràng giữa đơn giản vs phức tạp, tự phát triển vs mua asset/middleware.">Thấy trade-off</li>
            <li class="pillar-item" data-desc="Nhìn nhận rủi ro kỹ thuật từ sớm (leak bộ nhớ, crash nền tảng) trước khi triển khai quy mô lớn.">Thấy rủi ro trước</li>
            <li class="pillar-item" data-desc="Đưa ra quyết định cân nhắc giữa yếu tố kỹ thuật hoàn hảo và ràng buộc thời gian/deadline/nguồn lực.">Cân nhiều ràng buộc</li>
            <li class="pillar-item" data-desc="Đưa quyết định công nghệ sáng suốt ngay cả khi thông tin không đầy đủ hoặc thiếu tài liệu.">Quyết trong bất định</li>
          </ul>
        </div>
        <div class="senior-pillar leadership">
          <div class="pillar-header">👥 LEADERSHIP</div>
          <ul class="pillar-items">
            <li class="pillar-item" data-desc="Mentor và nâng tầm Junior/Mid-level, biến code review thành hoạt động giảng dạy tích cực và an toàn.">Mentor & nâng team</li>
            <li class="pillar-item" data-desc="Giải thích và truyền đạt kỹ thuật phức tạp cho Artist, Designer, PM một cách trực quan, dễ hiểu nhất.">Giao tiếp đa chiều</li>
            <li class="pillar-item" data-desc="Thiết lập coding standard, quy trình CI/CD, chuẩn kiến trúc và dẫn dắt đội ngũ làm theo.">Định chuẩn & dẫn dắt</li>
            <li class="pillar-item" data-desc="Hiểu sâu sản phẩm game, đặt ưu tiên kỹ thuật đi kèm với mục tiêu thương mại và trải nghiệm người dùng.">Business & Product sense</li>
          </ul>
        </div>
      </div>
      <div class="pillar-desc-bubble">Nhấp vào một tiêu chí năng lực để xem chi tiết giải thích...</div>
    </div>
  `;
}

function renderPipelineDiagram() {
  return `
    <div class="interactive-diagram pipeline-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">DevOps CI/CD</span>
        <h3>⚙️ QUY TRÌNH AUTOMATION PIPELINE (CI/CD)</h3>
      </div>
      <div class="pipeline-flow-container">
        <div class="pipeline-flow">
          <div class="pipeline-stage active" data-desc="1. Push: Đẩy code mới hoặc thay đổi lên repository GitHub/GitLab."><span class="stage-status">●</span> Push</div>
          <div class="pipeline-connector"></div>
          <div class="pipeline-stage" data-desc="2. Lint: Tự động chạy tool quét convention code, cảnh báo định dạng sai tiêu chuẩn."><span class="stage-status">○</span> Lint</div>
          <div class="pipeline-connector"></div>
          <div class="pipeline-stage" data-desc="3. Compile: Build thử bằng dòng lệnh, phát hiện ngay các lỗi biên dịch C#."><span class="stage-status">○</span> Compile</div>
          <div class="pipeline-connector"></div>
          <div class="pipeline-stage" data-desc="4. Unit Test: Tự động chạy tất cả unit test logic thuần độc lập cực nhanh."><span class="stage-status">○</span> Unit Test</div>
          <div class="pipeline-connector"></div>
          <div class="pipeline-stage" data-desc="5. Play Test: Chạy các bài test giả lập runtime Unity (kiểm tra va chạm, game loop)."><span class="stage-status">○</span> Play Test</div>
          <div class="pipeline-connector"></div>
          <div class="pipeline-stage" data-desc="6. Build: Tự động build đa nền tảng song song (Android APK, iOS, PC, WebGL)."><span class="stage-status">○</span> Build</div>
          <div class="pipeline-connector"></div>
          <div class="pipeline-stage" data-desc="7. Perf Test: Chạy test đo FPS, draw call, RAM tự động trên thiết bị thật."><span class="stage-status">○</span> Perf Test</div>
          <div class="pipeline-connector"></div>
          <div class="pipeline-stage" data-desc="8. Deploy: Đẩy trực tiếp bản build lên TestFlight, Google Play Console Beta hoặc itch.io."><span class="stage-status">○</span> Deploy</div>
        </div>
      </div>
      <div class="pipeline-action-bar" style="margin-top: 24px; text-align: center;">
        <button class="run-pipeline-btn" style="background: var(--accent-gradient); color: #fff; padding: 10px 20px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px var(--accent-glow);">▶ Chạy Thử Pipeline</button>
      </div>
      <div class="pipeline-desc" style="margin-top: 16px; min-height: 48px;">Nhấp vào một stage để xem vai trò tự động hóa...</div>
    </div>
  `;
}

function renderFrameLifecycleDiagram() {
  return `
    <div class="interactive-diagram frame-lifecycle-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Frame Loop</span>
        <h3>🔄 CHU TRÌNH TỐM TẮT MỘT FRAME</h3>
      </div>
      <div class="frame-flow-container">
        <div class="frame-flow">
          <div class="frame-node active" data-desc="1. Input: Nhận thông điệp phần cứng từ bàn phím, chuột, màn hình cảm ứng.">Input</div>
          <div class="frame-arrow">➔</div>
          <div class="frame-node" data-desc="2. Update(): Gọi logic kịch bản game, đếm thời gian, chạy cooldown mỗi frame.">Update()</div>
          <div class="frame-arrow">➔</div>
          <div class="frame-node" data-desc="3. Physics: Mô phỏng vật lý FixedUpdate(), va chạm trong hệ thống vật lý.">Physics</div>
          <div class="frame-arrow">➔</div>
          <div class="frame-node" data-desc="4. Animation: Cập nhật biến dạng xương, cập nhật chuyển động cho sprite.">Animation</div>
          <div class="frame-arrow">➔</div>
          <div class="frame-node" data-desc="5. LateUpdate(): Xử lý logic bám camera sau khi nhân vật đã di chuyển xong ở Update().">LateUpdate()</div>
          <div class="frame-arrow">➔</div>
          <div class="frame-node text-accent" data-desc="6. Rendering: Gửi thông điệp draw calls đến GPU để vẽ toàn bộ mesh/texture lên màn hình.">Rendering</div>
        </div>
      </div>
      <div class="frame-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào mỗi giai đoạn để xem cách hoạt động...</div>
    </div>
  `;
}

function renderGitTreeDiagram() {
  return `
    <div class="interactive-diagram git-tree-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Git Visual</span>
        <h3>🌿 SƠ ĐỒ NHÁNH CODE (GIT BRANCHING)</h3>
      </div>
      <div class="git-tree-container">
        <div class="git-branch main-branch">
          <span class="git-badge badge-main">main</span>
          <div class="git-commits">
            <span class="git-commit active" data-desc="C1 (Commit 1): Bản build nền móng đầu tiên hoạt động ổn định.">C1</span>
            <span class="git-commit" data-desc="C2 (Commit 2): Merge nhánh feature/inventory sau khi đã review sạch lỗi.">C2</span>
            <span class="git-commit" data-desc="C3 (Commit 3): Merge nhánh bugfix/jump-glitch khẩn cấp sửa lỗi kẹt đất.">C3</span>
          </div>
        </div>
        <div class="git-branch feature-branch">
          <span class="git-badge badge-feature">feature/inventory</span>
          <div class="git-commits">
            <span class="git-commit" data-desc="C4 (Commit 4): Dựng cấu trúc Item dữ liệu thô và cơ sở dữ liệu vật phẩm.">C4</span>
            <span class="git-commit" data-desc="C5 (Commit 5): Hoàn thiện giao diện UI ô chứa đồ và tính năng nhặt đồ.">C5</span>
          </div>
        </div>
        <div class="git-branch bugfix-branch">
          <span class="git-badge badge-bugfix">bugfix/jump-glitch</span>
          <div class="git-commits">
            <span class="git-commit" data-desc="C6 (Commit 6): Sửa lại Ground Check bằng Raycast thay thế cho BoxCollider chạm đất.">C6</span>
          </div>
        </div>
      </div>
      <div class="git-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào một commit (C1, C2...) để xem nội dung cập nhật...</div>
    </div>
  `;
}

function renderDesignLoopDiagram() {
  return `
    <div class="interactive-diagram design-loop-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Design Loop</span>
        <h3>🔄 VÒNG LẶP PROTOTYPE VÀ KIỂM THỬ TRONG GAME DESIGN</h3>
      </div>
      <div class="design-loop">
        <div class="loop-node active" data-desc="Ý TƯỞNG: Nghĩ ra ý tưởng cơ chế gameplay cốt lõi (Core Loop) độc đáo trên giấy.">Ý tưởng</div>
        <div class="loop-arrow">➔</div>
        <div class="loop-node" data-desc="PROTOTYPE: Dựng thật nhanh bằng khối thô (Cube, Sphere) để chơi thử, không cần đồ họa đẹp.">Prototype thô</div>
        <div class="flow-split-container">
          <div class="split-arrow-down">▼</div>
          <div class="loop-node test-node" data-desc="TEST: Chơi thử nhiều lần và mời người ngoài test để trả lời câu hỏi cốt lõi: NÓ CÓ VUI KHÔNG?">Kiểm thử (Test)</div>
          <div class="split-yes-no">
            <div class="split-no" data-desc="❌ KHÔNG VUI: Dũng cảm chỉnh sửa thông số, thay đổi cơ chế hoặc bỏ hẳn ý tưởng để làm cái mới. Tránh tiếc công (sunk cost bias).">❌ Không Vui (Đổi/Bỏ)</div>
            <div class="split-yes" data-desc="✅ VUI: Tiến hành mở rộng thêm màn chơi, thêm art, audio, hoàn thiện UI và sẵn sàng đóng gói phát hành.">✅ Vui (Mở rộng & Ship)</div>
          </div>
        </div>
      </div>
      <div class="design-loop-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào các hộp quy trình để xem chi tiết triết lý làm game...</div>
    </div>
  `;
}

function renderMarketingRoadmapDiagram() {
  return `
    <div class="interactive-diagram marketing-roadmap-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Indie Marketing</span>
        <h3>📢 LỘ TRÌNH TIẾP THỊ GAME (MARKETING TIMELINE)</h3>
      </div>
      <div class="marketing-timeline-steps">
        <div class="m-step active" data-desc="1. Bắt đầu làm game: Tạo cộng đồng sớm, chia sẻ devlog, ảnh chụp GIF cơ chế độc đáo lên Twitter/Reddit để thu hút fan đầu tiên.">
          <div class="m-step-header"><span class="m-step-dot"></span> Bắt đầu làm game</div>
        </div>
        <div class="m-step" data-desc="2. Có Vertical Slice (bản chơi thử đẹp mắt): Lập trang Steam Store ngay, tung teaser trailer, kêu gọi wishlist để đo nhu cầu thị trường.">
          <div class="m-step-header"><span class="m-step-dot"></span> Có Vertical Slice</div>
        </div>
        <div class="m-step" data-desc="3. Giai đoạn Production: Đăng bài đều đặn hàng tuần (#screenshotsaturday), đem game đi dự các hội chợ hoặc Steam Next Fest với bản Demo chất lượng nhất.">
          <div class="m-step-header"><span class="m-step-dot"></span> Production</div>
        </div>
        <div class="m-step" data-desc="4. Trước khi ra mắt (Launch): Gửi key/build chơi thử sớm cho báo chí, YouTuber, streamer nổi bật trước ngày ra mắt khoảng 2 tuần.">
          <div class="m-step-header"><span class="m-step-dot"></span> Trước Launch</div>
        </div>
        <div class="m-step" data-desc="5. Ra mắt (Launch Day): Tận dụng momentum từ wishlist tích lũy, ra mắt kèm sale nhẹ thu hút lượt mua ban đầu để thuật toán Steam đẩy tiếp cận.">
          <div class="m-step-header"><span class="m-step-dot"></span> Launch</div>
        </div>
        <div class="m-step" data-desc="6. Hậu ra mắt (Post-launch): Hỗ trợ cập nhật sửa lỗi nhanh, ra mắt nội dung mới (DLC), duy trì cộng đồng để nuôi wishlist dài lâu.">
          <div class="m-step-header"><span class="m-step-dot"></span> Hậu Launch</div>
        </div>
      </div>
      <div class="marketing-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào từng cột mốc thời gian để xem chỉ dẫn chi tiết...</div>
    </div>
  `;
}

function renderInterviewStepsDiagram() {
  return `
    <div class="interactive-diagram interview-steps-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Tuyển dụng</span>
        <h3>💼 QUY TRÌNH 6 BƯỚC PHỎNG VẤN GAME STUDIO</h3>
      </div>
      <div class="interview-flow">
        <div class="int-step active" data-desc="Bước 1: Duyệt hồ sơ (CV + Portfolio). Portfolio chứa các bản build game chơi được là yếu tố quyết định 80% cơ hội gọi phỏng vấn.">1. Screening</div>
        <div class="int-step" data-desc="Bước 2: Bài test kỹ thuật. Hoàn thiện một mini game Unity theo yêu cầu hoặc giải đề thi thuật toán C# trong 3-7 ngày.">2. Coding Test</div>
        <div class="int-step" data-desc="Bước 3: Phỏng vấn kỹ thuật. Thảo luận sâu kiến thức lập trình C#, Unity lifecycle, cách quản lý bộ nhớ và debug portfolio.">3. Tech Interview</div>
        <div class="int-step" data-desc="Bước 4: Thiết kế hệ thống (Mid+). Thử thách thiết kế cấu trúc cho một hệ thống game lớn (Ví dụ: thiết kế game multiplayer).">4. System Design</div>
        <div class="int-step" data-desc="Bước 5: Culture Fit. Trao đổi cùng HR và PM xem tính cách, cách giao tiếp có phù hợp với văn hóa làm việc của studio.">5. Culture Fit</div>
        <div class="int-step" data-desc="Bước 6: Gặp gỡ ban giám đốc hoặc Tech Director để thảo luận đãi ngộ và trao offer gia nhập studio.">6. Final Round</div>
      </div>
      <div class="interview-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào một bước bất kỳ để xem chi tiết cách chuẩn bị...</div>
    </div>
  `;
}

function renderCareerBranchingDiagram() {
  return `
    <div class="interactive-diagram career-branching-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Career Path</span>
        <h3>🧭 CÁC HƯỚNG PHÁT TRIỂN SỰ NGHIỆP UNITY DEV</h3>
      </div>
      <div class="career-tree">
        <div class="career-level active" data-desc="Junior Dev: Học code sạch, nắm chắc patterns cơ bản, dùng ScriptableObject linh hoạt và tự làm game nhỏ.">Junior</div>
        <div class="career-arrow">➔</div>
        <div class="career-level" data-desc="Mid-Level Dev: Tự tay code module lớn, thiết kế kiến trúc lỏng (DI), tối ưu hiệu năng và làm quen CI/CD.">Mid-Level</div>
        <div class="career-arrow">➔</div>
        <div class="career-level" data-desc="Senior Dev: Quyết định kiến trúc hệ thống, kiểm soát technical debt, tối ưu hệ thống sâu và mentor team.">Senior</div>
        <div class="career-branches">
          <div class="career-branch-line"></div>
          <div class="career-branch-nodes">
            <div class="career-branch-node" data-desc="Tech Lead / Architect / EM: Quản lý kỹ thuật và nhân sự, thiết kế giải pháp công nghệ vĩ mô cho dự án lớn.">⚔️ Tech Lead / EM</div>
            <div class="career-branch-node" data-desc="Staff / Principal Engineer: Đi sâu vào con đường chuyên gia kỹ thuật vĩ đại, giải quyết native crash, platform bugs.">🔬 Staff Specialist</div>
            <div class="career-branch-node" data-desc="Indie Founder: Tự ship game độc lập, tự chủ tài chính sản phẩm và làm chủ toàn bộ vòng đời kinh doanh game.">⛵ Indie Founder</div>
          </div>
        </div>
      </div>
      <div class="career-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào các chức danh để xem hướng đi và trách nhiệm tương ứng...</div>
    </div>
  `;
}

function renderUnityHierarchyDiagram() {
  return `
    <div class="interactive-diagram unity-hierarchy-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Unity Hierarchy</span>
        <h3>🎮 GIẢ LẬP HIERARCHY WINDOW & CẤU TRÚC ENTITY</h3>
      </div>
      <div class="hierarchy-window-wrapper">
        <div class="hierarchy-window">
          <div class="hierarchy-title">📁 Unity Hierarchy View</div>
          <div class="hierarchy-nodes">
            <div class="h-node root-node active" data-desc="Entity: Lớp đối tượng cha trừu tượng cao nhất đại diện cho tất cả vật thể động trong game."><span class="h-toggle">▼</span> 📁 Entity</div>
            <div class="h-node child-node" data-desc="Character: Nhóm nhân vật, kế thừa từ Entity, có thuộc tính lượng máu, trạng thái và tốc độ."><span class="h-toggle">▼</span> 📁 Character</div>
            <div class="h-node grandchild-node" data-desc="Player: Đối tượng nhân vật do người chơi trực tiếp điều khiển qua phím/chuột.">🎮 Player</div>
            <div class="h-node grandchild-node" data-desc="Enemy: Nhóm đối tượng kẻ địch tự động di chuyển do máy tính kiểm soát (AI)."><span class="h-toggle">▼</span> 📁 Enemy</div>
            <div class="h-node great-grandchild-node" data-desc="FlyingEnemy: Loại quái có thể bay lơ lửng trên không trung, bỏ qua va chạm địa hình thấp.">🛸 FlyingEnemy</div>
            <div class="h-node great-grandchild-node" data-desc="SwimmingEnemy: Loại quái bơi lội dưới nước, chịu tác động của lực cản chất lưu.">🐟 SwimmingEnemy</div>
          </div>
        </div>
      </div>
      <div class="hierarchy-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào một GameObject giả lập để xem ý nghĩa kế thừa...</div>
    </div>
  `;
}

function renderPhysicsPipelineDiagram() {
  return `
    <div class="interactive-diagram physics-pipeline-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Physics Loop</span>
        <h3>⚙️ CHU TRÌNH VẬT LÝ TRONG FIXEDUPDATE()</h3>
      </div>
      <div class="physics-flow-list-wrapper">
        <div class="physics-flow-list">
          <div class="p-flow-step active" data-desc="1. FixedUpdate() của bạn: Code C# thêm lực (AddForce) hoặc gán vận tốc (velocity) trực tiếp vào Rigidbody.">
            <span class="p-step-num">1</span>
            <span>FixedUpdate() Code</span>
          </div>
          <div class="p-flow-connector">➔</div>
          <div class="p-flow-step" data-desc="2. Engine di chuyển Rigidbody: Unity Engine tự động tính toán lực cản, ma sát, gia tốc để thay đổi vị trí.">
            <span class="p-step-num">2</span>
            <span>Engine di chuyển</span>
          </div>
          <div class="p-flow-connector">➔</div>
          <div class="p-flow-step" data-desc="3. Phát hiện va chạm (Collision Detection): Engine quét các Collider xem có giao nhau hay xuyên qua nhau không.">
            <span class="p-step-num">3</span>
            <span>Quét va chạm</span>
          </div>
          <div class="p-flow-connector">➔</div>
          <div class="p-flow-step" data-desc="4. Giải quyết va chạm: Tự động tính toán phản lực, đẩy các vật thể đặc ra ngoài nhau để tránh xuyên tường.">
            <span class="p-step-num">4</span>
            <span>Giải quyết đẩy/lực</span>
          </div>
          <div class="p-flow-connector">➔</div>
          <div class="p-flow-step" data-desc="5. Gọi Event va chạm: Trình duyệt Unity gọi các hàm OnCollisionEnter, OnTriggerEnter... trên MonoBehaviour của bạn.">
            <span class="p-step-num">5</span>
            <span>Gọi Event va chạm</span>
          </div>
        </div>
      </div>
      <div class="physics-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào từng bước để theo dõi chi tiết hoạt động của Physics Engine...</div>
    </div>
  `;
}

function renderParentChildDiagram() {
  return `
    <div class="interactive-diagram parent-child-diagram">
      <div class="overview-header" style="margin-bottom: 20px;">
        <span class="diagram-badge">Transform Hierarchy</span>
        <h3>📍 CẤU TRÚC CHA-CON (PARENT-CHILD TRANSFORM)</h3>
      </div>
      <div class="parent-child-box-wrapper">
        <div class="parent-child-box">
          <div class="visual-parent-node active" data-desc="Player (Cha): Đối tượng chính di chuyển trong Scene (Ví dụ X: 10, Y: 5). Nếu Player di chuyển, toàn bộ con sẽ di chuyển theo.">
            <span>👨 Player (Cha)</span>
            <div class="visual-child-node" data-desc="Hand (Con): Tọa độ tương đối so với Cha (Ví dụ X: 1, Y: 0). Hand xoay thì Torch cũng tự động xoay quanh Hand.">
              <span>✋ Hand (Con)</span>
              <div class="visual-grandchild-node" data-desc="Torch (Cháu): Tọa độ tương đối so với Hand (Ví dụ X: 0.5, Y: 0.5). Gắn đuốc vào tay nhân vật cực kỳ đơn giản và tự động.">
                <span>🔥 Torch (Cháu)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="parent-child-desc" style="margin-top: 20px; font-weight: 500;">Nhấp vào các đối tượng (Cha, Con, Cháu) để xem cơ chế di chuyển kế thừa...</div>
    </div>
  `;
}
