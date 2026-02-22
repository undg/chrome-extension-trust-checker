# Trustpilot Checker - Implementation Plan

## Phase 1: Foundation & Setup

### 1.1 Project Initialization

**Goal:** Bootstrap the project with proper tooling

**Tasks:**

- [ ] Initialize npm project
- [ ] Install Vite + React + TypeScript template
- [ ] Install CRXJS Vite plugin for Chrome extension support
- [ ] Install Vitest + React Testing Library
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Configure Vite (vite.config.ts) with CRXJS
- [ ] Setup project folder structure

**Key Decisions:**

- Use CRXJS for HMR and manifest management
- Separate `src/` into logical domains (popup, background, shared)
- Enable strict TypeScript mode

### 1.2 Manifest V3 Configuration

**Goal:** Define extension metadata and permissions

**Tasks:**

- [ ] Create manifest.json with:
  - Manifest version 3
  - Extension name, description, version
  - Icons configuration
  - Action (popup) definition
  - Background service worker declaration
  - Permissions: `activeTab`, `tabs`
  - Host permissions (for Trustpilot access)

**Key Decisions:**

- Minimal permissions to start (can expand later)
- Action popup as primary UI
- Service worker for background logic

### 1.3 Icon Assets

**Goal:** Create extension icons for Chrome Web Store

**Tasks:**

- [ ] Design/create icon set:
  - 16x16 (toolbar icon)
  - 48x48 (extensions page)
  - 128x128 (Web Store)
- [ ] Add to `public/icons/`

## Phase 2: Core Extension Logic

### 2.1 Domain Extraction Utilities

**Goal:** Extract clean domain from any URL

**Tasks:**

- [ ] Create `src/shared/utils.ts`
- [ ] Implement `extractDomain(url: string): string`
  - Handle protocols (http, https)
  - Handle subdomains (www, m, etc.)
  - Handle ports and paths
  - Return clean domain (e.g., "example.com")
- [ ] Write unit tests for edge cases
  - URLs with subdomains
  - URLs with ports
  - Internationalized domain names
  - IP addresses (reject or handle)

**Example:**

```typescript
extractDomain("https://www.amazon.com/gp/product/B123");
// Returns: "amazon.com"
```

### 2.2 Trustpilot Integration Utilities

**Goal:** Build Trustpilot URLs and API helpers

**Tasks:**

- [ ] Create `src/shared/trustpilot.ts`
- [ ] Implement `buildReviewUrl(domain: string): string`
  - Returns: `https://www.trustpilot.com/review/{domain}`
- [ ] Write unit tests
- [ ] Document future API endpoints (for Phase 4)

### 2.3 Service Worker (Background Script)

**Goal:** Handle tab queries and messaging

**Tasks:**

- [ ] Create `src/background/service-worker.ts`
- [ ] Implement current tab query:
  ```typescript
  chrome.tabs.query({ active: true, currentWindow: true });
  ```
- [ ] Implement message handler for popup communication
- [ ] Handle "getCurrentDomain" message
- [ ] Handle "openTrustpilot" message (opens new tab)

**Architecture:**

```
Popup (React) ←→ Service Worker ←→ Chrome Tabs API
                ↓
         Trustpilot Website
```

### 2.4 Type Definitions

**Goal:** Shared TypeScript interfaces

**Tasks:**

- [ ] Create `src/shared/types.ts`
- [ ] Define interfaces:

  ```typescript
  interface TabInfo {
    domain: string;
    url: string;
    title: string;
  }

  interface TrustpilotMessage {
    type: "GET_DOMAIN" | "OPEN_TRUSTPILOT";
    payload?: string;
  }
  ```

## Phase 3: Popup UI

### 3.1 Popup Component Structure

**Goal:** React-based popup interface

**Tasks:**

- [ ] Create `src/popup/index.html` (template)
- [ ] Create `src/popup/index.tsx` (entry point)
- [ ] Create `src/popup/Popup.tsx` (main component)
- [ ] Setup basic React structure with hooks

**UI Layout:**

