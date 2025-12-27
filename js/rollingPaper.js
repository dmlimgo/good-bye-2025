// Rolling Paper system - handles message writing and viewing

const RollingPaper = {
    messages: [],
    selectedColor: '#FFE4B5',
    storageKey: 'gentlecrew_messages',

    async init() {
        // Load messages from JSON file
        const data = await Utils.loadJSON('data/messages.json');
        if (data) {
            this.messages = data.messages || [];
        }

        // Load additional messages from localStorage
        const localMessages = Utils.loadLocal(this.storageKey);
        if (localMessages && Array.isArray(localMessages)) {
            this.messages = [...this.messages, ...localMessages];
        }

        // Sort messages by timestamp
        this.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Rolling paper trigger (main display)
        const trigger = document.getElementById('rolling-paper-trigger');
        if (trigger) {
            trigger.addEventListener('click', () => this.showMenu());
        }

        // Menu buttons
        const writePaperBtn = document.getElementById('write-paper-btn');
        const viewPaperBtn = document.getElementById('view-paper-btn');
        const closeRollingMenu = document.getElementById('close-rolling-menu');

        if (writePaperBtn) {
            writePaperBtn.addEventListener('click', () => {
                this.hideMenu();
                this.showWriteModal();
            });
        }

        if (viewPaperBtn) {
            viewPaperBtn.addEventListener('click', () => {
                this.hideMenu();
                this.showViewModal();
            });
        }

        if (closeRollingMenu) {
            closeRollingMenu.addEventListener('click', () => this.hideMenu());
        }

        // Menu overlay click
        const menuModal = document.getElementById('rolling-paper-modal');
        if (menuModal) {
            const overlay = menuModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.hideMenu());
            }
        }

        // Write modal
        const saveMessageBtn = document.getElementById('save-message-btn');
        const closeWriteModal = document.getElementById('close-write-modal');
        const colorOptions = document.querySelectorAll('.color-option');

        if (saveMessageBtn) {
            saveMessageBtn.addEventListener('click', () => this.saveMessage());
        }

        if (closeWriteModal) {
            closeWriteModal.addEventListener('click', () => this.hideWriteModal());
        }

        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedColor = e.target.dataset.color;
                this.updateStickyNoteColor();
            });
        });

        // Set default color
        if (colorOptions.length > 0) {
            colorOptions[0].classList.add('selected');
        }

        // Write modal overlay
        const writeModal = document.getElementById('write-paper-modal');
        if (writeModal) {
            const overlay = writeModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.hideWriteModal());
            }
        }

        // View modal
        const closeViewPapers = document.getElementById('close-view-papers');
        if (closeViewPapers) {
            closeViewPapers.addEventListener('click', () => this.hideViewModal());
        }

        const viewModal = document.getElementById('view-papers-modal');
        if (viewModal) {
            const overlay = viewModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.hideViewModal());
            }
        }
    },

    updateStickyNoteColor() {
        const stickyNote = document.getElementById('write-sticky-note');
        if (stickyNote) {
            stickyNote.style.backgroundColor = this.selectedColor;
        }
    },

    showMenu() {
        const modal = document.getElementById('rolling-paper-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideMenu() {
        const modal = document.getElementById('rolling-paper-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showWriteModal() {
        const modal = document.getElementById('write-paper-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Reset form
            const authorInput = document.getElementById('author-input');
            const messageInput = document.getElementById('message-input');
            if (authorInput) authorInput.value = '';
            if (messageInput) messageInput.value = '';

            // Reset color
            this.selectedColor = '#FFE4B5';
            this.updateStickyNoteColor();
            document.querySelectorAll('.color-option').forEach((o, i) => {
                o.classList.toggle('selected', i === 0);
            });

            // Focus on message input
            if (messageInput) {
                setTimeout(() => messageInput.focus(), 100);
            }
        }
    },

    hideWriteModal() {
        const modal = document.getElementById('write-paper-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    saveMessage() {
        const authorInput = document.getElementById('author-input');
        const messageInput = document.getElementById('message-input');

        const author = authorInput?.value.trim() || '익명';
        const content = messageInput?.value.trim();

        if (!content) {
            Utils.showToast('메시지를 입력해주세요');
            return;
        }

        const newMessage = {
            id: Utils.generateId(),
            author: author,
            content: content,
            color: this.selectedColor,
            timestamp: new Date().toISOString()
        };

        // Add to messages array
        this.messages.push(newMessage);

        // Save to localStorage
        const localMessages = Utils.loadLocal(this.storageKey) || [];
        localMessages.push(newMessage);
        Utils.saveLocal(this.storageKey, localMessages);

        Utils.showToast('메시지가 저장되었습니다!');
        this.hideWriteModal();
    },

    showViewModal() {
        const modal = document.getElementById('view-papers-modal');
        const container = document.getElementById('papers-scroll-container');

        if (!modal || !container) return;

        // Clear existing notes
        container.innerHTML = '';

        if (this.messages.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#888';
            emptyMessage.style.padding = '40px';
            emptyMessage.textContent = '아직 작성된 메시지가 없습니다.';
            container.appendChild(emptyMessage);
        } else {
            // Create sticky notes for each message
            this.messages.forEach(message => {
                const note = this.createNoteElement(message);
                container.appendChild(note);
            });
        }

        modal.classList.remove('hidden');
    },

    createNoteElement(message) {
        const note = document.createElement('div');
        note.className = 'paper-note';
        note.style.backgroundColor = message.color || '#FFE4B5';

        const author = document.createElement('div');
        author.className = 'paper-note-author';
        author.textContent = `From: ${message.author}`;

        const content = document.createElement('div');
        content.className = 'paper-note-content';
        content.textContent = message.content;

        note.appendChild(author);
        note.appendChild(content);

        // Random slight rotation for natural look
        const rotation = Utils.random(-3, 3);
        note.style.transform = `rotate(${rotation}deg)`;

        return note;
    },

    hideViewModal() {
        const modal = document.getElementById('view-papers-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
};

// Make RollingPaper available globally
window.RollingPaper = RollingPaper;
