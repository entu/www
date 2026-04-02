# Authentication

All API requests require a JWT token passed in the `Authorization: Bearer <token>` header. Tokens are valid for 48 hours.

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
4. Refresh before the 48-hour expiry

::: warning
JWT tokens are bound to the IP address used when the token was issued. If your IP changes (e.g. switching networks, VPN, or mobile roaming), the token is immediately rejected with `401 Invalid JWT audience` and you must re-authenticate. Cache tokens per IP context if your environment changes addresses frequently.
:::

::: tip
Cache the JWT and reuse it across requests. Exchanging the credential on every call is wasteful — only refresh when the token expires.
:::

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

## Auth Properties

Authentication credentials are stored as properties on an entity. By default these are used on person entities — each person entity represents a human user. But the same properties can be added to any entity type, which lets non-human actors authenticate too. A `robot` entity in an IoT setup, a `screen` entity in a digital signage system, or a `service` entity for a backend integration can all have their own API key and authenticate independently.

### `entu_user`

- Stores the provider user ID along with other info returned by the OAuth provider (such as email)
- Set automatically when a new person entity is created on first login

### `entu_api_key`

- Create the property with no value — Entu auto-generates a cryptographically secure 32-byte key
- The hash is stored; the plain key is returned only once
- Multiple keys can exist on the same entity
