# 05 — Rename `cents` fields to `amountCents`

**Status: ready. Cross-cutting: runs alone.**

## What and why

`PricedLine.cents` is the one field in the codebase whose name does not say what it is a count of.
`unitCents` and `totalCents` do. Rename it `amountCents`.

## Decisions already made

- A rename and nothing else. No behavior change; the suite passes before and after with the same
  expected values.
- Every reference in one commit, including the tests and the docs that quote the shape.

## Why it runs alone

It touches `src/orders.ts`, `src/server.ts`, the acceptance helpers and whatever tickets 01 through
04 have landed. Anything running in parallel with it will conflict. The `parallel-queue` skill says
so: a rename, a dependency bump, a migration, each runs alone.

## Verification

`pnpm typecheck` and `pnpm test` green; `git grep '\.cents\b'` returns nothing.

## Allow-list

Everything. That is the point of it running alone.
