#!/usr/bin/env node

/**
 * build-content.js
 * Scans the parent directory for .md files, copies them to public/content/,
 * and generates a content-index.json manifest.
 */

const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────────────────────

const ROOT_DIR = path.resolve(__dirname, '..', '..');       // d:\Code\Road-Map-Unity
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'content');
const INDEX_FILE = path.resolve(__dirname, '..', 'public', 'content-index.json');
const BOOK_SRC_DIR = path.resolve(ROOT_DIR, 'Book');
const BOOK_OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'Book');

const EXCLUDED_DIRS = new Set(['.git', 'node_modules', 'app', '.github', '.vscode', 'dist']);

const SECTION_META = {
  '00-Overview':               { icon: '🧭', title: 'Tổng Quan',              order: 0 },
  '01-Intern':                 { icon: '🌱', title: 'Level 1: Intern',        order: 1 },
  '02-Junior':                 { icon: '🌿', title: 'Level 2: Junior',        order: 2 },
  '03-Mid-Level':              { icon: '🌳', title: 'Level 3: Mid-Level',     order: 3 },
  '04-Senior':                 { icon: '🏔️', title: 'Level 4: Senior',        order: 4 },
  '05-Technical-Deep-Dives':   { icon: '🔬', title: 'Technical Deep Dives',   order: 5 },
  '06-Indie-Track':            { icon: '🎨', title: 'Indie Track',            order: 6 },
  '07-Interview-and-Portfolio': { icon: '💼', title: 'Interview & Portfolio',  order: 7 },
  '08-Knowledge-Base':         { icon: '📚', title: 'Knowledge Base',         order: 8 },
};

