from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return """
    <h1>Birthday App Ready</h1>
    <p>Your Flask app is running in Termux.</p>
    """

@app.route("/health")
def health():
    return jsonify({"ok": True, "message": "App is healthy"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
