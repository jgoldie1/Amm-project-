from flask import Flask, Response, request, redirect
import os, json, uuid, datetime

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)

PROMPTS_FILE = os.path.join(DATA, "prompt_lab.json")
SEARCH_FILE = os.path.join(DATA, "search_queries.json")
GENERATIONS_FILE = os.path.join(DATA, "generation_queue.json")
MODELS_FILE = os.path.join(DATA, "future_model_lab.json")

def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default
    return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def now():
    return str(datetime.datetime.now())

def ensure_defaults():
    if not os.path.exists(PROMPTS_FILE):
        save_json(PROMPTS_FILE, [
            {"title": "Holographic Concert Scene", "prompt": "Create an immersive holographic concert stage with layered light and audience overlays.", "time": now()}
        ])
    if not os.path.exists(SEARCH_FILE):
        save_json(SEARCH_FILE, [
            {"query": "Find creator tools in the platform", "engine": "AAM Search Engine", "time": now()}
        ])
    if not os.path.exists(GENERATIONS_FILE):
        save_json(GENERATIONS_FILE, [
            {"title": "Aniyah Artist Visual", "type": "visual", "status": "planned", "time": now()}
        ])
    if not os.path.exists(MODELS_FILE):
        save_json(MODELS_FILE, [
            {"name": "AAM Visual Engine Beta", "stage": "beta", "notes": "Creative image generation shell"},
            {"name": "Holographic Visual Engine Beta", "stage": "beta", "notes": "Immersive holographic generation shell"},
            {"name": "AAM Search Engine Beta", "stage": "beta", "notes": "Search and discovery shell"},
            {"name": "AAM Research Engine Beta", "stage": "beta", "notes": "Reasoning + research shell"}
        ])
ensure_defaults()

def section(title, items):
    rows = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="card"><h3>{title}</h3><ul>{rows}</ul></div>'

def btn(label, link, cls="btn"):
    return f'<a class="{cls}" href="{link}">{label}</a>'

def page(title, body):
    return f"""
    <html>
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{title}</title>
        <style>
            body {{
                background:#0b1220;
                color:white;
                font-family:Arial,sans-serif;
                text-align:center;
                padding:16px;
                margin:0;
            }}
            .hero {{
                background:linear-gradient(135deg,#182235,#243b55);
                border:2px solid #60a5fa;
                border-radius:18px;
                padding:24px;
                margin:16px auto;
                max-width:1100px;
                box-shadow:0 0 20px rgba(96,165,250,0.25);
            }}
            .card,.navbox {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:1100px;
                text-align:left;
                box-shadow:0 0 14px rgba(56,189,248,0.10);
            }}
            .btn {{
                display:block;
                background:#0284c7;
                color:white;
                text-decoration:none;
                padding:18px;
                margin:12px auto;
                border-radius:14px;
                max-width:820px;
                font-weight:bold;
                font-size:20px;
                text-align:center;
            }}
            .btn2 {{ background:#16a34a; }}
            .btn3 {{ background:#7c3aed; }}
            .btn4 {{ background:#d97706; }}
            .btn5 {{ background:#dc2626; }}
            .btn6 {{ background:#0891b2; }}
            input, textarea, select {{
                width:90%;
                max-width:760px;
                padding:16px;
                margin:10px auto;
                display:block;
                border-radius:12px;
                border:1px solid #64748b;
                font-size:18px;
            }}
            textarea {{ min-height:140px; }}
            .badge {{
                display:inline-block;
                padding:8px 14px;
                border-radius:999px;
                border:1px solid #60a5fa;
                background:#0f172a;
                margin:4px 6px 0 0;
            }}
            h1 {{ font-size:36px; margin:0 0 8px 0; }}
            h2,h3 {{ font-size:26px; }}
            p,li {{ font-size:20px; }}
            ul {{ padding-left:24px; margin:0; }}
            a {{ color:white; }}
        </style>
    </head>
    <body>
        <div class="hero">
            <h1>All American Marketplace</h1>
            <h2>{title}</h2>
            <div>
                <span class="badge">AI Creation</span>
                <span class="badge">Holographic Search</span>
                <span class="badge">Future Model Lab</span>
            </div>
        </div>
        {body}
    </body>
    </html>
    """

