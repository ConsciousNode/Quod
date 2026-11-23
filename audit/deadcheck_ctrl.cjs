// Spec test 9(c), written by Ed: brute-force reachability driven by the LIFTED ORACLE's own movement methods.
const { load } = require('./load.cjs'); const q = load(); const O = q.QUOD_ORACLES;
const ROWS = 28, COLS = 12;
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
function oracleDead(grid, mode, level) {
  if (process.env.CRIPPLE) { const P = O.TrytrisEngine.prototype; if (!P.__orig) { P.__orig = P.rotate; P.rotate = function (dir = 1) { const p = this.activePiece; const n = p.def.symmetryOrder; if (n <= 1) return true; const nr = (p.rotIndex + dir + n) % n; if (this.canPlace(p.def, nr, p.r, p.c)) { p.rotIndex = nr; return true; } return false; }; } }
  const eng = new O.TrytrisEngine({ seed: 1, mode });
  eng.board = grid.map(row => row.map(v => v ? { color: '#fff', pieceId: 'X' } : null));
  const cover = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (const def of O.getActiveVocabulary(mode, level)) {
    if (!eng.canPlace(def, 0, 1, 3)) continue;
    const seen = new Set(['1,3,0']), Q = [[1, 3, 0]];
    while (Q.length) {
      const [r, c, rot] = Q.shift();
      const go = (fn) => { eng.gameOver = false; eng.paused = false; eng.activePiece = { def, rotIndex: rot, r, c }; const ok = fn(); const p = eng.activePiece; return ok ? [p.r, p.c, p.rotIndex] : null; };
      const nexts = [go(() => eng.moveHorizontal(-1)), go(() => eng.moveHorizontal(1)), go(() => eng.rotate(1)), go(() => eng.rotate(-1)), go(() => eng.stepGravityDown())];
      if (!nexts[4]) for (const [dr, dc] of def.rotations[rot]) cover[r + dr][c + dc] = true;   // gravity fails: lock placement
      for (const n of nexts) if (n) { const k = n.join(','); if (!seen.has(k)) { seen.add(k); Q.push(n); } }
    }
  }
  const dead = []; for (let r = 4; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!grid[r][c] && !cover[r][c]) dead.push(r + ',' + c);
  return dead;
}
function randomBoard() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const top = 8 + Math.floor(rnd() * 16), dens = 0.35 + rnd() * 0.5;
  for (let r = top; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = rnd() < dens;
  return g;
}
let boards = 0, mism = 0, deadTotal = 0, ex = null;
for (const [mode, level] of [['NORMAL', 1], ['HEXIAMOND', 1], ['CURSED', 1], ['CURSED', 6]]) {
  for (let i = 0; i < 75; i++) {
    const g = randomBoard(); const mine = oracleDead(g, mode, level);
    const theirs = q.QuodApp.computeDeadCells(g, mode, level).dead.map(([r, c]) => r + ',' + c);
    boards++; deadTotal += mine.length;
    const a = new Set(mine), b = new Set(theirs);
    if (a.size !== b.size || [...a].some(x => !b.has(x))) { mism++; if (!ex) ex = { mode, level, onlyOracle: [...a].filter(x => !b.has(x)).slice(0, 5), onlyTheirs: [...b].filter(x => !a.has(x)).slice(0, 5) }; }
  }
}
console.log(`boards ${boards}  mismatching ${mism}  dead cells found by oracle search ${deadTotal}`);
if (ex) console.log('first mismatch', JSON.stringify(ex));
