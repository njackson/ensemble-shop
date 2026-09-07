# 01 — Order confirmation text

**Status: ready**

## What and why

When an order is placed, the customer gets a plain-text confirmation: what they ordered, the unit
price per line, the total, and the order id. Today they get JSON. Priya reads the confirmations too;
they are how she spots a wrong price before the customer does.

## Decisions already made

- Plain text, not HTML. It goes into an email body and into the support agent's context; both prefer
  text.
- Money is written as dollars with two decimals (`$610.53`), never cents.
- The bracket price is shown as a price, not as a discount off list (VOCABULARY.md). No "you saved".
- One function: `confirmationText(order: StoredOrder): string`.

## Not in this ticket

- Sending the email. Nothing in this repository sends anything.
- Wiring into `POST /orders`. A separate, serial ticket touches `src/server.ts`.

## Where to look

`src/store.ts` for `StoredOrder`; `test/acceptance/checkout.spec.ts` for the 47-shirt order the
confirmation should be tested on.

## Verification

A unit test with the story's order: two lines at $12.99, total $610.53, the order id on the first line.
A second test with a two-style order under the bracket, both at list. Nobody has to read the output
to know it is right; the test does.

## Allow-list

`src/confirmation.ts`, `test/unit/confirmation.test.ts`. Nothing else.

## Risk

Rounding. Use the cents as integers and format at the end; never multiply dollars.
