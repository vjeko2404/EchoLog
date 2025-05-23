#!/usr/bin/env bash

# Full-stack installer for EchoLog app
# Requirements: .NET SDK, Node.js, npm
# Usage: sudo ./install.sh

set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Root Check
# ─────────────────────────────────────────────────────────────
if [[ "$EUID" -ne 0 ]]; then
  echo "Error: Please run as root (sudo)."
  exit 1
fi

# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

ask_yes_no() {
  local prompt="$1"
  while true; do
    read -p "$prompt [y/n]: " yn
    case $yn in
      [Yy]*) return 0 ;;
      [Nn]*) return 1 ;;
      *) echo "Please answer y or n." ;;
    esac
  done
}

install_package() {
  local package="$1"
  echo "Installing $package..."
  
  # Strip broken or legacy keys if needed (e.g., influxdata gpg issue)
  if ls /etc/apt/trusted.gpg.d/*.gpg 2>/dev/null | grep -q influxdata; then
    echo "Removing unsupported InfluxData GPG key..."
    rm -f /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg
  fi

  apt-get update -qq
  apt-get install -y "$package"
}

check_or_install() {
  local cmd="$1"
  local pkg="$2"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "$cmd is not installed."
    if ask_yes_no "Do you want to install $pkg now?"; then
      install_package "$pkg"
    else
      echo "$pkg is required. Exiting."
      exit 1
    fi
  fi
}

# ─────────────────────────────────────────────────────────────
# Dependency Check (Pi-safe)
# ─────────────────────────────────────────────────────────────

# Check for .NET SDK by testing the command and confirming version exists
if ! command -v dotnet >/dev/null 2>&1 || ! dotnet --list-sdks | grep -q '^7'; then
  echo ".NET SDK 7.x is not installed."
  if ask_yes_no "Do you want to install the .NET SDK manually? (required)"; then
    echo "Please follow install instructions at https://learn.microsoft.com/dotnet/core/install/linux"
    exit 1
  else
    echo "dotnet-sdk-7.0 is required. Exiting."
    exit 1
  fi
fi

check_or_install "node" "nodejs"
check_or_install "npm" "npm"


# ─────────────────────────────────────────────────────────────
# EchoLog Configuration Prompt
# ─────────────────────────────────────────────────────────────

echo "─────────────────────────────────────────────────────────────"
echo "         EchoLog Configuration – Interactive Setup"
echo "─────────────────────────────────────────────────────────────"

confirm_input() {
  local prompt="$1"
  local default="$2"
  local result=""
  while true; do
    read -p "$prompt [$default]: " result
    result="${result:-$default}"
    if [[ -z "$result" ]]; then
      echo "⚠️  Input cannot be empty."
    else
      echo "$result"
      return 0
    fi
  done
}

get_valid_port() {
  local label="$1"
  local default="$2"
  local input=""
  while true; do
    input=$(confirm_input "$label" "$default")
    if [[ "$input" =~ ^[0-9]{2,5}$ ]] && ((input >= 1024 && input <= 65535)); then
      echo "$input"
      return 0
    else
      echo "❌ Invalid port number. Enter a value between 1024 and 65535."
    fi
  done
}

get_valid_url() {
  local label="$1"
  local default="$2"
  local input=""
  while true; do
    input=$(confirm_input "$label" "$default")
    
    if [[ "$input" =~ ^http://.+$ ]]; then
      echo "$input"
      return 0

    elif [[ "$input" =~ ^https://.+$ ]]; then
      echo "⚠️ HTTPS detected. You must handle your own certificates and CORS headers."
      if ask_yes_no "Are you sure you want to use HTTPS?"; then
        echo "$input"
        return 0
      else
        continue
      fi

    else
      echo "❌ Invalid format. Must start with http:// or https://"
    fi
  done
}

API_PORT=$(get_valid_port "Enter API Port" "5000")
API_HOST=$(confirm_input "Enter API Host (localhost or IP)" "localhost")
CORS_ORIGIN=$(get_valid_url "Enter CORS Origin" "http://localhost:5001")
CLIENT_PORT=$(get_valid_port "Enter Frontend Port" "5001")

# ─────────────────────────────────────────────────────────────
# Confirm Configuration
# ─────────────────────────────────────────────────────────────

echo ""
echo "Review your configuration:"
echo "────────────────────────────"
echo "Backend Port   : $API_PORT"
echo "Backend Host   : $API_HOST"
echo "CORS Origin    : $CORS_ORIGIN"
echo "Frontend Port  : $CLIENT_PORT"
echo "────────────────────────────"

if ! ask_yes_no "Proceed with this configuration?"; then
  echo "Aborting setup."
  exit 1
fi

# ─────────────────────────────────────────────────────────────
# Generate .env Files
# ─────────────────────────────────────────────────────────────

mkdir -p echolog.server
mkdir -p echolog.client

echo "Writing echolog.server/.env"
cat <<EOF > echolog.server/.env
API_PORT=$API_PORT
API_HOST=$API_HOST
CORS_ORIGIN=$CORS_ORIGIN
EOF

echo "Writing echolog.client/.env"
cat <<EOF > echolog.client/.env
VITE_API_URL=http://$API_HOST:$API_PORT/api
VITE_PORT=$CLIENT_PORT
EOF

echo ".env files written successfully."

# ─────────────────────────────────────────────────────────────
# Build Backend
# ─────────────────────────────────────────────────────────────

echo "Restoring and building .NET backend..."
pushd echolog.server >/dev/null
dotnet restore
dotnet build --no-restore
popd >/dev/null

# ─────────────────────────────────────────────────────────────
# Build Frontend
# ─────────────────────────────────────────────────────────────

echo "Installing and building frontend..."
pushd echolog.client >/dev/null
npm install
npm run build
popd >/dev/null

# ─────────────────────────────────────────────────────────────
# Setup systemd Services
# ─────────────────────────────────────────────────────────────

echo "Creating systemd services..."

ROOT_DIR="$(pwd)"
SERVER_PATH="$ROOT_DIR/echolog.server"
CLIENT_PATH="$ROOT_DIR/echolog.client"
LOG_DIR="/var/log/echolog"

mkdir -p "$LOG_DIR"

SERVER_SERVICE_PATH="/etc/systemd/system/echolog-backend.service"
CLIENT_SERVICE_PATH="/etc/systemd/system/echolog-frontend.service"

cat <<EOF > "$SERVER_SERVICE_PATH"
[Unit]
Description=EchoLog Backend (.NET)
After=network.target

[Service]
WorkingDirectory=$SERVER_PATH
ExecStart=/usr/bin/dotnet run --project $SERVER_PATH
Restart=always
RestartSec=2
EnvironmentFile=$SERVER_PATH/.env
StandardOutput=append:$LOG_DIR/backend.log
StandardError=append:$LOG_DIR/backend.err

[Install]
WantedBy=multi-user.target
EOF

cat <<EOF > "$CLIENT_SERVICE_PATH"
[Unit]
Description=EchoLog Frontend (Vite Dev)
After=network.target

[Service]
WorkingDirectory=$CLIENT_PATH
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=2
EnvironmentFile=$CLIENT_PATH/.env
StandardOutput=append:$LOG_DIR/frontend.log
StandardError=append:$LOG_DIR/frontend.err

[Install]
WantedBy=multi-user.target
EOF

# ─────────────────────────────────────────────────────────────
# Finalize and Enable Services
# ─────────────────────────────────────────────────────────────

echo "Enabling and reloading systemd..."

systemctl daemon-reexec
systemctl daemon-reload

systemctl enable echolog-backend.service
systemctl enable echolog-frontend.service

echo ""
echo "Services created:"
echo "  - echolog-backend.service"
echo "  - echolog-frontend.service"
echo ""
echo "Start them with:"
echo "  sudo systemctl start echolog-backend"
echo "  sudo systemctl start echolog-frontend"
echo ""
echo "Logs can be found in:"
echo "  $LOG_DIR/backend.log"
echo "  $LOG_DIR/frontend.log"

echo "Installation complete."
