# Bracket pricing — Tuesday's table

**Ticket.** *Orders past the bracket quantity should get the bracket price.* (Priya, Monday.)

**What happened on Monday.** Tom applied the bracket per line and shipped. A customer ordering 47
BC3001 shirts as 20 red and 27 blue was charged list price on both lines. Priya meant the whole order.

## The cards, as laid out

**Story (yellow)**
- Orders past the bracket quantity get the bracket price.

**Rules (blue)**
- Past 36 units of a style, the unit price drops from the list price to the *bracket price*.
  *(Reworded from "discount": the bracket price is a price. — Priya)*
- The bracket is per style. Two styles do not add up.

**Examples (green)**
- 47 units of BC3001, past the 36-unit bracket, bills at $12.99 each, not the $14.50 list price: $610.53.
- 47 units of BC3001 as 20 red and 27 blue is still 47 units. Same total: $610.53.
- 36 units of BC3001 exactly gets the bracket price: at or past.
- 20 BC3001 and 27 BC3413 are two styles under the bracket. Both bill at list.

**Questions (red)**
- If a customer returns units and the order drops below 36, is the rest re-priced?
  **Owner: Priya** (asking finance). Carried as an accepted unknown; listed in the report until closed.

## Reading the table

Two rules, each with examples; one question, owned. Ready.

## What the pin told us

`priceLine` adds $1.89 to any line over 36 units (a carton fee from 2019). Priya: retired in 2021;
nobody removed it. It goes, deliberately, in its own commit, before the new behaviour lands.
