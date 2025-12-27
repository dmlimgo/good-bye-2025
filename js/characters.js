// Character system - handles character creation and movement

const Characters = {
    container: null,
    members: [],
    awards: [],
    characters: [],
    isAnimating: false,
    animationFrame: null,
    bounds: { left: 0, right: 0, top: 0, bottom: 0 },

    // Performance settings
    updateInterval: 50, // Update every 50ms (20fps) for smooth bounce
    lastUpdateTime: 0,
    maxActiveMovers: 5, // Only 5 characters move at a time

    async init() {
        this.container = document.getElementById('characters-container');
        if (!this.container) return;

        // Load data
        const [membersData, awardsData] = await Promise.all([
            Utils.loadJSON('data/members.json'),
            Utils.loadJSON('data/awards.json')
        ]);

        if (membersData) this.members = membersData.members;
        if (awardsData) this.awards = awardsData.awards;

        // Wait for layout to complete before calculating bounds
        await this.waitForLayout();

        // Calculate bounds (audience area)
        this.updateBounds();
        window.addEventListener('resize', () => {
            this.updateBounds();
            this.repositionCharacters();
        });

        // Create characters
        this.createCharacters();
    },

    async waitForLayout() {
        // Wait until container has valid dimensions (with timeout)
        return new Promise(resolve => {
            let attempts = 0;
            const maxAttempts = 30; // ~500ms max wait

            const check = () => {
                const rect = this.container.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    // Timeout - use fallback bounds
                    resolve();
                } else {
                    attempts++;
                    requestAnimationFrame(check);
                }
            };
            requestAnimationFrame(check);
        });
    },

    repositionCharacters() {
        // Update character positions on resize
        if (!this.characters.length) return;

        this.characters.forEach((character, index) => {
            const x = Utils.clamp(character.x, this.bounds.left, this.bounds.right);
            const y = Utils.clamp(character.y, this.bounds.top, this.bounds.bottom);
            character.x = x;
            character.y = y;
            character.targetX = x;
            character.targetY = y;
            this.updateCharacterPosition(character);
        });
    },

    updateBounds() {
        // Get characters container bounds
        if (this.container) {
            const rect = this.container.getBoundingClientRect();
            // Check if container has valid dimensions
            if (rect.width > 0 && rect.height > 0) {
                this.bounds = {
                    left: 10,
                    right: rect.width - 60,
                    top: 10,
                    bottom: rect.height - 70
                };
                return;
            }
        }

        // Fallback: calculate based on viewport and layout percentages
        const containerWidth = Math.min(window.innerWidth, 430);
        const containerHeight = window.innerHeight;
        // audience-area is flex:1, estimate its height
        const audienceHeight = containerHeight * 0.5; // approximate

        this.bounds = {
            left: 10,
            right: containerWidth - 60,
            top: 10,
            bottom: audienceHeight - 70
        };
    },

    createCharacters() {
        this.container.innerHTML = '';
        this.characters = [];

        // Create award lookup map
        const awardMap = new Map();
        this.awards.forEach(award => {
            awardMap.set(award.id, award.title);
        });

        // Shuffle members for random positioning
        const shuffledMembers = Utils.shuffle([...this.members]);

        shuffledMembers.forEach((member, index) => {
            const character = this.createCharacter(member, awardMap.get(member.id), index);
            this.characters.push(character);
            this.container.appendChild(character.element);
        });

        // Start animation
        this.startAnimation();
    },

    createCharacter(member, status, index) {
        // Create DOM element
        const el = document.createElement('div');
        el.className = 'character';
        el.dataset.id = member.id;

        // Status badge (if has award)
        if (status) {
            const statusEl = document.createElement('div');
            statusEl.className = 'character-status';
            statusEl.textContent = `<${status}>`;
            el.appendChild(statusEl);
        }

        // Name
        const nameEl = document.createElement('div');
        nameEl.className = 'character-name';
        nameEl.textContent = member.name;
        el.appendChild(nameEl);

        // Avatar
        const avatarEl = document.createElement('img');
        avatarEl.className = 'character-avatar';
        avatarEl.src = `assets/avatar/${member.id}.png`;
        avatarEl.alt = member.name;
        avatarEl.loading = 'lazy';
        el.appendChild(avatarEl);
        el._avatarEl = avatarEl;  // Store reference for direction flip

        // Calculate initial position (spread across audience area)
        const totalMembers = this.members.length;
        const cols = Math.min(8, Math.ceil(Math.sqrt(totalMembers * 1.5)));
        const rows = Math.ceil(totalMembers / cols);
        const col = index % cols;
        const row = Math.floor(index / cols);

        const areaWidth = this.bounds.right - this.bounds.left;
        const areaHeight = this.bounds.bottom - this.bounds.top;

        const cellWidth = areaWidth / cols;
        const cellHeight = areaHeight / rows;

        // Center each character in its cell with small random offset
        const centerX = this.bounds.left + col * cellWidth + cellWidth / 2;
        const centerY = this.bounds.top + row * cellHeight + cellHeight / 2;

        const offsetX = Utils.random(-cellWidth * 0.3, cellWidth * 0.3);
        const offsetY = Utils.random(-cellHeight * 0.3, cellHeight * 0.3);

        const x = Utils.clamp(centerX + offsetX, this.bounds.left, this.bounds.right);
        const y = Utils.clamp(centerY + offsetY, this.bounds.top, this.bounds.bottom);

        // Character state
        const character = {
            element: el,
            member: member,
            status: status,
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            moveTimer: Utils.random(3000, 6000),
            pauseTimer: Utils.random(3000, 5000),
            isPaused: true,
            isMoving: false,
            lastX: x,
            lastY: y,
            bouncePhase: Utils.random(0, Math.PI * 2),
            bounceOffset: 0,
            facingRight: false  // Default facing left
        };

        // Apply initial position
        this.updateCharacterPosition(character);

        // Add click handler
        el.addEventListener('click', () => this.onCharacterClick(character));

        return character;
    },

    updateCharacterPosition(character) {
        // Use transform for GPU acceleration
        character.element.style.transform = `translate(${character.x}px, ${character.y}px)`;
        character.lastX = character.x;
        character.lastY = character.y;
    },

    onCharacterClick(character) {
        // Bounce effect on click using scale
        character.element.style.transform = `translate(${character.x}px, ${character.y}px) scale(1.15)`;

        setTimeout(() => {
            character.element.style.transform = `translate(${character.x}px, ${character.y}px)`;
        }, 150);

        // Show toast with member info
        let message = character.member.name;
        if (character.status) {
            message += ` - ${character.status}`;
        }
        Utils.showToast(message);
    },

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.lastUpdateTime = performance.now();
        this.animate();
    },

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    },

    animate() {
        if (!this.isAnimating) return;

        const now = performance.now();
        const elapsed = now - this.lastUpdateTime;

        // Only update every updateInterval ms (100ms = 10fps for logic)
        if (elapsed >= this.updateInterval) {
            this.lastUpdateTime = now;

            // Count active movers
            let activeMovers = 0;

            this.characters.forEach(character => {
                this.updateCharacter(character, elapsed, activeMovers);
                if (character.isMoving) activeMovers++;
            });
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    updateCharacter(character, deltaTime, currentActiveMovers) {
        // Bouncing animation (always active)
        character.bouncePhase += 0.03;
        character.bounceOffset = Math.sin(character.bouncePhase) * 2;

        // Handle pause state
        if (character.isPaused) {
            character.pauseTimer -= deltaTime;
            if (character.pauseTimer <= 0) {
                // Only start moving if under max active movers
                if (currentActiveMovers < this.maxActiveMovers) {
                    character.isPaused = false;
                    character.isMoving = true;
                    character.moveTimer = Utils.random(3000, 6000);
                    this.setNewTarget(character);
                } else {
                    // Wait a bit more
                    character.pauseTimer = Utils.random(1000, 2000);
                }
            }
        } else {
            character.moveTimer -= deltaTime;

            // Move towards target
            const dx = character.targetX - character.x;
            const dy = character.targetY - character.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                const speed = 0.5;
                character.x += dx * speed * (deltaTime / 1000);
                character.y += dy * speed * (deltaTime / 1000);
            }

            // Check if movement time is up or reached target
            if (character.moveTimer <= 0 || dist <= 1) {
                character.isPaused = true;
                character.isMoving = false;
                character.pauseTimer = Utils.random(3000, 5000);
            }
        }

        // Update DOM with bounce offset
        const displayY = character.y + character.bounceOffset;
        if (Math.abs(character.x - character.lastX) > 0.3 ||
            Math.abs(displayY - character.lastY) > 0.3) {
            character.element.style.transform = `translate(${character.x}px, ${displayY}px)`;
            // Flip only avatar based on direction
            const avatarEl = character.element._avatarEl;
            if (avatarEl) {
                avatarEl.style.transform = character.facingRight ? 'scaleX(-1)' : 'scaleX(1)';
            }
            character.lastX = character.x;
            character.lastY = displayY;
        }
    },

    setNewTarget(character) {
        // Movement range
        const moveRange = 70;
        let newX = character.x + Utils.random(-moveRange, moveRange);
        let newY = character.y + Utils.random(-moveRange / 2, moveRange / 2);

        // Clamp to bounds
        newX = Utils.clamp(newX, this.bounds.left, this.bounds.right);
        newY = Utils.clamp(newY, this.bounds.top, this.bounds.bottom);

        // Set facing direction based on movement
        if (newX > character.x) {
            character.facingRight = true;
        } else if (newX < character.x) {
            character.facingRight = false;
        }

        character.targetX = newX;
        character.targetY = newY;
    },

    // Pause all character animations (when not on stage page)
    pause() {
        this.isAnimating = false;
    },

    // Resume character animations
    resume() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.lastTime = performance.now();
            this.animate();
        }
    }
};

// Make Characters available globally
window.Characters = Characters;
