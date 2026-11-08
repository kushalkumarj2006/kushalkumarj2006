// ============================================================================
// worker.js — README SVG generators
//
// Export surface is a set of PURE functions: (data) => svg string.
// scripts/generate.js imports these and writes the output to dist/.
// The default export is a stub so the file is also a deployable Worker.
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
    w,
    h
  );

// ---------------------------------------------------------------------------
// 1. Capsule header
// ---------------------------------------------------------------------------
export function capsuleSVG({ text = 'Hello', color1 = '#FF00E5', color2 = '#00F5FF', height = 140, fontSize = 40 } = {}) {
  const W = 1200;
  const h = Math.min(Math.max(height, 60), 400);
  return wrap(
    `<defs>
       <linearGradient id="g" x1="0" x2="1">
         <stop offset="0" stop-color="${color1}"/>
         <stop offset="1" stop-color="${color2}"/>
       </linearGradient>
     </defs>
     <path fill="url(#g)" d="M0,${h * 0.4} C${W * 0.25},${h * 0.85} ${W * 0.5},${h * 0.1} ${W},${h * 0.45} L${W},${h} L0,${h} Z"/>
     <text x="${W / 2}" y="${h * 0.5}" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="${fontSize}" font-weight="700" fill="#FFFFFF" dominant-baseline="middle">${esc(text)}</text>`,
    W,
    h
  );
}

// ---------------------------------------------------------------------------
// 2. Typing SVG (loops via CSS)
// ---------------------------------------------------------------------------
export function typingSVG({ text = 'Hello, World!', color = '#00F5FF', size = 22 } = {}) {
  const lines = Array.isArray(text) ? text : [text];
  const W = 620;
  const lineH = size + 8;
  const H = lineH * lines.length + 16;
  const cursorX = 10 + Math.max(...lines.map((l) => l.length)) * size * 0.6;
  const textEls = lines
    .map(
      (l, i) =>
        `<text class="t" x="10" y="${(i + 1) * lineH}" style="animation-delay:${i * 0.8}s">${esc(l)}</text>`
    )
    .join('');
  return wrap(
    `<style>
       .t { font: 600 ${size}px ui-monospace,Menlo,monospace; fill: ${color};
            clip-path: inset(0 100% 0 0); animation: type 4s steps(40) infinite; }
       .c { animation: blink 1s step-end infinite; }
       @keyframes type { 0%{clip-path:inset(0 100% 0 0)} 40%,90%{clip-path:inset(0 0 0 0)} 100%{clip-path:inset(0 100% 0 0)} }
       @keyframes blink { 50%{opacity:0} }
     </style>
     ${textEls}
     <rect class="c" x="${cursorX}" y="4" width="2" height="${size * 1.3}" fill="${color}"/>`,
    W,
    H
  );
}

// ---------------------------------------------------------------------------
// 3. Shields-style badge
// ---------------------------------------------------------------------------
export function badgeSVG({ label, value, color = T.border } = {}) {
  const cw = 6.5, pad = 12, h = 20;
  const lw = Math.round(label.length * cw) + pad * 2;
  const vw = Math.round(value.length * cw) + pad * 2;
  const w = lw + vw;
  return wrap(
    `<linearGradient id="s" x2="0" y2="100%">
       <stop offset="0" stop-color="#000" stop-opacity=".1"/>
       <stop offset="1" stop-opacity=".1"/>
     </linearGradient>
     <clipPath id="r"><rect width="${w}" height="${h}" rx="3"/></clipPath>
     <g clip-path="url(#r)">
       <rect width="${lw}" height="${h}" fill="#555"/>
       <rect x="${lw}" width="${vw}" height="${h}" fill="${color}"/>
       <rect width="${w}" height="${h}" fill="url(#s)"/>
     </g>
     <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11">
       <text x="${lw / 2}" y="14">${esc(label)}</text>
       <text x="${lw + vw / 2}" y="14">${esc(value)}</text>
     </g>`,
    w,
    h
  );
}

