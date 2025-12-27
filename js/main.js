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
        const scrollDots = document.querySelectorAll('.scroll-dot');

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

            // Update scroll dots
            scrollDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentPage);
            });
        }, 50));

        // Click on dots to navigate
        scrollDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const targetScroll = index * window.innerHeight;
                scrollContainer.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            });
        });

        // Initial state
        this.updatePageState(0);
    },

    onPageChange(pageIndex) {
        this.updatePageState(pageIndex);
    },

    updatePageState(pageIndex) {
        // Manage animations based on current page
        const scrollPaper = document.getElementById('scroll-paper');

        switch (pageIndex) {
            case 0: // Stage page
                Characters.resume();
                Background.start();
                // Roll up the paper when leaving
                if (scrollPaper) scrollPaper.classList.remove('unrolled');
                break;
            case 1: // Rolling paper page
                Characters.pause();
                Background.stop();
                Background.clear();
                // Unroll the paper with delay
                if (scrollPaper) {
                    setTimeout(() => {
                        scrollPaper.classList.add('unrolled');
                    }, 300);
                }
                break;
            case 2: // Awards page
                Characters.pause();
                Background.stop();
                Background.clear();
                // Roll up the paper when leaving
                if (scrollPaper) scrollPaper.classList.remove('unrolled');
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
