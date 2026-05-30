/**
 * toc.js
 * Generates the right-side Table of Contents and implements Scrollspy.
 */

let scrollspyActive = false;
let currentScrollHandler = null;

export function initTOC(currentPath) {
  const contentEl = document.getElementById('content');
  const rightToc = document.getElementById('right-toc');
  const tocNav = document.getElementById('toc-nav');
  const contentWrapper = document.querySelector('.content-wrapper');

  if (!contentEl || !rightToc || !tocNav || !contentWrapper) return;

  // Cleanup existing scroll listener
  if (currentScrollHandler) {
    contentWrapper.removeEventListener('scroll', currentScrollHandler);
    currentScrollHandler = null;
  }

  // Hide TOC on home page, error pages, or book reader
  if (currentPath === 'README.md' || currentPath.startsWith('book/read/') || document.body.classList.contains('reader-active')) {
    rightToc.style.display = 'none';
    return;
  }

  // Find all h2 and h3 elements
  const headings = Array.from(contentEl.querySelectorAll('h2, h3'));

  if (headings.length === 0) {
    rightToc.style.display = 'none';
    return;
  }

  // Show TOC
  rightToc.style.display = 'block';

  // Build TOC links
  const currentPathWithoutMd = currentPath.replace(/\.md$/, '');
  let tocHtml = '';

  headings.forEach((heading, idx) => {
    // Generate id if not present
    if (!heading.id) {
      heading.id = `heading-${idx}`;
    }

    const title = heading.innerText || heading.textContent;
    // Remove difficulty badges text from TOC
    let displayTitle = title
      .replace(/Beginner|Intermediate|Advanced/gi, '')
      .trim();

    const depthClass = heading.tagName.toLowerCase() === 'h2' ? 'toc-h2' : 'toc-h3';
    tocHtml += `<a href="#/${currentPathWithoutMd}#${heading.id}" class="toc-link ${depthClass}" data-target="${heading.id}">${displayTitle}</a>`;
  });

  tocNav.innerHTML = tocHtml;

  // Add click listener for smooth scrolling
  const tocLinks = tocNav.querySelectorAll('.toc-link');
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        // Update hash without triggering router reload if possible, or just scroll
        const href = link.getAttribute('href');
        history.pushState(null, null, href);
        
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight active link immediately
        tocLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // Scrollspy logic
  function scrollspyHandler() {
    const scrollPos = contentWrapper.scrollTop + 100; // offset for topbar and breathing room
    let activeHeadingId = null;

    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      // Get offsetTop relative to content-wrapper
      const offsetTop = heading.offsetTop;
      
      if (offsetTop <= scrollPos) {
        activeHeadingId = heading.id;
      } else {
        break; // elements are ordered, so we can stop
      }
    }

    // Fallback to first heading if not scrolled down enough
    if (!activeHeadingId && headings.length > 0) {
      activeHeadingId = headings[0].id;
    }

    // Update active class on links
    tocLinks.forEach(link => {
      if (link.dataset.target === activeHeadingId) {
        link.classList.add('active');
        
        // Scroll TOC link into view if needed (TOC itself is scrollable)
        const containerHeight = rightToc.clientHeight;
        const linkOffsetTop = link.offsetTop;
        const linkHeight = link.clientHeight;
        
        if (linkOffsetTop < rightToc.scrollTop) {
          rightToc.scrollTop = linkOffsetTop;
        } else if (linkOffsetTop + linkHeight > rightToc.scrollTop + containerHeight) {
          rightToc.scrollTop = linkOffsetTop + linkHeight - containerHeight;
        }
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Run once initially
  scrollspyHandler();

  // Bind scroll handler
  contentWrapper.addEventListener('scroll', scrollspyHandler);
  currentScrollHandler = scrollspyHandler;
}
