import re,html,json,sys
t=open(sys.argv[1],encoding='utf8').read()
cl=lambda s:re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
out=[];region=None
for m in re.finditer(r'<h2 class="blockTtl">(.*?)</h2>|<div class="globalVox">(.*?)<!-- /globalVox -->',t,re.S):
    if m.group(1): region=cl(m.group(1)); continue
    b=m.group(2); name=cl(re.search(r'<span class="title">(.*?)</span>',b,re.S).group(1))
    url=re.search(r'href="([^"]+)"',b.split('</h3>')[0]); rows={cl(k):cl(v) for k,v in re.findall(r'<th>(.*?)</th>\s*<td>(.*?)</td>',b,re.S)}
    out.append(dict(region=region,name=name,url=url.group(1) if url else '',**{k.lower():v for k,v in rows.items()}))
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
from collections import Counter;print(len(out),Counter(o['region'] for o in out),Counter(k for o in out for k in o))
