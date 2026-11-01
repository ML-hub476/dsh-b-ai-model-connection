# B-1003 · AI Connection

**English** | [简体中文](README.zh.md)

Sign in to **Claude Pro/Max** and **ChatGPT Plus/Pro** from **Settings → Models**, using the
subscription you already pay for instead of copying an API key.

The card appears on every Models provider card whose installed pi-ai catalog offers a sign-in
flow — Anthropic and OpenAI Codex are the two this repository enables. The sign-in itself is run
by `@deepseek-ai/dsh-llm-pi-ai`; this package only adds the button, the questions, and the
sign-out action around it.

---

## What it adds

| Piece | What it does |
|---|---|
| **Host bridge** (`index.js`) | Small `/b-1003` endpoint that starts one provider-owned authorization flow, relays its notices and questions to the browser, and accepts the answers. |
| **Models card** (`client.js`) | A “B-1003” block on each OAuth-capable provider card: signed-in state, **which account** (email and plan), **Sign in**, the sign-in page link, device/paste codes, questions, and **Sign out**. |
| **Account lookup** (`lib/account.js`) | Turns the stored grant into the account it belongs to — email plus subscription tier — so “Signed in” says *who*. |
| **Bundle patch** (`cordis.patch.yml`) | Inserts the one row that mounts all of it. |

The token is written by the provider flow through the Harness credential seam at
`llm-pi-ai/<provider>`; **Sign out** deletes that record through the same seam. The account
lookup reads that record, and nothing else: the token goes into a request header and never into
a log line, an error message, or the card.

## Which account is signed in

The card answers the question the sign-in buttons cannot: **which** Claude or ChatGPT account
this Mac is spending. Two providers, two ways to find out.

| Provider | How the account is read | Cost |
|---|---|---|
| **ChatGPT / OpenAI Codex** | The stored grant is a JWT. Its claims already carry the email (`https://api.openai.com/profile`) and the plan (`https://api.openai.com/auth`.chatgpt_plan_type). | Local — no request. |
| **Claude / Anthropic** | The stored grant is an opaque `sk-ant-oat01-…` bearer token with no readable fields, so the plugin asks `GET https://api.anthropic.com/api/oauth/profile` — the same endpoint the Claude CLI calls for `/status`. | One HTTPS request, cached five minutes. |

Whatever comes back is shown under **Signed in as**: the address, then a plan chip such as
**Claude Pro**, **Claude Max**, **ChatGPT Plus**, or **ChatGPT Pro**. When the provider is signed
in but the account cannot be named, the card says why in a quiet line — a rejected token, a token
without the `user:profile` scope, an unreachable endpoint — instead of hiding the failure behind
a green dot.

---

## Requirements

- DeepSeek Harness with the Web/Desktop surface (tested on `0.1.5-rc.3`).
- `@deepseek-ai/dsh-llm-pi-ai` mounted (it is part of `dsh-base`), plus the `authorization` and
  `credentials` services and the Models settings page.
- A Claude Pro/Max or ChatGPT Plus/Pro account entitled to use the provider.
- The provider row saved in **Settings → Models**. The page only renders cards for saved rows;
  add `anthropic` or `openai-codex` there first if it is missing.

The plugin does not enable a provider route. If you want the provider selectable in the model
menu, add it in Models settings (or keep it in the profile's `llm-pi-ai.providers` as this
repository's desktop profile already does).

---

## Install

From this repository:

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1003-ai-connection"
```

Use `web` for a CLI-started Harness. In the desktop app, use its **Plugin Manager** page instead;
the `dsh` command line refuses the `desktop` profile. Restart the app if the plugin does not
appear immediately.

---

## Remove

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1003-ai-connection
```

Removing the plugin does not delete the saved sign-ins. Use **Sign out** in Settings → Models
first if you want them gone. In the desktop app, remove it from the Plugin Manager page instead;
the CLI refuses `desktop`. If B-1003 came with the one-install package, remove that package
instead.

---

## Use

1. Open **Settings → Models**.
2. Find the **Anthropic** or **OpenAI Codex** card.
3. Press **Sign in** in the **B-1003** block.
4. Press **Open the sign-in page**. Finish the provider's own login in the browser.
5. If the provider shows a code, type it into the block (or copy it from the page) and continue.
6. When the card says **Signed in**, pick a Claude or GPT model in the model menu.

**Sign out** removes the local sign-in. It does not cancel your subscription and does not revoke
the grant at the provider.

### What each state means

| State | Meaning |
|---|---|
| **Not signed in** | No credential record exists for this provider yet. |
| **Signed in** | A record exists at `llm-pi-ai/<provider>` and model requests use it. |
| **Signed in as `you@example.com`** | The record names its owner; the chip next to it is the plan. |
| **The saved sign-in was rejected** | The account could not be read: the token is expired or revoked. **Sign in again** refreshes it. |
| **Waiting for the provider…** | The flow is running; follow the link or answer the question shown. |
| **Save this provider first** | The card belongs to a draft provider that has not been saved. Apply the provider form, then sign in. |

---

## How it works

```
Settings → Models card
        │  fetch /b-1003/sign-in, /events, /answer, /cancel, /sign-out, /account
        ▼
B-1003 Host bridge (this package)
        │  ctx.authorization.begin({ method: 'oauth' })
        ▼
@deepseek-ai/dsh-llm-pi-ai  →  pi-ai provider login
        │  browser link, device code, paste-code question
        ▼
Harness credential store: llm-pi-ai/<provider>
```

One attempt runs at a time per provider. A second click while one is running reattaches to the
same attempt, so reloading the settings page does not lose the flow. An attempt that nobody
finishes is cancelled automatically after ten minutes.

---

## Troubleshooting

| Symptom | Try |
|---|---|
| No B-1003 block on a provider card | The provider is not saved, or the installed pi-ai catalog has no OAuth login for it. Save the provider first. |
| The login page opens, but the browser never returns | The browser must be on this Mac for the automatic `127.0.0.1` callback (Claude uses port `53692`, OpenAI Codex uses `1455`). If it is on another machine, paste the code shown in the browser instead. |
| “Address already in use” or a callback does not arrive | Another program is holding the callback port. Quit the other Claude/Codex CLI session and try again. |
| Sign-in finishes but requests still fail | Confirm the provider row is saved and enabled in Models; the route is separate from the credential. |
| “This Harness build has no authorization service” | The profile lacks the `authorization` row. Add it to the composition (the desktop app normally ships it). |
| Signed in, but no email under it | The token could not be read as an account. **Sign in again**; if the line says “may not read the account profile”, the token was minted without the `user:profile` scope and only a fresh subscription sign-in fixes it. |

---

## Test

The account lookup is tested without the network and without a sign-in:

```sh
node --test packages/b-1003-ai-connection/test/account.test.mjs
```

---

## License

MIT © Bing Dai

See the [root README](../../README.md) for the rest of the B packages.
