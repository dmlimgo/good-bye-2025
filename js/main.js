// Main application entry point

const App = {
    currentPage: 0,
    totalPages: 3,
    isLoading: true,
    loadingProgress: 0,

    async init() {
        // Start loading sequence
        await this.loadAssets();

        // Show main container first (behind loading screen) for layout calculation
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.classList.remove('hidden');
            mainContainer.style.visibility = 'hidden';
        }

        // Wait a frame for layout
        await this.delay(50);

        // Initialize all modules
        Background.init();
        await Characters.init();
        await RollingPaper.init();
        await Awards.init();

        // Setup scroll handling
        this.setupScrollHandling();

        // Show main content and hide loading screen
        if (mainContainer) {
            mainContainer.style.visibility = 'visible';
        }
        this.hideLoadingScreen();

        // Recalculate bounds after visible
        Characters.updateBounds();
        Characters.repositionCharacters();

        // Start animations
        Background.start();
    },

    async loadAssets() {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');

        const updateProgress = (text, progress) => {
            if (loadingText) loadingText.textContent = text;
            if (loadingBar) loadingBar.style.width = `${progress}%`;
        };

        // Step 1: Load awards data and preload images
        updateProgress('에셋 불러오는 중...', 10);
        const awardsData = await Utils.loadJSON('data/awards.json');

        // Step 2: Preload award images
        updateProgress('어워드 이미지 로딩 중...', 20);
        if (awardsData && awardsData.awards) {
            await this.preloadImages(awardsData.awards.map(a => a.image.replace('.png', '.jpeg')));
        }

        // Step 3: Preload background images
        updateProgress('배경 이미지 로딩 중...', 40);
        await this.preloadImages([
            'assets/bg/bg.png',
            'assets/bg/title.png',
            'assets/bg/bar.png',
            'assets/rolling/rolling-paper-title.png',
            'assets/awards/award-title.png'
        ]);

        // Step 4: Continue loading
        updateProgress('캐릭터 준비 중...', 60);
        await this.delay(200);

        updateProgress('무대 설정 중...', 75);
        await this.delay(200);

        updateProgress('롤링페이퍼 준비 중...', 90);
        await this.delay(200);

        updateProgress('완료!', 100);
        await this.delay(500);
    },

    preloadImages(urls) {
        const promises = urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // Resolve even on error to not block loading
                img.src = url;
            });
        });
        return Promise.all(promises);
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
        // Particles run on all pages
        Background.start();

        switch (pageIndex) {
            case 0: // Stage page
                Characters.resume();
                break;
            case 1: // Rolling paper page
                Characters.pause();
                break;
            case 2: // Awards page
                Characters.pause();
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
        // Resume particles on all pages
        Background.start();
        if (App.currentPage === 0) {
            Characters.resume();
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
