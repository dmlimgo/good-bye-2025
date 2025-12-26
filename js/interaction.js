/**
 * Interaction - Mouse and touch event handling
 */

const Interaction = {
    // State
    isDragging: false,
    isPanning: false,
    draggedCharacter: null,
    hoveredCharacter: null,

    // Mouse/touch position
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,

    // Click detection
    clickStartTime: 0,
    clickThreshold: 200, // ms
    moveThreshold: 10, // pixels

    init(canvas) {
        this.canvas = canvas;

        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
        canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // Touch events
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Prevent context menu on long press
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    // Get world coordinates from screen coordinates
    getWorldPos(screenX, screenY) {
        return CanvasRenderer.screenToWorld(screenX, screenY);
    },

    // Mouse events
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = this.getWorldPos(screenX, screenY);

        this.lastX = screenX;
        this.lastY = screenY;
        this.startX = screenX;
        this.startY = screenY;
        this.clickStartTime = Date.now();

        // Check if clicking on a character
        const character = CharacterManager.getCharacterAt(worldPos.x, worldPos.y);

        if (character) {
            this.isDragging = true;
            this.draggedCharacter = character;
            character.startDrag();
            CharacterManager.bringToFront(character);
            this.canvas.style.cursor = 'grabbing';
        } else {
            // Start panning
            this.isPanning = true;
            this.canvas.style.cursor = 'grabbing';
        }
    },

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = this.getWorldPos(screenX, screenY);

        const dx = screenX - this.lastX;
        const dy = screenY - this.lastY;

        if (this.isDragging && this.draggedCharacter) {
            // Move character
            this.draggedCharacter.drag(worldPos.x, worldPos.y);
        } else if (this.isPanning) {
            // Pan the view
            CanvasRenderer.pan(dx, dy);
        } else {
            // Hover detection
            const character = CharacterManager.getCharacterAt(worldPos.x, worldPos.y);

            if (character !== this.hoveredCharacter) {
                if (this.hoveredCharacter) {
                    this.hoveredCharacter.setHovered(false);
                }
                if (character) {
                    character.setHovered(true);
                    this.canvas.style.cursor = 'pointer';
                } else {
                    this.canvas.style.cursor = 'grab';
                }
                this.hoveredCharacter = character;
            }
        }

        this.lastX = screenX;
        this.lastY = screenY;
    },

    onMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        const timeDiff = Date.now() - this.clickStartTime;
        const moveDist = Math.sqrt(
            Math.pow(screenX - this.startX, 2) +
            Math.pow(screenY - this.startY, 2)
        );

        // Check if it was a click (short duration, small movement)
        if (timeDiff < this.clickThreshold && moveDist < this.moveThreshold) {
            this.onClick(screenX, screenY);
        }

        if (this.isDragging && this.draggedCharacter) {
            this.draggedCharacter.endDrag();
            CharacterManager.resetDepth(this.draggedCharacter);
        }

        this.isDragging = false;
        this.isPanning = false;
        this.draggedCharacter = null;
        this.canvas.style.cursor = this.hoveredCharacter ? 'pointer' : 'grab';
    },

    onMouseLeave(e) {
        if (this.isDragging && this.draggedCharacter) {
            this.draggedCharacter.endDrag();
            CharacterManager.resetDepth(this.draggedCharacter);
        }

        if (this.hoveredCharacter) {
            this.hoveredCharacter.setHovered(false);
            this.hoveredCharacter = null;
        }

        this.isDragging = false;
        this.isPanning = false;
        this.draggedCharacter = null;
        this.canvas.style.cursor = 'grab';
    },

    onClick(screenX, screenY) {
        const worldPos = this.getWorldPos(screenX, screenY);
        const character = CharacterManager.getCharacterAt(worldPos.x, worldPos.y);

        if (character) {
            const message = CharacterManager.getRandomMessage();
            character.showMessage(message);
        }
    },

    onWheel(e) {
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        const delta = -e.deltaY * 0.001;
        CanvasRenderer.zoom(delta, screenX, screenY);
    },

    // Touch events
    onTouchStart(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            // Single touch - same as mouse down
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const screenX = touch.clientX - rect.left;
            const screenY = touch.clientY - rect.top;
            const worldPos = this.getWorldPos(screenX, screenY);

            this.lastX = screenX;
            this.lastY = screenY;
            this.startX = screenX;
            this.startY = screenY;
            this.clickStartTime = Date.now();

            const character = CharacterManager.getCharacterAt(worldPos.x, worldPos.y);

            if (character) {
                this.isDragging = true;
                this.draggedCharacter = character;
                character.startDrag();
                CharacterManager.bringToFront(character);
            } else {
                this.isPanning = true;
            }
        } else if (e.touches.length === 2) {
            // Pinch zoom start
            this.isPinching = true;
            this.initialPinchDistance = this.getPinchDistance(e.touches);
            this.initialScale = CanvasRenderer.scale;
            this.pinchCenter = this.getPinchCenter(e.touches);
        }
    },

    onTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && !this.isPinching) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const screenX = touch.clientX - rect.left;
            const screenY = touch.clientY - rect.top;
            const worldPos = this.getWorldPos(screenX, screenY);

            const dx = screenX - this.lastX;
            const dy = screenY - this.lastY;

            if (this.isDragging && this.draggedCharacter) {
                this.draggedCharacter.drag(worldPos.x, worldPos.y);
            } else if (this.isPanning) {
                CanvasRenderer.pan(dx, dy);
            }

            this.lastX = screenX;
            this.lastY = screenY;
        } else if (e.touches.length === 2 && this.isPinching) {
            // Pinch zoom
            const currentDistance = this.getPinchDistance(e.touches);
            const scale = currentDistance / this.initialPinchDistance;
            const newScale = this.initialScale * scale;
            const delta = (newScale / CanvasRenderer.scale) - 1;

            const center = this.getPinchCenter(e.touches);
            const rect = this.canvas.getBoundingClientRect();
            CanvasRenderer.zoom(delta, center.x - rect.left, center.y - rect.top);
        }
    },

    onTouchEnd(e) {
        if (e.touches.length === 0) {
            const timeDiff = Date.now() - this.clickStartTime;

            // Check for tap
            if (timeDiff < this.clickThreshold && this.draggedCharacter) {
                const message = CharacterManager.getRandomMessage();
                this.draggedCharacter.showMessage(message);
            }

            if (this.isDragging && this.draggedCharacter) {
                this.draggedCharacter.endDrag();
                CharacterManager.resetDepth(this.draggedCharacter);
            }

            this.isDragging = false;
            this.isPanning = false;
            this.isPinching = false;
            this.draggedCharacter = null;
        } else if (e.touches.length === 1) {
            // Transitioned from pinch to single touch
            this.isPinching = false;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.lastX = touch.clientX - rect.left;
            this.lastY = touch.clientY - rect.top;
            this.isPanning = true;
        }
    },

    getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    getPinchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }
};
