# Quod: a proof assistant in one file, proving things about real hardware and a real game

**ConsciousNode SoftWorks.** Xinu rules: one self-contained HTML file, zero dependencies, no network, offline, deterministic, MIT. Inline everything and label every inline: every block lifted from an attached file carries a provenance comment (`// from trytris/index.html:LINE-LINE`). **Lifted code stays byte-identical** to its source, except where a change is listed with a reason in `LIFTS.md`.

Tests may live under `tests/`. They run in Node against the same HTML (extract and evaluate its scripts), **and** from a Tests tab in the page. Both paths run the same test code.

## Attached

- **`card/alu.bin`** (512 KiB, sha256 `003153df…58c5`). The lookup-table image burned into each of the nine ALU slice chips of a balanced-ternary computer built from discrete logic.
  - The address and data layout is documented in **`card/roms.js` lines 8–15**: dual-rail trits, `address = a(6) | b(6)<<6 | cin(2)<<12 | fn(4)<<14 | neg(1)<<18`, `data = r(6) | cout(2)<<6`.
  - **`card/microsim.js` lines 8–31** define what each of the 11 functions means (`ALU_FNS`: ADD, PASSA, PASSB, MIN, MAX, CON, ANY, XOR, UNARY, NEGA, INCA).
  - Treat those lines as the *informal* meaning. Your formal definitions are written independently, in your own logic.
- **`triton/ISA-4.md`** and **`triton/triton4.html`**. The machine's ISA and its reference emulator.
  - A word is 27 trits, held as three 9-trit trytes.
  - The reference addition is `addWords27` with its helpers: **`triton4.html` lines 882–883 and 965–1001.**
- **`trytris/index.html`** and **`trytris/SPEC.md`**. A falling-piece game played on a triangle grid. Lines 853–1593 hold its rules engine: grid constants, piece tables, `canPlace`, `moveHorizontal`, `rotate` (with kicks), `stepGravityDown`, `softDrop`, `hardDrop`, `tick`, `lockActivePiece`, line clears.
  - **Trust the code over the doc.**

**Lift as host-side oracles only**, byte-identical and labeled:
- Triton `triton4.html` lines 882–883 and 965–1001;
- Trytris `index.html` lines 853–1593.

Tests use them to validate your formal models. **Nothing in the checker may call them.**

## What to build

One page, `quod.html`.

### 1. The kernel (the trusted base)

A dependent type theory in the family of the Calculus of Inductive Constructions or Martin-Löf type theory. You choose and document it in `LOGIC.md`. It needs at least:
- a predicative hierarchy of universes;
- dependent functions;
- **general inductive types and inductive families**, with a strict positivity check;
- eliminators, or recursors with iota reduction;
- definitional equality by beta, delta, iota and zeta (eta optional, but documented);
- definitions;
- axioms, which are declared explicitly and tracked.

Requirements:
- The kernel is one clearly delimited block. Report its line count.
- **Nothing outside it is trusted.**
- **Native acceleration is allowed**, such as kernel-level big naturals or byte arrays (e.g. to hold `alu.bin` as data). Each acceleration is listed in `LOGIC.md` as part of the trusted base, **and is implemented independently in the second checker.**

### 2. A second, independent checker (the differential twin)

It checks the **exported proof terms** (a documented text format) with a different implementation. For example, de Bruijn indices in one checker and locally nameless terms in the other; or normalization by evaluation in one and substitution-based reduction in the other.

- It may share the lexer for the export format, **and nothing else.**
- It loads any data the proofs depend on (such as `alu.bin`) **itself, from the attached file**, never from the kernel's copy.
- It runs both in the page and in Node.

### 3. The elaborator and the proof language

A surface language with:
- implicit arguments and unification;
- notation for numerals;
- definitions by **pattern matching**, compiled to eliminators (structural recursion checked; well-founded recursion optional);
- `match`;
- structures or records;
- `theorem` / `def` / `inductive`.

**Tactics:** `intro`, `apply`, `exact`, `refine`, `cases`, `induction`, `rewrite`, `simp`-like rewriting with a lemma set, `decide` (proof by evaluation, producing a kernel-checked term), and `calc`.

Every tactic produces a term that the kernel rechecks. **The elaborator is untrusted.**

### 4. The page

- **Editor + goal view.** Write Quod source; see the goals at the cursor; step through a proof tactic by tactic.
- **Library browser.** Every declaration, with:
  - its type;
  - **the axioms it depends on** (transitively);
  - a "check with twin" button;
  - export.
