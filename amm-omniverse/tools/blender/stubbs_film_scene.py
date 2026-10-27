"""Stubbs AI Film Engine: isolated Blender scene builder.
Run explicitly: blender --background --python tools/blender/stubbs_film_scene.py -- input.json output.blend
Never downloads assets, executes arbitrary input, overwrites source objects or publishes content.
"""
import bpy, json, sys, pathlib, math

def build(spec_path, output_path):
    spec=json.loads(pathlib.Path(spec_path).read_text(encoding="utf-8"))
    if spec.get("schema")!=1: raise ValueError("Unsupported scene schema")
    scene_id=str(spec.get("scene_id",""))
    if not scene_id or len(scene_id)>80: raise ValueError("Invalid scene ID")
    shots=spec.get("shots",[])
    if not isinstance(shots,list) or not 1<=len(shots)<=32: raise ValueError("Provide 1-32 camera shots")
    # Only primitive geometry and bounded values, never arbitrary Python or imported models.
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.ops.mesh.primitive_plane_add(size=30)
    floor=bpy.context.object
    floor.name="StubbsPrevisFloor"
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,1))
    marker=bpy.context.object;marker.name="ActorBlockingMarker"
    marker.scale=(0.6,0.6,2)
    for i,shot in enumerate(shots):
        pos=shot.get("position",[5,-8,4]);target=shot.get("target",[0,0,1])
        if not isinstance(pos,list) or not isinstance(target,list) or len(pos)!=3 or len(target)!=3: raise ValueError("Camera vectors need 3 numbers")
        if any(not isinstance(n,(float,int)) or not math.isfinite(n) or abs(n)>1000 for n in pos+target): raise ValueError("Camera vectors out of bounds")
        bpy.ops.object.camera_add(location=pos)
        camera=bpy.context.object
        camera.name="StubbsShot_%02d"%(i+1)
        direction=__import__('mathutils').Vector(target)-camera.location
        if direction.length<0.001: raise ValueError("Camera must not coincide with target")
        camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
        if i==0:bpy.context.scene.camera=camera
    bpy.ops.object.light_add(type='AREA',location=(1,-4,7))
    bpy.context.object.data.energy=750
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.render.resolution_x=1280
    scene.render.resolution_y=720
    scene.render.resolution_percentage=50
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath='//stubbs-previs.png'
    scene["stubbs_scene_id"]=scene_id
    output=pathlib.Path(output_path).resolve()
    if output.suffix.lower()!='.blend':raise ValueError("Output must be .blend")
    output.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(output))

if __name__=="__main__":
    if '--' not in sys.argv or len(sys.argv[sys.argv.index('--')+1:])!=2:raise SystemExit("Usage: blender --background --python script -- scene.json output.blend")
    args=sys.argv[sys.argv.index('--')+1:]
    build(*args)
