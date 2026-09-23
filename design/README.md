# Structured theme adaptation

Reference: user-supplied DESIGN (5).md, theme (1).css, variables (1).css and tokens (1).json, applied 2026-09-05.

The original CSS tokens and JSON are retained here. Global theme aliases connect them to existing components; app/gallery.css adapts the existing atlas surfaces without changing navigation, data, illustrations, music or map animations.

- White gallery surround with the illustrated map in a 9px frame, a large serif caption below, an outlined circular leaf mark, Bone panels, Graphite secondary text, 28.8px action capsules and circular directory thumbnails. This follows the user's Refero preview composition, confirmed again on 2026-09-06.
- Davinci and Helvetica Now font binaries were not supplied. Playfair Display and the existing Inter implement the reference's explicitly listed substitutes.
- The 374px marketing wordmark and full-screen alternating sections are not transplanted into the interactive map. Panel headings use the reference's compact display scale.
- The source contradicts itself about black primary buttons; the explicit color-token instruction takes precedence, so primary actions use neutral Putty instead.
- Colored category markers and existing illustration assets remain functional content. The footer retains the owner's requested transparency.

Font aliases resolve on body alongside the next/font variables; defining these aliases on root silently fell back to system fonts. Header/tag/dialog selectors now override legacy specificity consistently. Short-window descriptions remain visible within scrollable detail panels.

Map camera calculations use the real canvas rectangle rather than the browser window. Directory and detail rectangles are translated into that local coordinate system. A ResizeObserver tracks the frame; the postcard remains fixed to allow the owner's requested whole-screen positioning.

Validation: production Sites build, TypeScript and all 15 existing tests passed. Browser QA at 1440×900 and 1280×720 covers gallery composition, serif typography, garden selection, full-map reset, filters, the information dialog, and Prales at maximum zoom with both panels present. Local route returns HTTP 200. No deployment was performed.
