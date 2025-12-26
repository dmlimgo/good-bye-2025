/**
 * Character - Character class with drawing, animation, and interaction
 */

class Character {
    constructor(name, x, y, config) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;

        // Asset configuration
        this.headType = config.headType;
        this.bodyType = config.bodyType;
        this.skinColor = config.skinColor;
        this.hairColor = config.hairColor;
        this.bodyColor = config.bodyColor;

        // Size
        this.scale = 0.8 + Math.random() * 0.3;

        // Animation state
        this.state = 'idle'; // idle, dragging, talking
        this.animTime = Math.random() * Math.PI * 2;
        this.wiggleOffset = 0;
        this.wiggleIntensity = 0;

        // Speech bubble
        this.message = null;
        this.messageTimer = 0;
        this.messageOpacity = 0;

        // Idle animation params
        this.idleSpeed = 0.5 + Math.random() * 0.5;
        this.idleAmplitude = 2 + Math.random() * 2;

        // Hover state
        this.isHovered = false;
        this.hoverScale = 1;

        // Z-index for layering
        this.zIndex = y;
    }

    // Hitbox for click/drag detection
    getHitbox() {
        const width = 80 * this.scale;
        const height = 130 * this.scale;
        return {
            x: this.x - width / 2,
            y: this.y - height + 20,
            width: width,
            height: height
        };
    }

    contains(px, py) {
        const box = this.getHitbox();
        return px >= box.x && px <= box.x + box.width &&
               py >= box.y && py <= box.y + box.height;
    }

    update(dt) {
        this.animTime += dt * this.idleSpeed;

        // Idle bobbing animation
        if (this.state === 'idle') {
            this.wiggleOffset = Math.sin(this.animTime * 2) * this.idleAmplitude;
            this.wiggleIntensity *= 0.95;
        }

        // Dragging wiggle
        if (this.state === 'dragging') {
            this.wiggleIntensity = Math.min(this.wiggleIntensity + dt * 10, 1);
            this.wiggleOffset = Math.sin(this.animTime * 15) * 8 * this.wiggleIntensity;
        }

        // Message fade
        if (this.message) {
            this.messageTimer -= dt;
            if (this.messageTimer <= 0.5) {
                this.messageOpacity = this.messageTimer * 2;
            } else if (this.messageOpacity < 1) {
                this.messageOpacity = Math.min(1, this.messageOpacity + dt * 5);
            }

            if (this.messageTimer <= 0) {
                this.message = null;
                this.state = 'idle';
            }
        }

        // Hover effect
        if (this.isHovered) {
            this.hoverScale = Math.min(1.1, this.hoverScale + dt * 2);
        } else {
            this.hoverScale = Math.max(1, this.hoverScale - dt * 2);
        }
    }

    draw(ctx) {
        ctx.save();

        // Position with animation offset
        const drawX = this.x;
        const drawY = this.y + this.wiggleOffset;

        // Apply hover scale
        const totalScale = this.scale * this.hoverScale;

        // Draw shadow
        this.drawShadow(ctx, drawX, this.y);

        // Character transform
        ctx.translate(drawX, drawY);

        // Wiggle rotation when dragging
        if (this.state === 'dragging') {
            const wiggleAngle = Math.sin(this.animTime * 15) * 0.1 * this.wiggleIntensity;
            ctx.rotate(wiggleAngle);
        }

        // Draw body first (behind head)
        Assets.drawBody(ctx, 0, -30, totalScale, this.bodyType, this.bodyColor);

        // Draw head
        Assets.drawHead(ctx, 0, -90 * totalScale, totalScale, this.headType, this.skinColor, this.hairColor);

        // Draw name
        this.drawName(ctx, 0, -130 * totalScale);

        // Draw message bubble
        if (this.message && this.messageOpacity > 0) {
            this.drawMessageBubble(ctx, 0, -150 * totalScale);
        }

        ctx.restore();
    }

    drawShadow(ctx, x, y) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(x, y + 5, 25 * this.scale, 10 * this.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawName(ctx, x, y) {
        const name = this.name;
        ctx.font = `bold ${14 * this.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Name background
        const metrics = ctx.measureText(name);
        const padding = 6;
        const bgWidth = metrics.width + padding * 2;
        const bgHeight = 18 * this.scale;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect(x - bgWidth / 2, y - bgHeight, bgWidth, bgHeight, 4);
        ctx.fill();

        // Name text
        ctx.fillStyle = '#FFD700';
        ctx.fillText(name, x, y - 4);
    }

    drawMessageBubble(ctx, x, y) {
        ctx.save();
        ctx.globalAlpha = this.messageOpacity;

        const message = this.message;
        ctx.font = `bold ${12}px Arial`;
        const metrics = ctx.measureText(message);
        const padding = 12;
        const bubbleWidth = Math.min(metrics.width + padding * 2, 200);
        const bubbleHeight = 40;

        // Bubble background
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight - 10, bubbleWidth, bubbleHeight, 10);
        ctx.fill();

        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 10);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 8, y - 10);
        ctx.fill();

        // Bubble border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight - 10, bubbleWidth, bubbleHeight, 10);
        ctx.stroke();

        // Message text with wrapping
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        this.wrapText(ctx, message, x, y - bubbleHeight / 2 - 5, bubbleWidth - padding * 2, 14);

        ctx.restore();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && line !== '') {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        // Draw lines centered vertically
        const totalHeight = lines.length * lineHeight;
        const startY = y - totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }

    // Interaction methods
    showMessage(message) {
        this.message = message;
        this.messageTimer = 4; // Show for 4 seconds
        this.messageOpacity = 0;
        this.state = 'talking';
    }

    startDrag() {
        this.state = 'dragging';
        this.wiggleIntensity = 0;
        this.zIndex = 10000; // Bring to front
    }

    drag(x, y) {
        this.x = x;
        this.y = y;
    }

    endDrag() {
        this.state = 'idle';
        this.wiggleIntensity = 1; // Start with wiggle then fade
        this.baseX = this.x;
        this.baseY = this.y;
        this.zIndex = this.y; // Reset z-index based on position
    }

    setHovered(hovered) {
        this.isHovered = hovered;
    }
}

/**
 * CharacterManager - Manages all characters
 */
const CharacterManager = {
    characters: [],
    names: [],
    messages: [],

    async init() {
        // Load names and messages
        try {
            const [namesResponse, messagesResponse] = await Promise.all([
                fetch('data/names.json'),
                fetch('data/messages.json')
            ]);

            const namesData = await namesResponse.json();
            const messagesData = await messagesResponse.json();

            this.names = namesData.names;
            this.messages = messagesData.messages;
        } catch (error) {
            console.error('Failed to load data:', error);
            // Fallback data
            this.names = Array.from({length: 42}, (_, i) => `Member ${i + 1}`);
            this.messages = ['Happy New Year!', 'Best wishes!', 'Cheers to 2025!'];
        }

        this.createCharacters();
    },

    createCharacters() {
        const stageArea = CanvasRenderer.getStageArea();
        const audienceArea = CanvasRenderer.getAudienceArea();

        // Put some characters on stage (about 8)
        const stageCount = 8;
        const audienceCount = this.names.length - stageCount;

        // Stage characters
        for (let i = 0; i < stageCount; i++) {
            const x = stageArea.x + (i + 0.5) * (stageArea.width / stageCount);
            const y = stageArea.y + stageArea.height - 50 + Math.random() * 30;
            const config = Assets.getRandomConfig();

            this.characters.push(new Character(this.names[i], x, y, config));
        }

        // Audience characters (spread across rows)
        const rowCount = 5;
        const charsPerRow = Math.ceil(audienceCount / rowCount);

        for (let i = stageCount; i < this.names.length; i++) {
            const audienceIndex = i - stageCount;
            const row = Math.floor(audienceIndex / charsPerRow);
            const col = audienceIndex % charsPerRow;

            const rowChars = Math.min(charsPerRow, audienceCount - row * charsPerRow);
            const spacing = audienceArea.width / (rowChars + 1);

            const x = audienceArea.x + (col + 1) * spacing + (Math.random() - 0.5) * 30;
            const y = audienceArea.y + row * 100 + 60 + (Math.random() - 0.5) * 20;
            const config = Assets.getRandomConfig();

            this.characters.push(new Character(this.names[i], x, y, config));
        }

        // Sort by y position for proper layering
        this.sortByDepth();
    },

    update(dt) {
        this.characters.forEach(char => char.update(dt));
    },

    sortByDepth() {
        this.characters.sort((a, b) => a.zIndex - b.zIndex);
    },

    getCharacterAt(x, y) {
        // Check from front to back (reverse order since sorted by depth)
        for (let i = this.characters.length - 1; i >= 0; i--) {
            if (this.characters[i].contains(x, y)) {
                return this.characters[i];
            }
        }
        return null;
    },

    getRandomMessage() {
        return this.messages[Math.floor(Math.random() * this.messages.length)];
    },

    bringToFront(character) {
        character.zIndex = 10000;
        this.sortByDepth();
    },

    resetDepth(character) {
        character.zIndex = character.y;
        this.sortByDepth();
    }
};
