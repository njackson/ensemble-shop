# 02 — Orders as CSV

**Status: ready**

## What and why

Priya reconciles the week's orders in a spreadsheet. She wants a CSV of orders: one row per line, with
order id, customer, placed-at, style, color, quantity, unit price and line total, and a header row.

## Decisions already made

- One row per *line*, not per order. That is how she sums by style.
- RFC 4180: fields quoted when they contain a comma, a quote or a newline; quotes doubled. Customer
  emails will not contain those; style names in a future column might.
- Money as dollars with two decimals, same as the confirmation.
- `ordersToCsv(orders: StoredOrder[]): string`. Reads from the store interface, never from the server.

## Not in this ticket

- An endpoint or a download. Serial ticket, later.
- Filtering by date. She filters in the spreadsheet.

## Where to look

`src/store.ts` for `StoredOrder` and `byCustomer`; `memoryStore(seed)` to build fixtures in tests.

## Verification

A unit test with two orders, three lines, asserting the exact CSV text including the header. One
field containing a comma, quoted correctly.

## Allow-list

`src/export/csv.ts`, `test/unit/csv.test.ts`. Nothing else.

## Risk

Line endings. Emit `\n`; if her spreadsheet wants `\r\n`, that is a finding, not a guess.
