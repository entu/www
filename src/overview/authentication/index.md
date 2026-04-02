# Authentication

Entu supports several ways to sign in. Each is tied to your **person entity** — the record in the database that represents you. You can use multiple sign-in methods on the same account.

::: info No passwords
Entu never stores passwords. Authentication is handled entirely through social login providers or passkeys — there is no password to set, forget, or leak.
:::

## Social Login

Social login lets you sign in without a password by using an identity provider you already trust. Entu sends you to the provider's login page, and once you confirm your identity there, you are signed in. Social login is powered by [OAuth.ee](https://oauth.ee).

### Email

Sign in with a magic link sent to your email address. No password required — click the link in the email and you are in. The link is short-lived and single-use, so your account stays secure even if someone else sees the email later. Works with any email address.

### Google

Use your existing Google account to sign in. If you are already signed into Google in your browser, the process is instant — one click and you are in. Entu never sees your Google password.

### Apple

Sign in with your Apple ID. Apple gives you the option to hide your real email address and use a private relay address instead. Entu works with both — what matters is that the same address is used consistently. Requires an Apple ID with two-factor authentication enabled.

### Smart-ID

Smart-ID is a mobile app used across the Baltic states and Central Europe for strong electronic identification. After entering your personal code, you confirm the login in the Smart-ID app on your phone. Provides a legally recognised electronic identity in Estonia, Latvia, and Lithuania.

### Mobile-ID

Mobile-ID uses a special SIM card issued by mobile operators in Estonia and Lithuania to authenticate you. You confirm the login by entering a PIN on your phone. No separate app is needed — authentication happens on the SIM level. Provides a legally recognised electronic identity.

### ID Card

Sign in using a national ID card (or e-Residency card) with a card reader. Entu reads your identity from the chip on the card after you enter your PIN. Provides the highest assurance level of electronic identity in Estonia.

## Passkeys

Passkeys are a modern alternative to passwords — faster, phishing-resistant, and no secrets to remember or leak. Your device creates a unique cryptographic key pair: the private key never leaves your device, and Entu only stores the public key.

When you sign in, your device confirms your identity using whatever it normally uses to unlock — Face ID, Touch ID, Windows Hello, a fingerprint scanner, or a hardware security key like a YubiKey. Nothing is typed and nothing can be intercepted.

Passkeys sync across your devices through your platform's keychain (iCloud Keychain on Apple devices, Google Password Manager on Android, or a password manager that supports passkeys). You can register multiple passkeys — one per device — on the same account. Passkeys are managed from your person entity in the Entu UI.

**Best for:** Frequent users who want the fastest and most secure sign-in experience.

## API Key

API keys let you access Entu programmatically without going through an interactive sign-in flow. They are long-lived credentials suited for scripts, automations, integrations, and any situation where a human is not present to click through a login page.

Generate an API key from your person entity in the Entu UI. The key is shown only once — copy it and store it somewhere safe, because Entu only keeps the hash and cannot show it again. You can generate multiple keys and delete individual ones when they are no longer needed.

**Best for:** Developers, backend services, CI/CD pipelines, IoT devices, and any automated system that needs to read or write data in Entu. See [API → Authentication](/api/authentication/) for how to use keys with the API.
