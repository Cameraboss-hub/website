"""Regression checks against the generated website, independent of dev-server routing."""
from pathlib import Path
import json,re,unittest,xml.etree.ElementTree as ET
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/'.vercel/output/static'
class HTML(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=True);self.tags=[];self.title='';self.in_title=False;self.feed(s)
 def handle_starttag(self,t,a):
  self.tags.append((t,dict(a)));self.in_title = self.in_title or t=='title'
 def handle_endtag(self,t):
  if t=='title':self.in_title=False
 def handle_data(self,s):
  if self.in_title:self.title+=s
 def attrs(self,tag):return [a for t,a in self.tags if t==tag]
def page(path):return (BUILD/(path.strip('/')+'/index.html' if path!='/' else 'index.html')).read_text()
class MigrationTests(unittest.TestCase):
 def test_all_legacy_urls_retained(self):
  for path in json.loads((ROOT/'tests/legacy-urls.json').read_text()):
   with self.subTest(path=path):self.assertTrue((BUILD/(path.strip('/')+'/index.html' if path!='/' else 'index.html')).is_file())
 def test_all_recorded_metadata_preserved(self):
  for path,expected in json.loads((ROOT/'src/data/seo-baseline.json').read_text()).items():
   with self.subTest(path=path):
    p=HTML(page(path));self.assertEqual(p.title,expected['title'])
    if expected['description']:self.assertEqual(next(x['content'] for x in p.attrs('meta') if x.get('name')=='description'),expected['description'])
 def test_client_galleries_stay_on_pixieset(self):
  p=HTML(page('/client-area/'));links={x.get('href') for x in p.attrs('a')}
  for slug in ['faithandjack','kachyandoge','familyshoot-1']:self.assertIn(f'https://gallery.cameraboss.co.uk/{slug}/',links)
  self.assertNotIn('Disallow: /galleries/',(BUILD/'robots.txt').read_text())
  urls=[x.text for x in ET.parse(BUILD/'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
  self.assertIn('https://www.cameraboss.co.uk/client-area/',urls)
  self.assertFalse(any('/galleries/' in x for x in urls))
 def test_no_client_download_credentials_in_output(self):
  self.assertFalse(list((BUILD/'galleries').glob('*/index.html')))
  for f in BUILD.rglob('*.html'):
   self.assertNotRegex(f.read_text(),r'(?:const|var|let) pin =')
 # Every page that carried the Studio Ninja embed now loads the CRM form
 # instead: the three hand-built pages plus the twelve migrated ones.
 FORM_PAGES=['/','/about/','/contact/','/pricing/','/pricing-NG/','/weddings/','/experience/',
  '/London-wedding-photographer/','/London-Wedding-Photography-Packages/',
  '/Asian-wedding-photographer-Leicester/','/sheffield-wedding-photographer/',
  '/Wolverhampton-wedding-photographer/','/Italy-destination-wedding-photographer/',
  '/Graduation-Photographer/','/Weddingchecklist/']
 def test_crm_enquiry_embed_replaces_every_studio_ninja_form(self):
  for path in self.FORM_PAGES:
   with self.subTest(path=path):
    text=page(path);p=HTML(text)
    embeds=[a for a in p.attrs('script')
            if a.get('src')=='https://cameraboss-crm.vercel.app/embed.js']
    self.assertEqual(len(embeds),1,'exactly one CRM embed')
    self.assertEqual(embeds[0].get('data-brand'),'cameraboss')
    self.assertEqual(embeds[0].get('data-form'),'general-enquiry')
    # A visitor without JavaScript still gets a route to the form.
    self.assertIn('https://cameraboss-crm.vercel.app/book/cameraboss/general-enquiry',text)
    self.assertNotIn('coming soon',text)
 def test_no_studio_ninja_anywhere_in_the_build(self):
  for f in BUILD.rglob('*'):
   if f.is_file() and f.suffix in {'.html','.js','.css','.json','.txt','.xml'}:
    with self.subTest(file=str(f.relative_to(BUILD))):
     self.assertNotIn('app.studioninja.co',f.read_text(errors='ignore'))
 def test_crm_origin_is_preconnected(self):
  links=HTML(page('/contact/')).attrs('link')
  self.assertTrue(any(l.get('rel')=='preconnect' and l.get('href')=='https://cameraboss-crm.vercel.app' for l in links))
 def test_video_embeds_are_left_alone(self):
  # Only Studio Ninja's contact form was replaced. The film pages build their
  # YouTube players on click, so their references must still be there --
  # including on /experience/, which carried a video *and* the old form.
  for path in ['/Wedding-videos/','/experience/']:
   with self.subTest(path=path):self.assertIn('youtube',page(path))
 def test_homepage_metadata_and_specific_links(self):
  p=HTML(page('/'));self.assertEqual(p.title,'Nigerian Wedding Photographer in London & across UK')
  descriptions=[x['content'] for x in p.attrs('meta') if x.get('name')=='description']
  self.assertIn('Trusted Yoruba wedding photographer in London',descriptions[0])
  hrefs={x.get('href') for x in p.attrs('a')}
  for href in ['https://cameraboss.pixieset.com/dana/','https://gallery.cameraboss.co.uk/bridalshoot/','https://gallery.cameraboss.co.uk/jumokeandstephen/']:self.assertIn(href,hrefs)
 def test_clean_metadata_and_single_footer(self):
  for f in BUILD.rglob('*.html'):
   with self.subTest(page=str(f.relative_to(BUILD))):
    text=f.read_text();p=HTML(text)
    self.assertFalse(any(any(c in a.get('class','').split() for c in ['theme-12-footer','block-theme12-footer']) for _,a in p.tags), str(f))
    for m in p.attrs('meta'):
     if m.get('name')=='description':self.assertNotRegex(m.get('content',''),r'verified by QA|og:description identical|&mdash;')
    self.assertEqual(len([x for x in p.attrs('meta') if x.get('name')=='robots']),1)
 def test_robots_canonicals_and_internal_links(self):
  for f in BUILD.rglob('*.html'):
   p=HTML(f.read_text())
   self.assertEqual(len(p.attrs('h1')),1,str(f))
   self.assertEqual(len(p.attrs('title')),1,str(f))
   canonical=[x.get('href') for x in p.attrs('link') if x.get('rel')=='canonical'];self.assertEqual(len(canonical),1)
   self.assertTrue(canonical[0].startswith('https://www.cameraboss.co.uk/'))
  self.assertIn('noindex',next(x['content'] for x in HTML((BUILD/'404.html').read_text()).attrs('meta') if x.get('name')=='robots'))
 def test_video_metadata_not_fabricated(self):
  text=page('/Wedding-videos/')
  self.assertNotIn('2022-01-01',text)
  self.assertNotIn('maxresdefault.jpg',text)
if __name__=='__main__':unittest.main()
