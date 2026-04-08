import json
from pathlib import Path

root = Path.home() / "aam_full_system"
world_dir = root / "data" / "world" / "life_of_yahuah_maschian"
zones = json.loads((world_dir / "zones.json").read_text())

scene_templates = [
    ("Arrival", "Reach the zone entry and receive the first mission."),
    ("Witness", "Speak with the people and gather insight."),
    ("Teaching", "Complete the teaching encounter."),
    ("Healing", "Help someone in need and restore progress."),
    ("Challenge", "Face a test and answer wisely."),
    ("Passage", "Unlock the next stage of the journey.")
]

scenes = []
quests = []
count = 1

for zone in zones:
    for idx, tpl in enumerate(scene_templates, start=1):
        sid = f"scene_{count:03d}"
        qid = f"quest_{count:03d}"
        next_scene = f"scene_{count+1:03d}" if count < len(zones) * len(scene_templates) else None

        scenes.append({
            "id": sid,
            "zoneId": zone["id"],
            "zoneName": zone["name"],
            "realm": zone["realm"],
            "title": f'{zone["name"]} — {tpl[0]}',
            "description": tpl[1],
            "playable": True,
            "questId": qid,
            "nextScene": next_scene
        })

        quests.append({
            "id": qid,
            "sceneId": sid,
            "title": f'{zone["name"]} Mission {idx}',
            "objective": tpl[1],
            "xp": 50 + count * 5,
            "reward": {
                "scroll": f'{zone["name"]} Scroll {idx}',
                "teaching": f'{zone["name"]} Teaching {idx}'
            },
            "unlockScene": next_scene
        })

        count += 1

player_template = {
    "name": "Player One",
    "level": 1,
    "xp": 0,
    "currentScene": "scene_001",
    "currentZone": "bethlehem",
    "inventory": ["Starter Scroll"],
    "completedQuests": [],
    "unlockedScenes": ["scene_001"],
    "playable": True
}

(world_dir / "scenes.json").write_text(json.dumps(scenes, indent=2))
(world_dir / "quests.json").write_text(json.dumps(quests, indent=2))
(world_dir / "player_template.json").write_text(json.dumps(player_template, indent=2))

print("Life of Yahuah Maschian world generated.")
print(f"Scenes: {len(scenes)}")
print(f"Quests: {len(quests)}")
