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
    // Handle tokens passed as text
    const linkText = typeof text === 'string' ? text : '';
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';

    if (!href) return `<a${titleAttr}>${linkText}</a>`;

    // Relative .md links → hash routes
    if ((href.startsWith('./') || href.startsWith('../')) && href.endsWith('.md')) {
      const resolved = resolveRelativePath(currentFilePath, href);
      const hashRoute = '#/' + resolved.replace(/\.md$/, '');
      return `<a href="${hashRoute}"${titleAttr}>${linkText}</a>`;
    }

    // External links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener"${titleAttr}>${linkText}</a>`;
    }

    // Default
    return `<a href="${escapeHtml(href)}"${titleAttr}>${linkText}</a>`;
  };

  // ── Headings → with id slugs and difficulty badges ───────────
  renderer.heading = function ({ text, depth }) {
    const headingText = typeof text === 'string' ? text : '';
    const slug = slugify(headingText);

    if (depth === 1) {
      let badge = '';
      let displayText = headingText;

      if (headingText.includes('🟢')) {
        badge = '<span class="difficulty-badge beginner">Beginner</span>';
        displayText = headingText.replace('🟢', '').trim();
      } else if (headingText.includes('🟡')) {
        badge = '<span class="difficulty-badge intermediate">Intermediate</span>';
        displayText = headingText.replace('🟡', '').trim();
      } else if (headingText.includes('🔴')) {
        badge = '<span class="difficulty-badge advanced">Advanced</span>';
        displayText = headingText.replace('🔴', '').trim();
      }

      return `<h1 id="${slug}">${displayText}${badge}</h1>`;
    }

    return `<h${depth} id="${slug}">${headingText}</h${depth}>`;
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
  return marked.parse(mdContent);
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
  if (code.includes('UNITY DEVELOPER') && code.includes('Gameplay')) {
    return renderCareerPathsDiagram();
  }
  if (code.includes('TECHNICAL DEEP DIVES') && code.includes('Nền tảng')) {
    return renderTechnicalDivesDiagram();
  }
  if (code.includes('MANAGED MEMORY') && code.includes('NATIVE MEMORY')) {
    return renderMemoryDiagram();
  }
  if (code.includes('MỘT GAME INDIE THÀNH CÔNG')) {
    return renderIndiePillarsDiagram();
  }
  if (code.includes('GameObject "Player"')) {
    return renderInspectorDiagram();
  }
  if (code.includes('MỘT FRAME')) {
    return renderLifecycleDiagram();
  }
  return null;
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
