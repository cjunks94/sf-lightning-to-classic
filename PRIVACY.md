# Privacy Policy

**SF Lightning to Classic** does not collect, store, transmit, or share any personal data or browsing history.

## Data Stored Locally

The extension stores a single boolean preference (`enabled`) using the browser's local storage API (`chrome.storage.local`). This data:

- Never leaves your device
- Is not transmitted to any server
- Is not shared with any third party
- Contains no personal information

## Permissions Explained

- **declarativeNetRequest**: Used to redirect Salesforce Lightning URLs to Classic view. All URL matching happens locally in the browser.
- **storage**: Used to persist your on/off preference across browser sessions.
- **Host permissions** (`*.lightning.force.com`, `*.my.salesforce.com`): Required to match and redirect Salesforce URLs. The extension only processes navigation to these domains.

## Contact

If you have questions about this privacy policy, open an issue on the [GitHub repository](https://github.com/cjunker/sf-lightning-to-classic).

*Last updated: March 2026*
