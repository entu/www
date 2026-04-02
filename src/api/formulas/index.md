# Formulas

Formulas let a property compute its value automatically on every save, based on data from the same entity, its parents, its children, or entities that reference it.

To use a formula: set the `formula` flag on a property definition and write the expression as the formula value. Computed properties cannot be edited manually and are skipped when duplicating an entity.

Formulas are evaluated in two passes so that properties depending on other formula properties resolve correctly.

::: info
Two-pass evaluation means a formula can safely reference another computed property on the same entity. The first pass resolves simple fields; the second resolves dependencies between computed properties.
:::

## Syntax

A formula is written as space-separated values followed by an optional function name:

```
field1 field2 field3 FUNCTION
```

If no function is specified, `CONCAT` is used by default.

### Nested Formulas

Use parentheses to nest formulas and create complex calculations:

```
(field1 field2 SUM) (field3 field4 SUM) MULTIPLY
```

Inner formulas are evaluated first, then their results are used in the outer formula. Nesting can be multiple levels deep.

**Examples:**
- `(price tax SUM) quantity MULTIPLY` — Calculate total with tax per quantity
- `((a b SUM) (c d SUM) MULTIPLY) 100 DIVIDE` — Complex nested calculation
- `(min_value max_value SUM) 2 DIVIDE` — Average of min and max

## Field References

### Same Entity

| Reference | Resolves to |
|---|---|
| `propertyName` | Value(s) of that property on the current entity |
| `_id` | The current entity's ID |
| `'literal'` or `"literal"` | A string literal |
| `123` / `45.67` | A numeric literal |

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

::: info
`typeName` is matched against the referrer entity type's `name` property (e.g. `invoice`), not its display `label`. If a type's `name` and `label` differ, use the `name` value.
:::

## Functions

| Function | Description |
|---|---|
| `CONCAT` | Joins all values as strings (default when no function is specified) |
| `CONCAT_WS` | Joins values with a separator — the last value is used as the separator |
| `COUNT` | Returns the number of values |
| `SUM` | Sums all numeric values |
| `SUBTRACT` | Subtracts remaining values from the first |
| `MULTIPLY` | Multiplies all values together |
| `DIVIDE` | Divides the first value by the rest. Returns `undefined` if any divisor is zero. |
| `AVERAGE` | Returns the arithmetic mean |
| `MIN` | Returns the smallest value |
| `MAX` | Returns the largest value |
| `ABS` | Returns the absolute value of the first value |
| `ROUND` | Rounds to N decimal places — the last value is used as N |

::: warning
`DIVIDE` returns `undefined` when any value after the first is zero. Handle this in downstream formulas or ensure the divisor is always non-zero.
:::

## Empty Input Behaviour

When no values resolve (e.g. the referenced property is empty or unset), most functions return `undefined` and the property is simply not written. Three functions return a value even for empty input:

| Function | Empty-input result |
|---|---|
| `COUNT` | `0` |
| `SUM` | `0` |
| `MULTIPLY` | `1` (multiplicative identity) |
| All others | `undefined` — property is not set |

## Examples

**Full name from two fields:**
```
first_name last_name ' ' CONCAT_WS
```

**Total price:**
```
price quantity MULTIPLY
```

**Price with tax, per quantity:**
```
(price tax SUM) quantity MULTIPLY
```

**Count child entities:**
```
_child.*._id COUNT
```

**Average price across children:**
```
_child.*.price AVERAGE
```

**Round result to 2 decimals:**
```
(total quantity DIVIDE) 2 ROUND
```

**Profit from referrer invoices:**
```
_referrer.invoice.amount SUM
```
