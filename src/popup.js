// ── i18n ──────────────────────────────────────────────────────────────────────

function i18n(key, ...subs) {
  return chrome.i18n.getMessage(key, subs) || key;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = i18n(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", i18n(el.dataset.i18nAria));
  });
  document.querySelector("textarea#output").setAttribute(
    "aria-label", i18n("outputAriaLabel")
  );
}

// ── DOM refs ──────────────────────────────────────────────────────────────────

const output        = document.getElementById("output");
const count         = document.getElementById("count");
const status        = document.getElementById("status");
const includeTitles = document.getElementById("includeTitles");
const allWindows    = document.getElementById("allWindows");
const formatSelect  = document.getElementById("formatSelect");

// ── Status helper ─────────────────────────────────────────────────────────────

let statusTimer = null;

function setStatus(msg, type = "success") {
  clearTimeout(statusTimer);
  status.textContent = msg;
  status.className = type;
  if (msg) statusTimer = setTimeout(() => { status.textContent = ""; status.className = ""; }, 3000);
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatTabs(tabs, format, withTitles) {
  switch (format) {
    case "markdown":
      return tabs.map(t =>
        withTitles && t.title ? `[${t.title}](${t.url})` : t.url
      ).join("\n");

    case "json":
      return JSON.stringify(
        tabs.map(t => withTitles ? { title: t.title || "", url: t.url } : { url: t.url }),
        null, 2
      );

    case "csv": {
      const header = withTitles ? "title,url\n" : "url\n";
      const rows = tabs.map(t =>
        withTitles
          ? `"${(t.title || "").replace(/"/g, '""')}","${t.url}"`
          : `"${t.url}"`
      );
      return header + rows.join("\n");
    }

    default: // plain
      return tabs.map(t =>
        withTitles && t.title ? `${t.title}\n${t.url}` : t.url
      ).join("\n\n");
  }
}

// ── Load tabs ─────────────────────────────────────────────────────────────────

async function loadTabs() {
  setStatus("");
  const query  = allWindows.checked ? {} : { currentWindow: true };
  const tabs   = await chrome.tabs.query(query);
  const active = tabs.filter(t => t.url);

  if (active.length === 0) {
    output.value  = "";
    count.textContent = i18n("noTabs");
    return;
  }

  output.value      = formatTabs(active, formatSelect.value, includeTitles.checked);
  count.textContent = i18n("tabCount", String(active.length));
}

// ── Copy ──────────────────────────────────────────────────────────────────────

async function copyOutput() {
  setStatus("");
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    setStatus(i18n("copied"), "success");
  } catch (err) {
    console.error("Clipboard write failed:", err);
    setStatus(i18n("copyFailed", err.message), "error");
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.getElementById("refresh").addEventListener("click", () => {
  loadTabs().catch(err => {
    count.textContent = "—";
    setStatus(i18n("tabsError", err.message), "error");
    console.error(err);
  });
});

document.getElementById("copy").addEventListener("click", copyOutput);
includeTitles.addEventListener("change", loadTabs);
allWindows.addEventListener("change", loadTabs);
formatSelect.addEventListener("change", loadTabs);

// ── Init ──────────────────────────────────────────────────────────────────────

applyI18n();

loadTabs()
  .then(() => { document.getElementById("includeTitles").focus(); })
  .catch(err => {
    count.textContent = "—";
    setStatus(i18n("tabsError", err.message), "error");
    console.error(err);
  });
