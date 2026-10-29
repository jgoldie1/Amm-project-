#!/usr/bin/env python3
"""Generate 500 ORIGINAL unconfigured website demo variants, no scraping or AI."""
import json, sys, html
from pathlib import Path
from datetime import datetime, timezone

verticals = [
("salon","Beauty Salon","Hair Styling","Beauty Consultations"),
("logistics","Logistics","Shipper Quotes","Carrier Inquiries"),
("music-studio","Recording Studio","Vocal Editing","Session Booking"),
("accessibility","Accessible Technology","Digital Skills","Accessible Guidance"),
("barber","Barbershop","Haircuts","Grooming"),
("nails","Nail Studio","Manicures","Nail Art"),
("wellness","Wellness Studio","Massage","Sessions"),
("training","Training Academy","Classes","Workshop Inquiries"),
("security","Security Services","Event Safety","Service Inquiries"),
("retail","Retail Shop","Products","Customer Requests"),
("restaurant","Restaurant","Dining","Catering Inquiries"),
("home-services","Home Services","Repairs","Quotes"),
("cleaning","Cleaning Services","Home Cleaning","Commercial Cleaning"),
("agency","Creative Agency","Web Design","Marketing"),
("nonprofit","Nonprofit","Programs","Volunteering"),
("faith","Faith Community","Events","Learning"),
("education","Tutoring Center","Tutoring","Courses"),
("events","Event Planning","Planning","Vendors"),
("transport","Transportation","Trip Requests","Group Transit"),
("professional","Professional Services","Consultations","Service Plans")
]
palettes=[("#201438","#d8c6ff"),("#103b41","#b1fff2"),("#443028","#ffe5c6"),("#26304b","#d7e6ff"),("#143b2d","#c5fbd9")]
out=Path(sys.argv[1]) if len(sys.argv)>1 else Path("generated/tryamm-starters")
out.mkdir(parents=True,exist_ok=True)
manifest=[]
for slug,label,a,b in verticals:
 for variant in range(1,26):
  key=f"{slug}-{variant:02d}"
  bg,accent=palettes[(variant-1)%5]
  radius=8+variant%5*5
  page=f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(label)} | TRYAMM Demo {variant}</title><meta name="description" content="Original {html.escape(label)} demo template, not yet configured for customer use."><style>*{{box-sizing:border-box}}body{{margin:0;background:{bg};color:white;font:17px/1.6 system-ui,sans-serif}}main{{max-width:1000px;margin:auto;padding:22px}}header{{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}}h1{{font-size:clamp(2rem,5vw,3.5rem);line-height:1.2}}.hero{{padding:{30+variant%5*10}px 0}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}}.card{{border:1px solid {accent};border-radius:{radius}px;padding:20px;background:#ffffff0b}}a{{color:{accent}}}a:focus-visible{{outline:4px solid #ffe09b;outline-offset:4px}}.cta{{display:inline-block;padding:15px 20px;background:{accent};color:{bg};font-weight:bold;border-radius:10px;min-height:52px}}.notice{{border-left:4px solid #ffcd6a;padding:14px;background:#ffffff12}}footer{{margin-top:42px;border-top:1px solid #ffffff55;padding-top:22px}}@media(prefers-reduced-motion:reduce){{*{{animation:none!important;scroll-behavior:auto!important}}}}</style></head><body><main><header><strong>{html.escape(label)}</strong><a href="#contact" class="cta">Ask about services</a></header><section class="hero"><p>TRYAMM WEBSITE OS / ORIGINAL DEMO {variant}</p><h1>{html.escape(label)} for your community</h1><p>Discover services and explore what this future business website could offer.</p><a href="#services" class="cta">Explore services</a></section><section id="services"><h2>Services</h2><div class="grid"><article class="card"><h3>{html.escape(a)}</h3><p>Contact the business to confirm pricing and availability.</p></article><article class="card"><h3>{html.escape(b)}</h3><p>Ask about service options and booking policies.</p></article></div></section><section id="contact"><h2>Contact</h2><p class="notice">Demo only: no contact address, booking, payments, customer intake or AI is connected. Add verified business-specific contact details and permissions before release.</p></section><footer>TRYAMM Website OS • Original no-AI demo • Not a published customer site</footer></main></body></html>"""
  (out/f"{key}.html").write_text(page,encoding="utf8")
  manifest.append(dict(id=key,vertical=slug,variation=variant,file=f"{key}.html",status="demo-unconfigured",live=False))
(out/"manifest.json").write_text(json.dumps(dict(createdAt=datetime.now(timezone.utc).isoformat(),industries=20,demoVariants=500,saleReady=0,templates=manifest),indent=2),encoding="utf8")
print(f"Created {len(manifest)} demo variants in {out} (NOT verified client websites)")
