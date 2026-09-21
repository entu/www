---
description: "Formulas compute property values automatically on every save, using the entity, its parents, children, or referencing entities."
---

# Formulas

Formulas let a property compute its value automatically on every save, based on data from the same entity, its parents, its children, or entities that reference it.

To use a formula: set the `formula` flag on a property definition and write the expression as the formula value. Computed properties cannot be edited manually and are skipped when duplicating an entity.

Formulas are evaluated in two passes so that properties depending on other formula properties resolve correctly.

::: info
Two-pass evaluation means a formula can safely reference another computed property on the same entity. The first pass resolves simple fields; the second resolves dependencies between computed properties.
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

Every operator falls into one of these classes — the **Takes** column of the [operator tables](#operators) shows which:

- **Variadic reducers** (Takes `all`) consume the **entire current stack** and push one result. Most aggregating operators are reducers — `CONCAT`, `SUM`, `MIN`, `IN`, etc.
- **Fixed-arity operators** (Takes `1`, `2` or `3`) pop a known number of stack slots. `EQ` pops 2, `ABS` pops 1, `IF` pops 3, and so on.
- **Per-value operators** are fixed-arity operators that apply the operation to every underlying value in their input slot, pushing back a slot of the same length — `ABS`, `UPPER`, `REGEX`, `DATE`, etc.

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

## Value types

Inside a formula every value is a **number**, a **string** or a **boolean** — nothing else. A field reference converts each property value by its type:

| Property type | Value in the formula | Example |
|---|---|---|
| `string`, `text` | string | `"John"` |
| `number` | number | `12.5` |
| `boolean` | boolean | `true` |
| `date` | string, `YYYY-MM-DD` | `"2026-01-31"` |
| `datetime` | string, ISO 8601 in UTC with milliseconds | `"2026-01-31T12:30:00.000Z"` |
| `reference` | string — the **name** of the referenced entity, or its ID when it has no name | `"Acme Ltd"` |
| `counter` | number — the numeric part of the counter, not the formatted string | `42` for `INV-0042` |
| `file` | string — an internal ID, not the file name; not useful in formulas | |
| `formula` | whatever that formula produced | |
| `_id`, `propertyName.*._id` | string — the entity ID | `"65a1b2c3d4e5f6a7b8c9d0e1"` |

To get the ID of a referenced entity instead of its name, use `propertyName.*._id`.

A **multilingual** property pushes the values of **all** languages as one list — `name` with an Estonian and an English value is a two-value slot. A formula result itself has no language.

### What this means for operators

- **Text** — `CONCAT` and `CONCAT_WS` stringify every value as it is: a datetime becomes `2026-01-31T12:30:00.000Z` (UTC, not localized), a boolean becomes `true` / `false`, and a number is written in full precision without the property's `decimals` setting — round it with `ROUND` first. `UPPER`, `LOWER` and `REGEX` accept strings only, so they work on dates and reference names but return no value for numbers and booleans; run a number through `CONCAT` first to turn it into a string.
- **Math** — numbers only. A date, a numeric-looking string or a boolean → no value; convert strings with `NUMBER`.
- **Comparison** — `EQ` and `IN` are strict, so the number `5` never equals the string `"5"`. Dates compare correctly as strings, but compare like with like: the date `"2026-01-31"` sorts before every datetime of that same day.
- **Dates** — format a date with `REGEX`, and end with `DATE` or `DATETIME` when the result should be a real date — see [Conversion](#conversion).

### How the result is stored

The result's own type decides how it is stored: a number as a number, a boolean as a boolean, the output of `DATE` / `DATETIME` as a date / datetime, and everything else as a string. The formula property's `type` does not convert the result — a `number`-type property whose formula produces `"12"` holds a string.

## Operators

Operators are grouped by what they do. **Takes** is what the operator pops from the stack: `all` for the whole stack (a variadic reducer), or the number of slots.

### Text

| Operator | Takes | Result | Behavior |
|---|---|---|---|
| `CONCAT` | all | string | Flatten all stack values, stringify, join with no separator. |
| `CONCAT_WS` | all | string | Flatten all stack values; the **last** value is the separator; the rest are joined with it. |
| `UPPER`, `LOWER` | 1 | string | Converts every string in the input slot to upper / lower case. |
| `REGEX` | 3 | string | Pops `replacement`, `pattern` (each a single string) and `value`. Replaces every match of the regular expression `pattern` in every string in `value`. |

`REGEX` uses JavaScript regular expression syntax. Backslashes inside a quoted literal are passed through as written, so `'\d+'` matches digits. The replacement may use `$1`, `$2`, … for capture groups, `$<name>` for named groups and `$&` for the whole match. All matches are replaced; for case-insensitive matching wrap the pattern in `(?i:…)`.

A value that does not match the pattern passes through unchanged. To extract a substring, match the whole string and keep only a capture group — see the [examples](#text-examples).

`REGEX` returns no value when `value` contains a non-string or more than 1,000 values, when `pattern` is not a valid regular expression, when `pattern` or `replacement` is longer than 500 characters, when any input or result string is longer than 10,000 characters or all of them together exceed 1,000,000 characters, or when evaluation takes too long. A formula may use `REGEX` at most 10 times.

### Math

| Operator | Takes | Result | Behavior |
|---|---|---|---|
| `SUM` | all | number | Sum of all values. |
| `SUBTRACT` | all | number | Left-to-right: first value minus the rest. |
| `MULTIPLY` | all | number | Product of all values. |
| `DIVIDE` | all | number | First value divided by the rest, in order. Division by zero → no value. |
| `ABS` | 1 | number | Absolute value of every number in the input slot. |
| `ROUND` | 2 | number | Pops `decimals` (a single number) and `value`. Rounds every number in `value` to `decimals` decimal places. |
| `FLOOR`, `CEIL` | 1 | number | Rounds every number in the input slot down / up to the nearest integer. |

All of them are strict numeric — any non-number anywhere in the input → no value. Convert strings with [`NUMBER`](#conversion) first.

### Lists

| Operator | Takes | Result | Behavior |
|---|---|---|---|
| `COUNT` | all | number | Total count of all underlying values. Empty stack → `0`. |
| `AVERAGE` | all | number | Arithmetic mean. Strict numeric. |
| `MIN`, `MAX` | all | number or string | Smallest / largest value. |
| `UNIQUE` | 1 | same as input | Removes duplicate values from the input slot, keeping the first occurrence of each. |
| `SORT` | 1 | same as input | Sorts the values of the input slot in ascending order. |

`MIN`, `MAX` and `SORT` compare with `<` / `>` and need all values to be the same primitive type — all numbers or all strings; mixed types → no value. ISO 8601 dates compare correctly as strings. Strings are compared by character code, so upper-case letters sort before lower-case ones and accented letters after `z`.

### Conversion

| Operator | Takes | Result | Behavior |
|---|---|---|---|
| `NUMBER` | 1 | number | Parses every string in the input slot into a number. Numbers pass through unchanged. |
| `DATE` | 1 | date | Converts every value in the input slot to a date (the time part is dropped, in UTC). |
| `DATETIME` | 1 | datetime | Converts every value in the input slot to a datetime. |

`NUMBER` accepts plain decimal strings only — an optional minus sign, digits and an optional `.` fraction (`"12"`, `"-3.5"`); surrounding whitespace is ignored. Anything else (`"12abc"`, `"1,5"`, `"1e3"`, a boolean) → no value. Clean the string up with `REGEX` first — see the [examples](#conversion-examples).

`DATE` and `DATETIME` accept ISO 8601 strings (`2026-01-31`, `2026-01-31T12:30:00Z`) and numbers, which are read as milliseconds since the Unix epoch. Anything else → no value. A datetime string without a time zone is read as UTC.

Inside a formula dates are plain ISO strings: a `date` or `datetime` field reference pushes a string, and comparisons, `MIN`, `MAX` and `SORT` work on those strings. Without `DATE` or `DATETIME` the result is therefore stored as a string. When the formula property itself is of type `date` or `datetime`, end the formula with `DATE` or `DATETIME` so the value is stored, displayed, sorted and filtered as a real date. Use them as the **last** step — a converted value is no longer a string, so it can only pass through `IF`, `WHEN` and `EXISTS`.

### Comparison

| Operator | Takes | Result | Behavior |
|---|---|---|---|
| `EQ`, `NE` | 2 | boolean | Strict `===` / `!==` across the cross product. |
| `GT`, `GTE`, `LT`, `LTE` | 2 | boolean | Ordering across the cross product. Both sides must be numbers or both strings — pairs of incompatible types are skipped. |
| `IN`, `NIN` | all | boolean | First slot = needle, remaining slots = haystack. `IN` is true if **any** needle value strict-equals **any** haystack value; `NIN` is the negation. |
| `EXISTS` | 1 | boolean | True if the input slot resolves to at least one value. |

`EQ` … `LTE` and `IN` use **ANY** semantics: true if any left value satisfies the operator against any right value.

### Logic and conditions

| Operator | Takes | Result | Behavior |
|---|---|---|---|
| `AND` | 2 | boolean | True if both sides are `true`. |
| `OR` | 2 | boolean | True if either side is `true`. |
| `NOT` | 1 | boolean | Negates a boolean. |
| `IF` | 3 | `then` or `else` | Pops `else`, `then`, `cond`. Returns `then` if `cond` is `true`, `else` if `false`. |
| `WHEN` | 2 | `then` | Pops `then`, `cond`. Returns `then` if `cond` is `true`; otherwise no property is written. |

Every condition — each operand of `AND`, `OR`, `NOT` and the `cond` of `IF` and `WHEN` — must resolve to exactly one boolean value: the result of a comparison or a boolean property. Anything else → no value. Both branches of `IF` are evaluated before the conditional runs (no lazy evaluation).

## Empty Input Behaviour

Most operators return no value (the property is not written) when their inputs resolve to nothing:

| Operator | Empty input |
|---|---|
| `CONCAT`, `CONCAT_WS`, `UPPER`, `LOWER`, `REGEX` | no value (property not written) |
| `SUM`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `ABS`, `ROUND`, `FLOOR`, `CEIL` | no value |
| `COUNT` | `0` |
| `AVERAGE`, `MIN`, `MAX`, `UNIQUE`, `SORT` | no value |
| `NUMBER`, `DATE`, `DATETIME` | no value |
| `EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE` | empty side → no value |
| `IN`, `NIN` | empty needle or empty haystack → `false` / `true` respectively |
| `EXISTS` | always returns a boolean |
| `AND`, `OR`, `NOT` | empty operand → no value |
| `IF`, `WHEN` | no value if `cond` is empty or not a single boolean; `WHEN` returns no value when `cond` is `false` |

## Examples

### Text examples

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

**Upper-case code:**
```
code UPPER
```

**Collapse repeated whitespace (`REGEX` replace):**
```
name '\s+' ' ' REGEX
```

**Letters before the first dash (`REGEX` substring by pattern):**
```
code '^([A-Z]+)-.*$' '$1' REGEX
```

**First 20 characters (`REGEX` substring by position):**
```
title '^(.{0,20}).*$' '$1' REGEX
```

**Date or datetime as `31.01.2026` (`REGEX` on the ISO string):**
```
created '^(\d{4})-(\d{2})-(\d{2}).*$' '$3.$2.$1' REGEX
```

**Number with a decimal comma (`CONCAT` turns the number into a string for `REGEX`):**
```
price 2 ROUND CONCAT '\.' ',' REGEX
```

### Math examples

**Sum across children:**
```
_child.*.price SUM
```

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

**Full boxes needed (round up):**
```
quantity box_size DIVIDE CEIL
```

### List examples

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

**Number of distinct categories among children:**
```
_child.*.category UNIQUE COUNT
```

**Distinct authors of children, sorted and comma-separated:**
```
_child.*.author UNIQUE SORT ", " CONCAT_WS
```

### Conversion examples

**Number from a string with a decimal comma (`REGEX` + `NUMBER`):**
```
price_text ',' '.' REGEX NUMBER
```

**Earliest due date, stored as a real date:**
```
_child.*.due_date MIN DATE
```

**Unix timestamp in seconds to a datetime:**
```
created_ts 1000 MULTIPLY DATETIME
```

### Comparison and condition examples

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

**Overdue and still unpaid (`AND` + `NOT`):**
```
due_date "2026-01-01" LT paid_date EXISTS NOT AND "overdue" WHEN
```

## Composition rules

Because variadic reducers consume the **entire** stack, a formula can practically contain **only one reducer** before fixed-arity operations. Once a reducer runs, anything pushed after it sits on top of its result — and the next reducer will swallow both.

If you need two independent reducer results combined together (e.g. a count and a sum each rendered to a string), split the calculation into two formula properties: define one property whose formula produces the count, another whose formula produces the sum, and a third whose formula references both. The two-pass evaluator resolves the dependency.

Fixed-arity operators (`EQ`, `GT`, `AND`, `IF`, `ROUND`, `ABS`, …) can be chained freely.
