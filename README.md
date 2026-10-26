# B-dsh-LocalAndOnline-model-connection

**English** | [简体中文](README.zh.md)

One install for **local and online models** in DeepSeek Harness: run open-source GGUF models on
your own computer, and sign in to Claude Pro/Max or ChatGPT Plus/Pro from the same Models page.
The engine ships with the plugin.

> The GitHub repository keeps its original address (`ML-hub476/b-dsh-local-models`); the product
> name is now **B-dsh-LocalAndOnline-model-connection**.

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
git clone https://github.com/ML-hub476/b-dsh-local-models.git
cd b-dsh-local-models
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
(if you use the desktop app). Use whatever name appears here in the next command.

### 4. Install the plugin

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-dsh-local-and-online-model-connection"
```

Replace `web` with the name from step 3.

> Using the **desktop app** instead of npx? The command is
> `dsh plugin --profile desktop add "$PWD/packages/b-dsh-local-and-online-model-connection"`.

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

Use the same profile name as step 3.

Then open **Settings → Models**, find the **Anthropic** or **OpenAI Codex** card, and press
**Sign in** in the **B-1003** block. The sign-in happens on the provider's own page; the token
stays on this Mac in the Harness credential store. **Sign out** removes it.

Full details: [B-1003 README](packages/b-1003-ai-connection/README.md).

---

## Update to a newer version

If you installed the plugin from this repository folder:

```sh
cd b-dsh-local-models     # the folder you cloned
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
| Model answers slowly, computer swaps | Pick **Compact**, or choose a smaller model. |
| Plugin not listed after install | Restart the app (step 5); check the profile name in step 3. |
| No **B-1003** block on a provider card | The provider row is not saved in Models, or the installed pi-ai catalog offers no sign-in for it. Save the provider first; see the [B-1003 README](packages/b-1003-ai-connection/README.md). |
| B-1003 login page opens but never returns | The browser must be on this Mac for the automatic callback. Otherwise paste the code shown in the browser into the B-1003 block. |
| `cd: no such file or directory` | You are in the wrong folder. Run `cd ~` first, or find the clone with `find ~ -maxdepth 4 -type d -name "*local-models*"`. A ZIP download is usually named `b-dsh-local-models-main`. |

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