// Compose several badges horizontally with gaps.
export function badgeRowSVG({ badges = [] } = {}) {
  const gap = 6;
  const parts = [];
  let x = 0;
  let maxH = 0;
  for (const b of badges) {
    const svg = badgeSVG(b);
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    const w = +m[1], h = +m[2];
    maxH = Math.max(maxH, h);
    const inner = svg.replace(/^<svg[^>]*>|<\/svg>$/g, '');
    parts.push(`<g transform="translate(${x},0)">${inner}</g>`);
    x += w + gap;
  }
  const W = Math.max(x - gap, 1);
  return wrap(parts.join(''), W, maxH);
}

// ---------------------------------------------------------------------------
// 4. Tech-stack icon grid (skillicons replacement)
// ---------------------------------------------------------------------------
const ICONS = {
  js:        ['#F7DF1E', '#000', 'JS'],
  ts:        ['#3178C6', '#fff', 'TS'],
  py:        ['#3776AB', '#FFD43B', 'Py'],
  kotlin:    ['#7F52FF', '#fff', 'Kt'],
  java:      ['#ED8B00', '#fff', 'Ja'],
  c:         ['#A8B9CC', '#000', 'C'],
  html:      ['#E34F26', '#fff', 'H5'],
  css:       ['#1572B6', '#fff', 'C3'],
  node:      ['#339933', '#fff', 'Nd'],
  express:   ['#000000', '#fff', 'Ex'],
  react:     ['#61DAFB', '#000', 'Re'],
  next:      ['#000000', '#fff', 'Nx'],
  tailwind:  ['#06B6D4', '#fff', 'Tw'],
  socketio:  ['#010101', '#fff', 'So'],
  fastapi:   ['#009688', '#fff', 'Fa'],
  flask:     ['#000000', '#fff', 'Fl'],
  compose:   ['#4285F4', '#fff', 'Jc'],
  pytorch:   ['#EE4C2C', '#fff', 'Pt'],
  sklearn:   ['#F7931E', '#fff', 'Sk'],
  opencv:    ['#5C3EE8', '#fff', 'Cv'],
  chartjs:   ['#FF6384', '#fff', 'Ch'],
  git:       ['#F05032', '#fff', 'Gt'],
  docker:    ['#2496ED', '#fff', 'Dk'],
  vite:      ['#646CFF', '#fff', 'Vi'],
  gradle:    ['#02303A', '#fff', 'Gr'],
  render:    ['#46E3B7', '#000', 'Rn'],
  vercel:    ['#000000', '#fff', 'Vc'],
  ghpages:   ['#222222', '#fff', 'GP'],
  colab:     ['#F9AB00', '#000', 'Co'],
  jupyter:   ['#F37626', '#fff', 'Ju'],
  ollama:    ['#000000', '#fff', 'Ol'],
  pg:        ['#4169E1', '#fff', 'Pg'],
  sqlite:    ['#003B57', '#fff', 'Sq'],
  js_ts_note:'',
};

export function iconsSVG({ names = [], size = 48, gap = 10, perRow = 8 } = {}) {
  const cols = Math.min(perRow, Math.max(names.length, 1));
  const rows = Math.ceil(names.length / cols);
  const W = cols * size + (cols - 1) * gap;
  const H = rows * size + (rows - 1) * gap;
  const parts = names.map((name, i) => {
    const def = ICONS[name] || ['#333', '#fff', name.slice(0, 2)];
    const x = (i % cols) * (size + gap);
    const y = Math.floor(i / cols) * (size + gap);
    const r = Math.round(size * 0.14);
    return `<g transform="translate(${x},${y})">
      <rect width="${size}" height="${size}" rx="${r}" fill="${def[0]}"/>
      <text x="${size / 2}" y="${size * 0.62}" text-anchor="middle"
            font-family="system-ui,sans-serif" font-size="${Math.round(size * 0.36)}"
            font-weight="700" fill="${def[1]}">${esc(def[2])}</text>
    </g>`;
  });
  return wrap(parts.join(''), W, H);
}

// ---------------------------------------------------------------------------
// 5. Repo pin card (github-readme-stats /api/pin replacement)
// ---------------------------------------------------------------------------
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Kotlin: '#A97BFF', Java: '#b07219', C: '#555555',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
  'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584',
};

