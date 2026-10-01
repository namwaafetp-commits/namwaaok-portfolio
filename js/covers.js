// Generated project covers: deterministic per title, colored per type.

const TYPE_COLORS = {
  App: '#c6ff3d',
  Research: '#22d3ee',
  Design: '#ff5fa2',
  Video: '#ff9f43',
};

function hash(str) {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function typeColor(type) {
  if (TYPE_COLORS[type]) return TYPE_COLORS[type];
  return `hsl(${hash(type) % 360} 90% 62%)`;
}

// Returns the cover element for a project. A real image (image/poster) wins over the generated look.
export function coverFor(project) {
  const el = document.createElement('div');
  el.className = 'cover';
  el.setAttribute('aria-hidden', 'true');

  const src = project.image || project.poster;
  if (src) {
    el.classList.add('cover-img');
    el.style.backgroundImage = `url("${src}")`;
    if (project.imageFit === 'contain') {
      el.classList.add('cover-contain'); // artwork on a flat color instead of a full-bleed photo
      if (project.coverColor) el.style.backgroundColor = project.coverColor;
    }
    if (project.imagePos) el.style.backgroundPosition = project.imagePos;
    return el;
  }

  const h = hash(project.title);
  el.style.setProperty('--c', typeColor(project.type));
  el.style.setProperty('--x1', `${15 + (h % 60)}%`);
  el.style.setProperty('--y1', `${20 + ((h >> 6) % 50)}%`);
  el.style.setProperty('--x2', `${35 + ((h >> 12) % 55)}%`);
  el.style.setProperty('--y2', `${40 + ((h >> 18) % 50)}%`);
  el.style.setProperty('--rot', `${((h >> 4) % 36) - 18}deg`);
  el.style.setProperty('--delay', `${-((h % 90) / 10)}s`);

  const letter = document.createElement('span');
  letter.className = 'cover-letter';
  letter.textContent = project.title.trim().charAt(0).toUpperCase();
  el.appendChild(letter);
  return el;
}
