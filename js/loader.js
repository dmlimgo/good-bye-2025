/**
 * Loader - Resource loading and progress tracking
 */

const Loader = {
    loadingScreen: null,
    loadingBar: null,
    loadingText: null,
    progress: 0,
    targetProgress: 0,
    isComplete: false,

    messages: [
        'Preparing the stage...',
        'Inviting guests...',
        'Setting up decorations...',
        'Tuning the lights...',
        'Almost ready...',
        'Welcome to 2025!'
    ],

    init() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
    },

    setProgress(value) {
        this.targetProgress = Math.min(100, Math.max(0, value));
        this.updateMessage();
    },

    updateMessage() {
        const messageIndex = Math.min(
            Math.floor(this.targetProgress / (100 / this.messages.length)),
            this.messages.length - 1
        );
        this.loadingText.textContent = this.messages[messageIndex];
    },

    update(dt) {
        if (this.isComplete) return;

        // Smooth progress animation
        const diff = this.targetProgress - this.progress;
        this.progress += diff * dt * 3;

        if (Math.abs(diff) < 0.1) {
            this.progress = this.targetProgress;
        }

        this.loadingBar.style.width = `${this.progress}%`;

        // Check if loading is complete
        if (this.progress >= 100 && !this.isComplete) {
            this.complete();
        }
    },

    complete() {
        this.isComplete = true;
        this.loadingBar.style.width = '100%';
        this.loadingText.textContent = this.messages[this.messages.length - 1];

        // Hide loading screen with animation
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            document.getElementById('main-canvas').classList.add('loaded');
        }, 500);
    },

    // Simulate loading steps
    async simulateLoading(callback) {
        const steps = [
            { progress: 20, delay: 300 },
            { progress: 40, delay: 400 },
            { progress: 60, delay: 300 },
            { progress: 80, delay: 400 },
            { progress: 100, delay: 300 }
        ];

        for (const step of steps) {
            await this.delay(step.delay);
            this.setProgress(step.progress);

            // Execute callback at specific progress points
            if (step.progress === 40 && callback) {
                await callback();
            }
        }
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