export function pinSVG({ repo } = {}) {
  const w = 400, h = 130;
  if (!repo) {
    return wrap(
      `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="6" fill="${T.bg}" stroke="${T.border}"/>
       <text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" font-family="system-ui" font-size="13" fill="${T.sub}">Repo not found</text>`,
      w, h
    );
  }
  const name = truncate(repo.name, 28);
  const desc = truncate(repo.description || 'No description', 56);
  const lang = repo.language || 'Unknown';
  const langColor = LANG_COLORS[lang] || '#858585';
  return wrap(
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="6" fill="${T.bg}" stroke="${T.border}"/>
     <text x="20" y="32" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${T.title}">${esc(name)}</text>
     <text x="20" y="58" font-family="system-ui,sans-serif" font-size="12" fill="${T.text}">${esc(desc)}</text>
     <circle cx="26" cy="94" r="5" fill="${langColor}"/>
     <text x="38" y="98" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">${esc(lang)}</text>
     <text x="170" y="98" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">★ ${repo.stargazers_count}</text>
     <text x="240" y="98" font-family="system-ui,sans-serif" font-size="12" fill="${T.sub}">⑂ ${repo.forks_count}</text>`,
    w, h
  );
}

// ---------------------------------------------------------------------------
// 6. Stats card (github-readme-stats replacement)
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
       <text x="280" y="72">◆  Following</text><text x="470" y="72" fill="${T.title}" text-anchor="end">${user.following}</text>
       <text x="280" y="96">✦  Gists</text><text x="470" y="96" fill="${T.title}" text-anchor="end">${user.public_gists}</text>
       <text x="280" y="120">◐  Account age</text><text x="470" y="120" fill="${T.title}" text-anchor="end">${yearsSince(user.created_at)}y</text>
       <text x="280" y="144">▲  Repos (all)</text><text x="470" y="144" fill="${T.title}" text-anchor="end">${user.public_repos + (user.total_private_repos || 0)}</text>
     </g>`
  );
}

function yearsSince(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (365.25 * 86400000));
}

// ---------------------------------------------------------------------------
// 7. Summary card (profile-summary-cards replacement)
// ---------------------------------------------------------------------------
export function summarySVG({ user, days } = {}) {
  if (!user || !days) return frame(`<text x="25" y="110" fill="${T.sub}" font-family="system-ui">data unavailable</text>`);
  const total = days.reduce((s, d) => s + d.contributionCount, 0);
  const active = days.filter((d) => d.contributionCount > 0).length;
  const best = days.reduce((m, d) => (d.contributionCount > m ? d.contributionCount : m), 0);
  return frame(
    `<text x="25" y="36" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${T.title}">${esc(user.login)} · Summary</text>
     <g font-family="system-ui,sans-serif" font-size="14" fill="${T.text}">
       <text x="25" y="72">📅  Contributions (1y)</text><text x="280" y="72" fill="${T.title}">${total}</text>
       <text x="25" y="96">🗓  Active days</text><text x="280" y="96" fill="${T.title}">${active}</text>
       <text x="25" y="120">🔥  Best day</text><text x="280" y="120" fill="${T.title}">${best}</text>
       <text x="25" y="144">📦  Repositories</text><text x="280" y="144" fill="${T.title}">${user.public_repos}</text>
       <text x="25" y="168">👥  Followers</text><text x="280" y="168" fill="${T.title}">${user.followers}</text>
     </g>`,
    495, 195
  );
}

