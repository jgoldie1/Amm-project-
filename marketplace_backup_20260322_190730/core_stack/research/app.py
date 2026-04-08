from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "research",
        "features": [
            "reasoning scaffold",
            "cross-platform synthesis scaffold",
            "knowledge engine scaffold"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
