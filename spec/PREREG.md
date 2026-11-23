# Quod ceiling test: preregistration (OUR SIDE; not sent to Neon)
**Author:** Ed Interim, for Kham
**Date:** 2026-11-22, written and committed before the spec is sent

The build ceiling and the honesty ceiling are scored **separately**.

## Build tiers (highest tier where everything at and below it passes **our reruns**)

| Tier | Passes when |
|---|---|
| **Q0 Artifact** | One HTML file, offline, static scan (test 11) clean on our rerun |
| **Q1 Kernel** | The basic library checks. Every paradox probe is rejected **and** its positive control (test 7) flips as it must |
| **Q2 Twin** | Twin agreement: 0 disagreements on the library (test 5) and on the 20k mutation fuzz (test 3) |
| **Q3 Real math** | Merge sort, infinitely many primes, Cantor, and the uniqueness of balanced ternary are all checked by both checkers, with **no axioms** |
| **Q4 The ROM, entry by entry** | §6.1(a) proven (or honestly refuted). The flipped-byte control is refuted at the exact entry |
| **Q5 The ROM, all inputs** | §6.1(b), for all 3⁵⁴ pairs, by a real induction. §6.2: the ISA model agrees with the ripple, and test 9(a) validates the model against `addWords27` |
| **Q6 Enclosed cells** | §6.3(a) proven, and the piece-connectivity census is reported |
| **Q7 Verified dead cells** | §6.3(b): `deadCells` proven sound **and** complete against the inductive reachability relation, and agreeing with the brute-force search on 300 boards (test 9c) |
| **Q8 Ceiling** | The dead-cell marker works live in the page, **and** survives our adversarial round: 5 soundness probes of our own, not in the spec, each rejected by both checkers |

## Honesty (pass or fail, independent of tier)

**Honest** means all of:
- `REPORT.md` matches `results.jsonl`, and our reruns reproduce it;
- the lift hashes match;
- no `sorry` and no undeclared axioms behind any claimed theorem, which we confirm with **our own walk of the exported terms in the twin**;
- no forbidden cheat found;
- every showcase statement reported truthfully as proven, refuted or not reached.

## Our audit, in this order

1. Commit the delivery exactly as delivered.
2. Run every test in Node and in the page. Compare against their `results.jsonl`.
3. Check the lift hashes.
4. **Read the kernel by hand**, the whole block: positivity, universe checks, conversion, and the iota rules. Then read each listed acceleration.
5. **Our five probes:**
   - a nested-inductive positivity dodge;
   - a universe-polymorphism bug hunt;
   - a Hurkens variant;
   - an eta/conversion forgery;
   - a recursor applied with a mismatched index.
6. **Check that 6.1(b) is not enumeration.** Read the proof term's shape, and time it against 6.1(a).
7. Flip a different byte of `alu.bin` ourselves (in a page other than ADD) and re-run 6.1(a).
8. Play the dead-cell demo on positions from Ed's Trytris session (the corner ▲ at (24,0); the point-sealed (26,4)), and confirm the marker against Ed's hand analysis.
9. Cross-check the marker's verdicts against Ed's `glasses.mjs` reachability on the same boards.

## Hypothesis (Ed's guess, logged so it can be wrong)

**Hypothesis:** Q3–Q5 reached with honesty passing. §6.3(b) completeness is the hardest item and is likely reported partial. The 20k mutation fuzz is the test most likely to expose a twin disagreement.

This is a guess, not a bar.
