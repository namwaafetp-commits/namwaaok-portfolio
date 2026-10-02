// Language state, UI strings and helpers. English is the fallback for anything missing in Thai.

const SUPPORTED = ['en', 'th'];

const UI = {
  en: {
    pageTitle: 'NAMWAAOK — Waritnun Anupat, MD',
    metaDescription: 'NAMWAAOK is the portfolio of Waritnun Anupat, MD: health apps, animations and research.',
    navWork: 'Work', navAbout: 'About', navCollab: 'Collaborate',
    menu: 'Menu', close: 'Close', menuAria: 'Open menu', langGroup: 'Language',
    heroScroll: 'Scroll to explore', works: 'works', heroWork: 'SELECTED WORK ↓', heroWorkAria: 'Jump to selected work',
    aboutEyebrow: '01 — About', aboutTitle: 'Who’s this',
    workEyebrow: '02 — Work', workTitle: 'Selected work', filterProjects: 'Filter projects',
    contactEyebrow: '03 — Collaborate', cta: 'LET’S BUILD TOGETHER →', ctaAria: 'Email me about collaborating',
    footNote: '© 2026 NAMWAAOK · Waritnun Anupat, MD',
    labelWho: 'Who', labelProjects: 'Projects', andCounting: 'and counting', labelFindMe: 'Find me',
    labelToolkit: 'Toolkit', labelLatest: 'Latest',
    open: 'Open ↗', watch: 'Watch ▶', soon: 'Coming soon', badgePrivate: 'Private · coming soon',
    tabAll: 'All', 'type.App': 'App', 'type.Video': 'Video', 'type.Research': 'Research',
    playAria: 'Play video: {title}', opensNew: '{title} (opens in a new tab)',
    emailMe: 'Email me ↗', linkEmail: 'Email',
    mailHi: 'Hi {name},', mailAbout: 'A bit about me / what I’m working on:',
    mailSubjectPrefix: 'Collaboration: ', mailLineDefault: 'I’d like to collaborate on {topic}.',
    mailCtaSubject: 'Collaboration', mailCtaLine: 'I’d like to collaborate with you.', mailCtaAbout: 'What I’m working on:',
    loadError: 'Couldn’t load the projects right now.', loadErrorLink: 'Watch my videos on YouTube ↗',
    modalClose: 'Close video', modalDialog: 'Video player', portrait: 'Portrait of {name}',
    motionPause: 'Pause animations', motionPlay: 'Play animations',
    carouselLabel: 'Animated explainer videos', prevVideo: 'Previous video', nextVideo: 'Next video', slideOf: 'Video {n} of {total}',
  },
  th: {
    pageTitle: 'NAMWAAOK — นพ.วริทธิ์นันท์ อนุพัฒน์',
    metaDescription: 'NAMWAAOK คือผลงานของ นพ.วริทธิ์นันท์ อนุพัฒน์: แอปสุขภาพ แอนิเมชัน และงานวิจัย',
    navWork: 'ผลงาน', navAbout: 'เกี่ยวกับ', navCollab: 'ร่วมงาน',
    menu: 'เมนู', close: 'ปิด', menuAria: 'เปิดเมนู', langGroup: 'ภาษา',
    heroScroll: 'เลื่อนลงเพื่อดูผลงาน', works: 'ผลงาน', heroWork: 'ผลงานเด่น ↓', heroWorkAria: 'ไปที่ผลงานเด่น',
    aboutEyebrow: '01 — เกี่ยวกับ', aboutTitle: 'ผมคือใคร',
    workEyebrow: '02 — ผลงาน', workTitle: 'ผลงานเด่น', filterProjects: 'กรองผลงาน',
    contactEyebrow: '03 — ร่วมงานกัน', cta: 'มาสร้างสิ่งดีๆ ด้วยกัน →', ctaAria: 'อีเมลหาผมเพื่อร่วมงานกัน',
    footNote: '© 2026 NAMWAAOK · นพ.วริทธิ์นันท์ อนุพัฒน์',
    labelWho: 'แนะนำตัว', labelProjects: 'ผลงาน', andCounting: 'และกำลังเพิ่มขึ้น', labelFindMe: 'ช่องทางติดต่อ',
    labelToolkit: 'เครื่องมือ', labelLatest: 'ล่าสุด',
    open: 'เปิดดู ↗', watch: 'ดูวิดีโอ ▶', soon: 'เร็วๆ นี้', badgePrivate: 'ยังไม่เปิดสาธารณะ · เร็วๆ นี้',
    tabAll: 'ทั้งหมด', 'type.App': 'แอป', 'type.Video': 'วิดีโอ', 'type.Research': 'งานวิจัย',
    playAria: 'เล่นวิดีโอ: {title}', opensNew: '{title} (เปิดในแท็บใหม่)',
    emailMe: 'ส่งอีเมลหาผม ↗', linkEmail: 'อีเมล',
    // Emails are written by the visitor, so the wording stays neutral (no gendered pronouns or particles).
    mailHi: 'เรียน {name}', mailAbout: 'แนะนำตัวสั้นๆ / สิ่งที่กำลังทำอยู่:',
    mailSubjectPrefix: 'ร่วมงาน: ', mailLineDefault: 'สนใจร่วมงานเรื่อง{topic}',
    mailCtaSubject: 'ร่วมงานกัน', mailCtaLine: 'สนใจร่วมงานกับคุณ', mailCtaAbout: 'สิ่งที่กำลังทำอยู่:',
    loadError: 'โหลดผลงานไม่สำเร็จในขณะนี้', loadErrorLink: 'ดูวิดีโอของผมบน YouTube ↗',
    modalClose: 'ปิดวิดีโอ', modalDialog: 'เครื่องเล่นวิดีโอ', portrait: 'ภาพถ่ายของ {name}',
    motionPause: 'หยุดการเคลื่อนไหว', motionPlay: 'เปิดการเคลื่อนไหว',
    carouselLabel: 'วิดีโออนิเมชันให้ความรู้', prevVideo: 'วิดีโอก่อนหน้า', nextVideo: 'วิดีโอถัดไป', slideOf: 'วิดีโอ {n} จาก {total}',
  },
};

