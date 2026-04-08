from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "ai_inference",
        "features": [
            "generation queue",
            "inference job runner scaffold",
            "future model routing",
            "research/search orchestration scaffold"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
