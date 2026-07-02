var ApprovalHelperClicker = (() => {
  const DEFAULT_RETRY_DELAYS = Object.freeze([100, 400, 800, 1500, 2500, 4000, 6000, 9000, 12000, 16000, 20000, 25000, 30000]);

  function clickWithRetry({
    dialog,
    findButton,
    isEnabled,
    click,
    delays = DEFAULT_RETRY_DELAYS,
    verifyDelay = 180,
    isDone,
    onClick,
    onSuccess,
    onExhausted
  }) {
    let completed = false;
    let clicked = false;

    function dialogGone() {
      return !dialog || !document.documentElement.contains(dialog);
    }

    function done() {
      if (dialogGone()) return true;
      try {
        return isDone?.() === true;
      } catch (error) {
        console.error("[Approval Helper] Failed to verify click result:", error);
        return false;
      }
    }

    function finishSuccess(reason, meta = {}) {
      if (completed) return;
      completed = true;
      onSuccess?.({ reason, clicked, ...meta });
    }

    function finishExhausted(reason, meta = {}) {
      if (completed) return;
      completed = true;
      onExhausted?.(reason, { clicked, ...meta });
    }

    delays.forEach((delay, index) => {
      setTimeout(() => {
        if (completed) return;

        if (done()) {
          if (clicked) finishSuccess("dialog_resolved", { index, delay });
          else finishExhausted("dialog_removed_before_click", { index, delay });
          return;
        }

        const button = findButton(dialog);
        if (button && isEnabled(button)) {
          clicked = true;
          onClick?.(button, { index, delay });
          click(button);

          setTimeout(() => {
            if (completed) return;
            if (done()) finishSuccess("dialog_resolved_after_click", { index, delay });
            else if (index === delays.length - 1) finishExhausted("button_click_did_not_resolve_dialog", { index, delay });
          }, verifyDelay);
          return;
        }

        if (index === delays.length - 1) {
          finishExhausted("button_unavailable", { index, delay });
        }
      }, delay);
    });
  }

  return {
    DEFAULT_RETRY_DELAYS,
    clickWithRetry
  };
})();
