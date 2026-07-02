const DEFAULT_TRUSTED_TOOLS = new Set([
  "apply_patch",
  "exec_command",
  "write_stdin",
  "kill_session",
  "replace_text",
  "run_npm_test",
  "run_npm_typecheck",
  "run_npm_build",
  "git_status",
  "git_diff"
]);

const DEFAULT_TRUSTED_SERVERS = new Set([
  "MCP Neverending Coding"
]);

let TRUSTED_TOOLS = new Set(DEFAULT_TRUSTED_TOOLS);
let TRUSTED_SERVERS = new Set(DEFAULT_TRUSTED_SERVERS);
let AUTO_APPROVE = false;

const approvedDialogs = new WeakSet();

async function initConfig() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    try {
      const data = await chrome.storage.local.get(["autoApprove", "trustedTools", "trustedServers"]);
      if (data.autoApprove !== undefined) {
        AUTO_APPROVE = data.autoApprove;
      }
      if (data.trustedTools !== undefined) {
        TRUSTED_TOOLS = new Set([...DEFAULT_TRUSTED_TOOLS, ...data.trustedTools]);
      }
      if (data.trustedServers !== undefined) {
        TRUSTED_SERVERS = new Set([...DEFAULT_TRUSTED_SERVERS, ...data.trustedServers]);
      }
    } catch (error) {
      console.error("[Approval Helper] Failed to load settings from chrome.storage:", error);
    }

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace !== "local") return;

      if (changes.autoApprove) {
        AUTO_APPROVE = changes.autoApprove.newValue;
      }
      if (changes.trustedTools) {
        TRUSTED_TOOLS = new Set([...DEFAULT_TRUSTED_TOOLS, ...changes.trustedTools.newValue]);
      }
      if (changes.trustedServers) {
        TRUSTED_SERVERS = new Set([...DEFAULT_TRUSTED_SERVERS, ...changes.trustedServers.newValue]);
      }

      scan();
    });
  }
}

async function addNewTrustedTool(toolName) {
  if (!toolName) return;
  TRUSTED_TOOLS.add(toolName);

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    try {
      await chrome.storage.local.set({ trustedTools: Array.from(TRUSTED_TOOLS) });
      console.log(`[Approval Helper] Added trusted tool: ${toolName}`);
    } catch (error) {
      console.error("[Approval Helper] Failed to save trusted tool:", error);
    }
    return;
  }

  try {
    const fallbackSettings = JSON.parse(localStorage.getItem("mcp_approval_settings_fallback_v2") || "{}");
    fallbackSettings.autoApprove = fallbackSettings.autoApprove === true;
    fallbackSettings.trustedTools = Array.isArray(fallbackSettings.trustedTools) ? fallbackSettings.trustedTools : [];
    fallbackSettings.trustedServers = Array.isArray(fallbackSettings.trustedServers) ? fallbackSettings.trustedServers : [];
    fallbackSettings.trustedConnectors = Array.isArray(fallbackSettings.trustedConnectors) ? fallbackSettings.trustedConnectors : [];

    if (!fallbackSettings.trustedTools.includes(toolName)) {
      fallbackSettings.trustedTools.push(toolName);
      localStorage.setItem("mcp_approval_settings_fallback_v2", JSON.stringify(fallbackSettings));
    }
    scan();
  } catch (error) {
    console.error("[Approval Helper] Failed to save trusted tool fallback:", error);
  }
}

async function addNewTrustedServer(serverName) {
  if (!serverName) return;
  TRUSTED_SERVERS.add(serverName);

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    try {
      await chrome.storage.local.set({ trustedServers: Array.from(TRUSTED_SERVERS) });
      console.log(`[Approval Helper] Added trusted server: ${serverName}`);
    } catch (error) {
      console.error("[Approval Helper] Failed to save trusted server:", error);
    }
    return;
  }

  try {
    const fallbackSettings = JSON.parse(localStorage.getItem("mcp_approval_settings_fallback_v2") || "{}");
    fallbackSettings.autoApprove = fallbackSettings.autoApprove === true;
    fallbackSettings.trustedTools = Array.isArray(fallbackSettings.trustedTools) ? fallbackSettings.trustedTools : [];
    fallbackSettings.trustedServers = Array.isArray(fallbackSettings.trustedServers) ? fallbackSettings.trustedServers : [];
    fallbackSettings.trustedConnectors = Array.isArray(fallbackSettings.trustedConnectors) ? fallbackSettings.trustedConnectors : [];

    if (!fallbackSettings.trustedServers.includes(serverName)) {
      fallbackSettings.trustedServers.push(serverName);
      localStorage.setItem("mcp_approval_settings_fallback_v2", JSON.stringify(fallbackSettings));
    }
    scan();
  } catch (error) {
    console.error("[Approval Helper] Failed to save trusted server fallback:", error);
  }
}

