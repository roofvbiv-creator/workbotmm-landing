// Error Modal - Universal Modal for displaying errors
// Usage: Call showErrorModal(title, message) from any page

const ErrorModal = {
  // Initialize modal
  init() {
    const modal = document.getElementById('error-modal');
    if (!modal) {
      this.createModal();
    }
    this.attachEventListeners();
  },

  // Create modal HTML structure
  createModal() {
    const modalHTML = `
      <div id="error-modal" class="error-modal">
        <div class="error-modal-content">
          <div class="error-modal-icon">⚠️</div>
          <div class="error-modal-title">Произошла ошибка</div>
          <div class="error-modal-message"></div>
          <div class="error-modal-buttons">
            <button class="error-modal-btn error-modal-btn-close" onclick="ErrorModal.close()">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Attach event listeners
  attachEventListeners() {
    const modal = document.getElementById('error-modal');
    if (!modal) return;

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        this.close();
      }
    });
  },

  // Show modal with custom message
  show(title = 'Произошла ошибка', message = '') {
    const modal = document.getElementById('error-modal');
    if (!modal) {
      this.init();
    }

    const titleEl = modal.querySelector('.error-modal-title');
    const messageEl = modal.querySelector('.error-modal-message');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  // Close modal
  close() {
    const modal = document.getElementById('error-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  // Polling function to check for errors from backend
  startPolling(linkId, pageType = 'orders', intervalMs = 3000) {
    if (!linkId) {
      console.warn('ErrorModal.startPolling: linkId is required');
      return;
    }

    // Initial setup
    this.init();
    this.pollingInterval = setInterval(() => {
      this.checkForError(linkId, pageType);
    }, intervalMs);

    console.log(`✅ Error polling started for link_id=${linkId}, page_type=${pageType}`);
  },

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('❌ Error polling stopped');
    }
  },

  // Check for error from backend
  async checkForError(linkId, pageType = 'orders') {
    try {
      const response = await fetch(`/error/${linkId}?page_type=${pageType}`);
      if (!response.ok) return;

      const data = await response.json();
      if (data && data.error_text) {
        // Error found - show it
        this.show('❌ Произошла ошибка', data.error_text);

        // Mark as read (optional - delete after showing)
        await fetch(`/error/${linkId}/read?page_type=${pageType}`, { method: 'POST' });

        // Stop polling after showing error once
        this.stopPolling();
      }
    } catch (error) {
      console.log('Error checking for errors:', error);
      // Silent fail - polling continues
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ErrorModal.init();
  });
} else {
  ErrorModal.init();
}
