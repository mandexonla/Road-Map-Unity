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
