import {
  DEFAULT_STATE,
  REGEX_LIGHTNING_FORCE,
  REGEX_SALESFORCE,
  RULE_ID_LIGHTNING_FORCE,
  RULE_ID_SALESFORCE,
} from "./types.js";

const REDIRECT_RULES: chrome.declarativeNetRequest.Rule[] = [
  {
    id: RULE_ID_SALESFORCE,
    priority: 1,
    action: {
      type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
      redirect: { regexSubstitution: "\\1/\\2" },
    },
    condition: {
      regexFilter: REGEX_SALESFORCE,
      resourceTypes: [
        "main_frame" as chrome.declarativeNetRequest.ResourceType,
      ],
    },
  },
  {
    id: RULE_ID_LIGHTNING_FORCE,
    priority: 1,
    action: {
      type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
      redirect: {
        regexSubstitution: "https://\\1.my.salesforce.com/\\2",
      },
    },
    condition: {
      regexFilter: REGEX_LIGHTNING_FORCE,
      resourceTypes: [
        "main_frame" as chrome.declarativeNetRequest.ResourceType,
      ],
    },
  },
];

const ALL_RULE_IDS = [RULE_ID_SALESFORCE, RULE_ID_LIGHTNING_FORCE];

export async function enableRules(): Promise<void> {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ALL_RULE_IDS,
    addRules: REDIRECT_RULES,
  });
}

export async function disableRules(): Promise<void> {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ALL_RULE_IDS,
  });
}

export async function updateBadge(enabled: boolean): Promise<void> {
  await chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
  await chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#22c55e" : "#9ca3af",
  });
}

export async function syncState(): Promise<void> {
  const result = await chrome.storage.local.get("enabled");
  const enabled = result.enabled ?? DEFAULT_STATE.enabled;

  if (enabled) {
    await enableRules();
  } else {
    await disableRules();
  }
  await updateBadge(enabled);
}

export async function handleStorageChange(
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string
): Promise<void> {
  if (areaName !== "local" || !changes.enabled) return;
  const enabled = changes.enabled.newValue as boolean;
  if (enabled) {
    await enableRules();
  } else {
    await disableRules();
  }
  await updateBadge(enabled);
}

// Service worker entry point
chrome.runtime.onInstalled.addListener(() => {
  syncState();
});

chrome.runtime.onStartup.addListener(() => {
  syncState();
});

chrome.storage.onChanged.addListener(handleStorageChange);
