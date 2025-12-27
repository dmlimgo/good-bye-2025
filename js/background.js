// Background animations (confetti, spotlight effects)

const Background = {
    canvas: null,
    ctx: null,
    confetti: [],
    isRunning: false,
    animationFrame: null,
    lastFrameTime: 0,
    frameInterval: 16, // ~60fps for smooth animation
    maxConfetti: 80,

    // Confetti colors (gold theme)
    colors: [
        '#FFD700', // Gold
        '#FFA500', // Orange
        '#FF8C00', // Dark Orange
        '#FFDF00', // Golden Yellow
        '#F0E68C', // Khaki
        '#DAA520', // Goldenrod
        '#FFE4B5', // Moccasin
        '#FFEFD5', // Papaya Whip
    ],

    init() {
        this.canvas = document.getElementById('animation-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = Math.min(window.innerWidth, 430);
        this.canvas.height = window.innerHeight;
    },

    // Create a single confetti piece
    createConfetti() {
        return {
            x: Utils.random(0, this.canvas.width),
            y: Utils.random(-20, -100),
            width: Utils.random(7, 10.8),  // max 80%
            height: Utils.random(5.4, 7.2),  // max 80%
            color: Utils.randomItem(this.colors),
            rotation: Utils.random(0, 360),
            rotationSpeed: Utils.random(-4, 4),
            speedX: Utils.random(-0.8, 0.8),
            speedY: Utils.random(1.2, 3.0),
            oscillationSpeed: Utils.random(0.02, 0.04),
            oscillationDistance: Utils.random(15, 30),
            opacity: Utils.random(0.7, 1),
            phase: Utils.random(0, Math.PI * 2)
        };
    },

    // Spawn confetti
    spawnConfetti(count = 3) {
        for (let i = 0; i < count; i++) {
            this.confetti.push(this.createConfetti());
        }
    },

    // Update confetti positions
    updateConfetti() {
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];

            // Update position
            c.y += c.speedY;
            c.x += c.speedX + Math.sin(c.phase) * c.oscillationDistance * 0.02;
            c.rotation += c.rotationSpeed;
            c.phase += c.oscillationSpeed;

            // Remove if off screen
            if (c.y > this.canvas.height + 20) {
                this.confetti.splice(i, 1);
            }
        }
    },

    // Draw confetti
    drawConfetti() {
        this.confetti.forEach(c => {
            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate((c.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = c.opacity;

            // Draw rectangle (gold foil)
            this.ctx.fillStyle = c.color;
            this.ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);

            // Add shine effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(-c.width / 2, -c.height / 2, c.width / 2, c.height / 2);

            this.ctx.restore();
        });
    },

    // Main animation loop
    animate() {
        if (!this.isRunning) return;

        const now = performance.now();
        const elapsed = now - this.lastFrameTime;

        // Limit frame rate for performance
        if (elapsed >= this.frameInterval) {
            this.lastFrameTime = now;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Spawn new confetti periodically (reduced rate)
            if (this.confetti.length < this.maxConfetti && Math.random() < 0.1) {
                this.spawnConfetti(Utils.randomInt(1, 2));
            }

            this.updateConfetti();
            this.drawConfetti();
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    // Start animation
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        // Initial confetti burst
        this.spawnConfetti(20);
        this.animate();
    },

    // Stop animation
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    },

    // Clear all confetti
    clear() {
        this.confetti = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
};

// Make Background available globally
window.Background = Background;
