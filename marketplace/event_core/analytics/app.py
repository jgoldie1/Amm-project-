from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "analytics",
        "status": "ok",
        "metrics": [
            "streams",
            "payments",
            "support",
            "uploads",
            "ai jobs",
            "search queries"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8095)
