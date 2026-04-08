from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return """
    <html>
    <body style="background:#0b1220;color:white;font-family:Arial;text-align:center;padding:30px;">
        <h1>All American Marketplace</h1>
        <h2>Alton + Kevon + AI Loaded</h2>
        <p>Alton Security</p>
        <p>Kevon Shot It</p>
        <p>AI Center</p>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
