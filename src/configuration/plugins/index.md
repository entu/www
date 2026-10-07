---
description: "Extend entity types with Entu plugins — embed custom UI tabs via iframes or fire webhooks, attached per entity type."
---

# Plugins

Plugins extend what Entu can do at the entity type level. A plugin is an entity of type `plugin`, attached to an entity type via the entity type's `plugin` property.

Create plugin entities in the Configuration area, then reference them from the entity type's `plugin` property.

## Plugin Categories

**UI plugins** open inside the edit drawer as an iframe tab alongside the standard edit form. Use them for custom create or edit experiences — a CSV importer, a form wizard, or an integration that pulls data from an external service. The plugin receives context as URL query parameters and renders inside Entu's own UI.

**Webhook plugins** are server-side triggers. When an entity is created or changed, Entu sends a POST request to the plugin's URL in the background without blocking the user. Use them to push data to external systems, trigger automations, sync with third-party services, or run any backend logic that should react to data changes.

## Plugin Parameters

| Param | Description |
|---|---|
| `name` | Display name shown as the tab label in the edit drawer (for UI plugins). |
| `type` | What kind of plugin this is — see plugin types below. |
| `url` | For UI plugins — the URL loaded in the iframe tab. For webhook plugins — the URL that receives the POST request; it must be `https` and must not point to `localhost` or a private network address, or the webhook is skipped. |

## Plugin Types

| Type | When triggered | What happens |
|---|---|---|
| `entity-edit` | Edit drawer opened for an **existing** entity | Plugin URL loaded as an iframe tab. URL receives `account`, `entity`, `locale`, `token`. |
| `entity-add` | Edit drawer opened to **create** a new entity | Plugin URL loaded as an iframe tab. URL receives `account`, `type`, `parent` (if adding as child), `locale`, `token`. |
| `entity-edit-webhook` | An **existing** entity of this type is **saved**, or one of its property values is deleted | Server POSTs `{ db, plugin, entity: { _id }, token }` to the plugin URL. Token is a short-lived JWT (1 min). Fire-and-forget. |
| `entity-add-webhook` | A **new** entity of this type is **created** (not by duplicating) | Same server-side POST as above, triggered on creation. |

## UI Plugin URL Parameters

When Entu loads a UI plugin in the iframe, it appends these query parameters to the plugin URL:

| Parameter | Description |
|---|---|
| `account` | Database identifier |
| `entity` | Entity ID (for `entity-edit`) |
| `type` | Entity type ID (for `entity-add`) |
| `parent` | Parent entity ID (for `entity-add` when creating a child) |
| `locale` | Current UI language code |
| `token` | The current user's access token (JWT) for making API calls on their behalf |

## Webhook Payload

For webhook plugins (`entity-edit-webhook`, `entity-add-webhook`), Entu sends a POST request with this JSON body:

```json
{
  "db": "mydatabase",
  "plugin": "entity-edit-webhook",
  "entity": {
    "_id": "ENTITY_ID"
  },
  "token": "SHORT_LIVED_JWT"
}
```

`plugin` is the plugin type that fired — `entity-edit-webhook` or `entity-add-webhook`. The `token` is valid for 1 minute, carries the rights of the user who made the change, and can be used to read or modify the entity via the API. The webhook is fire-and-forget — Entu does not wait for a response or retry on failure.

::: warning
Webhook delivery is not guaranteed. If your endpoint is down or returns an error, the request is lost. Implement your own retry or queue logic if reliability matters.
:::

## Built-in Plugins

