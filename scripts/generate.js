import { writeFile, mkdir } from 'node:fs/promises';
import {
  capsuleSVG, typingSVG, badgeRowSVG, iconsSVG, pinSVG,
  statsSVG, summarySVG, streakSVG, activitySVG, chartSVG,
} from '../worker.js';

const USER = 'kushalkumarj2006';
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) { console.error('GITHUB_TOKEN is required'); process.exit(1); }

const H = { authorization: `Bearer ${TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'readme-renderer' };

async function rest(path) {
  const r = await fetch('https://api.github.com' + path, { headers: H });
  if (!r.ok) throw new Error(`REST ${path} → ${r.status}`);
  return r.json();
}

async function gql(query) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ query }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors[0].message);
  return j.data;
}

await mkdir('dist', { recursive: true });
const write = (name, svg) => writeFile(`dist/${name}.svg`, svg);
const safe = async (name, fn) => {
  try { const svg = await fn(); await write(name, svg); console.log('✓', name); } 
  catch (e) { console.error('✗', name, '—', e.message); }
};

await safe('capsule', () => capsuleSVG({ text: 'Kushal Kumar J', color1: '#FF00E5', color2: '#00F5FF', height: 140, fontSize: 40 }));

await safe('typing', () => typingSVG({ text: ['Full Stack Developer', 'AI Tooling Builder', 'Android & Social-Impact Tech'], color: '#00F5FF', size: 22 }));

await safe('icons-top', () => badgeRowSVG({
  badges: [
    { label: 'JavaScript', value: '0D0221', color: '00F5FF' }, { label: 'TypeScript', value: '0D0221', color: '00F5FF' },
    { label: 'Python', value: '0D0221', color: '00F5FF' }, { label: 'Kotlin', value: '0D0221', color: '00F5FF' },
  ],
}));

await safe('icons-tech', () => iconsSVG({
  names: ['js','ts','py','kotlin','java','c','html','css','node','express','react','next','tailwind','socketio','fastapi','flask','compose','pytorch','sklearn','opencv','chartjs','git','docker','vite','gradle','render','vercel','ghpages','colab','jupyter','ollama','pg','sqlite'],
  size: 48, gap: 10, perRow: 11,
}));

let user, repos, days, languages = [];
try {
  [user, repos] = await Promise.all([
    rest(`/users/${USER}`),
    rest(`/users/${USER}/repos?per_page=100&sort=updated`),
  ]);
  
  const q = `
    query {
      user(login: "${USER}") {
        contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount } } } }
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          nodes { languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { color name } } } }
        }
      }
    }
  `;
  const data = await gql(q);
  days = data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  
  // Aggregate Languages
  const langMap = {};
  data.user.repositories.nodes.forEach(r => {
    r.languages.edges.forEach(e => {
      if (!langMap[e.node.name]) langMap[e.node.name] = { name: e.node.name, color: e.node.color, size: 0 };
      langMap[e.node.name].size += e.size;
    });
  });
  languages = Object.values(langMap).sort((a, b) => b.size - a.size);
  console.log(`→ fetched: user, ${repos.length} repos, ${days.length} days, ${languages.length} languages`);
} catch (e) { console.error('data fetch failed:', e.message); }

await safe('stats',   () => statsSVG({ user, repos }));
await safe('summary', () => summarySVG({ user, days, languages }));
await safe('streak',  () => streakSVG({ user, days }));
await safe('activity', () => activitySVG({ user, days }));
await safe('chart',   () => chartSVG({ user, days }));

const pinned = [['pin-colabbridge', 'ColabBridge'], ['pin-repochat', 'repochat'], ['pin-repomix', 'repomix'], ['pin-chatgpt-oauth', 'chatgpt-oauth-advanced'], ['pin-password', 'password-strength-analyzer']];
for (const [file, name] of pinned) { await safe(file, () => pinSVG({ repo: repos?.find((r) => r.name === name) })); }

console.log('done');