function getVisibleText(el) {
  return (el?.innerText || el?.textContent || "").trim();
}

function isElementVisible(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
}

function findApprovalDialog() {
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [aria-modal="true"]'));
  for (const el of dialogs) {
    if (!isElementVisible(el)) continue;
    const text = getVisibleText(el);
    const hasAllow = text.includes("Allow") || text.includes("允許") || text.includes("同意");
    const hasMcp = text.includes("MCP") || text.includes("tool") || text.includes("工具");
    if (hasAllow && hasMcp) return el;
  }

  const buttons = Array.from(document.querySelectorAll("button"));
  for (const button of buttons) {
    if (!isElementVisible(button)) continue;

    const buttonText = getVisibleText(button).toLowerCase();
    const isAllowButton = buttonText === "allow" || buttonText.includes("allow") || buttonText.includes("允許") || buttonText.includes("同意");
    if (!isAllowButton) continue;

    let parent = button.parentElement;
    let depth = 0;
    while (parent && depth < 6) {
      const parentText = getVisibleText(parent);
      const hasMcp = parentText.includes("MCP") || parentText.includes("tool") || parentText.includes("工具");
      if (hasMcp) return parent;
      parent = parent.parentElement;
      depth += 1;
    }
  }

  return null;
}

function extractToolName(dialog) {
  const text = getVisibleText(dialog);

  for (const server of TRUSTED_SERVERS) {
    if (text.includes(server)) return { name: server, type: "server" };
  }
  for (const tool of TRUSTED_TOOLS) {
    if (text.includes(tool)) return { name: tool, type: "tool" };
  }

  const zhMatch = text.match(/使用\s*([a-zA-Z0-9_\s\-]+)\s*嗎/);
  if (zhMatch && zhMatch[1]) {
    const extracted = zhMatch[1].trim();
    if (extracted.toLowerCase().includes("mcp") || extracted.length > 3) {
      return { name: extracted, type: "server" };
    }
  }

  const enMatch = text.match(/use\s*([a-zA-Z0-9_\s\-]+)\?/i);
  if (enMatch && enMatch[1]) {
    const extracted = enMatch[1].trim();
    if (extracted.toLowerCase().includes("mcp") || extracted.length > 3) {
      return { name: extracted, type: "server" };
    }
  }

  const match = text.match(/\b[a-zA-Z_][a-zA-Z0-9_]{2,}\b/g);
  if (!match) return { name: null, type: "unknown" };

  const foundToolName = match.find((token) =>
    token.includes("_") &&
    !["read_only", "tool_call", "tool_calls"].includes(token.toLowerCase())
  ) || null;

  return { name: foundToolName, type: foundToolName ? "tool" : "unknown" };
}

