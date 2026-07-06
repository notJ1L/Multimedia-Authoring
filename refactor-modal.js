const fs = require('fs');

function refactorHtml(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add clickable-planet-card to .bento-half
    content = content.replace(/class="bento-card bento-half/g, 'class="bento-card bento-half clickable-planet-card');

    // 2. Wrap .planet-data and .planet-actions inside .planet-details-payload
    // The structure is:
    // <div class="planet-data">...</div>
    // <div class="planet-actions">...</div>
    // </div> (this closes bento-content-wrap)
    // </div> (this closes bento-card)
    
    // We want to insert <div class="planet-details-payload" style="display: none;"> before <div class="planet-data">
    // and </div> after <div class="planet-actions">...</div>
    
    const blockRegex = /(<div class="planet-data">[\s\S]*?<div class="planet-actions">[\s\S]*?<\/div>\s*)(<\/div>\s*<\/div>)/g;
    
    content = content.replace(blockRegex, (match, innerContent, closers) => {
        return `<div class="planet-details-payload" style="display: none;">\n${innerContent}</div>\n${closers}`;
    });

    // 3. Add the Modal HTML and JS at the end of the file, before the Code Modal
    const modalHtml = `
    <!-- PLANET INFO MODAL -->
    <div id="planet-info-modal" class="modal" aria-hidden="true">
        <div class="modal-content" style="max-width: 600px; height: auto; max-height: 90vh;">
            <div class="modal-header">
                <div style="display: flex; flex-direction: column;">
                    <h3 id="info-modal-title" style="margin-bottom: 0.2rem;">Planet</h3>
                    <p id="info-modal-subtitle" style="color: var(--text-muted); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;"></p>
                </div>
                <div style="flex: 1;"></div>
                <button class="modal-btn modal-close" id="close-info-modal" aria-label="Close modal">Close</button>
            </div>
            <div class="modal-body" id="info-modal-body" style="padding: 2rem; background: var(--bg-dark);">
                <!-- Details get injected here -->
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let currentOpenPlanetCard = null;
            const infoModal = document.getElementById('planet-info-modal');
            const infoBody = document.getElementById('info-modal-body');
            const closeBtn = document.getElementById('close-info-modal');

            if (infoModal && infoBody && closeBtn) {
                document.querySelectorAll('.clickable-planet-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        // Ignore if clicking on buttons inside payload
                        if (e.target.closest('.planet-details-payload')) return;
                        
                        currentOpenPlanetCard = card;
                        const title = card.querySelector('.dash-planet-title').textContent;
                        const subtitle = card.querySelector('.dash-planet-subtitle').textContent;
                        const payload = card.querySelector('.planet-details-payload');
                        
                        document.getElementById('info-modal-title').textContent = title;
                        document.getElementById('info-modal-subtitle').textContent = subtitle;
                        
                        payload.style.display = 'block';
                        infoBody.appendChild(payload);
                        
                        infoModal.classList.add('show');
                    });
                });

                closeBtn.addEventListener('click', () => {
                    if (currentOpenPlanetCard) {
                        const payload = infoBody.querySelector('.planet-details-payload');
                        if (payload) {
                            payload.style.display = 'none';
                            // Put it back inside the bento-content-wrap
                            currentOpenPlanetCard.querySelector('.bento-content-wrap').appendChild(payload);
                        }
                    }
                    infoModal.classList.remove('show');
                    currentOpenPlanetCard = null;
                });
            }
        });
    </script>
    `;

    if (!content.includes('planet-info-modal')) {
        content = content.replace('<!-- CODE MODAL -->', modalHtml + '\n    <!-- CODE MODAL -->');
    }

    // 4. Inject styles for the clickable cards
    const styleAddition = `
        .clickable-planet-card {
            cursor: pointer;
        }
        .clickable-planet-card .bento-content-wrap {
            padding: 1.5rem;
            align-items: center;
            justify-content: center;
        }
        .clickable-planet-card .dash-planet-header {
            margin-bottom: 0;
            text-align: center;
        }
        .clickable-planet-card .dash-planet-subtitle {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }
        .clickable-planet-card:hover {
            border-color: rgba(139, 127, 245, 0.4);
            box-shadow: 0 30px 60px rgba(139, 127, 245, 0.2);
        }
        
        /* Modal specific styling for payload */
        #info-modal-body .planet-data {
            background: rgba(255,255,255,0.02);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.05);
            margin-bottom: 0;
        }
        #info-modal-body .planet-actions {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
        }
    `;

    if (!content.includes('.clickable-planet-card {')) {
        content = content.replace('</style>', styleAddition + '\n    </style>');
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

refactorHtml('c:/xampp_ITCP226/htdocs/MultimediaWeb/solar-system.html');
console.log("Done refactoring solar-system.html for clickable cards");
