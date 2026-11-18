#!/usr/bin/env python3
"""Fixture tests for full WEB archive parser. Synthetic verses are NOT Bible content."""
import importlib.util
import io
import tempfile
import unittest
import zipfile
from pathlib import Path

script = Path(__file__).resolve().parents[1] / "scripts" / "faithverse_import_web.py"
spec = importlib.util.spec_from_file_location("faithverse_import_web", script)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

GENESIS = (
    "\\id GEN World English Bible\n"
    "\\toc1 Genesis\n"
    "\\c 1\n"
    "\\p \\v 1 In the beginning, \\add God\\add* created the heavens.\n"
    "\\v 2 The earth was \\f + \\fr 1:2 \\ft editorial footnote\\f* without form.\n"
    "\\q1 And there was movement.\n"
    "\\s1 Chapter section\n"
    "\\v 3 The light was good.\n"
    "\\c 2\n"
    "\\p \\v 1 Thus the heavens were finished.\n"
)
MATTHEW = "\\id MAT Matthew\n\\c 1\n\\v 1 The book of genealogy.\n"

def example_zip():
    data=io.BytesIO()
    with zipfile.ZipFile(data,"w") as archive:
        archive.writestr("README.txt","This archive contains a Bible edition.")
        archive.writestr("content/01GEN.usfm", GENESIS)
        archive.writestr("content/41MAT.SFM", MATTHEW)
    return data.getvalue()

class TestFaithVerseWebParser(unittest.TestCase):
    def test_usfm_book_headers_and_verse_text(self):
        code,chapters=module.parse_book(GENESIS)
        self.assertEqual(code,"GEN")
        self.assertEqual(len(chapters),2)
        self.assertEqual(len(chapters[0]),3)
        self.assertIn("God",chapters[0][0])
        self.assertNotIn("editorial footnote",chapters[0][1])
        self.assertIn("movement",chapters[0][1])
        self.assertNotIn("Chapter section",chapters[0][1])

    def test_zip_ignores_readme(self):
        books=module.load_archive(example_zip())
        self.assertEqual(set(books),{"GEN","MAT"})

    def test_omitted_verse_keeps_reference_number_without_fake_text(self):
        code,chapters=module.parse_book("\\id LUK\n\\c 1\n\\v 1 first\n\\v 3 third")
        self.assertEqual(code,"LUK")
        self.assertEqual(chapters[0],["first",None,"third"])

    def test_reject_incomplete_edition_before_writing(self):
        with tempfile.TemporaryDirectory() as temp:
            output=Path(temp)/"empty"
            with self.assertRaisesRegex(ValueError,"Expected exactly 66"):
                module.import_book_archive(example_zip(),output,module.SOURCE_URL)
            self.assertFalse(output.exists())

    def test_epub_structure(self):
        with tempfile.TemporaryDirectory() as temp:
            books={code:[[f"Synthetic test for {code}"]] for code,_ in module.BOOKS}
            path=module.render_epub(books,Path(temp),module.SOURCE_URL)
            with zipfile.ZipFile(path) as archive:
                self.assertEqual(archive.namelist()[0],"mimetype")
                self.assertEqual(archive.read("mimetype"),b"application/epub+zip")
                self.assertIn("OEBPS/nav.xhtml",archive.namelist())
                self.assertIn("OEBPS/REV.xhtml",archive.namelist())
                self.assertEqual(len([n for n in archive.namelist() if n.startswith("OEBPS/") and n.endswith(".xhtml")]),67)

if __name__=="__main__":
    unittest.main(verbosity=2)
