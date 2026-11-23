# Quod Logic Specification (`LOGIC.md`)

Quod implements a **predicative, universe-polymorphic Calculus of Inductive Constructions (pCIC)** — a dependent type theory in the Martin-Löf / Coq / Lean family with explicit universe polymorphism, general inductive types and inductive families, strict positivity checking, automatically generated recursors with iota reduction, beta/delta/iota/zeta/eta definitional equality, and explicit transitive axiom tracking.

## 1. Universes and Predicativity

Universe levels are built from non-negative integers (`BigInt`) and universe parameter indices:

```
u, v ::= Lit(n)           (n ∈ ℕ, n ≥ 0)
       | Param(i)         (universe parameter i)
       | Succ(u)          (u + 1)
       | Max(u, v)        (max(u, v))
```

- **Sorts:** `Sort(u)` denotes `Type u`.
- **Typing of Sorts:** `Γ ⊢ Sort(u) : Sort(Succ(u))`.
  - No `Type : Type` (predicative strict hierarchy: `Type 0 : Type 1 : Type 2 : ...`).
  - There is no impredicative `Prop` sort; propositions live in `Type 0` (or `Type u` polymorphically) with standard predicative elimination. Because there is no impredicative `Prop`, large elimination from `Type 0` into `Type u` is sound by construction.
- **Dependent Function Types (Pi):**
  If `Γ ⊢ A : Sort(u)` and `Γ, x : A ⊢ B : Sort(v)`, then `Γ ⊢ Π (x : A), B : Sort(Max(u, v))`.

## 2. Core Term Grammar

In the **Kernel** (de Bruijn indices + Normalization by Evaluation):
```
t, A, B ::= Var(idx)                   (de Bruijn index, BigInt ≥ 0)
          | Sort(u)                    (universe Type u)
          | Pi(name, dom, cod)         (dependent product)
          | Lam(name, dom, body)       (lambda abstraction)
          | App(fn, arg)               (application)
          | Let(name, ty, val, body)   (local let-binding)
          | Const(name, levels)        (global declaration instantiated at levels)
          | NatLit(n)                  (native BigInt natural literal, n ≥ 0n)
          | ByteTableLit(id)           (native immutable byte-table handle, e.g. "alu.bin")
```

In the **Differential Twin** (locally nameless + substitution-based WHNF):
```
t, A, B ::= BVar(idx)                  (bound de Bruijn index)
          | FVar(id, name)             (free local variable)
          | Sort(u)
          | Pi(name, dom, cod)
          | Lam(name, dom, body)
          | App(fn, arg)
          | Let(name, ty, val, body)
          | Const(name, levels)
          | NatLit(n)
          | ByteTableLit(id)
```

## 3. Declarations

Every global environment entry is one of:
1. **`inductive`:** `inductive I.{u1..uk} (p1 : P1) ... (pm : Pm) : (i1 : I1) → ... → (in : In) → Sort(w)` with constructors `c1, ..., cr`.
   - Each constructor `cj` has type `Π (p1..pm) (a1..as), I.{u1..uk} p1..pm e1..en`.
   - **Universe check:** Every non-parameter constructor field type `ak` must live in `Sort(v)` with `v ≤ w`.
   - **Strict positivity check:** In every constructor field type `ak`, `I` may occur ONLY strictly positively: either `I` does not occur in `ak` at all, or `ak` has the form `Π (x1 : D1) ... (xp : Dp), I p1..pm t1..tn` where `I` does not occur anywhere in `D1..Dp, t1..tn` (and parameters match `p1..pm`).
   - **Automatic Recursor (`I.rec`):** Generated automatically with universe parameters `{u1..uk, w_motive}`, taking parameters `p1..pm`, motive `P : Π (i1..in), I p1..pm i1..in → Sort(w_motive)`, one minor premise per constructor (with inductive hypotheses for every recursive field), indices `i1..in`, and major premise `x : I p1..pm i1..in`, returning `P i1..in x`.
2. **`def`:** Non-recursive definition `def name.{u1..uk} : T := body`.
   - Verified `⊢ T : Sort(w)` and `⊢ body : T` in the environment *before* `name` is added (so raw self-recursion is impossible in the kernel; all recursion goes through `I.rec`).
   - `theorem` is identical to `def` in the kernel (checked in full; proof terms are exported and rechecked by the twin).
3. **`axiom`:** `axiom name.{u1..uk} : T`.
   - Verified `⊢ T : Sort(w)`.
   - Recorded in the environment's axiom registry. Every declaration transitively computes and stores the set of axioms referenced in its type or body.
   - Standard library and showcase theorems use **zero axioms**.

