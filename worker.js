// ============================================================================
// worker.js — README SVG generators (Fully Upgraded)
// ============================================================================

const T = {
  bg:     '#0D0221',
  border: '#FF00E5',
  title:  '#00F5FF',
  text:   '#E0E0FF',
  sub:    '#B0B0D0',
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const truncate = (s, n) => {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};

const wrap = (body, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const frame = (body, w = 495, h = 195) =>
  wrap(
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="6" fill="${T.bg}" stroke="${T.border}"/>${body}`,
    w, h
  );

// ---------------------------------------------------------------------------
// 1. Capsule header (Animated Wave)
// ---------------------------------------------------------------------------
export function capsuleSVG({ text = 'Hello', color1 = '#FF00E5', color2 = '#00F5FF', height = 140, fontSize = 40 } = {}) {
  const W = 1200;
  const h = Math.min(Math.max(height, 60), 400);
  const p1x = W * 0.25, p2x = W * 0.5;
  const endY = h * 0.45;
  const deep = `M0,${h * 0.4} C${p1x},${h * 0.85} ${p2x},${h * 0.1} ${W},${endY} L${W},${h} L0,${h} Z`;
  const flat = `M0,${h * 0.4} C${p1x},${h * 0.7} ${p2x},${h * 0.25} ${W},${endY} L${W},${h} L0,${h} Z`;
  return wrap(
    `<defs>
       <linearGradient id="g" x1="0" x2="1">
         <stop offset="0" stop-color="${color1}"/>
         <stop offset="1" stop-color="${color2}"/>
       </linearGradient>
     </defs>
     <path fill="url(#g)">
       <animate attributeName="d" dur="6s" repeatCount="indefinite" values="${deep};${flat};${deep}"/>
     </path>
     <text x="${W / 2}" y="${h * 0.5}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="700" fill="#FFFFFF" dominant-baseline="middle">${esc(text)}</text>`,
    W, h
  );
}

// ---------------------------------------------------------------------------
// 2. Typing SVG (Animated via SMIL)
// ---------------------------------------------------------------------------
export function typingSVG({ text = 'Hello, World!', color = '#00F5FF', size = 22 } = {}) {
  const lines = Array.isArray(text) ? text : [text];
  const W = 620;
  const lineH = size + 8;
  const H = lineH * lines.length + 16;
  const textEls = lines
    .map((l, i) => {
      const x = 10;
      const y = (i + 1) * lineH;
      const w = l.length * size * 0.6;
      return `<text x="${x}" y="${y}" font-family="ui-monospace,Menlo,monospace" font-size="${size}" font-weight="600" fill="${color}" clip-path="url(#clip${i})">${esc(l)}</text>
        <clipPath id="clip${i}">
          <rect x="${x}" y="${y - size}" width="0" height="${size * 1.4}">
            <animate attributeName="width" values="0;${w};${w};0" keyTimes="0;0.4;0.9;1" dur="4s" begin="${i * 0.8}s" repeatCount="indefinite"/>
          </rect>
        </clipPath>`;
    }).join('');
  const cursorX = 10 + Math.max(...lines.map((l) => l.length)) * size * 0.6;
  return wrap(
    `${textEls}
     <rect x="${cursorX}" y="4" width="2" height="${size * 1.3}" fill="${color}">
       <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.5;0.5;0.55;1" dur="1s" repeatCount="indefinite"/>
     </rect>`, W, H
  );
}

// ---------------------------------------------------------------------------
// 3. Shields-style badge & Row
// ---------------------------------------------------------------------------
export function badgeSVG({ label, value, color = T.border } = {}) {
  const cw = 6.5, pad = 12, h = 20;
  const lw = Math.round(label.length * cw) + pad * 2;
  const vw = Math.round(value.length * cw) + pad * 2;
  const w = lw + vw;
  return wrap(
    `<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
     <clipPath id="r"><rect width="${w}" height="${h}" rx="3"/></clipPath>
     <g clip-path="url(#r)"><rect width="${lw}" height="${h}" fill="#555"/><rect x="${lw}" width="${vw}" height="${h}" fill="${color}"/><rect width="${w}" height="${h}" fill="url(#s)"/></g>
     <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11">
       <text x="${lw / 2}" y="14">${esc(label)}</text><text x="${lw + vw / 2}" y="14">${esc(value)}</text>
     </g>`, w, h
  );
}

export function badgeRowSVG({ badges = [] } = {}) {
  const gap = 6; let parts = []; let x = 0; let maxH = 0;
  for (const b of badges) {
    const svg = badgeSVG(b);
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    const w = +m[1], h = +m[2];
    maxH = Math.max(maxH, h);
    const inner = svg.replace(/^<svg[^>]*>|<\/svg>$/g, '');
    parts.push(`<g transform="translate(${x},0)">${inner}</g>`);
    x += w + gap;
  }
  return wrap(parts.join(''), Math.max(x - gap, 1), maxH);
}

// ---------------------------------------------------------------------------
// 4. Tech-stack icon grid
// ---------------------------------------------------------------------------
const ICONS = {
  js: ['#F7DF1E', '#000', 'JS'], ts: ['#3178C6', '#fff', 'TS'], py: ['#3776AB', '#FFD43B', 'Py'],
  kotlin: ['#7F52FF', '#fff', 'Kt'], java: ['#ED8B00', '#fff', 'Ja'], c: ['#A8B9CC', '#000', 'C'],
  html: ['#E34F26', '#fff', 'H5'], css: ['#1572B6', '#fff', 'C3'], node: ['#339933', '#fff', 'Nd'],
  express: ['#000000', '#fff', 'Ex'], react: ['#61DAFB', '#000', 'Re'], next: ['#000000', '#fff', 'Nx'],
  tailwind: ['#06B6D4', '#fff', 'Tw'], socketio: ['#010101', '#fff', 'So'], fastapi: ['#009688', '#fff', 'Fa'],
  flask: ['#000000', '#fff', 'Fl'], compose: ['#4285F4', '#fff', 'Jc'], pytorch: ['#EE4C2C', '#fff', 'Pt'],
  sklearn: ['#F7931E', '#fff', 'Sk'], opencv: ['#5C3EE8', '#fff', 'Cv'], chartjs: ['#FF6384', '#fff', 'Ch'],
  git: ['#F05032', '#fff', 'Gt'], docker: ['#2496ED', '#fff', 'Dk'], vite: ['#646CFF', '#fff', 'Vi'],
  gradle: ['#02303A', '#fff', 'Gr'], render: ['#46E3B7', '#000', 'Rn'], vercel: ['#000000', '#fff', 'Vc'],
  ghpages: ['#222222', '#fff', 'GP'], colab: ['#F9AB00', '#000', 'Co'], jupyter: ['#F37626', '#fff', 'Ju'],
  ollama: ['#000000', '#fff', 'Ol'], pg: ['#4169E1', '#fff', 'Pg'], sqlite: ['#003B57', '#fff', 'Sq'],
};

export function iconsSVG({ names = [], size = 48, gap = 10, perRow = 8 } = {}) {
  const cols = Math.min(perRow, Math.max(names.length, 1));
  const rows = Math.ceil(names.length / cols);
  const W = cols * size + (cols - 1) * gap;
  const H = rows * size + (rows - 1) * gap;
  const parts = names.map((name, i) => {
    const def = ICONS[name] || ['#333', '#fff', name.slice(0, 2)];
    const x = (i % cols) * (size + gap), y = Math.floor(i / cols) * (size + gap);
    return `<g transform="translate(${x},${y})"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.14)}" fill="${def[0]}"/>
      <text x="${size / 2}" y="${size * 0.62}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.round(size * 0.36)}" font-weight="700" fill="${def[1]}">${esc(def[2])}</text></g>`;
  });
  return wrap(parts.join(''), W, H);
}

// ---------------------------------------------------------------------------
// 5. Repo pin card
// ---------------------------------------------------------------------------
const LANG_COLORS = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Kotlin: '#A97BFF', Java: '#b07219', C: '#555555', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', 'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584' };

export function pinSVG({ repo } = {}) {
  const w = 400, h = 130;
  if (!repo) return wrap(`<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="6" fill="${T.bg}" stroke="${T.border}"/><text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" font-family="system-ui" font-size="13" fill="${T.sub}">Repo not found</text>`, w, h);
  const lang = repo.language || 'Unknown', langColor = LANG_COLORS[lang] || '#858585';
  return wrap(
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="6" fill="${T.bg}" stroke="${T.border}"/>
     <text x="20" y="32" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${T.title}">${esc(truncate(repo.name, 28))}</text>
     <text x="20" y="58" font-family="system-ui,sans-serif" font-size="12" fill="${T.text}">${esc(truncate(repo.description || 'No description', 56))}</text>
     <circle cx="26" cy="94" r="5" fill="${langColor}"/><text x="38" y="98" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">${esc(lang)}</text>
     <text x="170" y="98" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">★ ${repo.stargazers_count}</text>
     <text x="240" y="98" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">⑂ ${repo.forks_count}</text>`, w, h
  );
}

// ---------------------------------------------------------------------------
// 6. Stats Card (With GitHub Logo)
// ---------------------------------------------------------------------------
export function statsSVG({ user, repos } = {}) {
  if (!user) return frame(`<text x="25" y="110" fill="${T.sub}" font-family="system-ui">user unavailable</text>`);
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);
  return frame(
    `<text x="25" y="36" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${T.title}">${esc(user.login)}'s GitHub Stats</text>
     <g font-family="system-ui,sans-serif" font-size="14" fill="${T.text}">
       <text x="25" y="72">★  Stars</text><text x="240" y="72" fill="${T.title}" text-anchor="end">${stars}</text>
       <text x="25" y="96">⑂  Forks</text><text x="240" y="96" fill="${T.title}" text-anchor="end">${forks}</text>
       <text x="25" y="120">■  Public repos</text><text x="240" y="120" fill="${T.title}" text-anchor="end">${user.public_repos}</text>
       <text x="25" y="144">●  Followers</text><text x="240" y="144" fill="${T.title}" text-anchor="end">${user.followers}</text>
     </g>
     <line x1="260" y1="55" x2="260" y2="155" stroke="${T.border}" stroke-opacity=".3"/>
     <g font-family="system-ui,sans-serif" font-size="14" fill="${T.text}">
       <text x="280" y="72">◆  Following</text><text x="400" y="72" fill="${T.title}" text-anchor="end">${user.following}</text>
       <text x="280" y="96">✦  Gists</text><text x="400" y="96" fill="${T.title}" text-anchor="end">${user.public_gists}</text>
       <text x="280" y="120">◐  Account age</text><text x="400" y="120" fill="${T.title}" text-anchor="end">${Math.floor((Date.now() - new Date(user.created_at).getTime()) / (365.25 * 86400000))}y</text>
       <text x="280" y="144">▲  Repos (all)</text><text x="400" y="144" fill="${T.title}" text-anchor="end">${user.public_repos + (user.total_private_repos || 0)}</text>
     </g>
     <g transform="translate(415, 85)" fill="${T.border}">
       <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
     </g>`
  );
}

