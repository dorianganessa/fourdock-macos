const send = message => chrome.runtime.sendMessage(message);
document.getElementById('openWorkspace').onclick = () => send({ type: 'launch' });
const state = await send({ type: 'state' });
for (const [key, value] of Object.entries(state.prefs)) {
  const el = document.getElementById(key); if (!el) continue;
  if (el.type === 'checkbox') el.checked = value; else el.value = String(value);
}
document.querySelector('form').onsubmit = async e => {
  e.preventDefault();
  const prefs = Object.fromEntries(['theme','zoom','badges','externalLinks'].map(key => {
    const el = document.getElementById(key); return [key, el.type === 'checkbox' ? el.checked : el.value];
  }));
  const result = await send({ type: 'prefs', prefs });
  document.getElementById('status').textContent = result?.error || 'Saved';
};
const diagnose = async () => { document.getElementById('diagnostics').textContent = JSON.stringify(await send({ type: 'diagnostics' }), null, 2); };
document.getElementById('diagnose').onclick = diagnose;
diagnose();
