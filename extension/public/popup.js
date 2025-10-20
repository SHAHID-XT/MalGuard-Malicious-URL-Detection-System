document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('toggle');
  const status = document.getElementById('status');
  const whitelistList = document.getElementById('whitelist-list');
  const showAddModalBtn = document.getElementById('show-add-modal');
  const modal = document.getElementById('modal');
  const addDomainBtn = document.getElementById('add-domain');
  const closeModalBtn = document.getElementById('close-modal');
  const domainInput = document.getElementById('domain-input');

  // Helpers for Chrome storage
  function get(key, callback) {
    chrome.storage.sync.get([key], (data) => callback(data[key] || []));
  }
  function set(key, value) {
    let obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj);
  }

  // Update protection status
  function loadStatus() {
    chrome.storage.sync.get(['enabled'], (data) => {
      const enabled = data.enabled !== false;
      status.textContent = enabled ? "Enabled" : "Disabled";
      toggleBtn.textContent = enabled ? "Disable Protection" : "Enable Protection";
      document.body.classList.toggle("disabled", !enabled);
    });
  }
  function updateStatus(enabled) {
    status.textContent = enabled ? "Enabled" : "Disabled";
    toggleBtn.textContent = enabled ? "Disable Protection" : "Enable Protection";
    document.body.classList.toggle("disabled", !enabled);
    set("enabled", enabled);
  }
  toggleBtn.addEventListener("click", () => {
    chrome.storage.sync.get(['enabled'], (data) => {
      const enabled = !(data.enabled !== false);
      updateStatus(enabled);
    });
  });

  
  // Whitelist UI logic
  function loadWhitelist() {
    get("whitelist", (whitelist) => {
      whitelistList.innerHTML = "";
      if (whitelist.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No whitelisted domains.";
        li.className = "empty";
        whitelistList.appendChild(li);
      }
      whitelist.forEach((domain) => {
        const li = document.createElement("li");
        li.textContent = domain;
        whitelistList.appendChild(li);
      });
    });
  }

  // Modal logic for adding domain
  showAddModalBtn.addEventListener("click", () => {
    domainInput.value = "";
    modal.classList.remove("hidden");
    domainInput.focus();
  });
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  addDomainBtn.addEventListener("click", () => {
    const domain = domainInput.value.trim().toLowerCase();
    if (!domain) return alert("Enter a domain.");
    get("whitelist", (whitelist) => {
      if (!whitelist.includes(domain)) {
        whitelist.push(domain);
        set("whitelist", whitelist);
        loadWhitelist();
        modal.classList.add("hidden");
      } else {
        alert("Domain already whitelisted.");
      }
    });
  });

  loadStatus();
  loadWhitelist();
});
