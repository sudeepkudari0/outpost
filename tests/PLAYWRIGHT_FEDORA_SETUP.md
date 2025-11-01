# Playwright Setup for Fedora

## Install System Dependencies

Run these commands as root or with sudo to install required libraries:

```bash
sudo dnf install -y \
  libicu \
  libjpeg-turbo \
  libwebp \
  libffi \
  x264 \
  alsa-lib \
  atk \
  cups-libs \
  gtk3 \
  libXcomposite \
  libXcursor \
  libXdamage \
  libXext \
  libXi \
  libXrandr \
  libXScrnSaver \
  libXtst \
  pango \
  nss
```

Or install individually:

```bash
# Core libraries
sudo dnf install -y libicu libjpeg-turbo libwebp libffi x264

# Additional Playwright dependencies
sudo dnf install -y alsa-lib atk cups-libs gtk3 libXcomposite libXcursor \
  libXdamage libXext libXi libXrandr libXScrnSaver libXtst pango nss
```

## After Installing Dependencies

1. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   # or for all browsers
   npx playwright install
   ```

2. Run E2E tests:
   ```bash
   bun run test:e2e
   ```

## Quick Command (All-in-One)

```bash
# Install dependencies
sudo dnf install -y libicu libjpeg-turbo libwebp libffi x264 alsa-lib atk cups-libs gtk3 libXcomposite libXcursor libXdamage libXext libXi libXrandr libXScrnSaver libXtst pango nss

# Install Playwright browsers
npx playwright install chromium

# Run tests
bun run test:e2e
```

