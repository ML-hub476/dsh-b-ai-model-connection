# B-1001 · 本地引擎

[English](README.md) | **简体中文**
在 Hugging Face 上查找 GGUF 模型，下载到自己的目录，在子进程中运行，并提供 OpenAI 兼容接口，
Harness 可以像任何其他服务商一样接入。无需任何外部依赖。

## 它能做什么

| 步骤 | 接口 |
|---|---|
| 搜索模型 | `GET /local-engine/hub/search?q=` |
| 查看文件 | `GET /local-engine/hub/detail?repo=` |
| 下载 | `POST /local-engine/hub/download` `{repo,file}`，支持断点续传与进度 |
| 保存 | `~/.dsh/local-engine/models` |
| 运行 | `POST /local-engine/use` `{file}` |
| 出现在菜单 | 注册 `local-builtin` 路由 |
| 设为默认 | `POST /local-engine/default` `{}` |

其他接口：`GET /state`、`POST /start`、`POST /stop`、`GET /models`、`GET /system`。

## 为什么用子进程

Harness 自带的是经过加固运行时的 Node（带 Apple 签名），macOS 不允许加载其他签名的原生模块。
因此 llama.cpp 必须在单独的 Node 进程中运行（自动从 PATH 查找，可用 `B1001_NODE` 指定）。
顺便也隔离了模型崩溃。

## 配置

| 键 | 含义 |
|---|---|
| `modelPath` | `.gguf` 的绝对路径，支持 `~/`；留空则只挂载不启动 |
| `contextSize` | 上下文长度，默认 8192 |
| `port` | 固定端口，默认 18111，保证写好的路由在重启后依然有效 |
| `displayName` | 模型菜单中显示的名称 |

## 单独安装

B-1001 是纯 Host 插件：它启动引擎并注册 `local-builtin` 路由，但没有自己的界面卡片。
只想要接口、不需要设置页时，单独安装它：

安装前，打开本包的 `cordis.patch.yml`，把 `modelPath` 改成你自己的 `.gguf`；也可以留空，
之后通过 B-1002 下载。本仓库的默认值指向作者的模型文件，如果那台机器上没有这个路径，请替换。

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1001-local-engine"
```

这条命令用于命令行启动的 `web` profile。桌面版用户请用应用里的**插件管理**页；
`dsh` 命令行会拒绝 `desktop` profile。

## 卸载

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1001-local-engine
```

卸载会停止引擎。配置里的 `local-builtin` 条目可能还在；请在**设置 → 模型**里删掉它。
已下载的模型仍留在 `~/.dsh/local-engine/models`，需要手动删除。桌面版用户请在**插件管理**页
移除；命令行会拒绝 `desktop`。如果 B-1001 是随“一次安装包”装上的，请卸载那个包 ——
只要包拥有这一行，就不能单独删掉它。

## 许可

MIT © Bing Dai

详细步骤（含怎么找到路径）见[根目录 README](../../README.zh.md#安装)。
