# Jules PR Reviewer Rules

This repository contains an interactive 3D isometric River Crossing puzzle game built with Three.js, Vanilla ES Modules, and Vite. Please enforce the following rules during reviews.

---

## 1. Technical Stack & Architecture

### Three.js & Performance
- **Low-Poly & Flat Shading**: Ensure that 3D assets use a flat-shaded, low-poly aesthetic. Geometries should use flat shading (`MeshStandardMaterial` with `flatShading: true`).
- **Memory Optimization**: Shared 3D geometries (such as `DodecahedronGeometry` for rocks/pebbles and `BoxGeometry` for soil clods) should be instantiated once outside render loops and reused across meshes.
- **Deformation Decay Prevention**: Ensure any water flow or vertex deformation logic (especially in `src/render/animation.js`) caches original coordinates (e.g. lazily under `userData.originalY`) to avoid stateful deformation decay on top-face vertices over time.

### Vite & Deployment
- **Relative Path Configuration**: `vite.config.js` must specify `base: './'` to ensure assets are resolved via relative paths for GitHub Pages deployment.

---

## 2. Mandatory Visual Proof & Inspection Status Check (For Jules PRs Only)

Before approving any PR, check the author of the PR. **If the PR is created by Jules (or an AI agent operating as Jules)**, you must scan the PR description or latest comments for visual evidence (such as a GIF, video, or image) showing the runtime output of the changes, as well as an inspection status.

- **Note**: This rule only applies to PRs created by **Jules**. Do **NOT** enforce this visual evidence or inspection status warning on PRs created by other human developers.
- If the PR is created by **Jules**, and the PR has **not** attached a GIF, video, or image of the PR output, or has not specified the inspection status, you **must** output this exact warning:
  > ⚠️ Visual output verification pending. Please upload a GIF/video/image of your runtime output and set your Inspection Status.

---

## 3. 👉 What to Do Next in GitHub

At the bottom of every review comment or review summary, you **must** append a clear, structured section titled "👉 **What to Do Next in GitHub**". Customize the instructions based on the review verdict:

### If Verdict is BLOCKING (High Severity issues found):
- **Address Findings**: Refactor the code to address the high-severity comments.
- **Push Updates**: Commit and push your changes to the branch. The Jules Reviewer action will automatically re-run and attempt to auto-resolve fixed threads.
- **Do Not Merge**: Do not attempt to merge until all blocking issues are resolved and the review status becomes green.

### If Verdict is WARNING / NIT (Only warnings or info messages):
- **Review Recommendations**: Address the suggestions if you agree they improve readability/consistency, or reply to the thread with your reasoning.
- **Visual Verification**: Ensure a GIF/video/image has been uploaded to verify visual changes (if this PR was created by Jules).
- **Proceed**: If you are satisfied with the comments, you may proceed to merge the PR.
