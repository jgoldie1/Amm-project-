from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "workers",
        "status": "ok",
        "jobs_supported": [
            "media processing",
            "ai jobs",
            "search indexing",
            "notifications",
            "analytics aggregation"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8093)
