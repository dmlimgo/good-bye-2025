/**
 * Assets - Head and Body drawing functions
 * Each asset is drawn using Canvas 2D API
 */

const Assets = {
    // Skin color palette
    skinColors: ['#FFE4C4', '#FFDAB9', '#F5DEB3', '#DEB887', '#D2B48C'],

    // Body color palette (warm festival colors)
    bodyColors: [
        '#D4363C', // Red
        '#FFD700', // Gold
        '#FF8C00', // Orange
        '#8B0000', // Dark Red
        '#FFA500', // Bright Orange
        '#DC143C', // Crimson
        '#FF6347', // Tomato
        '#B22222', // Firebrick
        '#CD853F', // Peru
        '#DAA520'  // Goldenrod
    ],

    // Hair colors
    hairColors: ['#2C1810', '#4A3728', '#1A1A1A', '#8B4513', '#654321'],

    /**
     * Draw head based on type
     * Types: 0=round, 1=square, 2=oval, 3=heart, 4=triangle
     */
    drawHead(ctx, x, y, scale, type, skinColor, hairColor) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const headSize = 30;

        switch(type) {
            case 0: // Round face
                this.drawRoundHead(ctx, headSize, skinColor, hairColor);
                break;
            case 1: // Square face
                this.drawSquareHead(ctx, headSize, skinColor, hairColor);
                break;
            case 2: // Oval face
                this.drawOvalHead(ctx, headSize, skinColor, hairColor);
                break;
            case 3: // Heart face
                this.drawHeartHead(ctx, headSize, skinColor, hairColor);
                break;
            case 4: // Triangle face
                this.drawTriangleHead(ctx, headSize, skinColor, hairColor);
                break;
        }

        ctx.restore();
    },

    drawRoundHead(ctx, size, skinColor, hairColor) {
        // Hair (back)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(0, -5, size * 1.1, Math.PI, 0, false);
        ctx.fill();

        // Face
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Hair (front - bangs)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.7, size * 0.8, size * 0.4, 0, 0, Math.PI);
        ctx.fill();

        // Eyes
        this.drawEyes(ctx, -10, -5, 5);

        // Mouth
        this.drawSmile(ctx, 0, 10);

        // Blush
        this.drawBlush(ctx, -15, 5);
        this.drawBlush(ctx, 15, 5);
    },

    drawSquareHead(ctx, size, skinColor, hairColor) {
        const halfSize = size * 0.9;

        // Hair (back)
        ctx.fillStyle = hairColor;
        ctx.fillRect(-halfSize * 1.1, -size * 1.2, halfSize * 2.2, size * 0.8);

        // Face
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.roundRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2.2, 8);
        ctx.fill();

        // Hair (spiky)
        ctx.fillStyle = hairColor;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 8 - 4, -halfSize);
            ctx.lineTo(i * 8, -halfSize - 15);
            ctx.lineTo(i * 8 + 4, -halfSize);
            ctx.fill();
        }

        // Eyes (square-ish)
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(-15, -8, 8, 8);
        ctx.fillRect(7, -8, 8, 8);

        // Eye shine
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-13, -6, 3, 3);
        ctx.fillRect(9, -6, 3, 3);

        // Mouth
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(-8, 12, 16, 4);

        // Blush
        this.drawBlush(ctx, -18, 5);
        this.drawBlush(ctx, 18, 5);
    },

    drawOvalHead(ctx, size, skinColor, hairColor) {
        // Hair (long)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.ellipse(0, 10, size * 1.1, size * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.8, size * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair (bangs - curved)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.moveTo(-size * 0.8, -size * 0.3);
        ctx.quadraticCurveTo(-size * 0.4, -size * 1.3, 0, -size * 0.9);
        ctx.quadraticCurveTo(size * 0.4, -size * 1.3, size * 0.8, -size * 0.3);
        ctx.lineTo(size * 0.7, -size * 0.8);
        ctx.quadraticCurveTo(0, -size * 1.2, -size * 0.7, -size * 0.8);
        ctx.fill();

        // Eyes (cute round)
        this.drawEyes(ctx, -12, -5, 6);

        // Eyelashes
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-18, -10);
        ctx.lineTo(-20, -14);
        ctx.moveTo(-15, -11);
        ctx.lineTo(-15, -15);
        ctx.moveTo(18, -10);
        ctx.lineTo(20, -14);
        ctx.moveTo(15, -11);
        ctx.lineTo(15, -15);
        ctx.stroke();

        // Small mouth
        ctx.fillStyle = '#E8A0A0';
        ctx.beginPath();
        ctx.ellipse(0, 12, 5, 3, 0, 0, Math.PI);
        ctx.fill();

        // Blush
        this.drawBlush(ctx, -15, 5);
        this.drawBlush(ctx, 15, 5);
    },

    drawHeartHead(ctx, size, skinColor, hairColor) {
        // Hair (puffy)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(-12, -size * 0.8, size * 0.6, 0, Math.PI * 2);
        ctx.arc(12, -size * 0.8, size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Face (heart-shaped)
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.moveTo(0, size * 1.1);
        ctx.bezierCurveTo(-size * 1.2, size * 0.3, -size * 1.2, -size * 0.5, -size * 0.6, -size * 0.7);
        ctx.bezierCurveTo(-size * 0.2, -size * 0.9, 0, -size * 0.6, 0, -size * 0.4);
        ctx.bezierCurveTo(0, -size * 0.6, size * 0.2, -size * 0.9, size * 0.6, -size * 0.7);
        ctx.bezierCurveTo(size * 1.2, -size * 0.5, size * 1.2, size * 0.3, 0, size * 1.1);
        ctx.fill();

        // Hair decoration (bow)
        ctx.fillStyle = '#D4363C';
        ctx.beginPath();
        ctx.ellipse(-18, -size * 0.6, 8, 5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(-10, -size * 0.6, 8, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-14, -size * 0.6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (sparkly)
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(-10, -3, 5, 0, Math.PI * 2);
        ctx.arc(10, -3, 5, 0, Math.PI * 2);
        ctx.fill();

        // Eye sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-12, -5, 2, 0, Math.PI * 2);
        ctx.arc(8, -5, 2, 0, Math.PI * 2);
        ctx.arc(-8, -2, 1, 0, Math.PI * 2);
        ctx.arc(12, -2, 1, 0, Math.PI * 2);
        ctx.fill();

        // Cat mouth
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, 10);
        ctx.quadraticCurveTo(0, 15, 5, 10);
        ctx.stroke();

        // Blush
        this.drawBlush(ctx, -18, 5);
        this.drawBlush(ctx, 18, 5);
    },

    drawTriangleHead(ctx, size, skinColor, hairColor) {
        // Hair (mohawk style)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.5);
        ctx.lineTo(-8, -size * 0.5);
        ctx.lineTo(8, -size * 0.5);
        ctx.closePath();
        ctx.fill();

        // Face (inverted triangle)
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.moveTo(-size * 0.9, -size * 0.6);
        ctx.lineTo(size * 0.9, -size * 0.6);
        ctx.lineTo(0, size * 1.1);
        ctx.closePath();
        ctx.fill();

        // Round it a bit
        ctx.beginPath();
        ctx.arc(0, -size * 0.3, size * 0.7, 0, Math.PI, true);
        ctx.fill();

        // Side hair
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.ellipse(-size * 0.7, -size * 0.4, size * 0.4, size * 0.5, 0.3, 0, Math.PI * 2);
        ctx.ellipse(size * 0.7, -size * 0.4, size * 0.4, size * 0.5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (cool looking)
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.ellipse(-10, -5, 4, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(10, -5, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-11, -7, 2, 0, Math.PI * 2);
        ctx.arc(9, -7, 2, 0, Math.PI * 2);
        ctx.fill();

        // Smirk
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 12);
        ctx.quadraticCurveTo(3, 16, 8, 10);
        ctx.stroke();

        // Blush
        this.drawBlush(ctx, -15, 5);
        this.drawBlush(ctx, 15, 5);
    },

    drawEyes(ctx, x, y, size) {
        // Left eye
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.arc(-x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x - 1, y - 2, size * 0.4, 0, Math.PI * 2);
        ctx.arc(-x - 1, y - 2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    },

    drawSmile(ctx, x, y) {
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y - 3, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();
    },

    drawBlush(ctx, x, y) {
        ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    /**
     * Draw body based on type
     * Types: 0=tshirt, 1=suit, 2=dress, 3=hoodie, 4=coat
     */
    drawBody(ctx, x, y, scale, type, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        switch(type) {
            case 0:
                this.drawTshirt(ctx, color);
                break;
            case 1:
                this.drawSuit(ctx, color);
                break;
            case 2:
                this.drawDress(ctx, color);
                break;
            case 3:
                this.drawHoodie(ctx, color);
                break;
            case 4:
                this.drawCoat(ctx, color);
                break;
        }

        ctx.restore();
    },

    drawTshirt(ctx, color) {
        const skinColor = '#FFE4C4';

        // Body/Torso
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-20, 50);
        ctx.lineTo(20, 50);
        ctx.lineTo(25, 0);
        ctx.quadraticCurveTo(20, -10, 0, -10);
        ctx.quadraticCurveTo(-20, -10, -25, 0);
        ctx.fill();

        // Sleeves
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-40, 20);
        ctx.lineTo(-30, 25);
        ctx.lineTo(-20, 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.lineTo(40, 20);
        ctx.lineTo(30, 25);
        ctx.lineTo(20, 10);
        ctx.fill();

        // Neck
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, -5, 10, 0, Math.PI, true);
        ctx.fill();

        // Arms
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.ellipse(-35, 28, 8, 10, 0.3, 0, Math.PI * 2);
        ctx.ellipse(35, 28, 8, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Collar detail
        ctx.strokeStyle = this.darkenColor(color, 30);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -8);
        ctx.quadraticCurveTo(0, 0, 10, -8);
        ctx.stroke();

        // Legs
        this.drawLegs(ctx);
    },

    drawSuit(ctx, color) {
        const skinColor = '#FFE4C4';
        const darkColor = this.darkenColor(color, 40);

        // Jacket body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(-22, 55);
        ctx.lineTo(22, 55);
        ctx.lineTo(28, 0);
        ctx.quadraticCurveTo(20, -12, 0, -12);
        ctx.quadraticCurveTo(-20, -12, -28, 0);
        ctx.fill();

        // Lapels
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(-15, 25);
        ctx.lineTo(-5, 25);
        ctx.lineTo(0, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(8, -8);
        ctx.lineTo(15, 25);
        ctx.lineTo(5, 25);
        ctx.lineTo(0, 0);
        ctx.fill();

        // White shirt
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-8, 55);
        ctx.lineTo(8, 55);
        ctx.lineTo(5, 0);
        ctx.fill();

        // Tie
        ctx.fillStyle = '#D4363C';
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(-5, 15);
        ctx.lineTo(0, 50);
        ctx.lineTo(5, 15);
        ctx.closePath();
        ctx.fill();

        // Sleeves
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(-42, 30);
        ctx.lineTo(-32, 35);
        ctx.lineTo(-22, 12);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(42, 30);
        ctx.lineTo(32, 35);
        ctx.lineTo(22, 12);
        ctx.fill();

        // Hands
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(-37, 38, 8, 0, Math.PI * 2);
        ctx.arc(37, 38, 8, 0, Math.PI * 2);
        ctx.fill();

        // Buttons
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 30, 3, 0, Math.PI * 2);
        ctx.arc(0, 42, 3, 0, Math.PI * 2);
        ctx.fill();

        // Legs (suit pants)
        this.drawSuitLegs(ctx, darkColor);
    },

    drawDress(ctx, color) {
        const skinColor = '#FFE4C4';
        const lightColor = this.lightenColor(color, 30);

        // Dress top
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-25, 25);
        ctx.lineTo(25, 25);
        ctx.lineTo(20, 0);
        ctx.quadraticCurveTo(15, -10, 0, -10);
        ctx.quadraticCurveTo(-15, -10, -20, 0);
        ctx.fill();

        // Dress skirt
        ctx.beginPath();
        ctx.moveTo(-25, 25);
        ctx.quadraticCurveTo(-40, 60, -35, 70);
        ctx.lineTo(35, 70);
        ctx.quadraticCurveTo(40, 60, 25, 25);
        ctx.fill();

        // Skirt details
        ctx.strokeStyle = lightColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-20, 30);
        ctx.quadraticCurveTo(-25, 50, -28, 70);
        ctx.moveTo(0, 28);
        ctx.lineTo(0, 70);
        ctx.moveTo(20, 30);
        ctx.quadraticCurveTo(25, 50, 28, 70);
        ctx.stroke();

        // Ribbon/bow
        ctx.fillStyle = this.darkenColor(color, 20);
        ctx.beginPath();
        ctx.ellipse(-12, 26, 10, 5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(12, 26, 10, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 26, 5, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.ellipse(-28, 18, 7, 12, 0.4, 0, Math.PI * 2);
        ctx.ellipse(28, 18, 7, 12, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.beginPath();
        ctx.arc(0, -5, 8, 0, Math.PI, true);
        ctx.fill();

        // Legs
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.ellipse(-12, 75, 6, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(12, 75, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shoes
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.ellipse(-12, 88, 8, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(12, 88, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    drawHoodie(ctx, color) {
        const skinColor = '#FFE4C4';
        const darkColor = this.darkenColor(color, 25);

        // Hoodie body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(-24, 55);
        ctx.lineTo(24, 55);
        ctx.lineTo(28, 0);
        ctx.quadraticCurveTo(20, -15, 0, -15);
        ctx.quadraticCurveTo(-20, -15, -28, 0);
        ctx.fill();

        // Hood (behind head suggestion)
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(0, -20, 25, Math.PI, 0);
        ctx.fill();

        // Kangaroo pocket
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(-18, 30);
        ctx.quadraticCurveTo(-20, 45, -15, 48);
        ctx.lineTo(15, 48);
        ctx.quadraticCurveTo(20, 45, 18, 30);
        ctx.lineTo(-18, 30);
        ctx.fill();

        // Pocket opening
        ctx.strokeStyle = this.darkenColor(color, 40);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, 35);
        ctx.lineTo(15, 35);
        ctx.stroke();

        // Sleeves
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-28, 5);
        ctx.lineTo(-45, 35);
        ctx.lineTo(-35, 40);
        ctx.lineTo(-22, 15);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(28, 5);
        ctx.lineTo(45, 35);
        ctx.lineTo(35, 40);
        ctx.lineTo(22, 15);
        ctx.fill();

        // Drawstrings
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.lineTo(-8, 20);
        ctx.moveTo(5, -5);
        ctx.lineTo(8, 20);
        ctx.stroke();

        // Hands
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(-40, 42, 8, 0, Math.PI * 2);
        ctx.arc(40, 42, 8, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        this.drawLegs(ctx);
    },

    drawCoat(ctx, color) {
        const skinColor = '#FFE4C4';
        const darkColor = this.darkenColor(color, 30);

        // Coat body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(-28, 65);
        ctx.lineTo(28, 65);
        ctx.lineTo(30, 0);
        ctx.quadraticCurveTo(22, -12, 0, -12);
        ctx.quadraticCurveTo(-22, -12, -30, 0);
        ctx.fill();

        // Coat opening line
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 65);
        ctx.stroke();

        // Collar
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(-15, -8);
        ctx.lineTo(-20, 15);
        ctx.lineTo(-8, 12);
        ctx.lineTo(-5, -5);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(15, -8);
        ctx.lineTo(20, 15);
        ctx.lineTo(8, 12);
        ctx.lineTo(5, -5);
        ctx.fill();

        // Fur collar detail
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            ctx.arc(-15 + i * 4, -5, 5, 0, Math.PI * 2);
        }
        ctx.fill();

        // Buttons
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(-8, 25, 4, 0, Math.PI * 2);
        ctx.arc(-8, 40, 4, 0, Math.PI * 2);
        ctx.arc(-8, 55, 4, 0, Math.PI * 2);
        ctx.fill();

        // Sleeves
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-30, 5);
        ctx.lineTo(-45, 40);
        ctx.lineTo(-35, 45);
        ctx.lineTo(-25, 15);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(30, 5);
        ctx.lineTo(45, 40);
        ctx.lineTo(35, 45);
        ctx.lineTo(25, 15);
        ctx.fill();

        // Hands with mittens
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(-42, 48, 9, 0, Math.PI * 2);
        ctx.arc(42, 48, 9, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        this.drawLegs(ctx);
    },

    drawLegs(ctx) {
        // Pants
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.moveTo(-20, 50);
        ctx.lineTo(-18, 85);
        ctx.lineTo(-5, 85);
        ctx.lineTo(-5, 50);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(20, 50);
        ctx.lineTo(18, 85);
        ctx.lineTo(5, 85);
        ctx.lineTo(5, 50);
        ctx.fill();

        // Shoes
        ctx.beginPath();
        ctx.ellipse(-12, 88, 10, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(12, 88, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    drawSuitLegs(ctx, color) {
        // Suit pants
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-20, 55);
        ctx.lineTo(-16, 90);
        ctx.lineTo(-4, 90);
        ctx.lineTo(-4, 55);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(20, 55);
        ctx.lineTo(16, 90);
        ctx.lineTo(4, 90);
        ctx.lineTo(4, 55);
        ctx.fill();

        // Shoes
        ctx.fillStyle = '#2C1810';
        ctx.beginPath();
        ctx.ellipse(-10, 93, 10, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(10, 93, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    // Utility functions
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    // Get random asset configuration
    getRandomConfig() {
        return {
            headType: Math.floor(Math.random() * 5),
            bodyType: Math.floor(Math.random() * 5),
            skinColor: this.skinColors[Math.floor(Math.random() * this.skinColors.length)],
            hairColor: this.hairColors[Math.floor(Math.random() * this.hairColors.length)],
            bodyColor: this.bodyColors[Math.floor(Math.random() * this.bodyColors.length)]
        };
    }
};