// ?lang=th|en wins, then the saved choice, then the browser language.
function detect() {
  const forced = new URLSearchParams(window.location.search).get('lang');
  if (SUPPORTED.includes(forced)) return forced;
  try {
    const saved = window.localStorage.getItem('lang');
    if (SUPPORTED.includes(saved)) return saved;
  } catch { /* storage can be blocked (private mode); fall through */ }
  const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  return prefs.some((l) => /^th/i.test(l)) ? 'th' : 'en';
}

let current = detect();
const listeners = [];

export const getLang = () => current;
export const onLangChange = (cb) => listeners.push(cb);

export function t(key, vars) {
  let s = (UI[current] && UI[current][key]) ?? UI.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

// Content from the JSON files: a plain string, or { en, th }.
export const tr = (v) => (typeof v === 'string' ? v : (v && (v[current] ?? v.en)) || '');
export const en = (v) => (typeof v === 'string' ? v : (v && v.en) || '');

// Fills every element marked data-i18n / data-i18n-aria and syncs <html lang>, title and the switch buttons.
export function applyStatic() {
  document.documentElement.lang = current;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.title = t('pageTitle');
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', t('metaDescription'));
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === current)));
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === current) return;
  current = lang;
  try { window.localStorage.setItem('lang', lang); } catch { /* ignore */ }
  // If the address carries ?lang=, keep it in step so a reload doesn't flip back.
  const url = new URL(window.location.href);
  if (url.searchParams.has('lang')) {
    url.searchParams.set('lang', lang);
    window.history.replaceState(null, '', url);
  }
  applyStatic();
  listeners.forEach((cb) => cb(lang));
}
