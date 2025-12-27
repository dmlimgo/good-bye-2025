// Main application entry point

const App = {
    currentPage: 0,
    totalPages: 3,
    isLoading: true,
    loadingProgress: 0,

    async init() {
        // Start loading sequence
        await this.loadAssets();

        // Initialize all modules
        Background.init();
        await Characters.init();
        await RollingPaper.init();
        await Awards.init();

        // Setup scroll handling
        this.setupScrollHandling();

        // Hide loading screen and show main content
        this.hideLoadingScreen();

        // Start animations
        Background.start();
    },

    async loadAssets() {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');

        // Simulate loading with progress
        const steps = [
            { text: '에셋 불러오는 중...', progress: 20 },
            { text: '캐릭터 준비 중...', progress: 40 },
            { text: '무대 설정 중...', progress: 60 },
            { text: '롤링페이퍼 준비 중...', progress: 80 },
            { text: '거의 다 됐어요!', progress: 95 },
            { text: '완료!', progress: 100 }
        ];

        for (const step of steps) {
            if (loadingText) loadingText.textContent = step.text;
            if (loadingBar) loadingBar.style.width = `${step.progress}%`;
            await this.delay(300 + Math.random() * 200);
        }

        // Small delay before hiding loading screen
        await this.delay(500);
    },

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.getElementById('main-container');

        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.5s ease';
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }

        if (mainContainer) {
            mainContainer.classList.remove('hidden');
        }

        this.isLoading = false;
    },

    setupScrollHandling() {
        const scrollContainer = document.getElementById('scroll-container');
        const mainContainer = document.getElementById('main-container');
        const arrowUp = document.getElementById('arrow-up');
        const arrowDown = document.getElementById('arrow-down');

        if (!scrollContainer) return;

        // Handle scroll to update indicator
        scrollContainer.addEventListener('scroll', Utils.debounce(() => {
            const scrollTop = scrollContainer.scrollTop;
            const pageHeight = window.innerHeight;
            const currentPage = Math.round(scrollTop / pageHeight);

            if (currentPage !== this.currentPage) {
                this.currentPage = currentPage;
                this.onPageChange(currentPage);
            }

            // Update arrows visibility
            this.updateArrows(currentPage);

            // Update page class on main container for arrow colors
            mainContainer.className = `page-${currentPage}`;
        }, 50));

        // Click on arrows to navigate
        if (arrowUp) {
            arrowUp.addEventListener('click', () => {
                if (this.currentPage > 0) {
                    const targetScroll = (this.currentPage - 1) * window.innerHeight;
                    scrollContainer.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                }
            });
        }

        if (arrowDown) {
            arrowDown.addEventListener('click', () => {
                if (this.currentPage < this.totalPages - 1) {
                    const targetScroll = (this.currentPage + 1) * window.innerHeight;
                    scrollContainer.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                }
            });
        }

        // Initial state
        this.updatePageState(0);
        this.updateArrows(0);
        if (mainContainer) mainContainer.className = 'page-0';
    },

    updateArrows(pageIndex) {
        const arrowUp = document.getElementById('arrow-up');
        const arrowDown = document.getElementById('arrow-down');

        // Page 0: only down arrow
        // Page 1: both arrows
        // Page 2: only up arrow
        if (arrowUp) {
            arrowUp.classList.toggle('visible', pageIndex > 0);
        }
        if (arrowDown) {
            arrowDown.classList.toggle('visible', pageIndex < this.totalPages - 1);
        }
    },

    onPageChange(pageIndex) {
        this.updatePageState(pageIndex);
    },

    updatePageState(pageIndex) {
        // Manage animations based on current page
        switch (pageIndex) {
            case 0: // Stage page
                Characters.resume();
                Background.start();
                break;
            case 1: // Rolling paper page
                Characters.pause();
                Background.stop();
                Background.clear();
                break;
            case 2: // Awards page
                Characters.pause();
                Background.stop();
                Background.clear();
                break;
        }
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle visibility change (pause/resume when tab is hidden/visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        Characters.pause();
        Background.stop();
    } else {
        if (App.currentPage === 0) {
            Characters.resume();
            Background.start();
        }
    }
});

// Handle window resize
window.addEventListener('resize', Utils.debounce(() => {
    Background.resize();
    Characters.updateBounds();
}, 250));

// Make App available globally
window.App = App;
