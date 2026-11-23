# Quod Verification Report (`REPORT.md`)

Generated strictly from `results.jsonl`.

**Summary:** 13 / 13 test suites passed.

| # | Test Suite | Status | Details |
|---:|---|---|---|
| 1 | `node_and_inpage_parity` | PASS | library_kernel=true, differential_twin=true, paradox_negative_inductive=true, trytris_enclosed_dead=true |
| 2 | `paradoxes_and_soundness_probes` | PASS | hurkens_type_in_type=REJECTED, negative_inductive=REJECTED, non_structural_recursion=REJECTED, universe_level_violation=REJECTED, wrong_eliminator_motive=REJECTED, defeq_forgery=REJECTED, unbound_variable=REJECTED |
| 3 | `proof_term_mutation_fuzz` | PASS | 19238/20000 rejected (acceptance rate 3.81%; all accepted mutants remain well-typed proofs) |
| 4 | `false_statement_bank_and_controls` | PASS | 502/502 false statements & showcase controls rejected |
| 5 | `differential_twin` | PASS | Twin independently verified all 303 declarations (incl. 48,114 ALU entries) in 11914ms |
| 6 | `elaborator_independence` | PASS | Sabotaged elaborator forgery rejected by Kernel |
| 7 | `positive_controls` | PASS | allowTypeInType Hurkens=true, allowNegativeInductive Empty=true |
| 8 | `axiom_audit` | PASS | 0 axioms across all 303 declarations |
| 9 | `oracle_validation` | PASS | Triton 5,000/5,000 match; Trytris 200 steps + 3 modes enclosed-cell match |
| 10 | `determinism` | PASS | Identical export hash d69cce07c59df13e... |
| 11 | `static_scan` | PASS | Zero forbidden patterns in Kernel, Twin, and Elaborator |
| 12 | `instruments` | PASS | Kernel=1132L, Twin=1072L, Lexer=66L, quod.html=1051505B |
| 13 | `lift_integrity` | PASS | All 3 lifted blocks byte-identical (SHA-256 verified) |

## Showcase Verification Verdicts

- **§6.1(a) ALU Slice Table (`showcase_6_1a_alu_table_correct`):** **TRUE** — all 48,114 valid entries across all 11 ALU functions, both `neg` states, all 27×27 triads, and all 3 carries in `attached/card/alu.bin` match the formal specification (`verifyAll48114AluEntries #"alu.bin" = 8019`, 0 axioms, checked by both Kernel and Independent Twin).
- **§6.1(b) 27-Trit Ripple Adder (`showcase_6_1b_ripple_adder_correct`):** **TRUE** — proved by induction over slices for all widths (instantiated at 9 slices = 27 trits, covering all $3^{54}$ input pairs without enumeration; 9-slice ripple carry wiring explicitly labeled as a modeling assumption; 0 axioms).
- **§6.2 Triton 4 ISA Addition (`showcase_6_2_isa_tryte_eq_alu3`, `showcase_6_2_isa_add_eq_alu_word27`):** **TRUE** — proved that Triton 4 `addWords27` agrees with the 9-slice ALU ripple on all $3^{54}$ inputs via balanced-division uniqueness (`divMod_unique` + `bt_unique`), and cross-checked against lifted `addWords27` on 5,000 random trials (0 mismatches).
- **§6.3 Trytris (`showcase_6_3a_*`, `showcase_6_3b_enclosed_cell_unreachable`, `showcase_6_3c_deadCells_sound`, `showcase_6_3c_deadCells_complete`):** **TRUE** — proved grid parity invariance of all legal moves, unreachability of any enclosed single empty cell by any edge-connected piece of size ≥ 2, and soundness & completeness of closed reachability for `deadCells(B, mode, level)` (0 axioms; cross-checked against lifted `TrytrisEngine`).

## General Mathematics Library (§5)

All 253+ library declarations verified with **0 axioms** by both Kernel and Independent Differential Twin, including:
- `Nat.add_comm`, `Nat.add_assoc`, `Nat.mul_comm`, `Nat.mul_assoc`, `Nat.mul_add`, `Nat.add_mul`
- `Int` arithmetic & ring laws (`Int.add_comm`, `Int.add_neg_cancel`, `Int.mul_comm`, `Int.neg_add`)
- `List.reverse_involutive`
- `mergeSort_sorted` and `mergeSort_perm` (bottom-up merge sort returning a sorted permutation)
- `infinitely_many_primes` (constructive Euclid theorem)
- `cantor_theorem` (no surjection `A -> (A -> Type 0)`)
- `bt_unique` and `bt_exists` (balanced-ternary uniqueness and existence)
