const fs = require('fs');

const planetData = {
    'Sun': `
                            <div class="dash-data-row"><span class="dash-label">Surface Temperature</span><span class="dash-value">5,500 °C</span></div>
                            <div class="dash-data-row"><span class="dash-label">Mass vs Earth</span><span class="dash-value">330,000x</span></div>`,
    'Mercury': `
                            <div class="dash-data-row"><span class="dash-label">Surface Temp</span><span class="dash-value">-173 to 427 °C</span></div>
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">0</span></div>`,
    'Venus': `
                            <div class="dash-data-row"><span class="dash-label">Surface Temp</span><span class="dash-value">462 °C</span></div>
                            <div class="dash-data-row"><span class="dash-label">Day Length</span><span class="dash-value">243 Earth days</span></div>`,
    'Earth': `
                            <div class="dash-data-row"><span class="dash-label">Surface Temp</span><span class="dash-value">15 °C (Avg)</span></div>
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">1</span></div>`,
    'Mars': `
                            <div class="dash-data-row"><span class="dash-label">Surface Temp</span><span class="dash-value">-63 °C (Avg)</span></div>
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">2</span></div>`,
    'Jupiter': `
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">95</span></div>
                            <div class="dash-data-row"><span class="dash-label">Mass vs Earth</span><span class="dash-value">318x</span></div>`,
    'Saturn': `
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">146</span></div>
                            <div class="dash-data-row"><span class="dash-label">Rings</span><span class="dash-value">7 Main Groups</span></div>`,
    'Uranus': `
                            <div class="dash-data-row"><span class="dash-label">Surface Temp</span><span class="dash-value">-224 °C</span></div>
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">28</span></div>`,
    'Neptune': `
                            <div class="dash-data-row"><span class="dash-label">Wind Speed</span><span class="dash-value">2,100 km/h</span></div>
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">16</span></div>`,
    'Pluto': `
                            <div class="dash-data-row"><span class="dash-label">Surface Temp</span><span class="dash-value">-225 °C</span></div>
                            <div class="dash-data-row"><span class="dash-label">Moons</span><span class="dash-value">5</span></div>`
};

let content = fs.readFileSync('c:/xampp_ITCP226/htdocs/MultimediaWeb/solar-system.html', 'utf8');

// 1. Inject extra rows into each planet card
for (const [planet, rows] of Object.entries(planetData)) {
    // Regex to find the start of the data block for a specific planet, and then find the dash-bar-container
    // Since we know the structure, we can find: <h3 class="dash-planet-title">PlanetName</h3> ... <div class="dash-bar-container">
    const regex = new RegExp(`(<h3 class="dash-planet-title">${planet}<\\/h3>[\\s\\S]*?)(\\s*<div class="dash-bar-container">)`);
    
    // Check if we haven't already inserted the data to avoid duplication
    if (!content.includes(rows.trim())) {
        content = content.replace(regex, `$1${rows}$2`);
    }
}

// 2. Replace the modal HTML and JS entirely
const oldModalStart = '<!-- PLANET INFO MODAL -->';
const codeModalStart = '<!-- CODE MODAL -->';

if (content.includes(oldModalStart) && content.includes(codeModalStart)) {
    const beforeModal = content.substring(0, content.indexOf(oldModalStart));
    const afterModal = content.substring(content.indexOf(codeModalStart));

    const newModal = `<!-- PLANET INFO MODAL -->
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
                <!-- Modal Video -->
                <div class="modal-video-wrap" style="position: relative; margin-bottom: 2rem; border-radius: 16px; overflow: hidden; height: 250px; background: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <video id="modal-planet-video" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                        <source id="modal-planet-source" src="" type="video/mp4">
                    </video>
                    <button id="btn-modal-fullscreen" class="btn btn-glass" style="position: absolute; bottom: 15px; right: 15px; z-index: 10; display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; border-radius: 8px; background: rgba(10,10,15,0.7); backdrop-filter: blur(10px); color: #fff; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s ease;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        Full Screen
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let currentOpenPlanetCard = null;
            const infoModal = document.getElementById('planet-info-modal');
            const infoBody = document.getElementById('info-modal-body');
            const closeBtn = document.getElementById('close-info-modal');
            const modalVid = document.getElementById('modal-planet-video');
            const modalSource = document.getElementById('modal-planet-source');
            const modalFsBtn = document.getElementById('btn-modal-fullscreen');

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
                        
                        // Handle Video
                        const cardVideoSource = card.querySelector('video source');
                        if (cardVideoSource && modalSource && modalVid) {
                            modalSource.src = cardVideoSource.src;
                            if(cardVideoSource.type) modalSource.type = cardVideoSource.type;
                            modalVid.load();
                        }

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
                            currentOpenPlanetCard.querySelector('.bento-content-wrap').appendChild(payload);
                        }
                    }
                    if (modalVid) {
                        modalVid.pause();
                        modalSource.src = "";
                    }
                    infoModal.classList.remove('show');
                    currentOpenPlanetCard = null;
                });
                
                if (modalVid && modalFsBtn) {
                    modalFsBtn.addEventListener('click', () => {
                        if (modalVid.requestFullscreen) modalVid.requestFullscreen();
                        else if (modalVid.webkitRequestFullscreen) modalVid.webkitRequestFullscreen();
                    });
                    
                    modalFsBtn.addEventListener('mouseenter', () => modalFsBtn.style.background = 'rgba(139, 127, 245, 0.4)');
                    modalFsBtn.addEventListener('mouseleave', () => modalFsBtn.style.background = 'rgba(10,10,15,0.7)');
                    
                    const handleModalFS = () => {
                        const isFs = document.fullscreenElement === modalVid || document.webkitFullscreenElement === modalVid;
                        modalVid.controls = isFs;
                        modalVid.muted = !isFs;
                    };
                    document.addEventListener('fullscreenchange', handleModalFS);
                    document.addEventListener('webkitfullscreenchange', handleModalFS);
                }
            }
        });
    </script>
    `;

    content = beforeModal + newModal + afterModal;
}

fs.writeFileSync('c:/xampp_ITCP226/htdocs/MultimediaWeb/solar-system.html', content, 'utf8');
console.log("Successfully injected extra planet data and video modal logic.");
