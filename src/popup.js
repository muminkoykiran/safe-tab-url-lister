const extensionApi =
  typeof browser !== "undefined"
    ? browser
    : chrome;


// ── i18n ──────────────────────────────────────────────────────────────────────

function i18n(key, ...subs) {
  return extensionApi.i18n.getMessage(key, subs) || key;
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

const output            = document.getElementById("output");
const count             = document.getElementById("count");
const status            = document.getElementById("status");
const includeTitles     = document.getElementById("includeTitles");
const includeIndex      = document.getElementById("includeIndex");
const includeLastAccess = document.getElementById("includeLastAccess");
const includeTabIds     = document.getElementById("includeTabIds");
const includeGroup      = document.getElementById("includeGroup");

const allWindows        = document.getElementById("allWindows");
const formatSelect      = document.getElementById("formatSelect");


// ── Status helper ─────────────────────────────────────────────────────────────

let statusTimer = null;

function setStatus(msg, type = "success") {
  clearTimeout(statusTimer);
  status.textContent = msg;
  status.className = type;
  if (msg) statusTimer = setTimeout(() => { status.textContent = ""; status.className = ""; }, 3000);
}

// ── Formatters ────────────────────────────────────────────────────────────────

/**
 * Formats browser tabs.
 *
 * Supported formats:
 * - "plain"
 * - "json"
 * - "csv"
 * - "tsv"
 * - "markdown"
 * - "markdown-list"
 *
 * @param {Array<object>} tabs
 * @param {string} format
 * @param {object} options
 * @param {boolean} [options.withTitles=false]
 * @param {boolean} [options.withIndex=false]
 * @param {boolean} [options.withLastAccess=false]
 * @param {boolean} [options.withTabIds=false]
 * @param {boolean} [options.withGroup=false]
 * @param {boolean} [options.allWindows=false]
 * @returns {Promise<string>}
 */
async function formatTabs(tabs, format, options = {}) {
  const {
    withTitles = false,
    withIndex = false,
    withLastAccess = false,
    withTabIds = false,
    withGroup = false,
    allWindows = false,
  } = options;


  /*
   * Create one normalized entry per tab. Property insertion order is:
   *
   * 1. IDs
   * 2. Additional fields
   * 3. Title and URL
   */
  const entries = await Promise.all(
    tabs.map(async tab => {
      const entry = {};

      entry.index = valueOrEmpty(tab.index);

      if (withTitles) {
        entry.title = tab.title || "";
      }

      entry.url = tab.url || tab.pendingUrl || "";
      entry.windowId = valueOrEmpty(tab.windowId);

      if (tab.groupId > 0) {
        entry.groupId = valueOrEmpty(tab.groupId);
      }

      if (withTabIds) {
        entry.id = valueOrEmpty(tab.id);
        entry.openerTabId = valueOrEmpty(tab.openerTabId);
      }

      if (allWindows) {
        entry.incognito = valueOrEmpty(tab.incognito);
      }
      entry.lastAccessed = formatDateOrEmpty(tab.lastAccessed);

      return {
        tab,
        entry,
      };
    })
  );

  switch (format) {
    case "csv":
    case "tsv":
      let delim = ",";
      if (format == "tsv") {
        delim = "\t";
      }

      return formatDelimited(entries, {
        delimiter: delim,
        withTitles,
        withIndex,
        withLastAccess,
        withTabIds,
        withGroup,
        allWindows,
      });
      break;

    case "json":
      return JSON.stringify(
        entries.map(({ entry }) => {
          const values = {
            url: entry.url || ""
          };

          if (allWindows) {
            values.windowId = entry.windowId;
          }
          if (withIndex) {
            values.index = entry.index;
          }

          if (withTitles) {
            values.title = entry.title || "";
          }

          if (withTabIds) {
            values.id = entry.id;
            values.openerTabId = entry.openerTabId;
          }

          if (withGroup && entry.groupId > 0) {
            values.groupId = entry.groupId;
          }

          if (allWindows) {
            values.incognito = entry.incognito;
          }

          if (withLastAccess) {
            values.lastAccessed = entry.lastAccessed;
          }

          return values;
        }),
        null,
        2
      );
      break;

    //case "markdown":
    //case "markdown-list":
    //case "plain":
    default:
      return formatText(entries, format, {
        withTitles,
        withIndex,
        withLastAccess,
        withTabIds,
        withGroup,
        allWindows,
      });
      break;
  }

}

/**
 * Produces text output
 *   - Markdown on single line
 *   - Markdown with a sublist,
 *   or
 *   - Plain text
 */
function formatText(entries, format, options) {
  const {
    withTitles,
    withIndex,
    withLastAccess,
    withTabIds,
    withGroup,
    allWindows,
  } = options;

  const lines = [];
  let previousWindowId;
  let listIndex = 0;

  for (const { tab } of entries) {
    if (allWindows && tab.windowId !== previousWindowId) {
      if (lines.length > 0 && format != "plain") {
        lines.push("");
      }
      if (lines.length > 1) {
        lines.push("");
      }

      if (allWindows) {
        lines.push(`# Window: ${tab.windowId} ${tab.incognito ? "[incognito] " : ""}#`);
      } else {
        lines.push(`# Window #`);
      }
      lines.push("");

      previousWindowId = tab.windowId;

      //listIndex = 0;
    }

    const baseLine = (withIndex ? (tab.index + 1) + ". " : "") + formatMarkdownLink(tab, withTitles);

    if (format == "markdown") {
      const sections = [];

      sections.push(baseLine)

      if (withTabIds) {
        sections.push("Tab: " + `${valueOrEmpty(tab.id)}`)
        if (tab.openerTabId) {
          sections.push(`(Opened By: ${valueOrEmpty(tab.openerTabId)})`)
        }
        //sections.push("-");
      }

      if (withGroup && tab.groupId > 0) {
        sections.push(
          `[Group: ${valueOrEmpty(tab.groupId)}]`
        );
      }

      if (withLastAccess) {
        const lastAccessedStr = formatDateOrEmpty(tab.lastAccessed);
        if (lastAccessedStr != "") {
          sections.push(`(${formatDateOrEmpty(tab.lastAccessed)})`);
        }
      }

      lines.push(sections.join(" "));

    } else if (format == "markdown-list") {

      lines.push((withIndex ? "" : "* ") + baseLine)

      if (withTabIds) {
        lines.push(`    * Tab Id: ${valueOrEmpty(tab.id)}`);
        if (tab.openerTabId) {
          lines.push(
            `    * Opened By Tab: ${valueOrEmpty(tab.openerTabId)}`
          );
        }
      }

      if (withGroup && tab.groupId > 0) {
        lines.push(`    * Group: ${valueOrEmpty(tab.groupId)}`
        );
      }


      if (withLastAccess) {
        lines.push(
          `    * Last Accessed: ${formatDateOrEmpty(tab.lastAccessed)}`
        );
      }

    } else {

      const url = tab.url || tab.pendingUrl || "";

      if (withTitles && tab.title) {
        lines.push(
          (withIndex ? (tab.index + 1) + ". " : "") + tab.title,
          url
        );
      } else {
        lines.push(
          (withIndex ? (tab.index + 1) + ". " : "") + url
        );
      }

      if (withTabIds) {
        lines.push(`Tab Id: ${valueOrEmpty(tab.id)}`);
        if (tab.openerTabId) {
          lines.push(
            `Opened By: ${valueOrEmpty(tab.openerTabId)}`
          );
        }
      }

      if (withGroup && tab.groupId > 0) {
        lines.push(`Group: ${valueOrEmpty(tab.groupId)}`
        );
      }

      if (withLastAccess && tab.lastAccessed) {
        lines.push(
          `Last Accessed: ${formatDateOrEmpty(tab.lastAccessed)}`
        );
      }

      // extra space between entries
      lines.push("");

    }

  }

  return lines.join("\n");
}

/**
 * Formats CSV or tab-separated output.
 *
 * Field order:
 * 1. Optional ordered-list number
 * 2. windowId
 * 3. index
 * 4. id
 * 5. openerTabId
 * 6. groupId
 * 9. hidden
 * 10. incognito
 * 11. lastAccessed
 * 12. title
 * 13. url
 */
function formatDelimited(entries, options) {
  const {
    delimiter,
    withTitles,
    withIndex,
    withTabIds,
    withGroup,
    withLastAccess,
    allWindows
  } = options;

  const headers = [];

  if (allWindows) {
    headers.push(
      "windowId"
    );
  }

  if (withIndex) {
    headers.push(
      "index"
    );
  }

  if (withTitles) {
    headers.push("title");
  }

  headers.push("url");

  if (withTabIds) {
    headers.push(
      "Tab Id",
      "Opened By Tab Id"
    );
  }

  if (withGroup) {
    headers.push(
      "Group Id",
    );
  }

  if (allWindows) {
    headers.push(
      "incognito",
    );
  }

  if (withLastAccess) {
    headers.push(
      "lastAccessed"
    );
  }

  const rows = entries.map(({ tab }, index) => {
    const values = [];

    if (allWindows) {
      values.push(
        valueOrEmpty(tab.windowId)
      );
    }

    if (withIndex) {
      values.push(
        tab.index
      );
    }

    if (withTitles) {
      values.push(tab.title || "");
    }

    values.push(tab.url || tab.pendingUrl || "");

    if (withTabIds) {
      values.push(
        valueOrEmpty(tab.id),
        valueOrEmpty(tab.openerTabId),
      );
    }

    if (withGroup) {
      values.push(
        tab.groupId > 0 ? valueOrEmpty(tab.groupId) : "",
      );
    }

    if (allWindows) {
      values.push(
        valueOrEmpty(tab.incognito),
      );
    }

    if (withLastAccess) {
      values.push(
        formatDateOrEmpty(tab.lastAccessed)
      );
    }

    return values
      .map(value => escapeDelimitedValue(value, delimiter))
      .join(delimiter);
  });

  const header = headers
    .map(value => escapeDelimitedValue(value, delimiter))
    .join(delimiter);

  return [header, ...rows].join("\n");
}



function formatMarkdownLink(tab, withTitles) {
  const url = tab.url || tab.pendingUrl || "";

  const label = withTitles
    ? tab.title || getHostname(url).replace(/^www\./i, "")
    : getHostname(url).replace(/^www\./i, "");

  return `[${escapeMarkdownText(label)}](${escapeMarkdownUrl(url)})`;
}


function getHostname(url) {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    /*
     * URLs such as about:blank do not have a hostname.
     */
    return parsedUrl.hostname || parsedUrl.protocol.replace(/:$/, "") || url;
  } catch {
    return url;
  }
}



