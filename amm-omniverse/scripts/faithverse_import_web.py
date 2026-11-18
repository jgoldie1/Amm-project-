#!/usr/bin/env python3
"""Import the official public-domain World English Bible USFM archive into FaithVerse.

Offline usage:
  python3 scripts/faithverse_import_web.py --archive /path/to/engwebp_usfm.zip
Online/manual CI:
  python3 scripts/faithverse_import_web.py --download

No dependencies outside Python stdlib. No uploads, user information or secrets.
This imports a 66-book WEB Protestant edition, NOT the Ethiopian 81-book canon.
"""
import argparse
import hashlib
import html
import io
import json
import re
import sys
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

SOURCE_URL = "https://ebible.org/Scriptures/engwebp_usfm.zip"
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "public" / "faithverse-bibles" / "engwebp"
BOOKS = [
 ("GEN","Genesis"),("EXO","Exodus"),("LEV","Leviticus"),("NUM","Numbers"),("DEU","Deuteronomy"),
 ("JOS","Joshua"),("JDG","Judges"),("RUT","Ruth"),("1SA","1 Samuel"),("2SA","2 Samuel"),
 ("1KI","1 Kings"),("2KI","2 Kings"),("1CH","1 Chronicles"),("2CH","2 Chronicles"),("EZR","Ezra"),
 ("NEH","Nehemiah"),("EST","Esther"),("JOB","Job"),("PSA","Psalms"),("PRO","Proverbs"),
 ("ECC","Ecclesiastes"),("SNG","Song of Solomon"),("ISA","Isaiah"),("JER","Jeremiah"),
 ("LAM","Lamentations"),("EZK","Ezekiel"),("DAN","Daniel"),("HOS","Hosea"),("JOL","Joel"),
 ("AMO","Amos"),("OBA","Obadiah"),("JON","Jonah"),("MIC","Micah"),("NAM","Nahum"),
 ("HAB","Habakkuk"),("ZEP","Zephaniah"),("HAG","Haggai"),("ZEC","Zechariah"),("MAL","Malachi"),
 ("MAT","Matthew"),("MRK","Mark"),("LUK","Luke"),("JHN","John"),("ACT","Acts"),
 ("ROM","Romans"),("1CO","1 Corinthians"),("2CO","2 Corinthians"),("GAL","Galatians"),
 ("EPH","Ephesians"),("PHP","Philippians"),("COL","Colossians"),("1TH","1 Thessalonians"),
 ("2TH","2 Thessalonians"),("1TI","1 Timothy"),("2TI","2 Timothy"),("TIT","Titus"),
 ("PHM","Philemon"),("HEB","Hebrews"),("JAS","James"),("1PE","1 Peter"),("2PE","2 Peter"),
 ("1JN","1 John"),("2JN","2 John"),("3JN","3 John"),("JUD","Jude"),("REV","Revelation")
]
NAMES = dict(BOOKS)
VERSE_PATTERN = re.compile(r"\\v\s+(\d+)(?:[-–]\d+)?[a-z]?\s+")
CHAPTER_PATTERN = re.compile(r"\\c\s+(\d+)\b")
SKIP_LINE = re.compile(r"^\\(?:id|ide|h|toc[1-3]|mt\d*|mte\d*|s\d*|ms\d*|r|d|sp|cl|cp|rem|sts|usfm)\b")
CONTINUATION = re.compile(r"^\\(?:p|m|mi|pi\d*|q\d*|qm\d*|nb|b|li\d*|pc|pr|pm|cls)\b")
INLINE_NOTE = re.compile(r"\\(?:f|x)\s.*?\\(?:f|x)\*", re.DOTALL)
INLINE_W = re.compile(r"\\\+?w\s+([^\\|]+?)(?:\|[^\n]*?)?\\\+?w\*",re.DOTALL)

def clean_text(text):
    text = INLINE_NOTE.sub("",text)
    text = INLINE_W.sub(lambda match:match.group(1),text)
    text = re.sub(r"\\\+?[A-Za-z][A-Za-z0-9-]*\*?(?:\s+)?"," ",text)
    text = re.sub(r"\s+"," ",text).strip()
    return text.replace("\ufeff","").strip()

