import bpy
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
    print(f"Error: Object named '{obj_name}' not found.") 