import { performPasskey } from './webauthn.js';
const APP = 'http://127.0.0.1:4702';
let active = false;

async function ready(tabId) {
  for (let i = 0; i < 120; i++) {
    const tab = await chrome.tabs.get(tabId);
    // A newly created tab can briefly be complete at about:blank. Only inject
    // after the requested document has finished loading at the allowed origin.
    if (tab.status === 'complete' && tab.url && new URL(tab.url).origin === 'https://web.whatsapp.com') {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error();
}

chrome.runtime.onMessageExternal.addListener((message, sender, respond) => {
  try {
    if (!sender.url || new URL(sender.url).origin !== APP || sender.frameId !== 0 || !sender.tab?.id) return false;
  } catch { return false; }
  if (message?.type === 'ping') { respond({ ok: true }); return false; }
  if (message?.type !== 'assert' || active || JSON.stringify(message).length > 65536) {
    respond({ ok: false, code: 'request-refused' }); return false;
  }
  active = true;
  const execute = async () => {
    let tab;
    let stage = 'tab-create';
    try {
      tab = await chrome.tabs.create({ url: 'https://web.whatsapp.com/', active: true });
      stage = 'document-ready';
      await ready(tab.id);
      stage = 'passkey-injection';
      const result = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN', func: performPasskey, args: [message.publicKey] });
      if (result.length !== 1 || !result[0].result) throw new Error();
      return result[0].result;
    } catch { return { ok: false, code: stage }; }
    finally {
      active = false;
      if (tab) {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN',
          func: () => document.getElementById('fourdock-passkey')?.dispatchEvent(new Event('fourdock-cancel')) }).catch(() => {});
        const current = await chrome.tabs.get(tab.id).catch(() => null);
        if (current?.url && new URL(current.url).origin === 'https://web.whatsapp.com') await chrome.tabs.remove(tab.id).catch(() => {});
      }
      await chrome.tabs.update(sender.tab.id, { active: true }).catch(() => {});
      await chrome.windows.update(sender.tab.windowId, { focused: true }).catch(() => {});
    }
  };
  execute().then(respond);
  return true;
});
