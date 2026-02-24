# Trust Checker

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?style=flat-square&logo=googlechrome)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)]()

Instantly check any website's Trustpilot rating. See star ratings, review counts, and trust scores without leaving the page you're on.

![Trust Checker Screenshot](screenshots/popup.png)

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store listing]()
2. Click **"Add to Chrome"**
3. Click **"Add extension"** when prompted
4. The Trust Checker icon will appear in your toolbar

### Manual Installation

If you prefer to install from source:

1. Download the latest release from the [Releases](https://github.com/yourusername/trust-checker/releases) page
2. Unzip the file
3. Open Chrome and go to `chrome://extensions/`
4. Enable **"Developer mode"** (toggle in top right)
5. Click **"Load unpacked"**
6. Select the unzipped folder

## How to Use

1. **Visit any website** (e.g., amazon.com, google.com)
2. **Click the Trust Checker icon** in your Chrome toolbar
3. **See the rating instantly** - stars, numeric score, review count, and trust level
4. **Click "View on Trustpilot"** to read detailed reviews in a new tab

The extension icon also shows a **color-coded badge**:
- **Green** - Excellent (4.0+ stars)
- **Yellow** - Average (3.0-3.9 stars)
- **Red** - Poor (below 3.0 stars)
- **Gray** - No Trustpilot data available

## Features

- **Instant ratings** - View Trustpilot scores without leaving the current site
- **Visual trust indicators** - Color-coded badges and star ratings at a glance
- **Review counts** - See how many reviews contribute to the rating
- **Trust levels** - Know if a site is rated Excellent, Great, or Poor
- **One-click access** - Jump to full Trustpilot reviews with a single click
- **Lightweight** - Minimal permissions, no background tracking
- **Privacy-first** - No data collection, no analytics, no third-party requests except Trustpilot

## Privacy

Trust Checker is designed with privacy in mind:

- **No personal data collected** - We don't track you or store your browsing history
- **No analytics** - No Google Analytics, no telemetry, no crash reporting
- **Minimal permissions** - Only requests what's absolutely necessary:
  - `activeTab` - Access the current tab when you click the icon
  - `tabs` - Read the current website's URL to look up its Trustpilot rating
- **Direct Trustpilot connection** - All rating data comes directly from Trustpilot's public pages

## Troubleshooting

**Extension not working?**

- Make sure you're on a valid website (not chrome:// pages or browser settings)
- Some sites may not have Trustpilot ratings - this is shown as "No rating available"
- Try refreshing the page and clicking the extension icon again

**Rating seems wrong?**

- Ratings are pulled directly from Trustpilot and update when Trustpilot updates
- Some sites may have multiple listings on Trustpilot

**Extension icon missing?**

- Click the puzzle piece icon in Chrome's toolbar
- Click the pin icon next to "Trust Checker" to keep it visible

## Support & Feedback

Found a bug or have a feature request?

- [Open an issue](https://github.com/yourusername/trust-checker/issues) on GitHub
- Contact us at: your-email@example.com

## Development

Want to contribute or build from source? See below.

### Project Structure

```
src/
├── popup/              # Extension popup UI
│   ├── components/     # React components (RatingTab, ConfigTab, StarRating)
│   ├── hooks/          # Custom hooks (useStore, useTabNavigation)
│   ├── store.ts        # State management
│   └── Popup.tsx       # Main popup component
├── background/         # Service worker
│   └── service-worker.ts
├── api/                # Trustpilot API clients
│   ├── fetchRating.ts  # Rating fetcher
│   ├── scrapeRating.ts # Web scraper
│   └── api.ts          # API abstraction
├── shared/             # Shared utilities
│   ├── types.ts        # TypeScript interfaces
│   ├── utils.ts        # Domain extraction helpers
│   ├── cache.ts        # Rating cache
│   └── config.ts       # Configuration
└── manifest.json       # Extension manifest
```

### Loading the Extension in Dev Mode

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Then load the extension in Chrome:

1. **Open Chrome extensions page:**
   - Navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top right)

2. **Load the extension:**
   - Click **"Load unpacked"**
   - Select the `dist/` folder from your project directory
   - The Trust Checker icon should appear in your toolbar

3. **Test it:**
   - Visit any website (e.g., `google.com`)
   - Click the Trust Checker icon
   - The popup should show the current domain and fetch Trustpilot data

4. **Development workflow:**
   - Make changes to source files
   - The dev server automatically rebuilds
   - Click the refresh icon on the extension card in `chrome://extensions/`
   - Test your changes immediately

### Technology Stack

Built with TypeScript, React, and Vite (Manifest V3 Chrome extension).

## License

MIT License - see [LICENSE](LICENSE) file for details.
