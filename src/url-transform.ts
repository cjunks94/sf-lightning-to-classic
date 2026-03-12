const LIGHTNING_RECORD_REGEX =
  /^\/lightning\/r\/[A-Za-z_]+\/([a-zA-Z0-9]{15,18})\/view$/;

const LIGHTNING_FORCE_HOST_REGEX = /^(.+)\.lightning\.force\.com$/;

/**
 * Transforms a Salesforce Lightning record URL to its Classic equivalent.
 * Returns null if the URL is not a recognized Lightning record page.
 */
export function transformUrl(urlString: string): string | null {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  const pathMatch = url.pathname.match(LIGHTNING_RECORD_REGEX);
  if (!pathMatch) return null;

  const recordId = pathMatch[1];

  // Handle *.lightning.force.com → *.my.salesforce.com
  const hostMatch = url.hostname.match(LIGHTNING_FORCE_HOST_REGEX);
  if (hostMatch) {
    const subdomain = hostMatch[1];
    return `https://${subdomain}.my.salesforce.com/${recordId}`;
  }

  // Handle *.my.salesforce.com (including sandbox: *.sandbox.my.salesforce.com)
  if (url.hostname.endsWith(".my.salesforce.com")) {
    return `${url.origin}/${recordId}`;
  }

  return null;
}
