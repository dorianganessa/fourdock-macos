import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Fourdock } from './Fourdock.tsx';

class TestNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn();
  static instances: TestNotification[] = [];
  onshow: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  constructor(public title: string, public options: NotificationOptions) {
    TestNotification.instances.push(this);
  }
}

function mount() {
  return render(<QueryClientProvider client={new QueryClient()}><Fourdock /></QueryClientProvider>);
}
async function pressTest() {
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Prova notifica e badge' })); });
}

describe('Fourdock notification test', () => {
  beforeEach(() => {
    // React's async act uses setImmediate; keep that scheduler real while
    // controlling only the UI deadlines being tested.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    TestNotification.permission = 'granted';
    TestNotification.instances = [];
    TestNotification.requestPermission.mockReset();
    TestNotification.requestPermission.mockResolvedValue('granted');
    vi.stubGlobal('Notification', TestNotification);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ mode: 'demo', phase: 'idle' }) }));
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: new Promise(() => {}) } });
    Object.defineProperty(navigator, 'setAppBadge', { configurable: true, value: vi.fn().mockResolvedValue(undefined) });
    Object.defineProperty(navigator, 'clearAppBadge', { configurable: true, value: vi.fn().mockResolvedValue(undefined) });
  });
  afterEach(() => { cleanup(); vi.clearAllTimers(); vi.unstubAllGlobals(); vi.useRealTimers(); });

  it('sends a preview even when the service worker never becomes ready, without requesting permission again', async () => {
    mount();
    await pressTest();
    expect(TestNotification.instances).toHaveLength(1);
    expect(TestNotification.instances[0].title).toBe('Fourdock WhatsApp');
    expect(TestNotification.instances[0].options.body).toContain('Demo sender');
    expect(TestNotification.requestPermission).not.toHaveBeenCalled();
    expect(navigator.setAppBadge).toHaveBeenCalledWith(3);
    act(() => TestNotification.instances[0].onshow?.());
    expect(screen.getByText(/browser reported the test notification/i)).toBeInTheDocument();
  });

  it('bounds a silent browser response and restores the real badge instead of leaving the test number', async () => {
    mount();
    await pressTest();
    expect(TestNotification.instances).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Prova notifica e badge' })).toBeDisabled();
    act(() => { vi.advanceTimersByTime(8000); });
    expect(screen.getByText(/no notification confirmation after 8 seconds/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prova notifica e badge' })).toBeEnabled();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(navigator.clearAppBadge).toHaveBeenCalled();
    expect(TestNotification.instances[0].close).toHaveBeenCalled();
  });

  it('reports browser delivery errors without waiting indefinitely', async () => {
    mount();
    await pressTest();
    expect(TestNotification.instances).toHaveLength(1);
    act(() => TestNotification.instances[0].onerror?.());
    expect(screen.getByText(/browser reported an error displaying/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prova notifica e badge' })).toBeEnabled();
  });

  it('reports denied permission without asking again or changing the badge', async () => {
    TestNotification.permission = 'denied';
    mount();
    await pressTest();
    expect(screen.getByRole('alert')).toHaveTextContent('Browser notification permission is blocked.');
    expect(TestNotification.requestPermission).not.toHaveBeenCalled();
    expect(TestNotification.instances).toHaveLength(0);
    expect(navigator.setAppBadge).not.toHaveBeenCalled();
  });

  it('surfaces constructor failure and still cleans up the synthetic badge', async () => {
    vi.stubGlobal('Notification', class extends TestNotification {
      constructor(title: string, options: NotificationOptions) {
        super(title, options);
        throw new DOMException('Synthetic constructor rejection', 'NotSupportedError');
      }
    });
    const view = mount();
    await pressTest();
    expect(screen.getByRole('alert')).toHaveTextContent('Synthetic constructor rejection');
    expect(screen.getByText(/test failed before a preview/i)).toBeInTheDocument();
    view.unmount();
    expect(navigator.clearAppBadge).toHaveBeenCalled();
  });
});
