"""StreetVerse Blender 5.2 LTS GLB export helper.

Run from Blender, for example:

blender asset.blend --background \
  --python tools/blender/export_streetverse_glb.py -- \
  --asset-id player-default \
  --output public/assets/streetverse/characters/player-default.glb \
  --rights-status ORIGINAL \
  --source "TRYAMM original Blender source" \
  --commercial-use \
  --derivative-use

The helper exports selected objects to GLB and writes a neighboring
`.asset.json` provenance manifest. The manifest is review evidence only: it
never changes StreetVerse's authoritative asset-rights registry and therefore
cannot bypass production clearance.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

import bpy


ALLOWED_RIGHTS = {"ORIGINAL", "LICENSED", "PUBLIC_DOMAIN", "PENDING_REVIEW"}
EXPORT_SCHEMA = "tryamm.streetverse.blender-export.v1"


def parse_args() -> argparse.Namespace:
    argv = sys.argv
    argv = argv[argv.index("--") + 1 :] if "--" in argv else []
    parser = argparse.ArgumentParser(description="Export a StreetVerse-ready GLB from Blender")
    parser.add_argument("--asset-id", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--rights-status", required=True, choices=sorted(ALLOWED_RIGHTS))
    parser.add_argument("--source", required=True, help="Human-readable source/provenance description")
    parser.add_argument("--creator", default="")
    parser.add_argument("--license-name", default="")
    parser.add_argument("--license-reference", default="")
    parser.add_argument("--proof-reference", default="")
    parser.add_argument("--commercial-use", action="store_true")
    parser.add_argument("--derivative-use", action="store_true")
    parser.add_argument(
        "--all-visible",
        action="store_true",
        help="Export all visible renderable objects instead of the current selection",
    )
    return parser.parse_args(argv)


def finite_transform(obj: bpy.types.Object) -> bool:
    values = (
        *obj.location,
        *obj.rotation_euler,
        *obj.scale,
    )
    return all(math.isfinite(float(value)) for value in values)


def triangle_count(objects: list[bpy.types.Object]) -> int:
    triangles = 0
    for obj in objects:
        if obj.type != "MESH" or obj.data is None:
            continue
        mesh = obj.data
        mesh.calc_loop_triangles()
        triangles += len(mesh.loop_triangles)
    return triangles


def main() -> None:
    args = parse_args()
    output = Path(args.output).expanduser().resolve()
    if output.suffix.lower() != ".glb":
        raise SystemExit("StreetVerse Blender exports must use the .glb extension")

    scene = bpy.context.scene
    if scene.unit_settings.system != "METRIC" or not math.isclose(scene.unit_settings.scale_length, 1.0, rel_tol=0.0, abs_tol=1e-6):
        raise SystemExit("StreetVerse source scenes must use Metric units with Unit Scale = 1.0 (1 Blender unit = 1 meter)")

    candidates = (
        [obj for obj in scene.objects if obj.visible_get() and obj.type not in {"CAMERA", "LIGHT"}]
        if args.all_visible
        else [obj for obj in bpy.context.selected_objects if obj.visible_get() and obj.type not in {"CAMERA", "LIGHT"}]
    )
    exportable = [obj for obj in candidates if obj.type in {"MESH", "ARMATURE", "EMPTY"}]
    if not any(obj.type == "MESH" for obj in exportable):
        raise SystemExit("Select at least one visible mesh before exporting")

    invalid = [obj.name for obj in exportable if not finite_transform(obj)]
    if invalid:
        raise SystemExit(f"Non-finite transform values found on: {', '.join(invalid)}")

    if args.rights_status == "LICENSED" and not args.proof_reference:
        raise SystemExit("LICENSED assets require --proof-reference before export")

    output.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=not args.all_visible,
        use_visible=args.all_visible,
        export_yup=True,
        export_apply=False,
        export_animations=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        check_existing=False,
    )

    manifest_path = output.with_suffix(".asset.json")
    manifest = {
        "schema": EXPORT_SCHEMA,
        "assetId": args.asset_id,
        "format": "GLB",
        "sourceBlend": bpy.data.filepath or None,
        "output": str(output),
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "blenderVersion": bpy.app.version_string,
        "coordinateContract": {
            "authoringUpAxis": "Z",
            "gltfUpAxis": "Y",
            "metersPerUnit": 1,
        },
        "content": {
            "objects": [obj.name for obj in exportable],
            "meshCount": sum(1 for obj in exportable if obj.type == "MESH"),
            "armatureCount": sum(1 for obj in exportable if obj.type == "ARMATURE"),
            "triangleCount": triangle_count(exportable),
        },
        "rights": {
            "status": args.rights_status,
            "source": args.source,
            "creatorOrLicensor": args.creator or None,
            "licenseName": args.license_name or None,
            "licenseReference": args.license_reference or None,
            "proofReference": args.proof_reference or None,
            "commercialUse": bool(args.commercial_use),
            "derivativeUse": bool(args.derivative_use),
        },
        "productionClearance": {
            "grantedByExporter": False,
            "requiresStreetVerseRightsRegistryReview": True,
            "eligibleForReview": (
                args.rights_status in {"ORIGINAL", "LICENSED", "PUBLIC_DOMAIN"}
                and bool(args.commercial_use)
                and bool(args.derivative_use)
            ),
        },
        "qa": {
            "recommended": [
                "load GLB through streetverseAssetLoader",
                "inspect scale/origin/materials/animation clips",
                "run Vision-assisted visual QA before release",
            ]
        },
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"StreetVerse GLB exported: {output}")
    print(f"StreetVerse provenance manifest: {manifest_path}")
    if not manifest["productionClearance"]["eligibleForReview"]:
        print("NOTE: Export succeeded, but rights evidence is not yet eligible for production-clearance review.")


if __name__ == "__main__":
    main()