```
┌─────────────────────────┐
│  🔍 Trustpilot Checker  │
├─────────────────────────┤
│                         │
│  Current Website:       │
│  ┌───────────────────┐  │
│  │ amazon.com        │  │
│  └───────────────────┘  │
│                         │
│  [Check on Trustpilot]  │
│                         │
└─────────────────────────┘
```

### 3.2 State Management

**Goal:** Handle popup state

**Tasks:**

- [ ] Implement loading state (while fetching domain)
- [ ] Implement error state (if no active tab)
- [ ] Store current domain in component state
- [ ] Use useEffect to fetch domain on mount

### 3.3 Chrome Messaging Integration

**Goal:** Connect popup to service worker

**Tasks:**

- [ ] Implement `getCurrentDomain()` helper
- [ ] Send message to service worker
- [ ] Handle response and update state
- [ ] Handle errors gracefully

### 3.4 Styling

**Goal:** Clean, modern UI

**Tasks:**

- [ ] Add CSS/SCSS or CSS-in-JS solution
- [ ] Style popup container (fixed width ~350px)
- [ ] Style domain display area
- [ ] Style "Check on Trustpilot" button
- [ ] Add hover states and transitions
- [ ] Ensure dark mode support (optional but nice)

### 3.5 Open Trustpilot Action

**Goal:** Navigate to Trustpilot reviews

**Tasks:**

- [ ] Add click handler to button
- [ ] Send "OPEN_TRUSTPILOT" message with domain
- [ ] Service worker opens new tab
- [ ] Close popup after opening (optional)

### 3.6 Testing Popup

**Goal:** Ensure reliability

**Tasks:**

- [ ] Test React component rendering (Vitest + RTL)
- [ ] Mock chrome.runtime API
- [ ] Test button click handlers
- [ ] Test error states

## Phase 4: Integration & Testing

### 4.1 End-to-End Testing

**Goal:** Verify full flow works

**Tasks:**

