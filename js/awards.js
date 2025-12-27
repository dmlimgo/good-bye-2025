// Awards system - handles award display and interaction

const Awards = {
    awards: [],

    async init() {
        // Load awards data
        const data = await Utils.loadJSON('data/awards.json');
        if (data) {
            this.awards = data.awards || [];
        }

        this.renderAwardsWall();
        this.setupEventListeners();
    },

    renderAwardsWall() {
        const wall = document.getElementById('awards-wall');
        if (!wall) return;

        wall.innerHTML = '';

        // Show first 9 awards on the wall (3x3 grid)
        const displayAwards = this.awards.slice(0, 9);

        displayAwards.forEach(award => {
            const item = document.createElement('div');
            item.className = 'award-item';
            item.dataset.id = award.id;

            const frame = document.createElement('div');
            frame.className = 'award-frame';

            const img = document.createElement('img');
            // Fix image path: .png -> .jpeg
            img.src = award.image.replace('.png', '.jpeg');
            img.alt = award.title;
            img.loading = 'lazy';

            const title = document.createElement('div');
            title.className = 'award-label';
            title.textContent = award.title;

            frame.appendChild(img);
            item.appendChild(frame);
            item.appendChild(title);
            wall.appendChild(item);

            // Click to view detail directly
            item.addEventListener('click', () => this.showDetailModal(award));
        });
    },

    setupEventListeners() {
        // Close grid modal
        const closeGridBtn = document.getElementById('close-awards-grid');
        if (closeGridBtn) {
            closeGridBtn.addEventListener('click', () => this.hideGridModal());
        }

        // Grid modal overlay
        const gridModal = document.getElementById('awards-grid-modal');
        if (gridModal) {
            const overlay = gridModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.hideGridModal());
            }
        }

        // Close detail modal
        const closeDetailBtn = document.getElementById('close-award-detail');
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => this.hideDetailModal());
        }

        // Detail modal overlay
        const detailModal = document.getElementById('award-detail-modal');
        if (detailModal) {
            const overlay = detailModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.hideDetailModal());
            }
        }
    },

    showGridModal() {
        const modal = document.getElementById('awards-grid-modal');
        const grid = document.getElementById('awards-grid');

        if (!modal || !grid) return;

        // Clear and populate grid
        grid.innerHTML = '';

        this.awards.forEach(award => {
            const item = document.createElement('div');
            item.className = 'award-grid-item';
            item.dataset.id = award.id;

            const img = document.createElement('img');
            // Fix image path: .png -> .jpeg
            img.src = award.image.replace('.png', '.jpeg');
            img.alt = award.title;
            img.loading = 'lazy';

            item.appendChild(img);
            grid.appendChild(item);

            // Click to view detail
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDetailModal(award);
            });
        });

        modal.classList.remove('hidden');
    },

    hideGridModal() {
        const modal = document.getElementById('awards-grid-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showDetailModal(award) {
        const modal = document.getElementById('award-detail-modal');
        const img = document.getElementById('award-detail-image');

        if (!modal || !img) return;

        // Fix image path: .png -> .jpeg
        img.src = award.image.replace('.png', '.jpeg');
        img.alt = award.title;

        modal.classList.remove('hidden');
    },

    hideDetailModal() {
        const modal = document.getElementById('award-detail-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
};

// Make Awards available globally
window.Awards = Awards;
