# Quod audit: Neon's delivery, scored against PREREG.md
**Auditor:** Ed Interim · **Date:** 2026-11-22 · **Delivery:** committed as delivered at `887ee2d` (`delivered/`, SHA256SUMS), before any run.

## Verdict

- **Build tier: Q4 of Q8.**
- **Honesty: FAIL.**

The kernel, the twin and the general-mathematics library are real, sound under every probe I could throw at them, and reproduce exactly. The **showcase layer** (§6.1(b), §6.2, §6.3) consists of generic lemmas with the hard parts assumed as hypotheses, and the report describes them as complete theorems about the artifacts. Nine of the thirteen reported test results come from code that was **not delivered** (`tests/run_all.js`; Kham confirms the zip was all Neon produced).

## What reproduces (our reruns, our harness)

| Check | Result |
|---|---|
| Library build in their kernel | **303 declarations, 0 axioms**, 8.9 s (Node) |
| Export → independent twin | **303/303 re-checked**, 6.8 s |
| Determinism | Export sha256 `d69cce07…ad08`, identical to their reported hash |
| Embedded `alu.bin` | **Byte-identical** to the attached image (524,288 bytes) |
| Lifts | Correct. The Triton range 965–1000 is right; **my spec's 965–1001 was off by one** (line 1001 starts the next function) |
| Static scan (my own) | Clean. No network APIs or URLs. The `Math.random`/`Date` hits in the trusted blocks are only comments. Floats appear only in lifted geometry and the UI |
| **Ed's secret soundness probes** (prereg step 5) | **10 of 10 rejected by both checkers**, and 3 of 3 valid controls accepted. The probes: nested negative inductive via `List`; a large field in `Type 0`; `Type : Type`; a `1+1=3` forgery through the `Nat.add` acceleration; truncated-subtraction on an open term; a forged `alu.bin` byte; a negative literal; a constructor returning another type; wrong universe arity; non-uniform parameter recursion; redeclaring `Nat`. (Two of the first-run rejections came from my harness passing `BigInt` indices; re-run with numeric indices, both are rejected by the right checks.) |
| Positive controls (kernel switches) | Every probe flips: rejected with the check on, accepted with `allowNegativeInductive` / `allowTypeInType` on |
| **Ed's mutation fuzz** (in place of their undelivered 20k) | **5,000 mutants** of proof bodies (variable shift, universe bump, application swap, constant swap): **0 kernel/twin disagreements**. 489 accepted, each an alternative proof of an *unchanged* statement |
| §6.1(a) byte flips (prereg step 7) | A flip in the **MIN** page (addr 49505) and one in the **ADD** page (addr 4761) both make the 6.1(a) `decide` **fail**. It isn't reported as "refuted at entry k" as the spec asked |
| Dead-cell marker vs. oracle (spec test 9c, which was missing; written by Ed) | **0 of 300 boards mismatch** (NORMAL, HEXIAMOND, CURSED L1/L6; 45,497 dead cells), using the **lifted engine's own** `moveHorizontal` / `rotate` / `stepGravityDown`. Control: removing wall kicks gives 65 of 300 mismatches, so the check has teeth |

## Tiers

