# 04 — Shipping weight estimate

**Status: ready**

## What and why

The carrier quotes by weight. Priya estimates a box's weight from the unit count by hand. The shop
should estimate it: units per style, a weight per style, cartons of 72.

## Decisions already made

- Weights per style live in the price row's neighbor: `data/weights.json`, ounces per unit, one entry
  per style in `data/prices.json`. A style with no weight throws.
- Cartons: 72 units per carton, 12 oz of carton per carton, partial cartons count as whole.
- Output in ounces as an integer; the carrier's form takes pounds and ounces, which is a display
  concern for later.
- `shippingWeightOz(order: Order, weights: Weights): number`.

## Not in this ticket

- Carrier rates. Weight only.
- Wiring. Serial ticket.

## Where to look

`src/orders.ts` for `Order` and `totalsByStyle` (which is private; copy the three lines rather than
export it, and say so in the commit).

## Verification

Unit tests: 47 BC3001 at a stated weight is one carton; 73 is two; two styles in one order sum. The
numbers in the tests come from `data/weights.json`, not from the test.

## Allow-list

`src/shipping.ts`, `data/weights.json`, `test/unit/shipping.test.ts`.

## Risk

The 72-per-carton assumption is Priya's from memory. Written into the ticket so it is visible; if the
supplier's carton is 48, one constant changes.
