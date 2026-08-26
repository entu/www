---
description: "The command palette puts all of Entu behind one keyboard shortcut — search, actions, navigation, and quick filters without touching the mouse."
---

# Command Palette

Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) anywhere in the app and the command palette opens. Press **Esc** or click outside to close it.

![Command palette open with search results](/screenshots/palette.png)

## Start typing

Type anything — results appear as you type. Entity matches show up alongside commands, so the same box finds a person, opens a menu list, or runs an action. Press **Enter** to open the selected row, or search everywhere with the text you typed.

## Before you type

An empty palette is already useful. It shows:

- **Actions for the open entity** — add a child, edit, duplicate, parents, rights, history. Only actions your rights allow are listed.
- **Create shortcuts** — new-entity actions for the menu list you are in.
- **Recent** — entities you viewed lately, one keystroke away.

![Command palette opened on an entity, listing its actions](/screenshots/palette-entity.png)

## Commands

The palette also runs app commands: open **Advanced Search** or **Entu AI**, switch the language, or sign out. And it navigates — to any menu entry, the dashboard, your own profile, or another account you have access to.

## Quick filters

The palette understands a small query grammar. Type an entity type's name and press **Tab** — it becomes a token, and everything after it applies to that type:

- **Filter by property** — pick a property, choose a condition, then a value. Conditions are **is / is not / contains** — or **is / before / after** for numbers and dates. While building a filter, **⌥** (Alt) cycles the condition.
- **Sort by property** — add a sort token and flip its direction by clicking it.

![Command palette with a type token and a property filter being built](/screenshots/palette-filter.png)

**Backspace** on an empty input removes the last token, so you can rebuild the query step by step. Press **Enter** and the list view opens with your filters applied.

