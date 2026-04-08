from flask import Flask, request, jsonify
import json, os, datetime, uuid

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
EVENTS_FILE = os.path.join(DATA, "event_bridge_log.json")

os.makedirs(DATA, exist_ok=True)

def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default
    return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def now():
    return str(datetime.datetime.now())

@app.post("/publish")
def publish():
    payload = request.get_json(silent=True) or {}
    events = load_json(EVENTS_FILE, [])
    event = {
        "id": str(uuid.uuid4()),
        "time": now(),
        "event_type": payload.get("event_type", "unknown"),
        "source_service": payload.get("source_service", "unknown"),
        "payload": payload.get("payload", {})
    }
    events.append(event)
    save_json(EVENTS_FILE, events[-500:])
    return jsonify({"status": "queued", "event": event})

@app.get("/events")
def events():
    return jsonify(load_json(EVENTS_FILE, [])[-100:])

@app.get("/")
def root():
    return jsonify({
        "service": "event_bridge",
        "status": "ok",
        "purpose": "local event bridge for visible app actions"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8096)