function findAllowButton(dialog) {
  const buttons = Array.from(dialog.querySelectorAll("button")).filter(isElementVisible);

  const alwaysAllowButton = buttons.find(button => {
    const text = getVisibleText(button).toLowerCase();
    return text.includes("always allow") || text.includes("一律允許") || text.includes("一律同意");
  });
  if (alwaysAllowButton) return alwaysAllowButton;

  return buttons.find((button) => {
    const text = getVisibleText(button).toLowerCase();
    return text === "allow" || text.includes("allow") || text.includes("允許") || text.includes("同意");
  }) || null;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function ensureApprovalHelperStyles() {
  if (document.getElementById("mcp-approval-helper-style")) return;

  const style = document.createElement("style");
  style.id = "mcp-approval-helper-style";
  style.textContent = `
    #mcp-approval-helper-badge {
      position: fixed;
      z-index: 2147483647;
      top: 20px;
      right: 20px;
      width: min(360px, calc(100vw - 32px));
      overflow: hidden;
      border-radius: 22px;
      border: 1px solid rgba(122, 162, 247, 0.22);
      background:
        radial-gradient(circle at 0% 0%, rgba(122, 162, 247, 0.16), transparent 42%),
        rgba(31, 35, 53, 0.90);
      color: #c0caf5;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.46), inset 0 1px rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(22px) saturate(1.2);
      -webkit-backdrop-filter: blur(22px) saturate(1.2);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, sans-serif;
      opacity: 0;
      transform: translateY(-10px) scale(0.98);
      transition: opacity 180ms ease, transform 180ms ease;
      pointer-events: auto;
    }

    #mcp-approval-helper-badge.mcp-helper-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .mcp-helper-card {
      padding: 14px;
    }

    .mcp-helper-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mcp-helper-icon {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      flex: 0 0 auto;
      border-radius: 12px;
      color: #101014;
      font-size: 17px;
      font-weight: 900;
      box-shadow: inset 0 1px rgba(255, 255, 255, 0.24);
    }

    .mcp-helper-icon.trusted {
      background: linear-gradient(135deg, #9ece6a, #7dcfff);
    }

    .mcp-helper-icon.untrusted {
      background: linear-gradient(135deg, #f7768e, #e0af68);
    }

    .mcp-helper-title {
      color: #d5dcff;
      font-size: 14px;
      font-weight: 760;
      letter-spacing: -0.01em;
      line-height: 1.25;
    }

    .mcp-helper-subtitle {
      margin-top: 3px;
      color: #a9b1d6;
      font-size: 12px;
      line-height: 1.38;
    }

    .mcp-helper-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .mcp-helper-chip {
      display: inline-flex;
      max-width: 100%;
      align-items: center;
      min-height: 30px;
      padding: 6px 10px;
      color: #7dcfff;
      background: rgba(122, 162, 247, 0.13);
      border: 1px solid rgba(122, 162, 247, 0.24);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.2;
    }

    .mcp-helper-chip span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mcp-helper-actions {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(122, 162, 247, 0.12);
    }

    #mcp-helper-trust-btn {
      width: 100%;
      height: 38px;
      border: 0;
      border-radius: 12px;
      padding: 0 13px;
      color: #101014;
      background: linear-gradient(135deg, #7aa2f7, #7dcfff);
      font: 800 12px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 10px 22px rgba(122, 162, 247, 0.18);
    }

    #mcp-helper-trust-btn:hover {
      filter: brightness(1.05);
    }
  `;
  document.documentElement.appendChild(style);
}

function showBadge(dialog, name, type, trusted) {
  ensureApprovalHelperStyles();

  let badge = document.getElementById("mcp-approval-helper-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "mcp-approval-helper-badge";
    document.body.appendChild(badge);
    requestAnimationFrame(() => badge.classList.add("mcp-helper-visible"));
  }

  const typeText = type === "server" ? "MCP Server" : type === "tool" ? "API Tool" : "Approval Item";
  const safeName = escapeHTML(name || "Unknown");
  const title = trusted ? `Trusted ${typeText}` : `Review ${typeText}`;
  const subtitle = trusted
    ? "This item is in your allowlist. Auto-approval can run when enabled."
    : "This item is not in your allowlist. Manual confirmation is required.";
  const icon = trusted ? "✓" : "!";
  const iconClass = trusted ? "trusted" : "untrusted";
  const actionLabel = type === "server" ? "Trust this MCP server" : "Trust this API tool";
  const actionHtml = !trusted && name
    ? `<div class="mcp-helper-actions"><button id="mcp-helper-trust-btn" type="button">${actionLabel}</button></div>`
    : "";

  badge.innerHTML = `
    <div class="mcp-helper-card">
      <div class="mcp-helper-top">
        <div class="mcp-helper-icon ${iconClass}">${icon}</div>
        <div>
          <div class="mcp-helper-title">${title}</div>
          <div class="mcp-helper-subtitle">${subtitle}</div>
        </div>
      </div>
      <div class="mcp-helper-chip-row">
        <div class="mcp-helper-chip"><span>${safeName}</span></div>
      </div>
      ${actionHtml}
    </div>
  `;

  dialog.dataset.mcpApprovalHelperOutline = "true";
  dialog.style.outline = trusted ? "2px solid rgba(158, 206, 106, 0.88)" : "2px solid rgba(247, 118, 142, 0.88)";
  dialog.style.outlineOffset = "3px";
  dialog.style.boxShadow = trusted
    ? "0 0 0 6px rgba(158, 206, 106, 0.12), 0 22px 70px rgba(0, 0, 0, 0.28)"
    : "0 0 0 6px rgba(247, 118, 142, 0.12), 0 22px 70px rgba(0, 0, 0, 0.28)";

  if (!trusted && name) {
    setTimeout(() => {
      const trustButton = document.getElementById("mcp-helper-trust-btn");
      if (!trustButton) return;
      trustButton.onclick = async () => {
        if (type === "server") {
          await addNewTrustedServer(name);
        } else {
          await addNewTrustedTool(name);
        }
      };
    }, 0);
  }
}

function removeBadgeAndOutline() {
  const badge = document.getElementById("mcp-approval-helper-badge");
  if (badge) {
    badge.classList.remove("mcp-helper-visible");
    setTimeout(() => badge.remove(), 180);
  }

  const outlinedElements = document.querySelectorAll('[data-mcp-approval-helper-outline="true"]');
  outlinedElements.forEach(el => {
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.boxShadow = "";
    delete el.dataset.mcpApprovalHelperOutline;
  });
}

function logApproval(toolName, trusted) {
  const key = "mcpApprovalHelperLog";
  try {
    const oldLog = JSON.parse(localStorage.getItem(key) || "[]");
    oldLog.push({
      toolName,
      trusted,
      time: new Date().toISOString(),
      url: location.href
    });
    localStorage.setItem(key, JSON.stringify(oldLog.slice(-200)));
  } catch (error) {
    console.error("[Approval Helper] Failed to write audit log:", error);
  }
}

function simulateRealClick(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const eventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2
  };

  ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(eventName => {
    element.dispatchEvent(new MouseEvent(eventName, eventInit));
  });

  element.click();
}

