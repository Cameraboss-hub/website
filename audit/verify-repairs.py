import json,re,hashlib,urllib.request,urllib.error,concurrent.futures
from pathlib import Path
from urllib.parse import urljoin,urlsplit,unquote
from html.parser import HTMLParser
r=Path(__file__).resolve().parents[1]; b=r/'.vercel/output/static'
class H(HTMLParser):
 def __init__(self,s):super().__init__();self.links=[];self.ids=set();self.title='';self.t=False;self.desc='';self.feed(s)
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='a' and d.get('href'):self.links.append(d['href'])
  if d.get('id'):self.ids.add(d['id'])
  if t=='title':self.t=True
  if t=='meta' and d.get('name')=='description':self.desc=d.get('content','')
 def handle_endtag(self,t):
  if t=='title':self.t=False
 def handle_data(self,s):
  if self.t:self.title+=s
pages={('/'+str(f.relative_to(b))).replace('index.html',''):H(f.read_text()) for f in b.rglob('*.html')}
paths=set(json.loads((r/'tests/legacy-urls.json').read_text()));anchors=[]
for path,h in pages.items():
 for link in h.links:
  u=urlsplit(urljoin('https://www.cameraboss.co.uk'+path,link))
  if u.hostname not in ('www.cameraboss.co.uk','cameraboss.co.uk'):continue
  paths.add(u.path+('?' +u.query if u.query else ''))
  if u.fragment and u.fragment!='top' and (dest:=pages.get(u.path if u.path.endswith('/') else u.path+'/')) and unquote(u.fragment) not in dest.ids: anchors.append([path,link])
paths.update(['/galleries/faithandjack/?download=1','/galleries/kachyoge/','/galleries/familyshoot/','/galleries/?q=faith','/faithandjack','/faithandjack/'])
for key in json.loads((r/'src/data/legacy-aliases.json').read_text()):paths.update([key,key+'/'])
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args):return None
opener=urllib.request.build_opener(NoRedirect)
def get(p):
 try:
  with opener.open('http://127.0.0.1:3200'+p,timeout=20) as x:return {'path':p,'status':x.status,'location':x.headers.get('Location')}
 except urllib.error.HTTPError as e:return {'path':p,'status':e.code,'location':e.headers.get('Location')}
 except Exception as e:return {'path':p,'status':0,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:rows=list(pool.map(get,sorted(paths)))
base=json.loads((r/'src/data/seo-baseline.json').read_text());diff=[]
for path,v in base.items():
 h=pages.get(path)
 if not h:diff.append([path,'missing']);continue
 for key,val in [('title',h.title),('description',h.desc)]:
  if v.get(key) and val!=v[key]:diff.append([path,key])
original=Path('/Users/johnlekan/cameraboss-website'); inv=json.loads((r/'audit/evidence/file-inventory.json').read_text());changed=[];verified=0
for row in inv:
 p=original/row['file']
 if p.is_file():
  verified+=1
  if hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:changed.append(row['file'])
summary={'checked_urls':len(rows),'bad_responses':[x for x in rows if x['status'] not in (200,301,302,307,308)],'anchors':anchors,'metadata_differences':diff,'original_files_checked':verified,'original_files_changed':changed}
(r/'audit/evidence/repairs-http.json').write_text(json.dumps({'summary':summary,'responses':rows},indent=2));print(json.dumps(summary,indent=2))
