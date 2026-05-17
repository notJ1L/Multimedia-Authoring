import bpy
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
    print(f"Error: Could not find an object named '{target_name}'.")