import { coverFor } from './covers.js';
import { icon } from './icons.js';
import * as anim from './animations.js';

const FALLBACK_YOUTUBE = 'https://www.youtube.com/channel/UCqHf52I0w3vtbhtkLtqmIcQ';
const SOCIAL_LABELS = { youtube: 'YouTube', tiktok: 'TikTok' };

const $ = (sel, root = document) => root.querySelector(sel);

// Tiny DOM helper. Always uses textContent, so JSON content can never inject markup.
function h(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val == null || val === false) continue;
    if (key === 'class') node.className = val;
    else if (key === 'text') node.textContent = val;
    else node.setAttribute(key, val === true ? '' : val);
  }
  for (const kid of kids.flat()) if (kid != null) node.append(kid);
  return node;
}

// Only allow web links, mailto links and local asset paths.
const safeUrl = (u) => (/^(https?:|mailto:|assets\/|\.\/|\/)/i.test(u || '') ? u : '');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Email first, then each social from site.json. One list feeds both the About tile and the footer.
function contactLinks(site) {
  const links = [];
  if (site.email) links.push({ name: 'email', label: 'Email', href: `mailto:${site.email}`, external: false });
  for (const [name, url] of Object.entries(site.socials || {})) {
    if (safeUrl(url)) links.push({ name, label: SOCIAL_LABELS[name] || cap(name), href: url, external: true });
  }
  return links;
}

function linkEl(link, attrs = {}, ...extra) {
  const a = h('a', { href: link.href, ...attrs, ...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) });
  const ico = icon(link.name);
  if (ico) a.append(ico);
  a.append(h('span', { text: link.label }), ...extra);
  return a;
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

/* ---------- Nav ---------- */
function setupNav() {
  const btn = $('#menu-btn');
  const links = $('#nav-links');
  const setOpen = (open) => {
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
}

/* ---------- Hero ---------- */
// Rebuilds the outlined marquee row from site.heroLine ("Word · Word · Word").
function renderHeroLine(text) {
  const track = $('.hero .row-outline .marquee-track');
  const items = String(text || '').split('·').map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!track || !items.length) return;
  let pieces = [...items];
  while (pieces.join(' · ').length < 48) pieces = pieces.concat(items); // keep one set wider than the screen
  const makeSet = (hidden) => h('div', { class: 'mq-set', 'aria-hidden': hidden ? 'true' : null },
    pieces.map((piece) => h('span', { text: `${piece} · ` })));
  track.replaceChildren(makeSet(false), makeSet(true));
}

/* ---------- About ---------- */
function latestProject(projects) {
  // Highest year wins; ties keep file order (so put newest first in projects.json).
  return [...projects].sort((a, b) => (b.year || 0) - (a.year || 0))[0];
}

function renderAbout(site, projects) {
  const grid = $('#about-grid');
  grid.replaceChildren();

  const photo = safeUrl(site.photo);
  grid.classList.toggle('has-photo', Boolean(photo));
  if (photo) {
    grid.append(h('div', { class: 'tile t-photo reveal' },
      h('img', { src: photo, alt: `Portrait of ${site.fullName || site.name || 'the owner'}`, width: '900', height: '900', decoding: 'async' }),
      h('span', { class: 'chip', text: site.fullName || 'FETP · Bangkok' })));
  }

  grid.append(
    h('div', { class: 'tile t-bio reveal' },
      h('div', {}, h('span', { class: 'label', text: 'Who' }), h('h3', { class: 'big', text: site.tagline || '' })),
      site.bio ? h('p', { text: site.bio }) : null),
    h('div', { class: 'tile t-count reveal' },
      h('span', { class: 'label', text: 'Projects' }),
      h('span', { class: 'num', 'data-count': projects.length, text: String(projects.length) }),
      h('small', { text: 'and counting' })),
  );

  const links = contactLinks(site);
  if (links.length) {
    grid.append(h('div', { class: 'tile t-social reveal' },
      h('span', { class: 'label', text: 'Find me' }),
      links.map((l) => linkEl(l, {}, h('span', { class: 'ext', 'aria-hidden': 'true', text: '↗' })))));
  }

  if ((site.skills || []).length) {
    grid.append(h('div', { class: 'tile t-skills reveal' },
      h('span', { class: 'label', text: 'Toolkit' }),
      h('div', { class: 'pills' }, site.skills.map((s) => h('span', { class: 'pill', text: s })))));
  }

  const latest = latestProject(projects);
  if (latest) {
    const url = safeUrl(latest.link);
    const inner = [
      h('div', {}, h('span', { class: 'label', text: 'Latest' }), h('span', { class: 'name', text: latest.title })),
    ];
    let tile;
    if (latest.video) {
      inner.push(h('span', { class: 'go', text: 'Watch ▶' }));
      tile = h('button', { class: 'tile t-latest reveal', type: 'button' }, inner);
      tile.addEventListener('click', () => openModal(latest));
    } else if (url) {
      inner.push(h('span', { class: 'go', text: 'Open ↗' }));
      tile = h('a', { class: 'tile t-latest reveal', href: url, target: '_blank', rel: 'noopener noreferrer' }, inner);
    } else {
      inner.push(h('span', { class: 'go', text: 'Coming soon' }));
      tile = h('div', { class: 'tile t-latest reveal' }, inner);
    }
    grid.append(tile);
  }
}

