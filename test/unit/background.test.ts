import { describe, it, expect, beforeEach, vi } from "vitest";
import { createChromeMock } from "../mocks/chrome.js";

let chromeMock: ReturnType<typeof createChromeMock>;

beforeEach(() => {
  chromeMock = createChromeMock();
  vi.stubGlobal("chrome", chromeMock);
});

// Dynamic import to pick up the fresh chrome global each time
async function loadBackground() {
  // Clear module cache so the module re-executes with fresh chrome mock
  const modulePath = "../../src/background.js";
  vi.resetModules();
  return import(modulePath);
}

describe("background", () => {
  describe("enableRules", () => {
    it("adds both redirect rules", async () => {
      const { enableRules } = await loadBackground();
      await enableRules();

      expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [1, 2],
        addRules: expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ]),
      });
    });
  });

  describe("disableRules", () => {
    it("removes all rules without adding new ones", async () => {
      const { disableRules } = await loadBackground();
      await disableRules();

      expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [1, 2],
      });
    });
  });

  describe("updateBadge", () => {
    it("sets green badge when enabled", async () => {
      const { updateBadge } = await loadBackground();
      await updateBadge(true);

      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
      expect(chromeMock.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: "#22c55e",
      });
    });

    it("sets gray badge when disabled", async () => {
      const { updateBadge } = await loadBackground();
      await updateBadge(false);

      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "OFF" });
      expect(chromeMock.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: "#9ca3af",
      });
    });
  });

  describe("syncState", () => {
    it("enables rules and sets badge when storage says enabled", async () => {
      chromeMock.storage.local.data.enabled = true;
      const { syncState } = await loadBackground();
      await syncState();

      expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
        expect.objectContaining({
          addRules: expect.arrayContaining([
            expect.objectContaining({ id: 1 }),
          ]),
        })
      );
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    });

    it("defaults to enabled when storage is empty", async () => {
      const { syncState } = await loadBackground();
      await syncState();

      expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
        expect.objectContaining({
          addRules: expect.arrayContaining([
            expect.objectContaining({ id: 1 }),
          ]),
        })
      );
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    });

    it("disables rules when storage says disabled", async () => {
      chromeMock.storage.local.data.enabled = false;
      const { syncState } = await loadBackground();
      await syncState();

      expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [1, 2],
      });
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "OFF" });
    });
  });

  describe("handleStorageChange", () => {
    it("enables rules when toggled on", async () => {
      const { handleStorageChange } = await loadBackground();
      await handleStorageChange(
        { enabled: { oldValue: false, newValue: true } },
        "local"
      );

      expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    });

    it("disables rules when toggled off", async () => {
      const { handleStorageChange } = await loadBackground();
      await handleStorageChange(
        { enabled: { oldValue: true, newValue: false } },
        "local"
      );

      expect(chromeMock.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({ text: "OFF" });
    });

    it("ignores changes to other storage areas", async () => {
      const { handleStorageChange } = await loadBackground();
      handleStorageChange(
        { enabled: { oldValue: false, newValue: true } },
        "sync"
      );

      // Only the calls from module-level listeners should exist
      const callCount = chromeMock.action.setBadgeText.mock.calls.length;
      handleStorageChange(
        { enabled: { oldValue: false, newValue: true } },
        "sync"
      );
      // No new calls should have been made
      expect(chromeMock.action.setBadgeText.mock.calls.length).toBe(callCount);
    });

    it("ignores changes to other keys", async () => {
      const { handleStorageChange } = await loadBackground();
      const callsBefore = chromeMock.declarativeNetRequest.updateDynamicRules.mock.calls.length;
      handleStorageChange(
        { someOtherKey: { oldValue: "a", newValue: "b" } },
        "local"
      );
      expect(chromeMock.declarativeNetRequest.updateDynamicRules.mock.calls.length).toBe(callsBefore);
    });
  });

  describe("lifecycle listeners", () => {
    it("registers onInstalled listener", async () => {
      await loadBackground();
      expect(chromeMock.runtime.onInstalled.addListener).toHaveBeenCalled();
    });

    it("registers onStartup listener", async () => {
      await loadBackground();
      expect(chromeMock.runtime.onStartup.addListener).toHaveBeenCalled();
    });

    it("registers storage.onChanged listener", async () => {
      await loadBackground();
      expect(chromeMock.storage.onChanged.addListener).toHaveBeenCalled();
    });
  });
});
