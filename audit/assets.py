import json, re, urllib.request, urllib.error, concurrent.futures, hashlib
from pathlib import Path
from urllib.parse import urlsplit, urljoin
ROOT=Path(__file__).resolve().parent.parent; OUT=Path(__file__).resolve().parent / 'evidence'
assets=set(); external=set(); built=json.loads((OUT/'built-pages.json').read_text())
for path,p in built.items():
 for i in p['images']:
  if i.get('src','').startswith('https://'): assets.add(i['src'])
 for link in p['links']:
  if link.startswith('https://') and urlsplit(link).hostname not in ('www.cameraboss.co.uk','cameraboss.co.uk'): external.add(link)
for f in (ROOT/'.vercel/output/static').rglob('*.html'):
 html=f.read_text()
 for u in re.findall(r'https://[^\s"<>\\]+',html):
  if re.search(r'\.(?:webp|png|jpe?g|svg)(?:\?.*)?$',u): assets.add(u.rstrip("')"))
# Public gallery URLs are read only; never submit PINs or forms.
urls=sorted(assets|external); results=[]
def check(u):
 r={'url':u,'kind':'asset' if u in assets else 'external-link'}
 try:
  req=urllib.request.Request(u,method='HEAD',headers={'User-Agent':'Mozilla/5.0 (CameraBoss owner-requested migration verification)'})
  with urllib.request.urlopen(req,timeout=15) as x: r.update(status=x.status,final_url=x.url,content_type=x.headers.get('Content-Type',''),bytes=x.headers.get('Content-Length'))
 except urllib.error.HTTPError as e: r['status']=e.code
 except Exception as e:r.update(status=0,error=str(e))
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
 for r in ex.map(check,urls):
  results.append(r)
  if len(results)%250==0: print('Checked',len(results),'/',len(urls),flush=True)
(OUT/'assets-and-external-links.json').write_text(json.dumps(results,indent=2))
print('COMPLETE',len(results),'non-200',sum(r['status']!=200 for r in results),flush=True)
