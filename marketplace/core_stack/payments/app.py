from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "payments",
        "features": [
            "support checkout scaffold",
            "creator support scaffold",
            "ministry giving scaffold",
            "future processor integration"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
