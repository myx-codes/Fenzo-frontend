# FENZO typography

The shared scale is defined once in `src/css/typography.css` and consumed by
Material UI in `src/app/MaterialTheme/typography.ts`. The CSS loads last to
normalize legacy page-specific sizes without changing routes or business logic.

| Role | Size at default browser settings | Use |
| --- | --- | --- |
| Caption | 12px | Ratings, dates, badges, metadata, bottom navigation |
| Body / control | 14px | Paragraphs, product names, buttons, labels, navigation |
| Input | 16px | Editable fields, small headings |
| Lead | 18px | Supporting headings |
| Heading / price | 20px | Card titles, product-card prices, empty-state titles |
| Section | 22–24px | Page sections and summary headings |
| Page | 28–32px | Main page titles and purchase totals |
| Display | 32–40px | Editorial campaigns only |

Sizes use rem units and bounded responsive interpolation. Browser text settings
remain effective; no fixed root font size is imposed. Body line height is 1.6,
metadata 1.5, controls 1.4, and headings 1.15–1.35. Keep the existing sans-serif
for interface text and serif for Signal editorial titles.

Use MUI variants or the existing role selectors for new components. Avoid new
one-off pixel sizes and viewport-specific text reductions. Icons, the brand mark
and decorative 404 artwork have independent sizing. Product names remain two
lines. On phones, purchase buttons stack to retain readable 14px labels and 44px
touch targets. Long campaign buttons wrap instead of clipping their labels.

Authenticated account/order layouts are covered by role selectors and the MUI
theme. Their signed-in content requires an authenticated browser for visual QA.