def parse_book(raw):
    code = None
    current_chapter = None
    current_verse = None
    chapters = {}
    for line in raw.replace("\r\n","\n").splitlines():
        line = line.strip()
        if not line: continue
        match = re.match(r"^\\id\s+([0-9A-Z]{3})\b",line)
        if match: code=match.group(1);continue
        if SKIP_LINE.match(line): current_verse=None;continue
        match = CHAPTER_PATTERN.search(line)
        if match:
            current_chapter = int(match.group(1))
            chapters.setdefault(current_chapter,{})
            current_verse=None
            line=line[match.end():].strip()
            if not line: continue
        if current_chapter is None: continue
        verse_matches = list(VERSE_PATTERN.finditer(line))
        if verse_matches:
            for i,v in enumerate(verse_matches):
                number=int(v.group(1))
                raw_text=line[v.end():verse_matches[i+1].start() if i+1<len(verse_matches) else len(line)]
                cleaned=clean_text(raw_text)
                if cleaned: chapters[current_chapter][number] = (chapters[current_chapter].get(number,"")+" "+cleaned).strip()
                current_verse=number
            continue
        if current_verse is not None and (CONTINUATION.match(line) or not line.startswith("\\")):
            cleaned=clean_text(line)
            if cleaned: chapters[current_chapter][current_verse] = (chapters[current_chapter].get(current_verse,"")+" "+cleaned).strip()
    if code is None: return None
    if code not in NAMES: return None
    result=[]
    for chapter_num in sorted(chapters):
        verses=chapters[chapter_num]
        if not verses:continue
        # The reader uses 1-based verse array indexes. Reject accidental omitted verses.
        expected=set(range(1,max(verses)+1))
        if set(verses)!=expected:
            missing=sorted(expected-set(verses))
            raise ValueError(f"{code} chapter {chapter_num} missing verse numbers: {missing[:12]}")
        result.append([verses[i] for i in range(1,max(verses)+1)])
    if not result: raise ValueError(f"No chapter text found for {code}")
    if sorted(chapters)!=list(range(1,max(chapters)+1)):
        raise ValueError(f"Noncontiguous chapters for {code}")
    return code,result

def load_archive(raw, max_files=1600):
    if len(raw)>35_000_000:raise ValueError("USFM zip exceeds 35MB")
    by_code={}
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        files=archive.infolist()
        if len(files)>max_files:raise ValueError("Too many entries")
        total_uncompressed=sum(x.file_size for x in files)
        if total_uncompressed>80_000_000:raise ValueError("Uncompressed archive exceeds 80MB")
        for entry in files:
            if entry.is_dir() or not entry.filename.lower().endswith((".usfm",".sfm",".usx.txt",".txt")):continue
            if entry.file_size>3_000_000:raise ValueError("Unexpected oversized USFM book")
            try:
                parsed=parse_book(archive.read(entry).decode("utf-8-sig"))
                if parsed is None:continue
                code,chapters=parsed
            except TypeError:
                continue
            except UnicodeDecodeError:
                raise ValueError(f"Invalid UTF-8 in USFM entry {entry.filename}")
            if code in by_code:raise ValueError(f"Duplicate USFM book: {code}")
            by_code[code]=chapters
    return by_code

