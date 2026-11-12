const KEY = 'fourdock_confirm_sends';

/** Immediate sends follow Enter/click directly unless the user requests a dialog. */
export function sendConfirmationEnabled(): boolean {
  try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
}

export function setSendConfirmationEnabled(enabled: boolean): void {
  try { localStorage.setItem(KEY, String(enabled)); } catch { /* Session still works. */ }
}
