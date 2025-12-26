/**
 * Canvas - Background rendering and scene management
 */

const CanvasRenderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    // Virtual canvas size (for zoom)
    virtualWidth: 2400,
    virtualHeight: 1600,

    // View transform
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    minScale: 0.5,
    maxScale: 3,

    // Animation
    time: 0,
    lights: [],
    stars: [],
    confetti: [],

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        this.initDecorations();

        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Center the view initially
        this.centerView();
    },

    centerView() {
        this.offsetX = (this.width - this.virtualWidth * this.scale) / 2;
        this.offsetY = (this.height - this.virtualHeight * this.scale) / 2;
    },

    initDecorations() {
        // Stage lights
        this.lights = [];
        for (let i = 0; i < 12; i++) {
            this.lights.push({
                x: 200 + i * 180,
                y: 80,
                color: i % 3 === 0 ? '#FFD700' : (i % 3 === 1 ? '#D4363C' : '#FF8C00'),
                phase: Math.random() * Math.PI * 2
            });
        }

        // Background stars
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.virtualWidth,
                y: Math.random() * 400,
                size: Math.random() * 3 + 1,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        // Confetti
        this.confetti = [];
        for (let i = 0; i < 80; i++) {
            this.confetti.push({
                x: Math.random() * this.virtualWidth,
                y: Math.random() * this.virtualHeight,
                size: Math.random() * 8 + 4,
                color: ['#FFD700', '#D4363C', '#FF8C00', '#FFFFFF', '#FFA500'][Math.floor(Math.random() * 5)],
                rotation: Math.random() * Math.PI * 2,
                speedX: (Math.random() - 0.5) * 2,
                speedY: Math.random() * 2 + 1,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    },

    update(dt) {
        this.time += dt;

        // Update confetti
        this.confetti.forEach(c => {
            c.y += c.speedY;
            c.x += c.speedX + Math.sin(this.time * 2 + c.rotation) * 0.5;
            c.rotation += c.rotationSpeed;

            if (c.y > this.virtualHeight + 20) {
                c.y = -20;
                c.x = Math.random() * this.virtualWidth;
            }
        });
    },

    render(characters) {
        const ctx = this.ctx;

        // Clear canvas
        ctx.fillStyle = '#1A0A0A';
        ctx.fillRect(0, 0, this.width, this.height);

        // Apply view transform
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);

        // Draw background layers
        this.drawBackground();
        this.drawStage();
        this.drawAudience();
        this.drawDecorations();

        // Draw characters
        characters.forEach(char => char.draw(ctx));

        // Draw foreground effects
        this.drawConfetti();
        this.drawStageLights();

        ctx.restore();
    },

    drawBackground() {
        const ctx = this.ctx;
        const w = this.virtualWidth;
        const h = this.virtualHeight;

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0D0505');
        gradient.addColorStop(0.3, '#1A0A0A');
        gradient.addColorStop(0.7, '#2D1414');
        gradient.addColorStop(1, '#1A0A0A');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Stars
        this.stars.forEach(star => {
            const alpha = 0.3 + Math.sin(this.time * 3 + star.twinkle) * 0.3 + 0.4;
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawStage() {
        const ctx = this.ctx;
        const w = this.virtualWidth;

        // Stage back wall
        ctx.fillStyle = '#2D1414';
        ctx.fillRect(100, 150, w - 200, 350);

        // Stage floor gradient
        const stageGradient = ctx.createLinearGradient(0, 450, 0, 550);
        stageGradient.addColorStop(0, '#4A2020');
        stageGradient.addColorStop(1, '#2D1414');
        ctx.fillStyle = stageGradient;
        ctx.fillRect(100, 450, w - 200, 100);

        // Stage edge
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(100, 540, w - 200, 20);

        // Left curtain
        this.drawCurtain(ctx, 100, 100, 150, 450);
        // Right curtain
        this.drawCurtain(ctx, w - 250, 100, 150, 450);

        // Top curtain valance
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(100, 100);
        for (let i = 0; i <= 10; i++) {
            const x = 100 + i * ((w - 200) / 10);
            const y = 100 + Math.sin(i * 0.8) * 30 + 30;
            ctx.quadraticCurveTo(x - 50, y + 20, x, y);
        }
        ctx.lineTo(w - 100, 100);
        ctx.closePath();
        ctx.fill();

        // Stage floor pattern
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(100 + i * 110, 450);
            ctx.lineTo(100 + i * 110, 550);
            ctx.stroke();
        }

        // "2025" banner
        this.drawBanner(ctx, w / 2, 200);
    },

    drawCurtain(ctx, x, y, width, height) {
        // Curtain gradient
        const curtainGradient = ctx.createLinearGradient(x, y, x + width, y);
        curtainGradient.addColorStop(0, '#4A0000');
        curtainGradient.addColorStop(0.3, '#8B0000');
        curtainGradient.addColorStop(0.5, '#A52A2A');
        curtainGradient.addColorStop(0.7, '#8B0000');
        curtainGradient.addColorStop(1, '#4A0000');

        ctx.fillStyle = curtainGradient;
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Wavy curtain edge
        for (let i = 0; i <= height; i += 30) {
            const wave = Math.sin(i * 0.05 + this.time) * 8;
            ctx.lineTo(x + width + wave, y + i);
        }

        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();

        // Curtain folds
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * (width / 4), y);
            for (let j = 0; j <= height; j += 30) {
                const wave = Math.sin(j * 0.05 + this.time + i) * 5;
                ctx.lineTo(x + i * (width / 4) + wave, y + j);
            }
            ctx.stroke();
        }
    },

    drawBanner(ctx, x, y) {
        // Banner background
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(x - 200, y - 50);
        ctx.lineTo(x + 200, y - 50);
        ctx.lineTo(x + 220, y);
        ctx.lineTo(x + 200, y + 50);
        ctx.lineTo(x - 200, y + 50);
        ctx.lineTo(x - 220, y);
        ctx.closePath();
        ctx.fill();

        // Banner border
        ctx.strokeStyle = '#D4363C';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2025', x, y);

        // Decorative elements
        ctx.fillStyle = '#D4363C';
        ctx.beginPath();
        ctx.arc(x - 150, y, 10, 0, Math.PI * 2);
        ctx.arc(x + 150, y, 10, 0, Math.PI * 2);
        ctx.fill();
    },

    drawAudience() {
        const ctx = this.ctx;
        const w = this.virtualWidth;
        const h = this.virtualHeight;

        // Audience floor (tiered)
        for (let row = 0; row < 5; row++) {
            const rowY = 600 + row * 100;
            const gradient = ctx.createLinearGradient(0, rowY, 0, rowY + 100);
            gradient.addColorStop(0, `rgba(45, 20, 20, ${1 - row * 0.1})`);
            gradient.addColorStop(1, `rgba(26, 10, 10, ${1 - row * 0.1})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(50, rowY, w - 100, 100);

            // Row divider
            ctx.fillStyle = '#4A2020';
            ctx.fillRect(50, rowY, w - 100, 5);
        }

        // Side barriers
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(50, 560, 30, 540);
        ctx.fillRect(w - 80, 560, 30, 540);

        // Aisle lines
        ctx.strokeStyle = '#3D1818';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(w / 2, 560);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.setLineDash([]);
    },

    drawDecorations() {
        const ctx = this.ctx;
        const w = this.virtualWidth;

        // Light strings on stage
        ctx.strokeStyle = '#4A2020';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 120);
        for (let i = 0; i <= 20; i++) {
            const x = 100 + i * ((w - 200) / 20);
            const y = 120 + Math.sin(i * 0.5) * 15;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Hanging lights on string
        for (let i = 0; i < 20; i++) {
            const x = 120 + i * ((w - 240) / 20);
            const y = 120 + Math.sin(i * 0.5) * 15;
            const hue = (i * 20 + this.time * 50) % 360;

            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            ctx.beginPath();
            ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
            ctx.fill();

            // Glow
            const glowGradient = ctx.createRadialGradient(x, y + 10, 0, x, y + 10, 20);
            glowGradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.5)`);
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y + 10, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawStageLights() {
        const ctx = this.ctx;

        this.lights.forEach(light => {
            const intensity = 0.3 + Math.sin(this.time * 2 + light.phase) * 0.2;

            // Light beam
            ctx.save();
            ctx.globalAlpha = intensity * 0.3;

            const gradient = ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y + 400, 200
            );
            gradient.addColorStop(0, light.color);
            gradient.addColorStop(0.5, light.color + '40');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(light.x - 10, light.y);
            ctx.lineTo(light.x - 100, light.y + 400);
            ctx.lineTo(light.x + 100, light.y + 400);
            ctx.lineTo(light.x + 10, light.y);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // Light fixture
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(light.x, light.y, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = light.color;
            ctx.beginPath();
            ctx.arc(light.x, light.y + 5, 10, 0, Math.PI);
            ctx.fill();
        });
    },

    drawConfetti() {
        const ctx = this.ctx;

        this.confetti.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);

            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);

            ctx.restore();
        });
    },

    // Coordinate conversion methods
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    },

    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.scale + this.offsetX,
            y: worldY * this.scale + this.offsetY
        };
    },

    // Zoom methods
    zoom(delta, centerX, centerY) {
        const oldScale = this.scale;
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * (1 + delta)));

        // Zoom toward mouse position
        const worldPos = this.screenToWorld(centerX, centerY);
        this.offsetX = centerX - worldPos.x * this.scale;
        this.offsetY = centerY - worldPos.y * this.scale;

        this.clampOffset();
    },

    pan(dx, dy) {
        this.offsetX += dx;
        this.offsetY += dy;
        this.clampOffset();
    },

    clampOffset() {
        const minX = this.width - this.virtualWidth * this.scale - 100;
        const maxX = 100;
        const minY = this.height - this.virtualHeight * this.scale - 100;
        const maxY = 100;

        this.offsetX = Math.max(minX, Math.min(maxX, this.offsetX));
        this.offsetY = Math.max(minY, Math.min(maxY, this.offsetY));
    },

    // Get stage area bounds for character placement
    getStageArea() {
        return {
            x: 260,
            y: 280,
            width: this.virtualWidth - 520,
            height: 250
        };
    },

    // Get audience area bounds for character placement
    getAudienceArea() {
        return {
            x: 100,
            y: 600,
            width: this.virtualWidth - 200,
            height: 500
        };
    }
};
