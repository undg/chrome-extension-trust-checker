# Trust Checker

A Chrome extension that checks the current website's domain against Trustpilot ratings and reviews.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server with HMR
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Development

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the dev server:**
   ```bash
   pnpm dev
   ```
   This starts Vite with CRXJS plugin, which provides hot module replacement for the popup and automatic extension reloading.

3. **Load the extension in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project
   - The extension icon should appear in your toolbar

4. **Test the extension:**
   - Visit any website (e.g., google.com)
   - Click the extension icon in the toolbar
   - The popup should show the current domain
   - Click "View Trustpilot Reviews" to open Trustpilot

### Project Structure

```
src/
├── popup/                    # Extension popup UI
│   ├── index.html           # Popup HTML template
│   ├── index.tsx            # Popup entry point
│   ├── Popup.tsx            # Main React component
│   └── index.css            # Popup styles
├── background/              # Service worker
│   └── service-worker.ts    # Background script
├── shared/                  # Shared utilities
│   └── utils.ts             # Domain extraction, Trustpilot URL builder
├── __tests__/              # Unit tests
│   └── utils.test.ts        # Tests for utilities
└── manifest.json           # Chrome extension manifest
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Create production build in `dist/` |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:ui` | Run tests with Vitest UI |

### Testing

Tests are written with Vitest and located in `src/__tests__/`. The test suite covers:

- Domain extraction from URLs (with/without www, invalid URLs)
- Trustpilot URL building

**Run tests:**
```bash
pnpm test
```

**Watch mode for development:**
```bash
pnpm test -- --watch
```

**Run specific test file:**
```bash
pnpm test src/__tests__/utils.test.ts
```

### Development Workflow

1. Make changes to source files
2. The dev server (HMR) automatically reloads the extension
3. Click the extension icon to see changes immediately
4. Check the service worker console for background script logs:
   - Go to `chrome://extensions/`
   - Find "Trust Checker"
   - Click "service worker" link to open devtools

### Troubleshooting

**Extension not showing updates:**
- Click the refresh icon on the extension card in `chrome://extensions/`
- Or run `pnpm dev` again

**Build errors:**
- Delete `dist/` folder and run `pnpm build` again
- Check that all dependencies are installed: `pnpm install`

**Tests failing:**
- Ensure all dependencies installed: `pnpm install`
- Check TypeScript compilation: `npx tsc --noEmit`

## Building for Production

```bash
pnpm build
```

This creates a production-ready extension in the `dist/` folder. To distribute:

1. Zip the `dist/` folder contents
2. Upload to Chrome Web Store Developer Dashboard
3. Or load as unpacked extension for personal use

## Architecture

### Chrome APIs Used

- **`chrome.tabs.query`** - Get current active tab
- **`chrome.tabs.create`** - Open Trustpilot in new tab

### Permissions

- `activeTab` - Access current tab when user clicks extension icon
- `tabs` - Query tab information

### Technology Stack

- **Manifest V3** - Latest Chrome extension format
- **TypeScript** - Type-safe code
- **React 19** - UI framework
- **Vite** - Build tool with HMR
- **CRXJS** - Chrome extension Vite plugin
- **Vitest** - Testing framework

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and run tests: `pnpm test`
4. Build and verify: `pnpm build`
5. Commit and push
6. Open a pull request

## Future Features

- [ ] Extension icon badges showing ratings
- [ ] Trustpilot API integration for in-popup ratings
- [ ] Options page for settings
- [ ] Review summary display
- [ ] Content script overlay on websites

## License

MIT
