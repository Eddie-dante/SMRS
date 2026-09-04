// ============================================
// SRMS - Dialog System
// Full Version
// ============================================

var DialogSystem = {
  _overlay: null,
  _resolve: null,
  _escHandler: null,

  confirm: function (message, options) {
    options = options || {};
    var title = options.title || "Confirm";
    var confirmText = options.confirmText || "Confirm";
    var cancelText = options.cancelText || "Cancel";
    var type = options.type || "warning";

    return new Promise(function (resolve) {
      var overlay = document.createElement("div");
      overlay.className = "dialog-overlay";
      overlay.id = "dialogOverlay";

      var icons = {
        warning: "fa-exclamation-triangle",
        danger: "fa-trash",
        info: "fa-info-circle",
        success: "fa-check-circle",
      };
      var colors = {
        warning: "#ffc107",
        danger: "#e94560",
        info: "#17a2b8",
        success: "#28a745",
      };

      overlay.innerHTML = `
        <div class="dialog-box">
          <div class="dialog-icon" style="background: ${colors[type]}20; color: ${colors[type]}; border: 2px solid ${colors[type]};">
            <i class="fas ${icons[type]}"></i>
          </div>
          <h3 class="dialog-title">${title}</h3>
          <p class="dialog-message">${message}</p>
          <div class="dialog-buttons">
            <button class="dialog-btn dialog-cancel" onclick="DialogSystem.close('cancel')">
              <i class="fas fa-times"></i> ${cancelText}
            </button>
            <button class="dialog-btn dialog-confirm" style="background: ${colors[type]};" onclick="DialogSystem.close('confirm')">
              <i class="fas fa-check"></i> ${confirmText}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      if (!document.getElementById("dialogStyles")) {
        var styleEl = document.createElement("style");
        styleEl.id = "dialogStyles";
        styleEl.textContent = DialogSystem.getStyles();
        document.head.appendChild(styleEl);
      }

      requestAnimationFrame(function () {
        overlay.classList.add("active");
        overlay.querySelector(".dialog-box").classList.add("active");
      });

      DialogSystem._resolve = resolve;
      DialogSystem._overlay = overlay;

      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          DialogSystem.close("cancel");
        }
      });

      DialogSystem._escHandler = function (e) {
        if (e.key === "Escape") {
          DialogSystem.close("cancel");
        }
      };
      document.addEventListener("keydown", DialogSystem._escHandler);
    });
  },

  alert: function (message, options) {
    options = options || {};
    var title = options.title || "Notice";
    var confirmText = options.confirmText || "OK";
    var type = options.type || "info";

    return new Promise(function (resolve) {
      var overlay = document.createElement("div");
      overlay.className = "dialog-overlay";
      overlay.id = "dialogOverlay";

      var icons = {
        warning: "fa-exclamation-triangle",
        danger: "fa-exclamation-circle",
        info: "fa-info-circle",
        success: "fa-check-circle",
      };
      var colors = {
        warning: "#ffc107",
        danger: "#e94560",
        info: "#17a2b8",
        success: "#28a745",
      };

      overlay.innerHTML = `
        <div class="dialog-box">
          <div class="dialog-icon" style="background: ${colors[type]}20; color: ${colors[type]}; border: 2px solid ${colors[type]};">
            <i class="fas ${icons[type]}"></i>
          </div>
          <h3 class="dialog-title">${title}</h3>
          <p class="dialog-message">${message}</p>
          <div class="dialog-buttons">
            <button class="dialog-btn dialog-confirm" style="background: ${colors[type]}; width: 100%;" onclick="DialogSystem.close('confirm')">
              <i class="fas fa-check"></i> ${confirmText}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      if (!document.getElementById("dialogStyles")) {
        var styleEl = document.createElement("style");
        styleEl.id = "dialogStyles";
        styleEl.textContent = DialogSystem.getStyles();
        document.head.appendChild(styleEl);
      }

      requestAnimationFrame(function () {
        overlay.classList.add("active");
        overlay.querySelector(".dialog-box").classList.add("active");
      });

      DialogSystem._resolve = resolve;
      DialogSystem._overlay = overlay;

      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          DialogSystem.close("confirm");
        }
      });

      DialogSystem._escHandler = function (e) {
        if (e.key === "Escape" || e.key === "Enter") {
          DialogSystem.close("confirm");
        }
      };
      document.addEventListener("keydown", DialogSystem._escHandler);
    });
  },

  close: function (result) {
    if (DialogSystem._overlay) {
      var overlay = DialogSystem._overlay;
      var box = overlay.querySelector(".dialog-box");
      box.classList.remove("active");
      overlay.classList.remove("active");
      setTimeout(function () {
        overlay.remove();
      }, 200);

      if (DialogSystem._escHandler) {
        document.removeEventListener("keydown", DialogSystem._escHandler);
        DialogSystem._escHandler = null;
      }

      if (DialogSystem._resolve) {
        DialogSystem._resolve(result);
        DialogSystem._resolve = null;
      }
      DialogSystem._overlay = null;
    }
  },

  getStyles: function () {
    return `
      .dialog-overlay {
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 3000;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.2s ease;
        padding: 20px;
      }
      .dialog-overlay.active { opacity: 1; }
      .dialog-box {
        background: linear-gradient(135deg, #1a1f4e, #0a0e27);
        border: 2px solid rgba(212, 175, 55, 0.4);
        border-radius: 20px;
        padding: 30px;
        width: 90%; max-width: 420px;
        text-align: center;
        transform: scale(0.8) translateY(20px);
        transition: transform 0.2s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        position: relative;
        overflow: hidden;
      }
      .dialog-box::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 4px;
        background: linear-gradient(90deg, #e94560, #d4af37, #28a745);
      }
      .dialog-box.active { transform: scale(1) translateY(0); }
      .dialog-icon {
        width: 60px; height: 60px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 24px;
        margin: 0 auto 15px;
        animation: dialogPulse 1.5s infinite;
      }
      @keyframes dialogPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .dialog-title { color: #ffffff; font-size: 1.3em; font-weight: 800; margin-bottom: 10px; }
      .dialog-message { color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 20px; line-height: 1.5; }
      .dialog-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
      .dialog-btn {
        padding: 10px 20px; border: none; border-radius: 10px;
        font-size: 13px; font-weight: 600; cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
        display: flex; align-items: center; gap: 6px;
        color: #ffffff;
      }
      .dialog-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); }
      .dialog-cancel { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
      .dialog-cancel:hover { background: rgba(255, 255, 255, 0.2); }
      .dialog-confirm { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
      @media (max-width: 480px) {
        .dialog-box { padding: 20px; }
        .dialog-btn { padding: 8px 15px; font-size: 12px; }
      }
    `;
  },
};

window.DialogSystem = DialogSystem;
