from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "search",
        "features": [
            "platform search scaffold",
            "holographic search scaffold",
            "future indexing layer"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
