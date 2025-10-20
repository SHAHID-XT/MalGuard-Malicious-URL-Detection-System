// Blocked Page Logic for MalGuard
const params = new URLSearchParams(window.location.search);
const url = decodeURIComponent(params.get("url") || "");

document.getElementById("blocked-url").textContent = url || "Unknown";

// Fetch threat classification/confidence from backend
if (url) {
  fetch("http://127.0.0.1:5000/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })
    .then((res) => res.json())
    .then((data) => {
      const confidence = document.getElementById("confidence");
      if (data.confidence !== undefined) {
        confidence.textContent = `Confidence Score: ${(data.confidence * 100).toFixed(2)}%`;
        confidence.style.display = "inline-block";
      }
      if (data.is_malicious) {
        document.getElementById("continue").style.display = "inline-block";
      }
    })
    .catch((err) => {
      document.getElementById("confidence").textContent = "Confidence Score: N/A";
    });
}

// Utility: Extract domain from URL
function getDomain(u) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

// Continue Anyway – add to whitelist, skip block, reload page
document.getElementById("continue").addEventListener("click", () => {
if (!url) return;
  const domain = getDomain(url);
  if (!domain) { alert("Invalid domain"); return; }
  chrome.storage.sync.get({ whitelist: [] }, (data) => {
    const whitelist = data.whitelist;
    if (!whitelist.includes(domain)) {
      whitelist.push(domain);
      chrome.storage.sync.set({ whitelist }, () => {
        chrome.runtime.sendMessage({ action: "clear_cache", url }, () => {
          alert(`${domain} added to whitelist ✅`);
          window.location.href = url;
        });
      });
    } else {
      window.location.href = url;
    }
  });
});

// Add to Whitelist for allowed navigation on future visits
document.getElementById("whitelist").addEventListener("click", () => {
  if (!url) return;
  const domain = getDomain(url);
  if (!domain) { alert("Invalid domain"); return; }
  chrome.storage.sync.get({ whitelist: [] }, (data) => {
    const whitelist = data.whitelist;
    if (!whitelist.includes(domain)) {
      whitelist.push(domain);
      chrome.storage.sync.set({ whitelist }, () => {
        chrome.runtime.sendMessage({ action: "clear_cache", url }, () => {
          alert(`${domain} added to whitelist ✅`);
          window.location.href = url;
        });
      });
    } else {
      window.location.href = url;
    }
  });
});

// Go Back logic
document.getElementById("back").addEventListener("click", () => {
  if (window.history.length > 1) window.history.back();
  else window.close();
});
