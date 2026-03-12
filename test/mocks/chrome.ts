import { vi } from "vitest";

interface StorageArea {
  data: Record<string, unknown>;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
}

interface ChromeMock {
  storage: {
    local: StorageArea;
    onChanged: {
      addListener: ReturnType<typeof vi.fn>;
      listeners: Function[];
    };
  };
  declarativeNetRequest: {
    updateDynamicRules: ReturnType<typeof vi.fn>;
    getDynamicRules: ReturnType<typeof vi.fn>;
    RuleActionType: { REDIRECT: "redirect" };
    ResourceType: { MAIN_FRAME: "main_frame" };
  };
  action: {
    setBadgeText: ReturnType<typeof vi.fn>;
    setBadgeBackgroundColor: ReturnType<typeof vi.fn>;
  };
  runtime: {
    onInstalled: {
      addListener: ReturnType<typeof vi.fn>;
      listeners: Function[];
    };
    onStartup: {
      addListener: ReturnType<typeof vi.fn>;
      listeners: Function[];
    };
  };
}

export function createChromeMock(): ChromeMock {
  const storageData: Record<string, unknown> = {};
  const storageChangeListeners: Function[] = [];
  const installedListeners: Function[] = [];
  const startupListeners: Function[] = [];

  return {
    storage: {
      local: {
        data: storageData,
        get: vi.fn(async (keys: string | string[]) => {
          if (typeof keys === "string") {
            return { [keys]: storageData[keys] };
          }
          const result: Record<string, unknown> = {};
          for (const key of keys) {
            result[key] = storageData[key];
          }
          return result;
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          const changes: Record<
            string,
            { oldValue: unknown; newValue: unknown }
          > = {};
          for (const [key, value] of Object.entries(items)) {
            changes[key] = { oldValue: storageData[key], newValue: value };
            storageData[key] = value;
          }
          for (const listener of storageChangeListeners) {
            listener(changes, "local");
          }
        }),
      },
      onChanged: {
        addListener: vi.fn((fn: Function) => {
          storageChangeListeners.push(fn);
        }),
        listeners: storageChangeListeners,
      },
    },
    declarativeNetRequest: {
      updateDynamicRules: vi.fn(async () => {}),
      getDynamicRules: vi.fn(async () => []),
      RuleActionType: { REDIRECT: "redirect" as const },
      ResourceType: { MAIN_FRAME: "main_frame" as const },
    },
    action: {
      setBadgeText: vi.fn(async () => {}),
      setBadgeBackgroundColor: vi.fn(async () => {}),
    },
    runtime: {
      onInstalled: {
        addListener: vi.fn((fn: Function) => {
          installedListeners.push(fn);
        }),
        listeners: installedListeners,
      },
      onStartup: {
        addListener: vi.fn((fn: Function) => {
          startupListeners.push(fn);
        }),
        listeners: startupListeners,
      },
    },
  };
}
