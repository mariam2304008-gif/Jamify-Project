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
