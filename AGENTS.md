# AGENTS.md - Chrome Extension Trust Checker

## Project Overview

Browser extension that checks the current website's domain against Trustpilot ratings and reviews.

## Technology Stack

### Core

- **Manifest Version:** 3 (MV3)
- **Language:** TypeScript
- **Frontend:** React 18
- **Build Tool:** Vite with CRXJS plugin
- **Testing:** Vitest
- **Package Manager:** npm

### Why This Stack?

- **TypeScript:** Type safety, better DX, easier maintenance
- **React + Vite:** Modern dev experience, HMR, fast builds
- **CRXJS:** Solves Chrome extension HMR issues, handles manifest generation
- **Vitest:** Fast, modern test runner with built-in assertions
- **MV3:** Required for new extensions, better security model

## Architecture Components

### 1. Popup (`src/popup/`)

- React component rendered when user clicks extension icon
- Shows current domain
- Button to open Trustpilot reviews in new tab
- Future: Display rating summary, review count

### 2. Service Worker (`src/background/`)

- Event-driven script (no persistent background page in MV3)
- Handles `chrome.tabs` API calls
- Manages extension state
- Future: Caching Trustpilot data, periodic updates

### 3. Content Script (`src/content/`) [Future]

- Optional overlay on websites
- Inline rating display
- Not needed for MVP

### 4. Shared Utilities (`src/shared/`)

- Domain extraction utilities
- Trustpilot URL builders
- Type definitions
- API clients (future)

## Key Files

```
src/
  popup/
    Popup.tsx           # Main popup React component
    index.tsx           # Popup entry point
    index.html          # Popup HTML template
  background/
    service-worker.ts   # Service worker entry
  shared/
    types.ts            # TypeScript interfaces
    utils.ts            # Domain extraction helpers
    trustpilot.ts       # Trustpilot URL builders
  __tests__/            # Vitest tests
public/
  manifest.json         # Extension manifest (CRXJS handles this)
  icons/                # Extension icons
```

## Chrome APIs Used

### Permissions Required

```json
{
  "permissions": ["activeTab", "tabs"]
}
```

- `activeTab`: Access current tab when user clicks icon
- `tabs`: Query tab information (domain, URL)

### API Usage

- `chrome.tabs.query()`: Get current tab info
- `chrome.tabs.create()`: Open Trustpilot in new tab
- `chrome.runtime`: Extension messaging

## Trustpilot Integration

### Current (MVP)

- Extract domain from current tab URL
- Build Trustpilot review URL: `https://www.trustpilot.com/review/{domain}`
- Open in new tab

### Future

- Fetch rating data via Trustpilot API (requires API key)
- Cache results locally
- Display rating summary in popup
- Show badge on extension icon

## Build & Development

### Development

```bash
npm run dev        # Start Vite dev server with HMR
```

CRXJS handles:

- Manifest generation
- HMR for popup and content scripts
- Automatic extension reloading

### Build

```bash
npm run build      # Production build
```

### Testing

```bash
npm run test       # Run Vitest
npm run test:ui    # Run Vitest with UI
```

## Testing Strategy

### Unit Tests (Vitest)

- Domain extraction utilities
- Trustpilot URL builders
- React component rendering
- Service worker event handlers

### Integration Tests

- Chrome API mocking
- Popup → Service Worker messaging

## Development Workflow

1. **Setup:** `npm install`
2. **Dev:** `npm run dev` - Load unpacked extension from `dist/`
3. **Test:** `npm run test` - Run tests in watch mode
4. **Build:** `npm run build` - Production build for Web Store

## File Naming Conventions

- React components: PascalCase (e.g., `Popup.tsx`)
- Utilities: camelCase (e.g., `trustpilot.ts`)
- Tests: `{file}.test.ts

## State Management

- Start with React hooks (useState, useEffect)
- Be very conservative with usage of useEffect
- Consider Jotai to reduce prop drilling
- Service worker for persistent state (chrome.storage)

## Security Considerations

- Content Security Policy (CSP) in manifest
- No inline scripts
- Minimal permissions principle
- No sensitive data in localStorage

## Chrome Web Store Requirements

- Icons: 16x16, 48x48, 128x128 PNG
- Screenshots: 1280x800 or 640x400
- Privacy policy (if collecting data)
- Description and promotional images

## Future Enhancements

- [ ] Trustpilot API integration for ratings
- [ ] Extension icon badge showing rating
- [ ] Options page for settings
- [ ] Review summary in popup
- [ ] Historical rating trends
- [ ] Content script overlay on websites
