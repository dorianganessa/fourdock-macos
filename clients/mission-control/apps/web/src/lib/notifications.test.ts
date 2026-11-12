import { describe, it, expect, beforeEach } from 'vitest';
import {
  NOTIFICATIONS_STORAGE_KEY,
  messageNotificationContent,
  notificationsEnabled,
  setNotificationsEnabled,
  shouldNotify,
  withNotificationNames,
} from './notifications.ts';
import type { UnifiedChat, UnifiedContact, UnifiedMessage } from '../types.ts';

function message(overrides: Partial<UnifiedMessage> = {}): UnifiedMessage {
  return {
    chatJid: 'alice@s.whatsapp.net',
    chatName: 'Alice',
    msgId: 'MSG-1',
    senderJid: 'alice@s.whatsapp.net',
    senderName: 'Alice',
    ts: '2026-09-01T11:00:00Z',
    fromMe: false,
    text: 'ping',
    displayText: 'ping',
    isForwarded: false,
    reactionToId: null,
    reactionEmoji: null,
    mediaType: null,
    mediaCaption: null,
    filename: null,
    mimeType: null,
    localPath: null,
    starred: false,
    bookmarked: false,
    edited: false,
    revoked: false,
    ...overrides,
  };
}

function chat(overrides: Partial<UnifiedChat> = {}): UnifiedChat {
  return {
    jid: 'alice@s.whatsapp.net',
    kind: 'dm',
    name: 'Alice',
    lastMessageTs: null,
    lastMessage: null,
    lastMessageFromMe: false,
    archived: false,
    pinned: false,
    mutedUntil: 0,
    unread: false,
    unreadCount: 0,
    ...overrides,
  };
}

/** The happy path every case below varies one field of. */
const ALLOWED = {
  msg: message(),
  chat: chat(),
  isViewingChat: false,
  documentVisible: true,
  enabled: true,
  supported: true,
  permission: 'granted' as NotificationPermission,
};

describe('shouldNotify', () => {
  it('notifies for an incoming message in a chat the operator is not watching', () => {
    expect(shouldNotify(ALLOWED)).toEqual({ show: true });
  });

  it('stays silent until the operator opts in', () => {
    expect(shouldNotify({ ...ALLOWED, enabled: false })).toEqual({ show: false, reason: 'disabled' });
  });

  it('stays silent without browser permission', () => {
    expect(shouldNotify({ ...ALLOWED, permission: 'default' })).toEqual({ show: false, reason: 'permission' });
    expect(shouldNotify({ ...ALLOWED, permission: 'denied' })).toEqual({ show: false, reason: 'permission' });
  });

  it('never notifies the operator about their own message', () => {
    expect(shouldNotify({ ...ALLOWED, msg: message({ fromMe: true }) })).toEqual({
      show: false,
      reason: 'own-message',
    });
  });

  it('ignores reactions, as every other surface in the app does', () => {
    expect(shouldNotify({ ...ALLOWED, msg: message({ reactionToId: 'MSG-0', reactionEmoji: '👍' }) })).toEqual({
      show: false,
      reason: 'reaction',
    });
  });

  it('respects a muted chat', () => {
    expect(shouldNotify({ ...ALLOWED, chat: chat({ mutedUntil: 1893456000 }) })).toEqual({
      show: false,
      reason: 'muted',
    });
  });

  it('does not ping for a message the operator is watching land', () => {
    expect(shouldNotify({ ...ALLOWED, isViewingChat: true })).toEqual({
      show: false,
      reason: 'already-watching',
    });
  });

  it('still pings for the open chat when the window is in the background', () => {
    expect(shouldNotify({ ...ALLOWED, isViewingChat: true, documentVisible: false })).toEqual({ show: true });
  });

  it('notifies for a chat the rail has never listed', () => {
    expect(shouldNotify({ ...ALLOWED, chat: undefined })).toEqual({ show: true });
  });
});

describe('messageNotificationContent', () => {
  const contact: UnifiedContact = { jid: 'alice@s.whatsapp.net', phone: '1234',
    name: 'Push name', alias: '', systemName: 'Alice in address book', updatedAt: null, tags: [] };

  it('prefers the address-book name to a push name or phone number', () => {
    const resolved = withNotificationNames(message({ senderName: '1234' }), chat(), contact);
    expect(messageNotificationContent(resolved).title).toBe('Alice in address book');
    expect(messageNotificationContent(withNotificationNames(message(), chat(), { ...contact, alias: 'My alias' })).title).toBe('My alias');
  });

  it('keeps the group subject while naming the participant from the address book', () => {
    const resolved = withNotificationNames(message({ chatJid: 'team@g.us', chatName: 'Old subject' }),
      chat({ jid: 'team@g.us', kind: 'group', name: 'Team' }), contact);
    expect(messageNotificationContent(resolved)).toMatchObject({ title: 'Team', body: 'Alice in address book: ping' });
  });

  it('uses the known chat name when contact details are missing', () => {
    expect(messageNotificationContent(withNotificationNames(message({ senderName: '1234' }), chat())).title).toBe('Alice');
    expect(messageNotificationContent(withNotificationNames(message({ senderName: '1234', chatName: '1234' }))).title).toBe('1234');
  });

  it('titles a direct message with the sender', () => {
    const content = messageNotificationContent(message());
    expect(content.title).toBe('Alice');
    expect(content.body).toBe('ping');
  });

  it('titles a group with the group and names the speaker in the body', () => {
    const content = messageNotificationContent(
      message({ chatJid: 'team@g.us', chatName: 'Ops Team', senderName: 'Bob' })
    );
    expect(content.title).toBe('Ops Team');
    expect(content.body).toBe('Bob: ping');
  });

  it('describes media instead of showing an empty body', () => {
    const content = messageNotificationContent(
      message({ text: '', displayText: '', mediaType: 'audio' })
    );
    expect(content.body).toBe('\u{1F3A4} Voice message');
  });

  it('tags per chat so one busy thread replaces itself instead of stacking', () => {
    expect(messageNotificationContent(message()).tag).toBe(
      messageNotificationContent(message({ msgId: 'MSG-2' })).tag
    );
    expect(messageNotificationContent(message({ chatJid: 'bob@s.whatsapp.net' })).tag).not.toBe(
      messageNotificationContent(message()).tag
    );
  });
});

describe('the stored preference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to off', () => {
    expect(notificationsEnabled()).toBe(false);
  });

  it('round-trips', () => {
    setNotificationsEnabled(true);
    expect(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)).toBe('true');
    expect(notificationsEnabled()).toBe(true);

    setNotificationsEnabled(false);
    expect(notificationsEnabled()).toBe(false);
  });
});