// ---------------------------------------------------------------------------
// 7. Summary Card (With Languages Bar Chart)
// ---------------------------------------------------------------------------
export function summarySVG({ user, days, languages = [] } = {}) {
  if (!user || !days) return frame(`<text x="25" y="110" fill="${T.sub}" font-family="system-ui">data unavailable</text>`);
  const total = days.reduce((s, d) => s + d.contributionCount, 0);
  const topLangs = languages.slice(0, 4);
  const langTotal = topLangs.reduce((s, l) => s + l.size, 0);
  
  let barX = 280;
  let barSvg = '';
  const barW = 190;
  topLangs.forEach(l => {
    const w = Math.max(4, (l.size / langTotal) * barW);
    barSvg += `<rect x="${barX}" y="90" width="${w}" height="12" fill="${l.color || '#858585'}"/>`;
    barX += w;
  });
  
  const legend = topLangs.map((l, i) => 
    `<circle cx="290" cy="${125 + i*18}" r="5" fill="${l.color || '#858585'}"/>
     <text x="305" y="${129 + i*18}" font-family="system-ui,sans-serif" font-size="12" fill="${T.text}">${esc(l.name)}</text>
     <text x="470" y="${129 + i*18}" text-anchor="end" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">${((l.size/langTotal)*100).toFixed(1)}%</text>`
  ).join('');

  return frame(
    `<text x="25" y="36" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${T.title}">${esc(user.login)} · Summary</text>
     <g font-family="system-ui,sans-serif" font-size="14" fill="${T.text}">
       <text x="25" y="72">📅  Contributions</text><text x="240" y="72" text-anchor="end" fill="${T.title}">${total}</text>
       <text x="25" y="96">🗓  Active days</text><text x="240" y="96" text-anchor="end" fill="${T.title}">${days.filter((d) => d.contributionCount > 0).length}</text>
       <text x="25" y="120">📦  Repositories</text><text x="240" y="120" text-anchor="end" fill="${T.title}">${user.public_repos}</text>
       <text x="25" y="144">👥  Followers</text><text x="240" y="144" text-anchor="end" fill="${T.title}">${user.followers}</text>
     </g>
     <line x1="260" y1="55" x2="260" y2="155" stroke="${T.border}" stroke-opacity=".3"/>
     <text x="280" y="72" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">Top Languages</text>
     ${barSvg}
     ${legend}`,
    495, 195
  );
}

