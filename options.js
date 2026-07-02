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

const SUPPORTED_LANGUAGES = ["zh-Hant", "zh-Hans", "en"];

const I18N = {
  "zh-Hant": {
    appTitle: "ChatGPT Approval Helper",
    popupTitle: "Approval Helper",
    subtitle: "用 allowlist 控制 MCP tools、MCP servers 與 connectors 的自動授權。",
    popupSubtitle: "控制 tools、servers 與 connectors 的自動授權。",
    groupLanguage: "Language",
    languageTitle: "介面語言",
    languageDesc: "首次開啟會依瀏覽器語言自動選擇，不支援時使用英文。",
    languageZhHant: "繁體中文",
    languageZhHans: "簡體中文",
    languageEn: "English",
    groupAutomation: "Automation",
    autoApproveTitle: "自動核准信任項目",
    autoApproveDesc: "只會自動允許已列入下方清單的工具、伺服器或 Connector。",
    autoApproveDescShort: "僅允許 allowlist 中的項目。",
    groupTools: "API Tools",
    toolsTitle: "信任的 API 工具",
    toolsDesc: "例如 apply_patch、exec_command、git_status。",
    toolPlaceholder: "輸入工具名稱，例如：git_status",
    groupServers: "MCP Servers",
    serversTitle: "信任的 MCP 伺服器",
    serversDesc: "針對整個 MCP server 名稱做 allowlist。",
    serverPlaceholder: "輸入伺服器名稱，例如：MCP Neverending Coding",
    groupConnectors: "Connectors",
    connectorsTitle: "信任的 ChatGPT Connector",
    connectorsDesc: "GitHub 授權彈窗會受這裡控制，未來也能放 Google Drive、Notion 等項目。",
    connectorPlaceholder: "輸入 Connector 名稱，例如：GitHub",
    add: "新增",
    resetDefaults: "重設預設清單",
    reset: "重設",
    openFullSettings: "完整設定",
    saveNote: "變更會即時儲存到 chrome.storage.local",
    toastSaved: "設定已儲存",
    emptyTools: "目前沒有設定信任的 API 工具。",
    emptyServers: "目前沒有設定信任的 MCP 伺服器。",
    emptyConnectors: "目前沒有設定信任的 Connector。",
    removeLabel: "移除",
    resetConfirm: "您確定要將所有信任清單重設為預設值嗎？"
  },
  "zh-Hans": {
    appTitle: "ChatGPT Approval Helper",
    popupTitle: "Approval Helper",
    subtitle: "用 allowlist 控制 MCP tools、MCP servers 与 connectors 的自动授权。",
    popupSubtitle: "控制 tools、servers 与 connectors 的自动授权。",
    groupLanguage: "Language",
    languageTitle: "界面语言",
    languageDesc: "首次打开会依浏览器语言自动选择，不支持时使用英文。",
    languageZhHant: "繁体中文",
    languageZhHans: "简体中文",
    languageEn: "English",
    groupAutomation: "Automation",
    autoApproveTitle: "自动核准信任项目",
    autoApproveDesc: "只会自动允许已列入下方清单的工具、服务器或 Connector。",
    autoApproveDescShort: "仅允许 allowlist 中的项目。",
    groupTools: "API Tools",
    toolsTitle: "信任的 API 工具",
    toolsDesc: "例如 apply_patch、exec_command、git_status。",
    toolPlaceholder: "输入工具名称，例如：git_status",
    groupServers: "MCP Servers",
    serversTitle: "信任的 MCP 服务器",
    serversDesc: "针对整个 MCP server 名称做 allowlist。",
    serverPlaceholder: "输入服务器名称，例如：MCP Neverending Coding",
    groupConnectors: "Connectors",
    connectorsTitle: "信任的 ChatGPT Connector",
    connectorsDesc: "GitHub 授权弹窗会受这里控制，未来也能放 Google Drive、Notion 等项目。",
    connectorPlaceholder: "输入 Connector 名称，例如：GitHub",
    add: "新增",
    resetDefaults: "重设默认清单",
    reset: "重设",
    openFullSettings: "完整设置",
    saveNote: "变更会实时保存到 chrome.storage.local",
    toastSaved: "设置已保存",
    emptyTools: "目前没有设置信任的 API 工具。",
    emptyServers: "目前没有设置信任的 MCP 服务器。",
    emptyConnectors: "目前没有设置信任的 Connector。",
    removeLabel: "移除",
    resetConfirm: "确定要将所有信任清单重设为默认值吗？"
  },
  en: {
    appTitle: "ChatGPT Approval Helper",
    popupTitle: "Approval Helper",
    subtitle: "Control auto-approval for MCP tools, MCP servers, and connectors with allowlists.",
    popupSubtitle: "Control auto-approval for tools, servers, and connectors.",
    groupLanguage: "Language",
    languageTitle: "Interface Language",
    languageDesc: "The first launch follows your browser language. Unsupported languages fall back to English.",
    languageZhHant: "繁體中文",
    languageZhHans: "简体中文",
    languageEn: "English",
    groupAutomation: "Automation",
    autoApproveTitle: "Auto-approve trusted items",
    autoApproveDesc: "Only tools, servers, or connectors in the allowlists below can be approved automatically.",
    autoApproveDescShort: "Only items in your allowlists can be approved.",
    groupTools: "API Tools",
    toolsTitle: "Trusted API Tools",
    toolsDesc: "Examples: apply_patch, exec_command, git_status.",
    toolPlaceholder: "Enter a tool name, for example: git_status",
    groupServers: "MCP Servers",
    serversTitle: "Trusted MCP Servers",
    serversDesc: "Allowlist complete MCP server names.",
    serverPlaceholder: "Enter a server name, for example: MCP Neverending Coding",
    groupConnectors: "Connectors",
    connectorsTitle: "Trusted ChatGPT Connectors",
    connectorsDesc: "GitHub approval prompts are controlled here. Future connectors such as Google Drive and Notion can be added here too.",
    connectorPlaceholder: "Enter a connector name, for example: GitHub",
    add: "Add",
    resetDefaults: "Reset Defaults",
    reset: "Reset",
    openFullSettings: "Full Settings",
    saveNote: "Changes are saved immediately to chrome.storage.local",
    toastSaved: "Settings saved",
    emptyTools: "No trusted API tools configured.",
    emptyServers: "No trusted MCP servers configured.",
    emptyConnectors: "No trusted connectors configured.",
    removeLabel: "Remove",
    resetConfirm: "Reset all allowlists to their defaults?"
  }
};

