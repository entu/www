# Formulas

Formulas let a property compute its value automatically on every save, based on data from the same entity, its parents, its children, or entities that reference it.

To use a formula: set the `formula` flag on a property definition and write the expression as the formula value. Computed properties cannot be edited manually and are skipped when duplicating an entity.

Formulas are evaluated in two passes so that properties depending on other formula properties resolve correctly.

::: info
Two-pass evaluation means a formula can safely reference another computed property on the same entity. The first pass resolves simple fields; the second resolves dependencies between computed properties.
:::

::: warning Output is a scalar, never a reference
A formula always stores a scalar result — `string`, `number`, or `boolean`, whichever its operators produce. It never produces a `reference` value. Declaring `type: reference` on a formula property has no effect: the result is stored as a string. For an honest schema, declare formula properties that surface reference-like text as `type: string`.
:::

## Syntax

Formulas use **Reverse Polish Notation** (RPN, also known as postfix notation): values come first, the operator comes last. The engine walks the formula left to right with a single value stack. Each token either:

- **Pushes** a value onto the stack (a literal, a field reference), or
- **Runs an operator** that pops values from the stack and pushes a result back.

```
first_name " " last_name CONCAT
│           │   │         └── pop the whole stack, join the values, push the joined string
│           │   └── push the value of `last_name`
│           └── push the string literal " "
└── push the value of `first_name`
```

There are **no parentheses** and **no brackets** in the language. Composition happens naturally on the stack — each operator produces one value that the next operator consumes.

### Implicit `CONCAT`

If a formula does **not** end with a recognized operator keyword, the engine implicitly appends `CONCAT` and joins everything on the stack as a string. This makes simple string compositions short to write:

```
first_name " " last_name                  → "John Doe"          (implicit CONCAT)
first_name " " last_name CONCAT           → "John Doe"          (explicit, same result)
'Nr ' vr_nr '. ' otsuse_kp                → "Nr 12. 2026-01-01"
```

### Operator categories

Every operator falls into one of these classes:

- **Variadic reducers** consume the **entire current stack** and push one result. Most aggregating operators are reducers — `CONCAT`, `SUM`, `MIN`, `IN`, etc.
- **Fixed-arity operators** pop a known number of stack slots. `EQ` pops 2, `ABS` pops 1, `IF` pops 3, and so on.
- **Per-value operators** (`ABS`, `ROUND`) take one input slot and apply the operation to every underlying value in it, pushing back a slot of the same length.

### Multi-value (list) properties

Entu properties are multi-value: a single field reference may push a list of N values as one stack slot. Operators handle lists like this:

- **Variadic reducers** flatten popped slots into a single value sequence before applying the operation. `_child.*.price SUM` is just a list slot being reduced — the underlying values are summed.
- **Per-value operators** apply to every value in their input slot — `_child.*.delta ABS` returns a list of absolute deltas, same length as the input.
- **Binary comparisons** (`EQ`, `GT`, …) use **ANY** semantics across the cross product: true if any left value satisfies the operator against any right value.

## Field References

### Same Entity

| Reference | Resolves to |
|---|---|
| `propertyName` | Value(s) of that property on the current entity |
| `_id` | The current entity's ID |
| `'literal'` or `"literal"` | A string literal |
| `123` / `45.67` / `-2` | A numeric literal |
| `true` / `false` | A boolean literal |

### Referenced Entities

| Reference | Resolves to |
|---|---|
| `propertyName.*.property` | Property value from all entities referenced by `propertyName` |
| `propertyName.type.property` | Property value from referenced entities filtered by entity type |
| `propertyName.*._id` | IDs of all referenced entities |
| `propertyName.type._id` | IDs of referenced entities filtered by type |

::: warning Single-hop only
A reference resolves exactly **one** hop from the current entity. `propertyName.*.property` reads a property on the directly-referenced entity. A second hop — for example continuing through `_parent` or another reference after the first (`ref.*._parent.*.name`) — resolves to nothing: the formula property is silently left unwritten rather than raising an error.

To traverse two levels, define an intermediate formula property on the referenced entity that exposes the value you need, then read that property in a single hop.
:::