// ---------------------------------------------------------------------------
// 8. Streak Card (With Ring)
// ---------------------------------------------------------------------------
export function streakSVG({ user, days } = {}) {
  if (!user || !days) return frame(`<text x="25" y="80" fill="${T.sub}" font-family="system-ui">data unavailable</text>`, 495, 155);
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let run = 0, longest = 0;
  for (const d of sorted) {
    if (d.contributionCount > 0) { run++; if (run > longest) longest = run; } else run = 0;
  }
  let current = 0;
  const byDate = new Map(sorted.map((d) => [d.date, d.contributionCount]));
  let cursor = new Date();
  for (let i = 0; i < 500; i++) {
    const k = cursor.toISOString().slice(0, 10);
    if ((byDate.get(k) || 0) > 0) current++;
    else if (i > 0) break;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  const total = sorted.reduce((s, d) => s + d.contributionCount, 0);
  
  const r = 24, circ = 2 * Math.PI * r;
  const pct = Math.min(1, current / Math.max(1, longest));
  const dashOffset = circ - (pct * circ * 0.75); // 3/4 circle

  return frame(
    `<text x="247" y="40" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${T.title}">${esc(user.login)}'s Streak</text>
     <g font-family="system-ui,sans-serif">
       <text x="120" y="98" font-size="26" font-weight="700" fill="#FF00E5" text-anchor="middle">${current}</text>
       <text x="120" y="120" font-size="11" fill="${T.sub}" text-anchor="middle">CURRENT</text>
       
       <g transform="translate(247, 85)">
         <circle cx="0" cy="0" r="${r}" fill="none" stroke="${T.border}" stroke-opacity=".2" stroke-width="6" stroke-dasharray="${circ * 0.75} ${circ}"/>
         <circle cx="0" cy="0" r="${r}" fill="none" stroke="#FF00E5" stroke-width="6" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${dashOffset}" transform="rotate(135)"/>
         <text x="0" y="6" font-size="16" font-weight="700" fill="${T.title}" text-anchor="middle">🔥</text>
       </g>

       <text x="374" y="98" font-size="26" font-weight="700" fill="#FFE600" text-anchor="middle">${longest}</text>
       <text x="374" y="120" font-size="11" fill="${T.sub}" text-anchor="middle">LONGEST</text>
     </g>
     <text x="247" y="140" font-size="12" fill="${T.sub}" text-anchor="middle">Total Contributions: <tspan fill="${T.text}">${total}</tspan></text>`,
    495, 155
  );
}

// ---------------------------------------------------------------------------
// 9. Activity Area Chart
// ---------------------------------------------------------------------------
export function activitySVG({ user, days } = {}) {
  if (!user || !days) return frame(`<text x="25" y="110" fill="${T.sub}" font-family="system-ui">data unavailable</text>`);
  const now = Date.now();
  const buckets = Array(52).fill(0);
  for (const d of days) {
    const idx = 51 - Math.floor((now - new Date(d.date).getTime()) / (7 * 86400000));
    if (idx >= 0 && idx < 52) buckets[idx] += d.contributionCount;
  }
  const max = Math.max(1, ...buckets);
  const W = 495, H = 195, pL = 30, pR = 15, pT = 42, pB = 25;
  const gw = W - pL - pR, gh = H - pT - pB;
  
  const pts = buckets.map((v, i) => `${(pL + (i / 51) * gw).toFixed(1)},${(pT + gh - (v / max) * gh).toFixed(1)}`);
  const polyline = pts.join(' ');
  const area = `M${pL},${pT+gh} L${polyline.replace(/ /g, ' L')} L${pL+gw},${pT+gh} Z`;

  return frame(
    `<text x="25" y="30" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${T.title}">${esc(user.login)} · Activity</text>
     <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF00E5" stop-opacity=".6"/><stop offset="1" stop-color="#FF00E5" stop-opacity="0"/></linearGradient></defs>
     <path d="${area}" fill="url(#ag)"/>
     <polyline fill="none" stroke="#FF00E5" stroke-width="2" stroke-linejoin="round" points="${polyline}"/>
     <g stroke="${T.sub}" stroke-opacity=".15" stroke-dasharray="3 3">
       <line x1="${pL}" y1="${pT + gh*0.25}" x2="${W-pR}" y2="${pT + gh*0.25}"/>
       <line x1="${pL}" y1="${pT + gh*0.5}" x2="${W-pR}" y2="${pT + gh*0.5}"/>
       <line x1="${pL}" y1="${pT + gh*0.75}" x2="${W-pR}" y2="${pT + gh*0.75}"/>
     </g>
     <text x="${pL}" y="${H - 6}" font-family="system-ui" font-size="10" fill="${T.sub}">-52w</text>
     <text x="${pL + gw}" y="${H - 6}" text-anchor="end" font-family="system-ui" font-size="10" fill="${T.sub}">now</text>`,
    W, H
  );
}

// ---------------------------------------------------------------------------
// 10. Contribution Heatmap (With Month/Day labels)
// ---------------------------------------------------------------------------
export function chartSVG({ user, days } = {}) {
  if (!user || !days) return frame(`<text x="25" y="110" fill="${T.sub}" font-family="system-ui">data unavailable</text>`);
  const m = new Map(days.map((d) => [d.date, d.contributionCount]));
  const max = Math.max(1, ...days.map((d) => d.contributionCount));
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 364);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const cell = 10, gap = 2, pL = 35, pT = 32;
  const W = pL + 53 * (cell + gap) + 10;
  const H = pT + 7 * (cell + gap) + 12;

  let rects = '', months = '';
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;

  for (let w = 0; w < 53; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start.getTime() + (w * 7 + d) * 86400000);
      
      // Add month labels
      if (d === 0 && dt.getUTCMonth() !== lastMonth) {
        lastMonth = dt.getUTCMonth();
        months += `<text x="${pL + w * (cell + gap)}" y="20" font-family="system-ui" font-size="10" fill="${T.sub}">${monthNames[lastMonth]}</text>`;
      }

      if (dt > new Date()) continue;
      const k = dt.toISOString().slice(0, 10);
      const v = m.get(k) || 0;
      const t = v === 0 ? 0 : Math.min(1, 0.25 + (v / max) * 0.75);
      const fill = v === 0 ? '#161b22' : `rgba(0,245,255,${t.toFixed(2)})`;
      rects += `<rect x="${pL + w * (cell + gap)}" y="${pT + d * (cell + gap)}" width="${cell}" height="${cell}" rx="2" fill="${fill}"><title>${k}: ${v}</title></rect>`;
    }
  }
  
  const daysText = `<text x="10" y="${pT + 2*12 + 8}" font-family="system-ui" font-size="10" fill="${T.sub}">Mon</text>
                    <text x="10" y="${pT + 4*12 + 8}" font-family="system-ui" font-size="10" fill="${T.sub}">Wed</text>
                    <text x="10" y="${pT + 6*12 + 8}" font-family="system-ui" font-size="10" fill="${T.sub}">Fri</text>`;

  return frame(
    `<text x="15" y="20" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${T.title}">${esc(user.login)} · Contribution Chart</text>
     ${months} ${daysText} ${rects}`,
    W, H
  );
}

export default {
  async fetch() {
    return new Response('This worker is a build-time library.', { status: 200 });
  },
};
