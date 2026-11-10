import { SERVICES } from './core.js';
const send = message => chrome.runtime.sendMessage(message);
document.getElementById('openWorkspace').onclick = () => send({ type: 'launch' });
const state = await send({ type: 'state' });
for (const [key, value] of Object.entries(state.prefs)) {
  const el = document.getElementById(key); if (!el) continue;
  if (el.type === 'checkbox') el.checked = value; else el.value = String(value);
}
for (const service of SERVICES) document.getElementById(`notify-${service.id}`).checked = state.prefs.notifications[service.id];
document.querySelector('form').onsubmit = async e => {
  e.preventDefault();
  const prefs = Object.fromEntries(['theme','zoom','badges','externalLinks'].map(key => {
    const el = document.getElementById(key); return [key, el.type === 'checkbox' ? el.checked : el.value];
  }));
  prefs.notifications = Object.fromEntries(SERVICES.map(s => [s.id, document.getElementById(`notify-${s.id}`).checked]));
  const result = await send({ type: 'prefs', prefs });
  document.getElementById('status').textContent = result?.error || 'Saved';
};
const diagnose = async () => { document.getElementById('diagnostics').textContent = JSON.stringify(await send({ type: 'diagnostics' }), null, 2); };
document.getElementById('diagnose').onclick = diagnose;
diagnose();
document.getElementById('configureShortcuts').onclick = () => send({ type: 'shortcuts' });
const setup = await send({ type: 'notification-status' });
document.getElementById('notificationPermission').textContent = setup?.permission === 'granted'
  ? 'Chrome allows Fourdock notifications. If no banner appears, check macOS notification settings and Focus.'
  : 'Fourdock notifications are blocked in Chrome. Enable them in Chrome notification settings.';
for (const service of SERVICES) {
  const entry = document.createElement('li');
  const shortcut = setup?.commands?.find(c => c.name === `focus-${service.id}`)?.shortcut;
  entry.textContent = `${service.name}: ${shortcut || 'Not assigned — configure shortcuts'}`;
  document.getElementById('shortcuts').append(entry);
  const button = document.createElement('button'); button.type = 'button'; button.textContent = `Test ${service.name}`;
  button.onclick = async () => {
    const result = await send({ type: 'notification-test', service: service.id });
    document.getElementById('testStatus').textContent = result?.ok
      ? `Test submitted for ${service.name}. Check the banner and click it to open the service.`
      : 'The notification could not be created. Check notification permissions.';
  };
  document.getElementById('notificationTests').append(button);
}
