// Optional launch diagnostic, run only on a deliberately requested preview build.
import fs from 'node:fs';

if (process.env.CAMERABOSS_VERIFY_IMAGES !== '1') process.exit(0);
const inventory = JSON.parse(fs.readFileSync('audit/rendered-images-2026-10-02.json', 'utf8'));
const remote = inventory.images.filter(row => new URL(row.url).hostname !== 'www.cameraboss.co.uk');
const pending = remote.filter(row => row.ok !== true);
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
      last = {...row,method,status:response.status,content_type:type,checked_at:new Date().toISOString(),
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
    await new Promise(resolve => setTimeout(resolve, 250));
    if (rows.length % 250 === 0) console.log(`Launch image check: ${rows.length}/${pending.length}`);
  }
}
await Promise.all(Array.from({length:4},worker));
const updates = new Map(rows.map(row => [row.url,row]));
const reconciled = remote.map(row => updates.get(row.url) || row);
const report = {checked_at:new Date().toISOString(),environment:'Vercel preview build',
  checked:reconciled.length,rechecked:rows.length,passed:reconciled.filter(r=>r.ok).length,
  unavailable:reconciled.filter(r=>!r.ok),images:reconciled.sort((a,b)=>a.url.localeCompare(b.url))};
fs.writeFileSync('.vercel/output/static/launch-image-check.json',JSON.stringify(report));
console.log(`Launch image check: ${report.passed}/${report.checked} passed; ${report.unavailable.length} unavailable or blocked.`);
