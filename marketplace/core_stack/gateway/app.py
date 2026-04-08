from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def home():
    return jsonify({
        "service": "gateway",
        "platform": "All American Marketplace Core Stack",
        "status": "running",
        "routes": [
            "/services",
            "/status"
        ]
    })

@app.get("/services")
def services():
    return jsonify({
        "services": [
            "auth",
            "users",
            "media",
            "payments",
            "ai_inference",
            "search",
            "research",
            "admin",
            "postgres",
            "redis"
        ]
    })

@app.get("/status")
def status():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8090)
