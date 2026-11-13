#!/usr/bin/env bash
set -euo pipefail

if [[ ! -t 0 ]]; then
  echo 'Run this script in your Terminal: the GIPHY key is entered with hidden input.' >&2
  exit 1
fi

fourdock_ssh_config="${FOURDOCK_SSH_CONFIG:-$HOME/.fourdock-whatsapp/ssh-config}"
if [[ ! -f "$fourdock_ssh_config" ]]; then
  echo 'The existing Fourdock SSH configuration is required.' >&2
  exit 1
fi

# Discover the canonical repo/state from the existing Matrix container. No
# deployment-specific server path, account password or API key is stored here.
fourdock_remote_code='import json, subprocess, sys
from pathlib import Path
c = json.loads(subprocess.check_output(["docker", "inspect", "matrix-synapse"]))[0]
repo = Path(c["Config"]["Labels"]["com.docker.compose.project.working_dir"])
state = Path(next(m["Source"] for m in c["Mounts"] if m["Destination"] == "/data")).parent
helper = repo / "matrix" / "element.py"
if not helper.is_file():
    raise SystemExit("Deploy the homeserver Matrix helpers first")
subprocess.run([sys.executable, str(helper), "--state-dir", str(state), "set-giphy-key"], check=True)'
fourdock_remote_command="$(python3 -c 'import shlex, sys; print("python3 -c " + shlex.quote(sys.argv[1]))' "$fourdock_remote_code")"
exec ssh -t -F "$fourdock_ssh_config" -o BatchMode=yes -o StrictHostKeyChecking=yes \
  fourdock-whatsapp "$fourdock_remote_command"
