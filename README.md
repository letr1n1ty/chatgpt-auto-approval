# ChatGPT Approval Helper

ChatGPT Approval Helper is a Manifest V3 browser extension for managing trusted approval dialogs inside the ChatGPT web app.

It detects supported approval prompts, compares them against local allowlists, and can automatically approve trusted requests when auto-approval is enabled.

## Features

- Detects ChatGPT approval dialogs for MCP tools and MCP servers
- Detects ChatGPT GitHub connector authorization prompts
- Auto-approves only trusted items from user-managed allowlists
- Provides a full options page for policy management
- Provides a popup for quick configuration
- Stores settings locally with `chrome.storage.local`
- Uses a Tokyo Night-inspired iOS settings interface
- Requires no backend service and no build step

## Supported Approval Types

| Type | Examples | Policy Key |
| --- | --- | --- |
| API Tools | `apply_patch`, `exec_command`, `git_status` | `trustedTools` |
| MCP Servers | `MCP Neverending Coding` | `trustedServers` |
| Connectors | `GitHub` | `trustedConnectors` |

Auto-approval only happens when:

1. `autoApprove` is enabled.
2. The detected approval target matches the relevant allowlist.
3. The approve button is visible and enabled.

## Security Model

The extension is allowlist-based. It should not approve unknown tools, unknown MCP servers, or unknown connectors.

The extension does not send approval data to an external server. Settings and local approval logs remain in the browser.

Because the extension interacts with permission dialogs, broad matching rules should be avoided. Connector and tool detection should stay explicit, conservative, and scoped to supported prompt types.

## Installation

### Load as an unpacked extension

1. Clone or download this repository.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the repository directory.
6. Open ChatGPT and configure the extension from the popup or options page.

## Configuration

The extension exposes two configuration surfaces:

- Popup: quick access to auto-approval and allowlist editing
- Options page: full settings management

The stored settings use the following shape:

```js
{
  autoApprove: false,
  trustedTools: [
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
  ],
  trustedServers: [
    "MCP Neverending Coding"
  ],
  trustedConnectors: [
    "GitHub"
  ]
}
```

## File Overview

```text
manifest.json       Extension manifest
content.js          MCP and API tool approval handling
github-approval.js  GitHub connector approval handling
options.html        Full settings page
options.js          Settings storage and allowlist management
popup.html          Popup quick settings UI
icons/              Extension icons
AGENTS.md           Maintenance guide for coding agents
```

## Development

This project is plain HTML, CSS, and JavaScript. There is no package manager requirement and no build pipeline.

After changing files, reload the unpacked extension from the browser extensions page.

Recommended manual test cases:

- Toggle auto-approval from the popup.
- Add and remove API tools from the popup and options page.
- Add and remove MCP servers from the popup and options page.
- Add and remove connectors from the popup and options page.
- Confirm that settings persist after reopening the popup.
- Confirm that GitHub connector auto-approval stops when `GitHub` is removed from `trustedConnectors`.
- Confirm that no prompt is automatically approved when `autoApprove` is disabled.

## Browser Compatibility

The extension targets Chromium-based browsers that support Manifest V3, including Chrome and Microsoft Edge.

## Reliability Notes

ChatGPT UI changes can affect dialog detection. The extension therefore avoids generated CSS class selectors where possible and relies on visible text, accessible labels, semantic dialog hints, conservative DOM traversal, and approval-button proximity.

Version `0.2.1` hardens approval handling against common ChatGPT web UI changes:

- Scans dialog, modal, popover, Radix dialog, and nearby button-parent containers instead of relying only on `role="dialog"` or `aria-modal="true"`.
- Traverses open shadow roots and composed parents so approval controls remain detectable if ChatGPT changes the component boundary.
- Recognizes broader approval wording, including `Allow`, `Approve`, `Authorize`, `Connect`, `Continue`, `Run`, and Traditional/Simplified Chinese equivalents.
- Retries approval clicks until the dialog actually resolves instead of treating the first click attempt as success.
- Sends pointer and mouse events, focuses the target, and scrolls it into view before calling the native click method.
- Uses a MutationObserver plus a low-frequency interval scan to catch SPA state changes that do not always create new DOM nodes.

New approval surfaces should be added with explicit matching logic and a matching allowlist policy.

## License

No license file is currently included. Add a license before distributing or publishing the project publicly.
