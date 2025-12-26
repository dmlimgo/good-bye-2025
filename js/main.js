// Main application entry point

const App = {
    canvas: null,
    ctx: null,
    isLoading: true,
    loadProgress: 0,
    lastTime: 0,
    isMouseDown: false,
    wasDragging: false,
    mouseX: 0,
    mouseY: 0,
    mouseDownX: 0,
    mouseDownY: 0,

    // Initialize application
    async init() {
        // Setup canvas
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Handle resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Start loading
        await this.load();

        // Setup interactions
        this.setupInteractions();

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    // Handle window resize
    handleResize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        // Store display size
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;

        // Reinitialize background areas if needed
        if (Background.canvas) {
            Background.canvas = this.canvas;
            Background.ctx = this.ctx;
        }
    },

    // Load all resources
    async load() {
        const loadingBar = document.querySelector('.loading-bar');
        const loadingPercent = document.querySelector('.loading-percent');

        const updateProgress = (progress) => {
            this.loadProgress = progress;
            loadingBar.style.width = `${progress}%`;
            loadingPercent.textContent = `${Math.round(progress)}%`;
        };

        try {
            // Initialize background
            updateProgress(10);
            Background.init(this.canvas);
            await this.delay(200);

            // Initialize characters
            updateProgress(30);
            await Characters.init(this.canvas);
            await this.delay(300);

            // Initialize rolling paper
            updateProgress(60);
            await RollingPaper.init();
            await this.delay(200);

            // Initialize awards
            updateProgress(80);
            await Awards.init();
            await this.delay(200);

            // Final setup
            updateProgress(100);
            await this.delay(500);

            // Hide loading screen
            this.hideLoadingScreen();

        } catch (error) {
            console.error('Loading error:', error);
            // Still hide loading screen even if there's an error
            updateProgress(100);
            await this.delay(500);
            this.hideLoadingScreen();
        }
    },

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        this.isLoading = false;
    },

    // Setup mouse/touch interactions
    setupInteractions() {
        const canvas = this.canvas;

        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Touch events
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Click events for interactive areas
        canvas.addEventListener('click', (e) => this.handleClick(e));

        // Cursor style
        canvas.addEventListener('mousemove', (e) => {
            const pos = this.getEventPosition(e);
            const char = Characters.getCharacterAt(pos.x, pos.y);
            const isOverRollingPaper = Background.isRollingPaperClick(pos.x, pos.y);
            const isOverAwards = Background.isAwardsClick(pos.x, pos.y);

            if (char || isOverRollingPaper || isOverAwards) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }
        });
    },

    // Get position from mouse/touch event
    getEventPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    },

    // Handle mouse down
    handleMouseDown(e) {
        const pos = this.getEventPosition(e);
        this.isMouseDown = true;
        this.wasDragging = false;
        this.mouseX = pos.x;
        this.mouseY = pos.y;
        this.mouseDownX = pos.x;
        this.mouseDownY = pos.y;

        // Try to start dragging a character
        Characters.startDrag(pos.x, pos.y);
    },

    // Handle mouse move
    handleMouseMove(e) {
        if (!this.isMouseDown) return;

        const pos = this.getEventPosition(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;

        // Check if dragged more than 5 pixels
        const dist = Utils.distance(this.mouseDownX, this.mouseDownY, pos.x, pos.y);
        if (dist > 5) {
            this.wasDragging = true;
        }

        Characters.updateDrag(pos.x, pos.y);
    },

    // Handle mouse up
    handleMouseUp(e) {
        this.isMouseDown = false;
        Characters.endDrag();
    },

    // Handle touch start
    handleTouchStart(e) {
        e.preventDefault();
        const pos = this.getEventPosition(e);
        this.isMouseDown = true;
        this.wasDragging = false;
        this.mouseX = pos.x;
        this.mouseY = pos.y;
        this.mouseDownX = pos.x;
        this.mouseDownY = pos.y;

        Characters.startDrag(pos.x, pos.y);
    },

    // Handle touch move
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isMouseDown) return;

        const pos = this.getEventPosition(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;

        // Check if dragged more than 5 pixels
        const dist = Utils.distance(this.mouseDownX, this.mouseDownY, pos.x, pos.y);
        if (dist > 5) {
            this.wasDragging = true;
        }

        Characters.updateDrag(pos.x, pos.y);
    },

    // Handle touch end
    handleTouchEnd(e) {
        // Handle tap (if not dragging)
        if (!this.wasDragging) {
            // Check rolling paper area
            if (Background.isRollingPaperClick(this.mouseX, this.mouseY)) {
                RollingPaper.showMainPopup();
            }
            // Check awards area
            else if (Background.isAwardsClick(this.mouseX, this.mouseY)) {
                Awards.showAwardsPopup();
            }
        }

        this.isMouseDown = false;
        Characters.endDrag();
    },

    // Handle click on interactive areas
    handleClick(e) {
        // Don't process if we were dragging
        if (this.wasDragging) return;

        const pos = this.getEventPosition(e);

        // Check rolling paper area
        if (Background.isRollingPaperClick(pos.x, pos.y)) {
            RollingPaper.showMainPopup();
            return;
        }

        // Check awards area
        if (Background.isAwardsClick(pos.x, pos.y)) {
            Awards.showAwardsPopup();
            return;
        }
    },

    // Main game loop
    gameLoop(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime);

        // Render
        this.render();

        // Next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    // Update game state
    update(deltaTime) {
        if (this.isLoading) return;

        // Update characters
        Characters.update(deltaTime);
    },

    // Render everything
    render() {
        if (this.isLoading) return;

        const w = this.displayWidth;
        const h = this.displayHeight;

        // Draw background
        Background.draw(w, h);

        // Draw characters
        Characters.draw();
    },

    // Utility: delay promise
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations
    } else {
        // Resume
        App.lastTime = performance.now();
    }
});
