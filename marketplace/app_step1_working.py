from flask import Flask
app = Flask(__name__)

def page(title, body):
    return f"""
    <html>
    <body style="background:#0b1220;color:white;font-family:Arial;text-align:center;padding:30px;">
        <h1>All American Marketplace</h1>
        <h2>{title}</h2>
        <div style="margin:20px auto;max-width:800px;background:#182235;padding:20px;border-radius:16px;">
            {body}
        </div>
        <div style="margin:20px auto;max-width:800px;background:#182235;padding:20px;border-radius:16px;">
            <p><a href="/" style="color:#7dd3fc;">Home</a></p>
            <p><a href="/alton-security" style="color:#7dd3fc;">Alton Security</a></p>
            <p><a href="/kevon-shot-it" style="color:#7dd3fc;">Kevon Shot It</a></p>
            <p><a href="/ai-center" style="color:#7dd3fc;">AI Center</a></p>
            <p><a href="/health" style="color:#7dd3fc;">Health</a></p>
        </div>
    </body>
    </html>
    """

@app.route("/")
def home():
    return page("Platform Home", """
    <p>Alton + Kevon + AI are now loaded into the platform.</p>
    <p>Use the links below to open each module.</p>
    """)

@app.route("/alton-security")
def alton_security():
    return page("Alton Security", """
    <p>Operations dashboard</p>
    <p>Training academy</p>
    <p>Compliance tracking</p>
    <p>Celebrity & special events</p>
    <p>Scheduling and patrol logs</p>
    """)

@app.route("/kevon-shot-it")
def kevon_shot_it():
    return page("Kevon Shot It", """
    <p>Movie production</p>
    <p>Video production</p>
    <p>Photography</p>
    <p>Editing services</p>
    <p>Trading education</p>
    <p>Stocks / forex / market hub</p>
    """)

@app.route("/ai-center")
def ai_center():
    return page("AI Center", """
    <p>Jarvis assistant</p>
    <p>AI business advisor</p>
    <p>AI education mentor</p>
    <p>AI trading assistant</p>
    <p>AI security assistant</p>
    <p>Instructions for how to use the app</p>
    """)

@app.route("/health")
def health():
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
