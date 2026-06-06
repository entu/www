# Authentication

All API requests require a JWT token passed in the `Authorization: Bearer <token>` header. Tokens are valid for 12 hours. The auth response includes an `expires` field (ISO 8601 datetime) so you know when to refresh.

## Getting a Token

Every authentication method ends the same way: exchange a credential at `GET /api/auth` for a JWT token, then use that token on all subsequent requests.

### API Key

API keys are long-lived credentials suited for scripts, CI/CD pipelines, and server-to-server integrations. Generate a key from any entity that has the `entu_api_key` property — typically your person entity — then exchange it for a token:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

::: info
To restrict the resulting JWT to a single database, add `?db=mydbname` to the auth request. The `?account=mydbname` spelling is also accepted and behaves identically.
:::

::: warning
The generated API key is displayed only once. Copy and store it securely — only its hash is stored and it cannot be retrieved again.
:::

An entity can have multiple API keys. Delete individual keys when they are no longer needed.

### OAuth

For interactive sessions, redirect users to `/api/auth/{provider}`. The provider authenticates the user and returns a temporary token. Exchange it at `GET /api/auth`:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer TEMPORARY_OAUTH_TOKEN"
```

Supported providers: `e-mail`, `google`, `apple`, `smart-id`, `mobile-id`, `id-card`

The provider returns a user ID and profile info that is matched against the entity's `entu_user` property. On first login, a person entity can be created automatically — see [Users → Automatic User Creation](/configuration/users/#automatic-user-creation).

## Authentication Flow

1. Authenticate using your OAuth provider or API key
2. Exchange the credential at `GET /api/auth` for a JWT token
3. Use the JWT in `Authorization: Bearer <token>` on all subsequent requests
4. Refresh before the 12-hour expiry (see [Refreshing a Token](#refreshing-a-token))

::: warning
JWT tokens are bound to the IP address used when the token was issued. If your IP changes (e.g. switching networks, VPN, or mobile roaming), the token is immediately rejected with `401 Invalid JWT audience` and you must re-authenticate. Cache tokens per IP context if your environment changes addresses frequently.
:::

::: tip
Cache the JWT and reuse it across requests. Exchanging the credential on every call is wasteful — only refresh when the token nears expiry.
:::

## Refreshing a Token

Instead of re-authenticating, exchange a still-valid (or recently expired) token for a fresh 12-hour one at `GET /api/auth/refresh`:

```bash
curl -X GET "https://entu.app/api/auth/refresh" \
  -H "Authorization: Bearer YOUR_CURRENT_TOKEN"
```

The response has the same shape as `GET /api/auth` — `accounts`, `user`, `token`, and `expires`. The signature and IP binding are enforced, and account access is re-validated against the databases.

Refresh keeps a session alive as long as you refresh regularly, but two limits apply:

- **Idle limit (14 days)** — measured from the presented token's own issue time. A token left unused (not refreshed) for more than 14 days is rejected with `401 Token too old, re-authenticate`. A client that refreshes within each 12-hour window never hits this.
- **Absolute limit (30 days)** — measured from your original sign-in, which the token carries unchanged through every refresh. Once that is over 30 days old, refresh is rejected with `401 Session expired, re-authenticate` and you must sign in again — no matter how often you refreshed.

## Third-Party App Integration

The OAuth flow supports a `next` parameter that lets an external application receive the token after the user completes authentication in Entu. This is the recommended approach for building apps that delegate sign-in to Entu.

Redirect the user to the provider URL with a URL-encoded `next` value:

```
/api/auth/{provider}?next=https://your-app.com/callback?key=
```

After the user authenticates, the server appends the session token to the `next` value and redirects the browser there:

```
https://your-app.com/callback?key={SESSION_TOKEN}
```

The session token is short-lived (5 minutes) and bound to the user's browser IP. Your app's **frontend** must exchange it for a full JWT by calling `GET /api/auth` directly from the browser:

```js
const response = await fetch('https://entu.app/api/auth', {
  headers: { Authorization: `Bearer ${sessionToken}` }
})
const { token } = await response.json()
```

The exchange must originate from the same browser that completed the login — server-side exchange will fail because the IP will not match.

::: warning Security note
Always validate the `next` URL in your app before using the token. Only accept HTTPS URLs and reject any redirect to an origin you do not control.
:::

## Adding a Login Method to an Existing Account

A signed-in user can attach an additional OAuth identity — a second email, a Google account, an Apple ID — to their existing person entity, without administrator involvement. The mechanism reuses the invite flow as a self-link:

1. The app adds a placeholder `entu_user` property to the user's own person entity, carrying an invite token and the new email:
   ```json
   { "type": "entu_user", "invite": "<token>", "email": "new@example.com" }
   ```
2. The app emails an invite link (referencing that person entity) to the new address.
3. The user opens the link and completes the e-mail (or other provider) OAuth flow. Because the invited entity is the user's own person, Entu links the new credential onto it rather than creating a new person.
4. The person entity now carries two (or more) `entu_user` entries; a future login through either identity resolves to the same person.

This works for any supported provider and needs only `_editor` rights on the person entity — which users hold on their own entity by default.

::: info
This reuses the same path as new-user invite acceptance. A dedicated account-linking endpoint is under discussion — see [entu/api#39](https://github.com/entu/api/issues/39).
:::

## Auth Properties

Authentication credentials are stored as properties on an entity. By default these are used on person entities — each person entity represents a human user. But the same properties can be added to any entity type, which lets non-human actors authenticate too. A `robot` entity in an IoT setup, a `screen` entity in a digital signage system, or a `service` entity for a backend integration can all have their own API key and authenticate independently.

### `entu_user`

- Stores the provider user ID along with other info returned by the OAuth provider (such as email)
- Set automatically when a new person entity is created on first login

### `entu_api_key`

- Create the property with no value — Entu auto-generates a cryptographically secure 32-byte key
- The hash is stored; the plain key is returned only once
- Multiple keys can exist on the same entity
