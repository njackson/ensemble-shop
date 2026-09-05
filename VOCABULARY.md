# Vocabulary

One line per term: the word, what it means here, what it explicitly does not mean. Reviewed like code.

- **list price** — the per-unit price of a style below its bracket. Not a "regular" price; the odd one out.
- **bracket** — the quantity of one style at or past which the bracket price applies. 36 for tees.
- **bracket price** — the per-unit price at or past the bracket. *Not a discount.* Nothing in the code
  subtracts from a list price; the bracket price is looked up, not derived.
- **order** — what the customer asked for: lines of style, color and quantity. The bracket is judged
  per style across the whole order, not per line.
- **repriceOrder** — the one operation that sets an order's prices. Nothing else may set a price.
- **customer (storefront)** — whoever is logged in with a cart.
- **customer (billing)** — an account with payment terms. A storefront customer becomes a billing
  customer when their first invoice is raised. Different context; different word where it matters.
