# MANIFEST: Quod (Neon ceiling test)

Send to Neon: **`quod-for-neon.zip`** (`SPEC.md` + `attached/`). Nothing else.

| File | What it is | sha256 |
|---|---|---|
| `attached/card/alu.bin` | ALU slice image | `003153df8ee9b1a061f3bebd7561a2b4e199aa408638cc62ff69f368063f58c5` |
| `attached/card/roms.js` | Image layouts (lines 8–15) | `90ff87cafecf4f26d9cf366bdae50be699bd85af9a8d9223950c634bbab9a432` |
| `attached/card/microsim.js` | ALU function meanings (lines 8–31) | `f6e074326e4355f2b0d58d0da612870f5eadf56fc19b3226933f47967759f147` |
| `attached/triton/ISA-4.md` | Triton 4 ISA | `4f31a15e24b96c47b080ae0514b13a7757dfa3b640e6b4df6fced809be4524b3` |
| `attached/triton/triton4.html` | Reference emulator (lines 882–883, 965–1001) | `7550b1df8284c292d4accf84708f2f471a00574cca9f908e06d52b8cc2fce801` |
| `attached/trytris/index.html` | Game; rules engine at lines 853–1593 | `349a0be0cf167bae586f29a1b91992664bd143c792be7211a7736d7ae4dd8b34` |
| `attached/trytris/SPEC.md` | Game rules prose | `a6867eb6f52a99d0f25a547e122616f216b32a00e33cbb9b77d6d3bfa7c63f39` |

Sources:
- `ConsciousNode/Triton-card-computer` @ `f5c82385a5e1a4556080de038a1dd54385043521`
- `ConsciousNode/Triton` @ `17300f799fb7a012b8ece30bbb5473cb664b19da`
- `ConsciousNode/trytris` @ `02ecb56617de1f76517c2d4c8e34f1daab95881c`

**Do NOT send:** `PREREG.md`.

Suggested message: "Build what SPEC.md describes. Attachments are in `attached/`. Report honestly, including where it stops."
