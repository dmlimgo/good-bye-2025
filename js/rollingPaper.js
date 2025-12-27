// Rolling Paper system - handles message display with drag scroll

const RollingPaper = {
    messages: [],
    storageKey: 'gentlecrew_messages',
    isDragging: false,
    startX: 0,
    scrollLeft: 0,

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

        // Render messages
        this.renderMessages();

        // Setup drag scroll
        this.setupDragScroll();
    },

    renderMessages() {
        const container = document.getElementById('scroll-messages');
        const paper = document.getElementById('scroll-paper');
        if (!container) return;

        container.innerHTML = '';

        if (this.messages.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'scroll-empty';
            emptyEl.textContent = '아직 작성된 메시지가 없습니다. 첫 번째 메시지를 남겨보세요!';
            container.appendChild(emptyEl);
            return;
        }

        this.messages.forEach((message, index) => {
            const messageEl = this.createMessageElement(message, index);
            container.appendChild(messageEl);
        });

        // 렌더링 후 너비 동적 계산
        requestAnimationFrame(() => {
            this.adjustPaperWidth();
        });
    },

    adjustPaperWidth() {
        const container = document.getElementById('scroll-messages');
        const paper = document.getElementById('scroll-paper');
        if (!container || !paper) return;

        // 메시지들의 실제 배치 후 필요한 너비 계산
        const messages = container.querySelectorAll('.scroll-message');
        if (messages.length === 0) return;

        let maxRight = 0;
        messages.forEach(msg => {
            const rect = msg.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const right = rect.right - containerRect.left;
            if (right > maxRight) maxRight = right;
        });

        // 여유 공간 추가 (회전된 메시지 고려 + 패딩)
        const extraSpace = 1000;
        const totalWidth = maxRight + extraSpace;

        paper.style.width = totalWidth + 'px';
        container.style.width = (totalWidth - 120) + 'px';
    },

    createMessageElement(message, index) {
        const el = document.createElement('div');
        el.className = 'scroll-message';

        // Random rotation between -30 and 30 degrees
        const rotation = Utils.random(-30, 30);
        el.style.transform = `rotate(${rotation}deg)`;

        // Content
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;

        // Author
        const author = document.createElement('div');
        author.className = 'message-author';
        author.textContent = `- ${message.author}`;

        el.appendChild(content);
        el.appendChild(author);

        return el;
    },

    setupDragScroll() {
        const wrapper = document.getElementById('scroll-paper-wrapper');
        if (!wrapper) return;

        // Mouse events
        wrapper.addEventListener('mousedown', (e) => this.handleDragStart(e));
        wrapper.addEventListener('mousemove', (e) => this.handleDragMove(e));
        wrapper.addEventListener('mouseup', () => this.handleDragEnd());
        wrapper.addEventListener('mouseleave', () => this.handleDragEnd());

        // Touch events
        wrapper.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: true });
        wrapper.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: true });
        wrapper.addEventListener('touchend', () => this.handleDragEnd());
    },

    handleDragStart(e) {
        const wrapper = document.getElementById('scroll-paper-wrapper');
        if (!wrapper) return;

        this.isDragging = true;
        wrapper.style.cursor = 'grabbing';

        if (e.type === 'touchstart') {
            this.startX = e.touches[0].pageX - wrapper.offsetLeft;
        } else {
            this.startX = e.pageX - wrapper.offsetLeft;
        }
        this.scrollLeft = wrapper.scrollLeft;
    },

    handleDragMove(e) {
        if (!this.isDragging) return;

        const wrapper = document.getElementById('scroll-paper-wrapper');
        if (!wrapper) return;

        let x;
        if (e.type === 'touchmove') {
            x = e.touches[0].pageX - wrapper.offsetLeft;
        } else {
            e.preventDefault();
            x = e.pageX - wrapper.offsetLeft;
        }

        const walk = (x - this.startX) * 1.5;
        wrapper.scrollLeft = this.scrollLeft - walk;
    },

    handleDragEnd() {
        const wrapper = document.getElementById('scroll-paper-wrapper');
        if (wrapper) {
            wrapper.style.cursor = 'grab';
        }
        this.isDragging = false;
    },

    // Add a new message
    addMessage(author, content) {
        const newMessage = {
            id: Utils.generateId(),
            author: author || '익명',
            content: content,
            timestamp: new Date().toISOString()
        };

        this.messages.push(newMessage);

        // Save to localStorage
        const localMessages = Utils.loadLocal(this.storageKey) || [];
        localMessages.push(newMessage);
        Utils.saveLocal(this.storageKey, localMessages);

        // Re-render
        this.renderMessages();

        return newMessage;
    }
};

// Make RollingPaper available globally
window.RollingPaper = RollingPaper;
