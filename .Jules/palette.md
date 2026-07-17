## 2025-02-14 - [WCAG Interactive Nesting & Native Controls]
**Learning:** Nesting clickable buttons (such as settings/instructions gears) inside a container with `role="button"` violates WCAG 4.1.2 (Interactive Nesting). Generic containers mimicking buttons with `keydown` listeners are fragile and trigger screen-reader conflicts.
**Action:** Always use native sibling `<button>` elements for discrete collapse toggles, leaving adjacent buttons as separate focusable peers. Avoid manual keydown/click suppression listeners on generic parent divs.
