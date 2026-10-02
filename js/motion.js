// Motion is ON by default. A visitor can pause it with the nav button; the choice is remembered.
// ?motion=on|off in the address overrides everything (handy for previews).

function detect() {
  const forced = new URLSearchParams(window.location.search).get('motion');
  if (forced === 'on' || forced === 'off') return forced === 'on';
  try {
    const saved = window.localStorage.getItem('motion');
    if (saved === 'on' || saved === 'off') return saved === 'on';
  } catch { /* storage can be blocked (private mode); fall through */ }
  return true;
}

export const motionOn = detect();

// Reloading is the simplest way to switch every animation, loop and timer in one go.
export function setMotion(on) {
  try { window.localStorage.setItem('motion', on ? 'on' : 'off'); } catch { /* ignore */ }
  const url = new URL(window.location.href);
  if (url.searchParams.has('motion')) url.searchParams.set('motion', on ? 'on' : 'off');
  window.location.href = url.toString();
}