function isButtonEnabled(button) {
  if (!button) return false;
  if (button.disabled) return false;
  if (button.getAttribute("aria-disabled") === "true") return false;

  const style = window.getComputedStyle(button);
  if (style.pointerEvents === "none") return false;

  const classList = Array.from(button.classList).map(c => c.toLowerCase());
  return !classList.some(c => c.includes("disabled") || c.includes("loading") || c.includes("wait"));
}

function autoApproveWithRetry(dialog, toolName) {
  const delaySequence = [100, 400, 800, 1500, 2500, 4000, 6000, 9000, 12000, 16000, 20000, 25000, 30000];

  delaySequence.forEach((delay, index) => {
    setTimeout(() => {
      if (!document.body.contains(dialog)) return;

      const allowButton = findAllowButton(dialog);
      if (allowButton && isButtonEnabled(allowButton)) {
        console.log(`[Approval Helper] Auto-approving ${toolName} (${index + 1}, ${delay}ms)`);
        simulateRealClick(allowButton);
      }
    }, delay);
  });
}

function scan() {
  const dialog = findApprovalDialog();

  if (!dialog) {
    removeBadgeAndOutline();
    return;
  }

  if (approvedDialogs.has(dialog)) return;

  const { name, type } = extractToolName(dialog);
  const trusted = name && (
    (type === "server" && TRUSTED_SERVERS.has(name)) ||
    (type === "tool" && TRUSTED_TOOLS.has(name))
  );

  showBadge(dialog, name, type, trusted);

  if (AUTO_APPROVE && trusted) {
    approvedDialogs.add(dialog);
    logApproval(name, true);
    autoApproveWithRetry(dialog, name);
  }
}

document.addEventListener("keydown", (event) => {
  if (!(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "y")) return;

  const dialog = findApprovalDialog();
  if (!dialog || approvedDialogs.has(dialog)) return;

  const { name, type } = extractToolName(dialog);
  const trusted = name && (
    (type === "server" && TRUSTED_SERVERS.has(name)) ||
    (type === "tool" && TRUSTED_TOOLS.has(name))
  );

  if (!trusted) {
    const typeText = type === "server" ? "MCP server" : "API tool";
    const confirmApprove = confirm(`Warning: this ${typeText} [${name || "Unknown"}] is not in your allowlist.\n\nApprove it manually?`);
    if (!confirmApprove) return;
  }

  const allowButton = findAllowButton(dialog);
  if (!allowButton) {
    alert("Allow button was not found. Please click it manually.");
    return;
  }

  approvedDialogs.add(dialog);
  logApproval(name, trusted);
  simulateRealClick(allowButton);
});

let scanPending = false;
function throttleScan() {
  if (scanPending) return;
  scanPending = true;
  requestAnimationFrame(() => {
    scan();
    scanPending = false;
  });
}

const observer = new MutationObserver(throttleScan);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

initConfig().then(() => {
  throttleScan();
});
