(() => {
  if (window.top !== window || document.getElementById('fourdock-sidebar')) return;
  document.documentElement.dataset.fourdockService = {
    'web.whatsapp.com': 'whatsapp', 'web.telegram.org': 'telegram',
    'app.fastmail.com': 'fastmail', 'mail.google.com': 'gmail',
  }[location.hostname];
  const host = document.createElement('aside');
  host.id = 'fourdock-sidebar';
  host.style.cssText = 'position:fixed!important;inset:0 auto 0 0!important;width:68px!important;z-index:2147483647!important;display:block!important;transform:none!important;';
  // Keep cross-service badge text out of the site's ordinary DOM queries.
  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    :host { color-scheme:light dark; font:13px -apple-system,BlinkMacSystemFont,sans-serif; }
    nav { box-sizing:border-box; height:100dvh; width:68px; display:flex; align-items:center; flex-direction:column; padding:14px 8px; gap:10px; background:light-dark(#f2f3f7,#202126); border-right:1px solid light-dark(#ddd,#37383c); color:light-dark(#23242c,#f4f4f6); }
    .brand { font-size:20px; font-weight:750; padding:6px 0 14px; color:#6d74df; }
    button { all:unset; box-sizing:border-box; cursor:pointer; width:46px; height:46px; text-align:center; border-radius:13px; font-weight:650; position:relative; color:inherit; }
    button:hover,button:focus-visible { background:light-dark(#e0e2ef,#353640); outline:2px solid #7b83ed; }
    button[aria-current=true] { background:#686fda; color:white; }
    small { position:absolute; right:-3px; top:-3px; border-radius:10px; background:#d53956; color:white; font-size:10px; min-width:16px; padding:2px; }
    small:empty { display:none; } .spacer { flex:1; } .utility { font-size:19px; height:36px; }
    .offline { color:#e9a23b; font-size:10px; text-align:center; }`;
  shadow.append(style);
  const nav = document.createElement('nav'); nav.setAttribute('aria-label', 'Fourdock services');
  const brand = document.createElement('span'); brand.className = 'brand'; brand.textContent = '⁙'; brand.title = 'Fourdock'; nav.append(brand);
  const services = [['whatsapp','WhatsApp','W'],['telegram','Telegram','T'],['fastmail','Fastmail','F'],['gmail','Gmail','G']];
  const buttons = {};
  let preferences = { externalLinks: true };
  const send = message => chrome.runtime.sendMessage(message).catch(() => null);
  for (const [id, name, letter] of services) {
    const b = document.createElement('button'); b.textContent = letter; b.title = `${name} · ⌘${services.findIndex(s => s[0] === id) + 1}`; b.setAttribute('aria-label', b.title);
    const badge = document.createElement('small'); b.append(badge); buttons[id] = { b, badge };
    b.onclick = () => send({ type: 'select', service: id }); nav.append(b);
  }
  const spacer = document.createElement('div'); spacer.className = 'spacer'; nav.append(spacer);
  const offline = document.createElement('span'); offline.className = 'offline'; nav.append(offline);
  const network = () => { offline.textContent = navigator.onLine ? '' : 'Offline'; }; network();
  window.addEventListener('online', network); window.addEventListener('offline', network);
  for (const [label, symbol, type] of [['Reload this service','↻','reload'],['Hide workspace (keeps services alive)','⌄','hide'],['Preferences and diagnostics','⚙','options']]) {
    const b = document.createElement('button'); b.className = 'utility'; b.textContent = symbol; b.title = label; b.setAttribute('aria-label', label); b.onclick = () => send({ type }); nav.append(b);
  }
  shadow.append(nav); document.documentElement.append(host);
  function update(state) {
    if (!state) return;
    if (state.prefs) preferences = state.prefs;
    if (state.service) for (const [id, item] of Object.entries(buttons)) item.b.setAttribute('aria-current', String(id === state.service));
    for (const [id, item] of Object.entries(buttons)) item.badge.textContent = state.badges?.[id] ? String(Math.min(999, state.badges[id])) : '';
    host.style.colorScheme = state.prefs?.theme === 'system' ? 'light dark' : (state.prefs?.theme || 'light dark');
  }
  send({ type: 'state' }).then(update);
  chrome.runtime.onMessage.addListener(message => { if (message.type === 'state') update(message); });
  document.addEventListener('keydown', e => {
    if (e.metaKey && !e.altKey && !e.ctrlKey && /^[1-4]$/.test(e.key)) {
      e.preventDefault(); e.stopImmediatePropagation(); send({ type: 'select', service: services[Number(e.key)-1][0] });
    }
  }, true);
  // Only ordinary anchor clicks leave the workspace. window.open, forms,
  // redirects and authentication popups retain the browser's normal context.
  document.addEventListener('click', async e => {
    if (!preferences.externalLinks) return;
    if (!e.isTrusted || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.composedPath().find(el => el instanceof HTMLAnchorElement);
    if (!a || a.hasAttribute('download')) return;
    let u; try { u = new URL(a.href); } catch { return; }
    if (!['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol)) return;
    if (u.origin === location.origin) return;
    // Explicit authentication links must remain in the full browser profile.
    if (/^(accounts\.google\.com|[^.]+\.microsoftonline\.com|login\.microsoftonline\.com|[^.]+\.okta\.com)$/.test(u.hostname)) return;
    e.preventDefault();
    const result = await send({ type: 'external', url: u.href });
    if (!result?.handled) window.open(u.href, '_blank', 'noopener');
  }, true);
})();
