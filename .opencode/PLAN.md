# Trustpilot Checker - Implementation Plan

## Status: SCRAPER IMPLEMENTATION COMPLETE (Phases 1-4 done, Phase 5-6 in progress)

---

## Phase 1: Foundation & Setup ✅

### 1.1 Project Initialization ✅

**Completed:**

- [x] Initialize pnpm project
- [x] Install Vite + React 19 + TypeScript template
- [x] Install CRXJS Vite plugin for Chrome extension support
- [x] Install Vitest
- [x] Configure TypeScript (tsconfig.json)
- [x] Configure Vite (vite.config.ts) with CRXJS
- [x] Setup project folder structure

**Notes:**
- Skipped babel-plugin-react-compiler for now (React 19 has built-in optimizations)
- Used `with { type: 'json' }` syntax instead of deprecated `assert`

### 1.2 Manifest V3 Configuration ✅

**Completed:**

- [x] Create manifest.json with:
  - Manifest version 3
  - Extension name, description, version
  - Action (popup) definition
  - Background service worker declaration
  - Permissions: `activeTab`, `tabs`

**Notes:**
- Removed icons from manifest for MVP (can add later)
- Kept minimal permissions as planned

### 1.3 Icon Assets ⚠️ SKIPPED

**Status:** Deferred to post-MVP

- [ ] Design/create icon set (16x16, 48x48, 128x128)
- [ ] Add to `public/icons/`

---

## Phase 2: Core Extension Logic ✅

### 2.1 Domain Extraction Utilities ✅

**Completed:**

- [x] Create `src/shared/utils.ts`
- [x] Implement `extractDomain(url: string): string | null`
  - Handles protocols (http, https)
  - Strips www subdomain
  - Returns clean domain
- [x] Write unit tests for edge cases
  - ✅ URLs with/without www
  - ✅ Invalid URLs
  - ✅ Undefined input

### 2.2 Trustpilot Integration Utilities ✅

**Completed:**

- [x] Create `src/shared/utils.ts` (combined with domain utils)
- [x] Implement `buildTrustpilotUrl(domain: string): string`
  - Returns: `https://www.trustpilot.com/review/{domain}`
- [x] Write unit tests

### 2.3 Service Worker (Background Script) ✅

**Completed:**

- [x] Create `src/background/service-worker.ts`
- [x] Basic service worker structure
- [x] Console logging for debugging
- [x] Badge update handler via chrome.runtime.onMessage
- [x] Color-coded badges (green ≥4, blue ≥3, yellow ≥2, red <2)
- [x] Clear badge on tab switch

**Architecture:**
```
Popup (React) ←→ Chrome Tabs API (direct)
                ↓
Service Worker ← Badge updates
```

**Notes:**
- Used direct chrome.tabs.query in popup instead of messaging
- Simplified architecture for MVP
- Badge shows rating with color coding based on score

### 2.4 Type Definitions ✅

**Completed:**

- [x] Define TabInfo interface in utils.ts
- [x] Create `src/shared/types.ts` with TrustpilotRating interface
- [x] Create `src/shared/api.ts` with RatingAPI abstraction

### 2.5 Trustpilot Scraper ✅

**Completed:**

- [x] Create `src/shared/scraper.ts`
- [x] Scrape JSON-LD structured data from Trustpilot pages
- [x] Extract rating, review count, trust score
- [x] Graceful error handling (null on failure)
- [x] Write unit tests (4 test cases)

**API Design:**
```typescript
class ScraperRatingAPI implements RatingAPI {
  async fetchRating(domain: string): Promise<TrustpilotRating | null>
}
```

**Notes:**
- Uses JSON-LD schema.org markup from Trustpilot pages
- Falls back to meta tag parsing if needed
- No API key required (client-side scraping)

---

## Phase 3: Popup UI ✅

### 3.1 Popup Component Structure ✅

**Completed:**

