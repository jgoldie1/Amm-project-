"""Offline reconstruction of the archived LaTeasia textured mesh (numpy required)."""
import hashlib
import json
import struct
from pathlib import Path

import numpy as np

directory = Path(__file__).resolve().parents[1] / "public/tryamm-assets/meshy/characters"
source = (directory / "LaTeasia_Monroe_Textured_Seven_Motion_Recovery.glb").read_bytes()
if hashlib.sha256(source).hexdigest() != "e5799b3daf6ebb26cd12c6f7a7f5ba9c4a3c6711d4a6e00eeb9a2263d27762fa":
    raise ValueError("Unexpected source mesh")
length = struct.unpack_from("<I", source, 12)[0]
original = json.loads(source[20:20 + length])
binary = source[28 + length:]
doc = {k: original[k] for k in ("materials", "textures", "images", "samplers") if k in original}
doc.update(asset={"version": "2.0", "generator": "TRYAMM LaTeasia full-body repair"}, bufferViews=[], accessors=[])
output = bytearray()


def view(data):
    output.extend(bytes((-len(output)) % 4))
    doc["bufferViews"].append(dict(buffer=0, byteOffset=len(output), byteLength=len(data)))
    output.extend(data)
    return len(doc["bufferViews"]) - 1


def original_view(index):
    item = original["bufferViews"][index]
    start = item.get("byteOffset", 0)
    return binary[start:start + item["byteLength"]]


def array(index):
    item = original["accessors"][index]
    dtype = {5123: "<u2", 5125: "<u4", 5126: "<f4"}[item["componentType"]]
    width = {"VEC2": 2, "VEC3": 3, "SCALAR": 1}[item["type"]]
    return np.frombuffer(original_view(item["bufferView"]), dtype, item["count"] * width,
                         item.get("byteOffset", 0)).reshape(-1, width)


def accessor(values, kind, dtype="<f4", bounds=False):
    values = np.asarray(values, dtype=dtype)
    item = dict(bufferView=view(values.tobytes()), type=kind, count=len(values),
                componentType={"<u2": 5123, "<u4": 5125, "<f4": 5126}[dtype])
    if bounds:
        item.update(min=values.min(axis=0).tolist(), max=values.max(axis=0).tolist())
    doc["accessors"].append(item)
    return len(doc["accessors"]) - 1


for image in doc["images"]:
    image["bufferView"] = view(original_view(image["bufferView"]))

primitive = original["meshes"][0]["primitives"][0]
attrs = primitive["attributes"]
# Undo the lean and turn the original side-facing mesh toward the game's +Z.
c, s = np.cos(.27), np.sin(.27)
basis = np.array([[0, 0, -1], [s, c, 0], [c, -s, 0]])
points = array(attrs["POSITION"]) @ basis.T
bones, centers, parents = [], [], []


def bone(name, parent, xyz):
    parents.append(bones.index(parent) if parent else -1)
    bones.append(name)
    centers.append(np.array(xyz))


bone("Hips", None, (0, .84, -.01))
bone("Spine", "Hips", (0, 1.00, -.03))
bone("Chest", "Spine", (0, 1.19, -.02))
bone("Neck", "Chest", (0, 1.40, -.01))
bone("Head", "Neck", (0, 1.48, 0))
for side, sign in (("Left", 1), ("Right", -1)):
    for label, parent, x, y, z in [
        ("Shoulder", "Chest", .06, 1.34, 0), ("Arm", side+"Shoulder", .176, 1.32, .015),
        ("ForeArm", side+"Arm", .286, 1.09, .07), ("Hand", side+"ForeArm", .35, .92, .125),
        ("UpLeg", "Hips", .10, .84, 0), ("Leg", side+"UpLeg", .14, .48, .008),
        ("Foot", side+"Leg", .155, .13, -.045), ("ToeBase", side+"Foot", .16, .045, .05)
    ]:
        bone(side+label, parent, (sign*x, y, z))

nodes, influence = [], []
for i, (name, start, parent) in enumerate(zip(bones, centers, parents)):
    children = [k for k, p in enumerate(parents) if p == i]
    node = dict(name=name, translation=(start - centers[parent] if parent >= 0 else start).tolist())
    if children:
        node["children"] = children
    nodes.append(node)
    if name.endswith("Hand"):
        end = start + [.015 * np.sign(start[0]), -.11, .01]
    elif name == "Head":
        end = start + [0, .20, 0]
    elif name.endswith("ToeBase"):
        end = start + [0, -.015, .06]
    else:
        end = centers[children[0]]
    axis = end - start
    t = np.clip((points-start) @ axis / (axis @ axis), .10, .90)
    delta = points - (start + t[:, None] * axis)
    distance = np.linalg.norm(delta, axis=1)
    influence.append(1 / (.035 + distance) ** 6)

