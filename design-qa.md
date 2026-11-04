# FENZO Signal implementation QA

Date: 2026-11-04 (Asia/Seoul)

final result: passed

Final gate: refreshed post-fix captures and all four source/implementation
comparisons reviewed. No outstanding P0, P1 or P2 findings. All 16 responsive
states passed with no horizontal overflow or failed visible images. Hero actions
fit their container at every checked width, including an additional 1024px check.

## Scope

Approved Signal design applied to the existing customer homepage, product listing,
product detail, login and responsive layouts. The previously refined header and
category menu are included. Backend services, APIs, database, authentication,
order creation, cart persistence and existing route definitions are unchanged.

The only product-routing adjustment replaces the listing's incomplete category
label table with the shared header catalog, so every existing ProductCollection
route is recognized consistently.

## Approved visual truth and evidence

The five approved mockups remain in the workspace's
`output/fenzo-signal-mockups/` folder. Their original names identify:
homepage (exec-a78e438a), listing (exec-de1661fb), detail (exec-681efb09),
login (exec-55e9b683), and mobile board (exec-330ad4cf).

Repository evidence is saved in `docs/design-qa/`:

- `comparison-home.webp`, `comparison-listing.webp`,
  `comparison-detail.webp`, `comparison-login.webp` each place the approved
  source on the left and implementation on the right, in one comparison input.
- `home-1440.webp`, `listing-1440.webp`, `detail-1440.webp`,
  `login-1440.webp` are desktop captures.
- The corresponding `*-390.webp` files are mobile captures.
- `focus-listing.webp` and `focus-login.webp` compare readable card controls and
  form typography, source left and implementation right.
- Original desktop/tablet/mobile screenshots are saved separately under the
  workspace's `output/fenzo-signal-implementation/` directory.

Preview: `http://127.0.0.1:3011/`.

## Fidelity surfaces

### Typography

Inter/system sans for controls and metadata; Georgia serif for editorial titles.
The serif uses a system font to avoid external font loading and retain a stable
render. Readable product names, navy prices, permanent form labels, and meaningful
page headings replace competing badges and tiny metadata.

Desktop mockups are illustrative rather than font-metric exact; the refined
existing header remains instead of reverting to the earlier mockup header.

### Spacing and layout

Ivory canvas, consistent page gutters, natural-width navigation, a shorter hero,
a quiet benefit strip and a four-card product grid follow the approved hierarchy.
The listing has a working category rail which becomes horizontally scrollable.
The detail gallery and purchase column share one surface; reviews retain their
existing complete form, distribution, and list.

Mobile uses two product columns and a purchase bar above the existing bottom
navigation. The menu retains its viewport-aware height and internal scrolling.

### Colors and states

Shared ivory, navy, cobalt and neutral-border tokens unify the four pages.
Cobalt identifies actions and selected states; gold is reserved for actual ratings.
Focus outlines remain visible. Reduced-motion styles disable decorative transitions.
Disabled purchase actions retain actual stock restrictions.

### Images and assets

Product photography, prices, seller identity, ratings, stock and review counts
come from existing services. No illustrated mock ratings or fake review counts
were copied into the application. Unrated items say “No reviews yet.”

The built-in ImageGen tool generated one separate decorative campaign asset,
`public/img/signal-campaign.webp` (about 108 KiB), based on the approved hero.
Prompt: warm limestone still life, generic laptop, cream headphones, perfume and
white sneaker, natural sunlight, navy/ivory palette, no logos/text/UI. It is
campaign artwork, not a replacement for catalog photography. Reused for login.

The actual FENZO raster mark and the existing Material icon package are retained.

### Copy and functionality

Hero, title and explanatory copy were adapted to the approved visual design.
Search, category routes, cart, wishlist, buy-now, gallery, seller navigation,
reviews, form validation, password visibility and auth redirect logic remain.

The login keeps its dedicated auth shell and back-to-shopping control; signup and
other unrelated pages retain their current behavior. The full review form is
preserved rather than reducing it to the mockup's abbreviated review teaser.

## Comparison history and fixes

1. [P2, fixed] Benefit strip inherited a floating rounded-card treatment and
   overlapped the new hero. Removed transform, elevation, width restriction and
   card shell; retained a simple flow layout and divider.
2. [P2, fixed] Detail photo frame retained a fixed width, leaving excess blank
   space in the gallery. Made the frame span its gallery and reset old image
   max-size/inset rules; preserved zoom and thumbnails.
3. [P2, fixed] Login support copy overlapped dark image content. Separated the
   desktop text area and campaign photograph vertically. Mobile uses a compact
   photograph followed by the form.
4. [P1, fixed] Old detail backdrop blur established a containing block for the
   mobile fixed purchase bar; old mobile grid rules stacked the buttons.
   Removed backdrop containment, reset button grid placement, and retained a
   single 69px action bar above the 66px bottom navigation.
5. [P1, fixed] Legacy mobile catalog CSS hid Add to cart and grid/list selection.
   Explicitly restored both in Signal's shared card/listing styles.
6. [P2, fixed] Old bottom-row alignment pushed prices to the right; long names
   inherited one-line ellipsis. Restored left alignment and two-line names.