- [x] Create `src/popup/index.html` (template)
- [x] Create `src/popup/index.tsx` (entry point)
- [x] Create `src/popup/Popup.tsx` (main component)
- [x] Setup basic React structure with hooks

### 3.2 State Management ✅

**Completed:**

- [x] Implement loading state (while fetching domain)
- [x] Implement error state (if no active tab)
- [x] Store current domain in component state (useState)
- [x] Use useEffect to fetch domain on mount

### 3.3 Chrome Messaging Integration ✅

**Completed:**

- [x] Implement direct chrome.tabs.query in popup
- [x] Handle response and update state
- [x] Handle errors gracefully

**Notes:**
- Used direct API calls instead of service worker messaging for simplicity
- All chrome.tabs calls work directly from popup

### 3.4 Styling ✅

**Completed:**

- [x] Create `src/popup/index.css`
- [x] Style popup container (fixed width ~320px)
- [x] Style domain display area
- [x] Style "View Trustpilot Reviews" button (Trustpilot green)
- [x] Add hover states
- [x] Basic error styling

### 3.5 Rating Display ✅

**Completed:**

- [x] Fetch rating via scraper API on popup open
- [x] Display star rating (★★★★☆ style)
- [x] Show numeric rating (4.5/5)
- [x] Show review count
- [x] Show trust level (Excellent, Great, etc.)

### 3.6 Open Trustpilot Action ✅

**Completed:**

- [x] Add click handler to button
- [x] Open Trustpilot in new tab via chrome.tabs.create
- [x] Build correct URL with extracted domain
- [x] Use cached URL from rating data if available

### 3.7 Testing Popup ⚠️ NOT DONE

**Status:** Utility and API tests exist, component tests pending

- [ ] Test React component rendering (Vitest + RTL)
- [ ] Mock chrome.runtime API
- [ ] Test button click handlers
- [ ] Test error states

---

## Phase 4: Integration & Testing ✅

### 4.1 API Tests ✅

**Completed:**

- [x] Test scraper extraction from JSON-LD
- [x] Test scraper error handling
- [x] Test proxy fallback mechanism
- [x] Test API config switching

### 4.2 Build & Package ✅

**Completed:**

- [x] Configure Vite production build
- [x] Test `pnpm build` output - WORKS
- [x] Verify all files in `dist/`
- [x] Added host_permissions for trustpilot.com

**Build Output:**
```
dist/
├── manifest.json
├── service-worker-loader.js
├── src/popup/index.html
└── assets/
    ├── popup-[hash].js
    ├── popup-[hash].css
    └── service-worker.ts-[hash].js
```

### 4.3 Error Handling ✅

**Completed:**

