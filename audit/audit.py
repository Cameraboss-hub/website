#!/usr/bin/env python3
"""Read-only migration audit. Fetch public pages; compare with Astro build output."""
import sys
import concurrent.futures, hashlib, json, re, time, urllib.request, urllib.error
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urldefrag, unquote
from html.parser import HTMLParser
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
OUT=Path(__file__).resolve().parent / 'evidence'; CACHE=OUT/'live'; CACHE.mkdir(exist_ok=True)
SITE='https://www.cameraboss.co.uk'
class Page(HTMLParser):
 def __init__(self, html):
  super().__init__(convert_charrefs=True); self.links=[]; self.images=[]; self.ids=[]; self.title=''; self.h1=[]; self.meta={}; self.canonical=''; self.text=[]; self.depth=0; self.intitle=False; self.inh1=False; self.schemas=[]; self.schema=False; self.schema_text=''; self.forms=[]; self.iframes=[]; self.feed(html)
 def handle_starttag(self,t,a):
  d=dict(a)
  if t in ('script','style'): self.depth+=1
  if t=='script' and d.get('type')=='application/ld+json': self.schema=True; self.schema_text=''
  if t=='title': self.intitle=True
  if t=='h1': self.inh1=True; self.h1.append('')
  if d.get('id'): self.ids.append(d['id'])
  if t=='a' and 'href' in d: self.links.append(d['href'])
  if t=='img': self.images.append(d)
  if t=='meta': self.meta[d.get('name',d.get('property','')).lower()]=d.get('content','')
  if t=='link' and d.get('rel')=='canonical': self.canonical=d.get('href','')
  if t=='form': self.forms.append(d.get('action',''))
  if t=='iframe': self.iframes.append(d.get('src',''))
 def handle_endtag(self,t):
  if t in ('script','style'): self.depth=max(0,self.depth-1)
  if t=='script' and self.schema:
   try: self.schemas.append(json.loads(self.schema_text))
   except: self.schemas.append({'invalid_json':True})
   self.schema=False
  if t=='title': self.intitle=False
  if t=='h1': self.inh1=False
 def handle_data(self,d):
  if self.schema: self.schema_text+=d
  if self.intitle: self.title+=d
  if self.inh1 and self.h1: self.h1[-1]+=d
  if not self.depth: self.text.append(d)
 def summary(self):
  return {'title':self.title.strip(),'description':self.meta.get('description',''),'canonical':self.canonical,'robots':self.meta.get('robots',''),'h1':self.h1,'links':self.links,'images':self.images,'ids':self.ids,'forms':self.forms,'iframes':self.iframes,'schemas':self.schemas,'text':' '.join(' '.join(self.text).split())}
def fetch(url):
 key=hashlib.sha256(url.encode()).hexdigest(); f=CACHE/(key+'.json')
 if f.exists() and "--refresh" not in sys.argv: return json.loads(f.read_text())
 result={'url':url}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'CameraBossMigrationAudit/1.0 (owner-requested read-only verification)'})
  with urllib.request.urlopen(req,timeout=25) as r:
   body=r.read().decode('utf-8','replace'); result.update(status=r.status,final_url=r.url,content_type=r.headers.get('content-type',''))
  if 'html' in result['content_type']: result.update(Page(body).summary())
  else: result['body']=body
 except urllib.error.HTTPError as e: result.update(status=e.code,final_url=e.url)
 except Exception as e: result.update(status=0,error=str(e))
 f.write_text(json.dumps(result)); return result
