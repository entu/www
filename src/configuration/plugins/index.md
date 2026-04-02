# Plugins

Plugins extend what Entu can do at the entity type level. A plugin is an entity of type `plugin`, attached to an entity type via the entity type's `plugin` property.

Create plugin entities in the Configuration area, then reference them from the entity type's `plugin` property.

## Plugin Categories

**UI plugins** open inside the edit drawer as an iframe tab alongside the standard edit form. Use them for custom create or edit experiences — a CSV importer, a form wizard, or an integration that pulls data from an external service. The plugin receives context as URL query parameters and renders inside Entu's own UI.

**Webhook plugins** are server-side triggers. When an entity is saved or created, Entu sends a POST request to the plugin's URL in the background without blocking the user. Use them to push data to external systems, trigger automations, sync with third-party services, or run any backend logic that should react to data changes.

## Plugin Parameters

| Param | Description |
|---|---|
| `name` | Display name shown as the tab label in the edit drawer (for UI plugins). |
| `type` | What kind of plugin this is — see plugin types below. |
| `url` | For UI plugins — the URL loaded in the iframe tab. For webhook plugins — the URL that receives the POST request. |
| `new_window` | Boolean. If `true`, opens the plugin URL in a new browser window instead of an iframe tab. |

## Plugin Types

| Type | When triggered | What happens |
|---|---|---|
| `entity-edit` | Edit drawer opened for an **existing** entity | Plugin URL loaded as an iframe tab. URL receives `account`, `entity`, `locale`, `token`. |
| `entity-add` | Edit drawer opened to **create** a new entity | Plugin URL loaded as an iframe tab. URL receives `account`, `type`, `parent` (if adding as child), `locale`, `token`. |
| `entity-edit-webhook` | An **existing** entity of this type is **saved** | Server POSTs `{ db, plugin, entity: { _id }, token }` to the plugin URL. Token is a short-lived JWT (1 min). Fire-and-forget. |
| `entity-add-webhook` | A **new** entity of this type is **created** | Same server-side POST as above, triggered on creation. |

## UI Plugin URL Parameters

When Entu loads a UI plugin in the iframe, it appends these query parameters to the plugin URL:

| Parameter | Description |
|---|---|
| `account` | Database identifier |
| `entity` | Entity ID (for `entity-edit`) |
| `type` | Entity type ID (for `entity-add`) |
| `parent` | Parent entity ID (for `entity-add` when creating a child) |
| `locale` | Current UI language code |
| `token` | Short-lived JWT token for making API calls on behalf of the current user |

## Webhook Payload

For webhook plugins (`entity-edit-webhook`, `entity-add-webhook`), Entu sends a POST request with this JSON body:

```json
{
  "db": "mydatabase",
  "plugin": "PLUGIN_ENTITY_ID",
  "entity": {
    "_id": "ENTITY_ID"
  },
  "token": "SHORT_LIVED_JWT"
}
```

The `token` is valid for 1 minute and can be used to read or modify the entity via the API. The webhook is fire-and-forget — Entu does not wait for a response or retry on failure.

::: warning
Webhook delivery is not guaranteed. If your endpoint is down or returns an error, the request is lost. Implement your own retry or queue logic if reliability matters.
:::

## Built-in Plugins

Entu provides a set of ready-made plugins hosted at [github.com/entu/plugins](https://github.com/entu/plugins). Configure them by creating a plugin entity and setting its `url` to the corresponding plugin URL.

### Schema Templates

A quick way to set up your database schema without starting from scratch. Instead of defining entity types and their properties by hand, you pick a ready-made type from the shared template library — for example *Book*, *Document*, *Folder*, or *Audio-Visual Recording* — and Entu copies the entity type and its property definitions (name, type, ordinal, etc.) into your database. You can review the property list before importing and deselect any you don't need.

### CSV Import

Bulk-import entities from a spreadsheet. Upload a CSV file, preview the rows, choose which ones to import, and map each CSV column to an entity property. Supports a wide range of text encodings, so legacy exports from older systems work without manual conversion.

### Discogs Import

Search the [Discogs](https://www.discogs.com) music database and add releases directly to your collection. Enter an artist or album title, browse the results, and click Import — Entu creates the entity with title, artist, label, year, format, genre, barcode, and other metadata filled in automatically.

### Ester Import

Search the [ESTER](https://www.ester.ee) union library catalog used by Estonian academic and public libraries. Find books and publications by title, author, ISBN, or ISSN and import them as entities with full bibliographic metadata.

### KML Import

Import geographic locations from KML files (the format used by Google Earth and most GIS tools). After uploading, you see a list of all placemarks in the file, pick which ones to include, and they are created as entities with name, description, and coordinate properties.

## Access Control

Plugin entities use the same rights and sharing model as all other entities. The edit drawer only shows plugin tabs for plugins the current user can access.

Set `_sharing: domain` on a plugin entity to make it available to every authenticated user, or `_sharing: public` to expose it even to unauthenticated visitors. Leave it `private` and assign explicit `_viewer` (or higher) rights to restrict it to specific people or groups.

This lets you expose certain plugins to everyone (e.g. a CSV importer for all editors) while keeping others limited to administrators or specific teams.

::: tip
A user needs at minimum `_viewer` rights on the plugin entity for the tab to appear. Webhook plugins are server-side and not shown in the UI, but their entity still respects the same rights model for management purposes.
:::
