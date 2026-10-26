# B-dsh-LocalAndOnline-model-connection

**English** | [简体中文](README.zh.md)

One install for **local and online models** in DeepSeek Harness: run open-source GGUF models on
your own computer, and sign in to Claude Pro/Max or ChatGPT Plus/Pro from the same Models page.
The engine ships with the plugin.

> Repository: [ML-hub476/dsh-b-ai-model-connection](https://github.com/ML-hub476/dsh-b-ai-model-connection).
> The product name is **B-dsh-LocalAndOnline-model-connection**.

---

## What you get

| Code | Package | What it does |
|---|---|---|
| **B-1001** | `b-1001-local-engine` | The engine. Searches Hugging Face, downloads models into `~/.dsh/local-engine/models`, runs them with llama.cpp in a child process, and serves an OpenAI-compatible endpoint. |
| **B-1002** | `b-1002-local-models` | The card on **Settings → Models**. Engine status, your model shelf, Hugging Face search, your computer's CPU/memory/disk, fit marks, and a detail page with three suggested downloads. |
| **B-1003** | `b-1003-ai-connection` | Claude / ChatGPT account sign-in on **Settings → Models**. Adds the **Sign in** block to each provider card and keeps the token in the Harness credential store. Included by the package below. |
| **B-dsh** | `b-dsh-local-and-online-model-connection` | The package. Installs **B-1001, B-1002, and B-1003 in one step** — **install this one**. |

---

## Install

Takes about ten minutes. Every command below is meant to be copied as-is.

### 0. Check you have Node.js 20 or newer

```sh
node -v
```

If that prints `v20`, `v22`, `v24` or newer, you are fine. If it prints nothing, install Node from
<https://nodejs.org> and open a new terminal.

### 0b. You also need `pnpm`

The installer uses pnpm to add plugins. Check it:

```sh
pnpm -v
```

If that says *command not found*, install it — any one of these works:

```sh
corepack enable pnpm      # comes with Node 16.13+, nothing to download
# or
brew install pnpm         # macOS with Homebrew
# or
npm install -g pnpm       # then if it is still not found:
# echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

Run `pnpm -v` again; it must print a version before you continue.

> **Why is this needed?** The DeepSeek Harness GitHub repository tells you to run it with
> `npx @deepseek-ai/dsh web`. npm brings Node and npx, but it does not bring pnpm — and the plugin
> installer calls `pnpm` directly. The **desktop app** ships its own pnpm, so this step only appears
> when you run Harness the npm / GitHub way. It is not a mistake in the instructions.

### 1. Get this repository

```sh
git clone https://github.com/ML-hub476/dsh-b-ai-model-connection.git
cd dsh-b-ai-model-connection
```

No git? Open the repository page, press **Code → Download ZIP**, unzip it, then `cd` into the
unzipped folder instead.

### 2. Install the engine library — **do not skip this**

```sh
npm install node-llama-cpp
```

This downloads the llama.cpp binary for your computer (about 20 MB). It is a separate step because
the plugin is installed from a folder, and a folder install does not pull its dependencies.

### 3. Find your profile name

```sh
ls ~/.dsh/profiles
```

You will usually see `web` (if you start the app with `npx @deepseek-ai/dsh web`) or `desktop`
(if you use the desktop app). The commands below use `web`; desktop app users use the app's
**Plugin Manager** page instead.

### 4. Install the plugin

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-dsh-local-and-online-model-connection"
```

Replace `web` with the name from step 3 when it is a CLI-started profile. If step 3 showed
`desktop`, use the desktop app's **Plugin Manager** page instead — the `dsh` command line refuses
the `desktop` profile because the Electron application owns it.

### 5. Restart the app

Stop the running terminal with `Ctrl+C`, then start it again:

```sh
npx @deepseek-ai/dsh web
```

### 6. Download your first model

1. Open the web page and go to **Settings → Models**.
2. Find **B-1001 Your own engine** and press **Start engine** (it needs one model first, so skip
   to step 3 if it says there is no model).
3. In **Find models on Hugging Face**, search `qwen3`.
4. Open a result, choose **Quality**, **Balanced** or **Compact**, and press **Download**.
5. Press **Use**.
6. In the chat box, open the model menu and pick the model under **Local (built-in)**.

### 7. Optional: sign in to Claude or ChatGPT (B-1003)

B-1003 is **already included** when you installed the package in step 4. This step is only for a
local-models-only install, or for someone who wants the sign-in card without the local engine.

The command below installs B-1003 on its own. Do not run it beside the package from step 4 — the
row ids would collide.

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1003-ai-connection"
```

Use `web` (or your non-desktop profile name). In the desktop app, use the Plugin Manager page
instead of this command.

Then open **Settings → Models**, find the **Anthropic** or **OpenAI Codex** card, and press
**Sign in** in the **B-1003** block. The sign-in happens on the provider's own page; the token
stays on this Mac in the Harness credential store. **Sign out** removes it.

Full details: [B-1003 README](packages/b-1003-ai-connection/README.md).

---

## Install only one part

The one-install package is the easiest. If you only want part of it, install the packages you
need instead — **never beside the one-install package**, because two rows with the same id collide.

| You want | Install | What you get |
|---|---|---|
| Local models only | B-1001 + B-1002 | The engine and its Models card |
| Claude / ChatGPT only | B-1003 | The account sign-in block, no local engine |
| Local engine without the card | B-1001 | A running endpoint and the `local-builtin` route, no UI |
| Everything | the one-install package | All three rows |

```sh
# Local models only
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1001-local-engine"
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1002-local-models"

# Claude / ChatGPT only
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1003-ai-connection"
```

These commands target the `web` profile. In the desktop app, add the same package folders from its
**Plugin Manager** page. B-1002 without B-1001 shows a card that says the engine is not installed.
B-1001 alone has no UI, so set `modelPath` in `packages/b-1001-local-engine/cordis.patch.yml` to
your own `.gguf`, or leave it empty and download a model through B-1002.

---

## Uninstall

Remove the one-install package:

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-dsh-local-and-online-model-connection
```

That removes the package and its three rows. If you installed the parts separately, remove them
one by one:

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1003-ai-connection
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1002-local-models
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1001-local-engine
```

The command needs `pnpm` on your PATH (step 0b). If the one-install package is what you have, you
cannot remove just one row from it: remove the package, then install the parts you want to keep.
These commands target the `web` profile; in the desktop app, remove the bundle from its **Plugin
Manager** page — the CLI refuses the `desktop` profile.

### What stays behind

- **Sign-ins** live in `~/.dsh/.credentials.yaml` under `llm-pi-ai/<provider>`. Use **Sign out**
  in Settings → Models before removing B-1003 if you want them deleted.
- **Downloaded models** live in `~/.dsh/local-engine/models`; delete them manually.
- The **`local-builtin` provider** may remain in the profile's `llm-pi-ai` config after B-1001 is
  removed; remove it in Settings → Models.
- Restart the app (or refresh the page) after removing.

---

## Update to a newer version

If you installed the plugin from this repository folder:

```sh
cd dsh-b-ai-model-connection     # the folder you cloned
git pull
```

Then restart the app (`Ctrl+C`, then `npx @deepseek-ai/dsh web`). The plugin runs straight from
that folder, so a pull is all it takes — there is no package to reinstall.

Check which version you are running:

```sh
npx @deepseek-ai/dsh plugin --profile web list
```

If a future version is published to npm, update it the same way you installed it:

```sh
npx @deepseek-ai/dsh plugin --profile web add @ml-hub476/b-dsh-local-and-online-model-connection@latest
```

The AI connection package updates the same way:

```sh
npx @deepseek-ai/dsh plugin --profile web add @ml-hub476/b-1003-ai-connection@latest
```

## How the fit marks work

```
need = file size × 1.2 + 1.5 GB        (weights + context + a safety margin)
need ≤ 70% of memory  → Fits well
need ≤ 90% of memory  → Tight fit
otherwise             → Too big
```

The three suggestions on each model page mean:

| Label | Rule |
|---|---|
| **Quality** | the largest file that still runs on this computer |
| **Balanced** | the Q4 family — the usual sweet spot |
| **Compact** | the smallest file still worth running |

---

## Troubleshooting

| What you see | What to do |
|---|---|
| `zsh: command not found: dsh` | There is no global `dsh` command. Use `npx @deepseek-ai/dsh …` instead. |
| `pnpm was not found: install pnpm and make it available on PATH` | Install pnpm: `corepack enable pnpm`, or `brew install pnpm`, or `npm install -g pnpm`. Confirm with `pnpm -v`. |
| `Cannot find package 'node-llama-cpp'` | Step 2 was skipped. Run `npm install node-llama-cpp` in the repository folder. |
| Engine says *error*, message mentions **code signature** or **Team IDs** | Your Node is the official signed build. Install a different one: `brew install node`, then start with `B1001_NODE=/opt/homebrew/bin/node npx @deepseek-ai/dsh web`. |
| Engine never says **Running** | Check `node -v` is 20+. A model has to be downloaded before the engine can start. |
| Engine will not start after renaming or moving the repo folder | Restart the app, or toggle B-1001 off and on in the Plugin Manager, so the engine reloads the new `worker.mjs` path. The card may show only `Node.js v24.19.0`; that is the last line of Node's “cannot find worker” crash, not a model problem. |
| Model answers slowly, computer swaps | Pick **Compact**, or choose a smaller model. |
| Plugin not listed after install | Restart the app (step 5); check the profile name in step 3. |
| No **B-1003** block on a provider card | The provider row is not saved in Models, or the installed pi-ai catalog offers no sign-in for it. Save the provider first; see the [B-1003 README](packages/b-1003-ai-connection/README.md). |
| B-1003 login page opens but never returns | The browser must be on this Mac for the automatic callback. Otherwise paste the code shown in the browser into the B-1003 block. |
| `cd: no such file or directory` | You are in the wrong folder. Run `cd ~` first, or find the clone with `find ~ -maxdepth 4 -type d -name "dsh-b-ai-model-connection*"`. A ZIP download is usually named `dsh-b-ai-model-connection-main`. |

---

## Known limitations

- **GGUF only.** MLX and Safetensors are not supported.
- **A Node on `PATH` is required** that can load native modules. Apple's signed builds cannot, so
  Homebrew or nvm Node is the reliable choice on macOS.
- **One model at a time.** The engine holds a single model in memory.
- **Capabilities are inferred.** Hugging Face does not label "tool use" or "reasoning", so those
  chips come from the repository name and tags, and the detail page says so.
- **Subscription sign-in depends on the provider.** B-1003 can only offer the flows the installed
  pi-ai catalog ships, and the provider can change or withdraw them at any time.

---

## Layout

```
packages/
  b-1001-local-engine/                        the engine (host only)
  b-1002-local-models/                        the card (client only)
  b-1003-ai-connection/                       Claude / ChatGPT sign-in card and Host bridge
  b-dsh-local-and-online-model-connection/    the package that installs all three
```

## License

MIT — see [LICENSE](LICENSE).