// ---------------------------------------------------------------------------
// 8. Streak card
// ---------------------------------------------------------------------------
export function streakSVG({ user, days } = {}) {
  if (!user || !days) return frame(`<text x="25" y="80" fill="${T.sub}" font-family="system-ui">data unavailable</text>`, 495, 155);
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let run = 0, longest = 0;
  for (const d of sorted) {
    if (d.contributionCount > 0) { run++; if (run > longest) longest = run; }
    else run = 0;
  }
  let current = 0;
  const byDate = new Map(sorted.map((d) => [d.date, d.contributionCount]));
  let cursor = new Date();
  for (let i = 0; i < 500; i++) {
    const k = cursor.toISOString().slice(0, 10);
    const v = byDate.get(k) || 0;
    if (v > 0) current++;
    else if (i > 0) break;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  const total = sorted.reduce((s, d) => s + d.contributionCount, 0);
  return frame(
    `<text x="247" y="40" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${T.title}">${esc(user.login)}'s Streak</text>
     <g font-family="system-ui,sans-serif" text-anchor="middle">
       <text x="120" y="98" font-size="26" font-weight="700" fill="#FF00E5">${current}</text>
       <text x="120" y="120" font-size="11" fill="${T.sub}">CURRENT</text>
       <text x="247" y="98" font-size="26" font-weight="700" fill="#00F5FF">${longest}</text>
       <text x="247" y="120" font-size="11" fill="${T.sub}">LONGEST</text>
       <text x="374" y="98" font-size="26" font-weight="700" fill="#FFE600">${total}</text>
       <text x="374" y="120" font-size="11" fill="${T.sub}">TOTAL</text>
     </g>`,
    495, 155
  );
}

// ---------------------------------------------------------------------------
// 9. Activity line chart (last 52 weeks)
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
  const gw = W - pL - pR;
  const gh = H - pT - pB;
  const pts = buckets.map((v, i) =>
    `${(pL + (i / 51) * gw).toFixed(1)},${(pT + gh - (v / max) * gh).toFixed(1)}`
  ).join(' ');
  return frame(
    `<text x="25" y="30" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${T.title}">${esc(user.login)} · Activity</text>
     <polygon fill="#FF00E5" fill-opacity=".18" points="${pL},${pT + gh} ${pts} ${pL + gw},${pT + gh}"/>
     <polyline fill="none" stroke="#FF00E5" stroke-width="2" stroke-linejoin="round" points="${pts}"/>
     <line x1="${pL}" y1="${pT + gh}" x2="${pL + gw}" y2="${pT + gh}" stroke="${T.sub}" stroke-opacity=".3"/>
     <text x="${pL}" y="${H - 6}" font-family="system-ui" font-size="10" fill="${T.sub}">-52w</text>
     <text x="${pL + gw}" y="${H - 6}" text-anchor="end" font-family="system-ui" font-size="10" fill="${T.sub}">now</text>`,
    W, H
  );
}

// ---------------------------------------------------------------------------
// 10. Contribution heatmap (ghchart replacement)
// ---------------------------------------------------------------------------
export function chartSVG({ user, days } = {}) {
  if (!user || !days) return frame(`<text x="25" y="110" fill="${T.sub}" font-family="system-ui">data unavailable</text>`);
  const m = new Map(days.map((d) => [d.date, d.contributionCount]));
  const max = Math.max(1, ...days.map((d) => d.contributionCount));
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 364);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const cell = 10, gap = 2, pL = 30, pT = 32;
  const W = pL + 53 * (cell + gap) + 10;
  const H = pT + 7 * (cell + gap) + 12;

  let rects = '';
  for (let w = 0; w < 53; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start.getTime() + (w * 7 + d) * 86400000);
      if (dt > new Date()) continue;
      const k = dt.toISOString().slice(0, 10);
      const v = m.get(k) || 0;
      const t = v === 0 ? 0 : Math.min(1, 0.25 + (v / max) * 0.75);
      const fill = v === 0 ? '#161b22' : `rgba(0,245,255,${t.toFixed(2)})`;
      rects += `<rect x="${pL + w * (cell + gap)}" y="${pT + d * (cell + gap)}" width="${cell}" height="${cell}" rx="2" fill="${fill}"><title>${k}: ${v}</title></rect>`;
    }
  }
  return frame(
    `<text x="15" y="20" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${T.title}">${esc(user.login)} · Contribution Chart</text>
     ${rects}`,
    W, H
  );
}

// ---------------------------------------------------------------------------
// Default export — stub Worker (for future deployment if you ever want live)
// ---------------------------------------------------------------------------
export default {
  async fetch() {
    return new Response('This worker is a build-time library. See scripts/generate.js.', { status: 200 });
  },
};
