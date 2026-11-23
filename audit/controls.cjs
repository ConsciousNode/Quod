// Positive controls on the KERNEL switches, using Ed's probes (Hurkens is absent from the delivery).
const { load } = require('./load.cjs'); const q = load(); const K = q.Kernel, T = K.T, L = K.L;
const tryIt = (opts, fn) => { const e = new K.KernelEnv(opts); try { fn(e); return 'ACCEPTED'; } catch (x) { return 'rejected (' + String(x.message).slice(0, 60) + ')'; } };
const empty = e => e.addInductive('Empty', [], [], [], L.Lit(0n), []);
const negInd = e => { empty(e); e.addInductive('Bad', [], [], [], L.Lit(0n), [{ name: 'Bad.mk', type: T.Pi('f', T.Pi('_', T.Const('Bad', []), T.Const('Empty', [])), T.Const('Bad', [])) }]); };
const typeInType = e => e.addDef('tt', [], T.Sort(L.Lit(0n)), T.Sort(L.Lit(0n)));
const bigField = e => e.addInductive('U', [], [], [], L.Lit(0n), [{ name: 'U.mk', type: T.Pi('_', T.Sort(L.Lit(0n)), T.Const('U', [])) }]);
for (const [nm, fn, sw] of [['negative inductive', negInd, 'allowNegativeInductive'], ['Type : Type def', typeInType, 'allowTypeInType'], ['large field in Type 0', bigField, 'allowTypeInType']])
  console.log(nm.padEnd(24), '| switch off:', tryIt({}, fn).padEnd(48), '| switch on:', tryIt({ [sw]: true }, fn));