const STORAGE_KEYS = [
  "autoApprove",
  "trustedTools",
  "trustedServers",
  "trustedConnectors",
  "language"
];

const autoApproveToggle = document.getElementById("auto-approve-toggle");
const languageSelect = document.getElementById("language-select");

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

function installThemeScrollbars() {
  if (document.getElementById("approval-helper-scrollbar-style")) return;

  const style = document.createElement("style");
  style.id = "approval-helper-scrollbar-style";
  style.textContent = `
    * {
      scrollbar-width: thin;
      scrollbar-color: rgba(122, 162, 247, 0.72) rgba(22, 22, 30, 0.62);
    }

    *::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    *::-webkit-scrollbar-track {
      background: rgba(22, 22, 30, 0.62);
      border-radius: 999px;
      box-shadow: inset 0 0 0 1px rgba(122, 162, 247, 0.08);
    }

    *::-webkit-scrollbar-thumb {
      min-height: 36px;
      border: 2px solid rgba(22, 22, 30, 0.72);
      border-radius: 999px;
      background: linear-gradient(180deg, var(--tn-blue), var(--tn-cyan));
      box-shadow: 0 0 16px rgba(122, 162, 247, 0.18);
    }

    *::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, var(--tn-cyan), var(--tn-blue));
    }

    *::-webkit-scrollbar-corner {
      background: var(--tn-bg-deep);
    }
  `;
  document.head.appendChild(style);
}

function detectBrowserLanguage() {
  const languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];

  for (const rawLanguage of languages) {
    const language = String(rawLanguage || "").toLowerCase();
    if (!language) continue;

    if (language.startsWith("zh")) {
      if (language.includes("hans") || language.includes("cn") || language.includes("sg")) return "zh-Hans";
      if (language.includes("hant") || language.includes("tw") || language.includes("hk") || language.includes("mo")) return "zh-Hant";
      return "zh-Hant";
    }

    if (language.startsWith("en")) return "en";
  }

  return "en";
}

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : detectBrowserLanguage();
}