const SUBSECTION_META = {
  'intern': { icon: '🌱', title: 'Intern Level' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the first H1 title from markdown content.
 * Falls back to a humanized version of the filename.
 */
function extractTitle(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  // Fallback: humanize filename
  return filename
    .replace(/\.md$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Count checkbox items in markdown content.
 * Matches both `- [ ]` (unchecked) and `- [x]` (checked).
 */
function countCheckboxes(content) {
  const unchecked = (content.match(/- \[ \]/g) || []).length;
  const checked = (content.match(/- \[x\]/gi) || []).length;
  return { total: unchecked + checked, checked };
}

/**
 * Build a file entry object from a markdown file path.
 */
function buildFileEntry(absolutePath, relativePath) {
  if (!fs.existsSync(absolutePath)) {
    return null; // Skip missing files (e.g., coroutine.md)
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const filename = path.basename(relativePath);
  const id = filename.replace(/\.md$/i, '');
  const title = extractTitle(content, filename);
  const { total: checkboxCount, checked: checkedCount } = countCheckboxes(content);

  return {
    id,
    title,
    path: relativePath.replace(/\\/g, '/'),
    checkboxCount,
    checkedCount,
  };
}

/**
 * Recursively clean and recreate a directory.
 */
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Copy a file, creating destination directories as needed.
 */
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// ─── Main Build Logic ────────────────────────────────────────────────────────

function build() {
  console.log('🔨 Building content index...');
  console.log(`   Root: ${ROOT_DIR}`);
  console.log(`   Output: ${OUTPUT_DIR}`);

  // Clean output directory
  cleanDir(OUTPUT_DIR);

  const sections = [];
  let totalFiles = 0;

  // ── Handle root README.md ──────────────────────────────────────────────
  const rootReadme = path.join(ROOT_DIR, 'README.md');
  if (fs.existsSync(rootReadme)) {
    const entry = buildFileEntry(rootReadme, 'README.md');
    if (entry) {
      copyFile(rootReadme, path.join(OUTPUT_DIR, 'README.md'));
      sections.push({
        id: 'home',
        title: 'Trang Chủ',
        icon: '🏠',
        order: -1,
        files: [entry],
        subsections: [],
      });
      totalFiles++;
    }
  }

  // ── Scan section directories ───────────────────────────────────────────
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (EXCLUDED_DIRS.has(entry.name)) continue;

    const sectionName = entry.name;
    const sectionDir = path.join(ROOT_DIR, sectionName);
    const meta = SECTION_META[sectionName];

    if (!meta) {
      console.warn(`   ⚠ Unknown section: ${sectionName}, skipping.`);
      continue;
    }

    const section = {
      id: sectionName,
      title: meta.title,
      icon: meta.icon,
      order: meta.order,
      files: [],
      subsections: [],
    };

    // Read .md files in section root
    const sectionEntries = fs.readdirSync(sectionDir, { withFileTypes: true });

    for (const fileEntry of sectionEntries) {
      if (fileEntry.isFile() && fileEntry.name.endsWith('.md')) {
        const relativePath = path.join(sectionName, fileEntry.name);
        const absolutePath = path.join(sectionDir, fileEntry.name);
        const fileObj = buildFileEntry(absolutePath, relativePath);
        if (fileObj) {
          copyFile(absolutePath, path.join(OUTPUT_DIR, relativePath));
          section.files.push(fileObj);
          totalFiles++;
        }
      }
    }

    // Sort files: README first, then alphabetically
    section.files.sort((a, b) => {
      if (a.id === 'README') return -1;
      if (b.id === 'README') return 1;
      return a.id.localeCompare(b.id);
    });

    // Read subdirectories as subsections
    for (const subEntry of sectionEntries) {
      if (!subEntry.isDirectory()) continue;
      if (EXCLUDED_DIRS.has(subEntry.name)) continue;

      const subName = subEntry.name;
      const subDir = path.join(sectionDir, subName);
      const subMeta = SUBSECTION_META[subName] || {
        icon: meta.icon,
        title: subName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      };

      const subsection = {
        id: subName,
        title: subMeta.title,
        icon: subMeta.icon,
        files: [],
      };

      const subFiles = fs.readdirSync(subDir, { withFileTypes: true });
      for (const sf of subFiles) {
        if (sf.isFile() && sf.name.endsWith('.md')) {
          const relativePath = path.join(sectionName, subName, sf.name);
          const absolutePath = path.join(subDir, sf.name);
          const fileObj = buildFileEntry(absolutePath, relativePath);
          if (fileObj) {
            copyFile(absolutePath, path.join(OUTPUT_DIR, relativePath));
            subsection.files.push(fileObj);
            totalFiles++;
          }
        }
      }

      // Sort subsection files: README first, then alphabetically
      subsection.files.sort((a, b) => {
        if (a.id === 'README') return -1;
        if (b.id === 'README') return 1;
        return a.id.localeCompare(b.id);
      });

      if (subsection.files.length > 0) {
        section.subsections.push(subsection);
      }
    }

    sections.push(section);
  }

  // Sort sections by order
  sections.sort((a, b) => a.order - b.order);

  // ── Scan Book Directory ────────────────────────────────────────────────
  const books = {};
  let totalBooks = 0;
  if (fs.existsSync(BOOK_SRC_DIR)) {
    console.log('📚 Scanning books directory...');
    cleanDir(BOOK_OUTPUT_DIR);
    const categories = fs.readdirSync(BOOK_SRC_DIR, { withFileTypes: true });
    
    for (const cat of categories) {
      if (!cat.isDirectory()) continue;
      
      const catName = cat.name;
      const catDir = path.join(BOOK_SRC_DIR, catName);
      books[catName] = [];
      
      const files = fs.readdirSync(catDir, { withFileTypes: true });
      for (const file of files) {
        if (file.isFile() && file.name.toLowerCase().endsWith('.pdf')) {
          const relativeDestPath = path.join(catName, file.name);
          const absoluteDest = path.join(BOOK_OUTPUT_DIR, relativeDestPath);
          copyFile(path.join(catDir, file.name), absoluteDest);
          
          // Humanize title
          const title = file.name
            .replace(/\.pdf$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
            
          const stats = fs.statSync(path.join(catDir, file.name));
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(1) + ' MB';
          
          books[catName].push({
            id: file.name.replace(/\.pdf$/i, ''),
            title: title,
            path: `Book/${catName}/${file.name}`.replace(/\\/g, '/'),
            size: sizeMB
          });
          totalBooks++;
        }
      }
      
      // Sort books within category alphabetically
      books[catName].sort((a, b) => a.title.localeCompare(b.title));
    }
  } else {
    console.warn(`   ⚠ Book directory not found at: ${BOOK_SRC_DIR}`);
  }

  // ── Write content-index.json ───────────────────────────────────────────
  const index = { sections, books };
  const indexDir = path.dirname(INDEX_FILE);
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');

  // ── Copy unity-docs-map.json ───────────────────────────────────────────
  const mapSrc = path.resolve(ROOT_DIR, '08-Knowledge-Base', 'unity-docs-map.json');
  const mapDest = path.resolve(__dirname, '..', 'public', 'unity-docs-map.json');
  if (fs.existsSync(mapSrc)) {
    fs.copyFileSync(mapSrc, mapDest);
    console.log(`   📄 Copied unity-docs-map.json to public/unity-docs-map.json`);
  }

  console.log(`   ✅ Built index with ${sections.length} sections, ${totalFiles} markdown files.`);
  console.log(`   📚 Scanned ${totalBooks} books across ${Object.keys(books).length} categories.`);
  console.log(`   📄 ${INDEX_FILE}`);
}

// ── Run ──────────────────────────────────────────────────────────────────────
build();
