import bpy
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
    print(f"Error: Object named '{obj_name}' not found. Check your spelling or outliner.")