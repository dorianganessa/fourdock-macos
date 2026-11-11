import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { readUnreadTotal } from '../../hooks/useUnreadBadge.ts';
import { notificationPermission, notificationsEnabled, requestNotificationPermission } from '../../lib/notifications.ts';

type PairState = { mode?: string; phase: string; active?: boolean; owner?: string; failure?: string; storedSession?: boolean;
  request?: { type: string; id?: string; png?: string; code?: string; publicKey?: Record<string, unknown> } };
const api = async (route = '', method = 'GET', owner = '', body?: unknown): Promise<PairState> => {
  const response = await fetch(`/api/pairing${route}`, { method, cache: 'no-store', headers: {
    'Content-Type': 'application/json', 'X-Fourdock-Request': '1', 'X-Fourdock-Owner': owner,
  }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!response.ok) throw new Error(response.status === 409 ? 'Collegamento già presente o in corso.' : 'Operazione non completata.');
  return response.json() as Promise<PairState>;
};

export function Fourdock() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PairState>({ phase: 'idle' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [noticeStatus, setNoticeStatus] = useState('');
  const testCleanup = useRef<(() => void) | undefined>(undefined);
  const [installed, setInstalled] = useState(window.matchMedia?.('(display-mode: standalone)')?.matches ?? false);
  const owner = useRef('');
  const install = useRef<Event & { prompt(): Promise<void> } | null>(null);
  useEffect(() => () => testCleanup.current?.(), []);
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
    testCleanup.current?.();
    setTestRunning(true);
    setNoticeStatus('Checking notification permission…');
    try {
      if (!('Notification' in window)) throw new Error('Notifications are unavailable in this browser.');
      if (await requestNotificationPermission() !== 'granted') throw new Error('Browser notification permission is blocked.');
      const badges = navigator as Navigator & { setAppBadge?: (count: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
      const restoreBadge = () => {
        const count = readUnreadTotal(queryClient);
        if (count) void badges.setAppBadge?.(count).catch(() => {});
        else void badges.clearAppBadge?.().catch(() => {});
      };
      // Keep the badge independent of banner delivery and restore real unread
      // state even when the browser rejects or never confirms the notification.
      void badges.setAppBadge?.(3).catch(() => {});
      let notice: Notification | undefined;
      let deadline: ReturnType<typeof setTimeout> | undefined;
      let complete = false;
      const restoreTimer = setTimeout(() => { restoreBadge(); notice?.close(); }, 10000);
      testCleanup.current = () => {
        complete = true; clearTimeout(deadline); clearTimeout(restoreTimer);
        if (notice) { notice.onshow = null; notice.onerror = null; notice.close(); }
        restoreBadge();
      };
      const report = (message: string) => {
        if (complete) return;
        complete = true; clearTimeout(deadline);
        setNoticeStatus(message); setTestRunning(false);
      };
      // Exercise the same page Notification API used by incoming messages.
      // No service-worker-ready wait: that promise can remain pending forever.
      notice = new Notification('Fourdock WhatsApp', {
        body: 'Demo sender: this is a sample message preview. No message was sent.',
        icon: '/icons/app-192.png', tag: 'fourdock-test', silent: false,
      });
      setNoticeStatus('Test preview created; waiting for browser feedback…');
      deadline = setTimeout(() => report('Browser gave no notification confirmation after 8 seconds.'), 8000);
      notice.onshow = () => report('Browser reported the test notification. If no banner appeared, check macOS notification delivery.');
      notice.onerror = () => report('The browser reported an error displaying the test preview.');
    } catch (reason) {
      setTestRunning(false);
      setNoticeStatus('The test failed before a preview could be displayed.');
      throw reason instanceof DOMException ? new Error(`${reason.name}: ${reason.message}`) : reason;
    }
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
      <button disabled={busy || testRunning} className="underline disabled:opacity-50" onClick={() => perform(notify)}>Prova notifica e badge</button>
    </div>
    {noticeStatus && <div role="status" className="py-2 space-y-1">
      <p>{noticeStatus}</p>
      <p>Incoming previews: {notificationsEnabled() ? 'ON' : 'OFF'} · Browser permission: {notificationPermission()} · Window: {window.matchMedia?.('(display-mode: standalone)')?.matches ? 'app' : 'browser'}</p>
    </div>}
    {expanded && <div className="py-3 flex gap-3 flex-col max-w-xl">
      <p>{demo ? 'Questa prova simula il collegamento. Non scansionare codici e non usare una passkey reale.' : 'Collega un nuovo dispositivo con la tua passkey. La sessione resta in questa istanza del client.'}</p>
      <p role="status">{state.failure ? 'Collegamento interrotto. Nessun nuovo tentativo automatico.' : state.phase === 'paired' ? 'Collegamento completato.' : state.phase === 'passkey' ? 'Conferma la passkey per continuare.' : state.phase === 'confirm' ? 'Conferma il collegamento.' : state.active ? 'Collegamento in corso…' : 'Pronto per iniziare.'}</p>
      {!state.active && !state.storedSession && state.phase !== 'paired' && <button disabled={busy} onClick={() => perform(async () => {
        const started = await api('/start', 'POST'); owner.current = started.owner || ''; setState({ ...started, mode: state.mode });
      })}>{demo ? 'Avvia simulazione' : 'Avvia collegamento'}</button>}
      {state.request?.type === 'qr' && !demo && <><p>Sul telefono: WhatsApp → Dispositivi collegati → Collega un dispositivo.</p><img className="w-56 bg-white" src={`data:image/png;base64,${state.request.png}`} alt="Codice per collegare questo client" /></>}
      {state.request?.type === 'passkey' && <button disabled={busy} onClick={() => perform(verify)}>{demo ? 'Simula conferma passkey' : 'Verifica passkey nel browser'}</button>}
      {state.request?.type === 'confirm' && <><p>{state.request.code ? `Confronta con il telefono: ${state.request.code}` : 'Confermi di voler collegare questo client?'}</p><button disabled={busy} onClick={() => perform(async () => {
        await api('/reply', 'POST', owner.current, { type: 'confirm', id: state.request!.id, confirmed: true });
      })}>{demo ? 'Conferma simulazione' : state.request.code ? 'I codici corrispondono' : 'Confermo il collegamento'}</button></>}
      {state.active && owner.current && <button onClick={() => perform(async () => { await api('/cancel', 'POST', owner.current); owner.current = ''; })}>Annulla</button>}
      {(state.phase === 'paired' || state.storedSession) && <button disabled={busy || state.active} onClick={() => perform(async () => { await api('/sync', 'POST'); setExpanded(false); })}>Carica conversazioni</button>}
    </div>}
    {error && <p role="alert" className="py-2">{error}</p>}
  </section>;
}