Entu provides a set of ready-made plugins hosted at [github.com/entu/plugins](https://github.com/entu/plugins). Configure them by creating a plugin entity and setting its `url` to the corresponding plugin URL.

### System

#### CSV Import

Bulk-import entities from a spreadsheet. Upload a CSV file, preview the rows, choose which ones to import, and map each CSV column to an entity property. Supports a wide range of text encodings, so legacy exports from older systems work without manual conversion — the encoding is detected automatically and can be changed. The header row is not skipped; leave it unselected. Only properties without a formula that are not `readonly` can be mapped.

#### Schema Templates

A quick way to set up your database schema without starting from scratch. Instead of defining entity types and their properties by hand, you pick a ready-made type from the shared template library — for example *Book*, *Document*, *Folder*, or *Audio-Visual Recording* — and Entu copies the entity type and its property definitions (name, type, label, ordinal, formula, sharing, etc.) into your database. You can review the property list before importing and deselect any you don't need; types and properties you already have are marked as already imported.

### Books

#### Ester Import

Search the [ESTER](https://www.ester.ee) union library catalog used by Estonian academic and public libraries. Find books and publications by title, author, ISBN, or ISSN and import them as entities with full bibliographic metadata. On phones you can also scan a book's ISBN barcode with the camera — tap the camera button next to the search field, or take a photo of the barcode — and the plugin searches for it automatically.

#### Open Library Import

Search the [Open Library](https://openlibrary.org) catalog — a free, worldwide book database. Find a book by title, author, or ISBN, then pick the exact edition — the edition list can be filtered by language. The chosen edition is imported as an entity with title, subtitle, author, publisher, publishing place and year, series, page count, dimensions, weight, language, subject tags, ISBN, and notes filled in automatically, along with the cover image. On phones you can also scan a book's ISBN barcode with the camera — tap the camera button next to the search field, or take a photo of the barcode — and the plugin searches for it automatically.

### Audio-video

#### Discogs Import

Search the [Discogs](https://www.discogs.com) music database and add releases directly to your collection. Enter an artist or album title, then pick the exact release of the album (only albums with a Discogs master record are found) — Entu creates the entity with `title`, artist, label, catalog number, year, format, country, genre, style, barcode, and other metadata filled in automatically, along with the cover image. On phones you can also scan a release's barcode with the camera — tap the camera button next to the search field, or take a photo of the barcode — and the plugin searches for it automatically.

#### MusicBrainz Import

Search the open [MusicBrainz](https://musicbrainz.org) music encyclopedia. Find an album, then pick the exact release (pressing, country, format) — the entity is created with title, artist, label, year, format, barcode, and genres, along with cover art from the Cover Art Archive. On phones you can also scan a release's barcode with the camera — tap the camera button next to the search field, or take a photo of the barcode — and the plugin finds the matching albums automatically.

#### TMDB Import

Search [The Movie Database](https://www.themoviedb.org) and import films into your collection. Search results and metadata are in Estonian when your interface language is Estonian, otherwise in English. The imported entity gets title, original title, director, top actors, year, genres, runtime, languages, countries, production companies, IMDb ID, and description filled in automatically, along with the movie poster.

### Games

#### BoardGameGeek Import

Search [BoardGameGeek](https://boardgamegeek.com) and import board games with designer, artist, publisher, categories, mechanics, minimum and maximum player count, playing time, minimum age, year, and description filled in automatically, along with the box art.

#### IGDB Import

Search the [IGDB](https://www.igdb.com) video game database and import games with developer, publisher, platforms, genres, year, and description filled in automatically, along with the cover image.

### Collectibles

#### Brickset Import

Search [Brickset](https://brickset.com) and import LEGO sets by name or set number. The entity gets set number, name, theme, subtheme, year, piece and minifig counts, age range, box dimensions, weight, description, tags, and barcodes filled in automatically, along with the set image. On phones you can also scan the barcode on a set's box with the camera — tap the camera button next to the search field, or take a photo of the barcode — and the plugin finds the set automatically.

#### Numista Import

Search the [Numista](https://en.numista.com) coin and banknote catalogue and import types with issuer (as `country`), face value, first and last year of issue, composition, weight, diameter (as `dimensions`), shape, series, catalogue references, and notes filled in automatically, along with obverse and reverse images. Results are in English.

### Locations

#### KML Import

Import geographic locations from KML files (the format used by Google Earth and most GIS tools). After uploading, you see a list of all placemarks in the file, pick which ones to include, and they are created as entities with `name`, `lat` and `long` properties. The description goes into a property named `kirjeldus` and image links found in it into `pildilingid` — the entity type needs properties with these names to keep them. Only point placemarks are imported; lines and shapes are skipped.

## Access Control

Plugin entities use the same [rights and sharing model](/overview/entities/#access-rights) as all other entities. The edit drawer only shows plugin tabs for plugins the current user can access.

Set `_sharing: domain` on a plugin entity to make it available to every user of the database — the `plugin` entity type and its property definitions must then share `name`, `type` and `url` too, see [Entity Types → Visibility](/configuration/entity-types/#visibility). Leave it `private` and assign explicit `_viewer` (or higher) rights to restrict it to specific people.

This lets you expose certain plugins to everyone (e.g. a CSV importer for all editors) while keeping others limited to administrators or specific teams.

::: tip
A user needs at minimum `_viewer` rights on the plugin entity for the tab to appear. Webhook plugins are server-side and not shown in the UI, but their entity still respects the same rights model for management purposes.
:::
