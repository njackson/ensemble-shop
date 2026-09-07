# Checkout — the ticket, cut into slices

**Ticket.** *Customers should be able to place an order and see what it costs.* (Priya, the week
after the bracket fix.)

Tom's first cut was three layers: the schema, the endpoint, the storefront form. None of them could be
shown to Priya on its own. Ana re-cut it as slices (Module 03), each one passing the three questions:
can you demo it, can you ship it, can you tell from outside whether it worked.

## The walking skeleton

`POST /orders` with a customer and some lines; get an order id back. It prices nothing. It stores the
order in memory. It is deployed (`pnpm start`) before the second slice is written, because its whole
job is to prove that a request goes all the way through and comes back.

Tag: `03-skeleton`. One acceptance test: *a customer can place an order and get an order id back.*

## The slices, in order

| # | Slice | Demo | Ship | Observable |
|---|---|---|---|---|
| 1 | The skeleton above | Curl it, see an id | Yes | The id, and a `placed` order in the store |
| 2 | The order is priced with the bracket rule, per style across the order | Same curl, now with `totalCents` = $610.53 for the story's 47 shirts | Yes, behind the `BRACKET_PRICING` flag (Module 07) | Every line has a unit price and the total matches Tuesday's example |
| 3 | The customer can read their order back: `GET /orders/:id` | Curl the id from slice 1 | Yes | The order, with its status |

Not in this ticket: the invoice, payment, the storefront form, sales tax. Each is its own ticket in
`docs/backlog/`.

## Where the cut lines are

The bracket rule already exists (`priceOrder`); slice 2 is wiring, not pricing. The store is an
interface (`src/store.ts`) so the same slices work on a laptop and against a real database. The flag
in slice 2 is the point of Module 07's "deployment is not release": the endpoint can be deployed
pricing at list, and the bracket rule turned on separately, for a few customers first.
