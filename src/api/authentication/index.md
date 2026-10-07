---
description: "Authenticate Entu API requests with a JWT bearer token valid for 12 hours — how to obtain and use it."
---

# Authentication

Authenticated API requests pass a JWT token in the `Authorization: Bearer <token>` header — without one, only public data (entities with `_sharing: public`) can be read. Tokens are valid for 12 hours. The auth response includes an `expires` field (ISO 8601 datetime) so you know when to refresh.

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

Supported providers: `passkey`, `apple`, `google`, `e-mail`, `smart-id`, `mobile-id`, `id-card`

Without a `next` URL (see [Third-Party App Integration](#third-party-app-integration)), the temporary token comes back as JSON `{ "key": "..." }`. Add `lang=en` or `lang=et` to set the language of the OAuth.ee sign-in page; without it OAuth.ee chooses.

The provider returns a user ID and profile info that is matched against the entity's `entu_user` property. On first login, a person entity can be created automatically — see [Users → Automatic User Creation](/configuration/users/#automatic-user-creation). A sign-in that matches no database still gets a token, with an empty `accounts` list; that token can create a new database.

To accept an invite, add `invite={INVITE_TOKEN}` when exchanging the temporary token: the sign-in is linked to the invited person entity, and without `db` the JWT is limited to the invite's database. If the sign-in is already linked to another person in that database, the invite is not accepted and the response includes `"conflict": "invite"`. An invalid, expired or already used invite — or one for another database than `db` — is rejected with `400 Invalid or expired invite`; a used invite only still signs in the person it was for.

A passkey is a login provider like the others, on the Entu passkey page (`lang` does not apply):

- `/api/auth/passkey` signs in with an existing passkey. The user is matched by the passkey on their person entity (`entu_passkey`) in every database that holds it.
- `/api/auth/passkey/register` creates a new passkey on the user's device and signs in with it — use it to sign up, to accept an invite with a new passkey, or to add a passkey to one's own person.

Both end in a temporary token for `GET /api/auth` and take `next` the same way. `uid` is the passkey's credential ID and `provider` is `passkey`. Accepting an invite, creating a person automatically or creating a new database with a passkey stores that passkey on the person. A passkey stores no name: `user.name` is the person's name in the first database, alphabetically, that has one.

## Authentication Flow

1. Authenticate using your OAuth provider or API key
2. Exchange the credential at `GET /api/auth` for a JWT token
3. Use the JWT in `Authorization: Bearer <token>` on all subsequent requests
4. Refresh before the 12-hour expiry (see [Refreshing a Token](#refreshing-a-token))

::: warning
JWT tokens are bound to the IP address used when the token was issued. If your IP changes (e.g. switching networks, VPN, or mobile roaming), the token is immediately rejected with `401 Invalid token` and you must re-authenticate. Cache tokens per IP context if your environment changes addresses frequently. Tokens from the [OAuth server](#oauth-server) are the exception — they are not bound to an IP.
:::

::: tip
Cache the JWT and reuse it across requests. Exchanging the credential on every call is wasteful — only refresh when the token nears expiry.
:::

Every Entu JWT carries a `use` claim naming what it is for. Only `use: access` tokens — from `GET /api/auth`, `/api/auth/refresh` and the [OAuth server](#oauth-server) — open the REST API, GraphQL and MCP; a session token or an invite is refused there. Tokens issued before the claim was added have no `use` and are accepted until 2026-11-06.

## Refreshing a Token

Instead of re-authenticating, exchange a still-valid (or recently expired) token for a fresh 12-hour one at `GET /api/auth/refresh`:

```bash
curl -X GET "https://entu.app/api/auth/refresh" \
  -H "Authorization: Bearer YOUR_CURRENT_TOKEN"
```

The response has the same shape as `GET /api/auth` — `accounts`, `user`, `token`, and `expires`. The signature and IP binding are enforced, and account access is re-validated against the databases — for a provider or passkey sign-in, databases are looked up again by identity, so the refreshed token includes databases joined or created since sign-in. If no database is accessible any more, refresh fails with `401 No accessible accounts`. A token without an IP binding — one from the [OAuth server](#oauth-server) — cannot be refreshed: it is rejected with `401 Invalid token`.

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

The session token is short-lived (5 minutes), single use, and bound to the user's browser IP. Your app's **frontend** must exchange it for a full JWT by calling `GET /api/auth` directly from the browser:

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

## OAuth Server

Entu is also an OAuth 2.1 authorization server. Instead of handling the `next` round trip yourself, your app can use a standard OAuth library: the user signs in on Entu, your app receives a token, and no credentials ever pass through your code.

All OAuth endpoints live on the API origin `https://api.entu.app` — the `entu.app/api/…` alias cannot be used here, because discovery documents must sit at the root of the issuer.

::: info
Every authorization is scoped to one database. Pass the database name as `db`, or the full resource URL as `resource` with the database as its first path segment (e.g. `https://mcp.entu.app/mydatabase`). The `resource` host must be in the API's own domain; any other is ignored.
:::

### Discovery

```
GET https://api.entu.app/.well-known/oauth-authorization-server
```

Returns the endpoint URLs. Most OAuth libraries fetch this for you.

### Register a client

Clients register themselves — there is no application form and no client secret.

```bash
curl -X POST "https://api.entu.app/auth/register" \
  -H "Content-Type: application/json" \
  -d '{ "client_name": "My App", "redirect_uris": ["https://your-app.com/callback"] }'
```

`redirect_uris` takes 1 to 10 absolute URIs of any scheme, so native apps can use a custom one; `client_name` is optional and kept to 200 characters. The returned `client_id` carries its own redirect URIs and stays valid for a year. Store it — registering again on every start creates a new one needlessly.

### Authorize

Send the user's browser to:

```
https://api.entu.app/auth/authorize
  ?client_id={CLIENT_ID}
  &redirect_uri=https://your-app.com/callback
  &response_type=code
  &code_challenge={CHALLENGE}
  &code_challenge_method=S256
  &state={STATE}
  &db={DATABASE}
```

PKCE is required and only `S256` is accepted. The user signs in on Entu, and your `redirect_uri` then receives `code` and `state`.

Without `provider`, OAuth.ee asks the user which provider to use. To skip that choice, add `&provider={PROVIDER}` with one of the [supported providers](#oauth) — for example `&provider=passkey` sends the user straight to the passkey sign-in. A passkey sign-in starts only this way.

An unknown `client_id` or a `redirect_uri` not registered for it is answered with `400`. Once both check out, any other problem — wrong `response_type`, missing PKCE, no database, unknown provider — is sent back to your `redirect_uri` as `error` and `error_description`, with your `state`.

### Exchange the code

```bash
curl -X POST "https://api.entu.app/auth/token" \
  -d "grant_type=authorization_code" \
  -d "code={CODE}" \
  -d "redirect_uri=https://your-app.com/callback" \
  -d "code_verifier={VERIFIER}"
```

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 43200
}
```

The `access_token` is an ordinary Entu JWT — use it exactly as described above.

::: info
Unlike other Entu tokens, this one is not bound to an IP address — your backend can exchange the code and the token works from any machine. For the same reason it cannot be renewed at `/api/auth/refresh` (see [Refreshing a Token](#refreshing-a-token)).
:::

Codes are single use and expire after five minutes. When the token expires, run the flow again.

## Auth Properties

Authentication credentials are stored as properties on an entity. By default these are used on person entities — each person entity represents a human user. But the same properties can be added to any entity type, which lets non-human actors authenticate too. A `robot` entity in an IoT setup, a `screen` entity in a digital signage system, or a `service` entity for a backend integration can all have their own API key and authenticate independently.

### `entu_user`

- Stores the provider user ID along with other info returned by the OAuth provider (such as email)
- Set automatically when a new person entity is created on first login
- Writing it with any `string` stores an invite instead, valid 24 hours; on an existing entity the value `send-invite` also emails the invite link to the entity's `email` (`400 No email` without one) — see [Users → Adding Users](/configuration/users/#adding-users)

### `entu_passkey`

- Stores a passkey's credential ID and public key — the private key never leaves the user's device
- Added by signing in with a passkey to accept an invite (including **Add Login Method** on one's own person), by automatic user creation or by creating a new database — never written directly; one entity can have several passkeys
- Can be deleted like any property value
- The same passkey can be stored in several databases, as one identity across Entu; a credential ID registered anywhere in Entu with another public key is refused

### `entu_api_key`

- Create the property with any `string` value (for example `{ "type": "entu_api_key", "string": "generate" }`) — Entu discards it and generates a cryptographically secure 32-character key
- The hash is stored; the plain key is returned only once, as `string` in the create response
- Only the entity's `_owner` or the entity itself can add it
- Multiple keys can exist on the same entity