- **Trusted-base panel.** Kernel line count, the list of accelerations, and the axioms declared anywhere.
- **Dead-cell demo.** An interactive board of the triangle game.
  - You can place cells by hand or play pieces.
  - Cells the **verified dead-cell procedure (§6.3)** classifies as unfillable are marked with a small ×.
  - The marker is computed from the procedure that was proven, either evaluated by the kernel or through an extracted JS version that tests show agrees with it.
- **Tests** and **Report** tabs.

## 5. The library (written in Quod, checked by both checkers)

Built from nothing. It must include:
- natural numbers and integers with the ring laws you need;
- lists, with permutations and sorting;
- finite types;
- decidability;
- **balanced ternary**: trits, little-endian trit lists, a value function, and **uniqueness and existence of the balanced-ternary representation** of every integer within a width's range.

**General-mathematics theorems**, which demonstrate the system is real:
- addition and multiplication on naturals are commutative and associative;
- list reverse is an involution;
- **a merge sort that returns a sorted permutation of its input**;
- **there are infinitely many primes**;
- **Cantor's theorem**: no function from a type onto its predicates is surjective.

## 6. Showcase theorems (about the attached artifacts)

**Blind rule:** you do not know whether these statements are true. **If any statement is false, prove its negation instead, with a concrete, kernel-checked counterexample.** Report which happened. Never weaken a statement silently. If you need an extra hypothesis, state it in the theorem, and list it under Deviations in the report.

### 6.1 The ALU slice table

`alu.bin` enters the logic as data, through a documented acceleration or by generating its contents into terms.

- **(a) Every table entry is right.** For every function `fn` in the 11, every `neg` ∈ {0,1}, every slice input `a, b` (3 trits each) and every `cin` ∈ {−1,0,+1}, the entry decodes to your formal definition of `fn` applied to `(a, neg ? −b : b, cin)`. Proof by `decide` is fine.
- **(b) The whole 27-trit adder is right.** Define the nine-slice ripple: slice k takes trits 3k..3k+2 of A and B, and slice k's carry-out feeds slice k+1's carry-in. Then prove:
  - for **all** 27-trit words A, B and every carry-in to slice 0, with `fn = ADD`, the nine-slice ripple of `alu.bin` gives result trits R and carry-out C with **value(R) + 3²⁷·C = value(A) + value(±B) + cin**, the sign of B set by `neg`;
  - and R is the balanced remainder.

  **This must be a proof over all 3⁵⁴ input pairs**, by induction over slices or words, not by enumeration.

  The ripple wiring is a modeling assumption. State it as a definition, plainly labeled.

### 6.2 The ISA's addition

- Define the ISA's 27-trit ADD in Quod, from `ISA-4.md`: three 9-trit trytes, wrapping, with the carry flag.
- **Validate the model against the lifted `addWords27`** (test 9).
- **Prove** that it agrees with the ALU ripple from 6.1(b) on every input: **the hardware table computes the ISA's addition.**

### 6.3 The triangle game

Formalize the grid, cells and their orientation, the edge-adjacency of cells, piece tables (lifted as data), placements (`canPlace`), and the movement rules (horizontal moves, rotation with kicks, gravity, soft and hard drop, lock), **as the oracle code defines them**. Validate the model against the oracle (test 9).

- **(a) Enclosed cells.** On any board, if every edge-neighbor of an empty cell x is occupied or out of bounds, then **no legal placement** of any edge-connected piece with ≥ 2 cells covers x. Also prove, by computation, which pieces in the game's tables (every mode) are edge-connected and have ≥ 2 cells. Report any piece that doesn't.
- **(b) Reachability.**
  - Define, as an inductive relation, "piece P can be locked at placement L, starting from its spawn on board B, under the movement rules."
  - Implement a decision procedure `deadCells(B, mode, level)`. A cell is dead when no piece in the vocabulary for that mode and level can lock at a placement covering it.
  - **Prove the procedure sound and complete with respect to the relation.**
  - The page's dead-cell marker uses this procedure.

## Forbidden

- **No trust outside the kernel.** No tactic, elaborator step or UI path may add a declaration the kernel hasn't checked. No "trust me" flag, and no `sorry` in any library or showcase declaration. A `sorry` may exist only as a tracked axiom, and any declaration that uses it is marked in the browser.
- **No hidden axioms.** Every showcase theorem and library theorem must report **no axioms**. If you believe one is necessary (e.g. function extensionality), declare it, justify it in `LOGIC.md`, and the browser must show it on every theorem that uses it.
- **No special-casing.** Nothing may special-case theorem names, file hashes or test names.
- **No oracle in the proof path.** `decide` and every tactic produce terms the kernel evaluates. They must not call the lifted oracles or any precomputed answer.
- **No precomputed outputs.** No precomputed proof terms, export files, verdicts or test expectations embedded in the file. Everything is checked during the session.
- **No shared code between the twins** beyond the export-format lexer.
- **No floating point** in either checker or the elaborator.
- **No result claims.** Do not predict, summarize or rank results anywhere in code, docs or UI. The Report is generated from the test output.

