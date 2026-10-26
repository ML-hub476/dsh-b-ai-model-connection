# B-1001 · Local Engine

**English** | [简体中文](README.zh.md)
Finds a GGUF model on Hugging Face, downloads it into its own folder, runs it in a child
process, and serves an OpenAI-compatible endpoint the Harness reaches like any provider.

Nothing external is required.

## What it does

| Step | Where |
|---|---|
| Search models | `GET /local-engine/hub/search?q=` → Hugging Face GGUF repositories |
| Pick a file | `GET /local-engine/hub/files?repo=` → files, license, recommended quant |
| Download | `POST /local-engine/hub/download` `{repo,file}` → resumable, with progress |
| Store | `~/.dsh/local-engine/models` |
| Run | `POST /local-engine/use` `{file}` → restarts the engine on that model |
| Be selectable | registers the `local-builtin` route in `llm-pi-ai` |
| Set default | `POST /local-engine/default` `{}` |

Other routes: `GET /state`, `POST /start`, `POST /stop`, `GET /models`, `GET /system`.

## Why a child process

The Harness ships a hardened-runtime Node signed by DeepSeek. macOS refuses to load a native
addon signed by anyone else, so llama.cpp cannot run inside the Host process. The worker runs
under a separate Node found on `PATH` (override with `B1001_NODE`). That also keeps a model
crash away from your session.

## Configuration

| Key | Meaning |
|---|---|
| `modelPath` | absolute path to a `.gguf`; `~/` is expanded. Empty = mount without starting |
| `contextSize` | context window in tokens (default 8192) |
| `port` | fixed listen port (default 18111) so a written route survives restarts |
| `displayName` | label in the model menu |

## Install alone

B-1001 is a Host-only plugin: it starts the engine and registers the `local-builtin` route, but
it has no card of its own. Install it alone when you want the endpoint without the Settings page.

Before installing, open this package's `cordis.patch.yml` and set `modelPath` to your own `.gguf`,
or to `''` and download a model later through B-1002. This repository's default points at the
author's model file; replace it if that path is not on your machine.

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1001-local-engine"
```

This command targets a CLI-started `web` profile. In the desktop app, use its **Plugin Manager**
page instead; the `dsh` command line refuses the `desktop` profile.

## Remove

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1001-local-engine
```

Removing it stops the engine. The `local-builtin` entry may remain in the profile's `llm-pi-ai`
config; remove it in Settings → Models. Downloaded models stay in `~/.dsh/local-engine/models`
unless you delete them. In the desktop app, remove it from the Plugin Manager page instead; the
CLI refuses `desktop`. If B-1001 was installed by the one-install package, remove that package
instead — you cannot remove this row on its own while the package owns it.

## If the engine stops starting

If you renamed or moved this repository folder while the app was running, the engine may still
point at the old `worker.mjs` path. Restart the app, or toggle B-1001 off and on in the Plugin
Manager, then press **Start engine** again. The model files and downloads are untouched.

A card that shows only `Node.js v24.19.0` is showing the last line of that crash, not a model
problem.

## License

MIT © Bing Dai

See the [root README](../../README.md#install) for the step-by-step version, including how to find the path.
