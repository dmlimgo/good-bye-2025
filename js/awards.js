// Awards module

const Awards = {
    awardsList: [],

    // Initialize
    async init() {
        await this.loadAwards();
        this.setupEventListeners();
    },

    // Load awards (from assets/awards folder)
    async loadAwards() {
        // Try to load from a manifest file or use defaults
        // In a real scenario, you'd have a JSON manifest of award images

        // Default placeholder awards
        this.awardsList = [
            { id: 1, title: '최우수상', image: 'assets/awards/award1.png', recipient: '열이' },
            { id: 2, title: '우수상', image: 'assets/awards/award2.png', recipient: '감자' },
            { id: 3, title: '노력상', image: 'assets/awards/award3.png', recipient: '태수' },
            { id: 4, title: '인기상', image: 'assets/awards/award4.png', recipient: '복길이' },
            { id: 5, title: '유머상', image: 'assets/awards/award5.png', recipient: '함수' },
            { id: 6, title: '팀워크상', image: 'assets/awards/award6.png', recipient: '벤' },
            { id: 7, title: '성장상', image: 'assets/awards/award7.png', recipient: '필로' },
            { id: 8, title: '창의상', image: 'assets/awards/award8.png', recipient: '양갱' },
            { id: 9, title: '열정상', image: 'assets/awards/award9.png', recipient: '마크' }
        ];

        // Try to load from JSON file if exists
        try {
            const response = await fetch('data/awards.json');
            if (response.ok) {
                const data = await response.json();
                if (data.awards && data.awards.length > 0) {
                    this.awardsList = data.awards;
                }
            }
        } catch (error) {
            // Use defaults
            console.log('Using default awards list');
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Close buttons
        document.querySelectorAll('#awards-popup .close-btn, #award-detail-popup .close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const popup = e.target.closest('.popup');
                this.hidePopup(popup.id);
            });
        });

        // Overlay clicks
        document.querySelectorAll('#awards-popup .popup-overlay, #award-detail-popup .popup-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const popup = e.target.closest('.popup');
                this.hidePopup(popup.id);
            });
        });
    },

    // Show awards popup
    showAwardsPopup() {
        this.renderAwards();
        this.showPopup('awards-popup');
    },

    // Render awards grid
    renderAwards() {
        const grid = document.getElementById('awards-grid');
        grid.innerHTML = '';

        this.awardsList.forEach(award => {
            const item = document.createElement('div');
            item.className = 'award-item';
            item.dataset.id = award.id;

            // Try to load actual image, fallback to placeholder
            const img = new Image();
            img.src = award.image;

            img.onload = () => {
                item.innerHTML = `<img src="${award.image}" alt="${award.title}">`;
            };

            img.onerror = () => {
                // Show placeholder
                item.innerHTML = `
                    <div class="award-placeholder">
                        <span>${award.title}</span>
                        <small style="margin-top: 5px; font-size: 0.7rem;">${award.recipient}</small>
                    </div>
                `;
            };

            // Initially show placeholder while loading
            item.innerHTML = `
                <div class="award-placeholder">
                    <span>${award.title}</span>
                    <small style="margin-top: 5px; font-size: 0.7rem;">${award.recipient}</small>
                </div>
            `;

            item.addEventListener('click', () => {
                this.showAwardDetail(award);
            });

            grid.appendChild(item);
        });
    },

    // Show award detail
    showAwardDetail(award) {
        const detailImg = document.getElementById('award-detail-img');

        // Check if image exists
        const img = new Image();
        img.src = award.image;

        img.onload = () => {
            detailImg.src = award.image;
            detailImg.alt = award.title;
            this.showPopup('award-detail-popup');
        };

        img.onerror = () => {
            // Show generated certificate
            this.showGeneratedCertificate(award);
        };
    },

    // Show generated certificate if no image
    showGeneratedCertificate(award) {
        const popup = document.getElementById('award-detail-popup');
        const content = popup.querySelector('.popup-content');

        // Store original content
        if (!content.dataset.originalContent) {
            content.dataset.originalContent = content.innerHTML;
        }

        content.innerHTML = `
            <div class="generated-certificate">
                <div class="certificate-border">
                    <div class="certificate-inner">
                        <div class="certificate-header">
                            <span class="trophy-icon">&#127942;</span>
                            <h2>상 장</h2>
                        </div>
                        <div class="certificate-body">
                            <h3 class="award-title">${award.title}</h3>
                            <p class="recipient-name">${award.recipient}</p>
                            <p class="award-message">
                                위 사람은 2025년 한 해 동안<br>
                                뛰어난 활약을 보여주어<br>
                                이 상을 수여합니다.
                            </p>
                        </div>
                        <div class="certificate-footer">
                            <p class="date">2025년 12월</p>
                            <div class="seal">&#128308;</div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="close-btn">닫기</button>
        `;

        // Add certificate styles
        this.addCertificateStyles();

        // Re-attach close button listener
        content.querySelector('.close-btn').addEventListener('click', () => {
            // Restore original content
            content.innerHTML = content.dataset.originalContent;
            this.hidePopup('award-detail-popup');
            this.setupEventListeners();
        });

        this.showPopup('award-detail-popup');
    },

    // Add certificate styles dynamically
    addCertificateStyles() {
        if (document.getElementById('certificate-styles')) return;

        const style = document.createElement('style');
        style.id = 'certificate-styles';
        style.textContent = `
            .generated-certificate {
                background: #f9f6f0;
                padding: 20px;
                border-radius: 10px;
            }
            .certificate-border {
                border: 8px double #c9a227;
                padding: 20px;
                background: linear-gradient(135deg, #fffef9 0%, #faf6e8 100%);
            }
            .certificate-inner {
                text-align: center;
                padding: 30px;
            }
            .certificate-header {
                margin-bottom: 20px;
            }
            .trophy-icon {
                font-size: 3rem;
                display: block;
                margin-bottom: 10px;
            }
            .certificate-header h2 {
                font-family: 'Jua', serif;
                font-size: 2.5rem;
                color: #8B4513;
                margin: 0;
            }
            .certificate-body {
                margin: 30px 0;
            }
            .award-title {
                font-family: 'Jua', sans-serif;
                font-size: 1.8rem;
                color: #c9a227;
                margin-bottom: 20px;
            }
            .recipient-name {
                font-family: 'Jua', sans-serif;
                font-size: 2.2rem;
                color: #333;
                margin-bottom: 25px;
                border-bottom: 2px solid #c9a227;
                display: inline-block;
                padding: 0 20px 5px;
            }
            .award-message {
                font-family: 'Noto Sans KR', sans-serif;
                font-size: 1rem;
                color: #555;
                line-height: 2;
            }
            .certificate-footer {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .date {
                font-family: 'Noto Sans KR', sans-serif;
                color: #666;
            }
            .seal {
                font-size: 2.5rem;
                opacity: 0.7;
            }
            .award-detail-content .generated-certificate {
                max-width: 500px;
                margin: 0 auto;
            }
        `;
        document.head.appendChild(style);
    },

    // Show popup
    showPopup(id) {
        const popup = document.getElementById(id);
        popup.classList.remove('hidden');
    },

    // Hide popup
    hidePopup(id) {
        const popup = document.getElementById(id);
        popup.classList.add('hidden');
    }
};
