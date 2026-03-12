# SF Lightning to Classic

Chrome extension that redirects Salesforce Lightning record pages to Classic view.

## Install from Chrome Web Store

*Coming soon*

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm

### Install & Build

```bash
npm install
npm run build
```

### Load in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this project's root directory

The extension icon (lightning bolt) appears in the toolbar. Click it to toggle redirection on/off.

### Commands

| Command | Description |
|---|---|
| `npm run build` | Build `dist/background.js` and `dist/popup.js` |
| `npm test` | Run all 34 tests |
| `npm run lint` | TypeScript type check |
| `npm run icons` | Generate PNG icons from SVG source |
| `npm run package` | Build + icons + create ZIP for Chrome Web Store upload |

### Project Structure

```
├── src/
│   ├── background.ts    # Service worker: declarativeNetRequest rules
│   ├── popup.ts         # Popup toggle logic
│   ├── popup.html       # Popup UI
│   ├── popup.css        # Popup styles
│   ├── types.ts         # Shared constants and types
│   └── url-transform.ts # URL regex patterns
├── icons/
│   └── icon.svg         # Source icon (PNGs generated via npm run icons)
├── scripts/
│   ├── generate-icons.mjs  # SVG → PNG conversion
│   └── package.mjs         # ZIP packaging for store upload
├── test/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── mocks/           # Chrome API mocks
├── manifest.json        # MV3 extension manifest
└── build.mjs            # esbuild config
```

## How It Works

Uses Chrome's `declarativeNetRequest` API to redirect URLs matching these patterns:

- `https://*.my.salesforce.com/lightning/r/{Object}/{RecordId}/view` → `https://*.my.salesforce.com/{RecordId}`
- `https://*.lightning.force.com/lightning/r/{Object}/{RecordId}/view` → `https://*.my.salesforce.com/{RecordId}`

No content scripts, no data collection, no network requests. Toggle state stored locally via `chrome.storage.local`.

## License

[MIT](LICENSE)