## 4. Definitional Equality and Reduction

Two well-typed terms `t1` and `t2` are definitionally equal (`t1 ≡ t2`) when their normalizations match under:
- **β-reduction:** `(λ (x : A) => b) a ↦ b[a/x]`
- **δ-reduction:** unfolding `def` constants `Const(name, ls) ↦ body[ls]`
- **ι-reduction:** `I.rec params motive minors indices (cj params args) ↦ minor_j args ihs`
- **ζ-reduction:** `let x : A := v in b ↦ b[v/x]`
- **η-conversion:** `f ≡ λ (x : A) => f x` (checked structurally during conversion when one side is a lambda and the other is a neutral/non-lambda term).

## 5. Native Accelerations (Part of the Trusted Base)

Both the Kernel and the Differential Twin implement these two accelerations **independently**:

1. **Big Naturals (`NatLit` + closed-literal `Nat` reduction):**
   - `NatLit(n)` (for `BigInt n ≥ 0n`) has type `Nat`.
   - `NatLit(0n) ≡ Nat.zero` and `NatLit(n + 1n) ≡ Nat.succ (NatLit(n))`.
   - `Nat.rec` eliminates `NatLit(0n)` to the zero branch and `NatLit(n + 1n)` to the successor branch with `NatLit(n)` (iteratively without stack overflow).
   - Closed-literal arithmetic primitives (`Prim.natAdd`, `Prim.natSub`, `Prim.natMul`, `Prim.natDiv`, `Prim.natMod`, `Prim.natEq`, `Prim.natLt`, `Prim.natLe`, `Prim.natAnd`, `Prim.natOr`, `Prim.natXor`, `Prim.natShl`, `Prim.natShr`, `Prim.natBitTest`, `Prim.natBitSet`) reduce in O(1) `BigInt` operations when applied to closed `NatLit` arguments, and remain neutral on open terms.
   - Additionally, standard inductive `Nat.add` and `Nat.mul` (defined via `Nat.rec` so ring laws are proved by pure induction) short-circuit on two closed `NatLit` arguments to `NatLit(a + b)` and `NatLit(a * b)` (strictly conservative with respect to `Nat.rec`).
2. **Immutable Byte Tables (`ByteTable`):**
   - Built-in type `ByteTable : Type 0` with literal handle `ByteTableLit("alu.bin") : ByteTable`.
   - Primitives `Prim.btLen : ByteTable → Nat` and `Prim.btGet : ByteTable → Nat → Nat` (returning byte at index `i`, or `0` if out of bounds, as a `NatLit`).
   - The Kernel and the Twin each load `alu.bin` into their own independent `Uint8Array` directly from the attached file (never sharing a buffer).

## 6. Export Format (Shared Lexer Only)

Proof terms and declarations are exported as deterministic S-expressions:
- Levels: `(L 0)`, `(P 0)`, `(S lvl)`, `(M l1 l2)`
- Terms: `(V idx)`, `(Sort lvl)`, `(Pi name dom cod)`, `(Lam name dom body)`, `(App fn arg)`, `(Let name ty val body)`, `(C name (lvls...))`, `(N bigint)`, `(BT id)`
- Declarations:
  - `(inductive name (uParams...) numParams (paramTys...) (indexTys...) sortLvl (ctors...))`
  - `(def name (uParams...) type body)`
  - `(axiom name (uParams...) type)`

Only the S-expression tokenizer (`lexSexp`) is shared between the Kernel and the Twin.

## 7. Soundness Probes (Test 2 & Test 7)

The following invalid developments are rejected by both Kernel and Twin:
1. **Hurkens' Paradox (`Type : Type`)** — rejected by universe level check (`0 < 0` fails). Positive control: accepted when test-only `allowTypeInType` switch is enabled.
2. **Negative Inductive (`Bad := mk (Bad → Empty)`)** — rejected by strict positivity check. Positive control: accepted when test-only `allowNegativeInductive` switch is enabled.
3. **Non-structural recursion** — rejected by elaborator structural-recursion checker and by kernel non-recursive definition rule.
4. **Universe-level violation** — `Type 0 : Type 0` and predicative inductive field exceeding inductive universe.
5. **Wrong eliminator motive** — `Nat.rec` applied to a motive of type `Bool → Type 0`.
6. **Definitional-equality forgery** — `Eq.refl Nat 0 : Eq Nat 0 1`.
7. **Malformed inductive index & unbound variable** — rejected by constructor index typing and scope check.
