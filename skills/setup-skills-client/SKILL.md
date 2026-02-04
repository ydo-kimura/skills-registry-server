---
name: setup-skills-client
description: Configures your shell environment to use the private skills registry.
metadata:
  author: ydokimura
  version: '1.0.0'
input:
  registryUrl:
    type: string
    description: The URL of the private skills registry server (e.g. http://localhost:3000)
    required: true
---

# Setup Skills Client

This skill helps you configure your environment to use the private skills registry server.

## Usage

Run the following command to configure your shell:

```bash
/bin/bash ./setup.sh
```

Or copy the script below:

```bash
#!/bin/bash

# Configuration
# The agent should provide 'registryUrl' as an environment variable or replacement
SERVER_URL="${registryUrl:-http://localhost:3000}"
VAR_NAME="SKILLS_API_URL"

# Detect Shell
SHELL_NAME=$(basename "$SHELL")
RC_FILE=""

case "$SHELL_NAME" in
  "zsh")
    RC_FILE="$HOME/.zshrc"
    ;;
  "bash")
    if [ -f "$HOME/.bash_profile" ]; then
      RC_FILE="$HOME/.bash_profile"
    else
      RC_FILE="$HOME/.bashrc"
    fi
    ;;
  *)
    echo "Unknown shell: $SHELL_NAME"
    echo "Please manually set the environment variable:"
    echo "export $VAR_NAME=$SERVER_URL"
    exit 1
    ;;
esac

# Check if already set
if grep -q "$VAR_NAME" "$RC_FILE"; then
  echo "$VAR_NAME is already configured in $RC_FILE"
  exit 0
fi

# Append to config
echo "" >> "$RC_FILE"
echo "# Added by Skills Registry Server" >> "$RC_FILE"
echo "export $VAR_NAME=$SERVER_URL" >> "$RC_FILE"

echo "Successfully added $VAR_NAME to $RC_FILE"
echo "Please restart your shell or run:"
echo "source $RC_FILE"
```
