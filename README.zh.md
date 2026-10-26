# B-dsh-LocalAndOnline-model-connection

[English](README.md) | **简体中文**

DeepSeek Harness 的**本地 + 在线**模型一次安装：在自己的电脑上运行开源 GGUF 模型，也可以在同一
个“设置 → 模型”页登录 Claude Pro/Max 或 ChatGPT Plus/Pro。
**不需要 Ollama、不需要 LM Studio、不需要 Python。** 引擎随插件一起安装。

> GitHub 仓库保留原来的地址（`ML-hub476/b-dsh-local-models`），产品名现在是
> **B-dsh-LocalAndOnline-model-connection**。

---

## 你会得到什么

| 编号 | 包 | 作用 |
|---|---|---|
| **B-1001** | `b-1001-local-engine` | 引擎：搜索 Hugging Face，把模型下载到 `~/.dsh/local-engine/models`，用 llama.cpp 在子进程中运行，并提供 OpenAI 兼容接口。 |
| **B-1002** | `b-1002-local-models` | “设置 → 模型”页上的卡片：引擎状态、模型列表、Hugging Face 搜索、本机 CPU/内存/磁盘、适配标记，以及带三个推荐下载的详情页。 |
| **B-1003** | `b-1003-ai-connection` | “设置 → 模型”页上的 Claude / ChatGPT 账号登录。给每张服务商卡片加上**登录**区块，令牌保存在 Harness 凭据库中。已包含在下面的安装包里。 |
| **B-dsh** | `b-dsh-local-and-online-model-connection` | 安装包：**一次装好 B-1001、B-1002 与 B-1003** —— **装这一个就够了**。 |

---

## 安装

大约十分钟。下面的命令都可以直接复制。

### 0. 确认有 Node.js 20 或更新版本

```sh
node -v
```

显示 `v20`、`v22`、`v24` 或更新就没问题。如果没有显示，去 <https://nodejs.org> 安装，然后重开一个终端。

### 0b. 还需要 `pnpm`

安装插件时用的是 pnpm。先确认：

```sh
pnpm -v
```

如果提示 *command not found*，任选一种方式装：

```sh
corepack enable pnpm      # Node 16.13+ 自带，不用下载
# 或者
brew install pnpm         # macOS 且有 Homebrew
# 或者
npm install -g pnpm       # 装完仍然找不到的话：
# echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

再运行一次 `pnpm -v`，能看到版本号才继续。

> **为什么需要这一步？** DeepSeek Harness 的 GitHub 仓库推荐用 `npx @deepseek-ai/dsh web` 运行。
> npm 只带来 Node 和 npx，**不带 pnpm**，而插件安装器会直接调用 `pnpm`。
> **桌面版**自带 pnpm，所以只有用 npm / GitHub 这种方式运行时才需要你自己装。
> 这不是说明写错了。

### 1. 取得本仓库

```sh
git clone https://github.com/ML-hub476/b-dsh-local-models.git
cd b-dsh-local-models
```

没有 git？打开仓库网页，点 **Code → Download ZIP**，解压后 `cd` 进解压出来的文件夹。

### 2. 安装引擎依赖 —— **这一步不能省**

```sh
npm install node-llama-cpp
```

这会下载适合你电脑的 llama.cpp 二进制（约 20 MB）。之所以要单独装，是因为插件是按“文件夹”安装的，
这种安装方式不会自动拉取它依赖的库。

### 3. 查出你的 profile 名字

```sh
ls ~/.dsh/profiles
```

一般是 `web`（用 `npx @deepseek-ai/dsh web` 启动时）或 `desktop`（用桌面版时）。
下一步命令里就填这里显示的名字。

### 4. 安装插件

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-dsh-local-and-online-model-connection"
```

把 `web` 换成第 3 步看到的名字。

> 用的是**桌面版**而不是 npx？命令是：
> `dsh plugin --profile desktop add "$PWD/packages/b-dsh-local-and-online-model-connection"`

### 5. 重启应用

在终端里按 `Ctrl+C` 停掉，然后重新启动：

```sh
npx @deepseek-ai/dsh web
```

### 6. 下载第一个模型

1. 打开网页，进入 **设置 → 模型**。
2. 找到 **B-1001 你自己的引擎**，先点 **启动引擎**（没有模型时它会提示，直接看第 3 步）。
3. 在 **在 Hugging Face 上查找模型** 里搜 `qwen3`。
4. 点开一个结果，选 **Quality / Balanced / Compact** 之一，点 **下载**。
5. 点 **使用**。
6. 在聊天框打开模型菜单，选中 **Local (built-in)** 下面的那个模型。

### 7. 可选：登录 Claude 或 ChatGPT（B-1003）

如果按第 4 步安装了安装包，**B-1003 已经包含在内**。这一步只适用于“只装本地模型”的安装，
或者只想单独要登录卡片、不装本地引擎的情况。

