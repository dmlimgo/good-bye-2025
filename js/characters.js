// Character system module

const Characters = {
    list: [],
    draggingCharacter: null,
    dragOffset: { x: 0, y: 0 },

    // Character appearance presets
    skinColors: ['#FFDAB9', '#DEB887', '#D2B48C', '#F5DEB3', '#FFE4C4', '#FFCBA4', '#8D5524', '#C68642'],
    hairColors: ['#2C1810', '#4A3728', '#8B4513', '#CD853F', '#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF69B4', '#9400D3'],
    shirtColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'],
    pantsColors: ['#2C3E50', '#34495E', '#1ABC9C', '#3498DB', '#9B59B6', '#E74C3C', '#2ECC71', '#F39C12'],

    // Initialize characters
    async init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Load members from JSON
        try {
            const response = await fetch('data/members.json');
            const data = await response.json();
            this.createCharacters(data.members);
        } catch (error) {
            console.error('Failed to load members:', error);
            // Fallback: create some default characters
            this.createCharacters([
                { id: 1, name: '캐릭터1' },
                { id: 2, name: '캐릭터2' },
                { id: 3, name: '캐릭터3' }
            ]);
        }
    },

    // Create all characters
    createCharacters(members) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Define walking area (floor area in front of stage)
        const minX = w * 0.18;
        const maxX = w * 0.82;
        const minY = h * 0.68;
        const maxY = h * 0.92;

        members.forEach((member, index) => {
            const character = this.createCharacter(member, index, minX, maxX, minY, maxY);
            this.list.push(character);
        });
    },

    // Create single character
    createCharacter(member, index, minX, maxX, minY, maxY) {
        // Randomize appearance
        const skinColor = Utils.randomItem(this.skinColors);
        const hairColor = Utils.randomItem(this.hairColors);
        const shirtColor = Utils.randomItem(this.shirtColors);
        const pantsColor = Utils.randomItem(this.pantsColors);

        // Random position within bounds
        const x = Utils.random(minX, maxX);
        const y = Utils.random(minY, maxY);

        // Scale based on Y position (perspective)
        const scale = Utils.lerp(0.6, 1.0, (y - minY) / (maxY - minY));

        return {
            id: member.id,
            name: member.name,
            x: x,
            y: y,
            scale: scale,
            baseScale: scale,

            // Appearance
            skinColor: skinColor,
            hairColor: hairColor,
            shirtColor: shirtColor,
            pantsColor: pantsColor,
            hairStyle: Utils.randomInt(0, 4),
            hasGlasses: Math.random() > 0.7,

            // Movement
            targetX: x,
            targetY: y,
            speed: Utils.random(0.5, 1.5),
            isMoving: false,
            direction: 1, // 1 = right, -1 = left
            moveTimer: Utils.random(0, 3000),
            idleTimer: 0,

            // Animation
            animPhase: Utils.random(0, Math.PI * 2),
            armSwing: 0,
            legSwing: 0,
            bounceOffset: 0,

            // Dragging
            isDragging: false,
            wigglePhase: 0,

            // Bounds
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        };
    },

    // Update all characters
    update(deltaTime) {
        this.list.forEach(char => {
            if (char.isDragging) {
                // Wiggle animation when being dragged
                char.wigglePhase += 0.3;
                char.armSwing = Math.sin(char.wigglePhase) * 0.8;
                char.legSwing = Math.sin(char.wigglePhase * 1.5) * 0.5;
            } else {
                this.updateMovement(char, deltaTime);
                this.updateAnimation(char, deltaTime);
            }

            // Update scale based on Y position (perspective)
            const yRatio = (char.y - char.minY) / (char.maxY - char.minY);
            char.scale = Utils.lerp(0.6, 1.0, yRatio);
        });

        // Sort by Y position for proper layering
        this.list.sort((a, b) => a.y - b.y);
    },

    // Update character movement
    updateMovement(char, deltaTime) {
        char.moveTimer -= deltaTime;

        if (!char.isMoving) {
            // Idle state - wait then pick new target
            if (char.moveTimer <= 0) {
                // Pick random nearby target
                const range = 100 * char.scale;
                char.targetX = Utils.clamp(
                    char.x + Utils.random(-range, range),
                    char.minX,
                    char.maxX
                );
                char.targetY = Utils.clamp(
                    char.y + Utils.random(-range * 0.5, range * 0.5),
                    char.minY,
                    char.maxY
                );
                char.isMoving = true;
                char.moveTimer = Utils.random(2000, 5000);

                // Set direction
                char.direction = char.targetX > char.x ? 1 : -1;
            }
        } else {
            // Moving towards target
            const dx = char.targetX - char.x;
            const dy = char.targetY - char.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 2) {
                const moveSpeed = char.speed * (deltaTime / 16);
                char.x += (dx / dist) * moveSpeed;
                char.y += (dy / dist) * moveSpeed;

                // Update direction
                if (Math.abs(dx) > 0.5) {
                    char.direction = dx > 0 ? 1 : -1;
                }
            } else {
                // Reached target
                char.isMoving = false;
                char.moveTimer = Utils.random(1000, 4000);
            }
        }
    },

    // Update character animation
    updateAnimation(char, deltaTime) {
        char.animPhase += deltaTime * 0.005;

        if (char.isMoving) {
            // Walking animation
            char.armSwing = Math.sin(char.animPhase * 8) * 0.4;
            char.legSwing = Math.sin(char.animPhase * 8) * 0.3;
            char.bounceOffset = Math.abs(Math.sin(char.animPhase * 8)) * 2;
        } else {
            // Idle animation - subtle breathing/swaying
            char.armSwing = Math.sin(char.animPhase * 2) * 0.1;
            char.legSwing = 0;
            char.bounceOffset = Math.sin(char.animPhase * 3) * 0.5;
        }
    },

    // Draw all characters
    draw() {
        this.list.forEach(char => {
            this.drawCharacter(char);
        });
    },

    // Draw single character
    drawCharacter(char) {
        const ctx = this.ctx;
        const s = char.scale * 40; // Base size multiplier

        ctx.save();
        ctx.translate(char.x, char.y - char.bounceOffset);

        // Flip based on direction
        if (char.direction === -1) {
            ctx.scale(-1, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, s * 1.5, s * 0.5, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw body parts
        this.drawLegs(ctx, char, s);
        this.drawBody(ctx, char, s);
        this.drawArms(ctx, char, s);
        this.drawHead(ctx, char, s);

        ctx.restore();

        // Draw name above character (not flipped)
        this.drawName(char);
    },

    // Draw legs
    drawLegs(ctx, char, s) {
        const legWidth = s * 0.18;
        const legHeight = s * 0.5;

        // Left leg
        ctx.save();
        ctx.translate(-s * 0.15, s * 0.8);
        ctx.rotate(char.legSwing);

        ctx.fillStyle = char.pantsColor;
        ctx.beginPath();
        ctx.roundRect(-legWidth / 2, 0, legWidth, legHeight, 5);
        ctx.fill();

        // Shoe
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, legHeight, legWidth * 0.7, legWidth * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(s * 0.15, s * 0.8);
        ctx.rotate(-char.legSwing);

        ctx.fillStyle = char.pantsColor;
        ctx.beginPath();
        ctx.roundRect(-legWidth / 2, 0, legWidth, legHeight, 5);
        ctx.fill();

        // Shoe
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, legHeight, legWidth * 0.7, legWidth * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    // Draw body/torso
    drawBody(ctx, char, s) {
        const bodyWidth = s * 0.6;
        const bodyHeight = s * 0.7;

        ctx.fillStyle = char.shirtColor;
        ctx.beginPath();
        ctx.roundRect(-bodyWidth / 2, 0, bodyWidth, bodyHeight, 8);
        ctx.fill();

        // Shirt detail (collar or pattern)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(-s * 0.1, 0);
        ctx.lineTo(0, s * 0.15);
        ctx.lineTo(s * 0.1, 0);
        ctx.closePath();
        ctx.fill();
    },

    // Draw arms
    drawArms(ctx, char, s) {
        const armWidth = s * 0.15;
        const armLength = s * 0.45;

        // Left arm
        ctx.save();
        ctx.translate(-s * 0.35, s * 0.15);
        ctx.rotate(-char.armSwing - 0.2);

        // Upper arm (shirt color)
        ctx.fillStyle = char.shirtColor;
        ctx.beginPath();
        ctx.roundRect(-armWidth / 2, 0, armWidth, armLength * 0.5, 4);
        ctx.fill();

        // Lower arm/hand (skin)
        ctx.fillStyle = char.skinColor;
        ctx.beginPath();
        ctx.roundRect(-armWidth / 2, armLength * 0.4, armWidth, armLength * 0.6, 4);
        ctx.fill();

        // Hand
        ctx.beginPath();
        ctx.arc(0, armLength, armWidth * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(s * 0.35, s * 0.15);
        ctx.rotate(char.armSwing + 0.2);

        ctx.fillStyle = char.shirtColor;
        ctx.beginPath();
        ctx.roundRect(-armWidth / 2, 0, armWidth, armLength * 0.5, 4);
        ctx.fill();

        ctx.fillStyle = char.skinColor;
        ctx.beginPath();
        ctx.roundRect(-armWidth / 2, armLength * 0.4, armWidth, armLength * 0.6, 4);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, armLength, armWidth * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    // Draw head
    drawHead(ctx, char, s) {
        const headSize = s * 0.45;

        ctx.save();
        ctx.translate(0, -s * 0.1);

        // Head shape
        ctx.fillStyle = char.skinColor;
        ctx.beginPath();
        ctx.arc(0, 0, headSize, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        this.drawHair(ctx, char, s, headSize);

        // Face
        this.drawFace(ctx, char, s, headSize);

        ctx.restore();
    },

    // Draw hair based on style
    drawHair(ctx, char, s, headSize) {
        ctx.fillStyle = char.hairColor;

        switch (char.hairStyle) {
            case 0: // Short spiky
                for (let i = -3; i <= 3; i++) {
                    const angle = (i * 0.3) - Math.PI / 2;
                    const x = Math.cos(angle) * headSize * 0.7;
                    const y = Math.sin(angle) * headSize * 0.7;
                    ctx.beginPath();
                    ctx.moveTo(x * 0.5, y * 0.5 - headSize * 0.3);
                    ctx.lineTo(x, y - headSize * 0.5);
                    ctx.lineTo(x * 0.8, y * 0.3 - headSize * 0.2);
                    ctx.fill();
                }
                break;

            case 1: // Bowl cut
                ctx.beginPath();
                ctx.arc(0, -headSize * 0.2, headSize * 0.9, Math.PI, 0);
                ctx.fill();
                break;

            case 2: // Side part
                ctx.beginPath();
                ctx.ellipse(-headSize * 0.2, -headSize * 0.5, headSize * 0.8, headSize * 0.4, -0.2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 3: // Curly/fluffy
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * headSize * 0.6;
                    const y = Math.sin(angle) * headSize * 0.6 - headSize * 0.2;
                    ctx.beginPath();
                    ctx.arc(x, y, headSize * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 4: // Long hair
                ctx.beginPath();
                ctx.moveTo(-headSize * 0.8, -headSize * 0.3);
                ctx.quadraticCurveTo(-headSize, headSize * 0.5, -headSize * 0.6, headSize);
                ctx.lineTo(-headSize * 0.3, headSize * 0.3);
                ctx.lineTo(headSize * 0.3, headSize * 0.3);
                ctx.lineTo(headSize * 0.6, headSize);
                ctx.quadraticCurveTo(headSize, headSize * 0.5, headSize * 0.8, -headSize * 0.3);
                ctx.arc(0, -headSize * 0.2, headSize * 0.8, 0, Math.PI, true);
                ctx.fill();
                break;
        }
    },

    // Draw face features
    drawFace(ctx, char, s, headSize) {
        // Eyes
        const eyeSize = headSize * 0.15;
        const eyeY = 0;
        const eyeSpacing = headSize * 0.35;

        // Eye whites
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeY, eyeSize * 1.2, eyeSize, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeSpacing, eyeY, eyeSize * 1.2, eyeSize, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-eyeSpacing + eyeSize * 0.2, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing + eyeSize * 0.2, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-eyeSpacing + eyeSize * 0.3, eyeY - eyeSize * 0.2, eyeSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing + eyeSize * 0.3, eyeY - eyeSize * 0.2, eyeSize * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Glasses (if has)
        if (char.hasGlasses) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(-eyeSpacing, eyeY, eyeSize * 1.5, eyeSize * 1.3, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(eyeSpacing, eyeY, eyeSize * 1.5, eyeSize * 1.3, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-eyeSpacing + eyeSize * 1.5, eyeY);
            ctx.lineTo(eyeSpacing - eyeSize * 1.5, eyeY);
            ctx.stroke();
        }

        // Mouth (smile)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, headSize * 0.3, headSize * 0.25, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Blush
        ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing - eyeSize, headSize * 0.2, eyeSize * 0.8, eyeSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeSpacing + eyeSize, headSize * 0.2, eyeSize * 0.8, eyeSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    // Draw name above character
    drawName(char) {
        const ctx = this.ctx;
        const nameY = char.y - char.scale * 70 - char.bounceOffset;

        ctx.save();

        // Name background
        ctx.font = `bold ${12 * char.scale}px "Jua", sans-serif`;
        const textWidth = ctx.measureText(char.name).width;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(char.x - textWidth / 2 - 6, nameY - 10, textWidth + 12, 18, 4);
        ctx.fill();

        // Name text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char.name, char.x, nameY);

        ctx.restore();
    },

    // Get character at position
    getCharacterAt(x, y) {
        // Check in reverse order (top-most first)
        for (let i = this.list.length - 1; i >= 0; i--) {
            const char = this.list[i];
            const hitRadius = char.scale * 35;

            if (Utils.distance(x, y, char.x, char.y - char.scale * 30) < hitRadius) {
                return char;
            }
        }
        return null;
    },

    // Start dragging character
    startDrag(x, y) {
        const char = this.getCharacterAt(x, y);
        if (char) {
            char.isDragging = true;
            char.isMoving = false;
            this.draggingCharacter = char;
            this.dragOffset.x = char.x - x;
            this.dragOffset.y = char.y - y;

            // Move to end of list (draw on top)
            const index = this.list.indexOf(char);
            this.list.splice(index, 1);
            this.list.push(char);

            return true;
        }
        return false;
    },

    // Update drag position
    updateDrag(x, y) {
        if (this.draggingCharacter) {
            const char = this.draggingCharacter;
            char.x = Utils.clamp(x + this.dragOffset.x, char.minX, char.maxX);
            char.y = Utils.clamp(y + this.dragOffset.y, char.minY, char.maxY);
        }
    },

    // End dragging
    endDrag() {
        if (this.draggingCharacter) {
            this.draggingCharacter.isDragging = false;
            this.draggingCharacter.wigglePhase = 0;
            this.draggingCharacter.moveTimer = Utils.random(1000, 2000);
            this.draggingCharacter = null;
        }
    }
};