### Child Entities

| Reference | Resolves to |
|---|---|
| `_child.*.propertyName` | `propertyName` from all child entities |
| `_child.typeName.propertyName` | `propertyName` from child entities of a specific type |
| `_child.*._id` | IDs of all child entities |
| `_child.typeName._id` | IDs of child entities of a specific type |

### Referrer Entities

Entities that reference this entity through their own reference properties:

| Reference | Resolves to |
|---|---|
| `_referrer.*.propertyName` | `propertyName` from all entities that reference this entity |
| `_referrer.typeName.propertyName` | `propertyName` from referrers of a specific type |
| `_referrer.*._id` | IDs of all referrer entities |
| `_referrer.typeName._id` | IDs of referrer entities of a specific type |

A referrer is an entity that points at the current entity through a user-defined `reference`-type property. System reference properties (`_parent`, `_owner`, `_editor`, `_viewer`, `_expander`) are **not** counted by `_referrer`.

::: info
`typeName` is matched against the referrer entity type's `name` property (e.g. `invoice`), not its display `label`. If a type's `name` and `label` differ, use the `name` value.
:::

::: info
Unlike same-entity formulas, a `_referrer` formula depends on **other** entities. Its value updates when a referencing entity is created, changed, deleted, or has its reference changed — Entu then queues the target entity for automatic re-aggregation so its `_referrer` (and `_child`) formulas recompute. The result is eventually consistent: it may not be updated within the same request that changed the referencing entity.
:::

::: warning Formula evaluation bypasses access rights
The formula evaluator reads referenced, child, and referrer entities directly, without applying the requesting user's access rights. A formula on entity A can incorporate data from entity B even when the viewer has no rights to read B on its own.

This is deliberate — it enables roll-ups across access boundaries (a parent counting or summing restricted children). But it means a formula that projects **raw values** (names, emails, descriptions) from a restricted entity exposes those values to anyone who can read the formula-bearing entity. Reserve cross-entity formulas for aggregates (`COUNT`, `SUM`, `AVERAGE`, `MIN`, `MAX`); avoid projecting raw fields across a rights boundary.

The exposure is bounded by who can write formulas: only users who can edit the entity-type definition (typically administrators) can add or change one.
:::

## Operators

### Variadic reducers (consume the whole stack)

| Operator | Result | Notes |
|---|---|---|
| `CONCAT` | string | Flatten all stack values, stringify, join with no separator. |
| `CONCAT_WS` | string | Flatten all stack values; the **last** value is the separator; the rest are joined with it. |
| `SUM` | number | Strict numeric — any non-number anywhere → no value. |
| `SUBTRACT` | number | Left-to-right: first value minus the rest. Strict numeric. |
| `MULTIPLY` | number | Product of all values. Strict numeric. |
| `DIVIDE` | number | First value divided by the rest, in order. Strict numeric. Division by zero → no value. |
| `COUNT` | number | Total count of all underlying values. Empty stack → `0`. |
| `AVERAGE` | number | Arithmetic mean. Strict numeric. |
| `MIN`, `MAX` | number or string | Compare with `<` / `>`. All values must be the same primitive type (all numbers or all strings — ISO 8601 dates compare correctly as strings). |
| `IN`, `NIN` | boolean | First slot = needle, remaining slots = haystack. `IN` is true if **any** needle value strict-equals **any** haystack value; `NIN` is the negation. |

### Binary comparisons (return boolean)

| Operator | Behavior |
|---|---|
| `EQ`, `NE` | Strict `===` / `!==` across the cross product. |
| `GT`, `GTE`, `LT`, `LTE` | Ordering across the cross product. Both sides must be numbers or both strings — pairs of incompatible types are skipped. |

All six use **ANY** semantics: true if any left value satisfies the operator against any right value.

### Conditional

| Operator | Arity | Behavior |
|---|---|---|
| `IF` | 3 | Pops `else`, `then`, `cond`. Returns `then` if `cond` is `true`, `else` if `false`. |
| `WHEN` | 2 | Pops `then`, `cond`. Returns `then` if `cond` is `true`; otherwise no property is written. |