@app.route("/")
def home():
    return page("AI Creation + Search Upgrade", """
    <div class="navbox">
        <h3>AI Creation + Search Navigation</h3>
    """ +
    btn("AAM Visual Engine", "/aam-visual-engine", "btn btn2") +
    btn("Holographic Visual Engine", "/holographic-visual-engine", "btn btn3") +
    btn("AAM Search Engine", "/aam-search-engine", "btn btn4") +
    btn("Holographic Search Engine", "/holographic-search-engine", "btn btn5") +
    btn("AAM Research Engine", "/aam-research-engine", "btn btn6") +
    btn("Prompt Lab", "/prompt-lab", "btn") +
    btn("Generation Queue", "/generation-queue", "btn btn2") +
    btn("Processing Accelerator", "/processing-accelerator", "btn btn3") +
    btn("Future Model Lab", "/future-model-lab", "btn btn4") +
    btn("AI Command Core", "/ai-command-core", "btn btn5") +
    btn("Knowledge Search Hub", "/knowledge-search-hub", "btn btn6") +
    btn("Health", "/health", "btn") +
    """
    </div>
    """ + section("What This Adds", [
        "Creative visual engine shell",
        "Holographic visual engine shell",
        "Search engine shell",
        "Holographic search engine shell",
        "Research engine shell",
        "Prompt lab",
        "Generation queue",
        "Processing accelerator",
        "Future version / model lab"
    ]) + section("What This Does", [
        "Turns the platform into an AI creation and discovery ecosystem",
        "Supports faster processing architecture planning",
        "Prepares for future versions of your search, reasoning, and generation systems"
    ]))

@app.route("/aam-visual-engine")
def aam_visual_engine():
    return page("AAM Visual Engine", (
        section("AAM Visual Engine", [
            "Creative image generation shell",
            "Concept art generation direction",
            "Branding and visual ideation support",
            "Creator and platform asset generation path"
        ]) +
        section("What This Does", [
            "Creates your own visual generation layer",
            "Supports artists, brands, ministry visuals, and platform design"
        ])
    ))

@app.route("/holographic-visual-engine")
def holographic_visual_engine():
    return page("Holographic Visual Engine", (
        section("Holographic Visual Engine", [
            "Immersive holographic scene generation shell",
            "Concert and ministry stage visual concepts",
            "Layered 3D/5D presentation planning",
            "Future immersive media asset pipeline"
        ]) +
        section("What This Does", [
            "Moves image generation into immersive scene design",
            "Supports holographic streaming and event environments"
        ])
    ))

@app.route("/aam-search-engine", methods=["GET","POST"])
def aam_search_engine():
    items = load_json(SEARCH_FILE, [])
    if request.method == "POST":
        items.append({
            "query": request.form.get("query","").strip() or "Untitled query",
            "engine": "AAM Search Engine",
            "time": now()
        })
        save_json(SEARCH_FILE, items)
        return redirect("/aam-search-engine")
    html = """
    <div class="card">
        <form method="post">
            <input name="query" placeholder="Search query">
            <button class="btn btn2" type="submit">Run Search Query</button>
        </form>
    </div>
    """
    for item in reversed(items[-50:]):
        html += f"<div class='card'><p><strong>{item['query']}</strong></p><p>{item['engine']}</p><p><small>{item['time']}</small></p></div>"
    return page("AAM Search Engine", html)

@app.route("/holographic-search-engine")
def holographic_search_engine():
    return page("Holographic Search Engine", (
        section("Holographic Search Engine", [
            "Immersive discovery shell",
            "Search across holographic media, scenes, and immersive events",
            "Cross-device discovery direction",
            "Future spatial search planning"
        ]) +
        section("What This Does", [
            "Turns search into an immersive ecosystem feature",
            "Supports holographic media, live events, and scene discovery"
        ])
    ))

