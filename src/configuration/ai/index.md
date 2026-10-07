---
description: "Entu AI is a built-in chat assistant — ask in plain language to explore data or set up entities, properties, and formulas; changes apply once you confirm."
---

# Entu AI

Entu AI is a chat assistant built into the Entu app. Open it with the **sparkles button** in the toolbar — it is available to signed-in users. The assistant knows your account's current configuration — entity types and their property definitions — so you can ask questions about it and describe changes in plain language instead of clicking through configuration screens.

## What It Can Do

- **Answer configuration questions** — "Which properties does `person` have?", "Which entity types reference `project`?"
- **Answer data questions** — search entities, read their values and change history, and fetch file download links, all within your rights
- **Propose configuration changes** — create entity types, add or change property definitions, including [formula](/api/formulas/) properties
- **Propose data changes** — create or update data entities, or delete individual property values

## Reviewing and Applying Changes

The assistant never applies changes on its own. When it suggests changes, it shows a **Proposed changes** list where each operation is described in plain language. Review the list, then click **Apply changes** to execute the operations — or **Cancel** to discard them. Nothing happens in your database until you click Apply. Sending a new message while changes are waiting declines them.

Operations are executed in order, and each one gets a status: **applied**, **failed**, or **skipped**. If an operation fails (for example due to insufficient rights), execution stops — operations before it are already applied, and the remaining ones are skipped.

::: warning
Applying is not all-or-nothing. If an operation in the middle of the list fails, the operations before it have already been applied and are not rolled back. Check the per-operation status to see what went through.
:::

The full flow — using "create an entity type for books" as an example:

![Entu AI flow: a read-only chat turn assembles a proposal, the user reviews it, and only after Apply are the operations validated and saved with the user's rights](/entu-ai-flow.svg)

## Permissions

Entu AI runs entirely with your own rights. It can only see what you can see and change what you could change manually — it does not grant any extra access. If you lack rights for a proposed operation, that operation fails on apply.

## Limits

- Each database has a monthly AI token allowance — 100,000 tokens unless a different limit is set for the database. When it is used up, Entu AI answers with `Tokens limit reached` until the next month.
- One message can be up to 8,000 characters, and only the latest 40 messages of the conversation are sent to the assistant.
- One proposal can hold up to 25 operations.
- System entity type definitions can't be changed through Entu AI.

## Privacy

Conversations are not stored on the server — they live only in your open browser tab. Closing the chat panel keeps the conversation; it is cleared when you click **New chat**, switch to another database, or reload the page.

## Example Prompts

- *"I need to store library info — books and lendings. Set up the needed entities."*
- *"Add birthyear property to person"*
- *"Add invoice total field calculated from invoice rows"*

::: tip
Integrating with the assistant programmatically? See the [AI Assistant API](/api/ai/) for the underlying endpoints.
:::
