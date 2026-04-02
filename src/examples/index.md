# Use-Case Examples

These walkthroughs show how to model common real-world scenarios in Entu using entity types, properties, and references.

## CRM — Contacts & Companies

**Goal:** Track companies, the contacts within them, and any notes or activities linked to each contact.

### Entity types to create

**Company**
| Property name | Type | Notes |
|---|---|---|
| `name` | string | Company display name |
| `website` | string | Store as plain text or use `markdown` on a `text` field for clickable links |
| `industry` | string | |
| `notes` | text | |

**Contact**
| Property name | Type | Notes |
|---|---|---|
| `name` | string | Full name |
| `email` | string | |
| `phone` | string | |
| `company` | reference | Points to a Company entity |
| `title` | string | Job title |

**Activity**
| Property name | Type | Notes |
|---|---|---|
| `date` | datetime | |
| `type` | string | e.g. call, meeting, email |
| `summary` | text | |
| `contact` | reference | Points to a Contact entity |

### Structure

- Create a **Companies** container entity as the root.
- Add each company as a child of that container.
- Add contacts as children of their respective company — the `company` reference property and the `_parent` relationship both link the contact to the company.
- Add activities as children of their contact.

### Access control

Grant `_editor` rights on the Companies container to your sales team and enable `_inheritrights: true` on all children so rights propagate automatically.

---

## Project Tracker

**Goal:** Manage projects with properties, counters, and a formula-computed field.

### Entity type

| Param | Value |
|---|---|
| `name` | `project` |
| `label` | `Project` |
| `description` | `A client project or internal initiative` |
| `add_from` | *(reference to the "Projects" menu)* |

### Property definitions

| `name` | `type` | `label` | Notable settings |
|---|---|---|---|
| `name` | `string` | `Name` | `mandatory`, `search` |
| `status` | `string` | `Status` | `set: ["Planning", "Active", "On Hold", "Done"]`, `mandatory` |
| `description` | `text` | `Description` | `markdown` |
| `owner` | `reference` | `Owner` | `reference_query: _type.string=person` |
| `due_date` | `date` | `Due Date` | |
| `budget` | `number` | `Budget` | `decimals: 2` |
| `tags` | `string` | `Tag` | `label_plural: Tags`, `list` |
| `code` | `counter` | `Project Code` | `readonly` |
| `notes` | `text` | `Internal Notes` | `hidden` |
| `total_hours` | `number` | `Total Hours` | `formula`, `readonly`, `decimals: 1` |

### What this demonstrates

- `set` turns a string field into a dropdown.
- `counter` generates a unique code per entity (e.g. project numbers).
- `hidden` keeps a field out of the edit form but visible on the entity page — good for formula-driven values.
- `formula` on `total_hours` recalculates automatically on every save using child/referrer data.

---

## Media Library

**Goal:** Store and organise images, videos, and documents with metadata and tags.

### Entity types to create

**Collection**
| Property name | Type | Notes |
|---|---|---|
| `name` | string | Folder / album name |
| `description` | text | |

**Media Item**
| Property name | Type | Notes |
|---|---|---|
| `title` | string | |
| `file` | file | The actual uploaded file |
| `type` | string | image, video, document |
| `tags` | string | `list: true` — multiple values allowed |
| `description` | text | |
| `author` | reference | Points to a Person entity |
| `published` | boolean | |
| `size` | number | Set `formula: 'file.size'` on the property definition — auto-computed from the attached file |

### Structure

- Create **Collections** as top-level containers.
- Upload media items as children of the appropriate collection.
- Use `_sharing: public` on collections that should be publicly browsable.
- Use `tags` (with `list: true`) so each item can carry multiple tags for filtering.

### Querying items by tag via the API

```
GET /api/{db}/entity?_type.string=media-item&tags.string=nature
```

---

## Library — Books, Patrons & Lendings

**Goal:** Manage a book and audio-visual collection, track patron records, and record lending history including due dates and returns.

### Entity types to create

**Book**
| Property name | Type | Notes |
|---|---|---|
| `title` | string | `mandatory`, `search` |
| `author` | string | `list: true` — multiple authors allowed |
| `isbn` | string | |
| `type` | string | e.g. book, DVD, audio CD; `set` turns it into a dropdown |
| `copies` | number | Total copies owned |
| `description` | text | |
| `cover` | file | Cover image |

**Person**
| Property name | Type | Notes |
|---|---|---|
| `name` | string | `mandatory`, `search` |
| `email` | string | |
| `phone` | string | |
| `card_number` | string | Library card / patron ID |
| `notes` | text | |

**Lending**
| Property name | Type | Notes |
|---|---|---|
| `book` | reference | Points to a Book entity |
| `borrower` | reference | Points to a Person entity |
| `lent_on` | date | |
| `due_date` | date | |
| `returned` | boolean | Set to `true` when the item is back |
| `overdue` | boolean | `formula: 'due_date < now() && !returned'`, `readonly` — auto-computed |

### Structure

- Create a **Books** container and add each book as a child.
- Create a **Patrons** container and add each person as a child.
- Add lending records as children of the relevant patron — the `borrower` reference and `_parent` relationship both link the lending to the patron.

### Access control

Grant library staff `_editor` rights on both the Books and Patrons containers with `_inheritrights: true`. Give patrons `_viewer` rights on their own entity so they can see their lending history through the API or a custom portal.