Both require `cond` to resolve to exactly one boolean value. Both branches are evaluated before the conditional runs (no lazy evaluation).

### Per-value

| Operator | Arity | Behavior |
|---|---|---|
| `ABS` | 1 | Absolute value of every number in the input slot. |
| `ROUND` | 2 | Pops `decimals` (a single number) and `value`. Rounds every number in `value` to `decimals` decimal places. |

### Other

| Operator | Arity | Behavior |
|---|---|---|
| `EXISTS` | 1 | True if the input slot resolves to at least one value. |

## Empty Input Behaviour

Most operators return no value (the property is not written) when their inputs resolve to nothing:

| Operator | Empty input |
|---|---|
| `COUNT` | `0` |
| `CONCAT`, `CONCAT_WS`, `SUM`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `AVERAGE`, `MIN`, `MAX` | no value (property not written) |
| `ABS`, `ROUND` | no value |
| `IN`, `NIN` | empty needle or empty haystack → `false` / `true` respectively |
| `EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE` | empty side → no value |
| `EXISTS` | always returns a boolean |
| `IF`, `WHEN` | no value if `cond` is empty or not a single boolean; `WHEN` returns no value when `cond` is `false` |

::: info CONCAT_WS with partial and duplicate inputs
When only some inputs resolve, `CONCAT_WS` joins the present values and emits no stray separators: `a b ' / ' CONCAT_WS` with only `a` set returns `"A"`, not `"A / "`. (All inputs absent returns no value.)

Values are joined **verbatim, without deduplication** — if the same value appears more than once across the inputs or within a list-valued field, it appears more than once in the output (`["en","et"] ["la","en"] ' / ' CONCAT_WS` → `"en / et / la / en"`).

There is no `COALESCE` or `FIRST` operator. To express "use `a`, otherwise `b`", handle the fallback in your application layer.
:::

## Examples

### Aggregations

**Sum across children:**
```
_child.*.price SUM
```

**Count children of a specific type:**
```
_child.invoice._id COUNT
```

**Average price:**
```
_child.*.price AVERAGE
```

**Earliest due date:**
```
_child.*.due_date MIN
```

### Arithmetic

**Profit:**
```
income expenses SUBTRACT
```

**Total with tax:**
```
price tax SUM quantity MULTIPLY
```

**Round to 2 decimals:**
```
total quantity DIVIDE 2 ROUND
```

**Absolute difference, rounded:**
```
sum ABS invoice_sum ABS SUBTRACT 2 ROUND
```

### Strings

**Full name (implicit `CONCAT`):**
```
first_name " " last_name
```

**Full name with explicit `CONCAT_WS`:**
```
first_name last_name " " CONCAT_WS
```

**Two-level join — list of artists joined with `", "`, then prefixed to a title:**
```
artist ", " CONCAT_WS title " - " CONCAT_WS
```

### Conditionals

**Label by price threshold:**
```
price 100 GT "expensive" "cheap" IF
```

**Flag only when over budget (no else):**
```
total budget GT "over budget" WHEN
```

**Membership check with inline list:**
```
status_code 10 20 30 IN "active" "inactive" IF
```

**Mark whether a date is set:**
```
paid_date EXISTS "✓" "—" IF
```

**Overdue check by date:**
```
due_date "2026-01-01" LT "overdue" "ok" IF
```

**Exclude banned statuses (field as item list):**
```
status banned_status.*.code NIN "ok" "blocked" IF
```

## Composition rules

Because variadic reducers consume the **entire** stack, a formula can practically contain **only one reducer** before fixed-arity operations. Once a reducer runs, anything pushed after it sits on top of its result — and the next reducer will swallow both.

If you need two independent reducer results combined together (e.g. a count and a sum each rendered to a string), split the calculation into two formula properties: define one property whose formula produces the count, another whose formula produces the sum, and a third whose formula references both. The two-pass evaluator resolves the dependency.

Fixed-arity operators (`EQ`, `GT`, `IN`, `IF`, `ROUND`, `ABS`, …) can be chained freely.
