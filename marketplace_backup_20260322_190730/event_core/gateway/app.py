from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "event_gateway",
        "status": "ok",
        "purpose": "event-driven platform entry"
    })

@app.get("/status")
def status():
    return jsonify({
        "gateway": "ok",
        "event_bus": "scaffolded",
        "workers": "scaffolded",
        "notifications": "scaffolded",
        "analytics": "scaffolded"
    })

@app.get("/flows")
def flows():
    return jsonify({
        "flows": [
            "media -> ai -> search -> notifications",
            "payments -> notifications -> analytics",
            "streaming -> notifications -> analytics"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8091)