下面的命令会单独安装 B-1003。不要把它和第 4 步的安装包并存 —— 行 id 会冲突。

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1003-ai-connection"
```

profile 名字与第 3 步相同。

然后打开**设置 → 模型**，找到 **Anthropic** 或 **OpenAI Codex** 卡片，在 **B-1003** 区块里点
**登录**。登录在服务商自己的页面上完成；令牌只保存在这台 Mac 的 Harness 凭据库里。
**退出登录**会删除它。

完整说明见 [B-1003 README](packages/b-1003-ai-connection/README.zh.md)。

---

## 更新到新版本

如果插件是从本仓库文件夹安装的：

```sh
cd b-dsh-local-models     # 你克隆下来的那个文件夹
git pull
```

然后重启应用（`Ctrl+C`，再运行 `npx @deepseek-ai/dsh web`）。插件直接从这个文件夹运行，
所以拉一次代码就够了，不需要重新安装。

查看当前版本：

```sh
npx @deepseek-ai/dsh plugin --profile web list
```

如果以后发布到 npm，更新方式与安装时相同：

```sh
npx @deepseek-ai/dsh plugin --profile web add @ml-hub476/b-dsh-local-and-online-model-connection@latest
```

AI 连接包的更新方式相同：

```sh
npx @deepseek-ai/dsh plugin --profile web add @ml-hub476/b-1003-ai-connection@latest
```

## 适配标记怎么算

```
需要 = 文件大小 × 1.2 + 1.5 GB        （权重 + 上下文 + 安全余量）
需要 ≤ 内存的 70%  → 跑得动
需要 ≤ 内存的 90%  → 勉强够用
否则              → 太大了
```

每个模型详情页上的三个推荐含义：

| 标签 | 规则 |
|---|---|
| **Quality** | 这台电脑还能跑得动的最大文件 |
| **Balanced** | Q4 系列 —— 通常最划算 |
| **Compact** | 还能用、但最小的那个 |

---

## 常见问题

| 你看到的 | 怎么办 |
|---|---|
| `zsh: command not found: dsh` | 没有全局 `dsh` 命令是正常的，改用 `npx @deepseek-ai/dsh …`。 |
| `pnpm was not found` | 装 pnpm：`corepack enable pnpm`，或 `brew install pnpm`，或 `npm install -g pnpm`。用 `pnpm -v` 确认。 |
| `Cannot find package 'node-llama-cpp'` | 第 2 步没做。在仓库文件夹里运行 `npm install node-llama-cpp`。 |
| 引擎报错，里面出现 **code signature** 或 **Team IDs** | 你的 Node 是苹果签名的官方版。改用一个：`brew install node`，然后 `B1001_NODE=/opt/homebrew/bin/node npx @deepseek-ai/dsh web` 启动。 |
| 引擎一直没变成 **Running** | 先确认 `node -v` 是 20 以上；并且必须先下载一个模型。 |
| 回答很慢、电脑卡 | 换 **Compact**，或者选更小的模型。 |
| 装完看不到插件 | 按第 5 步重启；再核对第 3 步的 profile 名字。 |
| 服务商卡片上没有 **B-1003** 区块 | 模型页里这个服务商还没保存，或已安装的 pi-ai 目录没有它的登录流程。先保存服务商；详见 [B-1003 README](packages/b-1003-ai-connection/README.zh.md)。 |
| B-1003 登录页打开了但回不来 | 浏览器必须在这台 Mac 上才能自动回调。否则请把浏览器里显示的验证码粘贴进 B-1003 区块。 |
| `cd: no such file or directory` | 你不在克隆下来的那个文件夹里。先 `cd ~`，或用 `find ~ -maxdepth 4 -type d -name "*local-models*"` 找出它在哪；用 ZIP 下载解压的话，文件夹通常叫 `b-dsh-local-models-main`。 |

---

## 已知限制

- **只支持 GGUF**，不支持 MLX 和 Safetensors。
- **要求 PATH 上的 Node 能加载原生模块**。苹果签名的 Node 不行，macOS 上建议用 Homebrew 或 nvm 安装的 Node。
- **同时只能跑一个模型**，引擎把模型放在内存里。
- **能力标签是推断出来的**。Hugging Face 并不标注“工具调用”和“推理”，所以这些标签来自仓库名和 tag，详情页也写明了这一点。
- **订阅登录取决于服务商**。B-1003 只能提供已安装 pi-ai 目录里带的流程，服务商也可能随时修改或撤回它们。

---

## 目录结构

```
packages/
  b-1001-local-engine/                        引擎（仅 Host）
  b-1002-local-models/                        卡片（仅 Client）
  b-1003-ai-connection/                       Claude / ChatGPT 登录卡片与 Host 桥
  b-dsh-local-and-online-model-connection/    一次装好三者的安装包
```

## 许可

MIT —— 见 [LICENSE](LICENSE)。
