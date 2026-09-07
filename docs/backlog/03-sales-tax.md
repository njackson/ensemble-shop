# 03 — Sales tax line

**Status: ready**

## What and why

Orders shipped to a taxable state carry sales tax on the merchandise total. The shop currently shows
none, and Priya adds it by hand on the invoice.

## Decisions already made

- Tax is computed on `totalCents`, after the bracket rule, never per line.
- Rates live in `data/tax-rates.json` as `{ "CA": 0.0725, "OR": 0 }` — a lookup, not a formula. Add
  three states with real published base rates; the rest are a finding, not a default of zero.
- Rounding: half up to the cent, once, on the total. `Math.round` on cents is fine here.
- `salesTaxCents(totalCents: number, state: string, rates: Rates): number`. Unknown state throws;
  it does not return zero.
- The word is *sales tax*, not *VAT*, not *tax rate* (VOCABULARY.md gets a line).

## Not in this ticket

- Tax-exempt customers (resale certificates). That is a customer attribute the store does not have
  yet.
- Wiring into the order. Serial ticket.

## Where to look

`src/pricing/bracket.ts` for the shape of a one-function module; `data/prices.json` for the shape of
a data file this repository reads.

## Verification

A unit test per state in the file, with the story's $610.53 total, asserting the exact cents. One
test that an unknown state throws.

## Allow-list

`src/tax.ts`, `data/tax-rates.json`, `test/unit/tax.test.ts`, one line in `VOCABULARY.md`.

## Risk

Rates change. The file carries a `asOf` date; a test that fails when it is older than a year is
better than a silent stale rate.
