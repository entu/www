# Menus

Menus are the navigation items shown in the sidebar. Each menu item links to a filtered list of entities. They are entities of type `menu` — create them in the Configuration area.

When a menu item is active (current page URL matches its query), entity types whose `add_from` references that menu will show a "New …" button in the toolbar.

Entity types can also set `add_from` to reference another **entity type** or a **specific entity instance** — in that case an "Add child" button appears when viewing an instance of that type or that specific entity, respectively. This makes `add_from` work across two contexts: menu-level creation and parent–child creation.

## Menu Parameters

| Param | Description |
|---|---|
| `name` | Display name shown in the sidebar. |
| `group` | Groups menu items under a named section header. Items with the same `group` value are shown together. |
| `ordinal` | Numeric sort order within the group. Lower numbers appear first. |
| `query` | URL query string that defines what entities this menu shows. When the current page URL starts with this query, the menu item is highlighted as active. |

The `query` parameter uses the standard entity filter syntax. See [API → Query Reference](/api/query-reference/) for the full syntax.

::: info
The connection between menus and entity types is two-way: the menu defines what to show, and the entity type's `add_from` property references the menu to make the "Add" button appear when that menu is active.
:::

## Example Menu Setup

A typical sidebar for a project management application:

| `name` | `group` | `ordinal` | `query` |
|---|---|---|---|
| Projects | Work | 1 | `_type.string=project&sort=name.string` |
| Tasks | Work | 2 | `_type.string=task&status.string.in=active,pending` |
| Invoices | Finance | 1 | `_type.string=invoice&sort=-date.date` |
| People | Admin | 1 | `_type.string=person&sort=name.string` |

To allow creating entities of that type from a menu, set the entity type's `add_from` to reference the menu entity. When that menu is active, the "Add" button will appear in the toolbar.

## Access Control

Menu entities use the same rights and sharing model as all other entities — the sidebar only shows menu items the current user can access.

Set `_sharing: domain` on a menu entity to make it visible to every authenticated user, or `_sharing: public` to show it even to unauthenticated visitors. Leave it `private` and assign explicit `_viewer` (or higher) rights to restrict it to specific people or groups.

This makes it straightforward to build role-based navigation: an **Admin** menu visible only to administrators, a **Finance** section visible only to the finance team, and a **Projects** menu open to everyone.

::: tip
The recommended pattern is to grant rights on the menu entity itself — a user only needs `_viewer` rights to see a menu item. Use `_inheritrights` on the menu entity if you want it to inherit access from a parent container.
:::
