from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "admin",
        "features": [
            "platform control",
            "owner/admin dashboards",
            "service status monitoring scaffold"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
