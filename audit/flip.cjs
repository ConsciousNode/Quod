const fs = require('fs'), path = require('path');
const [addr, tag] = [Number(process.argv[2]), process.argv[3]];
const dir = '/home/claude/quod-audit/flip_' + tag; fs.mkdirSync(dir + '/attached/card', { recursive: true });
const b = Buffer.from(fs.readFileSync('/home/claude/consciousnode/Triton-card-computer/roms/alu.bin')); const before = b[addr]; b[addr] ^= 1;
fs.writeFileSync(dir + '/attached/card/alu.bin', b); process.chdir(dir);
const { load } = require('/home/claude/quod-audit/harness/load.cjs'); const q = load({ require: true });
console.log(tag, 'addr', addr, 'byte', before, '->', b[addr], '| kernel sees flipped table:', q.QuodApp.loadAluBytesKernel()[addr] === b[addr]);
try { const { kenv } = q.QuodApp.buildFullLibrary(false); console.log('  LIBRARY BUILT —', kenv.order.length, 'decls (flip NOT caught)'); }
catch (e) { console.log('  build failed:', String(e.message).slice(0, 160)); }