posts=json.loads((ROOT/'src/data/posts.json').read_text()); pages=json.loads((ROOT/'src/data/pages.json').read_text())
sm=ET.fromstring(fetch(SITE+'/sitemap.xml')['body']); sitemap=[e.text for e in sm.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
seeds=set(sitemap+[SITE+'/blog/',SITE+'/robots.txt']+[SITE+p['path'] for p in pages]+[p['original_url'] for p in posts]); results={}
def internal(u):
 p=urlsplit(u)
 return p.scheme in ('https','http') and p.hostname in ('www.cameraboss.co.uk','cameraboss.co.uk') and not re.search(r'\.(?:jpg|jpeg|png|webp|svg|pdf|zip|mp4|css|js)$',p.path,re.I)
def norm(u):
 p=urlsplit(urldefrag(u)[0]); return SITE+(p.path or '/')+('?' + p.query if p.query else '')
queue={norm(u) for u in seeds if internal(u)}
while queue:
 batch=sorted(queue-set(results)); queue=set()
 if not batch: break
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
  for r in ex.map(fetch,batch):
   results[r['url']]=r
   for href in r.get('links',[]) + ([r['canonical']] if r.get('canonical') else []):
    u=urljoin(r.get('final_url',r['url']),href)
    if internal(u) and norm(u) not in results: queue.add(norm(u))
   if len(results)%50==0: print('Live pages checked',len(results),flush=True)
 if len(results)>1500: raise RuntimeError('Crawl exceeds 1500 URLs; inspect query loops before continuing')
(OUT/'live-pages.json').write_text(json.dumps(results,indent=2))
(OUT/'live-sitemap-urls.json').write_text(json.dumps(sitemap,indent=2))
print('Live crawl complete',len(results),flush=True)
# Parse all generated pages, including assets and links.
static=ROOT/'.vercel/output/static'; built={}
for f in static.rglob('*.html'):
 path='/'+str(f.relative_to(static)); path=path[:-10] if path.endswith('index.html') else path
 built[path]=Page(f.read_text()).summary()
redirects={}
config=json.loads((ROOT/'.vercel/output/config.json').read_text())
for route in config['routes']:
 if route.get('status') in (301,302,307,308) and 'Location' in route.get('headers',{}):
  redirects[route['src'].removeprefix('^').removesuffix('$')]=route['headers']['Location']
redirects.update({'/client-area':'/galleries/','/videos':'/Wedding-videos/','/wedding-videos':'/Wedding-videos/'})
def resolve(path):
 if path in built:return path,'page'
 if path.rstrip('/')+'/' in built:return path.rstrip('/')+'/','page'
 if path.rstrip('/') in redirects:return redirects[path.rstrip('/')],'redirect'
 if (static/unquote(path.lstrip('/'))).is_file():return path,'asset'
 return path,'missing'
broken=[]; anchors=[]; badimages=[]
for path,p in built.items():
 for href in p['links']:
  u=urlsplit(urljoin(SITE+path,href))
  if u.hostname not in ('www.cameraboss.co.uk','cameraboss.co.uk'):continue
  target,kind=resolve(u.path)
  if kind=='missing':broken.append({'source':path,'href':href,'target':u.path})
  elif u.fragment and u.fragment.lower() != 'top' and kind=='page' and unquote(u.fragment) not in built[target]['ids']:anchors.append({'source':path,'href':href})
 for im in p['images']:
  src=im.get('src','')
  if src.startswith('/') and not (static/src.lstrip('/')).is_file():badimages.append({'source':path,'src':src})
parity=[]
for url,live in results.items():
 if live.get('status')!=200 or 'title' not in live:continue
 target,kind=resolve(urlsplit(url).path); local=built.get(target,{})
 parity.append({'url':url,'kind':kind,'target':target,'live_final':live.get('final_url'),'live_title':live['title'],'clone_title':local.get('title'),'title_equal':live['title']==local.get('title'),'live_description':live.get('description'),'clone_description':local.get('description'),'description_equal':live.get('description')==local.get('description'),'live_canonical':live.get('canonical'),'clone_canonical':local.get('canonical')})
summary={'live_urls_checked':len(results),'live_status_counts':{str(s):sum(r.get('status')==s for r in results.values()) for s in sorted({r.get('status') for r in results.values()})},'live_sitemap_count':len(sitemap),'built_html_pages':len(built),'imported_posts':len(posts),'imported_pages':len(pages),'live_200_missing_in_clone':[r for r in parity if r['kind']=='missing'],'changed_titles':sum(not r['title_equal'] for r in parity if r['kind']=='page'),'changed_descriptions':sum(not r['description_equal'] for r in parity if r['kind']=='page'),'broken_internal_link_instances':len(broken),'broken_internal_targets':sorted({r['target'] for r in broken}),'broken_anchor_instances':len(anchors),'missing_local_images':badimages,'h1_issues':[{'path':p,'headings':v['h1']} for p,v in built.items() if len(v['h1'])!=1],'invalid_schema':[p for p,v in built.items() if any(s.get('invalid_json') for s in v['schemas'] if isinstance(s,dict))]}
for name,data in [('built-pages',built),('url-parity',parity),('broken-internal-links',broken),('broken-anchors',anchors),('summary',summary)]: (OUT/(name+'.json')).write_text(json.dumps(data,indent=2))
print(json.dumps(summary,indent=2),flush=True)
