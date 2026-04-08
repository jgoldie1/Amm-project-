from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "notifications",
        "status": "ok",
        "channels": [
            "in-app",
            "email placeholder",
            "sms placeholder",
            "stream alert placeholder"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8094)
