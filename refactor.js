const fs = require('fs');

function refactorHtml(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove inline styles from bento-visual
    content = content.replace(/<div class="bento-visual bento-visual-dark" style="[^"]*">/g, '<div class="bento-visual bento-visual-dark">');
    
    // Add opening wrapper
    content = content.replace(/<div class="dash-planet-header">/g, '<div class="bento-content-wrap">\n                        <div class="dash-planet-header">');
    
    // Replace the button container and buttons
    const buttonRegex = /<div style="display: flex; gap: 8px; margin-top: 1\.5rem;">\s*<button class="btn btn-glass btn-view-code" data-code="([^"]+)" data-title="([^"]+)"[^>]*>View Code<\/button>\s*<a href="([^"]+)" download="([^"]+)" class="btn btn-glass btn-download-code"[^>]*>Download Code<\/a>\s*(<a href="[^"]+"[^>]*>BlenderKit Model<\/a>|<button disabled[^>]*>Procedural Texture<\/button>)\s*<\/div>/g;

    content = content.replace(buttonRegex, (match, py_code, py_title, py_href, py_down, third_btn_raw) => {
        let third_btn;
        if (third_btn_raw.includes("BlenderKit Model")) {
            const bk_href = third_btn_raw.match(/href="([^"]+)"/)[1];
            third_btn = `<a href="${bk_href}" target="_blank" class="btn-action btn-blenderkit">BlenderKit</a>`;
        } else {
            third_btn = `<button disabled class="btn-action">Texture Gen</button>`;
        }
            
        return `<div class="planet-actions">
                            <button class="btn-action btn-view-code" data-code="${py_code}" data-title="${py_title}">View Code</button>
                            <a href="${py_href}" download="${py_down}" class="btn-action btn-download-code">Download</a>
                            ${third_btn}
                        </div>
                    </div>`; // The last </div> closes bento-content-wrap
    });
    
    // Fix the wrapping text
    content = content.replace(/Relative Size vs Earth/g, 'Size vs Earth');
    content = content.replace(/Relative Size vs\nEarth/g, 'Size vs Earth');
    
    const styleAddition = `
        .bento-content-wrap {
            padding: 2.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .planet-actions {
            display: flex;
            gap: 10px;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.05);
            margin-top: auto; /* push to bottom */
        }
        .btn-action {
            flex: 1;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            color: var(--text-muted);
            padding: 0.75rem 0.5rem;
            border-radius: 8px;
            font-family: var(--font-mono);
            font-size: 0.75rem;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        .btn-action:hover {
            background: rgba(255,255,255,0.08);
            color: #fff;
            border-color: rgba(255,255,255,0.2);
        }
        .btn-blenderkit {
            color: #8B7FF5;
            background: rgba(139, 127, 245, 0.05);
            border-color: rgba(139, 127, 245, 0.2);
        }
        .btn-blenderkit:hover {
            background: rgba(139, 127, 245, 0.15);
            color: #fff;
            border-color: rgba(139, 127, 245, 0.4);
        }
        .btn-action:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            background: transparent;
        }
    `;
    
    if (!content.includes('.bento-content-wrap')) {
         content = content.replace('</style>', styleAddition + '\n    </style>');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
}

refactorHtml('c:/xampp_ITCP226/htdocs/MultimediaWeb/solar-system.html');
console.log("Done refactoring solar-system.html");
