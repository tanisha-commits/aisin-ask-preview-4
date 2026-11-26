"""Cuts exact section markup out of the two original previews (src/preview-*/index.html)."""
import re, sys, json
def grab(html, start_pat, tag):
    m = re.search(start_pat, html)
    if not m: sys.exit('not found: ' + start_pat)
    i = m.start(); depth = 0
    for t in re.finditer(r'<(/?)%s\b[^>]*>' % tag, html[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0: return html[i:i + t.end()]
p1 = open('src/preview-1/index.html', encoding='utf8').read()
p2 = open('src/preview-2/index.html', encoding='utf8').read()
out = {
 'p1_loader': re.search(r'<div class="site-loader".*?</div>', p1).group(0),
 'p1_skip': re.search(r'<a class="skip-link"[^>]*>.*?</a>', p1).group(0),
 'p1_header': grab(p1, r'<header class="site-header"', 'header'),
 'p1_hero': grab(p1, r'<section class="hero"', 'section'),
 'p1_about': grab(p1, r'<section class="brand-proof', 'section'),
 'p1_news': grab(p1, r'<section class="updates"', 'section'),
 'p2_products': grab(p2, r'<section class="product-section"', 'section'),
 'p2_business': grab(p2, r'<section class="business"', 'section'),
 'p2_contact': grab(p2, r'<section class="contact"', 'section'),
 'p2_footer': grab(p2, r'<footer class="footer"', 'footer'),
}
json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, len(v))
