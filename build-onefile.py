"""Bundle the Zionie Bake House site into one self-contained HTML file.

Usage: python3 build-onefile.py   (from any directory)

Combines the five pages into a single scrolling page (Home / Menu /
Classes / Reviews / Contact), inlines styles.css and main.js, embeds
all site photos as base64 data URIs, and rewrites cross-page links to
in-page anchors. Output: ../zionie-bake-house.html
"""
import base64
import re
import pathlib

BASE = pathlib.Path(__file__).resolve().parent
OUT = BASE.parent / 'zionie-bake-house.html'

css = (BASE / 'css' / 'styles.css').read_text()
js = (BASE / 'js' / 'main.js').read_text()

css += """
/* single-file additions */
[id] { scroll-margin-top: 96px; }
main .page-hero { padding: clamp(3.5rem, 7vw, 5rem) 0 clamp(2rem, 4vw, 3rem); }
"""


def main_content(name: str) -> str:
    html = (BASE / name).read_text()
    return re.search(r'<main id="main">(.*)</main>', html, re.S).group(1)


index = (BASE / 'index.html').read_text()
header = re.search(r'(<header class="site-header">.*?</header>)', index, re.S).group(1)
footer = re.search(r'(<footer class="site-footer">.*?</footer>)', index, re.S).group(1)

body = (
    f'{header}\n'
    f'<main id="main">\n'
    f'<div id="home">{main_content("index.html")}</div>\n'
    f'<div id="menu">{main_content("menu.html")}</div>\n'
    f'<div id="classes">{main_content("classes.html")}</div>\n'
    f'<div id="reviews">{main_content("reviews.html")}</div>\n'
    f'<div id="gallery">{main_content("gallery.html")}</div>\n'
    f'<div id="contact">{main_content("contact.html")}</div>\n'
    f'</main>\n'
    f'{footer}'
)

for old, new in [
    ('contact.html#visit', '#visit'),
    ('index.html', '#home'),
    ('menu.html', '#menu'),
    ('classes.html', '#classes'),
    ('reviews.html', '#reviews'),
    ('gallery.html', '#gallery'),
    ('contact.html', '#contact'),
]:
    body = body.replace(f'href="{old}"', f'href="{new}"')

# Embed photos as data URIs (src only — the lightbox reuses the thumbnail src)
for img in sorted((BASE / 'images').rglob('*.jpg')):
    rel = img.relative_to(BASE).as_posix()
    b64 = base64.b64encode(img.read_bytes()).decode()
    body = body.replace(f'src="{rel}"', f'src="data:image/jpeg;base64,{b64}"')

doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zionie Bake House — Brownies, Custom Cakes &amp; Millet Bakes</title>
  <meta name="description" content="Zionie Bake House bakes fudgy brownies, blondies, custom celebration cakes, cupcakes and tea cakes — plus wholesome millet versions of your favourites. Order on WhatsApp or join a baking class." />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🧁</text></svg>" />
  <style>
{css}
  </style>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
{body}
<script>
{js}
</script>
</body>
</html>
"""

OUT.write_text(doc)
print(f'wrote {OUT} ({len(doc):,} bytes)')
print(f'unembedded image refs: {doc.count(chr(34) + "images/") + doc.count("src=" + chr(34) + "images/")}')
