const API_URL = "http://127.0.0.1:5000/api/classify";
let cache = {};
const ALLOW_ONCE_TTL = 60 * 1000; // 60 seconds

// Helper: Clean up expired temporary allows
function cleanupAllowOnce(cb) {
  chrome.storage.local.get({ allowOnce: {} }, (items) => {
    const allowOnce = items.allowOnce || {};
    const now = Date.now();
    let changed = false;
    for (const u in allowOnce) {
      if (allowOnce[u] < now) {
        delete allowOnce[u];
        changed = true;
      }
    }
    if (changed) chrome.storage.local.set({ allowOnce }, cb || (() => {}));
    else cb && cb();
  });
}

// Check if URL is temporarily allowed
function isTemporarilyAllowed(url, cb) {
  cleanupAllowOnce(() => {
    chrome.storage.local.get({ allowOnce: {} }, (items) => {
      const allowOnce = items.allowOnce || {};
      cb(Boolean(allowOnce[url] && allowOnce[url] > Date.now()));
    });
  });
}

// Add a temporary allow for a URL
function addTemporaryAllow(url, ttlMs = ALLOW_ONCE_TTL, cb) {
  chrome.storage.local.get({ allowOnce: {} }, (items) => {
    const allowOnce = items.allowOnce || {};
    allowOnce[url] = Date.now() + ttlMs;
    chrome.storage.local.set({ allowOnce }, () => {
      cache[url] = false;
      cb && cb();
    });
  });
}

// Helper: Get domain from URL
function getDomain(u) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

// Helper: Redirect to block page
function redirectToBlock(tabId, url) {
  chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL("public/blocked.html") + "?url=" + encodeURIComponent(url),
  });
}

// Handle messages from UI or blocked.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;

  if (msg.action === "allow_once" && msg.url) {
    addTemporaryAllow(msg.url, msg.ttl || ALLOW_ONCE_TTL, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.action === "clear_cache" && msg.url) {
    delete cache[msg.url];
    sendResponse({ ok: true });
    return;
  }
});

// Navigation listener for proactive protection
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const url = details.url;
  const tabId = details.tabId;
  if (!url || !url.startsWith("http")) return;
  if (url.startsWith("chrome://") || url.startsWith("about:") || url.includes("127.0.0.1")) return;

  chrome.storage.sync.get({ enabled: true, whitelist: [] }, async (items) => {
    const enabled = items.enabled ?? true;
    const whitelist = items.whitelist || [];
    if (!enabled) return;

    const domain = getDomain(url);
    if (whitelist.includes(domain)) return;

    isTemporarilyAllowed(url, (tempAllowed) => {
      if (tempAllowed) return;

      if (cache[url] !== undefined) {
        if (cache[url]) {
          redirectToBlock(tabId, url);
        }
        return;
      }

      (async () => {
        try {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          const data = await res.json();
          if (data && data.is_malicious) {
            cache[url] = true;
            redirectToBlock(tabId, url);
          } else {
            cache[url] = false;
          }
        } catch (err) {
          console.error("API error:", err);
        }
      })();
    });
  });
});
