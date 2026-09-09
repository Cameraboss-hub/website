import json,urllib.request,urllib.error,concurrent.futures
from pathlib import Path
O=Path(__file__).resolve().parent / 'evidence';rows=json.loads((O/'assets-and-external-links.json').read_text());todo=[x for x in rows if x['status']==404 or (x['status']==0 and 'supabase.co' in x['url'])]
def check(x):
 r={'url':x['url'],'head_status':x['status']}
 try:
  req=urllib.request.Request(x['url'],headers={'User-Agent':'Mozilla/5.0','Range':'bytes=0-127'})
  with urllib.request.urlopen(req,timeout=25) as res: r.update(get_status=res.status,content_type=res.headers.get('Content-Type'));res.read(128)
 except urllib.error.HTTPError as e:r['get_status']=e.code
 except Exception as e:r.update(get_status=0,error=str(e))
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:r=list(ex.map(check,todo))
(O/'asset-rechecks.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
