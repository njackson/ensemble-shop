# Verification: bracket price judged per order

**Asked for.** Orders past the bracket quantity get the bracket price — per style, across the whole
order, not per line. (Ticket; Tuesday's table in `docs/refinement/bracket-pricing.md`.)

**Done.** `priceOrder` totals quantity per style before choosing the unit price; the carton fee was
retired in its own commit; one function decides the bracket price everywhere.

## Evidence

- **Acceptance.** `test/acceptance/bracket-price.spec.ts` — *an order of 47 BC3001 shirts across two
  colors bills at the bracket price: $610.53*. Green. `git diff 05-outer-test..HEAD -- test/acceptance/`
  shows the title and body unchanged; only the path moved out of `pending/`.
- **Seam-level.** `test/characterization/priceLine.test.ts` — six cases against the real price list
  read from `data/prices.json`. Green. One expected value changed, in the commit that retired the fee.
- **Regression.** Mutation by hand: changed `>=` to `>` in `bracketUnitPrice`; the "36 × BC3001 — at
  the bracket" case went red; restored. `git status` clean after.
- **Real run.** `pnpm test` on this branch. No storefront in this repository; the invoice PDF is not in
  this slice.
- **Production.** No telemetry in this repository. Nothing to point at.

## What was not verified

- **Returns.** If a customer returns units and the order drops below 36, is the rest re-priced?
  Open. **Owner: Priya**, asking finance. This slice does nothing on returns; that is the accepted
  unknown it carries, and it stays here until she closes it.
- **Two styles in one order** is covered by a mapping example but has no acceptance test yet. The
  characterization suite covers the per-line price of each style, not the per-order judgement.
- **Anything at the bracket boundary for styles other than BC3001.** The mutation check used
  BC3001's 36; G5000's bracket is 72 and nothing exercises it.
- **The storefront line and the invoice.** Separate slices (Module 03); not touched here.

## What would change the verdict

If `qtyByStyle` were keyed on something other than style — a typo to `l.color` would make 20 red and
27 blue two separate brackets and reproduce Monday exactly, and only the acceptance test would notice.

## What changed after green

`refactor: one place decides the bracket price` — `bracketUnitPrice` extracted, duplicated lookup
removed. Present in the log; the diff touches `src/` only.