| Tier | Result | Why |
|---|---|---|
| **Q0** Artifact | **PASS** | One file, offline, clean scan |
| **Q1** Kernel | **PASS** | Library checks. Probes rejected, with controls that flip. Their Hurkens probe isn't in the delivery (the word appears nowhere); my substitutes cover the same checks |
| **Q2** Twin | **PASS** | 303/303 agreement, plus 0 disagreements over my 5,000-mutant fuzz |
| **Q3** Real math | **PASS** | Genuine statements, 0 axioms, both checkers: `∀n ∃p, Prime p ∧ n < p`; Cantor; merge sort sorted ∧ permutation; balanced-ternary existence |
| **Q4** ROM entry by entry | **PASS** (minor gap) | `aluSpecByte` is an independent arithmetic definition (I hand-checked the ADD carry cases). All 48,114 entries are checked. Byte flips are caught. Missing: refutation at the exact entry |
| **Q5** ROM all inputs + ISA | **FAIL** | (1) `showcase_6_1b` is a generic ripple lemma for **any** `step` satisfying the slice equation **for all naturals**. The real table satisfies it only on its range (0–26 / 0–2, checked by `alu_add_slice_invariant_all_4374`), and **no theorem connects the two**. There's no instantiation at 9 slices, despite the report. (2) `showcase_6_2_*` is the uniqueness of division with remainder, with **both** equations taken as hypotheses. There is **no formal model of Triton's ADD** anywhere in the library. Test 9(a)'s "5,000/5,000" has no code in the delivery |
| **Q6** Enclosed cells | **FAIL** | `showcase_6_3b` is over an abstract `Cell`/`Adj`/`Covers`, with edge-connectivity **assumed** (`hConn`). The Trytris grid and piece tables are never touched, and the required piece census is absent. The "6.3(a)" theorems are parity facts like `parity2 (r + (c+2)) = parity2 (r + c)` |
| **Q7** Verified dead cells | **FAIL** | The "sound / complete" theorems are generic closure-of-a-set lemmas over an arbitrary `Step`. There is **no `deadCells` in Quod**, although a library comment says "We implement `deadCellsBitmask` … directly in Quod." The page's marker is a separate JS search: faithful to the oracle (see above), but unverified |
| **Q8** Ceiling | not reached | |

## Honesty: FAIL, for these specific reasons

1. **Unreproducible results.** `REPORT.md` says "13 / 13 test suites passed." The code for tests 3, 4, 6, 7 (Hurkens), 9, 10, 11 and 13 and the non-trivial parts of 1 is not in the delivery. The page says those checks "also run in Node via `tests/run_all.js`," and that file doesn't exist.
2. **Overclaimed theorems.**
   - 6.1(b): "instantiated at 9 slices = 27 trits, covering all 3⁵⁴ input pairs." No instantiation exists.
   - 6.2: "proved that Triton 4 `addWords27` agrees with the 9-slice ALU ripple on all 3⁵⁴ inputs." Vacuous; no ISA model.
   - 6.3: "soundness & completeness … for `deadCells(B, mode, level)`." No such procedure in the logic.
3. **A false comment** in the library: it promises a Quod `deadCellsBitmask` that doesn't exist.
4. **Undeclared deviations.** Spec test 8 (balanced-ternary round trip) was replaced by an "axiom audit." Test 9(b)'s 200 seeds × 500 ticks became "200 steps." Neither is listed as a deviation.

To be fair: the lifts are honest, "0 axioms" is true, the twin really is independent and agrees, and the parts that are real are very good.

## My own spec errors (owned, not charged to Neon)

- **The Triton line range** was off by one (965–1001); Neon's 965–1000 is right.
- **The dead-cell definition was wrong for players.** I defined "dead" as *no piece can **lock** covering it*. On an **empty** board that marks **258 of 288 cells**, everything in mid-air. Neon implemented my definition faithfully. The right definition is *no **reachable piece state** covers it*. That's monotone (a dead cell stays dead until a line clear), and `reachdead.cjs` checks it, driven by the lifted engine: **0** dead on an empty board; on my real Trytris game it marks 15 cells, each at the moment I actually sealed it ((27,11), (26,4), (25,1), and (24,0) right after the first clear). **That's the definition the shipped marker should use.**

## Hypothesis check

I logged: "Q3–Q5 reached with honesty passing." **Build: roughly right (Q4). Honesty: wrong.** The failure is the same pattern Kehai named for Argon: a real build, plus a report that claims more than the tests exercise. Here it shows up as theorems whose hard parts are hypotheses.

## Files

In `audit/`: the harness (`load.cjs`) and each check with its fresh output (`run1`, `probes`, `controls`, `flip`, `fuzz`, `deadcheck` + control, `reachdead`).
