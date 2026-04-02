# Best Practices

Design principles and conventions for building a clean, maintainable data model in Entu.

## Property Naming

Use descriptive, lowercase names with underscores:

- ✅ `product_name`, `created_date`, `customer_email`
- ❌ `pn`, `cd`, `e`, `startDate`, `start-date`

Be consistent across entity types: use `name` for primary identifiers, `description` for longer text, `photo` for images.

Prefix related properties to group them visually: `address_street`, `address_city`, `address_country`.

## Data Modeling

**Design entity types around your query patterns.** If you frequently filter by `status`, enable `search` on that property definition.

**Use references for related data** that changes frequently — don't duplicate values across entities when a reference will do.

**Use formulas for derived data** — totals, averages, counts — so the source of truth stays in one place. See [Formulas](/api/formulas/).

**Leverage entity hierarchy** to model organizational structure. Parent-child relationships also enable rights inheritance.

## Multi-Value Properties

Embrace multi-value by design rather than creating numbered variants:

```json
// Good — multiple values under one property
[
  { "type": "tag", "string": "urgent" },
  { "type": "tag", "string": "customer" }
]

// Avoid — numbered separate properties
[
  { "type": "tag1", "string": "urgent" },
  { "type": "tag2", "string": "customer" }
]
```

Enable `list` on the property definition to allow multiple inputs in the UI.

## Access Control

**Grant minimum necessary rights:**
- `_viewer` for read-only access
- `_editor` for users who need to modify properties
- Reserve `_owner` for entity administrators

**Use `_inheritrights` for hierarchy-based permissions.** Grant access at a parent container and it cascades to all children automatically.

**Use `_sharing` for broad access** — `domain` for all authenticated users, `public` for unauthenticated visitors. Use `public` carefully.

::: danger
Setting `_sharing: public` makes the entity visible to anyone on the internet without authentication. Only use it for intentionally public content.
:::

See [Entities → Access Rights](/overview/entities/#access-rights) and [Users](/configuration/users/).
