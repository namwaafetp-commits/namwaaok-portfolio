import { coverFor } from './covers.js';
import { icon } from './icons.js';
import * as anim from './animations.js';
import { applyStatic, en, getLang, onLangChange, setLang, t, tr } from './i18n.js';

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

// Everything the renderers need; a language switch re-renders from this without refetching.
const state = { site: null, projects: [], filter: 'All' };

async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

const typeLabel = (type) => {
  const key = `type.${type}`;
  const label = t(key);
  return label === key ? type : label;
};

const firstName = (site) => tr(site.fullName || site.name || '').split(/[ ,]/)[0];

// Email first, then each social from site.json. One list feeds both the About tile and the footer.
function contactLinks(site) {
  const links = [];
  if (site.email) links.push({ name: 'email', label: t('linkEmail'), href: `mailto:${site.email}`, external: false });
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

/* ---------- Nav ---------- */
function setMenuLabel() {
  const open = $('#nav-links').classList.contains('open');
  $('#menu-btn').textContent = open ? t('close') : t('menu');
}

function setupNav() {
  const btn = $('#menu-btn');
  const links = $('#nav-links');
  const setOpen = (open) => {
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    setMenuLabel();
  };
  btn.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  for (const b of document.querySelectorAll('.lang [data-lang]')) {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  }
}

/* ---------- Marquees: rebuilt from text so a language switch can change them ---------- */
// `tail` is appended to every piece (e.g. a separator dot). One set must be wider than the screen.
function buildMarquee(track, pieces, tail = ' ') {
  if (!track || !pieces.length) return;
  let list = [...pieces];
  while (list.join(tail).length < 40) list = list.concat(pieces);
  const makeSet = (hidden) => h('div', { class: 'mq-set', 'aria-hidden': hidden ? 'true' : null },
    list.map((piece) => h('span', { text: `${piece}${tail}` })));
  track.replaceChildren(makeSet(false), makeSet(true));
}

function renderMarquees(site) {
  const pieces = tr(site.heroLine).split('·').map((s) => s.trim()).filter(Boolean);
  buildMarquee($('.hero .row-outline .marquee-track'), pieces, ' · ');
  buildMarquee($('.hero .row-lime .marquee-track'), [t('heroWork')]);
  buildMarquee($('#cta .marquee-track'), [t('cta')]);
}

/* ---------- About ---------- */
function latestProject(projects, site) {
  // site.latest (a project's English title) wins; otherwise highest year, ties keep file order.
  const picked = site.latest && projects.find((p) => en(p.title) === site.latest);
  return picked || [...projects].sort((a, b) => (b.year || 0) - (a.year || 0))[0];
}

function renderAbout(site, projects) {
  const grid = $('#about-grid');
  grid.replaceChildren();

  const owner = tr(site.fullName) || site.name || '';
  const photo = safeUrl(site.photo);
  grid.classList.toggle('has-photo', Boolean(photo));
  if (photo) {
    grid.append(h('div', { class: 'tile t-photo reveal' },
      h('img', { src: photo, alt: t('portrait', { name: owner }), width: '900', height: '900', decoding: 'async' }),
      h('span', { class: 'chip', text: owner || 'FETP · Bangkok' })));
  }

  grid.append(
    h('div', { class: 'tile t-bio reveal' },
      h('div', {}, h('span', { class: 'label', text: t('labelWho') }), h('h3', { class: 'big', text: tr(site.tagline) })),
      site.bio ? h('p', { text: tr(site.bio) }) : null),
    h('div', { class: 'tile t-count reveal' },
      h('span', { class: 'label', text: t('labelProjects') }),
      h('span', { class: 'num', 'data-count': projects.length, text: String(projects.length) }),
      h('small', { text: t('andCounting') })),
  );

  const links = contactLinks(site);
  if (links.length) {
    grid.append(h('div', { class: 'tile t-social reveal' },
      h('span', { class: 'label', text: t('labelFindMe') }),
      links.map((l) => linkEl(l, {}, h('span', { class: 'ext', 'aria-hidden': 'true', text: '↗' })))));
  }

  for (const ch of site.channels || []) {
    const url = safeUrl((site.socials || {})[ch.social]);
    if (!url) continue;
    const label = SOCIAL_LABELS[ch.social] || cap(ch.social);
    grid.append(h('a', { class: 'tile t-channel reveal', href: url, target: '_blank', rel: 'noopener noreferrer', lang: getLang() },
      h('div', { class: 'ch-head' }, icon(ch.social), h('span', { class: 'ch-name', text: label }), h('span', { class: 'ext', 'aria-hidden': 'true', text: '↗' })),
      h('span', { class: 'label', text: tr(ch.label) }),
      h('p', { text: tr(ch.text) }),
      h('span', { class: 'go', text: tr(ch.cta) })));
  }

  if ((site.skills || []).length) {
    grid.append(h('div', { class: 'tile t-skills reveal' },
      h('span', { class: 'label', text: t('labelToolkit') }),
      h('div', { class: 'pills' }, site.skills.map((s) => h('span', { class: 'pill', text: tr(s) })))));
  }

  const latest = latestProject(projects, site);
  if (latest) {
    const url = safeUrl(latest.link);
    const inner = [
      h('div', {}, h('span', { class: 'label', text: t('labelLatest') }), h('span', { class: 'name', text: tr(latest.title) })),
    ];
    let tile;
    if (latest.video) {
      inner.push(h('span', { class: 'go', text: t('watch') }));
      tile = h('button', { class: 'tile t-latest reveal', type: 'button' }, inner);
      tile.addEventListener('click', () => openModal(latest));
    } else if (url) {
      inner.push(h('span', { class: 'go', text: t('open') }));
      tile = h('a', { class: 'tile t-latest reveal', href: url, target: '_blank', rel: 'noopener noreferrer' }, inner);
    } else {
      inner.push(h('span', { class: 'go', text: t('soon') }));
      tile = h('div', { class: 'tile t-latest reveal' }, inner);
    }
    grid.append(tile);
  }
}

/* ---------- Work ---------- */
function projectTile(p) {
  const title = tr(p.title);
  const fullTitle = p.fullTitle ? tr(p.fullTitle) : '';
  const url = safeUrl(p.link);
  const hasVideo = !!p.video;
  const tile = h('article', {
    class: `tile project reveal${p.featured ? ' featured' : ''}${hasVideo ? ' tall' : ''}`,
    'data-type': p.type,
  });

  tile.append(coverFor({ ...p, title: en(p.title) })); // covers stay keyed to the English title, so they never change with language
  if (p.image || p.poster) tile.append(h('div', { class: 'scrim' }));

  if (hasVideo) {
    const btn = h('button', { class: 'project-link', type: 'button', 'aria-label': t('playAria', { title }) });
    btn.addEventListener('click', () => openModal(p));
    tile.append(btn, h('span', { class: 'play', 'aria-hidden': 'true', text: '▶' }));
  } else if (url) {
    tile.append(h('a', {
      class: 'project-link', href: url, target: '_blank', rel: 'noopener noreferrer',
      'aria-label': t('opensNew', { title: fullTitle || title }),
      title: fullTitle || null,
    }));
  }

  const corner = hasVideo ? null
    : url ? h('span', { class: 'arrow', 'aria-hidden': 'true', text: '↗' })
    : h('span', { class: 'badge', text: t('badgePrivate') });

  const description = tr(p.description);
  tile.append(h('div', { class: 'p-in' },
    h('div', { class: 'p-top' },
      h('div', { class: 'p-id' },
        safeUrl(p.logo) ? h('img', { class: 'p-logo', src: p.logo, alt: '', width: '40', height: '40', loading: 'lazy', decoding: 'async' }) : null,
        h('span', { class: 'tag', text: typeLabel(p.type) })),
      corner),
    h('div', { class: 'p-bottom' },
      h('h3', { text: title }),
      description ? h('p', { text: description }) : null,
      (p.tags || []).length ? h('div', { class: 'chips' }, p.tags.map((tag) => h('span', { text: tag }))) : null)));

  return tile;
}

function renderWork(projects) {
  const grid = $('#work-grid');
  const tabs = $('#tabs');
  grid.replaceChildren(...projects.map(projectTile));

  const types = [...new Set(projects.map((p) => p.type))];
  if (!types.includes(state.filter)) state.filter = 'All';
  tabs.replaceChildren();
  tabs.hidden = types.length < 2;
  if (types.length < 2) return;

  const matches = (tile) => state.filter === 'All' || tile.dataset.type === state.filter;
  for (const tile of grid.querySelectorAll('.project')) tile.hidden = !matches(tile); // keep the chosen filter across a language switch

  for (const type of ['All', ...types]) {
    const btn = h('button', {
      class: 'tab', type: 'button', 'data-type': type, 'aria-pressed': String(type === state.filter),
      text: type === 'All' ? t('tabAll') : typeLabel(type),
    });
    btn.addEventListener('click', () => {
      state.filter = type;
      anim.filterTiles(grid, matches);
      for (const b of tabs.children) b.setAttribute('aria-pressed', String(b.dataset.type === type));
    });
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

  if (site.collab.intro) box.append(h('p', { class: 'collab-intro reveal', text: tr(site.collab.intro) }));
  for (const topic of topics) {
    const title = tr(topic.title);
    const inner = [
      h('h3', { text: title }),
      topic.text ? h('p', { text: tr(topic.text) }) : null,
      site.email ? h('span', { class: 'go', text: t('emailMe') }) : null,
    ];
    if (!site.email) {
      box.append(h('div', { class: 'collab-card reveal' }, inner));
      continue;
    }
    const subject = tr(topic.subject) || `${t('mailSubjectPrefix')}${title}`;
    const line = tr(topic.line) || t('mailLineDefault', { topic: title.toLowerCase() });
    box.append(h('a', {
      class: 'collab-card reveal',
      href: mailto(site.email, subject, `${t('mailHi', { name: firstName(site) })}\n\n${line}\n\n${t('mailAbout')}\n`),
    }, inner));
  }
}

function renderContact(site) {
  const cta = $('#cta');
  if (site.email) {
    cta.href = mailto(site.email, t('mailCtaSubject'),
      `${t('mailHi', { name: firstName(site) })}\n\n${t('mailCtaLine')}\n\n${t('mailCtaAbout')}\n`);
    cta.removeAttribute('target');
    cta.removeAttribute('rel');
  } else {
    cta.href = safeUrl((site.socials || {}).youtube) || FALLBACK_YOUTUBE;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
  }
  renderCollab(site);
  $('#socials').replaceChildren(...contactLinks(site).map((l) => linkEl(l)));
}

/* ---------- Video modal ---------- */
const modal = $('#modal');
const modalVideo = $('#modal-video');
let lastFocus = null;

function openModal(p) {
  lastFocus = document.activeElement;
  modalVideo.poster = safeUrl(p.poster) || '';
  modalVideo.src = safeUrl(p.video);
  $('#modal-title').textContent = tr(p.title);
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

/* ---------- Render everything for the current language ---------- */
function renderFallback() {
  $('#work-grid').replaceChildren(h('div', { class: 'notice' },
    h('p', { text: `${t('loadError')} ` }),
    h('a', { href: FALLBACK_YOUTUBE, target: '_blank', rel: 'noopener noreferrer', text: t('loadErrorLink') })));
  $('#tabs').hidden = true;
  renderContact({ socials: { youtube: FALLBACK_YOUTUBE } });
  buildMarquee($('.hero .row-lime .marquee-track'), [t('heroWork')]);
  buildMarquee($('#cta .marquee-track'), [t('cta')]);
  $('#about').hidden = true;
}

function renderAll() {
  const { site, projects } = state;
  applyStatic();
  setMenuLabel();
  if (!site) { renderFallback(); return; }
  $('#work-count').textContent = String(projects.length);
  renderMarquees(site);
  renderAbout(site, projects);
  renderWork(projects);
  renderContact(site);
}

/* ---------- Boot ---------- */
async function main() {
  applyStatic();
  setupNav();
  onLangChange(() => {
    renderAll();
    anim.refresh(); // positions changed; new tiles are simply visible (no replay of the scroll reveals)
  });

  try {
    const [site, projects] = await Promise.all([loadJSON('data/site.json'), loadJSON('data/projects.json')]);
    if (!Array.isArray(projects)) throw new Error('projects.json must be a list');
    state.site = site;
    state.projects = projects
      .filter((p) => p && en(p.title).trim())
      .map((p) => ({ ...p, type: (p.type || 'Project').toString() }));
  } catch (err) {
    console.error('Could not load site data:', err);
    state.site = null;
  }

  renderAll();
  anim.start();
}

main();
