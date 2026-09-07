# Flags

Deployment is not release (Module 07). A slice ships with its flag off; the behavior is turned on
separately, without a deploy, and can be turned off the same way. The flag is the off switch the
person on call needs at 3am (Module 12), so it is documented here, first.

| Flag | Env | Default | What it releases | Who may flip it |
|---|---|---|---|---|
| `bracketPricing` | `BRACKET_PRICING=on` | off | The bracket rule on `POST /orders`: per style, across the whole order. Off, every unit bills at list price, which is what the shop charged before Monday. | Priya, or whoever is on call |

To see it: `pnpm start`, place the story's 47-shirt order, read the total. Stop it, `BRACKET_PRICING=on
pnpm start`, place the same order. Same code, different release.

A flag that has been on for everyone for a month is dead code with a switch. Delete it, in its own
commit, and delete this row.
