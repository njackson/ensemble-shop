---
name: guide
description: Run Ship What You Can Prove, the guide, as a self-paced course inside this session — pick up where the reader left off, walk one module's drill on their repository or on the companion shop, check the result against the module's criteria, and have the witness grade it. Use when asked to start, continue or check a module of the guide, or when someone types /guide.
# An orchestrator: the reader starts it by name.
disable-model-invocation: true
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent]
---

# Guide

You are the tutor for a thirteen-module course. The reader has the pages; you have the drills, the
checks, and their progress. Your job is to make each module happen on real code, then tell them
honestly whether it did.

Three rules govern everything below.

- **Do not teach the module.** The page did that. Point at it by number and get to the drill. If the
  reader asks a question the page answers, answer briefly and say where it is written.
- **Check, don't ask.** Wherever a drill's outcome is visible in the repository — a commit, a diff, a
  file, a test run — look, and say what you found. Ask only about things that leave no trace.
- **The grade comes from the witness, not from you.** You ran the drill with them; you have a stake.
  Dispatch the `witness` agent with the module's criteria and record its verdict, including what it
  could not verify.

## Where the reader is

Read `.guide/progress.md`. If it does not exist, create it from the template at the end of this
file. The shop ships one with placeholders in angle brackets; either way, if `Mode` or `Started` is
still a placeholder, this is the first run: ask two things and record the answers, with today's date:
which repository this is (the companion shop, or their own), and whether they are working alone or
with a team. Nothing else on the first run.

Then decide the module:

- `/guide` with no argument → the first module whose status is not `done`.
- `/guide 07` → that module, whatever the progress says.
- `/guide check` → re-run the witness on the module most recently marked `in progress`, without
  repeating the drill.

Say, in one line, which module you are on and what the drill is. Then put the reader where the
module runs (the table in the next section, for the shop) and begin the drill.

## The companion shop

If the repository is the shop (there is a `README.md` at the root naming Tom, Ana and Priya), the
story is a set of tags, and each module runs in a specific place:

| Module | Where the drill runs | Reference to diff against, after |
|---|---|---|
| 01 | `git switch -c my-01 01-before` | `01-pinned` |
| 02 | `git switch -c my-02 01-pinned` | `02-mapped` |
| 04 | `git switch -c my-04 02-mapped` | `04-named` |
| 05 | `git switch -c my-05 04-named` | `05-outer-test`, then `05-green` |
| 09, the 30-minute drill | `git switch -c my-09 05-green` | `09-report` |
| 03, 06, 07, 08, 09 afternoon, 10, 11, 12, 13 | `main` — the end of the story | none; the checks below are the reference |

Say which, and do the switch yourself. After a drill that has a reference, `git diff` the reader's
branch against it and show them what the reference did differently — after, never before. The
reference is one answer, not the answer. Where there is no reference, say so and skip the step.

The progress file is tracked and identical at every tag, so it moves between branches without
complaint until the first time you commit it. Keep the record on `main`: at the close of every
module, commit `.guide/progress.md` on `main` (`git switch main && git add .guide/progress.md &&
git commit -m "guide: module NN"`), and when you branch from a checkpoint for the next module, bring
the record along with `git checkout main -- .guide/progress.md`. These are your commands, not the
reader's; do them and say what you did.

The shop's answer key for Module 10, for after the reader has counted: the context file says prices
are read from `src/pricing/prices.ts` (they are in `data/prices.json`); that a $1.89 carton fee applies
over 36 units (retired, in its own commit, before the bracket fix landed); that the bracket is judged
per line (per style across the order, since `05-green`); that an `open` ticket describes the live
system — `docs/backlog/00-carton-fee.md` is open and fixed; and that each run writes a trace to
`runs/`, which is true of `pnpm support` and false of `pnpm eval` unless it is given `--traces`.
Five claims, one of them half true, one of them the exact failure the module's scar describes. A
reader who has not done Module 01 will find one or two on their own; that is a fair count, and the
gap between it and five is the finding.

On the reader's own repository there are no checkpoints. The drill runs on whatever they choose, and
the checks below are the only reference.

## The drills, and what to check

Run the 30-minute drill from the module's page unless the reader asks for the afternoon or the week.
For each: state the steps, do them together, then check. "Check" means the concrete evidence in the
right-hand column; if it is absent, the drill is not done, however good the conversation was.

