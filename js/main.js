/**
 * Main - Application entry point and game loop
 */

const App = {
    canvas: null,
    lastTime: 0,
    isRunning: false,

    async init() {
        console.log('Initializing New Year Celebration...');

        // Get canvas element
        this.canvas = document.getElementById('main-canvas');

        // Initialize loader
        Loader.init();

        // Start loading animation
        await Loader.simulateLoading(async () => {
            // Initialize canvas renderer
            CanvasRenderer.init(this.canvas);

            // Initialize characters
            await CharacterManager.init();

            // Initialize interaction handlers
            Interaction.init(this.canvas);
        });

        // Start game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));

        console.log('Application started!');
    },

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps
        const cappedDt = Math.min(dt, 0.1);

        // Update
        this.update(cappedDt);

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    update(dt) {
        // Update loader
        Loader.update(dt);

        // Update canvas animations
        CanvasRenderer.update(dt);

        // Update characters
        CharacterManager.update(dt);
    },

    render() {
        // Only render when loading is complete
        if (Loader.isComplete) {
            CanvasRenderer.render(CharacterManager.characters);
        }
    }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
