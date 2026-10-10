import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSeoEntries, validatePostEntries } from '../src/lib/cms-validation.mjs';

test('SEO edits cannot redirect an existing route or remove a protected record',()=>{
  const routes={home:'/'};
  assert.deepEqual(validateSeoEntries({'home.json':{path:'/',title:'CameraBoss',description:'New SEO copy'}},routes),{'/':{title:'CameraBoss',description:'New SEO copy'}});
  assert.throws(()=>validateSeoEntries({'home.json':{path:'/other/',title:'CameraBoss',description:''}},routes),/route changed/);
  assert.throws(()=>validateSeoEntries({},routes),/record missing/);
});

test('drafts stay unpublished and an archived blog URL cannot be overwritten',()=>{
  assert.deepEqual(validatePostEntries({'draft.json':{published:false}},[]),[]);
  assert.throws(()=>validatePostEntries({'existing.json':{published:false}},['existing']),/conflicting/);
  assert.throws(()=>validatePostEntries({'..json':{published:false}},[]),/invalid/);
});

test('published articles preserve a fixed URL and cannot inject executable markup',()=>{
  const [post]=validatePostEntries({'new-story.json':{published:true,title:'A new story',date:'2026-10-02',meta_description:'A wedding story',html:'<p>Hello</p><script>alert(1)</script><a href="javascript:alert(1)">link</a><img src="/images/uploads/photo.webp" onerror="alert(1)">'}},[]);
  assert.equal(post.original_url,'https://www.cameraboss.co.uk/blog/new-story/');
  assert.equal(post.date,'2 Oct, 2026');
  assert.doesNotMatch(post.html,/script|javascript:|onerror/);
  assert.match(post.html,/<img src="\/images\/uploads\/photo.webp"/);
});
