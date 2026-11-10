import React, { useEffect, useRef, useState } from 'react';

type PairState = { mode?: string; phase: string; active?: boolean; owner?: string; failure?: string;
  request?: { type: string; id?: string; png?: string; code?: string; publicKey?: Record<string, unknown> } };
const api = async (route = '', method = 'GET', owner = '', body?: unknown): Promise<PairState> => {
  const response = await fetch(`/api/pairing${route}`, { method, cache: 'no-store', headers: {
    'Content-Type': 'application/json', 'X-Fourdock-Request': '1', 'X-Fourdock-Owner': owner,
  }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!response.ok) throw new Error(response.status === 409 ? 'Collegamento già presente o in corso.' : 'Operazione non completata.');
  return response.json() as Promise<PairState>;
};

export function Fourdock() {
  const [state, setState] = useState<PairState>({ phase: 'idle' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [installed, setInstalled] = useState(window.matchMedia?.('(display-mode: standalone)')?.matches ?? false);
  const owner = useRef('');
  const install = useRef<Event & { prompt(): Promise<void> } | null>(null);
  useEffect(() => {
    const poll = () => { api('', 'GET', owner.current).then(setState).catch(() => {}); };
    poll(); const timer = expanded ? setInterval(poll, 1000) : undefined;
    const onInstall = (event: Event) => { event.preventDefault(); install.current = event as typeof install.current; };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => { clearInterval(timer); window.removeEventListener('beforeinstallprompt', onInstall); window.removeEventListener('appinstalled', onInstalled); };
  }, [expanded]);
  const perform = async (action: () => Promise<void>) => {
    setBusy(true); setError(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Operazione non completata.'); }
    finally { setBusy(false); }
  };
  const demo = state.mode !== 'live';
  const verify = async () => {
    const request = state.request;
    if (!request?.id || !request.publicKey) return;
    let assertion: unknown;
    if (demo) {
      const data = btoa(JSON.stringify({ type: 'webauthn.get', origin: 'https://web.whatsapp.com', challenge: request.publicKey.challenge })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      assertion = { type: 'public-key', id: 'synthetic-only', response: { clientDataJSON: data, signature: 'synthetic', authenticatorData: 'synthetic' } };
    } else {
      const config = await (await fetch('/connector.json')).json() as { extensionId: string };
      const runtime = (window as unknown as { chrome?: { runtime?: { sendMessage(id: string, message: unknown, callback: (value: unknown) => void): void; lastError?: unknown } } }).chrome?.runtime;
      if (!runtime?.sendMessage) throw new Error('Carica il connettore Fourdock in Chrome per confermare la passkey.');
      const result = await new Promise<{ ok?: boolean; assertion?: unknown }>((resolve, reject) => {
        runtime.sendMessage(config.extensionId, { type: 'assert', publicKey: request.publicKey }, value => {
          if (runtime.lastError) { reject(new Error('Connettore Fourdock non disponibile.')); return; }
          resolve(value as { ok?: boolean; assertion?: unknown });
        });
      });
      if (!result?.ok || !result.assertion) throw new Error('Passkey non confermata. Puoi annullare il collegamento.');
      assertion = result.assertion;
    }
    await api('/reply', 'POST', owner.current, { type: 'passkey', id: request.id, assertion });
    assertion = undefined;
  };
  const notify = async () => {
    if (!('Notification' in window)) throw new Error('Notifiche non disponibili in questo browser.');
    if (await Notification.requestPermission() !== 'granted') throw new Error('Consenti le notifiche di questa app nelle impostazioni.');
    const service = await navigator.serviceWorker.ready;
    await service.showNotification('Fourdock WhatsApp', { body: 'Notifica di prova: nessun messaggio è stato inviato.', icon: '/icons/app-192.png', tag: 'fourdock-test' });
    const badges = navigator as Navigator & { setAppBadge?: (count: number) => Promise<void> };
    await badges.setAppBadge?.(3);
  };
  return <section className="px-4 py-2 border-b border-mc-border bg-mc-surface text-mc-text text-xs" aria-label="Fourdock">
    <div className="flex items-center gap-3 flex-wrap">
      <strong>Fourdock WhatsApp</strong>
      <span>{demo ? 'DEMO · solo conversazioni sintetiche' : 'Client separato · WhatsApp'}</span>
      <button onClick={() => setExpanded(!expanded)} className="underline">{expanded ? 'Chiudi collegamento' : 'Collega WhatsApp'}</button>
      {!installed && <button className="underline" onClick={() => perform(async () => {
        if (install.current) await install.current.prompt();
        else setError('Nel menu Chrome scegli Trasmetti, salva e condividi → Installa pagina come app.');
      })}>Installa come app</button>}
      <button className="underline" onClick={() => perform(notify)}>Prova notifica e badge</button>
    </div>
    {expanded && <div className="py-3 flex gap-3 flex-col max-w-xl">
      <p>{demo ? 'Questa prova simula il collegamento. Non scansionare codici e non usare una passkey reale.' : 'Collega un nuovo dispositivo con la tua passkey. La sessione resta in questa istanza del client.'}</p>
      <p role="status">{state.failure ? 'Collegamento interrotto. Nessun nuovo tentativo automatico.' : state.phase === 'paired' ? 'Collegamento completato.' : state.phase === 'passkey' ? 'Conferma la passkey per continuare.' : state.phase === 'confirm' ? 'Conferma il collegamento.' : state.active ? 'Collegamento in corso…' : 'Pronto per iniziare.'}</p>
      {!state.active && state.phase !== 'paired' && <button disabled={busy} onClick={() => perform(async () => {
        const started = await api('/start', 'POST'); owner.current = started.owner || ''; setState({ ...started, mode: state.mode });
      })}>{demo ? 'Avvia simulazione' : 'Avvia collegamento'}</button>}
      {state.request?.type === 'qr' && !demo && <><p>Sul telefono: WhatsApp → Dispositivi collegati → Collega un dispositivo.</p><img className="w-56 bg-white" src={`data:image/png;base64,${state.request.png}`} alt="Codice per collegare questo client" /></>}
      {state.request?.type === 'passkey' && <button disabled={busy} onClick={() => perform(verify)}>{demo ? 'Simula conferma passkey' : 'Verifica passkey nel browser'}</button>}
      {state.request?.type === 'confirm' && <><p>{state.request.code ? `Confronta con il telefono: ${state.request.code}` : 'Confermi di voler collegare questo client?'}</p><button disabled={busy} onClick={() => perform(async () => {
        await api('/reply', 'POST', owner.current, { type: 'confirm', id: state.request!.id, confirmed: true });
      })}>{demo ? 'Conferma simulazione' : state.request.code ? 'I codici corrispondono' : 'Confermo il collegamento'}</button></>}
      {state.active && owner.current && <button onClick={() => perform(async () => { await api('/cancel', 'POST', owner.current); owner.current = ''; })}>Annulla</button>}
      {state.phase === 'paired' && <button disabled={busy || state.active} onClick={() => perform(async () => { await api('/sync', 'POST'); setExpanded(false); })}>Carica conversazioni</button>}
    </div>}
    {error && <p role="alert" className="py-2">{error}</p>}
  </section>;
}
