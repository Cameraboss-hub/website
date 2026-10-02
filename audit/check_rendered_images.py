"""Check every unique display/social/CSS image in the completed build.

Local files are checked on disk, or over HTTP when a preview URL is supplied.
Remote URLs are read-only probed, with GET fallback for servers rejecting HEAD.
"""
import concurrent.futures
import datetime
import html
import json
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
BUILD = ROOT / '.vercel/output/static'
PREVIEW = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else ''
ORIGIN = 'https://www.cameraboss.co.uk'
OWNED = {'www.cameraboss.co.uk', 'cameraboss.co.uk'}
images = {}

def remember(url, route):
    url = html.unescape(url).strip()
    if not url or url.startswith(('data:', '#')):
        return
    absolute = urllib.parse.urljoin(ORIGIN + route, url)
    if urllib.parse.urlparse(absolute).scheme not in {'http', 'https'}:
        return
    images.setdefault(absolute, set()).add(route)

class Images(HTMLParser):
    def __init__(self, route):
        super().__init__(convert_charrefs=True)
        self.route = route
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in {'img', 'source'}:
            if tag == 'img':
                remember(a.get('src', ''), self.route)
            for entry in a.get('srcset', '').split(','):
                if entry.strip(): remember(entry.strip().split()[0], self.route)
        if tag == 'meta' and a.get('property', a.get('name', '')) in {'og:image', 'twitter:image'}:
            remember(a.get('content', ''), self.route)

for file in BUILD.rglob('*.html'):
    route = '/' + file.relative_to(BUILD).as_posix().replace('index.html', '')
    source = file.read_text(errors='ignore')
    Images(route).feed(source)
    for url in re.findall(r'url\([\"\']?([^\)\"\']+)[\"\']?\)', source):
        remember(url, route)

def probe(item):
    url, routes = item
    parsed = urllib.parse.urlparse(url)
    row = {'url': url, 'pages': sorted(routes)}
    if parsed.hostname in OWNED:
        local = BUILD / urllib.parse.unquote(parsed.path).lstrip('/')
        if not local.is_file(): return {**row, 'ok': False, 'error': 'Missing local file'}
        if not PREVIEW: return {**row, 'ok': True, 'method': 'local-file'}
        target = PREVIEW + parsed.path + ('?' + parsed.query if parsed.query else '')
    else:
        target = url
    for method in ('HEAD', 'GET'):
        try:
            request = urllib.request.Request(target, method=method, headers={'User-Agent':'Mozilla/5.0 CameraBoss image QA'})
            with urllib.request.urlopen(request, timeout=20) as response:
                media = response.headers.get('Content-Type', '')
                return {**row, 'ok': response.status == 200 and media.startswith('image/'),
                        'status': response.status, 'content_type': media, 'method': method}
        except urllib.error.HTTPError as error:
            if method == 'HEAD': continue
            return {**row, 'ok': False, 'status': error.code, 'error': str(error)}
        except Exception as error:
            if method == 'HEAD': continue
            return {**row, 'ok': False, 'error': str(error)}

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
    rows = list(pool.map(probe, sorted(images.items())))
now = datetime.datetime.now(datetime.timezone.utc)
report = {'checked_at': now.isoformat(), 'preview': PREVIEW or None, 'images': rows}
(ROOT / f'audit/rendered-images-{now.date().isoformat()}.json').write_text(json.dumps(report, indent=2) + '\n')
failed = [row for row in rows if not row['ok']]
print('unique images', len(rows), 'failed', len(failed))
for row in failed: print(json.dumps(row))
if failed: raise SystemExit(1)
