// Ed's soundness probes (not in the spec). Each must be REJECTED by both kernel and twin; CONTROL must be ACCEPTED.
const VAR = process.env.VARNUM ? (s => Number(s)) : (s => BigInt(s));
const { load } = require('./load.cjs'); const fs = require('fs');
const PROBES = {
  CONTROL_valid_def: '(def "edOk" () (C "Nat" ()) (N 5))',
  P1_nested_negative_via_List: '(inductive "EdBad1" () () () (L 0) (("EdBad1.mk" (Pi "_" (App (C "List" ((L 0))) (Pi "_" (C "EdBad1" ()) (C "Empty" ()))) (C "EdBad1" ())))))',
  P2_large_field_small_universe: '(inductive "EdU2" () () () (L 0) (("EdU2.mk" (Pi "_" (Sort (L 0)) (C "EdU2" ())))))',
  P3_type_in_type_def: '(def "edTT" () (Sort (L 0)) (Sort (L 0)))',
  CONTROL_1plus1_eq_2: '(def "edOk4" () (App (App (App (C "Eq" ((L 0))) (C "Nat" ())) (N 2)) (App (App (C "Nat.add" ()) (N 1)) (N 1))) (App (App (C "Eq.refl" ((L 0))) (C "Nat" ())) (N 2)))',
  P4_nat_accel_forgery_1plus1_eq_3: '(def "edBad4" () (App (App (App (C "Eq" ((L 0))) (C "Nat" ())) (N 3)) (App (App (C "Nat.add" ()) (N 1)) (N 1))) (App (App (C "Eq.refl" ((L 0))) (C "Nat" ())) (N 3)))',
  CONTROL_prim_closed_5minus1_eq_4: '(def "edOk10" () (App (App (App (C "Eq" ((L 0))) (C "Nat" ())) (App (App (C "Prim.natSub" ()) (N 5)) (N 1))) (N 4)) (App (App (C "Eq.refl" ((L 0))) (C "Nat" ())) (N 4)))',
  P11_prim_open_truncation_forgery: '(def "edBad11" () (Pi "n" (C "Nat" ()) (App (App (App (C "Eq" ((L 0))) (C "Nat" ())) (App (App (C "Prim.natSub" ()) (V 0)) (N 1))) (V 0))) (Lam "n" (C "Nat" ()) (App (App (C "Eq.refl" ((L 0))) (C "Nat" ())) (V 0))))',
  P12_btGet_forgery_entry0: '(def "edBad12" () (App (App (App (C "Eq" ((L 0))) (C "Nat" ())) (App (App (C "Prim.btGet" ()) (BT "alu.bin")) (N 0))) (N 255)) (App (App (C "Eq.refl" ((L 0))) (C "Nat" ())) (N 255)))',
  P5_negative_literal: '(def "edBad5" () (C "Nat" ()) (N -1))',
  P6_ctor_returns_other_type: '(inductive "EdBad6" () () () (L 0) (("EdBad6.mk" (C "Nat" ()))))',
  P7_wrong_level_arity: '(def "edBad7" () (Sort (L 1)) (App (C "List" ()) (C "Nat" ())))',
  P8_nonuniform_param_recursion: '(inductive "EdBad8" () (("A" (Sort (L 0)))) () (L 0) (("EdBad8.mk" (Pi "A" (Sort (L 0)) (Pi "_" (App (C "EdBad8" ()) (C "Empty" ())) (App (C "EdBad8" ()) (V 1)))))))',
  P9_redeclare_Nat: '(inductive "Nat" () () () (L 0) (("Nat.zero2" (C "Nat" ()))))',
  P10_old_malformed: '(def "edBad10" () (Pi "n" (C "Nat" ()) (App (App (App (C "Eq" ((L 1))) (C "Nat" ())) (App (App (C "Prim.natSub" ()) (V 0)) (N 1))) (V 0))) (Lam "n" (C "Nat" ()) (App (App (C "Eq.refl" ((L 1))) (C "Nat" ())) (V 0))))',
};
const q = load(); const libExp = fs.readFileSync('export.sexp', 'utf8');
const alu = new Uint8Array(fs.readFileSync('/home/claude/consciousnode/Triton-card-computer/roms/alu.bin'));
// Twin: fresh env per probe, library first
function twinVerdict(probe) {
  const tw = new q.Twin.TwinEnv(); tw.loadByteTable('alu.bin', alu);
  tw.checkExportText(libExp, q.lexSexp);
  try { tw.checkExportText(probe, q.lexSexp); return 'ACCEPTED'; } catch (e) { return 'REJECTED: ' + String(e.message).slice(0, 90); }
}
// Kernel: parse the S-expression ourselves into kernel terms
function parse(src) { const toks = src.match(/\(|\)|"[^"]*"|[^\s()]+/g); let i = 0;
  const rd = () => { const t = toks[i++]; if (t === '(') { const a = []; while (toks[i] !== ')') a.push(rd()); i++; return a; } return t[0] === '"' ? { s: t.slice(1, -1) } : t; }; return rd(); }
function mkLevel(x) { const K = q.Kernel.L; const h = x[0]; if (h === 'L') return K.Lit(BigInt(x[1])); if (h === 'P') return K.Param(Number(x[1])); if (h === 'S') return K.Succ(mkLevel(x[1])); if (h === 'M') return K.Max(mkLevel(x[1]), mkLevel(x[2])); throw Error('lvl'); }
function mkTerm(x) { const T = q.Kernel.T; const h = x[0];
  switch (h) { case 'V': return T.Var(VAR(x[1])); case 'Sort': return T.Sort(mkLevel(x[1])); case 'Pi': return T.Pi(x[1].s, mkTerm(x[2]), mkTerm(x[3]));
    case 'Lam': return T.Lam(x[1].s, mkTerm(x[2]), mkTerm(x[3])); case 'App': return T.App(mkTerm(x[1]), mkTerm(x[2])); case 'C': return T.Const(x[1].s, x[2].map(mkLevel));
    case 'N': return T.NatLit(BigInt(x[1])); case 'BT': return T.ByteTableLit(x[1].s); } throw Error('term ' + h); }
function kernelVerdict(kenv, probe) {
  try { const d = parse(probe);
    if (d[0] === 'def') kenv.addDef(d[1].s, d[2].map(s => s.s), mkTerm(d[3]), mkTerm(d[4]));
    else kenv.addInductive(d[1].s, d[2].map(s => s.s), d[3].map(([n, t]) => ({ name: n.s, type: mkTerm(t) })), d[4].map(([n, t]) => ({ name: n.s, type: mkTerm(t) })), mkLevel(d[5]), d[6].map(([n, t]) => ({ name: n.s, type: mkTerm(t) })));
    return 'ACCEPTED'; } catch (e) { return 'REJECTED: ' + String(e.message).slice(0, 90); } }
const { kenv } = q.QuodApp.buildFullLibrary(false);
for (const [k, p] of Object.entries(PROBES)) {
  const kv = kernelVerdict(kenv, p), tv = twinVerdict(p);
  console.log(k.padEnd(34), '| kernel', kv.startsWith('ACC') ? 'ACCEPTED' : 'rejected', '| twin', tv.startsWith('ACC') ? 'ACCEPTED' : 'rejected', '|', (kv.startsWith('REJ') ? kv.slice(10) : '') .slice(0, 60));
  if (!tv.startsWith('ACC')) console.log(''.padEnd(34), '  twin msg:', tv.slice(10, 90));
}
