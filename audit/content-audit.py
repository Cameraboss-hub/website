import json,re,collections,hashlib
from pathlib import Path
from urllib.parse import urlsplit
O=Path(__file__).resolve().parent / 'evidence'; R=Path(__file__).resolve().parent.parent
a=json.loads((O/'live-pages.json').read_text()); b=json.loads((O/'built-pages.json').read_text()); sm=json.loads((O/'live-sitemap-urls.json').read_text()); rows=[]
def words(s):return re.findall(r'\w+',s.lower())
def grams(s):
 w=words(s);return {' '.join(w[i:i+8]) for i in range(len(w)-7)}
def types(s):
 out=[]
 def visit(x):
  if isinstance(x,dict):
   if '@type' in x:out.extend(x['@type'] if isinstance(x['@type'],list) else [x['@type']])
   for v in x.values():visit(v)
  elif isinstance(x,list):
   for v in x:visit(v)
 visit(s);return set(out)
for u in sm:
 p=urlsplit(u).path;x=a.get(u,{});y=b.get(p,{})
 if not y or x.get('status')!=200:continue
 g=grams(x.get('text','')); h=grams(y.get('text',''))
 rows.append({'path':p,'live_word_count':len(words(x.get('text',''))),'clone_word_count':len(words(y.get('text',''))),'live_text_shingle_retention':round(len(g&h)/len(g),3) if g else None,'live_schema_types':sorted(types(x['schemas'])),'clone_schema_types':sorted(types(y['schemas'])),'schema_types_removed':sorted(types(x['schemas'])-types(y['schemas']))})
(O/'content-comparison.json').write_text(json.dumps(rows,indent=2))
print('Content comparison lowest ratios',[(x['path'],x['live_text_shingle_retention']) for x in sorted(rows,key=lambda x:x['live_text_shingle_retention'] or 0)[:12]])
print('Pages losing schema types:',sum(bool(x['schema_types_removed']) for x in rows),'types:',collections.Counter(t for x in rows for t in x['schema_types_removed']))
print('FAQ pages losing FAQPage', [x['path'] for x in rows if 'FAQPage' in x['schema_types_removed']][:12])
# Verify all source/post paths against actual HTTP on local preview, not just built filesystem.
import urllib.request,urllib.error,concurrent.futures
paths=set(b)|set(urlsplit(u).path for u in sm)
config=json.loads((R/'.vercel/output/config.json').read_text())
for r in config['routes']:
 if r.get('status')==301:
  p=r['src'].removeprefix('^').removesuffix('$'); paths.update([p,p+'/'])
paths.update(['/wedding-videos/','/videos/','/client-area/?tag=wedding','/definitely-missing-cameraboss-audit-page/'])
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a,**k):return None
def check(p):
 try:
  with urllib.request.build_opener(NoRedirect).open('http://127.0.0.1:3200'+p,timeout=20) as r:return {'path':p,'status':r.status,'location':r.headers.get('location')}
 except urllib.error.HTTPError as e:return {'path':p,'status':e.code,'location':e.headers.get('location')}
 except Exception as e:return {'path':p,'status':0,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex: http=list(ex.map(check,sorted(paths)))
(O/'local-http-checks.json').write_text(json.dumps(http,indent=2));print('Local HTTP statuses',collections.Counter(r['status'] for r in http));print('Unexpected failures',[r for r in http if r['status']>=400 and r['path'] not in ['/404.html','/definitely-missing-cameraboss-audit-page/']])