@app.route("/aam-research-engine")
def aam_research_engine():
    return page("AAM Research Engine", (
        section("AAM Research Engine", [
            "Research and synthesis shell",
            "Long-form answer planning",
            "Cross-platform knowledge analysis",
            "Strategy, architecture, and planning support"
        ]) +
        section("What This Does", [
            "Creates a reasoning and research layer inside the platform",
            "Supports planning across ministry, creator, logistics, finance, and AI systems"
        ])
    ))

@app.route("/prompt-lab", methods=["GET","POST"])
def prompt_lab():
    items = load_json(PROMPTS_FILE, [])
    if request.method == "POST":
        items.append({
            "title": request.form.get("title","").strip() or "Untitled Prompt",
            "prompt": request.form.get("prompt","").strip() or "",
            "time": now()
        })
        save_json(PROMPTS_FILE, items)
        return redirect("/prompt-lab")
    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Prompt title">
            <textarea name="prompt" placeholder="Write your prompt here"></textarea>
            <button class="btn btn2" type="submit">Save Prompt</button>
        </form>
    </div>
    """
    for item in reversed(items[-50:]):
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p>{item['prompt']}</p><p><small>{item['time']}</small></p></div>"
    return page("Prompt Lab", html)

@app.route("/generation-queue", methods=["GET","POST"])
def generation_queue():
    items = load_json(GENERATIONS_FILE, [])
    if request.method == "POST":
        items.append({
            "title": request.form.get("title","").strip() or "Untitled Generation",
            "type": request.form.get("type","").strip() or "visual",
            "status": request.form.get("status","").strip() or "planned",
            "time": now()
        })
        save_json(GENERATIONS_FILE, items)
        return redirect("/generation-queue")
    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Generation title">
            <input name="type" placeholder="visual / holographic / search / research">
            <input name="status" placeholder="planned / queued / processing / done">
            <button class="btn btn2" type="submit">Add Generation</button>
        </form>
    </div>
    """
    for item in reversed(items):
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p>{item['type']} | {item['status']}</p><p><small>{item['time']}</small></p></div>"
    return page("Generation Queue", html)

@app.route("/processing-accelerator")
def processing_accelerator():
    return page("Processing Accelerator", (
        section("Processing Accelerator", [
            "Faster processing architecture shell",
            "Queued workload management direction",
            "Future GPU/accelerator planning",
            "Batch and priority flow concepts",
            "Low-latency generation strategy"
        ]) +
        section("What This Does", [
            "Creates the speed and scaling layer for AI generation/search systems",
            "Supports future versions that process more quickly and reliably"
        ])
    ))

@app.route("/future-model-lab", methods=["GET","POST"])
def future_model_lab():
    items = load_json(MODELS_FILE, [])
    if request.method == "POST":
        items.append({
            "name": request.form.get("name","").strip() or "Untitled Model",
            "stage": request.form.get("stage","").strip() or "planned",
            "notes": request.form.get("notes","").strip() or ""
        })
        save_json(MODELS_FILE, items)
        return redirect("/future-model-lab")
    html = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Model or beta version name">
            <input name="stage" placeholder="planned / beta / testing / future">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button class="btn btn2" type="submit">Add Future Model</button>
        </form>
    </div>
    """
    for item in items:
        html += f"<div class='card'><p><strong>{item['name']}</strong></p><p>{item['stage']}</p><p>{item['notes']}</p></div>"
    return page("Future Model Lab", html)

@app.route("/ai-command-core")
def ai_command_core():
    return page("AI Command Core", (
        section("AI Command Core", [
            "Visual engine coordination",
            "Search engine coordination",
            "Research engine coordination",
            "Prompt and generation workflow direction",
            "Future model routing concepts"
        ]) +
        section("What This Does", [
            "Creates one control layer for your AI systems",
            "Prepares the ecosystem for modular AI orchestration"
        ])
    ))

@app.route("/knowledge-search-hub")
def knowledge_search_hub():
    return page("Knowledge Search Hub", (
        section("Knowledge Search Hub", [
            "Search engine",
            "Holographic search engine",
            "Research engine",
            "Prompt lab",
            "Future knowledge routing direction"
        ]) +
        section("What This Does", [
            "Creates a single discovery hub for your platform's AI knowledge systems",
            "Supports future cross-platform research and retrieval"
        ])
    ))

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