7. [P2, fixed] Product imagery was captured before loading in an intermediate
   desktop listing screenshot. Rejected that capture and added image-settling
   checks before the final screenshots.
8. [P2, fixed] Home card density and duplicate catalog toolbar spacing moved
   useful content too far below the fold. Shortened the hero, simplified benefits,
   compacted the desktop home-card purchase row, and aligned desktop view controls
   with the page heading. Narrow mobile typography and actions reflow naturally.

Post-fix evidence is the refreshed capture/comparison set above.

9. [P1, fixed] Tablet captures showed hero actions clipped by a fixed-height
   composition and login story copy crossing the image. The hero now derives its
   height from its content, with the image removed from intrinsic row sizing;
   compact login uses the photograph without overlay copy. Tablet screenshots
   and hero-action containment were checked again after the change.
10. [P2, fixed] The desktop listing view toggle was positioned relative to the
    grid instead of the page heading. Removed the grid positioning context and
    verified the toolbar's heading alignment.

## Browser verification

Tested CSS viewports: 1440 x 1024, 768 x 1024, 390 x 844, 320 x 568.
Each of the four pages was inspected at each size (16 page/viewport states).
Header-specific QA also covered 1200px, 1024px and landscape 667 x 375.

- All 28 category destinations retained; menu keyboard arrows, Home/End, Tab,
  Escape, focus restoration, outside click and category-route closure tested.
- Search routing, category rail, grid/list toggle and load-more behavior checked.
- Added a Samsung Laptop to the preview cart; cart badge and drawer showed it.
  No purchase or order was submitted.
- Product quantity 1 -> 2 -> 1 correctly changed $1,200 -> $2,400 -> $1,200.
- Product image selection changed the gallery counter and restored image 1.
- Login blank-submit validation and password show/hide worked without an auth
  request. Existing safe redirect logic was retained.
- Language switching and guest signup navigation passed during header QA.
- Browser console errors/warnings inspected; none recorded in the final gate.
- Cart/wishlist/order hooks and request implementations were not replaced.

## Capture normalization

Desktop source images are 1487 x 1057 pixels. Implementation uses an explicit
1440 x 1024 CSS viewport; browser captures exclude scrollbar/capture-edge pixels.
Each source and implementation was resized proportionally to 1280px wide and
placed side by side; neither image was stretched.

The mobile board contains four tall presentation frames, while actual mobile
screens use 390 x 844 and 320 x 568 viewports. Mobile review checks hierarchy,
flow, legibility and controls at those actual dimensions, rather than squeezing
the board into a different aspect ratio. Focused comparisons are used for controls
and title/card detail, in addition to the full-page views.

## Source checks and build

- TypeScript: passed.
- ESLint: passed.
- Existing tests: 1 suite, 4 tests passed.
- Production build: passed, isolated from the live output directory.
- git diff --check: passed.
- No new JavaScript dependencies.
- Generated build output and node_modules are not committed.

## Limits

Signed-in account, wishlist persistence and successful login could not be tested
without credentials. No test account was created and no order was placed.
Keyboard/browser semantics were checked; physical-device and screen-reader
speech testing were not performed. Current backend data may change naturally.

P3: a supplied horizontal vector brand asset would improve the tiny brand mark.

## Follow-up: homepage spacing and progressive categories

The brand strip between The Tech Edit and Popular right now inherited 88px
vertical padding and white brand labels. Reduced it from about 365px to 119px,
with 16px/20px padding, a 56px track, and readable navy/gray labels on ivory.

All categories now opens with four collapsed group buttons. Selecting a group
reveals only its children; selecting another closes the previous group. Reopening
the menu resets all groups. All 28 original category destinations were checked
across the four groups (6/8/6/8).

Browser checks passed at desktop, 390px, 320px and 667px landscape: initial zero
child links, single-group expansion, toggle collapse, route navigation, Escape
and focus restoration, ArrowDown/Up, Home/End support, and outside-click closure.
No horizontal overflow; long mobile lists scroll within the bounded panel.
Typecheck, lint, diff whitespace validation and production build passed.

## Follow-up: compact category disclosure

User screenshot showed excessive unused width, a large introduction, duplicate
product destinations and decorative footer copy. Replaced the 720px menu with a
380px maximum-width disclosure. Collapsed height is 295px with four 44px group
controls. Removed the eyebrow, duplicate top product link and footer slogan;
retained one all-products destination and compact guest signup.

Desktop children use two columns inside the same narrow panel; phones retain a
single scrollable column. No category identifiers or route destinations changed.
Verified initial collapse, group expansion, Escape/focus restoration, and bounds
at 1440x1000, 390x844, 320x568 and 667x375. No horizontal overflow.

`docs/design-qa/compact-menu-comparison.webp` places the supplied screenshot on
the left and the implementation crop on the right at their captured scale. The
first Browser clip unexpectedly included the wrong page area; rejected it and
extracted the menu from the accepted full viewport capture using its measured
bounds. Reviewed the corrected comparison and desktop expanded/mobile captures.
Typecheck, lint, production build and whitespace checks passed. Final result:
passed for the requested compact menu change.
