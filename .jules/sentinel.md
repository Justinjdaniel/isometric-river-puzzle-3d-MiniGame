# 🛡️ Sentinel Security Journal

This journal tracks critical security learnings, vulnerability prevention patterns, and architectural constraints discovered within the 3D Isometric River Crossing Puzzle Game codebase.

## 2025-03-02 - [Input Validation] Robust Actor Validation
**Vulnerability:** The `GameState` methods (`loadToBoat`, `unloadFromBoat`) need robust input validation before performing dynamic indexing or state transitions. Unsupported actor identifiers could lead to unexpected behavior or logical flaws in game state management.
**Learning:** Direct logical value comparison (`actor === 'man' || ...`) validates unsupported identifiers before any dynamic lookup occurs, providing defense-in-depth. While `hasOwnProperty()` checks own keys and rejects inherited properties, an explicit allowlist is clearer and more maintainable for small, compile-time bound parameter sets.
**Prevention:** Always validate against a static, explicit list of supported identifiers (`actor === 'man' || actor === 'fox' || ...`) before performing dynamic property access or state mutations for small, predefined parameter sets.

## 2025-03-02 - [Content Security Policy] Defense-in-Depth against XSS
**Vulnerability:** Modern client-side applications face high risk of Cross-Site Scripting (XSS) and unauthorized asset loading. Without strict instructions, a browser could execute malicious external scripts injected via DOM manipulation.
**Learning:** Direct inclusion of a strong Content Security Policy (CSP) restricts script and style sources to trusted roots. Since the application has no inline scripts, we should not include `'unsafe-inline'` inside the `script-src` directive, because doing so weakens the protection against script injection.
**Prevention:** Maintain a strict `<meta http-equiv="Content-Security-Policy" ...>` tag in `index.html` without `'unsafe-inline'` for script-src, only allowing self-hosted resources, inline styles necessary for Three.js/UI layouts, and data URIs for fonts or icons if needed.
