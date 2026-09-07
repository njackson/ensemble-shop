# Backlog

Tickets written the way Module 03 and the `refine` skill say a ticket should be written: what and why,
the decisions already made, what is deliberately out, where to look, how it will be verified, and the
files the work may touch. Each one could be handed to a stranger, or to an agent, cold.

Four of them are independent of each other: no two touch the same file. That is what makes them the
material for Module 09's afternoon drill and Module 11's queue. Run two, or all four, at once, each in
its own worktree with its own allow-list, and land each through the gate.

| Ticket | Status | Touches | Runs alongside |
|---|---|---|---|
| [00 Carton fee still applied over 36 units](00-carton-fee.md) | open | `src/pricing/` | — |
| [01 Order confirmation text](01-order-confirmation.md) | ready | `src/confirmation.ts` | 02, 03, 04 |
| [02 Orders as CSV](02-csv-export.md) | ready | `src/export/` | 01, 03, 04 |
| [03 Sales tax line](03-sales-tax.md) | ready | `src/tax.ts` | 01, 02, 04 |
| [04 Shipping weight estimate](04-shipping-estimate.md) | ready | `src/shipping.ts` | 01, 02, 03 |
| [05 Rename `cents` fields to `amountCents`](05-rename-cents.md) | ready | everything | nothing: cross-cutting, runs alone |

None of the four independent tickets wires its module into the server. That wiring is a sixth,
serial ticket, deliberately, so the four can land without touching `src/server.ts`.
