# AGENTS.md - Chrome Extension Trust Checker

## Project Overview

Browser extension that checks the current website's domain against Trustpilot ratings and reviews.

## Technology Stack

### Core

- **Manifest Version:** 3 (MV3)
- **Language:** TypeScript
- **Frontend:** React 19 with React Compiler
- **Build Tool:** Vite with CRXJS plugin
- **Testing:** Vitest
- **Package Manager:** pnpm

### Why This Stack?

- **TypeScript:** Type safety, better DX, easier maintenance
- **React 19 + Compiler:** Latest React with automatic memoization, better performance
- **CSS Modules:** Scoped, maintainable styles without runtime overhead
- **CRXJS:** Solves Chrome extension HMR issues, handles manifest generation
- **Vitest:** Fast, modern test runner with built-in assertions
- **MV3:** Required for new extensions, better security model

## Architecture Components

### 1. Popup (`src/popup/`)

- React component rendered when user clicks extension icon
- Shows current domain
- **Rating display**: Stars, numeric rating, review count, trust score
- Button to open Trustpilot reviews in new tab
- Fetches ratings via API client

### 2. Service Worker (`src/background/`)

- Event-driven script (no persistent background page in MV3)
- Handles `chrome.tabs` API calls
- Manages extension state
- **Badge updates**: Shows rating with color-coded badge (green/yellow/red)

### 3. Content Script (`src/content/`) [Future]

- Optional overlay on websites
- Inline rating display
- Not needed for MVP

### 4. Shared Utilities (`src/shared/`)

- Domain extraction utilities
- Trustpilot URL builders
- **Type definitions**: Rating interfaces
- **API clients**: Scraper implementation with proxy abstraction for future backend

## Key Files

```
src/
  popup/
    Popup.tsx           # Main popup React component - shows rating stars
    index.tsx           # Popup entry point
    index.html          # Popup HTML template
  background/
    service-worker.ts   # Service worker entry - handles badge updates
  shared/
    types.ts            # TrustpilotRating and RatingAPI interfaces
    utils.ts            # Domain extraction helpers
    trustpilot.ts       # Trustpilot URL builders
    scraper.ts          # Trustpilot page scraper implementation
    api.ts              # Proxy API client with scraper fallback
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
- `chrome.action.setBadgeText()`: Display rating on extension icon
- `chrome.action.setBadgeBackgroundColor()`: Color-code ratings (green/yellow/red)

## Trustpilot Integration

### Current

- Extract domain from current tab URL
- **Scraper-based**: Fetches Trustpilot page, extracts JSON-LD structured data
- **Rating display**: Stars, numeric score, review count, trust level
- **Badge**: Color-coded rating shown on extension icon
- Open detailed reviews in new tab

### Future (Optional PHP Proxy)

- **Backend proxy**: PHP server calls Trustpilot API (keeps API key secure)
- Rate limiting and caching on server side
- Easy switch via `ProxyRatingAPI` config (set `baseUrl` to your server)

## Build & Development

### Development

```bash
pnpm dev           # Start Vite dev server with HMR
```

CRXJS handles:

- Manifest generation
- HMR for popup and content scripts
- Automatic extension reloading

### Build

```bash
pnpm build         # Production build
```

### Testing

```bash
pnpm test          # Run Vitest
pnpm test:ui       # Run Vitest with UI
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

1. **Setup:** `pnpm install`
2. **Dev:** `pnpm dev` - Load unpacked extension from `dist/`
3. **Test:** `pnpm test` - Run tests in watch mode
4. **Build:** `pnpm build` - Production build for Web Store

## File Naming Conventions

- React components: PascalCase (e.g., `Popup.tsx`)
- Utilities: camelCase (e.g., `trustpilot.ts`)
- Tests: `{file}.test.ts`
- CSS Modules: `*.module.css`

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

- [x] ~~Trustpilot scraper for ratings~~ (Implemented - using scraper)
- [x] ~~Extension icon badge showing rating~~ (Implemented)
- [x] ~~Review summary in popup~~ (Implemented - stars, rating, count)
- [ ] PHP Proxy API (Ready to implement - see `ProxyRatingAPI`)
- [ ] Options page for settings
- [ ] Historical rating trends
- [ ] Content script overlay on websites
