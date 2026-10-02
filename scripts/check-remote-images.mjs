// Optional launch diagnostic, run only on a deliberately requested preview build.
import fs from 'node:fs';

if (process.env.CAMERABOSS_VERIFY_IMAGES !== '1') process.exit(0);
const inventory = JSON.parse(fs.readFileSync('audit/rendered-images-2026-10-02.json', 'utf8'));
const pending = inventory.images.filter(row => row.ok === null);
const rows = [];
let next = 0;
async function probe(row) {
  row = {url:row.url,pages:row.pages};
  let last;
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(row.url, {
        method, signal: AbortSignal.timeout(10000),
        headers: { 'User-Agent':'CameraBoss launch image verification', ...(method==='GET' ? {Range:'bytes=0-1023'} : {}) },
      });
      const type = response.headers.get('content-type') || '';
      last = {...row,method,status:response.status,content_type:type,
        ok:[200,206].includes(response.status) && type.startsWith('image/')};
      await response.body?.cancel();
      if (last.ok || method==='GET') return last;
    } catch (error) {
      last = {...row,method,ok:false,error:error.message};
    }
  }
  return last;
}
async function worker() {
  while (next < pending.length) {
    const row = pending[next++];
    rows.push(await probe(row));
    if (rows.length % 250 === 0) console.log(`Launch image check: ${rows.length}/${pending.length}`);
  }
}
await Promise.all(Array.from({length:20},worker));
const report = {checked_at:new Date().toISOString(),environment:'Vercel preview build',
  checked:rows.length,passed:rows.filter(r=>r.ok).length,
  unavailable:rows.filter(r=>!r.ok),images:rows.sort((a,b)=>a.url.localeCompare(b.url))};
fs.writeFileSync('.vercel/output/static/launch-image-check.json',JSON.stringify(report));
console.log(`Launch image check: ${report.passed}/${report.checked} passed; ${report.unavailable.length} unavailable or blocked.`);
