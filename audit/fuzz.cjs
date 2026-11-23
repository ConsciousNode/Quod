const { load } = require('./load.cjs'); const q = load(); const fs = require('fs'); const K = q.Kernel;
const lines = fs.readFileSync('export.sexp', 'utf8').split('\n').filter(l => l.startsWith('(def ') && l.length < 4000);
const alu = new Uint8Array(fs.readFileSync('/home/claude/consciousnode/Triton-card-computer/roms/alu.bin'));
const tw = new q.Twin.TwinEnv(); tw.loadByteTable('alu.bin', alu); tw.checkExportText(fs.readFileSync('export.sexp', 'utf8'), q.lexSexp);
const { kenv } = q.QuodApp.buildFullLibrary(false);
const consts = [...new Set(fs.readFileSync('export.sexp', 'utf8').match(/\(C "[^"]+"/g))].map(s => s.slice(4, -1));
let seed = 777; const rnd = n => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed >>> 8) % n; };
function parse(src) { const toks = src.match(/\(|\)|"[^"]*"|[^\s()]+/g); let i = 0; const rd = () => { const t = toks[i++]; if (t === '(') { const a = []; while (toks[i] !== ')') a.push(rd()); i++; return a; } return t[0] === '"' ? { s: t.slice(1, -1) } : t; }; return rd(); }
const show = x => Array.isArray(x) ? '(' + x.map(show).join(' ') + ')' : (typeof x === 'object' ? JSON.stringify(x.s) : x);
const L = q.Kernel.L, T = q.Kernel.T;
const lv = x => { const h = x[0]; if (h === 'L') return L.Lit(BigInt(x[1])); if (h === 'P') return L.Param(Number(x[1])); if (h === 'S') return L.Succ(lv(x[1])); return L.Max(lv(x[1]), lv(x[2])); };
const tm = x => { switch (x[0]) { case 'V': return T.Var(Number(x[1])); case 'Sort': return T.Sort(lv(x[1])); case 'Pi': return T.Pi(x[1].s, tm(x[2]), tm(x[3])); case 'Lam': return T.Lam(x[1].s, tm(x[2]), tm(x[3]));
  case 'App': return T.App(tm(x[1]), tm(x[2])); case 'Let': return T.Let(x[1].s, tm(x[2]), tm(x[3]), tm(x[4])); case 'C': return T.Const(x[1].s, x[2].map(lv)); case 'N': return T.NatLit(BigInt(x[1])); case 'BT': return T.ByteTableLit(x[1].s); } throw Error('?' + x[0]); };
function nodes(x, acc = []) { if (Array.isArray(x)) { acc.push(x); x.forEach(y => nodes(y, acc)); } return acc; }
function mutate(body) { const ns = nodes(body); const k = rnd(4); const want = ['V', 'C', 'L', 'App'][k]; const cand = ns.filter(n => n[0] === want);
  if (!cand.length) return null; const n = cand[rnd(cand.length)];
  if (k === 0) { n[1] = String(Number(n[1]) + 1 + rnd(2)); return 'var+'; }
  if (k === 1) { n[1] = { s: consts[rnd(consts.length)] }; return 'const'; }
  if (k === 2) { n[1] = String(Number(n[1]) + 1); return 'level'; }
  const t = n[1]; n[1] = n[2]; n[2] = t; return 'swap'; }
const N = +process.argv[2] || 2000; let acc = 0, rej = 0, dis = 0, same = 0; const kinds = {}; const disEx = [];
for (let i = 0; i < N; i++) {
  const d = parse(lines[rnd(lines.length)]); const orig = show(d[4]); const kind = mutate(d[4]); if (!kind) { i--; continue; }
  if (show(d[4]) === orig) { same++; continue; }
  const nm = 'edMut' + i; d[1] = { s: nm };
  let kv; try { kenv.addDef(nm, d[2].map(s => s.s), tm(d[3]), tm(d[4])); kv = true; } catch (e) { kv = false; }
  let tv; try { tw.checkExportText(show(d), q.lexSexp); tv = true; } catch (e) { tv = false; }
  kinds[kind] = (kinds[kind] || 0) + 1; if (kv) acc++; else rej++; if (kv !== tv) { dis++; if (disEx.length < 3) disEx.push({ kind, kernel: kv, twin: tv, decl: lines.indexOf }); }
}
console.log(JSON.stringify({ mutants: acc + rej, kernelAccepted: acc, kernelRejected: rej, disagreements: dis, noopSkipped: same, kinds }));
if (disEx.length) console.log('examples', JSON.stringify(disEx));
