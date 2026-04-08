from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "auth",
        "features": [
            "local login",
            "jwt planning",
            "oauth provider integration placeholder"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
