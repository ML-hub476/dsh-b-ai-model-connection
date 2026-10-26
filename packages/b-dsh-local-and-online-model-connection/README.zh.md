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
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-dsh-local-and-online-model-connection"
```

命令用 `web`。桌面版用户请用应用里的**插件管理**页；`dsh` 命令行会拒绝 `desktop` profile。
本地引擎还需要按根目录 README 做一次 `npm install node-llama-cpp`。

---

## 请用它替代三个包，而不是并存

Harness 的行 id 必须唯一。如果 B-1001、B-1002 或 B-1003 已经各自作为 bundle 安装，
请先移除它们，再安装本包，否则两组行会冲突。

安装本包后不需要再单独安装 B-1003；登录卡片已经包含在里面。

## 只想要其中一部分

| 你想要 | 安装 |
|---|---|
| 只要本地模型 | 分别安装 B-1001 与 B-1002 |
| 只要 Claude / ChatGPT 登录 | 单独安装 B-1003 |
| 本地 + 在线都要 | 本包 |

```sh
# 只要本地模型
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1001-local-engine"
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1002-local-models"

# 只要 Claude / ChatGPT
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1003-ai-connection"
```

不要把这些包和本包并存：这三行已经在本包里，行 id 会冲突。只装 B-1002 不装 B-1001 时，
卡片会提示引擎未安装。命令用 `web`；桌面版用户在**插件管理**页添加同样的包目录。

安装本包后，**设置 → 模型**页会同时出现 B-1001 引擎、B-1002 卡片，以及每张支持 OAuth 的
服务商卡片上的 B-1003 登录区块。

---

## 卸载

一条命令卸载整个包：

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-dsh-local-and-online-model-connection
```

这会移除安装包和全部三行。不能只从本包里删掉某一行：先卸载本包，再安装你想保留的部分。
命令使用 `pnpm`，所以 PATH 上必须有它。桌面版用户请在**插件管理**页移除；命令行会拒绝
`desktop`。

### 卸载后还会留下什么

- **登录记录**在 `~/.dsh/.credentials.yaml` 的 `llm-pi-ai/<provider>` 下。想删除的话，先在
  **设置 → 模型**里点**退出登录**，再卸载。
- **已下载的模型**在 `~/.dsh/local-engine/models`，需要手动删除。
- 配置里的 **`local-builtin` 服务商**可能还在；请在**设置 → 模型**里删掉它。
- 卸载后重启应用（或刷新页面）。

---

## 许可

MIT © Bing Dai

详细步骤见[根目录 README](../../README.zh.md)。