def render_epub(books, output, source_url):
    """Create an EPUB 3 for a verified full WEB import; source text remains unchanged."""
    from zipfile import ZIP_DEFLATED, ZIP_STORED
    package=output/"engwebp.epub"
    def escape(value):return html.escape(str(value),quote=True)
    with zipfile.ZipFile(package,"w") as epub:
        epub.writestr("mimetype","application/epub+zip",compress_type=ZIP_STORED)
        epub.writestr("META-INF/container.xml",'<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',compress_type=ZIP_DEFLATED)
        toc=[]
        for code,name in BOOKS:
            chapters=books[code]
            body=[]
            for i,chapter in enumerate(chapters,1):
                body.append(f'<section><h2>{escape(name)} {i}</h2>')
                for verse,content in enumerate(chapter,1):
                    body.append(f'<p><sup>{verse}</sup> {escape(content)}</p>')
                body.append('</section>')
            xhtml='<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>'+escape(name)+'</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body><h1>'+escape(name)+'</h1>'+''.join(body)+'</body></html>'
            epub.writestr("OEBPS/"+code+".xhtml",xhtml,compress_type=ZIP_DEFLATED)
            toc.append((code,name))
        nav=''.join(f'<li><a href="{code}.xhtml">{escape(name)}</a></li>' for code,name in toc)
        epub.writestr("OEBPS/nav.xhtml",'<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc" id="toc"><h1>Books</h1><ol>'+nav+'</ol></nav></body></html>',compress_type=ZIP_DEFLATED)
        epub.writestr("OEBPS/style.css","body{font-family:serif;line-height:1.65;margin:1em}h1,h2{page-break-before:always}p{margin:.4em 0}sup{font-size:.7em;color:#555}",compress_type=ZIP_DEFLATED)
        manifest=''.join(f'<item id="{code}" href="{code}.xhtml" media-type="application/xhtml+xml"/>' for code,_ in toc)
        spine=''.join(f'<itemref idref="{code}"/>' for code,_ in toc)
        epub.writestr("OEBPS/package.opf",'<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="pub-id">urn:tryamm:faithverse:engwebp</dc:identifier><dc:title>World English Bible</dc:title><dc:language>en</dc:language><dc:source>'+escape(source_url)+'</dc:source><meta property="dcterms:modified">'+datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")+'</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/>'+manifest+'</manifest><spine>'+spine+'</spine></package>',compress_type=ZIP_DEFLATED)
    return package

def import_book_archive(raw, output, source_url):
    books=load_archive(raw)
    missing=[code for code,_ in BOOKS if code not in books]
    extras=[code for code in books if code not in NAMES]
    if missing or extras:raise ValueError(f"Expected exactly 66 canon books, missing={missing}, extra={extras}")
    chapter_count=sum(len(chapters) for chapters in books.values())
    verse_count=sum(sum(len(chapter) for chapter in chapters) for chapters in books.values())
    if chapter_count!=1189 or not 30000<=verse_count<=33000:
        raise ValueError(f"Invalid completeness: {chapter_count} chapters, {verse_count} verses")
    output.mkdir(parents=True,exist_ok=True)
    (output/"books").mkdir(exist_ok=True)
    manifest=[]
    for code,name in BOOKS:
        chapters=books[code]
        filename=f"books/{code}.json"
        payload={"id":code,"name":name,"chapters":chapters}
        (output/filename).write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')),encoding="utf-8")
        manifest.append({"id":code,"name":name,"file":filename,"chapterCount":len(chapters),"verseCount":sum(len(x) for x in chapters)})
    epub=render_epub(books,output,source_url)
    data={"schema":"tryamm.faithverse.bible.manifest.v1","id":"engwebp","title":"World English Bible","language":"en","canon":"Protestant 66-book canon","bookCount":len(manifest),"chapterCount":chapter_count,"verseCount":verse_count,
          "source":source_url,"sourceArchiveSHA256":hashlib.sha256(raw).hexdigest(),"rights":"Public domain per eBible.org; World English Bible title is a trademark of eBible.org","reviewState":"source_verified_not_professionally_signed_off",
          "generatedAt":datetime.now(timezone.utc).isoformat(),"epub":"engwebp.epub","books":manifest}
    (output/"manifest.json").write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"books":len(manifest),"chapters":chapter_count,"verses":verse_count,"epub_bytes":epub.stat().st_size,"source_sha256":data["sourceArchiveSHA256"],"output":str(output)}))
    return data

def main():
    p=argparse.ArgumentParser()
    g=p.add_mutually_exclusive_group(required=True)
    g.add_argument("--archive",type=Path,help="Local official engwebp_usfm.zip")
    g.add_argument("--download",action="store_true",help="Download official source over HTTPS")
    p.add_argument("--output",type=Path,default=DEFAULT_OUTPUT)
    args=p.parse_args()
    if args.download:
        request=urllib.request.Request(SOURCE_URL,headers={"User-Agent":"TRYAMM-FaithVerse-Importer/1.0 (public-domain scripture source)"})
        with urllib.request.urlopen(request,timeout=35) as response:
            if response.url.split('/')[2].lower() not in {"ebible.org","www.ebible.org"}:raise ValueError("Unexpected source redirect")
            raw=response.read(35_000_001)
    else:raw=args.archive.read_bytes()
    import_book_archive(raw,args.output,SOURCE_URL)

if __name__=="__main__":
    try:main()
    except Exception as exc:
        print("FAITHVERSE IMPORT FAILED: "+str(exc),file=sys.stderr)
        sys.exit(1)
