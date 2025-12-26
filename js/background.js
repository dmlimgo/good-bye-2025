// Background drawing module

const Background = {
    // Clickable areas
    areas: {
        rollingPaper: null,
        awards: null
    },

    // Animation state
    lightAngle: 0,
    musicNotes: [],
    sparkles: [],

    // Initialize background
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.initMusicNotes();
        this.initSparkles();
    },

    // Initialize floating music notes
    initMusicNotes() {
        const notes = ['♪', '♫', '♬', '♩'];
        for (let i = 0; i < 15; i++) {
            this.musicNotes.push({
                x: Utils.random(0, 1),
                y: Utils.random(0, 1),
                note: Utils.randomItem(notes),
                speed: Utils.random(0.0005, 0.001),
                amplitude: Utils.random(20, 40),
                phase: Utils.random(0, Math.PI * 2),
                size: Utils.random(14, 24),
                opacity: Utils.random(0.3, 0.6)
            });
        }
    },

    // Initialize sparkles
    initSparkles() {
        for (let i = 0; i < 30; i++) {
            this.sparkles.push({
                x: Utils.random(0.3, 0.7),
                y: Utils.random(0.1, 0.5),
                size: Utils.random(2, 5),
                speed: Utils.random(0.02, 0.05),
                phase: Utils.random(0, Math.PI * 2)
            });
        }
    },

    // Draw full background
    draw(width, height) {
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw layers
        this.drawWalls(width, height);
        this.drawFloor(width, height);
        this.drawStage(width, height);
        this.drawLights(width, height);
        this.drawCurtains(width, height);
        this.drawInstruments(width, height);
        this.drawRollingPaperArea(width, height);
        this.drawAwardsArea(width, height);
        this.drawMusicNotes(width, height);
        this.drawSparkles(width, height);
        this.drawDecorations(width, height);

        // Update animation
        this.lightAngle += 0.02;
    },

    // Draw walls
    drawWalls(w, h) {
        const ctx = this.ctx;

        // Back wall gradient
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        wallGrad.addColorStop(0, '#1a1a4e');
        wallGrad.addColorStop(1, '#2d2d6e');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h * 0.6);

        // Left wall (2.5D perspective)
        ctx.fillStyle = '#f5e6d3';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w * 0.15, h * 0.1);
        ctx.lineTo(w * 0.15, h * 0.65);
        ctx.lineTo(0, h * 0.7);
        ctx.closePath();
        ctx.fill();

        // Left wall shadow
        const leftShadow = ctx.createLinearGradient(0, 0, w * 0.15, 0);
        leftShadow.addColorStop(0, 'rgba(0,0,0,0.3)');
        leftShadow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = leftShadow;
        ctx.fill();

        // Right wall
        ctx.fillStyle = '#f5e6d3';
        ctx.beginPath();
        ctx.moveTo(w, 0);
        ctx.lineTo(w * 0.85, h * 0.1);
        ctx.lineTo(w * 0.85, h * 0.65);
        ctx.lineTo(w, h * 0.7);
        ctx.closePath();
        ctx.fill();

        // Right wall shadow
        const rightShadow = ctx.createLinearGradient(w, 0, w * 0.85, 0);
        rightShadow.addColorStop(0, 'rgba(0,0,0,0.3)');
        rightShadow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rightShadow;
        ctx.fill();
    },

    // Draw floor with perspective
    drawFloor(w, h) {
        const ctx = this.ctx;

        // Main floor
        const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
        floorGrad.addColorStop(0, '#f4a460');
        floorGrad.addColorStop(1, '#cd853f');

        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        ctx.lineTo(w * 0.15, h * 0.65);
        ctx.lineTo(w * 0.85, h * 0.65);
        ctx.lineTo(w, h * 0.7);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Floor lines for depth
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const y = h * 0.7 + (h * 0.3 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    },

    // Draw stage
    drawStage(w, h) {
        const ctx = this.ctx;
        const stageX = w * 0.25;
        const stageY = h * 0.45;
        const stageW = w * 0.5;
        const stageH = h * 0.2;

        // Stage platform front
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(stageX, stageY + stageH - 20, stageW, 25);

        // Stage platform top
        const stageGrad = ctx.createLinearGradient(stageX, stageY, stageX, stageY + stageH);
        stageGrad.addColorStop(0, '#2d2d6e');
        stageGrad.addColorStop(1, '#1a1a4e');
        ctx.fillStyle = stageGrad;
        ctx.fillRect(stageX, stageY, stageW, stageH - 20);

        // Stage light spots on floor
        const spotColors = ['rgba(255, 200, 100, 0.4)', 'rgba(100, 200, 255, 0.4)', 'rgba(255, 100, 200, 0.3)'];
        const spotX = [w * 0.35, w * 0.5, w * 0.65];

        spotX.forEach((x, i) => {
            const spotGrad = ctx.createRadialGradient(x, stageY + stageH * 0.5, 0, x, stageY + stageH * 0.5, 80);
            spotGrad.addColorStop(0, spotColors[i]);
            spotGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.ellipse(x, stageY + stageH * 0.5, 80, 40, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    // Draw stage lights
    drawLights(w, h) {
        const ctx = this.ctx;

        // Light rig
        ctx.fillStyle = '#333';
        ctx.fillRect(w * 0.2, h * 0.05, w * 0.6, 15);

        // Spotlights
        const lightPositions = [
            { x: w * 0.3, targetX: w * 0.35, color: '#ffcc00' },
            { x: w * 0.5, targetX: w * 0.5, color: '#00ccff' },
            { x: w * 0.7, targetX: w * 0.65, color: '#ff66cc' }
        ];

        lightPositions.forEach((light, i) => {
            // Light fixture
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(light.x, h * 0.08, 12, 0, Math.PI * 2);
            ctx.fill();

            // Light beam (animated)
            const beamOffset = Math.sin(this.lightAngle + i * 0.5) * 30;
            const targetX = light.targetX + beamOffset;

            const beamGrad = ctx.createLinearGradient(light.x, h * 0.08, targetX, h * 0.55);
            beamGrad.addColorStop(0, Utils.hexToRgba(light.color, 0.6));
            beamGrad.addColorStop(0.5, Utils.hexToRgba(light.color, 0.2));
            beamGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(light.x - 10, h * 0.08);
            ctx.lineTo(light.x + 10, h * 0.08);
            ctx.lineTo(targetX + 60, h * 0.55);
            ctx.lineTo(targetX - 60, h * 0.55);
            ctx.closePath();
            ctx.fill();
        });

        // Side lights
        const sideLights = [
            { x: w * 0.18, y: h * 0.15 },
            { x: w * 0.82, y: h * 0.15 }
        ];

        sideLights.forEach(light => {
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(light.x, light.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    // Draw curtains
    drawCurtains(w, h) {
        const ctx = this.ctx;

        // Left curtain
        this.drawCurtain(ctx, w * 0.15, h * 0.05, w * 0.12, h * 0.55, 'left');

        // Right curtain
        this.drawCurtain(ctx, w * 0.73, h * 0.05, w * 0.12, h * 0.55, 'right');

        // Top curtain valance
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.05);
        ctx.lineTo(w * 0.85, h * 0.05);
        ctx.lineTo(w * 0.85, h * 0.12);
        ctx.quadraticCurveTo(w * 0.5, h * 0.16, w * 0.15, h * 0.12);
        ctx.closePath();
        ctx.fill();

        // Gold trim
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.12);
        ctx.quadraticCurveTo(w * 0.5, h * 0.16, w * 0.85, h * 0.12);
        ctx.stroke();
    },

    // Draw single curtain with folds
    drawCurtain(ctx, x, y, width, height, side) {
        const folds = 5;
        const foldWidth = width / folds;

        for (let i = 0; i < folds; i++) {
            const foldX = x + i * foldWidth;
            const isLight = i % 2 === 0;

            const grad = ctx.createLinearGradient(foldX, y, foldX + foldWidth, y);
            if (isLight) {
                grad.addColorStop(0, '#B22222');
                grad.addColorStop(0.5, '#CD5C5C');
                grad.addColorStop(1, '#B22222');
            } else {
                grad.addColorStop(0, '#8B0000');
                grad.addColorStop(0.5, '#A52A2A');
                grad.addColorStop(1, '#8B0000');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(foldX, y);
            ctx.lineTo(foldX + foldWidth, y);
            ctx.lineTo(foldX + foldWidth, y + height);
            ctx.lineTo(foldX, y + height);
            ctx.closePath();
            ctx.fill();
        }

        // Gold rope tie
        const ropeX = side === 'left' ? x + width - 5 : x + 5;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ropeX, y + height * 0.3);
        ctx.quadraticCurveTo(ropeX + (side === 'left' ? 20 : -20), y + height * 0.4, ropeX, y + height * 0.5);
        ctx.stroke();
    },

    // Draw instruments on stage
    drawInstruments(w, h) {
        const ctx = this.ctx;
        const stageY = h * 0.45;

        // Drum set
        this.drawDrumSet(ctx, w * 0.5, stageY + 30, 0.8);

        // Guitar on stand (left)
        this.drawGuitar(ctx, w * 0.32, stageY + 60, 0.6);

        // Keyboard (right)
        this.drawKeyboard(ctx, w * 0.65, stageY + 70, 0.7);

        // Speakers
        this.drawSpeaker(ctx, w * 0.22, stageY + 50, 0.5);
        this.drawSpeaker(ctx, w * 0.78, stageY + 50, 0.5);

        // Monitor speakers on stage front
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(w * 0.35, h * 0.6, 30, 15);
        ctx.fillRect(w * 0.62, h * 0.6, 30, 15);
    },

    // Draw drum set
    drawDrumSet(ctx, x, y, scale) {
        const s = scale;

        // Bass drum
        ctx.fillStyle = '#B22222';
        ctx.beginPath();
        ctx.ellipse(x, y + 20 * s, 35 * s, 25 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Snare drum
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.ellipse(x - 30 * s, y + 5 * s, 15 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tom-toms
        ctx.fillStyle = '#B22222';
        ctx.beginPath();
        ctx.ellipse(x - 15 * s, y - 20 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 15 * s, y - 20 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cymbals
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(x - 40 * s, y - 15 * s, 18 * s, 5 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 45 * s, y - 10 * s, 15 * s, 4 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Hi-hat
        ctx.beginPath();
        ctx.ellipse(x + 35 * s, y + 5 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    // Draw guitar
    drawGuitar(ctx, x, y, scale) {
        const s = scale;

        // Neck
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 3 * s, y - 50 * s, 6 * s, 50 * s);

        // Body
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.ellipse(x, y + 15 * s, 20 * s, 25 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sound hole
        ctx.fillStyle = '#2F2F2F';
        ctx.beginPath();
        ctx.arc(x, y + 10 * s, 7 * s, 0, Math.PI * 2);
        ctx.fill();

        // Stand
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 15 * s, y + 40 * s);
        ctx.lineTo(x, y + 20 * s);
        ctx.lineTo(x + 15 * s, y + 40 * s);
        ctx.stroke();
    },

    // Draw keyboard
    drawKeyboard(ctx, x, y, scale) {
        const s = scale;

        // Stand
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 5 * s, y, 10 * s, 35 * s);

        // Keyboard body
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x - 40 * s, y - 10 * s, 80 * s, 20 * s);

        // White keys
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 12; i++) {
            ctx.fillRect(x - 38 * s + i * 6 * s, y - 8 * s, 5 * s, 15 * s);
        }

        // Black keys
        ctx.fillStyle = '#000';
        const blackKeyPos = [1, 2, 4, 5, 6, 8, 9, 11];
        blackKeyPos.forEach(pos => {
            ctx.fillRect(x - 38 * s + pos * 6 * s - 2 * s, y - 8 * s, 4 * s, 9 * s);
        });
    },

    // Draw speaker
    drawSpeaker(ctx, x, y, scale) {
        const s = scale;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x - 20 * s, y, 40 * s, 60 * s);

        // Speaker cone
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x, y + 20 * s, 12 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y + 45 * s, 8 * s, 0, Math.PI * 2);
        ctx.fill();
    },

    // Draw rolling paper area (left side)
    drawRollingPaperArea(w, h) {
        const ctx = this.ctx;

        // Board background
        const boardX = w * 0.02;
        const boardY = h * 0.15;
        const boardW = w * 0.12;
        const boardH = h * 0.45;

        // White paper roll
        ctx.fillStyle = '#fff';
        ctx.fillRect(boardX, boardY, boardW, boardH);

        // Paper shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(boardX + boardW - 5, boardY, 5, boardH);

        // Roll top
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(boardX - 5, boardY - 15, boardW + 10, 20);
        ctx.beginPath();
        ctx.arc(boardX - 5, boardY - 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(boardX + boardW + 5, boardY - 5, 10, 0, Math.PI * 2);
        ctx.fill();

        // Title
        ctx.fillStyle = '#B22222';
        ctx.fillRect(boardX - 10, boardY - 40, boardW + 20, 25);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px "Jua", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MESSAGES', boardX + boardW / 2, boardY - 23);

        // Sticky notes decoration
        const noteColors = ['#FFE4B5', '#FFB6C1', '#98FB98', '#87CEEB'];
        const notes = [
            { x: boardX + 10, y: boardY + 30, rot: -5 },
            { x: boardX + boardW - 35, y: boardY + 60, rot: 3 },
            { x: boardX + 15, y: boardY + 120, rot: -2 },
            { x: boardX + boardW - 40, y: boardY + 180, rot: 4 }
        ];

        notes.forEach((note, i) => {
            ctx.save();
            ctx.translate(note.x + 15, note.y + 15);
            ctx.rotate(note.rot * Math.PI / 180);
            ctx.fillStyle = noteColors[i % noteColors.length];
            ctx.fillRect(-15, -15, 30, 30);
            ctx.restore();
        });

        // Pencil decoration
        ctx.save();
        ctx.translate(boardX + boardW * 0.7, boardY + boardH + 20);
        ctx.rotate(-0.3);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(0, 0, 40, 8);
        ctx.fillStyle = '#FFA07A';
        ctx.fillRect(0, 0, 8, 8);
        ctx.fillStyle = '#2F2F2F';
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(48, 4);
        ctx.lineTo(40, 8);
        ctx.fill();
        ctx.restore();

        // Store clickable area
        this.areas.rollingPaper = {
            x: boardX - 10,
            y: boardY - 40,
            width: boardW + 20,
            height: boardH + 55
        };
    },

    // Draw awards area (right side)
    drawAwardsArea(w, h) {
        const ctx = this.ctx;

        // Area dimensions
        const areaX = w * 0.86;
        const areaY = h * 0.12;
        const areaW = w * 0.12;
        const areaH = h * 0.5;

        // Title banner
        ctx.fillStyle = '#f5e6d3';
        ctx.fillRect(areaX - 5, areaY - 5, areaW + 10, 30);
        ctx.fillStyle = '#333';
        ctx.font = 'bold 13px "Jua", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PHOTO ALBUM', areaX + areaW / 2, areaY + 15);

        // Picture frames
        const frames = [
            { x: areaX + 5, y: areaY + 35, w: areaW * 0.45, h: areaW * 0.5 },
            { x: areaX + areaW * 0.52, y: areaY + 40, w: areaW * 0.45, h: areaW * 0.5 },
            { x: areaX + 8, y: areaY + 35 + areaW * 0.55, w: areaW * 0.42, h: areaW * 0.5 },
            { x: areaX + areaW * 0.55, y: areaY + 40 + areaW * 0.55, w: areaW * 0.42, h: areaW * 0.5 },
            { x: areaX + 5, y: areaY + 35 + areaW * 1.1, w: areaW * 0.45, h: areaW * 0.5 },
            { x: areaX + areaW * 0.52, y: areaY + 40 + areaW * 1.1, w: areaW * 0.45, h: areaW * 0.5 }
        ];

        frames.forEach((frame, i) => {
            // Frame border
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(frame.x - 4, frame.y - 4, frame.w + 8, frame.h + 8);

            // Inner frame
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(frame.x - 2, frame.y - 2, frame.w + 4, frame.h + 4);

            // Picture placeholder (gradient)
            const picGrad = ctx.createLinearGradient(frame.x, frame.y, frame.x + frame.w, frame.y + frame.h);
            const hue = (i * 40) % 360;
            picGrad.addColorStop(0, `hsl(${hue}, 60%, 70%)`);
            picGrad.addColorStop(1, `hsl(${hue + 30}, 60%, 60%)`);
            ctx.fillStyle = picGrad;
            ctx.fillRect(frame.x, frame.y, frame.w, frame.h);

            // Simple figure silhouette
            ctx.fillStyle = `hsl(${hue}, 40%, 50%)`;
            ctx.beginPath();
            ctx.arc(frame.x + frame.w / 2, frame.y + frame.h * 0.35, frame.w * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(frame.x + frame.w / 2, frame.y + frame.h * 0.75, frame.w * 0.2, frame.h * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Store clickable area
        this.areas.awards = {
            x: areaX - 10,
            y: areaY - 10,
            width: areaW + 20,
            height: areaH + 20
        };
    },

    // Draw floating music notes
    drawMusicNotes(w, h) {
        const ctx = this.ctx;

        this.musicNotes.forEach(note => {
            const x = note.x * w + Math.sin(note.phase) * note.amplitude;
            const y = note.y * h;

            ctx.fillStyle = `rgba(255, 255, 255, ${note.opacity})`;
            ctx.font = `${note.size}px Arial`;
            ctx.fillText(note.note, x, y);

            // Update position
            note.y -= note.speed;
            note.phase += 0.02;

            // Reset if off screen
            if (note.y < -0.05) {
                note.y = 1.05;
                note.x = Utils.random(0.2, 0.8);
            }
        });
    },

    // Draw sparkles on stage
    drawSparkles(w, h) {
        const ctx = this.ctx;

        this.sparkles.forEach(sparkle => {
            const x = sparkle.x * w;
            const y = sparkle.y * h;
            const alpha = Math.abs(Math.sin(sparkle.phase)) * 0.8;

            ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();

            // Star shape
            if (sparkle.size > 3) {
                ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.5})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - sparkle.size * 2, y);
                ctx.lineTo(x + sparkle.size * 2, y);
                ctx.moveTo(x, y - sparkle.size * 2);
                ctx.lineTo(x, y + sparkle.size * 2);
                ctx.stroke();
            }

            sparkle.phase += sparkle.speed;
        });
    },

    // Draw additional decorations
    drawDecorations(w, h) {
        const ctx = this.ctx;

        // Confetti-like elements scattered on floor
        const confettiColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#26de81'];

        for (let i = 0; i < 20; i++) {
            const x = w * 0.15 + Utils.random(0, w * 0.7);
            const y = h * 0.75 + Utils.random(0, h * 0.2);
            const color = confettiColors[i % confettiColors.length];

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(x, y, 4, 2, Utils.random(0, Math.PI), 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // Check if click is in rolling paper area
    isRollingPaperClick(x, y) {
        const area = this.areas.rollingPaper;
        if (!area) return false;
        return Utils.pointInRect(x, y, area.x, area.y, area.width, area.height);
    },

    // Check if click is in awards area
    isAwardsClick(x, y) {
        const area = this.areas.awards;
        if (!area) return false;
        return Utils.pointInRect(x, y, area.x, area.y, area.width, area.height);
    }
};
