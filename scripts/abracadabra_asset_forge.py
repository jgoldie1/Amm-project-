#!/usr/bin/env python3
"""Abracadabra Asset Forge: dependency-free procedural GLB starter for StreetVerse.

Generates lightweight, deterministic glTF 2.0 binary assets. This is a geometry
fallback, not a likeness generator, rigging tool, or replacement for original art.
Usage: python3 scripts/abracadabra_asset_forge.py --output /tmp/streetverse-forge
"""
import argparse
import json
import math
import os
import struct

PALETTE = {
    "tree": [(0.28, 0.17, 0.09, 1), (0.08, 0.40, 0.18, 1)],
    "building": [(0.37, 0.42, 0.48, 1), (0.13, 0.22, 0.34, 1)],
    "car": [(0.12, 0.34, 0.75, 1), (0.12, 0.17, 0.22, 1)],
    "npc": [(0.43, 0.25, 0.16, 1), (0.12, 0.25, 0.50, 1)],
}
ASSETS = ["tree", "building", "car", "npc"]


def cube(center, size):
    x, y, z = center
    a, b, c = [v / 2 for v in size]
    return [(x + dx*a, y + dy*b, z + dz*c) for dx, dy, dz in
            [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),
             (-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]], [
        0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,
        1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]


def make_asset(kind):
    if kind == "tree":
        return [((0,1,0),(.36,2,.36),0), ((0,2.6,0),(2.1,2.1,2.1),1)]
    if kind == "building":
        return [((0,2.8,0),(3,5.6,3),0), ((0,5.7,0),(3.25,.25,3.25),1)]
    if kind == "car":
        return [((0,.65,0),(2.5,.75,4.1),0), ((0,1.25,-.2),(1.85,.8,2),1)]
    return [((0,1,0),(.7,1.15,.4),1), ((0,1.95,0),(.55,.55,.55),0),
            ((-.2,.3,0),(.22,.75,.28),1), ((.2,.3,0),(.22,.75,.28),1)]


def glb(kind):
    positions, indices, groups = [], [], []
    for center, size, material in make_asset(kind):
        verts, tris = cube(center, size)
        offset = len(positions)
        positions.extend(verts)
        start = len(indices)
        indices.extend([offset + i for i in tris])
        groups.append((start, len(tris), material))
    vertices = b"".join(struct.pack("<3f", *v) for v in positions)
    faces = b"".join(struct.pack("<H", i) for i in indices)
    binary = vertices + faces
    binary += b"\x00" * ((-len(binary)) % 4)
    mins = [min(v[i] for v in positions) for i in range(3)]
    maxs = [max(v[i] for v in positions) for i in range(3)]
    doc = {
        "asset": {"version":"2.0","generator":"TRYAMM Abracadabra Asset Forge v1"},
        "scene":0, "scenes":[{"nodes":[0]}], "nodes":[{"mesh":0,"name":kind}],
        "materials":[{"pbrMetallicRoughness":{"baseColorFactor":list(c),"metallicFactor":0,"roughnessFactor":.85},
                      "doubleSided":True} for c in PALETTE[kind]],
        "buffers":[{"byteLength":len(binary)}],
        "bufferViews":[{"buffer":0,"byteOffset":0,"byteLength":len(vertices),"target":34962},
                       {"buffer":0,"byteOffset":len(vertices),"byteLength":len(faces),"target":34963}],
        "accessors":[{"bufferView":0,"componentType":5126,"count":len(positions),"type":"VEC3",
                      "min":mins,"max":maxs}],
        "meshes":[{"primitives":[]}],
    }
    for start, count, mat in groups:
        doc["accessors"].append({"bufferView":1,"byteOffset":start*2,"componentType":5123,
                                  "count":count,"type":"SCALAR"})
        doc["meshes"][0]["primitives"].append({"attributes":{"POSITION":0},
                                                "indices":len(doc["accessors"])-1,"material":mat})
    js = json.dumps(doc,separators=(",",":")).encode()
    js += b" " * ((-len(js)) % 4)
    length = 12 + 8 + len(js) + 8 + len(binary)
    return (struct.pack("<4sII",b"glTF",2,length) +
            struct.pack("<I4s",len(js),b"JSON") + js +
            struct.pack("<I4s",len(binary),b"BIN\x00") + binary)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output",default="amm-omniverse/public/streetverse/forge")
    p.add_argument("--asset",choices=ASSETS+["all"],default="all")
    args=p.parse_args()
    os.makedirs(args.output,exist_ok=True)
    kinds=ASSETS if args.asset=="all" else [args.asset]
    for kind in kinds:
        path=os.path.join(args.output,kind+".glb")
        data=glb(kind)
        with open(path,"wb") as f:
            f.write(data)
        assert data[:4]==b"glTF" and struct.unpack_from("<I",data,8)[0]==len(data)
        print(f"{path}: {len(data)} bytes")


if __name__=="__main__":
    main()
