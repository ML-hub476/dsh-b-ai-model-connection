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
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-dsh-local-and-online-model-connection"
```

Use `web` for a CLI-started Harness. In the desktop app, use its **Plugin Manager** page instead;
the `dsh` command line refuses the `desktop` profile. For the local engine, also follow the root
README's `npm install node-llama-cpp` step once.

---

## Use it instead of the three, not beside them

A Harness row id must be unique. If B-1001, B-1002, or B-1003 are already installed as their own
bundles, remove them first, then install this package — otherwise the two sets of rows collide.

You do not need to install B-1003 separately when this package is installed; the sign-in card is
already part of it.

## Choosing only one part

| You want | Install |
|---|---|
| Local models only | B-1001 and B-1002, installed separately |
| Claude / ChatGPT sign-in only | B-1003 alone |
| Local **and** online | this package |

```sh
# Local models only
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1001-local-engine"
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1002-local-models"

# Claude / ChatGPT only
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1003-ai-connection"
```

Do not install these beside this package: the three rows already exist here and the ids would
collide. B-1002 without B-1001 shows a card that says the engine is not installed. These commands
target the `web` profile; in the desktop app, add the same folders from the Plugin Manager page.

When this package is installed, **Settings → Models** shows all three: the B-1001 engine, the
B-1002 card, and the B-1003 sign-in block on each OAuth-capable provider card.

---

## Uninstall

Remove the whole package with one command:

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-dsh-local-and-online-model-connection
```

That removes the package and all three rows. You cannot remove just one row from inside this
package: remove it, then install the parts you want to keep. The command uses `pnpm`, so it must
be on your PATH. In the desktop app, remove the bundle from the Plugin Manager page instead; the
CLI refuses `desktop`.

### What stays behind

- **Sign-ins** are stored in `~/.dsh/.credentials.yaml` under `llm-pi-ai/<provider>`. Use
  **Sign out** in Settings → Models before removing if you want them deleted.
- **Downloaded models** are in `~/.dsh/local-engine/models`; delete them manually.
- The **`local-builtin` provider** may remain in the profile's `llm-pi-ai` config; remove it in
  Settings → Models if you want a clean configuration.
- Restart the app (or refresh the page) after removing.

---

## License

MIT © Bing Dai

See the [root README](../../README.md) for the step-by-step version.