scores = np.array(influence).T
joints = np.argsort(-scores, axis=1)[:, :4]
weights = np.take_along_axis(scores, joints, axis=1)
weights /= weights.sum(axis=1, keepdims=True)
inverse = np.repeat(np.eye(4)[None], len(bones), axis=0)
inverse[:, 3, :3] = -np.array(centers)  # glTF matrices are column-major.
doc["skins"] = [dict(joints=list(range(len(bones))), skeleton=0,
                     inverseBindMatrices=accessor(inverse, "MAT4"))]
indices = array(primitive["indices"])
doc["meshes"] = [dict(name="LaTeasia textured body", primitives=[dict(
    indices=accessor(indices, "SCALAR", "<u4" if indices.max()>65535 else "<u2"),
    material=primitive["material"], attributes=dict(
        POSITION=accessor(points, "VEC3", bounds=True), NORMAL=accessor(array(attrs["NORMAL"]) @ basis.T, "VEC3"),
        TEXCOORD_0=accessor(array(attrs["TEXCOORD_0"]), "VEC2"),
        JOINTS_0=accessor(joints, "VEC4", "<u2"), WEIGHTS_0=accessor(weights, "VEC4")))]
)]
nodes.append(dict(name="LaTeasia", mesh=0, skin=0))
doc.update(nodes=nodes, scenes=[dict(nodes=[0, len(bones)])], scene=0, animations=[])

# Local joint rotations in degrees. Cyclic clips close on the same key pose.
def clip(name, duration, motions):
    times = np.linspace(0, duration, 9)
    clock = accessor(times[:, None], "SCALAR", bounds=True)
    channels, samplers = [], []
    for joint, (axis, angles) in motions.items():
        angles = np.interp(times/duration, np.linspace(0, 1, len(angles)), angles)
        half = np.deg2rad(angles) / 2
        rotations = np.zeros((len(times), 4))
        rotations[:, axis] = np.sin(half)
        rotations[:, 3] = np.cos(half)
        channels.append(dict(sampler=len(samplers), target=dict(node=bones.index(joint), path="rotation")))
        samplers.append(dict(input=clock, output=accessor(rotations,"VEC4"), interpolation="LINEAR"))
    doc["animations"].append(dict(name=name, channels=channels, samplers=samplers))


clip("Idle", 3, {"Chest": (0,[0,2,0]), "Head": (1,[0,3,0])})
for name, seconds, stride in [("Walk", 1.12, 24), ("Run", .72, 42), ("Limp", 1.45, 13)]:
    motion = {"Hips": (1,[0,4,0,-4,0]), "Chest": (1,[0,-3,0,3,0])}
    for side, sign in (("Left", 1), ("Right", -1)):
        phase = np.array([-1,0,1,0,-1])*sign
        if name == "Limp" and side == "Left":
            phase = phase * .4
        motion[side+"UpLeg"] = (0, phase*stride)
        motion[side+"Arm"] = (0, -phase*stride*.65)
        motion[side+"Leg"] = (0, np.maximum(phase,0)*stride*1.3)
        motion[side+"ForeArm"] = (0, -12 + phase*8)
        motion[side+"Foot"] = (0, -phase*9)
    clip(name, seconds, motion)
clip("Wave", 1.5, {"RightArm": (2,[0,-125,-125,0]), "RightForeArm": (2,[0,-24,10,-24,0])})
clip("TalkGesture", 1.6, {"LeftForeArm": (0,[0,-54,-18,0]), "Head": (0,[0,7,0])})
clip("HeadNod", 1, {"Head": (0,[0,12,0])})
clip("SalonStyle", 2, {side+"ForeArm": (0,[0,-72,-52,0]) for side in ("Right","Left")})
clip("Sit", 1, {side+joint: (0,[angle,angle]) for side in ("Left","Right") for joint,angle in [("UpLeg",-77),("Leg",81)]})
clip("Jump", .7, {side+joint: (0,[0,angle,0]) for side in ("Left","Right") for joint,angle in [("UpLeg",-37),("Leg",60),("Arm",-32)]})
doc["buffers"] = [dict(byteLength=len(output))]
header = json.dumps(doc, separators=(",",":")).encode()
header += b" " * (-len(header)%4)
output.extend(bytes(-len(output)%4))
target = directory / "LaTeasia_Monroe_Full_Body.glb"
target.write_bytes(struct.pack("<4sII", b"glTF", 2, 28+len(header)+len(output)) +
                   struct.pack("<I4s",len(header),b"JSON")+header+
                   struct.pack("<I4s",len(output),b"BIN\0")+output)
