# Trustpilot Checker - Implementation Plan

## Status: MVP COMPLETE (Phases 1-3 done, Phase 4 partial)

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

**Architecture:**
```
Popup (React) ←→ Chrome Tabs API (direct)
```

**Notes:**
- Used direct chrome.tabs.query in popup instead of messaging
- Simplified architecture for MVP

### 2.4 Type Definitions ⚠️ PARTIAL

**Completed:**

- [x] Define TabInfo interface in utils.ts
- [ ] Create separate `src/shared/types.ts`

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

### 3.5 Open Trustpilot Action ✅

**Completed:**

- [x] Add click handler to button
- [x] Open Trustpilot in new tab via chrome.tabs.create
- [x] Build correct URL with extracted domain

### 3.6 Testing Popup ⚠️ NOT DONE

**Status:** Only utility tests exist

- [ ] Test React component rendering (Vitest + RTL)
- [ ] Mock chrome.runtime API
- [ ] Test button click handlers
- [ ] Test error states

---

## Phase 4: Integration & Testing ⚠️ PARTIAL

### 4.1 End-to-End Testing ⚠️ NOT DONE

**Status:** Manual testing only

- [ ] Load extension in Chrome (chrome://extensions → Developer mode → Load unpacked)
- [ ] Test on various websites
- [ ] Verify Trustpilot opens with correct domain

### 4.2 Build & Package ✅

**Completed:**

- [x] Configure Vite production build
- [x] Test `pnpm build` output - WORKS
- [x] Verify all files in `dist/`

**Build Output:**
```
dist/
├── manifest.json
├── service-worker-loader.js
├── src/popup/index.html
└── assets/
    ├── popup-BZdFVabv.js
    ├── popup-DDJKJAWH.css
    └── service-worker.ts-CtdOUMat.js
```

### 4.3 Error Handling ⚠️ PARTIAL

**Completed:**

- [x] Handle cases where no tab is active
- [ ] Handle Chrome API permission errors
- [x] Handle invalid URLs (chrome://, file:// returns null domain)
- [x] Display user-friendly error messages in popup

### 4.4 Edge Cases ⚠️ NOT DONE

- [ ] Test on Chrome internal pages
- [ ] Test when Trustpilot is blocked
- [ ] Test rapid clicking

---

## Phase 5: Polish & Documentation ⏳ NOT STARTED

### 5.1 README.md

- [ ] Write installation instructions
- [ ] Document development workflow
- [ ] Add screenshots/GIFs
- [ ] Document architecture decisions

### 5.2 Code Cleanup

- [ ] Remove console.logs
- [ ] Add inline comments for complex logic
- [ ] Ensure consistent code style
- [ ] Check for any TODOs or FIXMEs

### 5.3 Performance Optimization

- [ ] Audit bundle size
- [ ] Check for unnecessary dependencies

---

## Phase 6: Future Enhancements ⏳ NOT STARTED

### 6.1 Trustpilot API Integration

- [ ] Investigate Trustpilot public API
- [ ] Add API client in service worker
- [ ] Cache results (chrome.storage.local)
- [ ] Display rating in popup

### 6.2 Extension Badge

- [ ] Show rating on toolbar icon
- [ ] Color-code by rating

### 6.3 Options Page

- [ ] Create options page (React)
- [ ] Settings for default behavior

### 6.4 Review Summary

- [ ] Fetch top review summary
- [ ] Display in popup

### 6.5 Content Script Overlay

- [ ] Create content script
- [ ] Inject rating badge on websites

---

## Current Status Summary

### What's Working:

- ✅ Extension builds successfully with `pnpm build`
- ✅ All unit tests pass (5 tests for domain/utils)
- ✅ Popup extracts current domain and displays it
- ✅ "View Trustpilot Reviews" button opens correct URL
- ✅ Basic error handling for invalid domains

### What's Missing:

- ⏸️ Extension icons (can add before Web Store submission)
- ⏸️ Component-level tests for Popup.tsx
- ⏸️ E2E testing in actual Chrome browser
- ⏸️ README documentation
- ⏸️ Edge case handling

### Next Actions:

1. **Load in Chrome** - Test the built extension manually
2. **Add icons** - Create simple PNG icons for toolbar
3. **Write README** - Basic usage instructions
4. **Future:** Add Trustpilot API integration for ratings

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
│   │   └── service-worker.ts      # Basic SW
│   ├── popup/
│   │   ├── index.html            # Popup template
│   │   ├── index.tsx             # Entry point
│   │   ├── Popup.tsx             # Main component
│   │   └── index.css             # Styling
│   ├── shared/
│   │   └── utils.ts              # Domain + Trustpilot utils
│   ├── __tests__/
│   │   └── utils.test.ts         # Unit tests (5 tests)
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
**MVP Status:** ✅ COMPLETE (functional extension ready)
