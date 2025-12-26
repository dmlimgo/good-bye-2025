// Rolling Paper module

const RollingPaper = {
    messages: [],
    selectedColor: '#FFE4B5',

    // Initialize
    async init() {
        await this.loadMessages();
        this.setupEventListeners();
    },

    // Load messages from localStorage or JSON file
    async loadMessages() {
        // Try localStorage first
        const stored = localStorage.getItem('rollingPaperMessages');
        if (stored) {
            try {
                this.messages = JSON.parse(stored);
                return;
            } catch (e) {
                console.error('Failed to parse stored messages:', e);
            }
        }

        // Fall back to JSON file
        try {
            const response = await fetch('data/messages.json');
            const data = await response.json();
            this.messages = data.messages || [];
            this.saveMessages();
        } catch (error) {
            console.error('Failed to load messages:', error);
            this.messages = [];
        }
    },

    // Save messages to localStorage
    saveMessages() {
        try {
            localStorage.setItem('rollingPaperMessages', JSON.stringify(this.messages));
        } catch (e) {
            console.error('Failed to save messages:', e);
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Main popup buttons
        document.getElementById('write-paper-btn').addEventListener('click', () => {
            this.hidePopup('rolling-paper-popup');
            this.showWritePopup();
        });

        document.getElementById('view-paper-btn').addEventListener('click', () => {
            this.hidePopup('rolling-paper-popup');
            this.showViewPopup();
        });

        // Submit button
        document.getElementById('submit-paper-btn').addEventListener('click', () => {
            this.submitMessage();
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedColor = e.target.dataset.color;
                document.getElementById('new-sticky-note').style.background = this.selectedColor;
            });
        });

        // Set default color selection
        document.querySelector('.color-option').classList.add('selected');

        // Close buttons
        document.querySelectorAll('.popup .close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const popup = e.target.closest('.popup');
                this.hidePopup(popup.id);
            });
        });

        // Overlay clicks
        document.querySelectorAll('.popup-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const popup = e.target.closest('.popup');
                this.hidePopup(popup.id);
            });
        });
    },

    // Show main rolling paper popup
    showMainPopup() {
        this.showPopup('rolling-paper-popup');
    },

    // Show write popup
    showWritePopup() {
        // Reset form
        document.getElementById('author-input').value = '';
        document.getElementById('message-input').value = '';
        document.getElementById('new-sticky-note').style.background = this.selectedColor;

        this.showPopup('write-paper-popup');
    },

    // Show view popup
    showViewPopup() {
        this.renderPapers();
        this.showPopup('view-papers-popup');
    },

    // Submit new message
    submitMessage() {
        const authorInput = document.getElementById('author-input');
        const messageInput = document.getElementById('message-input');

        const content = messageInput.value.trim();
        if (!content) {
            messageInput.focus();
            messageInput.style.outline = '2px solid #ff6b6b';
            setTimeout(() => {
                messageInput.style.outline = 'none';
            }, 1000);
            return;
        }

        const newMessage = {
            id: Utils.generateId(),
            author: authorInput.value.trim() || '익명',
            content: content,
            color: this.selectedColor,
            timestamp: new Date().toISOString()
        };

        this.messages.push(newMessage);
        this.saveMessages();

        // Show success feedback
        this.showToast('메시지가 저장되었습니다!');

        // Close popup and show view
        this.hidePopup('write-paper-popup');
        setTimeout(() => {
            this.showViewPopup();
        }, 300);
    },

    // Render papers in view popup
    renderPapers() {
        const container = document.getElementById('papers-container');
        container.innerHTML = '';

        if (this.messages.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; width: 100%; padding: 40px;">아직 작성된 메시지가 없습니다.</p>';
            return;
        }

        // Sort by newest first
        const sortedMessages = [...this.messages].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedMessages.forEach((msg, index) => {
            const rotation = Utils.random(-5, 5);
            const note = document.createElement('div');
            note.className = 'paper-note';
            note.style.background = msg.color || '#FFE4B5';
            note.style.setProperty('--rotation', `${rotation}deg`);

            note.innerHTML = `
                <div class="author">${this.escapeHtml(msg.author)}</div>
                <div class="content">${this.escapeHtml(msg.content)}</div>
            `;

            container.appendChild(note);
        });
    },

    // Show toast notification
    showToast(message) {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'Jua', sans-serif;
            z-index: 1000;
            animation: fadeInUp 0.3s ease;
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.textContent = `
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    // Show popup
    showPopup(id) {
        const popup = document.getElementById(id);
        popup.classList.remove('hidden');
    },

    // Hide popup
    hidePopup(id) {
        const popup = document.getElementById(id);
        popup.classList.add('hidden');
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
