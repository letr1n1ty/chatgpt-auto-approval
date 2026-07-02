const D = globalThis.ApprovalHelperDefaults;
const S = globalThis.ApprovalHelperStorage;
const Dom = globalThis.ApprovalHelperDom;
const Clicker = globalThis.ApprovalHelperClicker;

const approvedDialogs = new WeakSet();
const pendingDialogs = new WeakSet();

let TRUSTED_TOOLS = new Set(D.DEFAULT_TRUSTED_TOOLS);
let TRUSTED_SERVERS = new Set(D.DEFAULT_TRUSTED_SERVERS);
let AUTO_APPROVE = false;

function applySettings(settings) {
  AUTO_APPROVE = settings.autoApprove;
  TRUSTED_TOOLS = new Set(settings.trustedTools);
  TRUSTED_SERVERS = new Set(settings.trustedServers);
}

async function init() {
  const settings = await S.getSettings();
  applySettings(settings);

  S.onSettingsChanged(async () => {
    const updated = await S.getSettings();
    applySettings(updated);
    scan();
  });
}

function findApprovalDialog() {
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [aria-modal="true"]'));
  for (const el of dialogs) {
    if (!Dom.isElementVisible(el)) continue;
    const text = Dom.getVisibleText(el);
    const hasAllow = text.includes("Allow") || text.includes("允許") || text.includes("同意");
    const hasMcp = text.includes("MCP") || text.includes("tool") || text.includes("工具");
    if (hasAllow && hasMcp) return el;
  }
  return null;
}

function extractTarget(dialog) {
  const text = Dom.getVisibleText(dialog);

  for (const s of TRUSTED_SERVERS) {
    if (text.includes(s)) return { name: s, type: "server" };
  }

  for (const t of TRUSTED_TOOLS) {
    if (text.includes(t)) return { name: t, type: "tool" };
  }

  const match = text.match(/([a-zA-Z_][a-zA-Z0-9_\-]{2,})/);
  if (!match) return { name: null, type: "unknown" };

  return { name: match[1], type: "tool" };
}

function findAllowButton(dialog) {
  const buttons = Array.from(dialog.querySelectorAll("button")).filter(Dom.isElementVisible);

  const strong = buttons.find(b => {
    const t = Dom.normalizeText(Dom.getAccessibleText(b));
    return t.includes("always allow") || t.includes("一律允許");
  });
  if (strong) return strong;

  return buttons.find(b => {
    const t = Dom.normalizeText(Dom.getAccessibleText(b));
    return t === "allow" || t.includes("allow") || t.includes("允許") || t.includes("同意");
  }) || null;
}

function showBadge(dialog, name, type, trusted) {
  let badge = document.getElementById("mcp-approval-helper-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "mcp-approval-helper-badge";
    document.body.appendChild(badge);
  }

  const title = trusted ? `Trusted ${type}` : `Review ${type}`;
  const subtitle = trusted ? "Trusted item" : "Manual approval required";

  badge.innerHTML = `
    <div class="mcp-helper-card">
      <div class="mcp-helper-top">
        <div>${trusted ? "✓" : "!"}</div>
        <div>
          <div>${title}</div>
          <div>${subtitle}</div>
        </div>
      </div>
      <div class="mcp-helper-chip">${Dom.escapeHTML(name || "Unknown")}</div>
    </div>
  `;
}

function scan() {
  const dialog = findApprovalDialog();
  if (!dialog) return;

  if (approvedDialogs.has(dialog)) return;

  const { name, type } = extractTarget(dialog);

  const trusted = name && (
    (type === "server" && TRUSTED_SERVERS.has(name)) ||
    (type === "tool" && TRUSTED_TOOLS.has(name))
  );

  showBadge(dialog, name, type, trusted);

  if (AUTO_APPROVE && trusted && !pendingDialogs.has(dialog)) {
    pendingDialogs.add(dialog);

    Clicker.clickWithRetry({
      dialog,
      findButton: findAllowButton,
      isEnabled: Dom.isButtonEnabled,
      click: Dom.simulateRealClick,
      onSuccess: () => {
        approvedDialogs.add(dialog);
        pendingDialogs.delete(dialog);
        S.logApproval({ toolName: name, trusted });
      },
      onExhausted: () => pendingDialogs.delete(dialog)
    });
  }
}

function throttle() {
  requestAnimationFrame(scan);
}

const observer = new MutationObserver(throttle);
observer.observe(document.documentElement, { childList: true, subtree: true });

init().then(throttle);
