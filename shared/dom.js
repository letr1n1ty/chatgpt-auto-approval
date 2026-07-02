var ApprovalHelperDom = (() => {
  function getVisibleText(el) {
    return (el?.innerText || el?.textContent || "").trim();
  }

  function getAccessibleText(el) {
    return [
      getVisibleText(el),
      el?.getAttribute?.("aria-label") || "",
      el?.getAttribute?.("title") || "",
      el?.getAttribute?.("value") || "",
      el?.getAttribute?.("alt") || "",
      el?.getAttribute?.("data-testid") || ""
    ].join(" ").trim();
  }

  function normalizeText(text) {
    return String(text || "")
      .replace(/[\u200b-\u200d\ufeff]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function compactText(text) {
    return normalizeText(text).replace(/\s+/g, "");
  }

  function isElementVisible(el) {
    if (!el || !(el instanceof Element)) return false;

    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;

    const rects = Array.from(el.getClientRects());
    if (rects.some(rect => rect.width > 0 && rect.height > 0)) return true;

    return Array.from(el.children || []).some(child => {
      const childRect = child.getBoundingClientRect?.();
      return childRect && childRect.width > 0 && childRect.height > 0;
    });
  }

  function isButtonEnabled(button) {
    if (!button) return false;
    if (button.disabled) return false;
    if (button.getAttribute("disabled") !== null) return false;
    if (button.getAttribute("aria-disabled") === "true") return false;
    if (button.getAttribute("data-disabled") === "true") return false;

    const style = window.getComputedStyle(button);
    if (style.pointerEvents === "none") return false;

    const classList = Array.from(button.classList || []).map(className => className.toLowerCase());
    return !classList.some(className =>
      className.includes("disabled") ||
      className.includes("loading") ||
      className.includes("pending") ||
      className.includes("wait")
    );
  }

  function uniqueElements(elements) {
    return Array.from(new Set(elements.filter(Boolean)));
  }

  function queryAllDeep(selector, root = document) {
    const results = [];
    const visited = new WeakSet();

    function visit(node) {
      if (!node || visited.has(node)) return;
      visited.add(node);

      if (node.querySelectorAll) {
        results.push(...node.querySelectorAll(selector));
        node.querySelectorAll("*").forEach(child => {
          if (child.shadowRoot) visit(child.shadowRoot);
        });
      }

      if (node.shadowRoot) visit(node.shadowRoot);
    }

    visit(root);
    return uniqueElements(results);
  }

  function getComposedParent(el) {
    if (!el) return null;
    if (el.parentElement) return el.parentElement;
    if (el.parentNode instanceof ShadowRoot) return el.parentNode.host;
    if (el.assignedSlot) return el.assignedSlot;
    return null;
  }

  function getComposedParents(el, maxDepth = 10) {
    const parents = [];
    let current = getComposedParent(el);
    let depth = 0;

    while (current && depth < maxDepth) {
      parents.push(current);
      current = getComposedParent(current);
      depth += 1;
    }

    return parents;
  }

  function scrollElementIntoView(el) {
    try {
      el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    } catch (_) {
      try {
        el.scrollIntoView({ block: "center", inline: "center" });
      } catch (_) {
        // Ignore scrolling failures caused by detached or non-standard elements.
      }
    }
  }

  function simulateRealClick(element) {
    if (!element) return false;

    scrollElementIntoView(element);

    try {
      element.focus?.({ preventScroll: true });
    } catch (_) {
      try { element.focus?.(); } catch (_) {}
    }

    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;
    const pointerInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX,
      clientY,
      screenX: window.screenX + clientX,
      screenY: window.screenY + clientY,
      button: 0,
      buttons: 1,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true
    };
    const mouseInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX,
      clientY,
      screenX: window.screenX + clientX,
      screenY: window.screenY + clientY,
      button: 0,
      buttons: 1
    };

    const PointerCtor = typeof PointerEvent !== "undefined" ? PointerEvent : MouseEvent;

    ["pointerover", "pointerenter", "pointermove", "pointerdown"].forEach(eventName => {
      try { element.dispatchEvent(new PointerCtor(eventName, pointerInit)); } catch (_) {}
    });
    ["mouseover", "mouseenter", "mousemove", "mousedown"].forEach(eventName => {
      try { element.dispatchEvent(new MouseEvent(eventName, mouseInit)); } catch (_) {}
    });
    ["pointerup", "mouseup", "click"].forEach(eventName => {
      try {
        const EventCtor = eventName.startsWith("pointer") ? PointerCtor : MouseEvent;
        element.dispatchEvent(new EventCtor(eventName, eventName.startsWith("pointer") ? pointerInit : mouseInit));
      } catch (_) {}
    });

    try {
      element.click();
      return true;
    } catch (error) {
      console.error("[Approval Helper] Failed to click element:", error);
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    getVisibleText,
    getAccessibleText,
    normalizeText,
    compactText,
    isElementVisible,
    isButtonEnabled,
    queryAllDeep,
    getComposedParent,
    getComposedParents,
    simulateRealClick,
    escapeHTML
  };
})();
