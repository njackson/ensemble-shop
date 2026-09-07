# 00 — Carton fee still applied over 36 units

**Status: open**

## What and why

`priceLine` adds a $1.89 carton fee to any line over 36 units. Priya says the fee was retired in 2021
and nobody removed it. A 47-unit line of BC3001 comes out $1.89 too high.

## Decisions already made

- Remove it; do not put it behind a flag. There is no customer for whom it should stay.
- Its own commit, before any new pricing behavior lands, so the characterization test's expected value
  changes for one stated reason.

## Not in this ticket

- Refunding customers who paid it since 2021. Priya is taking that to finance.

## Where to look

`src/pricing/priceLine.ts`, `test/characterization/priceLine.test.ts`.

## Verification

The characterization case for 47 × BC3001 changes from $612.42 to $610.53, and nothing else in the
suite moves.

## Allow-list

`src/pricing/priceLine.ts`, `test/characterization/priceLine.test.ts`.
