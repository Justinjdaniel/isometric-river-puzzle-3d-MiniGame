# 🛡️ Sentinel Security Journal

This journal tracks critical security learnings, vulnerability prevention patterns, and architectural constraints discovered within the 3D Isometric River Crossing Puzzle Game codebase.

## 2025-03-02 - [Input Validation] Robust Actor Whitelisting
**Vulnerability:** The `GameState` methods (`loadToBoat`, `unloadFromBoat`) previously checked parameter properties dynamically via `hasOwnProperty(actor)`. While safe in normal execution, using dynamic lookup can lead to prototype pollution bypasses or logical confusion if malicious or untrusted values are supplied to state transitions.
**Learning:** Checking against a strict compile-time frozen whitelist array/set is much more robust and completely eliminates any possibility of prototype lookup/manipulation.
**Prevention:** Always define and freeze a static list of valid actor keys (`['man', 'fox', 'sheep1', 'sheep2']`) and validate input strictly against this set before executing logical operations.

## 2025-03-02 - [Content Security Policy] Defense-in-Depth against XSS
**Vulnerability:** Modern client-side applications face high risk of Cross-Site Scripting (XSS) and unauthorized asset loading. Without strict instructions, a browser could execute malicious external scripts injected via DOM manipulation.
**Learning:** Direct inclusion of a strong Content Security Policy (CSP) restricts script and style sources to trusted roots, ensuring any injected script tag cannot execute or fetch malicious assets.
**Prevention:** Maintain a strict `<meta http-equiv="Content-Security-Policy" ...>` tag in `index.html` allowing only self-hosted resources, inline styles necessary for Three.js/UI layouts, and data URIs for fonts or icons if needed.