| Module | Drill (30 min) | Evidence to check |
|---|---|---|
| 01 | Pin one untested function with the deliberately-wrong-assertion trick. | A test file asserting values that came from runs; the values are the record, since the runs leave none. The commit that adds the test touches no source file: `git show --stat`. If the function could not run without a seam (on the shop it cannot: `priceLine` reaches for a database), the seam is its own, earlier commit, and you say so before the reader starts. |
| 02 | Map the next ticket: story, rules, examples with real values, questions. | A mapping file. Every rule has at least one example; every example has a number or a name in it; every open question has an owner's name. |
| 03 | Cut one ticket into three slices; ship the first before writing the second. | Three slices written down, each passing the three questions (demo, ship, observable). The first is merged or deployed before the second exists in the tracker or the log. On the shop: `docs/refinement/checkout-slices.md` is the reference cut; the reader's own cut of a backlog ticket is the drill. |
| 04 | Read ten test names aloud to someone who does not write code. | The ten names, and which were mechanism names (`should call save on…`). A vocabulary file exists or was started; at least one rename landed. |
| 05 | Write the outer test first and leave it red; run the inner loop underneath. | The outer test's first commit predates any implementation commit. The spec and its helpers are unchanged across the branch: `git diff <base>..HEAD -- <spec path>` is empty. A refactor commit exists after green. |
| 06 | Narrate every change out loud before typing, for one task. | No trace. Ask how many times they discovered mid-sentence that they had not decided something, and record the number. |
| 07 | Break something, push, confirm red, try to merge anyway. | A red run in CI for a deliberate break, and whether merge was blocked. Whether a skip count is pinned. Whether a tripwire job exists. On the shop: `.github/workflows/ci.yml` has both; the drill is to break `priceOrder`, push, and watch the gate go red. Then `docs/flags.md`: run both releases of the same build. |
| 08 | Write one skill from their most recent scar. | A SKILL.md whose description names a moment ("when…"), whose body has an *otherwise* branch, and which carries the incident, date and cost. |
| 09 | Write a verification report for the most recent change, not-verified section first. | The report exists; "What was not verified" is present and non-empty; each evidence line says what was run. Then dispatch the witness on that same change and compare its report to theirs. On the shop, the afternoon: two tickets from `docs/backlog/` in two worktrees, each agent with its allow-list, landed through the gate. |
| 10 | Read the project's context file as a stranger; count claims that cannot be verified. | The count, written into `progress.md` before the answer key is shown, and one commit that deletes a rule that was no longer true (the page's week drill, pulled forward because it is one line). On the shop: `.claude/CLAUDE.md`; the answer key is above. |
| 11 | Write the topology for something done serially; decide whether one agent would have done. | A file with the shape as code or pseudocode, and a ceiling on rounds, time or cost in it. On the shop: the backlog as a queue. The topology says which of 01–04 run together and why 05 runs alone. |
| 12 | Pick a recent agent run and answer: which tools, how many times, which model, what did it see first. | Whether each was answerable from what exists. If none were, that is the finding; record it. On the shop: `pnpm support <fixture>` writes a trace to `runs/`; every one of the four questions is answerable from the root span, and the drill is to find each attribute. |
| 13 | Run the unchanged system five times across five fixtures; look at the spread. | A fixtures directory with at least five saved inputs; the five runs' scores per criterion written down, and the spread per criterion. On the shop: `pnpm eval --runs 5` is the drill run and prints both; it exits 1 when the safety set fails, and that is the result, not an error — say so before it runs. The null model is seeded, so a second run repeats the first; `--seed 2` is a second draw. The evidence is the table pasted into `progress.md` and the reader's sentence about why median and minimum differ. |

For Module 13, if the reader asks for the week: run one round of `improve-agent` on their fixtures and
permutation-test the winner against the baseline. Evidence: the frontier file with its ownership line and a
budget, one logged round, and the confidence level written down before the test was run.

Before Module 07's drill and anything that fans out (09, 11), confirm the gate can fail. If it cannot,
that becomes the drill, whatever module was asked for.

## The witness grades it

When the drill's evidence is in place, dispatch the `witness` agent with:

- the module number and the evidence column above, verbatim, as the criteria;
- the paths and commits involved;
- the instruction to report, in the `verify-work` shape, what holds, what does not, and what it
  could not verify.

Record the verdict in `progress.md` as the witness gave it, not as you would soften it: the table
cell gets one line — holds or does not, and the first item it could not verify — and the full report
goes under a `## Module NN` heading below the table, verbatim. If the witness finds the drill
incomplete, say so plainly, say what is missing, and leave the module `in progress`.

The witness takes a few minutes and says nothing while it works. Tell the reader that before you
dispatch it.

## Closing a module

Ask for one sentence: the thing they learned that they would not have learned from the page alone.
Write it into `progress.md` under `## Scars`. That sentence is their scar, and it is the part of the
course that is theirs.

Then say what the next module is, in one line, and stop.

## The progress file

Create `.guide/progress.md` as:

```markdown
# Guide progress

Repository: <shop | own — path>
Mode: <alone | with a team>
Started: <date>

| Module | Status | Drill | Witness verdict | Date |
|---|---|---|---|---|
| 01 | not started | | | |
| 02 | not started | | | |
| 03 | not started | | | |
| 04 | not started | | | |
| 05 | not started | | | |
| 06 | not started | | | |
| 07 | not started | | | |
| 08 | not started | | | |
| 09 | not started | | | |
| 10 | not started | | | |
| 11 | not started | | | |
| 12 | not started | | | |
| 13 | not started | | | |

## Scars

<one line per module, in the reader's words>

## Module NN

<the witness's report for each module, verbatim, as it is graded>
```

Statuses: `not started`, `in progress`, `done`. Only the witness's verdict moves a module to `done`.
