# B-dsh-LocalAndOnline-model-connection

**English** | [简体中文](README.zh.md)

One install for **local and online models** in DeepSeek Harness. This package owns the rows of:

- **B-1001** — the local engine that runs a GGUF model in a child process;
- **B-1002** — the **Settings → Models** card for that engine;
- **B-1003** — the Claude / ChatGPT account sign-in card;

and depends on all three.

It is the family installer. Use it instead of installing the three numbered packages separately.

---

## What it installs

| Code | Inside this package | What it does |
|---|---|---|
| **B-1001** | `b-1001-local-engine` | Runs a downloaded GGUF model with llama.cpp and serves an OpenAI-compatible endpoint. |
| **B-1002** | `b-1002-local-models` | Engine status, model shelf, Hugging Face search, fit marks, and first download. |
| **B-1003** | `b-1003-ai-connection` | Sign in to Claude Pro/Max or ChatGPT Plus/Pro from the provider card; sign out removes the local record. |

The patch that this package installs:

```yaml
- insert:
    - id: b-1001-local-engine
      name: '@ml-hub476/b-1001-local-engine'
    - id: b-1002-local-models
      name: '@ml-hub476/b-1002-local-models'
    - id: b-1003-ai-connection
      name: '@ml-hub476/b-1003-ai-connection'
```

---

## Install

From this repository:

```sh
npx @deepseek-ai/dsh plugin --profile desktop add "$PWD/packages/b-dsh-local-and-online-model-connection"
```

Use the profile name that `ls ~/.dsh/profiles` shows (`desktop` for the desktop app, `web` for
`npx @deepseek-ai/dsh web`). For the local engine, also follow the root README's
`npm install node-llama-cpp` step once.

---

## Use it instead of the three, not beside them

A Harness row id must be unique. If B-1001, B-1002, or B-1003 are already installed as their own
bundles, remove them first, then install this package — otherwise the two sets of rows collide.

You do not need to install B-1003 separately when this package is installed; the sign-in card is
already part of it.

## Choosing only one part

| You want | Install |
|---|---|
| Local models only | B-1001 and B-1002, or this package and ignore B-1003 |
| Claude / ChatGPT sign-in only | B-1003 alone |
| Local **and** online | this package |

When this package is installed, **Settings → Models** shows all three: the B-1001 engine, the
B-1002 card, and the B-1003 sign-in block on each OAuth-capable provider card.

---

## License

MIT © Bing Dai

See the [root README](../../README.md) for the step-by-step version.
