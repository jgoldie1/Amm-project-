import json, urllib.request

url = "http://127.0.0.1:8096/publish"
payload = {
    "event_type": "creator.track.created",
    "source_service": "creator_app",
    "payload": {
        "title": "Demo Track",
        "artist": "Aniyah"
    }
}
req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode())
