import fs from 'node:fs';
import path from 'node:path';
import { validatePostEntries } from '../src/lib/cms-validation.mjs';

const root = process.cwd();
const entries = Object.fromEntries(fs.readdirSync('cms/posts').filter(f=>f.endsWith('.json')).map(f=>[f,JSON.parse(fs.readFileSync(path.join('cms/posts',f),'utf8'))]));
const archive = JSON.parse(fs.readFileSync('src/data/posts.json','utf8'));
const posts = validatePostEntries(entries, archive.map(p=>p.slug));
const output = path.resolve(root,'.vercel/output/static');
for (const post of posts) {
  const route = `/blog/${post.slug}/`;
  const file = path.join(output,route,'index.html');
  if (!fs.existsSync(file)) throw new Error(`CMS: published article was not built: ${route}`);
  const markup = fs.readFileSync(file,'utf8');
  for (const [tag,attribute] of [['a','href'],['img','src']]) {
    const pattern = new RegExp(`<${tag}\\b[^>]*${attribute}="([^"]+)"`,'gi');
    for (const match of markup.matchAll(pattern)) {
      if (/^(#|mailto:|tel:)/.test(match[1])) continue;
      const url = new URL(match[1].replace(/&amp;/g,'&'),'https://www.cameraboss.co.uk'+route);
      if (!['www.cameraboss.co.uk','cameraboss.co.uk'].includes(url.hostname)) continue;
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      const target = path.resolve(output,relative);
      if (target!==output && !target.startsWith(output+path.sep)) throw new Error(`CMS: invalid local URL ${url.pathname}`);
      if (tag==='img') {
        if (!fs.existsSync(target) || !fs.statSync(target).isFile()) throw new Error(`CMS: missing image ${url.pathname}`);
      } else if (!url.pathname.startsWith('/api/') && !fs.existsSync(path.join(target,'index.html')) && !(fs.existsSync(target) && fs.statSync(target).isFile())) {
        throw new Error(`CMS: broken internal link ${url.pathname}`);
      }
    }
  }
}
console.log(`CMS: checked ${posts.length} published articles for built routes, internal links and local images.`);
