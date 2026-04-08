from flask import Flask, render_template, jsonify, Response

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/marketplace")
def marketplace():
    return render_template("marketplace.html")

@app.route("/stream")
def stream():
    return render_template("stream.html")

@app.route("/health")
def health():
    return jsonify({"ok": True, "app": "aame", "status": "healthy"})

@app.route("/favicon.ico")
def favicon():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
