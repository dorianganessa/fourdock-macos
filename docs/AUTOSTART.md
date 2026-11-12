# Automatic startup and reconnection

The WhatsApp candidate uses a per-user macOS launch agent for its private SSH
connection and an opt-in saved-session check on the Linux backend. The existing
four-service Chrome workspace and production monitor are separate.

## Mac connection

`dev.fourdock.whatsapp-tunnel` runs the system `/usr/bin/ssh` when the user logs in.
launchd restarts it if it exits; SSH keepalives detect broken connections. It
listens only on 127.0.0.1:4702. Host-key verification stays strict and BatchMode
prevents unattended password prompts. No new native Fourdock binary is executed.

Connection settings live outside Git in `~/.fourdock-whatsapp/ssh-config`, owned
by the user with mode0600. It references an existing key; no key is copied:

```sshconfig
Host fourdock-whatsapp
  HostName example.invalid
  User your-user
  Port 22
  IdentityFile /absolute/path/to/your/existing/key
```

Verify the existing SSH connection normally before installation. The installer
requires a private config, refuses unknown launch-agent files and leaves an
unrelated listener on port4702 alone. Its job uses only stable system/config paths,
so moving this repository does not break the installed connection.

```sh
npm run mission:autostart -- --prepare
npm run mission:autostart -- --install
npm run mission:autostart -- --status
```

`--prepare` writes and validates the plist without starting it. `--install` enables
the managed job. Private logs are under `~/.fourdock-whatsapp/logs/` with mode0600;
the directory is0700. To disable the connection while preserving all credentials:

```sh
npm run mission:autostart -- --disable
```

## Backend

Compose uses `restart: unless-stopped` for this candidate only. Explicitly stopping
the container remains respected. It does not modify Docker's other containers.

`FOURDOCK_AUTO_SYNC=1` permits automatic sync only when the owned store already
contains a regular session.db and a bounded **read-only auth status** command
confirms authenticated=true. The default is0. Missing, partial, revoked, invalid
or unreadable sessions stay stopped; startup never invokes auth/pair or creates a
QR. Upstream sleep mode remains respected. Sending/read-only mode is unchanged.

`Dockerfile.runtime-update` layers the tested API and web artifacts onto an
explicit existing candidate image, retaining its CLI/dependencies. Keep the
candidate's own volume and private runtime override when updating it.

The network-only offline page automatically retries the connection and returns
to the app when available. It caches no conversations or authentication traffic.
This does not add push notifications after every PWA window has been closed.

## Verification

The Mac launch agent has been installed normally and its own SSH process restarted
once: it recreated the connection and HTTP health stayed authenticated/connected
with sync running. Config/plist safety tests and saved-session startup tests pass.
Backend restart and the offline-page browser fixture are pending deployment/CI.
Full Mac login, physical sleep/wake and server reboot remain owner checks; no
global reboot or network change is performed by the agent.
