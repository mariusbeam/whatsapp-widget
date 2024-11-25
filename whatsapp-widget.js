// WhatsApp Widget IIFE
(function(window) {
  'use strict';

  const styles = `
    .wa-widget {
      position: fixed;
      z-index: 9999;
      transition: all 0.3s ease;
    }
    .wa-widget.bottom-right {
      right: 20px;
      bottom: 20px;
    }
    .wa-widget.bottom-left {
      left: 20px;
      bottom: 20px;
    }
    .wa-button {
      width: 60px;
      height: 60px;
      background-color: var(--wa-primary-color, #25D366);
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    .wa-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .wa-button:hover svg {
      animation: iconWiggle 0.5s ease-in-out;
    }
    .wa-button svg {
      width: 32px;
      height: 32px;
      stroke: #ffffff;
      stroke-width: 2;
      fill: none;
      transition: transform 0.3s ease;
    }
    @keyframes iconWiggle {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(-7deg); }
      75% { transform: rotate(7deg); }
      100% { transform: rotate(0deg); }
    }
    .wa-popup {
      position: absolute;
      bottom: 80px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.14);
      width: 320px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.3s ease;
    }
    .wa-popup.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .bottom-right .wa-popup {
      right: 0;
    }
    .bottom-left .wa-popup {
      left: 0;
    }
    .wa-header {
      background: var(--wa-primary-color, #25D366);
      color: #fff;
      padding: 20px;
      border-radius: 12px 12px 0 0;
    }
    .wa-content {
      padding: 20px;
    }
    .wa-message {
      margin-bottom: 15px;
      color: #333;
    }
    .wa-agent {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    .wa-agent-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
      object-fit: cover;
    }
    .wa-agent-info {
      flex: 1;
    }
    .wa-company {
      font-weight: bold;
      color: #1a1a1a;
    }
    .wa-status {
      font-size: 14px;
      color: #666;
    }
    .wa-start-chat {
      display: block;
      width: 100%;
      padding: 12px;
      background: var(--wa-primary-color, #25D366);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .wa-start-chat:hover {
      opacity: 0.9;
    }
  `;

  class WhatsAppWidget {
    constructor(config) {
      this.config = {
        phoneNumber: '',
        greeting: 'Hello! 👋',
        position: 'bottom-right',
        companyName: 'Company Name',
        agentName: 'Support Team',
        avatar: '',
        businessHours: {
          sunday: { start: '09:00', end: '17:00' },
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '09:00', end: '17:00' }
        },
        theme: {
          primaryColor: '#25D366'
        },
        ...config
      };
      this.isOpen = false;
      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
    }

    injectStyles() {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
      document.documentElement.style.setProperty('--wa-primary-color', this.config.theme.primaryColor);
    }

    createWidget() {
      const widget = document.createElement('div');
      widget.className = `wa-widget ${this.config.position}`;
      
      widget.innerHTML = `
        <div class="wa-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
        </div>
        <div class="wa-popup">
          <div class="wa-header">
            <h3>${this.config.companyName}</h3>
          </div>
          <div class="wa-content">
            <div class="wa-message">${this.config.greeting}</div>
            <div class="wa-agent">
              ${this.config.avatar ? 
                `<img src="${this.config.avatar}" class="wa-agent-avatar" alt="${this.config.agentName}">` : 
                '<div class="wa-agent-avatar" style="background: #eee"></div>'}
              <div class="wa-agent-info">
                <div class="wa-company">${this.config.agentName}</div>
                <div class="wa-status">${this.isBusinessHours() ? 'Online' : 'Away'}</div>
              </div>
            </div>
            <button class="wa-start-chat">Start Chat</button>
          </div>
        </div>
      `;

      document.body.appendChild(widget);
      this.widget = widget;
      this.popup = widget.querySelector('.wa-popup');
      this.button = widget.querySelector('.wa-button');
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.togglePopup());
      this.widget.querySelector('.wa-start-chat').addEventListener('click', () => this.startChat());
      
      // Close popup when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.widget.contains(e.target) && this.isOpen) {
          this.togglePopup();
        }
      });
    }

    togglePopup() {
      this.isOpen = !this.isOpen;
      this.popup.classList.toggle('active', this.isOpen);
    }

    startChat() {
      const message = encodeURIComponent(this.config.greeting);
      const url = `https://wa.me/${this.config.phoneNumber.replace(/\D/g, '')}?text=${message}`;
      window.open(url, '_blank');
    }

    isBusinessHours() {
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const day = days[now.getDay()];
      const hours = this.config.businessHours[day];
      
      if (!hours) return false;

      const currentTime = now.getHours() * 100 + now.getMinutes();
      const [startHour, startMinute] = hours.start.split(':').map(Number);
      const [endHour, endMinute] = hours.end.split(':').map(Number);
      
      const start = startHour * 100 + startMinute;
      const end = endHour * 100 + endMinute;
      
      return currentTime >= start && currentTime <= end;
    }
  }

  // Expose to window
  window.WhatsAppWidget = {
    init: (config) => new WhatsAppWidget(config)
  };
})(window);