/* ---------- Work ---------- */
function projectTile(p) {
  const url = safeUrl(p.link);
  const hasVideo = !!p.video;
  const tile = h('article', {
    class: `tile project reveal${p.featured ? ' featured' : ''}${hasVideo ? ' tall' : ''}`,
    'data-type': p.type,
  });

  tile.append(coverFor(p));
  if (p.image || p.poster) tile.append(h('div', { class: 'scrim' }));

  if (hasVideo) {
    const btn = h('button', { class: 'project-link', type: 'button', 'aria-label': `Play video: ${p.title}` });
    btn.addEventListener('click', () => openModal(p));
    tile.append(btn, h('span', { class: 'play', 'aria-hidden': 'true', text: '▶' }));
  } else if (url) {
    tile.append(h('a', {
      class: 'project-link', href: url, target: '_blank', rel: 'noopener noreferrer',
      'aria-label': `${p.fullTitle || p.title} (opens in a new tab)`,
      title: p.fullTitle || null,
    }));
  }

  const corner = hasVideo ? null
    : url ? h('span', { class: 'arrow', 'aria-hidden': 'true', text: '↗' })
    : h('span', { class: 'badge', text: 'Private · coming soon' });

  tile.append(h('div', { class: 'p-in' },
    h('div', { class: 'p-top' },
      h('div', { class: 'p-id' },
        safeUrl(p.logo) ? h('img', { class: 'p-logo', src: p.logo, alt: '', width: '40', height: '40', loading: 'lazy', decoding: 'async' }) : null,
        h('span', { class: 'tag', text: p.type })),
      corner),
    h('div', { class: 'p-bottom' },
      h('h3', { text: p.title }),
      p.description ? h('p', { text: p.description }) : null,
      (p.tags || []).length ? h('div', { class: 'chips' }, p.tags.map((t) => h('span', { text: t }))) : null)));

  return tile;
}

function renderWork(projects) {
  const grid = $('#work-grid');
  const tabs = $('#tabs');
  grid.replaceChildren(...projects.map(projectTile));

  const types = [...new Set(projects.map((p) => p.type))];
  tabs.replaceChildren();
  tabs.hidden = types.length < 2;
  if (types.length < 2) return;

  const select = (type, activeBtn) => {
    anim.filterTiles(grid, (tile) => type === 'All' || tile.dataset.type === type);
    for (const b of tabs.children) b.setAttribute('aria-pressed', String(b === activeBtn));
  };

  for (const type of ['All', ...types]) {
    const btn = h('button', { class: 'tab', type: 'button', 'aria-pressed': String(type === 'All'), text: type });
    btn.addEventListener('click', () => select(type, btn));
    tabs.append(btn);
  }
}

/* ---------- Contact / collaborate ---------- */
const mailto = (email, subject, body) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

function renderCollab(site) {
  const box = $('#collab');
  const topics = (site.collab && site.collab.topics) || [];
  box.replaceChildren();
  if (!topics.length) return;

  if (site.collab.intro) box.append(h('p', { class: 'collab-intro reveal', text: site.collab.intro }));
  for (const t of topics) {
    const inner = [
      h('h3', { text: t.title }),
      t.text ? h('p', { text: t.text }) : null,
      site.email ? h('span', { class: 'go', text: 'Email me ↗' }) : null,
    ];
    box.append(site.email
      ? h('a', {
        class: 'collab-card reveal',
        href: mailto(site.email, `Collaboration: ${t.title}`,
          `Hi ${(site.fullName || site.name || '').split(/[ ,]/)[0]},

I'd like to collaborate on ${t.title.toLowerCase()}.

What I'm working on:
`),
      }, inner)
      : h('div', { class: 'collab-card reveal' }, inner));
  }
}

function renderContact(site) {
  const youtube = safeUrl((site.socials || {}).youtube) || FALLBACK_YOUTUBE;
  const cta = $('#cta');
  if (site.email) {
    cta.href = mailto(site.email, 'Collaboration', `Hi ${(site.fullName || site.name || '').split(/[ ,]/)[0]},

I'd like to collaborate with you.

What I'm working on:
`);
  } else {
    cta.href = youtube;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
  }
  renderCollab(site);

  const row = $('#socials');
  row.replaceChildren(...contactLinks(site).map((l) => linkEl(l)));
}

/* ---------- Video modal ---------- */
const modal = $('#modal');
const modalVideo = $('#modal-video');
let lastFocus = null;

function openModal(p) {
  lastFocus = document.activeElement;
  modalVideo.poster = safeUrl(p.poster) || '';
  modalVideo.src = safeUrl(p.video);
  $('#modal-title').textContent = p.title;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modalVideo.play().catch(() => {}); // autoplay with sound may be blocked; controls stay available
  $('.modal-close').focus();
}

function closeModal() {
  if (modal.hidden) return;
  modalVideo.pause();
  modalVideo.removeAttribute('src');
  modalVideo.load(); // stops any in-flight download
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ---------- Boot ---------- */
async function main() {
  setupNav();

  let site;
  let projects;
  try {
    [site, projects] = await Promise.all([loadJSON('data/site.json'), loadJSON('data/projects.json')]);
    if (!Array.isArray(projects)) throw new Error('projects.json must be a list');
    projects = projects
      .filter((p) => p && typeof p.title === 'string' && p.title.trim())
      .map((p) => ({ ...p, type: (p.type || 'Project').toString() }));
  } catch (err) {
    console.error('Could not load site data:', err);
    $('#work-grid').replaceChildren(h('div', { class: 'notice' },
      h('p', { text: 'Couldn’t load the projects right now. ' }),
      h('a', { href: FALLBACK_YOUTUBE, target: '_blank', rel: 'noopener noreferrer', text: 'Watch my videos on YouTube ↗' })));
    renderContact({ socials: { youtube: FALLBACK_YOUTUBE } });
    $('#about').hidden = true;
    anim.start();
    return;
  }

  $('#work-count').textContent = String(projects.length);
  renderHeroLine(site.heroLine);
  renderAbout(site, projects);
  renderWork(projects);
  renderContact(site);
  anim.start();
}

main();
