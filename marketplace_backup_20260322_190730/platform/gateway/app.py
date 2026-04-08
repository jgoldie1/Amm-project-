from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def root():
    return jsonify({
        "service": "gateway",
        "status": "ok",
        "message": "Scaffold ready"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
