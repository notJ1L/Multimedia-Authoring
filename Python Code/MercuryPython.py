import bpy
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

print("Mercury model created!")