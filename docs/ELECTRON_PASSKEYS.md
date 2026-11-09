# Electron viability for the owner's phone passkey flow

Checked 2026-11-09 against the latest stable Electron **45.2.3**, released
2026-11-04, and its pinned Chromium **156.0.8078.80**. This is a source/issue audit,
not a real account or hardware execution test. Astra was consulted specifically
about Android cross-device authentication after the broader alternatives study.

## Finding

Stock Electron is **not a ready solution** for the required phone-passkey path.
Its current embedder does not configure Chromium's hybrid/caBLE discovery. A
normal JavaScript Fourdock wrapper cannot supply the missing browser-process
integration through the currently published session APIs. Merely enabling
`app.configureWebAuthn({ platformPasskeys: true })` does not implement this path.

There is a concrete internal-development alternative: a patched Electron runtime
with hybrid support, a QR presentation/cancellation UI, normal Bluetooth permission
handling and our own accepted app distribution. It remains research/development,
not an established fix for this Mac or the user's WhatsApp account.

## Evidence from the released source

The official release page and the versioned DEPS file identify the versions above.
[Release](https://releases.electronjs.org/release/v45.2.3),
[DEPS](https://github.com/electron/electron/blob/v45.2.3/DEPS).

In Electron v45.2.3:

- `ElectronAuthenticatorRequestClientDelegate` does not override
  `ConfigureDiscoveries`, which is the embedder hook for configuring hybrid discovery.
- Its `RegisterActionCallbacks` stores cancellation/request callbacks, but does
  not retain the supplied Bluetooth power/permission callbacks.
- Platform discovery adds Electron's Apple platform-passkey authenticator when
  enabled; this is a separate implementation, not a phone-hybrid QR integration.

[Versioned delegate declaration](https://github.com/electron/electron/blob/v45.2.3/shell/browser/webauthn/electron_authenticator_request_client_delegate.h),
[versioned implementation](https://github.com/electron/electron/blob/v45.2.3/shell/browser/webauthn/electron_authenticator_request_client_delegate.cc).

In the pinned Chromium version, the base `ConfigureDiscoveries` implementation is
empty. The FIDO discovery factory only creates the hybrid discovery when Bluetooth
LE is supported **and a QR generator key has been configured**; otherwise that
branch returns an empty result. Combined with Electron's unimplemented hook, this
is source-level evidence for the missing phone path, not merely the absence of
a successful test or a feature name in the docs.
[Chromium default delegate](https://github.com/chromium/chromium/blob/156.0.8078.80/content/public/browser/authenticator_request_client_delegate.cc#L72-L82),
[Chromium factory](https://github.com/chromium/chromium/blob/156.0.8078.80/device/fido/fido_discovery_factory.cc#L73-L98).

A WebAuthn capability flag, the existence of navigator.credentials, a virtual
authenticator test, or an iCloud passkey feature announcement does not demonstrate
that the Android phone transport starts. This audit does not identify the exact
cause of the owner's previous Ferdium failure: no account WebAuthn request or
authentication payload was inspected.

## The pending hybrid implementation

Upstream PR **55427**, opened 2026-10-28, explicitly addresses this missing path.
Its proposed session events expose a FIDO QR payload and request completion to
the application; the runtime configures Chromium's hybrid discovery. It depends
on PR **55426**. Both were **open and unmerged** when checked through GitHub's API.
The earlier PR **53733** was also still open/draft and unmerged.
[Hybrid PR](https://github.com/electron/electron/pull/55427),
[dependency](https://github.com/electron/electron/pull/55426),
[earlier draft](https://github.com/electron/electron/pull/53733).

The new PR author reports a hardware test on **Linux with a Galaxy S25 Ultra on
github.com**, including interaction with a YubiKey. This is useful evidence for
that implementation, but it does not establish macOS, WhatsApp or the owner's
account flow. The earlier draft describes deferred macOS hardware verification.
The proposal also calls for the application to present the QR and handle its
completion; adding a session listener to stock Electron cannot make an absent
runtime event exist.

A patched Fourdock would need to integrate and maintain the runtime changes,
check their compatibility with the selected Chromium revision, build/test macOS
artifacts, implement trusted QR/cancel/timeout presentation, preserve each service's
origin/session, and request Bluetooth access through the normal OS mechanism.
It must preserve the protocol's origin verification and user consent. This is
not a credential polyfill or an origin/security override. It is also a larger
maintenance commitment than using an unmodified Electron dependency.

## Why the new Apple platform-passkey API is not the answer by itself

Electron's platform-passkey implementation uses Apple's public
ASAuthorizationController and requires provisioned Associated Domains plus the
provider's apple-app-site-association declaration for our Team ID/bundle ID. We
cannot add such an association for WhatsApp or Google by changing Fourdock's
plist. Touch ID credentials local to the app are also not the user's phone passkey.
[Versioned Electron API documentation](https://github.com/electron/electron/blob/v45.2.3/docs/api/app.md),
[versioned native implementation](https://github.com/electron/electron/blob/v45.2.3/shell/browser/webauthn/electron_platform_passkeys_authenticator_mac.mm).

Chromium's hybrid protocol is a distinct route: the phone acts as the authenticator
through Chromium's FIDO machinery. The proposed implementation does not solve this
by claiming an AASA association with third-party sites. Ordinary app distribution,
Bluetooth permission and genuine site acceptance still need testing. A normal
WhatsApp device-linking QR and a WebAuthn FIDO QR are different steps; success or
failure of one is not proof about the other.

## Decision for Fourdock

Do not proceed with a full stock-Electron UI on the assumption that it fixes the
mandatory phone-passkey gate. The earlier recommendation that Electron was a
promising general-purpose shell is superseded **for this requirement** by this
specific source audit. Ferdium remains excluded by the owner; no new pairing is
requested for it. Paguro/forks without the necessary passkey capability remain
outside the accepted solution.

The actionable choices are an explicitly scoped patched-Electron feasibility
experiment, or a host that already implements the required browser passkey path.
Neither choice is implemented by this research. If a patched experiment is chosen,
its first acceptance test must be the real macOS-to-Android passkey flow, followed
by WhatsApp linking/session persistence and corporate Gmail. Synthetic tests alone
cannot pass this gate. Signature acceptance remains a separate unresolved issue
for our own target bundle; runtime patches do not address AMFI -423.

No Electron binary was installed or launched, no Chromium fork was built, no real
account or phone was accessed, and no credentials, passkeys, TLS/origin settings,
browser profiles or device-management settings were changed during this audit.