- [x] Handle cases where no tab is active
- [x] Handle Chrome API permission errors
- [x] Handle invalid URLs (chrome://, file:// returns null domain)
- [x] Handle scraper failures gracefully
- [x] Display user-friendly error messages in popup
- [x] Network error handling in API clients

### 4.4 Edge Cases ⚠️ PARTIAL

- [x] Handle domains with no Trustpilot presence
- [ ] Test on Chrome internal pages
- [ ] Test when Trustpilot is blocked
- [ ] Test rapid clicking

---

## Phase 5: Polish & Documentation ✅

### 5.1 AGENTS.md ✅

**Completed:**

- [x] Documented architecture with scraper/proxy abstraction
- [x] Updated file structure
- [x] Updated API usage documentation
- [x] Updated Trustpilot integration section
- [x] Marked implemented features as complete

### 5.2 Code Quality ✅

**Completed:**

- [x] Clean implementation with proper error handling
- [x] Type safety throughout
- [x] 13 passing tests (utils, scraper, API)

### 5.3 README.md ⏳ PENDING

- [ ] Write installation instructions
- [ ] Document development workflow
- [ ] Add screenshots/GIFs
- [ ] Document architecture decisions

---

## Phase 6: Future Enhancements ⏳ PARTIAL

### 6.1 Trustpilot Scraper ✅ / API Integration ⏳

**Scraper (Complete):**
- [x] Scrape ratings from Trustpilot pages
- [x] Display rating in popup
- [x] Proxy abstraction ready for backend switch

**API Integration (Future):**
- [ ] Create PHP proxy backend
- [ ] Add proper Trustpilot API integration on server
- [ ] Cache results server-side
- [ ] Extension: Switch baseUrl to proxy

### 6.2 Extension Badge ✅

**Completed:**
- [x] Show rating on toolbar icon
- [x] Color-code by rating (green/yellow/red)

### 6.3 Options Page ⏳

- [ ] Create options page (React)
- [ ] Allow users to set their own API key
- [ ] Toggle scraper/proxy mode

### 6.4 Review Summary ✅

**Completed:**
- [x] Display rating, review count, trust score in popup
- [x] Stars visualization

### 6.5 Content Script Overlay ⏳

- [ ] Create content script
- [ ] Inject rating badge on websites

### 6.6 Additional Features

- [ ] Historical rating trends
- [ ] Search Trustpilot directly from popup
- [ ] Dark mode support

---

## Current Status Summary

### What's Working:

- ✅ Extension builds successfully with `pnpm build`
- ✅ All 13 unit tests pass (utils, scraper, API)
- ✅ Popup extracts domain, fetches rating via scraper
- ✅ Star rating display (★★★★☆), review count, trust score
- ✅ Badge shows rating with color coding (green/yellow/red)
- ✅ "View Trustpilot Reviews" button opens correct URL
- ✅ Proxy abstraction ready for PHP backend switch
- ✅ Error handling for invalid domains, network failures

### What's Missing:

- ⏸️ Extension icons (can add before Web Store submission)
- ⏸️ Component-level tests for Popup.tsx
- ⏸️ E2E testing in actual Chrome browser
- ⏸️ README documentation
- ⏸️ PHP proxy backend (optional enhancement)

### Next Actions:

1. **Load in Chrome** - Test the built extension manually
2. **Add icons** - Create simple PNG icons for toolbar  
3. **Write README** - Basic usage instructions
4. **Optional:** Deploy PHP proxy and switch API config

---

## File Structure (Actual)

```
trustpilot-checker/
├── .opencode/
│   ├── AGENTS.md
│   └── PLAN.md (this file)
├── node_modules/
├── dist/                          # Build output
├── src/
│   ├── background/
│   │   └── service-worker.ts      # Service worker with badge updates
│   ├── popup/
│   │   ├── index.html            # Popup template
│   │   ├── index.tsx             # Entry point
│   │   ├── Popup.tsx             # Main component with ratings
│   │   └── index.css             # Styling
│   ├── shared/
│   │   ├── types.ts              # TrustpilotRating interface
│   │   ├── utils.ts              # Domain + Trustpilot utils
│   │   ├── scraper.ts            # Trustpilot page scraper
│   │   └── api.ts                # API client with proxy fallback
│   ├── __tests__/
│   │   ├── utils.test.ts         # Unit tests (5 tests)
│   │   ├── scraper.test.ts       # Scraper tests (4 tests)
│   │   └── api.test.ts           # API tests (4 tests)
│   └── manifest.json             # MV3 manifest
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tsconfig.node.json            # Vite TS config
├── vite.config.ts                # Vite + CRXJS config
└── vitest.config.ts              # (auto-generated)
```

---

## Commands Available

```bash
pnpm dev          # Start dev server with HMR
pnpm build        # Production build → dist/
pnpm test         # Run unit tests
pnpm test:ui      # Run tests with UI
```

---

**Last Updated:** Feb 22, 2026
**MVP Status:** ✅ COMPLETE (scraper-based rating display with badge)
**Total Tests:** 13 passing
**Lines of Code:** ~600 (TypeScript)
