/**
 * skilltree.js
 * Renders an interactive RPG-style Skill Tree using pure SVG and Vanilla JS.
 */

export function initSkillTree(contentIndex) {
  const container = document.getElementById('interactive-skill-tree');
  if (!container) return;

  // Define nodes and coordinates in the SVG viewport (800x400)
  const nodes = [
    {
      id: 'overview',
      title: 'Tổng Quan Lộ Trình',
      icon: '🧭',
      x: 80,
      y: 200,
      path: '00-Overview/README',
      level: 'Overview',
      desc: 'Giới thiệu lộ trình & tự đánh giá năng lực'
    },
    {
      id: 'intern',
      title: '🌱 Level 1: Intern',
      icon: '🌱',
      x: 240,
      y: 200,
      path: '01-Intern/README',
      level: 'Level 1',
      desc: 'Nền tảng C# cơ bản và làm quen Unity Editor'
    },
    {
      id: 'kb',
      title: 'Knowledge Base',
      icon: '📚',
      x: 240,
      y: 340,
      path: '08-Knowledge-Base/README',
      level: 'Tài liệu bổ trợ',
      desc: 'Kho kiến thức chuyên đề sâu cho Intern'
    },
    {
      id: 'junior',
      title: '🌿 Level 2: Junior',
      icon: '🌿',
      x: 420,
      y: 200,
      path: '02-Junior/README',
      level: 'Level 2',
      desc: 'UI, Physics, Core Systems và hoàn thiện dự án đầu tay'
    },
    {
      id: 'tech',
      title: 'Technical Deep Dives',
      icon: '🔬',
      x: 420,
      y: 60,
      path: '05-Technical-Deep-Dives/README',
      level: 'Chuyên đề sâu',
      desc: 'Kiến trúc phần mềm, quản lý bộ nhớ và tối ưu game'
    },
    {
      id: 'mid',
      title: '🌳 Level 3: Mid-Level',
      icon: '🌳',
      x: 600,
      y: 200,
      path: '03-Mid-Level/README',
      level: 'Level 3',
      desc: 'Tối ưu hiệu năng, cấu trúc modular và lập trình Multiplayer'
    },
    {
      id: 'indie',
      title: 'Indie Track',
      icon: '🎨',
      x: 600,
      y: 60,
      path: '06-Indie-Track/README',
      level: 'Nhánh độc lập',
      desc: 'Thiết kế game, Production, ASO và Marketing phát hành'
    },
    {
      id: 'senior',
      title: '🏔️ Level 4: Senior',
      icon: '🏔️',
      x: 760,
      y: 200,
      path: '04-Senior/README',
      level: 'Level 4',
      desc: 'Kiến trúc hệ thống lớn, quản trị kỹ thuật và phát triển team'
    },
    {
      id: 'interview',
      title: 'Interview & Portfolio',
      icon: '💼',
      x: 760,
      y: 340,
      path: '07-Interview-and-Portfolio/README',
      level: 'Sự nghiệp',
      desc: 'Chuẩn bị CV, xây dựng Portfolio và kỹ năng phỏng vấn'
    }
  ];

  // Define connections (links) with curved paths
  const links = [
    { from: 'overview', to: 'intern' },
    { from: 'intern', to: 'kb', type: 'curve-down' },
    { from: 'intern', to: 'junior' },
    { from: 'junior', to: 'tech', type: 'curve-up' },
    { from: 'junior', to: 'mid' },
    { from: 'mid', to: 'indie', type: 'curve-up' },
    { from: 'mid', to: 'senior' },
    { from: 'senior', to: 'interview', type: 'curve-down' }
  ];

  // Build SVG Content
  let svgHtml = `
    <svg viewBox="0 0 840 400" class="skill-tree-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradients for glowing paths -->
        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.8" />
          <stop offset="100%" stop-color="var(--accent-light)" stop-opacity="0.8" />
        </linearGradient>
        
        <!-- Drop shadow filter for nodes -->
        <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>
        </filter>
        <filter id="glow-filter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- 1. Render Connections (Lines) -->
      <g class="skill-tree-links">
  `;

  links.forEach(link => {
    const fromNode = nodes.find(n => n.id === link.from);
    const toNode = nodes.find(n => n.id === link.to);
    if (!fromNode || !toNode) return;

    let pathD = '';
    
    // Draw Bezier curves based on connection type
    if (link.type === 'curve-up') {
      const ctrlX1 = fromNode.x + 60;
      const ctrlY1 = fromNode.y;
      const ctrlX2 = toNode.x - 60;
      const ctrlY2 = toNode.y;
      pathD = `M ${fromNode.x} ${fromNode.y} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${toNode.x} ${toNode.y}`;
    } else if (link.type === 'curve-down') {
      const ctrlX1 = fromNode.x + 60;
      const ctrlY1 = fromNode.y;
      const ctrlX2 = toNode.x - 60;
      const ctrlY2 = toNode.y;
      pathD = `M ${fromNode.x} ${fromNode.y} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${toNode.x} ${toNode.y}`;
    } else {
      // Horizontal straight link
      pathD = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
    }

    svgHtml += `
      <!-- Base glowing shadow path -->
      <path d="${pathD}" class="tree-link-glow" />
      <!-- Main visible path -->
      <path d="${pathD}" class="tree-link" />
      <!-- Flowing energy dots path -->
      <path d="${pathD}" class="tree-link-energy" />
    `;
  });

  svgHtml += `
      </g>
      
      <!-- 2. Render Nodes -->
      <g class="skill-tree-nodes">
  `;

  nodes.forEach(node => {
    const isActive = node.id === 'overview' || node.id === 'intern'; // Highlight initial nodes
    const nodeClass = `tree-node ${isActive ? 'active' : ''}`;
    
    svgHtml += `
      <g class="${nodeClass}" transform="translate(${node.x}, ${node.y})" data-path="${node.path}" data-title="${node.title}" data-level="${node.level}" data-desc="${node.desc}">
        <!-- Outer Glowing Ring -->
        <circle r="26" class="node-glow-ring" />
        <!-- Node Circle Base -->
        <circle r="22" class="node-circle" filter="url(#node-shadow)" />
        <!-- Node Icon/Emoji -->
        <text y="6" class="node-icon">${node.icon}</text>
        
        <!-- Node Label -->
        <g class="node-label-group">
          <!-- Text Background Pill -->
          <rect x="-65" y="32" width="130" height="24" rx="12" class="node-label-bg" />
          <text y="48" class="node-label-text">${node.title.replace(/Level \d+:\s*/, '')}</text>
        </g>
      </g>
    `;
  });

  svgHtml += `
      </g>
    </svg>
    
    <!-- Detail Drawer Card -->
    <div class="skill-detail-drawer" id="skill-detail-drawer">
      <button class="drawer-close-btn" id="drawer-close">&times;</button>
      <div class="drawer-header">
        <span class="drawer-badge" id="drawer-badge">Level 1</span>
        <h3 id="drawer-title">Node Title</h3>
      </div>
      <div class="drawer-body">
        <p id="drawer-desc">Description of node...</p>
        <a href="#/" class="drawer-action-btn" id="drawer-link-btn">Vào Học Ngay</a>
      </div>
    </div>
  `;

  container.innerHTML = svgHtml;

  // Add event listeners for interaction
  const treeNodes = container.querySelectorAll('.tree-node');
  const drawer = document.getElementById('skill-detail-drawer');
  const dTitle = document.getElementById('drawer-title');
  const dBadge = document.getElementById('drawer-badge');
  const dDesc = document.getElementById('drawer-desc');
  const dLink = document.getElementById('drawer-link-btn');
  const dClose = document.getElementById('drawer-close');

  treeNodes.forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const title = node.dataset.title;
      const level = node.dataset.level;
      const desc = node.dataset.desc;
      const path = node.dataset.path;

      // Populate drawer
      dTitle.textContent = title;
      dBadge.textContent = level;
      dDesc.textContent = desc;
      dLink.href = `#/${path}`;

      // Open drawer
      drawer.classList.add('open');

      // Highlight clicked node
      treeNodes.forEach(n => n.classList.remove('selected'));
      node.classList.add('selected');
    });
  });

  // Close drawer
  if (dClose) {
    dClose.addEventListener('click', () => {
      drawer.classList.remove('open');
      treeNodes.forEach(n => n.classList.remove('selected'));
    });
  }

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (drawer && drawer.classList.contains('open') && !drawer.contains(e.target) && !e.target.closest('.tree-node')) {
      drawer.classList.remove('open');
      treeNodes.forEach(n => n.classList.remove('selected'));
    }
  });
}
