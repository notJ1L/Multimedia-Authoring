import re

def refactor_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add <div class="bento-content-wrap"> after the bento-visual div
    # Find the closing tag of bento-visual and the dash-planet-header
    # Wait, it's easier to just do text replacement.
    
    # Remove inline styles from bento-visual
    content = re.sub(r'<div class="bento-visual bento-visual-dark" style="[^"]*">', r'<div class="bento-visual bento-visual-dark">', content)
    
    # Add opening wrapper
    content = content.replace('<div class="dash-planet-header">', '<div class="bento-content-wrap">\n                        <div class="dash-planet-header">')
    
    # Replace the button container and buttons
    # I need to replace the <div style="display: flex; gap: 8px; margin-top: 1.5rem;"> up to its closing </div>
    # and also close the bento-content-wrap div.
    
    button_regex = re.compile(
        r'<div style="display: flex; gap: 8px; margin-top: 1.5rem;">\s*<button class="btn btn-glass btn-view-code" data-code="([^"]+)" data-title="([^"]+)"[^>]*>View Code</button>\s*<a href="([^"]+)" download="([^"]+)" class="btn btn-glass btn-download-code"[^>]*>Download Code</a>\s*(<a href="[^"]+"[^>]*>BlenderKit Model</a>|<button disabled[^>]*>Procedural Texture</button>)\s*</div>',
        re.MULTILINE
    )

    def replace_buttons(match):
        py_code = match.group(1)
        py_title = match.group(2)
        py_href = match.group(3)
        py_down = match.group(4)
        third_btn_raw = match.group(5)
        
        if "BlenderKit Model" in third_btn_raw:
            bk_href = re.search(r'href="([^"]+)"', third_btn_raw).group(1)
            third_btn = f'<a href="{bk_href}" target="_blank" class="btn-action btn-blenderkit">BlenderKit</a>'
        else:
            third_btn = f'<button disabled class="btn-action">Texture Gen</button>'
            
        return f'''<div class="planet-actions">
                            <button class="btn-action btn-view-code" data-code="{py_code}" data-title="{py_title}">View Code</button>
                            <a href="{py_href}" download="{py_down}" class="btn-action btn-download-code">Download</a>
                            {third_btn}
                        </div>
                    </div>'''

    content = button_regex.sub(replace_buttons, content)
    
    # Fix the wrapping text
    content = content.replace('Relative Size vs Earth', 'Size vs Earth')
    content = content.replace('Relative Size vs\nEarth', 'Size vs Earth') # just in case
    
    # Add styles to the <style> block
    style_addition = """
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
    """
    
    content = content.replace('</style>', style_addition + '\n    </style>')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

refactor_html('c:/xampp_ITCP226/htdocs/MultimediaWeb/solar-system.html')
print("Done refactoring solar-system.html")