function escapeDelimitedValue(value, delimiter) {

  let text = String(value ?? "");

  // add
  if (delimiter === "\t") {
    text = text.replace(/^([=+\-@\t\r])/, "'$1");
  }

  /*
   * Preserve each record as one physical line
   * Tabs, newlines, and backslashes are escaped.
   */
  text = text
    .replace(/\\/g, "\\\\")
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");



  if (delimiter === ",") {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text
}


function escapeMarkdownText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\r?\n/g, " ");
}


function escapeMarkdownUrl(value) {
  return String(value ?? "")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\s/g, "%20");
}


function valueOrEmpty(value) {
  return value === undefined || value === null
    ? ""
    : value;
}

function formatDateOrEmpty(value) {
  if (value === undefined || value === null) {
    return ""
  }

  const ds = new Date(value).toISOString();
  return ds;
}


/**
 * Supports both:
 *
 * - Promise-based browser.* APIs
 * - callback-based chrome.* APIs
 */
function callExtensionApi(apiObject, methodName, ...args) {
  const method = apiObject?.[methodName];

  if (typeof method !== "function") {
    return Promise.reject(
      new Error(`Extension API method ${methodName} is unavailable`)
    );
  }

  /*
   * Firefox's browser namespace is Promise-based.
   * Current Chromium APIs may also return promises.
   */
  if (typeof browser !== "undefined") {
    try {
      return Promise.resolve(method.call(apiObject, ...args));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /*
   * Try the Promise form first. This works in current Chrome
   * Manifest V3 implementations.
   */
  try {
    const result = method.call(apiObject, ...args);

    if (result && typeof result.then === "function") {
      return result;
    }
  } catch {
    // Fall through to the callback form.
  }

  /*
   * Callback fallback for older Chromium-compatible
   * implementations.
   */
  return new Promise((resolve, reject) => {
    method.call(apiObject, ...args, result => {
      const runtimeError = chrome.runtime?.lastError;

      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }

      resolve(result);
    });
  });
}

// ── Load tabs ─────────────────────────────────────────────────────────────────

async function loadTabs() {
  setStatus("");
  const query  = allWindows.checked ? {} : { currentWindow: true };
  const tabs   = await extensionApi.tabs.query(query);
  const active = tabs.filter(t => t.url);

  if (active.length === 0) {
    output.value  = "";
    count.textContent = i18n("noTabs");
    return;
  }


  const formatOptions = {
    withTitles:      includeTitles      ? includeTitles.checked      : false,
    withIndex:       includeIndex       ? includeIndex.checked       : false,
    withLastAccess:  includeLastAccess  ? includeLastAccess.checked  : false,
    withTabIds:      includeTabIds      ? includeTabIds.checked      : false,
    withGroup:       includeGroup       ? includeGroup.checked       : false,

    allWindows:      allWindows         ? allWindows.checked         : false,
  };

  output.value      = await formatTabs(active, formatSelect.value, formatOptions);
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
includeIndex.addEventListener("change", loadTabs);
includeLastAccess.addEventListener("change", loadTabs);
includeTabIds.addEventListener("change", loadTabs);
includeGroup.addEventListener("change", loadTabs);
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