## Tests

Every test writes to `results.jsonl` with code and input hashes. Fixed seeds throughout.

1. **Library and showcase check, twice.** Every declaration, in dependency order, is checked by the kernel; then exported and checked by the twin. Report per-declaration verdicts, axiom sets and checking times.
2. **Paradoxes and soundness probes.** Each must be **rejected by both checkers**:
   - an encoding of Girard/Hurkens' paradox attempted with `Type : Type`;
   - a negative inductive (e.g. `Bad := mk (Bad → False)`) used to prove `False`;
   - non-structural recursion presented as structural;
   - universe-level violations;
   - an eliminator applied to the wrong motive;
   - a definitional-equality forgery (a term relying on a false conversion);
   - if you have an impredicative `Prop`: a large elimination that would break consistency.

   Add any probe you know of for your chosen theory, and document each.
3. **Proof-term mutation fuzz.** Take 20,000 random single mutations of exported proof terms from the library: change a constructor, swap arguments, change a de Bruijn index, alter a universe level.
   - **Both checkers must give the same verdict on every mutant.**
   - Report the acceptance rate.
   - Any accepted mutant must still state a statement that is legitimately provable. List every accepted mutant, with its statement, and with the original's statement if the mutation changed it.
4. **False-statement bank.** 500 generated false statements (arithmetic off by one, wrong list facts, wrong ternary values), plus false variants of every showcase theorem:
   - an `alu.bin` with **one byte of the ADD page flipped**;
   - an ADD model with the carry dropped;
   - a game model with one kick entry altered.

   For each, the automated tactics (`decide`, `simp`, the search) must fail to prove the statement. For the decidable ones, `decide` must prove its negation.

   **Showcase positive controls:** re-run the **actual showcase proof scripts** of §6 against each false variant. They must fail in the kernel. And with the flipped-byte `alu.bin`, §6.1(a) must come out **refuted**, naming the exact entry.
5. **Twin agreement on everything.** Every verdict from tests 1–4 agrees between the two checkers. Report the count of disagreements, which must be 0.
6. **Elaborator independence.** For 200 library declarations: delete the stored proof term, re-elaborate it from source, and re-check it in a fresh kernel instance. The verdict must be the same.
7. **Positive controls.** With a test-only switch that **disables the positivity check**, the probe from test 2 is accepted; switched back on, it is rejected. With a test-only switch that **allows `Type : Type`**, Hurkens is accepted; switched back on, it is rejected. These controls prove the probes actually exercise the checks.
8. **Balanced-ternary round trip.** The library's conversion functions, evaluated by the kernel on 10,000 random integers, agree with a JS reference written in the test.
9. **Models against oracles.**
   - **(a)** The Quod model of ISA ADD, evaluated by the kernel, against the lifted `addWords27`, on 10,000 random word pairs plus all boundary words.
   - **(b)** The Quod game model against the lifted engine on 200 seeds × 500 random `tick` inputs. After every tick, compare board, active piece and score.
   - **(c)** `deadCells`, evaluated by the kernel, against a brute-force search written in the test, on 300 random boards. The search explores every reachable (position, rotation) state of every piece from spawn, with a visited set, using the lifted oracle's own movement and `canPlace` functions, and collects every lock placement.
   - **Positive control:** a test-only altered oracle (one kick entry changed) must disagree with the model.
10. **Determinism.** Two full checks give identical hashes for every exported term and verdict.
11. **Static scan.**
    - No network APIs, external URLs, `import`, `fetch`, XHR or WebSocket.
    - No `Math.random`, `Date` or `performance.now` in the checkers, the elaborator or the tactics. They are allowed in UI readouts and test 12 only.
    - No floating point in either checker.
12. **Instruments** (measured, not pass/fail):
    - kernel and twin line counts;
    - number of declarations;
    - total proof-term size;
    - checking time for the full library in each checker, in Node and in the page;
    - the time for 6.1(a), 6.1(b), 6.2 and 6.3(b) separately.
13. **Lift integrity.** The hashes of the lifted blocks equal the hashes of the named line ranges in the attached files.

## Report

`REPORT.md`, generated by a script from `results.jsonl`. It covers:
- what was built;
- every test, pass or fail, with counts;
- **for each showcase statement: proven, refuted (with the counterexample), or not reached**;
- the axioms used by each theorem;
- the measured instruments;
- every deviation from this spec, with its reason.

Write "Measured:" versus "Hypothesis:". **No claims beyond what the tests exercise.** If something is incomplete, say exactly where it stops. An honest partial build is worth more than a dishonest whole one.
