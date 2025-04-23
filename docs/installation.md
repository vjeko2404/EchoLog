## EchoLog Installation Guide

Welcome to EchoLog – a lightweight, full-stack logging app designed for fast setup and zero hassle. This guide will walk you through installing and running EchoLog on a fresh Linux system.

No development experience? No problem. Just follow each step and you’ll have EchoLog running in minutes.

### System Requirements

- Ubuntu/Debian-based Linux (tested on Ubuntu 22.04)
- Root (sudo) access
- Internet connection

### Step-by-Step Installation

Open your terminal and run the following commands one at a time:

```bash
# 1. Create a new folder for the app
mkdir EchoLog
cd EchoLog

# 2. Clone the official EchoLog repository
git clone [https://github.com/vjeko2404/EchoLog](https://github.com/vjeko2404/EchoLog) .

# 3. Make the installer script executable
chmod +x install.sh

# 4. Run the install script (this will prompt for settings and install everything)
sudo ./install.sh

What the script does
The install.sh script performs the following actions:

Checks if required tools are installed (like .NET and Node.js).
Prompts you to enter custom settings such as port numbers.
Automatically creates necessary .env files.
Builds the backend and frontend applications.
Sets up EchoLog as background services using systemd.
Starts the application, making it accessible on your system.
After Installation
Once the setup is complete:

EchoLog backend will be running at http://localhost:<API_PORT>.
EchoLog frontend will be running at http://localhost:<CLIENT_PORT>.
Logs are stored in /var/log/echolog/.
You can manage the application services with the following systemctl commands:

# Start the services
sudo systemctl start echolog-backend
sudo systemctl start echolog-frontend

# Check status
sudo systemctl status echolog-backend
sudo systemctl status echolog-frontend

# View logs
cat /var/log/echolog/backend.log
cat /var/log/echolog/frontend.log

Troubleshooting
If you encounter an error during installation or startup:

Ensure you are executing the installer script with superuser privileges: sudo ./install.sh.
Verify that you have a stable internet connection, as some packages may need to be downloaded.
If necessary, try restarting the services: sudo systemctl restart echolog-backend.
For persistent issues, please open a new issue on the GitHub repository or examine the log files for detailed error messages.