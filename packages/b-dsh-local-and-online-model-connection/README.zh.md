# B-dsh-LocalAndOnline-model-connection

[English](README.md) | **简体中文**

DeepSeek Harness 的**本地 + 在线**模型一次安装。本包拥有以下三行：

- **B-1001** —— 在子进程中运行 GGUF 模型的本地引擎；
- **B-1002** —— **设置 → 模型**页上的引擎卡片；
- **B-1003** —— Claude / ChatGPT 账号登录卡片；

并依赖这三个包。

它是家族安装包。请用它替代分别安装三个编号包。

---

## 它安装了什么

| 编号 | 包内包含 | 作用 |
|---|---|---|
| **B-1001** | `b-1001-local-engine` | 用 llama.cpp 运行下载好的 GGUF 模型，并提供 OpenAI 兼容接口。 |
| **B-1002** | `b-1002-local-models` | 引擎状态、模型列表、Hugging Face 搜索、适配标记和第一次下载。 |
| **B-1003** | `b-1003-ai-connection` | 在服务商卡片上登录 Claude Pro/Max 或 ChatGPT Plus/Pro；退出登录只删除本机记录。 |

本包安装的补丁：

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

## 安装

在本仓库里运行：

```sh
npx @deepseek-ai/dsh plugin --profile desktop add "$PWD/packages/b-dsh-local-and-online-model-connection"
```

把 `desktop` 换成 `ls ~/.dsh/profiles` 显示的名字（桌面应用是 `desktop`，
`npx @deepseek-ai/dsh web` 是 `web`）。本地引擎还需要按根目录 README 做一次
`npm install node-llama-cpp`。

---

## 请用它替代三个包，而不是并存

Harness 的行 id 必须唯一。如果 B-1001、B-1002 或 B-1003 已经各自作为 bundle 安装，
请先移除它们，再安装本包，否则两组行会冲突。

安装本包后不需要再单独安装 B-1003；登录卡片已经包含在里面。

## 只想要其中一部分

| 你想要 | 安装 |
|---|---|
| 只要本地模型 | B-1001 与 B-1002，或本包但不使用 B-1003 |
| 只要 Claude / ChatGPT 登录 | 单独安装 B-1003 |
| 本地 + 在线都要 | 本包 |

安装本包后，**设置 → 模型**页会同时出现 B-1001 引擎、B-1002 卡片，以及每张支持 OAuth 的
服务商卡片上的 B-1003 登录区块。

---

## 许可

MIT © Bing Dai

详细步骤见[根目录 README](../../README.zh.md)。
