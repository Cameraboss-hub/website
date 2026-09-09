/**
 * Unit tests for the Studio Ninja → CRM swap applied to imported page markup.
 * A pure string transform, so it runs without a build.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { swapStudioNinjaForCrm, hasStudioNinjaEmbed } from "../src/lib/sn-embed.ts";

const PARSER =
  "https://app.studioninja.co/contactform/parser/0a800fc9-7a7c-1768-817a-a68817ea5956/0a800fc9-7ac4-1365-817b-0817cb5472ce";

const EMBED = '<script src="https://cameraboss-crm.vercel.app/embed.js" data-brand="cameraboss" data-form="general-enquiry"></script>';

/** The shape the twelve migrated pages actually ship. */
const block =
  `<iframe height="616" style="min-width: 100%;" id="sn-form-lubat"\n        src="${PARSER}"\n        allowfullscreen>\n</iframe>\n` +
  `<script type="text/javascript" data-iframe-id="sn-form-lubat"\n        src="https://app.studioninja.co/client-assets/form-render/assets/scripts/iframeResizer.js"></script>`;

test("puts the CRM embed exactly where the Studio Ninja iframe stood", () => {
  const html = `<div class="block"><h2>Enquire</h2>${block}<p>After the form.</p></div>`;
  const out = swapStudioNinjaForCrm(html, EMBED);

  assert.equal(hasStudioNinjaEmbed(out), false);
  assert.ok(!out.includes("studioninja"), "no Studio Ninja markup of any kind survives");
  assert.ok(out.includes(EMBED));
  // Position is preserved: removing the embed leaves the original page behind,
  // bar the whitespace that sat between the iframe and the resizer script.
  assert.equal(out.replace(EMBED, "").replace(/\n\s*/g, ""), '<div class="block"><h2>Enquire</h2><p>After the form.</p></div>');
});

test("works when the resizer script was already stripped", () => {
  // clean() drops every <script> before a page is exported, so this is the
  // shape the transform actually meets in production.
  const html = `<span class="wrap"><iframe src="${PARSER}"></iframe></span>`;
  assert.equal(swapStudioNinjaForCrm(html, EMBED), `<span class="wrap">${EMBED}</span>`);
});

test("matches on the parser URL, not the per-page iframe id", () => {
  for (const id of ["sn-form-lubat", "sn-form-htww3", "sn-form-anything"]) {
    const html = `<iframe id="${id}" src="${PARSER}"></iframe>`;
    assert.equal(swapStudioNinjaForCrm(html, EMBED), EMBED, id);
  }
});

test("leaves a page without an embed completely untouched", () => {
  const html = "<div><p>No form here.</p></div>";
  assert.equal(swapStudioNinjaForCrm(html, EMBED), html);
});

test("leaves video embeds and other iframes alone", () => {
  const html =
    `<iframe src="https://www.youtube.com/embed/abc123"></iframe>` +
    `<iframe src="${PARSER}"></iframe>` +
    `<iframe src="https://player.vimeo.com/video/42"></iframe>`;
  const out = swapStudioNinjaForCrm(html, EMBED);
  assert.ok(out.includes("youtube.com/embed/abc123"));
  assert.ok(out.includes("player.vimeo.com/video/42"));
  assert.equal(hasStudioNinjaEmbed(out), false);
});

test("leaves unrelated scripts alone while removing the resizer", () => {
  const html = `<script src="https://example.com/thing.js"></script>${block}`;
  const out = swapStudioNinjaForCrm(html, EMBED);
  assert.ok(out.includes("https://example.com/thing.js"));
  assert.ok(!out.includes("iframeResizer"));
});

test("embeds the form once even when a page carries two Studio Ninja iframes", () => {
  const html = `<a></a><iframe src="${PARSER}"></iframe><b></b><iframe src="${PARSER}"></iframe><c></c>`;
  const out = swapStudioNinjaForCrm(html, EMBED);
  assert.equal(out.split(EMBED).length - 1, 1, "exactly one CRM embed");
  assert.equal(hasStudioNinjaEmbed(out), false);
  assert.equal(out, `<a></a>${EMBED}<b></b><c></c>`);
});

test("still places the form if only the resizer script is present", () => {
  const html = '<p>Hi</p><script src="https://app.studioninja.co/client-assets/form-render/assets/scripts/iframeResizer.js"></script>';
  const out = swapStudioNinjaForCrm(html, EMBED);
  assert.ok(!out.includes("studioninja"));
  assert.ok(out.includes(EMBED));
});

test("handles empty and missing input", () => {
  assert.equal(swapStudioNinjaForCrm("", EMBED), "");
  assert.equal(swapStudioNinjaForCrm(undefined, EMBED), "");
});
