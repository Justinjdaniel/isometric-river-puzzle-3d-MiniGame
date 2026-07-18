# 🛡️ Sentinel Security Journal

This journal tracks critical security learnings, vulnerability prevention patterns, and architectural constraints discovered within the 3D Isometric River Crossing Puzzle Game codebase.

## 2025-03-02 - [Input Validation] Robust Actor Validation
**Vulnerability:** The `GameState` methods (`loadToBoat`, `unloadFromBoat`) previously checked parameter properties dynamically via `hasOwnProperty(actor)`. While safe in normal execution, using dynamic lookup can lead to prototype pollution bypasses or logical confusion if malicious or untrusted values are supplied to state transitions.
**Learning:** Initially checking against a static frozen array is secure, but introduces unnecessary memory allocation overhead. A direct logical value comparison is completely zero-allocation, extremely fast, and maintains 100% security against prototype lookup or property injection patterns.
**Prevention:** Always use static, direct, zero-allocation logical comparison (`actor === 'man' || ...`) instead of dynamic key lookups or local array creations for small, compile-time bound parameter sets.

## 2025-03-02 - [Content Security Policy] Defense-in-Depth against XSS
**Vulnerability:** Modern client-side applications face high risk of Cross-Site Scripting (XSS) and unauthorized asset loading. Without strict instructions, a browser could execute malicious external scripts injected via DOM manipulation.
**Learning:** Direct inclusion of a strong Content Security Policy (CSP) restricts script and style sources to trusted roots. Since the application has no inline scripts, we should not include `'unsafe-inline'` inside the `script-src` directive, because doing so weakens the protection against script injection.
**Prevention:** Maintain a strict `<meta http-equiv="Content-Security-Policy" ...>` tag in `index.html` without `'unsafe-inline'` for script-src, only allowing self-hosted resources, inline styles necessary for Three.js/UI layouts, and data URIs for fonts or icons if needed.
