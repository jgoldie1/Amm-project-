from PIL import Image
from pathlib import Path

base = Path("static/brand")
base.mkdir(parents=True, exist_ok=True)

# INPUT FILES (uploaded images from ChatGPT session)
files = {
    "crest": "stubbs_crest.png",
    "saturn": "saturn.png",
    "flag": "flag.png",
    "lion": "lion.png"
}

# You must place your images in ~/marketplace before running:
# Rename them exactly:
# stubbs_crest.png
# saturn.png
# flag.png
# lion.png

def process_square(img):
    w, h = img.size
    size = min(w, h)
    left = (w - size) // 2
    top = (h - size) // 2
    return img.crop((left, top, left + size, top + size))

def process_lion(img):
    # remove bottom watermark area (approx crop)
    w, h = img.size
    cropped = img.crop((0, 0, w, int(h * 0.85)))
    return process_square(cropped)

for key, fname in files.items():
    path = Path(fname)
    if not path.exists():
        print(f"Missing: {fname}")
        continue

    img = Image.open(path).convert("RGBA")

    if key == "lion":
        img = process_lion(img)
    else:
        img = process_square(img)

    img = img.resize((1024, 1024))

    png_out = base / f"{key}.png"
    img.save(png_out, optimize=True)

    # simple SVG wrapper (for holographic systems / scaling)
    svg_out = base / f"{key}.svg"
    svg_out.write_text(f'''
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <image href="{key}.png" width="1024" height="1024"/>
</svg>
''')

    print(f"Processed {key}")

print("All brand assets processed.")
