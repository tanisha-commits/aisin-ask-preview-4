"""Builds Preview 4 (index.html, p1.js, p2.js) from the untouched originals in src/.

Run from the repo root:  python3 tools/build.py && node tools/scope-css.js ...  (see README)
Every edit below is asserted so that a change in the sources fails loudly instead of silently.
"""
import json, re, subprocess, sys, tempfile, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

tmp = os.path.join(tempfile.mkdtemp(), 'sections.json')
subprocess.run([sys.executable, '-I', 'tools/extract.py', tmp], check=True, stdout=subprocess.DEVNULL)
s = json.load(open(tmp, encoding='utf8'))


def sub(text, old, new, count=1, label=''):
    n = text.count(old)
    if n != count:
        sys.exit(f'[{label}] expected {count}x {old!r}, found {n}')
    return text.replace(old, new)


# ---- Header (Preview 1): remove "Downloads" and re-point links to sections that exist in Preview 4
h = s['p1_header']
h = sub(h, '<a href="#resources">Downloads</a>', '', label='header')
h = sub(h, '<a href="#resources">Download resources</a>', '', label='header')
h = sub(h, '<a href="#resources">Support</a>', '<a href="#contact">Support</a>', label='header')

# ---- Hero video (Preview 1)
hero = sub(s['p1_hero'], 'href="#resources">Technical resources', 'href="#updates">Technical resources', label='hero')

# ---- Preview 2 sections: anchors that pointed at Preview 2 sections not carried over
P2_ANCHORS = {'#support': '#updates', '#trust': '#about', '#news': '#updates', '#audiences': '#contact'}


def remap(html):
    return re.sub(r'href="(#[\w-]+)"', lambda m: f'href="{P2_ANCHORS.get(m.group(1), m.group(1))}"', html)


products, business, contact = (remap(s[k]) for k in ('p2_products', 'p2_business', 'p2_contact'))
footer = remap(s['p2_footer'])
footer = sub(footer, 'src="assets/aisin-ask-logo-transparent.png"', 'src="assets/aisin-ask-logo-transparent-p2.png"', label='footer')

gn = open('partials/global-network.html', encoding='utf8').read().strip()
enq = open('partials/enquiry.html', encoding='utf8').read().strip()

html = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Explore AISIN ASK aftermarket products, technical resources and business enquiries for India.">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#162a75">
  <title>AISIN ASK Aftermarket India</title>
  <link rel="icon" href="assets/aisin-ask-logo-transparent.png">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="p1.css">
  <link rel="stylesheet" href="p2.css">
  <link rel="stylesheet" href="p4.css">
  <script src="p1.js" defer></script>
  <script src="p2.js" defer></script>
  <script src="assets/global-network/data.js" defer></script>
  <script src="p4.js" defer></script>
</head>
<body class="is-loading">
  <!-- Preview 1: loader + header & dropdown -->
  <div class="p1 p4-chrome">
  {s['p1_loader']}
  {s['p1_skip']}
  {h}
  </div>

  <main id="main">
    <!-- Preview 1: video + about -->
    <div class="p1">
    {hero}

    {s['p1_about']}
    </div>

    <!-- Preview 2: products + "New products on the way" -->
    <div class="p2">
    {products}
    </div>

    <!-- Preview 1: news & resources -->
    <div class="p1">
    {s['p1_news']}
    </div>

    <!-- New: Global network -->
    <div class="p2 p4-gn-wrap">
    {gn}
    </div>

    <!-- Preview 2: become a distributor + form -->
    <div class="p2">
    {business}

    {contact}
    </div>
  </main>

  <!-- Preview 2: footer -->
  <div class="p2">
  {footer}
  </div>

  {enq}
</body>
</html>
'''
open('index.html', 'w', encoding='utf8').write(html)

# ---- Scripts: original code, wrapped in an IIFE, with queries scoped to their own preview
p1 = open('src/preview-1/script.js', encoding='utf8').read()
for old, new in [
    ("document.querySelector('[data-product-explorer]')", "document.querySelector('.p1 [data-product-explorer]')"),
    ("document.querySelector('.contact form')", "document.querySelector('.p1 .contact form')"),
    ("document.querySelectorAll('main>section:not(.hero)')", "document.querySelectorAll('main>.p1>section:not(.hero)')"),
    ("document.querySelectorAll('.section-reveal,[data-reveal],.range-list article')",
     "document.querySelectorAll('.p1 .section-reveal,.p1 [data-reveal],.p1 .range-list article')"),
]:
    p1 = sub(p1, old, new, label='p1.js')
open('p1.js', 'w', encoding='utf8').write('/* Preview 1 script (src/preview-1/script.js), scoped to .p1 */\n(() => {\n' + p1 + '\n})();\n')

p2 = open('src/preview-2/script.js', encoding='utf8').read()
p2, n = re.subn(r"document\.querySelector(All)?\((['\"])(?!\.p2 )(.+?)\2\)",
                lambda m: f"document.querySelector{m.group(1) or ''}({m.group(2)}.p2 {m.group(3)}{m.group(2)})", p2)
p2 = sub(p2, 'revealGroups.flatMap((selector) => [...document.querySelectorAll(selector)])',
         'revealGroups.flatMap((selector) => [...document.querySelectorAll(`.p2 ${selector}`)])', label='p2.js')
open('p2.js', 'w', encoding='utf8').write('/* Preview 2 script (src/preview-2/script.js), scoped to .p2 */\n(() => {\n' + p2 + '\n})();\n')
print('index.html, p1.js, p2.js built;', n, 'Preview 2 queries scoped')
