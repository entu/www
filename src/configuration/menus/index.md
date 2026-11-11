---
description: "Configure the Entu sidebar with menu entities — each item links to a filtered list of entities for quick navigation."
---

# Menus

Menus are the navigation items shown in the sidebar. Each menu item links to a filtered list of entities. They are entities of type `menu` — create them in the Configuration area.

A menu also decides what can be created from it. When a menu item is active (current page URL matches its query), the entity types in its `add_entity` are offered under the "New …" button in the toolbar and in the [command palette](/getting-started/palette/) — with one type the button names it (e.g. "New Project"), with several it opens a "New …" popup to pick from. Every entity created this way is added under the menu's `add_parent` entities.

Creating a child under an existing entity is configured on the entity type instead: its `add_from` references an **entity type** or a **specific entity**, and an "Add …" button appears on that entity for users with `_expander` rights on it. See [Entity Types → Behaviour](/configuration/entity-types/#entity-type-parameters).

## Menu Parameters

| Param | Description |
|---|---|
| `name` | Display name shown in the sidebar. |
| `group` | Groups menu items under a named section header. Items with the same `group` value are shown together. |
| `ordinal` | Numeric sort order within the group. Lower numbers appear first. Groups are ordered by the average `ordinal` of their items. |
| `query` | URL query string that defines what entities this menu shows. When the current page URL starts with this query, the menu item is highlighted as active. A value starting with `http` or `/` makes the item a link that opens in a new tab instead; `{DATABASE}` and `{LOCALE}` in it are replaced with the current database and UI language. |
| `add_entity` | Addable entity types — a list of references to the entity types that can be created from this menu. While the menu is active, they appear under the "New …" button and in the command palette. |
| `add_parent` | Parents of new entities — a list of references to entities that every entity created from this menu is added under, in addition to its entity type's `default_parent`. Each one applies to every `add_entity` type of the menu. The user needs `_expander` rights on each of them, otherwise saving fails. New entities inherit rights and sharing from these parents as usual. |

The `query` parameter uses the standard entity filter syntax. See [API → Query Reference](/api/query-reference/) for the full syntax.

## Example Menu Setup

A typical sidebar for a project management application:

| `name` | `group` | `ordinal` | `query` |
|---|---|---|---|
| Projects | Work | 1 | `_type.string=project&sort=name.string` |
| Tasks | Work | 2 | `_type.string=task&status.string.in=active,pending` |
| Invoices | Finance | 1 | `_type.string=invoice&sort=-date.date` |
| People | Admin | 1 | `_type.string=person&sort=name.string` |

To allow creating tasks from the **Tasks** menu, set its `add_entity` to the `task` entity type. When that menu is active, the toolbar shows a "New Task" button. To file every new task under a project folder, also set the menu's `add_parent` to that folder.

::: tip
New entities show up in the menu's list only if they match its `query`. When the menu sets `add_parent`, include it in the query (e.g. `_type.string=task&_parent.reference=<folder id>`) so the list shows what is created from it.
:::

## Access Control

Menu entities use the same [rights and sharing model](/overview/entities/#access-rights) as all other entities — the sidebar only shows menu items the current user can access.

Set `_sharing: domain` on a menu entity to show it to every user of the database, or `_sharing: public` to show it also to visitors who are not signed in. Such users see the menu's `domain` or `public` view, so the `menu` entity type and its property definitions must share `name`, `group`, `ordinal` and `query` too — see [Entity Types → Visibility](/configuration/entity-types/#visibility). Leave it `private` and assign explicit `_viewer` (or higher) rights to restrict it to specific people.

This makes it straightforward to build role-based navigation: an **Admin** menu visible only to administrators, a **Finance** section visible only to the finance team, and a **Projects** menu open to everyone.

::: tip
The recommended pattern is to grant rights on the menu entity itself — a user only needs `_viewer` rights to see a menu item. Use `_inheritrights` on the menu entity if you want it to inherit access from a parent container.
:::