- [ ] Load extension in Chrome (chrome://extensions → Developer mode → Load unpacked)
- [ ] Test on various websites:
  - Simple domains (google.com)
  - Subdomains (www.amazon.com, m.amazon.com)
  - Complex URLs with paths and params
- [ ] Verify Trustpilot opens with correct domain
- [ ] Check service worker console for errors

### 4.2 Build & Package

**Goal:** Production-ready build

**Tasks:**

- [ ] Configure Vite production build
- [ ] Test `npm run build` output
- [ ] Verify all files in `dist/`:
  - manifest.json
  - popup HTML/JS/CSS
  - service worker JS
  - icons
- [ ] Test loading built extension locally

### 4.3 Error Handling

**Goal:** Graceful failure handling

**Tasks:**

- [ ] Handle cases where no tab is active
- [ ] Handle Chrome API permission errors
- [ ] Handle invalid URLs (chrome://, file://, etc.)
- [ ] Display user-friendly error messages in popup

### 4.4 Edge Cases

**Goal:** Handle unusual scenarios

**Tasks:**

- [ ] Test on Chrome internal pages (should show error)
- [ ] Test when Trustpilot is blocked (network error)
- [ ] Test rapid clicking (debounce if needed)
- [ ] Test domain extraction accuracy

## Phase 5: Polish & Documentation

### 5.1 README.md

**Goal:** Project documentation

**Tasks:**

- [ ] Write installation instructions
- [ ] Document development workflow
- [ ] Add screenshots/GIFs of extension in action
- [ ] Document architecture decisions
- [ ] Add contributing guidelines

### 5.2 Code Cleanup

**Goal:** Maintainable code

**Tasks:**

- [ ] Remove console.logs
- [ ] Add inline comments for complex logic
- [ ] Ensure consistent code style (ESLint/Prettier)
- [ ] Review TypeScript strictness
- [ ] Check for any TODOs or FIXMEs

### 5.3 Performance Optimization

**Goal:** Fast, lightweight extension

**Tasks:**

- [ ] Audit bundle size
- [ ] Check for unnecessary dependencies
- [ ] Optimize icon sizes
- [ ] Minimize popup load time

## Phase 6: Future Enhancements (Post-MVP)

### 6.1 Trustpilot API Integration

**Goal:** Fetch and display ratings

**Research:**

- [ ] Investigate Trustpilot public API
- [ ] Check API rate limits and authentication
- [ ] Design data structures for ratings

**Implementation:**

- [ ] Add API client in service worker
- [ ] Cache results (chrome.storage.local)
- [ ] Display rating in popup
- [ ] Show review count and star rating

### 6.2 Extension Badge

**Goal:** Show rating on toolbar icon

**Tasks:**

- [ ] Use `chrome.action.setBadgeText()` for rating
- [ ] Color-code by rating (green/yellow/red)
- [ ] Update badge when tab changes

### 6.3 Options Page

**Goal:** User preferences

**Tasks:**

- [ ] Create options page (React)
- [ ] Add to manifest.json
- [ ] Settings:
  - Default behavior (open in new tab vs current)
  - Badge display preferences
  - API key configuration (if needed)

### 6.4 Review Summary

**Goal:** Inline review data in popup

**Tasks:**

- [ ] Fetch top review summary
- [ ] Display recent review highlights
- [ ] Show rating distribution chart

### 6.5 Content Script Overlay

**Goal:** Non-intrusive website overlay

**Tasks:**

- [ ] Create content script
- [ ] Inject rating badge on websites (optional)
- [ ] Respect user privacy (opt-in)

## Technical Decisions

### Why CRXJS?

CRXJS is the best Vite plugin for Chrome extensions because it:

- Provides true HMR for popup and content scripts
- Handles manifest.json generation from Vite config
- Automatically reloads extension during development
- Supports Manifest V3
- Has excellent React integration

### Why Vitest over Jest?

- Native TypeScript support (no ts-jest)
- Faster test execution
- Modern ES modules support
- Built-in assertions (no chai needed)
- Better Vite integration

### Why not Redux/Context for state?

Popup is a simple component with minimal state. React hooks are sufficient. If we add options page and content script communication later, we can consider Zustand or Context.

### Security Model

- Service worker has no DOM access (good for security)
- Communication via chrome.runtime messaging (validated)
- No content scripts in MVP (reduces attack surface)
- Minimal permissions (only what's needed)

## File Structure

```
trustpilot-checker/
├── .opencode/
│   └── AGENTS.md
├── public/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── manifest.json
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── popup/
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── Popup.tsx
│   │   └── styles.css
│   ├── shared/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── trustpilot.ts
│   └── __tests__/
│       ├── utils.test.ts
│       ├── trustpilot.test.ts
│       └── Popup.test.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## Success Criteria

### MVP Complete When:

- [ ] Extension loads in Chrome without errors
- [ ] Clicking icon shows popup with current domain
- [ ] "Check on Trustpilot" button opens correct URL
- [ ] Works on 95%+ of websites
- [ ] All unit tests pass
- [ ] Build produces valid extension package
- [ ] Code is TypeScript strict compliant

### Quality Metrics:

- Bundle size < 100KB (excluding icons)
- Popup load time < 100ms
- Zero console errors in production
- 100% unit test coverage for utilities

## Risk Mitigation

### Chrome API Changes

- **Risk:** Google changes MV3 APIs
- **Mitigation:** Use standard, stable APIs only (tabs, runtime)

### Trustpilot Blocks Requests

- **Risk:** Trustpilot blocks/scraping detection
- **Mitigation:** We're only opening URLs, not scraping. Future API use will be via official API with rate limiting.

### Permission Rejection

- **Risk:** Chrome Web Store rejects permission request
- **Mitigation:** Minimal permissions, clear justification in description

### Build Complexity

- **Risk:** Vite + CRXJS configuration issues
- **Mitigation:** Follow official CRXJS guides, use proven boilerplate patterns

## Next Steps

1. **Review this plan** - Discuss any changes or concerns
2. **Approve architecture** - Confirm technology choices
3. **Begin Phase 1** - Start with project setup
4. **Iterate** - Adjust plan as we learn during implementation

---

**Estimated Timeline:** 3-4 days for MVP
**Future Phases:** 1-2 weeks for full feature set
