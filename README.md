# Tom, Ana and Priya's shop

This is the companion repository to **Ship What You Can Prove**. It is the shop the course's story
happens in: a small wholesale storefront with a pricing file nobody wants to open, a ticket that went
wrong on a Monday and right on a Tuesday, and an order of 47 shirts, 20 red and 27 blue, that keeps
coming back.

Tom, Ana and Priya are invented. So is the shop. The numbers are the course's: BC3001 lists at $14.50,
the bracket is 36 units, and past it the price is $12.99.

## How to use it

Each checkpoint in the story is a git tag. Start a working branch from the one before the module you
are on, do the module's drill, and only then look at what the reference did:

| Tag | Where the story is |
|---|---|
| `01-before` | Monday. The pricing file has no tests and reaches for a database that is not on your laptop. |
| `01-pinned` | Ana has made a seam and pinned what `priceLine` does today, dollar eighty-nine and all. |
| `02-mapped` | Tuesday's table: the cards, the open question with Priya's name on it. |
| `04-named` | The vocabulary file. "Bracket price", not "discount". |
| `05-outer-test` | Ana's acceptance test, written in those words, red. |
| `05-green` | The agent's inner loop is done: green, then a separate refactor commit. The spec is untouched. |
| `09-report` | Thursday's verification report, with the section for what was not verified. |

```
git switch -c my-01 01-before      # start Module 01's drill here
pnpm install && pnpm test
/guide 01                    # in Claude Code, with the skills in .claude/ loaded
```

The skills the course ships are installed under `.claude/skills/`, the witness under `.claude/agents/`,
and your progress lives in `.guide/progress.md`. `/guide` reads it and picks up where you
left off.

## What is where

- `src/pricing/priceLine.ts` — the file nobody wants to open.
- `src/db.ts` — the database `priceLine` reaches for. There is none on your laptop; that is the point.
- `data/prices.json` — the real price list, which is what you hand it once there is a seam.
- `test/` — empty of anything useful at `01-before`. That is also the point.
- `.github/workflows/ci.yml` — the gate. It runs on every push and it can fail; the second job proves it.
