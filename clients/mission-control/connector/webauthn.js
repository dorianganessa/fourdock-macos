// Standard WebAuthn serialization; follows the public-domain WA Passkey Connector
// architecture with strict origin, verification, size and trusted-gesture checks.
export async function performPasskey(key) {
  let host, timer, controller;
  try {
    if (location.origin !== 'https://web.whatsapp.com' || window.top !== window) throw new Error();
    const decode = value => {
      if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,8192}$/.test(value)) throw new Error();
      return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
    };
    const encode = value => btoa(String.fromCharCode(...new Uint8Array(value))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
    if (!key || !['whatsapp.com', 'web.whatsapp.com'].includes(key.rpId)) throw new Error();
    const extensions = key.extensions || {};
    if (Object.keys(extensions).some(k => k !== 'uvm') || (Object.hasOwn(extensions, 'uvm') && typeof extensions.uvm !== 'boolean')) throw new Error();
    const options = { rpId: key.rpId, challenge: decode(key.challenge), userVerification: 'required', timeout: 120000,
      extensions, allowCredentials: (key.allowCredentials || []).map(c => {
        if (c.type !== 'public-key') throw new Error();
        return { type: 'public-key', id: decode(c.id) };
      }) };
    controller = new AbortController();
    host = document.createElement('div'); host.id = 'fourdock-passkey';
    host.style.cssText = 'position:fixed;inset:24px;z-index:2147483647;background:#fff;color:#17252a;padding:32px;border:4px solid #0e7660;border-radius:18px;font:20px system-ui';
    const shadow = host.attachShadow({ mode: 'closed' });
    const text = document.createElement('p'); text.textContent = 'Collega Fourdock WhatsApp con la tua passkey. La chiave privata resta nel tuo gestore passkey.';
    const button = document.createElement('button'); button.textContent = 'Verifica passkey per Fourdock';
    const cancel = document.createElement('button'); cancel.textContent = 'Annulla';
    button.style.cssText = cancel.style.cssText = 'font:20px system-ui;padding:16px;margin:12px';
    shadow.append(text, button, cancel); document.documentElement.append(host);
    const credential = await new Promise((resolve, reject) => {
      const stop = () => { controller.abort(); reject(new Error()); };
      timer = setTimeout(stop, 120000);
      host.addEventListener('fourdock-cancel', stop, { once: true });
      cancel.onclick = event => { if (event.isTrusted) stop(); };
      button.onclick = async event => {
        if (!event.isTrusted || button.disabled) return;
        button.disabled = true;
        try { resolve(await navigator.credentials.get({ publicKey: options, signal: controller.signal })); }
        catch { stop(); }
      };
    });
    if (!credential || credential.type !== 'public-key') throw new Error();
    return { ok: true, assertion: { id: credential.id, rawId: encode(credential.rawId), type: 'public-key', response: {
      clientDataJSON: encode(credential.response.clientDataJSON), authenticatorData: encode(credential.response.authenticatorData),
      signature: encode(credential.response.signature), userHandle: credential.response.userHandle ? encode(credential.response.userHandle) : null,
    } } };
  } catch { return { ok: false, code: 'passkey-not-completed' }; }
  finally { clearTimeout(timer); controller?.abort(); host?.remove(); }
}