function t(key) {
  const language = normalizeLanguage(currentSettings.language);
  return I18N[language][key] || I18N.en[key] || key;
}

function getDefaultSettings() {
  return {
    autoApprove: false,
    trustedTools: [...DEFAULT_TRUSTED_TOOLS],
    trustedServers: [...DEFAULT_TRUSTED_SERVERS],
    trustedConnectors: [...DEFAULT_TRUSTED_CONNECTORS],
    language: detectBrowserLanguage()
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
    trustedConnectors: uniqueSortedValues(settings.trustedConnectors !== undefined ? settings.trustedConnectors : DEFAULT_TRUSTED_CONNECTORS),
    language: normalizeLanguage(settings.language)
  };
}

function applyLanguage() {
  const language = normalizeLanguage(currentSettings.language);
  const dictionary = I18N[language] || I18N.en;

  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (dictionary[key]) element.textContent = dictionary[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    const key = element.dataset.i18nPlaceholder;
    if (dictionary[key]) element.placeholder = dictionary[key];
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
    const key = element.dataset.i18nAriaLabel;
    if (dictionary[key]) element.setAttribute("aria-label", dictionary[key]);
  });

  if (languageSelect) languageSelect.value = language;
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
  if (!container) return;
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
    deleteBtn.setAttribute("aria-label", `${t("removeLabel")} ${value}`);
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => removeHandler(value));

    chip.appendChild(label);
    chip.appendChild(deleteBtn);
    container.appendChild(chip);
  });
}

function renderAllChips() {
  renderChips(chipsListTools, currentSettings.trustedTools, removeTool, t("emptyTools"));
  renderChips(chipsListServers, currentSettings.trustedServers, removeServer, t("emptyServers"));
  renderChips(chipsListConnectors, currentSettings.trustedConnectors, removeConnector, t("emptyConnectors"));
}

async function saveSettings({ silent = false } = {}) {
  currentSettings = normalizeSettings(currentSettings);

  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set(currentSettings);
    } else {
      localStorage.setItem("mcp_approval_settings_fallback_v2", JSON.stringify(currentSettings));
    }
    if (!silent) showToast();
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

async function loadSettings() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(STORAGE_KEYS);
      const isFirstLanguageLoad = data.language === undefined;
      currentSettings = normalizeSettings(data);
      if (isFirstLanguageLoad) await saveSettings({ silent: true });
    } else {
      const fallback = localStorage.getItem("mcp_approval_settings_fallback_v2");
      currentSettings = normalizeSettings(fallback ? JSON.parse(fallback) : getDefaultSettings());
    }

    if (autoApproveToggle) autoApproveToggle.checked = currentSettings.autoApprove;
    applyLanguage();
    renderAllChips();
  } catch (error) {
    console.error("Failed to load settings:", error);
    currentSettings = getDefaultSettings();
    applyLanguage();
    renderAllChips();
  }
}

function addValue(input, listName, renderFn) {
  if (!input) return;
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

installThemeScrollbars();
document.addEventListener("DOMContentLoaded", loadSettings);

if (languageSelect) {
  languageSelect.addEventListener("change", event => {
    currentSettings.language = normalizeLanguage(event.target.value);
    applyLanguage();
    renderAllChips();
    saveSettings();
  });
}

if (autoApproveToggle) {
  autoApproveToggle.addEventListener("change", event => {
    currentSettings.autoApprove = event.target.checked;
    saveSettings();
  });
}

if (addToolBtn) addToolBtn.addEventListener("click", addTool);
if (toolInput) {
  toolInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addTool();
  });
}

if (addServerBtn) addServerBtn.addEventListener("click", addServer);
if (serverInput) {
  serverInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addServer();
  });
}

if (addConnectorBtn) addConnectorBtn.addEventListener("click", addConnector);
if (connectorInput) {
  connectorInput.addEventListener("keydown", event => {
    if (event.key === "Enter") addConnector();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (!confirm(t("resetConfirm"))) return;

    currentSettings = getDefaultSettings();
    if (autoApproveToggle) autoApproveToggle.checked = currentSettings.autoApprove;
    applyLanguage();
    renderAllChips();
    saveSettings();
  });
}
