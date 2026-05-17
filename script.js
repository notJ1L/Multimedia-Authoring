/* jshint esversion: 6 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.main-nav a').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href') || '';
        if (!href.startsWith('#')) {
            return;
        }

        event.preventDefault();
        const targetId = href.slice(1);
        if (!targetId) {
            return;
        }

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

document.querySelectorAll('.topic-button[data-url]').forEach((button) => {
    button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        if (!url) {
            return;
        }

        window.location.href = url;
    });
});

const revealItems = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add('visible'));
} else {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 80, 420)}ms`;
        revealObserver.observe(item);
    });
}

const orbs = document.querySelectorAll('.bg-orb');

if (!prefersReducedMotion && orbs.length > 0) {
    window.addEventListener('pointermove', (event) => {
        const xRatio = (event.clientX / window.innerWidth - 0.5) * 2;
        const yRatio = (event.clientY / window.innerHeight - 0.5) * 2;

        orbs.forEach((orb, index) => {
            const strength = (index + 1) * 8;
            const x = xRatio * strength;
            const y = yRatio * strength;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

const ageCalculatorForm = document.querySelector('[data-age-calculator-form]');
const ageCalculatorResults = document.querySelector('[data-age-calculator-results]');

if (ageCalculatorForm && ageCalculatorResults) {
    const earthYearsInput = ageCalculatorForm.elements.namedItem('earth-years');
    const planetYears = [
        { name: 'Mercury', orbitalPeriod: 0.2408467 },
        { name: 'Venus', orbitalPeriod: 0.61519726 },
        { name: 'Earth', orbitalPeriod: 1 },
        { name: 'Mars', orbitalPeriod: 1.8808158 },
        { name: 'Jupiter', orbitalPeriod: 11.862615 },
        { name: 'Saturn', orbitalPeriod: 29.447498 },
        { name: 'Uranus', orbitalPeriod: 84.016846 },
        { name: 'Neptune', orbitalPeriod: 164.79132 },
        { name: 'Pluto', orbitalPeriod: 248 }
    ];

    const formatAge = (value) => {
        if (!Number.isFinite(value)) {
            return '0';
        }

        if (value >= 1000) {
            return value.toFixed(0);
        }

        if (value >= 100) {
            return value.toFixed(1);
        }

        if (value >= 1) {
            return value.toFixed(2);
        }

        if (value >= 0.01) {
            return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
        }

        return '<0.01';
    };

    const renderAges = () => {
        if (!(earthYearsInput instanceof HTMLInputElement)) {
            return;
        }

        const earthYears = Number(earthYearsInput.value);
        const normalizedEarthYears = Number.isFinite(earthYears) && earthYears >= 0 ? earthYears : 0;

        ageCalculatorResults.innerHTML = planetYears
            .map((planet) => {
                const planetAge = normalizedEarthYears / planet.orbitalPeriod;

                return `
                    <article class="age-result-card">
                        <h3>${planet.name}</h3>
                        <p><strong>${formatAge(planetAge)}</strong> ${planet.name} years</p>
                    </article>
                `;
            })
            .join('');
    };

    ageCalculatorForm.addEventListener('submit', (event) => {
        event.preventDefault();
        renderAges();
    });

    if (earthYearsInput instanceof HTMLInputElement) {
        earthYearsInput.addEventListener('input', renderAges);
    }
    renderAges();
}

// Code Modal Logic
const codeModal = document.getElementById('code-modal');
const modalTitle = document.getElementById('modal-title');
const modalCodeBlock = document.getElementById('modal-code-block');
const modalClose = document.querySelector('.modal-close');
const modalDownload = document.querySelector('.modal-download');
let activeCodeFilename = '';
let activeCodeContent = '';

const downloadTextFile = (filename, content) => {
    if (!filename || !content) {
        return;
    }

    const fileBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const fileUrl = URL.createObjectURL(fileBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = fileUrl;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(fileUrl);
};

const getPythonFilename = (codeUrl) => {
    if (!codeUrl) {
        return 'code.py';
    }

    const parts = codeUrl.split('/');
    return parts[parts.length - 1] || 'code.py';
};

const pythonCodeScripts = {
    'Python Code/SunPython.py': `import bpy
import math

# ==========================================
# 1. THE SPIN (Targeting "The Sun")
# ==========================================
sun_name = "The Sun"
sun = bpy.data.objects.get(sun_name)

if sun is not None:
    sun.animation_data_clear() # Reset previous animation
    
    # Frame 1: 0 degrees
    sun.rotation_euler[2] = 0  
    sun.keyframe_insert(data_path="rotation_euler", index=2, frame=1)
    
    # Frame 250: 360 degrees
    sun.rotation_euler[2] = math.radians(360)
    sun.keyframe_insert(data_path="rotation_euler", index=2, frame=250)
    
    # Make rotation linear and infinite
    if sun.animation_data and sun.animation_data.action:
        action = sun.animation_data.action
        
        # --- BLENDER 5.0+ COMPATIBILITY FIX ---
        if hasattr(action, "fcurves"):
            fcurves = action.fcurves
        else:
            from bpy_extras import anim_utils
            bag = anim_utils.action_get_channelbag_for_slot(action, sun.animation_data.action_slot)
            fcurves = bag.fcurves if bag else []
            
        for fcurve in fcurves:
            if fcurve.data_path == 'rotation_euler':
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'LINEAR'
                mod = fcurve.modifiers.new(type='CYCLES')
                mod.mode_before = 'REPEAT'
                mod.mode_after = 'REPEAT'
                
    print(f"Spin applied to '{sun_name}'.")
else:
    print(f"Error: Could not find '{sun_name}'.")

# ==========================================
# 2. THE FLARE (Targeting "Flare")
# ==========================================
flare_name = "Flare"
flare = bpy.data.objects.get(flare_name)

if flare is not None:
    flare.animation_data_clear() # Reset previous animation
    
    # Frame 1: Hidden / Flat against the surface
    flare.scale = (0.1, 0.1, 0.1) 
    flare.keyframe_insert(data_path="scale", frame=1)

    # Frame 60: Eruption (Shoots outward)
    flare.scale = (1.5, 1.5, 1.5) 
    flare.keyframe_insert(data_path="scale", frame=60)

    # Frame 120: Retracts back into the sun
    flare.scale = (0.1, 0.1, 0.1)
    flare.keyframe_insert(data_path="scale", frame=120)

    # Make the eruption cycle infinitely
    if flare.animation_data and flare.animation_data.action:
        action = flare.animation_data.action
        
        # --- BLENDER 5.0+ COMPATIBILITY FIX ---
        if hasattr(action, "fcurves"):
            fcurves = action.fcurves
        else:
            from bpy_extras import anim_utils
            bag = anim_utils.action_get_channelbag_for_slot(action, flare.animation_data.action_slot)
            fcurves = bag.fcurves if bag else []

        for fcurve in fcurves:
            if fcurve.data_path == 'scale':
                mod = fcurve.modifiers.new(type='CYCLES')
                mod.mode_before = 'REPEAT'
                mod.mode_after = 'REPEAT'
                
    print(f"Eruption applied to '{flare_name}'.")
else:
    print(f"Error: Could not find '{flare_name}'.")

print("All animations applied! Press Spacebar to play.")`,

    'Python Code/MercuryPython.py': `import bpy
import math

# ==========================================
# 1. CLEAN UP THE SCENE
# ==========================================
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
bpy.ops.object.delete()

# ==========================================
# 2. CREATE THE MERCURY OBJECT
# ==========================================
bpy.ops.mesh.primitive_uv_sphere_add(
    segments=128, 
    ring_count=64, 
    radius=5.0, 
    location=(0, 0, 0)
)
mercury = bpy.context.active_object
mercury.name = "Mercury_Model"
bpy.ops.object.shade_smooth()

# ==========================================
# 3. CREATE MATERIAL & BUMP NODES
# ==========================================
mat = bpy.data.materials.new(name="Mercury_Mat")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links

nodes.clear() # Clear default nodes

# Output Node
out_node = nodes.new('ShaderNodeOutputMaterial')
out_node.location = (400, 0)

# Principled BSDF
bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.location = (100, 0)
# Make it very rough so it looks like dry, dusty rock (not shiny)
bsdf.inputs['Roughness'].default_value = 0.9 

# Image Texture Node
tex_color = nodes.new('ShaderNodeTexImage')
tex_color.location = (-500, 0)
tex_color.label = "LOAD YOUR MERCURY MAP HERE"

# Bump Node (This makes the craters look 3D!)
bump = nodes.new('ShaderNodeBump')
bump.location = (-150, -250)
bump.inputs['Strength'].default_value = 0.6
bump.inputs['Distance'].default_value = 0.2

# Connect Everything
links.new(tex_color.outputs['Color'], bsdf.inputs['Base Color'])
# Route the image into the bump node to generate height data
links.new(tex_color.outputs['Color'], bump.inputs['Height'])
links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])

links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])

# Assign Material
if len(mercury.data.materials) == 0:
    mercury.data.materials.append(mat)
else:
    mercury.data.materials[0] = mat

# ==========================================
# 4. ANIMATE THE ROTATION
# ==========================================
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 250
mercury.rotation_mode = 'XYZ'

# Temporarily change default interpolation to LINEAR
original_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

# Insert keyframes
bpy.context.scene.frame_set(1)
mercury.rotation_euler = (0, 0, 0)
mercury.keyframe_insert(data_path="rotation_euler", index=2, frame=1)

bpy.context.scene.frame_set(250)
mercury.rotation_euler = (0, 0, math.radians(360))
mercury.keyframe_insert(data_path="rotation_euler", index=2, frame=250)

# Restore original settings
bpy.context.preferences.edit.keyframe_new_interpolation_type = original_interp
bpy.context.scene.frame_set(1)

print("Mercury model created!")`,

    'Python Code/VenusPython.py': `import bpy
import math

# ==========================================
# 1. CLEAN UP THE SCENE
# ==========================================
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
bpy.ops.object.delete()

# ==========================================
# 2. CREATE THE VENUS OBJECT
# ==========================================
bpy.ops.mesh.primitive_uv_sphere_add(
    segments=128, 
    ring_count=64, 
    radius=5.0, 
    location=(0, 0, 0)
)
venus = bpy.context.active_object
venus.name = "Venus_Model"
bpy.ops.object.shade_smooth()

# ==========================================
# 3. CREATE MATERIAL & TEXTURE NODES
# ==========================================
mat = bpy.data.materials.new(name="Venus_Mat")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links

nodes.clear() # Clear default nodes

# Output Node
out_node = nodes.new('ShaderNodeOutputMaterial')
out_node.location = (300, 0)

# Principled BSDF
bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.location = (0, 0)
# Venus's clouds are somewhat smooth but not like glass
bsdf.inputs['Roughness'].default_value = 0.5 

# Image Texture Node
tex_color = nodes.new('ShaderNodeTexImage')
tex_color.location = (-300, 0)
tex_color.label = "LOAD YOUR VENUS MAP HERE"

# Connect Everything
links.new(tex_color.outputs['Color'], bsdf.inputs['Base Color'])
links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])

# Assign Material
if len(venus.data.materials) == 0:
    venus.data.materials.append(mat)
else:
    venus.data.materials[0] = mat

# ==========================================
# 4. ANIMATE THE ROTATION
# ==========================================
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 250
venus.rotation_mode = 'XYZ'

# Temporarily change default interpolation to LINEAR
original_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

# Insert keyframes
bpy.context.scene.frame_set(1)
venus.rotation_euler = (0, 0, 0)
venus.keyframe_insert(data_path="rotation_euler", index=2, frame=1)

bpy.context.scene.frame_set(250)
venus.rotation_euler = (0, 0, math.radians(360))
venus.keyframe_insert(data_path="rotation_euler", index=2, frame=250)

# Restore original settings
bpy.context.preferences.edit.keyframe_new_interpolation_type = original_interp
bpy.context.scene.frame_set(1)

print("Venus model created!")`,

    'Python Code/EarthPythno.py': `import bpy
import math

# Target the parent Empty object named "Earth"
target_name = "Earth"
earth = bpy.data.objects.get(target_name)

if earth is not None:
    earth.animation_data_clear() # Reset previous animation
    
    # --- Frame 1: 0 degrees ---
    earth.rotation_euler[2] = 0  
    earth.keyframe_insert(data_path="rotation_euler", index=2, frame=1)
    
    # --- Frame 250: 360 degrees ---
    earth.rotation_euler[2] = math.radians(360)
    earth.keyframe_insert(data_path="rotation_euler", index=2, frame=250)
    
    # --- Make rotation linear and infinite ---
    if earth.animation_data and earth.animation_data.action:
        action = earth.animation_data.action
        
        # Blender 5.0+ API for Slotted Actions
        if hasattr(action, "fcurves"):
            fcurves = action.fcurves
        else:
            from bpy_extras import anim_utils
            bag = anim_utils.action_get_channelbag_for_slot(action, earth.animation_data.action_slot)
            fcurves = bag.fcurves if bag else []

        for fcurve in fcurves:
            if fcurve.data_path == 'rotation_euler':
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'LINEAR'
                
                # Infinite loop modifier
                mod = fcurve.modifiers.new(type='CYCLES')
                mod.mode_before = 'REPEAT'
                mod.mode_after = 'REPEAT'
                
    print(f"Success! Spin script applied to '{target_name}'. Press Spacebar to play.")
else:
    print(f"Error: Could not find an object named '{target_name}'.")`,

    'Python Code/MarsPython.py': `import bpy
import math

# Target the object named "Mars" as seen in your Outliner
obj_name = "Mars"
mars_obj = bpy.data.objects.get(obj_name)

if mars_obj is not None:
    # Ensure the rotation mode matches the XYZ Euler shown in your properties panel
    mars_obj.rotation_mode = 'XYZ'

    start_frame = 1
    end_frame = 250

    # Clear existing animation data to prevent overlapping keyframes
    if mars_obj.animation_data:
        mars_obj.animation_data_clear()

    # --- THE FIX ---
    # Store your current default interpolation preference so we can restore it later
    user_pref_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
    
    # Temporarily force Blender to create any new keyframes as LINEAR
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

    # Set Frame 1: 0 degrees on the Z-axis
    mars_obj.rotation_euler[2] = 0
    mars_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    # Set Frame 250: 360 degrees (converted to radians) on the Z-axis
    mars_obj.rotation_euler[2] = math.radians(360)
    mars_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    # Restore your original preference (usually 'BEZIER') so we don't mess up your workflow
    bpy.context.preferences.edit.keyframe_new_interpolation_type = user_pref_interp

    print(f"Success: 360-degree rotation animation added to '{obj_name}'.")

else:
    print(f"Error: Object named '{obj_name}' not found.")`,

    'Python Code/JupiterPython.py': `import bpy
import math

# Target the object named "Jupiter" as seen in your Outliner
obj_name = "Jupiter"
jupiter_obj = bpy.data.objects.get(obj_name)

if jupiter_obj is not None:
    # Ensure the rotation mode matches the XYZ Euler
    jupiter_obj.rotation_mode = 'XYZ'

    start_frame = 1
    end_frame = 250

    # Clear existing animation data to prevent overlapping keyframes
    if jupiter_obj.animation_data:
        jupiter_obj.animation_data_clear()

    # Store your current default interpolation preference so we can restore it later
    user_pref_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
    
    # Temporarily force Blender to create any new keyframes as LINEAR for a smooth spin
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

    # Set Frame 1: 0 degrees on the Z-axis
    jupiter_obj.rotation_euler[2] = 0
    jupiter_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    # Set Frame 250: 360 degrees (converted to radians) on the Z-axis
    jupiter_obj.rotation_euler[2] = math.radians(360)
    jupiter_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    # Restore your original preference so we don't mess up your workflow
    bpy.context.preferences.edit.keyframe_new_interpolation_type = user_pref_interp

    print(f"Success: 360-degree rotation animation added to '{obj_name}'.")

else:
    print(f"Error: Object named '{obj_name}' not found. Check your spelling or outliner.")`,

    'Python Code/SaturnPython.py': `import bpy
import math

# Target the parent object named "Saturn"
obj_name = "Saturn"
saturn_obj = bpy.data.objects.get(obj_name)

if saturn_obj is not None:
    # Ensure the rotation mode matches the XYZ Euler
    saturn_obj.rotation_mode = 'XYZ'

    start_frame = 1
    end_frame = 250

    # Clear existing animation data to prevent overlapping keyframes
    if saturn_obj.animation_data:
        saturn_obj.animation_data_clear()

    # Store your current default interpolation preference
    user_pref_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
    
    # Temporarily force Blender to create any new keyframes as LINEAR for a smooth spin
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

    # Set Frame 1: 0 degrees on the Z-axis
    saturn_obj.rotation_euler[2] = 0
    saturn_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    # Set Frame 250: 360 degrees (converted to radians) on the Z-axis
    saturn_obj.rotation_euler[2] = math.radians(360)
    saturn_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    # Restore your original preference
    bpy.context.preferences.edit.keyframe_new_interpolation_type = user_pref_interp

    print(f"Success: 360-degree rotation animation added to '{obj_name}'.")

else:
    print(f"Error: Object named '{obj_name}' not found. Check your spelling or outliner.")`,

    'Python Code/UranusPython.py': `import bpy
import math

# Target the light rig object. 
# Based on your screenshots, "LightDirection" is the one you want to spin.
obj_name = "LightDirection" 
light_obj = bpy.data.objects.get(obj_name)

if light_obj is not None:
    # Ensure the rotation mode matches the XYZ Euler
    light_obj.rotation_mode = 'XYZ'

    start_frame = 1
    end_frame = 250

    # Clear existing animation data on the light to prevent overlapping keyframes
    if light_obj.animation_data:
        light_obj.animation_data_clear()

    # Store your current default interpolation preference
    user_pref_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
    
    # Temporarily force Blender to create any new keyframes as LINEAR for a smooth orbit
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

    # Set Frame 1: 0 degrees on the Z-axis
    light_obj.rotation_euler[2] = 0
    light_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    # Set Frame 250: 360 degrees (converted to radians) on the Z-axis. 
    # Change 360 to a negative number (e.g., -360) if you want it to orbit the other way!
    light_obj.rotation_euler[2] = math.radians(360)
    light_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    # Restore your original preference
    bpy.context.preferences.edit.keyframe_new_interpolation_type = user_pref_interp

    print(f"Success: 360-degree light orbit animation added to '{obj_name}'.")

else:
    print(f"Error: Object named '{obj_name}' not found. Check your spelling or outliner.")`,

    'Python Code/NeptunePython.py': `import bpy
import math

# Target the parent object named "Neptune" as seen in your Outliner
obj_name = "Neptune"
neptune_obj = bpy.data.objects.get(obj_name)

if neptune_obj is not None:
    # Ensure the rotation mode matches the XYZ Euler
    neptune_obj.rotation_mode = 'XYZ'

    start_frame = 1
    end_frame = 250

    # Clear existing animation data to prevent overlapping keyframes
    if neptune_obj.animation_data:
        neptune_obj.animation_data_clear()

    # Store your current default interpolation preference so we can restore it later
    user_pref_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
    
    # Temporarily force Blender to create any new keyframes as LINEAR for a smooth spin
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

    # Set Frame 1: 0 degrees on the Z-axis
    neptune_obj.rotation_euler[2] = 0
    neptune_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    # Set Frame 250: 360 degrees (converted to radians) on the Z-axis
    neptune_obj.rotation_euler[2] = math.radians(360)
    neptune_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    # Restore your original preference so we don't mess up your workflow
    bpy.context.preferences.edit.keyframe_new_interpolation_type = user_pref_interp

    print(f"Success: 360-degree rotation animation added to '{obj_name}'.")

else:
    print(f"Error: Object named '{obj_name}' not found. Check your spelling or outliner.")`,

    'Python Code/PlutoPython.py': `import bpy
import math

# ---------------------------------------------------------
# 1. CLEANUP: Remove old Pluto and Sun if we run this twice
# ---------------------------------------------------------
for obj_name in ["Pluto", "Pluto_Sun"]:
    if obj_name in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[obj_name], do_unlink=True)

# ---------------------------------------------------------
# 2. CREATE THE PLANET MESH
# ---------------------------------------------------------
# Create a high-res sphere so the shadows look smooth
bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=1, location=(0, 0, 0))
pluto = bpy.context.active_object
pluto.name = "Pluto"
bpy.ops.object.shade_smooth() # Make it smooth!

# ---------------------------------------------------------
# 3. CREATE THE PROCEDURAL TEXTURE (No images needed!)
# ---------------------------------------------------------
mat_name = "Pluto_Surface"
if mat_name in bpy.data.materials:
    bpy.data.materials.remove(bpy.data.materials[mat_name])

mat = bpy.data.materials.new(name=mat_name)
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links

# Clear default nodes
for node in nodes:
    nodes.remove(node)

# Create standard output and Principled BSDF
output = nodes.new(type='ShaderNodeOutputMaterial')
output.location = (400, 0)
principled = nodes.new(type='ShaderNodeBsdfPrincipled')
principled.location = (100, 0)
principled.inputs['Roughness'].default_value = 0.75 # Rocky and dry

# Create Noise Texture to generate the rocky/icy patterns
noise = nodes.new(type='ShaderNodeTexNoise')
noise.location = (-500, 0)
noise.inputs['Scale'].default_value = 2.5
noise.inputs['Detail'].default_value = 15.0
noise.inputs['Roughness'].default_value = 0.65

# Create ColorRamp to assign Pluto's actual colors to the noise
color_ramp = nodes.new(type='ShaderNodeValToRGB')
color_ramp.location = (-200, 0)
color_ramp.color_ramp.elements[0].position = 0.35
color_ramp.color_ramp.elements[0].color = (0.15, 0.08, 0.06, 1.0) # Dark reddish brown
color_ramp.color_ramp.elements[1].position = 0.55
color_ramp.color_ramp.elements[1].color = (0.5, 0.35, 0.25, 1.0)  # Dusty tan
# Add a third color stop for the icy pale patches
color_ramp.color_ramp.elements.new(0.7)
color_ramp.color_ramp.elements[2].color = (0.8, 0.75, 0.7, 1.0)   # Pale ice

# Create Bump Map to fake 3D craters using the noise data
bump = nodes.new(type='ShaderNodeBump')
bump.location = (-200, -300)
bump.inputs['Strength'].default_value = 0.15 # Keep it subtle so shadows don't break
bump.inputs['Distance'].default_value = 0.2

# Link the material nodes together
links.new(noise.outputs['Fac'], color_ramp.inputs['Fac'])
links.new(noise.outputs['Fac'], bump.inputs['Height'])
links.new(color_ramp.outputs['Color'], principled.inputs['Base Color'])
links.new(bump.outputs['Normal'], principled.inputs['Normal'])
links.new(principled.outputs['BSDF'], output.inputs['Surface'])

# Assign the material to the Pluto sphere
if pluto.data.materials:
    pluto.data.materials[0] = mat
else:
    pluto.data.materials.append(mat)

# ---------------------------------------------------------
# 4. ADD LIGHTING
# ---------------------------------------------------------
# Create a harsh, distant sun to match deep space
light_data = bpy.data.lights.new(name="Pluto_Sun_Light", type='SUN')
light_data.energy = 3.0
light_data.angle = math.radians(2.0) # Slightly soft shadows to avoid terminator noise!

light_obj = bpy.data.objects.new(name="Pluto_Sun", object_data=light_data)
bpy.context.collection.objects.link(light_obj)
light_obj.location = (5, -5, 2)
# Angle the sun at the planet
light_obj.rotation_euler = (math.radians(60), 0, math.radians(45)) 

# ---------------------------------------------------------
# 5. ANIMATE THE ROTATION
# ---------------------------------------------------------
pluto.rotation_mode = 'XYZ'
start_frame = 1
end_frame = 250

user_pref_interp = bpy.context.preferences.edit.keyframe_new_interpolation_type
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'

pluto.rotation_euler[2] = 0
pluto.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

pluto.rotation_euler[2] = math.radians(360)
pluto.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

bpy.context.preferences.edit.keyframe_new_interpolation_type = user_pref_interp

print("Success: Procedural Pluto with Textures, Lighting, and Animation generated!")`
};

const getPythonCode = (codeUrl) => pythonCodeScripts[codeUrl] || '# Code not found for this planet.';

if (codeModal && modalTitle && modalCodeBlock && modalClose) {
    document.querySelectorAll('.btn-view-code').forEach(button => {
        button.addEventListener('click', () => {
            const codeUrl = button.getAttribute('data-code');
            const title = button.getAttribute('data-title');

            if (codeUrl && title) {
                modalTitle.textContent = title;

                activeCodeFilename = getPythonFilename(codeUrl);
                activeCodeContent = getPythonCode(codeUrl);
                modalCodeBlock.textContent = activeCodeContent;

                codeModal.classList.add('show');
                codeModal.setAttribute('aria-hidden', 'false');
            }
        });
    });

    document.querySelectorAll('.btn-download-code').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();

            const codeUrl = button.getAttribute('href') || button.getAttribute('data-code');
            if (!codeUrl) {
                return;
            }

            const fileName = getPythonFilename(codeUrl);
            downloadTextFile(fileName, getPythonCode(codeUrl));
        });
    });

    const closeModal = () => {
        codeModal.classList.remove('show');
        codeModal.setAttribute('aria-hidden', 'true');
    };

    modalClose.addEventListener('click', closeModal);

    if (modalDownload) {
        modalDownload.addEventListener('click', () => {
            if (!activeCodeFilename || !activeCodeContent) {
                return;
            }

            downloadTextFile(activeCodeFilename, activeCodeContent);
        });
    }

    codeModal.addEventListener('click', (event) => {
        if (event.target === codeModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && codeModal.classList.contains('show')) {
            closeModal();
        }
    });
}