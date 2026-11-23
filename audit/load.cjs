// Load all <script> blocks of the delivered page into one VM context, untouched.
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync('/home/claude/quod-audit/delivered/quod_dependent_type_proof_assistant.html', 'utf8');
const blocks = [...html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)].map(m => ({ id: m[1], src: m[2] }));
function load(opts = {}) {
  const ctx = { console, Buffer, BigInt, Uint8Array, Set, Map, Math, JSON, Array, Object, String, Number, Error, TextEncoder, TextDecoder, atob: s => Buffer.from(s, 'base64').toString('binary'), setTimeout, performance };
  if (opts.require) ctx.require = require; ctx.globalThis = ctx; vm.createContext(ctx);
  const src = blocks.map(b => b.src).join('\n;\n') + '\n;globalThis.__q = { Kernel, Twin, Elaborator, lexSexp, QUOD_ORACLES, QuodApp, QuodTests, QUOD_ALU_BASE64, QUOD_LIBRARY_PARTS };';
  vm.runInContext(src, ctx, { filename: 'quod.html' });
  return ctx.__q;
}
module.exports = { load, blocks };
