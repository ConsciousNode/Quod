# Lifted Code Provenance (`LIFTS.md`)

All lifted code blocks embedded in `quod.html` are **strictly byte-identical** to their source line ranges in `attached/`. They are placed exclusively in the isolated host-side oracle block (`QUOD_ORACLES`) for differential testing against the formal Quod models (Test 9) and for optional interactive play in the Dead-Cell Demo. **Nothing in the Kernel, Differential Twin, Elaborator, or Tactics calls any lifted code.**

| Block | Source File | Line Range (1-indexed, inclusive) | Purpose | Changes |
|---|---|---|---|---|
| Triton constants | `attached/triton/triton4.html` | `882–883` | `TRYTE_MOD`, `TRYTE_HALF` | None (byte-identical) |
| Triton reference adder | `attached/triton/triton4.html` | `965–1000` | `balRem`, `balQuot`, `physAddr`, `wordSign`, `addWords27` | None (byte-identical) |
| Trytris rules engine | `attached/trytris/index.html` | `853–1593` | Mulberry32 PRNG, triangular grid geometry, polyiamond rotations, piece tables, `SeededBagGenerator`, `TrytrisEngine` | None (byte-identical) |

## Verification

Test 13 (`lift_integrity`) extracts each lifted block from `quod.html` by its provenance marker comments (`// from triton/triton4.html:882-883`, `// from triton/triton4.html:965-1000`, `// from trytris/index.html:853-1593`) and asserts that its SHA-256 digest equals the SHA-256 digest of the exact corresponding line range in `attached/`.
