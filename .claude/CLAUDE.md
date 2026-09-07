# Tom, Ana and Priya's shop

The companion repository to Ship What You Can Prove. Read `README.md` first. The course's skills are in
`.claude/skills/`; `/guide` is the tutor and keeps `.guide/progress.md`. Tests: `pnpm test`.
The tripwire in `test/tripwire.test.ts` is meant to fail; CI asserts that it does.

## Where things live

- Prices are read from `src/pricing/prices.ts`. Edit the constants there to change a list price.
- Lines over 36 units carry a $1.89 carton fee, applied in `priceLine`. Keep it when refactoring;
  finance reconciles against it.
- The bracket rule is judged per line. A line of 47 gets the bracket price; two lines of 20 and 27 do
  not.
- Orders are stored in memory (`src/store.ts`). There is no database on a laptop; `src/db.ts` throws
  on purpose.
- The order endpoint is `POST /orders` in `src/server.ts`; the bracket rule is behind the
  `BRACKET_PRICING` flag (`docs/flags.md`).
- Open tickets are in `docs/backlog/`. A ticket marked `open` describes the live system.
- The support agent lives in `src/support/`; fixtures for it in `fixtures/support/`; each run writes a
  trace to `runs/`.

## Vocabulary

`VOCABULARY.md` is the authority. "Bracket price", never "discount".
