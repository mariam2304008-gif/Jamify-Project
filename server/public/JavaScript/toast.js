// ─── Global Toast Notification System ────────────────────────────────────────
// Uses the same beautiful slide-in animation from album.js
(function () {
  // Inject toast container and styles once
  const containerHTML = `
    <div id="toast-notification">
      <span id="toast-message"></span>
    </div>
    <style>
      #toast-notification {
        position: fixed;
        bottom: 20px;
        left: -350px;
        width: 300px;
        padding: 16px;
        background-color: #e74c3c;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 9999;
        font-weight: bold;
        font-size: 14px;
      }

      #toast-notification.show {
        left: 20px;
      }

      #toast-notification.success {
        background-color: #4caf50;
      }

      #toast-notification.error {
        background-color: #f44336;
      }

      #toast-notification.warning {
        background-color: #ff9800;
      }

      #toast-notification.info {
        background-color: #2196f3;
      }
    </style>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', containerHTML);
  });

  window.showToast = function (message, type = 'error', duration = 3000) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');

    if (!toast || !toastMsg) {
      console.warn('Toast notification elements not found');
      return;
    }

    toastMsg.textContent = message;
    toast.className = `${type}`;
    toast.classList.add('show');

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }
  };
})();

window.showConfirm = function(message, onConfirm) {
    const existing = document.getElementById('confirm-modal');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'confirm-modal';
    el.innerHTML = `
        <div id="confirm-backdrop"></div>
        <div id="confirm-box">
            <p id="confirm-message"></p>
            <div id="confirm-actions">
                <button id="confirm-cancel">Cancel</button>
                <button id="confirm-ok">Confirm</button>
            </div>
        </div>
        <style>
            #confirm-backdrop {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
            }
            #confirm-box {
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: white; border-radius: 12px;
                padding: 24px; width: 300px;
                z-index: 10001;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                font-family: inherit;
            }
            #confirm-message {
                margin: 0 0 20px;
                font-size: 15px;
                color: #333;
            }
            #confirm-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            #confirm-cancel {
                padding: 8px 16px; border-radius: 8px;
                border: 1px solid #ddd; background: white;
                cursor: pointer; font-family: inherit;
            }
            #confirm-ok {
                padding: 8px 16px; border-radius: 8px;
                border: none; background: #e74c3c;
                color: white; cursor: pointer;
                font-family: inherit; font-weight: 600;
            }
        </style>
    `;
    document.body.appendChild(el);
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-cancel').onclick = () => el.remove();
    document.getElementById('confirm-ok').onclick = () => { el.remove(); onConfirm(); };
};
