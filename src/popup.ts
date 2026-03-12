const toggle = document.getElementById("toggle") as HTMLInputElement;
const statusText = document.getElementById("status") as HTMLSpanElement;

async function init(): Promise<void> {
  const result = await chrome.storage.local.get("enabled");
  const enabled = result.enabled ?? true;
  toggle.checked = enabled;
  statusText.textContent = enabled ? "Active" : "Inactive";
}

toggle.addEventListener("change", async () => {
  const enabled = toggle.checked;
  await chrome.storage.local.set({ enabled });
  statusText.textContent = enabled ? "Active" : "Inactive";
});

const versionEl = document.getElementById("version");
if (versionEl) {
  versionEl.textContent = `v${chrome.runtime.getManifest().version}`;
}

init();
