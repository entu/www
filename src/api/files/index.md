# Files

File properties let entities store attachments, documents, images, and other binary data. Files are stored in object storage (S3-compatible) and accessed via signed, time-limited URLs.

To enable file uploads on an entity type, add a property definition with `type: file`.

## File Property Structure

A file property value has three required metadata fields:

| Field | Description |
|---|---|
| `filename` | The original name of the file (e.g. `cover.jpg`, `report.pdf`) |
| `filesize` | Size in bytes |
| `filetype` | MIME type (e.g. `image/jpeg`, `application/pdf`) |

All three must be present when creating a file property. Each file property gets its own unique storage location identified by its `_id`.

## Upload Process

File uploads use a secure two-step flow:

**Step 1 — Create the file property**

POST the file metadata to the entity. The API responds with a property object that includes an `upload` field containing a signed URL and the required headers.

```json
{
  "type": "photo",
  "filename": "cover.jpg",
  "filesize": 1937,
  "filetype": "image/jpeg"
}
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "photo",
  "filename": "cover.jpg",
  "filesize": 1937,
  "filetype": "image/jpeg",
  "upload": {
    "url": "https://s3.amazonaws.com/bucket/path?signature...",
    "method": "PUT",
    "headers": {
      "ACL": "private",
      "Content-Disposition": "inline;filename=\"cover.jpg\"",
      "Content-Length": 1937,
      "Content-Type": "image/jpeg"
    }
  }
}
```

**Step 2 — Upload the file**

PUT the file content directly to the signed URL using the **exact headers returned in the response** — all four are required:

```bash
curl -X PUT "SIGNED_S3_URL" \
  -H "ACL: private" \
  -H "Content-Disposition: inline;filename=\"cover.jpg\"" \
  -H "Content-Length: 1937" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@cover.jpg"
```

The signed upload URL expires after **60 seconds**. Complete the S3 PUT before it expires. Multiple file properties can be created in one POST — each gets its own `upload` object in the response.

::: warning
If the upload URL expires before you complete the S3 PUT, delete the property and start over.
:::

## Download Process

To download a file, GET the property by ID:

```
GET /api/{db}/property/{_id}
```

The response includes a time-limited signed URL in the `url` field — valid for 60 seconds. Do not cache or share it; generate a fresh one each time.

To trigger a direct browser download, append `?download=true` — this redirects immediately to the signed URL.

## Thumbnails

### Entity thumbnail

Generate a square thumbnail from the first file of an entity's `photo` property:

```
GET /api/{db}/entity/{_id}/thumbnail/{size}
```

The endpoint takes the first `photo` file, renders it, center-crops it to a square (cover fit), and produces a **JPEG**. Both **images** (`image/*`, except SVG) and **PDF** sources are supported — for PDFs, the first page is rendered.

The `size` path segment must be one of the allowed values (width and height of the square, in pixels):

```
200, 400, 800
```

Any other value returns `400`. Restricting to an allowlist bounds the number of cached variants per file.

The response contains a time-limited signed `url` (valid for 60 seconds), the same shape as a file download:

```json
{
  "url": "https://s3.amazonaws.com/bucket/path?signature..."
}
```

Generated thumbnails are cached in object storage, so the first request for a given file and size is slower (generation) and subsequent ones are served from cache. The source entity's access rules are enforced on every request.

| Response | Meaning |
|---|---|
| `200` | JSON `{ url }` with the signed thumbnail URL |
| `400` | Invalid `size`, unsupported file type, or the file could not be decoded |
| `403` | No access to the entity |
| `404` | Entity not found, or it has no `photo` |

### Property thumbnail

Generate a square thumbnail from **any** individual file property — not just `photo` — addressed by its property `_id`:

```
GET /api/{db}/property/{_id}/thumbnail/{size}
```

Where the entity endpoint always uses the entity's first `photo` file, this endpoint thumbnails the specific file property you reference. Behaviour is otherwise identical: it center-crops to a square (cover fit) and produces a **JPEG**. Both **images** (`image/*`) and **PDF** sources are supported — for PDFs, the first page is rendered. This is what powers the filename-hover thumbnail preview in the UI.

The `size` path segment must be one of the allowed values (width and height of the square, in pixels):

```
200, 400, 800
```

Any other value returns `400`.

The response contains a time-limited signed `url` (valid for 60 seconds), the same shape as a file download:

```json
{
  "url": "https://s3.amazonaws.com/bucket/path?signature..."
}
```

Generated thumbnails are cached in object storage, so the first request for a given property and size is slower (generation) and subsequent ones are served from cache. The property's access rules are enforced on every request — the same access check as `GET /api/{db}/property/{_id}`.

| Response | Meaning |
|---|---|
| `200` | JSON `{ url }` with the signed thumbnail URL |
| `400` | Invalid `size`, the property is not a previewable file (not an image or PDF), or the file could not be decoded |
| `403` | No access to the property |
| `404` | Property not found |

## Deleting a File Property

Delete a file property the same way as any other property value:

```
DELETE /api/{db}/property/{_id}
```

This soft-deletes the property record (marked with `deleted.at` and `deleted.by`). The underlying file in object storage is not removed — only the property reference is deleted.
