export interface ExtensionState {
  enabled: boolean;
}

export const DEFAULT_STATE: ExtensionState = { enabled: true };

export const RULE_ID_SALESFORCE = 1;
export const RULE_ID_LIGHTNING_FORCE = 2;

// Regex for *.my.salesforce.com Lightning record URLs
// Captures: (1) origin, (2) record ID
// Uses [a-zA-Z0-9]+ instead of {15,18} to stay under Chrome's 2KB RE2 compiled limit
export const REGEX_SALESFORCE =
  "^(https://[^/]+\\.my\\.salesforce\\.com)/lightning/r/\\w+/([a-zA-Z0-9]+)/view$";

// Regex for *.lightning.force.com Lightning record URLs
// Captures: (1) subdomain prefix (e.g. "acme"), (2) record ID
export const REGEX_LIGHTNING_FORCE =
  "^https://([^.]+)\\.lightning\\.force\\.com/lightning/r/\\w+/([a-zA-Z0-9]+)/view$";
