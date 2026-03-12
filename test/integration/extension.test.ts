import { describe, it, expect, beforeEach, vi } from "vitest";
import { createChromeMock } from "../mocks/chrome.js";

let chromeMock: ReturnType<typeof createChromeMock>;

beforeEach(() => {
  chromeMock = createChromeMock();
  vi.stubGlobal("chrome", chromeMock);
});

async function loadBackground() {
  vi.resetModules();
  return import("../../src/background.js");
}

describe("extension lifecycle integration", () => {
  it("install → default ON → rules active → badge green", async () => {
    // Simulate fresh install: no storage value
    await loadBackground();

    // Trigger onInstalled callback
    const onInstalledCallback = chromeMock.runtime.onInstalled.listeners[0];
    await onInstalledCallback({ reason: "install" });

    // Wait for async operations
    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    });

    // Rules should have been added
    expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
      expect.objectContaining({
        addRules: expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ]),
      })
    );

    // Badge should be green
    expect(chromeMock.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#22c55e",
    });
  });

  it("toggle OFF → rules removed → badge gray", async () => {
    await loadBackground();

    // Trigger install first
    const onInstalledCallback = chromeMock.runtime.onInstalled.listeners[0];
    await onInstalledCallback({ reason: "install" });

    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    });

    // Clear mocks to isolate toggle behavior
    chromeMock.declarativeNetRequest.updateDynamicRules.mockClear();
    chromeMock.action.setBadgeText.mockClear();
    chromeMock.action.setBadgeBackgroundColor.mockClear();

    // Simulate popup toggling OFF via storage
    await chromeMock.storage.local.set({ enabled: false });

    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "OFF" });
    });

    // Rules should be removed (no addRules)
    expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [1, 2],
    });

    // Badge should be gray
    expect(chromeMock.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#9ca3af",
    });
  });

  it("toggle OFF → toggle ON → rules re-added → badge green", async () => {
    await loadBackground();

    // Install
    const onInstalledCallback = chromeMock.runtime.onInstalled.listeners[0];
    await onInstalledCallback({ reason: "install" });
    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    });

    // Toggle OFF
    await chromeMock.storage.local.set({ enabled: false });
    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "OFF" });
    });

    // Clear mocks
    chromeMock.declarativeNetRequest.updateDynamicRules.mockClear();
    chromeMock.action.setBadgeText.mockClear();
    chromeMock.action.setBadgeBackgroundColor.mockClear();

    // Toggle back ON
    await chromeMock.storage.local.set({ enabled: true });

    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    });

    // Rules should be re-added
    expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
      expect.objectContaining({
        addRules: expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ]),
      })
    );

    // Badge should be green again
    expect(chromeMock.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#22c55e",
    });
  });

  it("service worker restart re-syncs badge from storage", async () => {
    // Pre-set storage to disabled
    chromeMock.storage.local.data.enabled = false;

    await loadBackground();

    // Trigger onStartup (simulates service worker restart)
    const onStartupCallback = chromeMock.runtime.onStartup.listeners[0];
    await onStartupCallback();

    await vi.waitFor(() => {
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "OFF" });
    });

    expect(chromeMock.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#9ca3af",
    });
  });
});
