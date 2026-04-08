from flask import Flask, jsonify, request

app = Flask(__name__)
EVENTS = []

@app.post("/publish")
def publish():
    payload = request.get_json(silent=True) or {}
    EVENTS.append(payload)
    return jsonify({"status": "queued", "event_count": len(EVENTS), "payload": payload})

@app.get("/events")
def events():
    return jsonify({"events": EVENTS[-50:]})

@app.get("/")
def root():
    return jsonify({
        "service": "event_bus",
        "status": "ok",
        "note": "in-memory scaffold for now"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8092)
