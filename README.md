# Tom, Ana and Priya's shop

**Start here.** This repository goes with the guide *Ship What You Can Prove*; read the guide's
[contents page](https://prove.natejackson.dev) first, then come back. Three
commands get you working:

```
pnpm install && pnpm test        # the gate, green
/guide                           # in Claude Code, on main: the tutor takes it from here
```

Stay on `main`. For a module with a checkpoint, the tutor makes a worktree from the tag
(`git worktree add ../shop-01 -b my-01 01-before`) and runs the drill there, so the tutor, the skills and
your progress file stay current while you work on an older tree.

It is the shop the course's story happens in: a small wholesale storefront with a pricing file nobody
wants to open, a ticket that went wrong on a Monday and right on a Tuesday, an order of 47 shirts, 20
red and 27 blue, that keeps coming back, and a support agent that answers customers' email about it.

Tom, Ana and Priya are invented. So is the shop. It sells blank T-shirts to screen printers and small
brands. The supplier charges the same per unit at 12 shirts or 72, so every price is the shop's own: BC3001
lists at $14.50, and Priya set a bracket price of $12.99 for 36 or more of a style, paid for out of the shop's
margin to keep the printers who order by the case. Finance owns what that costs, which is why the question of
re-pricing a partial return is theirs to answer.

## The story, as tags

Each checkpoint is a git tag. A module's drill runs in a worktree from the checkpoint before it, and the
reference is looked at only afterwards; the tutor makes the worktree and does the diffing, and says which
tag it used.

| Tag | Where the story is | Module |
|---|---|---|
| `01-before` | Monday. The pricing file has no tests and reaches for a database that is not on your laptop. | 01 |
| `01-pinned` | Ana has made a seam and pinned what `priceLine` does today, dollar eighty-nine and all. | 01 |
| `02-mapped` | Tuesday's table: the cards, the open question with Priya's name on it. | 02 |
| `04-named` | The vocabulary file. "Bracket price", not "discount". | 04 |
| `05-outer-test` | Ana's acceptance test, written in those words, red. | 05 |
| `05-green` | The agent's inner loop is done: green, then a separate refactor commit. The spec is untouched. | 05 |
| `09-report` | Thursday's verification report, with the section for what was not verified. | 09 |
| `03-skeleton` | Checkout, cut into slices. `POST /orders` returns an id and prices nothing. | 03 |
| `07-flagged` | The order is priced behind `BRACKET_PRICING`; the same deploy charges list with it off. | 07 |
| `09-backlog` | Four tickets that touch no common file, and one that touches everything. | 09, 11 |
| `12-traced` | The support agent: a trace per run, guardrails in code, a tool budget. | 12 |
| `13-fixtures` | Five fixtures, a rubric as code, and an eval that shows the spread. | 13 |

`main` is the end of the story, and where 03, 06, 07, 08, 10, 11, 12 and 13 run; they need no checkpoint.

## What each module runs on

| Module | Material in this repository |
|---|---|
| 01, 02, 04, 05 | The bracket ticket: `src/pricing/`, `docs/refinement/bracket-pricing.md`, `VOCABULARY.md`, the acceptance test. |
| 03 | `docs/refinement/checkout-slices.md`; `src/server.ts`; the `03-skeleton` tag. |
| 06 | Any ticket in `docs/backlog/`, with a room. |
| 07 | `.github/workflows/ci.yml` (a gate that can fail, and a job that proves it); `docs/flags.md`. |
| 08 | Whatever scar the last module left you. `.claude/skills/` is where it goes. |
| 09 | `docs/verification/`; two or more backlog tickets, in worktrees, with their allow-lists. |
| 10 | `.claude/CLAUDE.md`, read as a stranger. Some of it is wrong. |
| 11 | The backlog as a queue: which tickets can run together and which must run alone. |
| 12 | `pnpm support` writes a trace per run to `runs/`. Answer the 3am questions from it. |
| 13 | `pnpm eval`: five fixtures, N runs, median beside minimum, a safety set that gates. |

## Running it

```
pnpm test                                   # the gate; CI runs exactly this
pnpm start                                  # the shop on :3000; BRACKET_PRICING=on releases the bracket rule
pnpm support fixtures/support/bracket-charge.json            # one support run, null model, trace to runs/
pnpm support fixtures/support/bracket-charge.json anthropic  # the real model; needs ANTHROPIC_API_KEY
pnpm eval --runs 5                          # the eval on the null model, wobble 0.2; exits 1 when the safety set fails
pnpm eval --runs 5 --seed 2                 # seeded, so this is how you get a second draw
pnpm eval --runs 5 --wobble 0               # the model behaving: the ceiling
pnpm eval --runs 5 --model anthropic        # the real model; costs money
```

The null model is Shore's nullable (Module 05) applied to a language model: it runs the same loop,
tools and guardrails with no key and no network, reads the email the way a model would, and wobbles on
a dial so the eval has a noise floor to measure. The tests never call the real model.

## What is where

- `src/pricing/` — the file nobody wanted to open, and the one function that now decides a price.
- `src/orders.ts` — `priceOrder`: the bracket judged per style across the whole order.
- `src/server.ts`, `src/store.ts`, `src/flags.ts` — checkout over HTTP, the order store, the flag.
- `src/support/` — the agent, its tools, guardrails, trace writer, prompt, judge and eval.
- `fixtures/support/` — the five fixtures, the orders they refer to, and the rubric.
- `docs/refinement/`, `docs/verification/`, `docs/backlog/`, `docs/flags.md` — the paper trail.
- `test/acceptance/` — outer tests in the story's words; `test/acceptance/pending/` for red ones.
- `.github/workflows/ci.yml` — the gate. It runs on every push and it can fail; the second job proves it.
- `.claude/skills/`, `.claude/agents/witness.md`, `.guide/progress.md` — the course's skills, the
  verifier, and your progress. `/guide` reads the last one and picks up where you left off.
