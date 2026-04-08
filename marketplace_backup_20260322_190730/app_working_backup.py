from flask import Flask, Response

app = Flask(__name__)

@app.route("/")
def home():
    return """
    <html>
    <body style="background:#0b1220;color:white;font-family:Arial;text-align:center;padding:40px;">
        <h1>All American Marketplace</h1>
        <p>Reset page is working</p>
        <p><a href="/health" style="color:#7dd3fc;">Health Check</a></p>
    </body>
    </html>
    """

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

app.run(host="0.0.0.0", port=8080)
