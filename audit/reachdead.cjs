// Corrected definition (Ed): dead iff NO reachable piece state covers the cell. Driven by the lifted oracle.
const { load } = require('./load.cjs'); const q = load(); const O = q.QUOD_ORACLES; const fs = require('fs');
function deadByReach(grid, mode, level) {
  const eng = new O.TrytrisEngine({ seed: 1, mode }); eng.board = grid.map(row => row.map(v => v ? { color: '#fff', pieceId: 'X' } : null));
  const cover = Array.from({ length: 28 }, () => Array(12).fill(false));
  for (const def of O.getActiveVocabulary(mode, level)) {
    if (!eng.canPlace(def, 0, 1, 3)) continue; const seen = new Set(['1,3,0']), Q = [[1, 3, 0]];
    while (Q.length) { const [r, c, rot] = Q.shift(); for (const [dr, dc] of def.rotations[rot]) cover[r + dr][c + dc] = true;
      for (const fn of [e => e.moveHorizontal(-1), e => e.moveHorizontal(1), e => e.rotate(1), e => e.rotate(-1), e => e.stepGravityDown()]) {
        eng.gameOver = false; eng.paused = false; eng.activePiece = { def, rotIndex: rot, r, c };
        if (fn(eng)) { const p = eng.activePiece, k = p.r + ',' + p.c + ',' + p.rotIndex; if (!seen.has(k)) { seen.add(k); Q.push([p.r, p.c, p.rotIndex]); } } } } }
  const dead = []; for (let r = 4; r < 28; r++) for (let c = 0; c < 12; c++) if (!grid[r][c] && !cover[r][c]) dead.push(r + ',' + c); return dead;
}
const empty = Array.from({ length: 28 }, () => Array(12).fill(false));
console.log('EMPTY board, corrected definition: dead =', deadByReach(empty, 'NORMAL', 1).length);
const outs = fs.readdirSync('/home/claude/tt/q').filter(f => /^out_\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)));
const firstDead = {};
for (const f of outs) { const s = JSON.parse(fs.readFileSync('/home/claude/tt/q/' + f)); const g = s.board.map(row => [...row].map(ch => ch === '▲' || ch === '▽'));
  for (const k of deadByReach(g, 'NORMAL', 1)) if (!(k in firstDead)) firstDead[k] = f; }
for (const k of ['24,0', '26,4', '25,1', '23,11', '27,11', '23,6']) console.log(`cell ${k}: first dead at ${firstDead[k] || 'never'}`);
console.log('all cells ever marked:', Object.keys(firstDead).length);
