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

print("Venus model created!")