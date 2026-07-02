const DEFAULT_TRUSTED_TOOLS = [
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
];

const DEFAULT_TRUSTED_SERVERS = [
  "MCP Neverending Coding"
];

const DEFAULT_TRUSTED_CONNECTORS = [
  "GitHub"
];

const STORAGE_KEYS = [
  "autoApprove",
  "trustedTools",
  "trustedServers",
  "trustedConnectors"
];

const autoApproveToggle = document.getElementById("auto-approve-toggle");

const toolInput = document.getElementById("tool-input");
const addToolBtn = document.getElementById("add-tool-btn");
const chipsListTools = document.getElementById("chips-list-tools");

const serverInput = document.getElementById("server-input");
const addServerBtn = document.getElementById("add-server-btn");
const chipsListServers = document.getElementById("chips-list-servers");

const connectorInput = document.getElementById("connector-input");
const addConnectorBtn = document.getElementById("add-connector-btn");
const chipsListConnectors = document.getElementById("chips-list-connectors");

const resetBtn = document.getElementById("reset-btn");
const saveToast = document.getElementById("save-toast");

let currentSettings = getDefaultSettings();
let toastTimeout;

function getDefaultSettings() {
  return {
    autoApprove: false,
    trustedTools: [...DEFAULT_TRUSTED_TOOLS],
    trustedServers: [...DEFAULT_TRUSTED_SERVERS],
    trustedConnectors: [...DEFAULT_TRUSTED_CONNECTORS]
  };
}

function uniqueSortedValues(values) {
  return Array.from(new Set((values || []).map(value => String(value).trim()).filter(Boolean)));
}

function normalizeSettings(settings) {
  return {
    autoApprove: settings.autoApprove === true,
    trustedTools: uniqueSortedValues(settings.trustedTools !== undefined ? settings.trustedTools : DEFAULT_TRUSTED_TOOLS),
    trustedServers: uniqueSortedValues(settings.trustedServers !== undefined ? settings.trustedServers : DEFAULT_TRUSTED_SERVERS),
    trustedConnectors: uniqueSortedValues(settings.trustedConnectors !== undefined ? settings.trustedConnectors : DEFAULT_TRUSTED_CONNECTORS)
  };
}

function showToast() {
  if (!saveToast) return;
  clearTimeout(toastTimeout);
  saveToast.classList.add("show");
  toastTimeout = setTimeout(() => {
    saveToast.classList.remove("show");
  }, 2000);
}

function renderChips(container, values, removeHandler, emptyText) {
  container.innerHTML = "";

  if (!values.length) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "empty-state";
    emptyMsg.textContent = emptyText;
    container.appendChild(emptyMsg);
    return;
  }

  values.forEach(value => {
    const chip = document.createElement("div");
    chip.className = "chip";

    const label = document.createElement("span");
    label.textContent = value;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "chip-delete";
    deleteBtn.type = "button";
    deleteBtn.setAttribute("aria-label", `移除 ${value}`);
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => removeHandler(value));

    chip.appendChild(label);
    chip.appendChild(deleteBtn);
    container.appendChild(chip);
  });
}

function renderAllChips() {
  renderChips(
    chipsListTools,
    currentSettings.trustedTools,
    removeTool,
    "目前沒有設定信任的 API 工具。"
  );

  renderChips(
    chipsListServers,
    currentSettings.trustedServers,
    removeServer,
    "目前沒有設定信任的 MCP 伺服器。"
  );

  renderChips(
    chipsListConnectors,
    currentSettings.trustedConnectors,
    removeConnector,
    "目前沒有設定信任的 Connector。"
  );
}

async function saveSettings() {
  currentSettings = normalizeSettings(currentSettings);

  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set(currentSettings);
    } else {
      localStorage.setItem("mcp_approval_settings_fallback_v2", JSON.stringify(currentSettings));
    }
    showToast();
  } catch (error) {
    console.error("儲存設定失敗:", error);
  }
}

async function loadSettings() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(STORAGE_KEYS);
      currentSettings = normalizeSettings(data);
    } else {
      const fallback = localStorage.getItem("mcp_approval_settings_fallback_v2");
      currentSettings = normalizeSettings(fallback ? JSON.parse(fallback) : getDefaultSettings());
    }

    autoApproveToggle.checked = currentSettings.autoApprove;
    renderAllChips();
  } catch (error) {
    console.error("載入設定失敗:", error);
    currentSettings = getDefaultSettings();
    renderAllChips();
  }
}

function addValue(input, listName, renderFn) {
  const value = input.value.trim();
  if (!value) return;

  if (!currentSettings[listName].includes(value)) {
    currentSettings[listName].push(value);
    currentSettings[listName] = uniqueSortedValues(currentSettings[listName]);
    renderFn();
    saveSettings();
  }

  input.value = "";
  input.focus();
}

function removeValue(listName, value, renderFn) {
  currentSettings[listName] = currentSettings[listName].filter(item => item !== value);
  renderFn();
  saveSettings();
}

function addTool() {
  addValue(toolInput, "trustedTools", renderAllChips);
}

function removeTool(toolName) {
  removeValue("trustedTools", toolName, renderAllChips);
}

function addServer() {
  addValue(serverInput, "trustedServers", renderAllChips);
}

function removeServer(serverName) {
  removeValue("trustedServers", serverName, renderAllChips);
}

function addConnector() {
  addValue(connectorInput, "trustedConnectors", renderAllChips);
}

function removeConnector(connectorName) {
  removeValue("trustedConnectors", connectorName, renderAllChips);
}

document.addEventListener("DOMContentLoaded", loadSettings);

autoApproveToggle.addEventListener("change", event => {
  currentSettings.autoApprove = event.target.checked;
  saveSettings();
});

addToolBtn.addEventListener("click", addTool);
toolInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addTool();
});

addServerBtn.addEventListener("click", addServer);
serverInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addServer();
});

addConnectorBtn.addEventListener("click", addConnector);
connectorInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addConnector();
});

resetBtn.addEventListener("click", () => {
  if (!confirm("您確定要將所有信任清單重設為預設值嗎？")) return;

  currentSettings = getDefaultSettings();
  autoApproveToggle.checked = currentSettings.autoApprove;
  renderAllChips();
  saveSettings();
});
