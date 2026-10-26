# B-1003 · AI 连接

[English](README.md) | **简体中文**

在**设置 → 模型**页直接登录 **Claude Pro/Max** 与 **ChatGPT Plus/Pro**，用你已经付费的订阅，
不用再复制 API 密钥。

只要已安装的 pi-ai 目录里某个服务商带有登录流程，它的模型卡片上就会出现这张 B-1003 卡片；
本仓库默认打开的是 Anthropic 与 OpenAI Codex。登录本身由
`@deepseek-ai/dsh-llm-pi-ai` 执行，本包只补上按钮、提问和退出登录。

---

## 它补了什么

| 部分 | 作用 |
|---|---|
| **Host 桥**（`index.js`） | 一个很小的 `/b-1003` 接口：启动一次服务商自己的授权流程，把提示和问题转给浏览器，再接收回答。 |
| **模型卡片**（`client.js`） | 每张支持 OAuth 的服务商卡片上的 “B-1003” 区块：登录状态、**登录**、登录页链接、设备码/粘贴码、问题、**退出登录**。 |
| **组合包补丁**（`cordis.patch.yml`） | 插入一行，同时挂载上面两半。 |

本包不读取、不写入、也不记录令牌。令牌由服务商的登录流程通过 Harness 凭据层写入
`llm-pi-ai/<provider>`；**退出登录**也通过同一层删除这条记录。

---

## 前提

- 带 Web/桌面界面的 DeepSeek Harness（在 `0.1.5-rc.3` 上测试）。
- 已挂载 `@deepseek-ai/dsh-llm-pi-ai`（`dsh-base` 自带），以及 `authorization`、`credentials`
  两个服务和“模型”设置页。
- 一个有权使用该服务商的 Claude Pro/Max 或 ChatGPT Plus/Pro 账号。
- 该服务商已经在**设置 → 模型**里保存过。页面只渲染已保存的行；如果没有，请先在
  模型页添加 `anthropic` 或 `openai-codex`。

本插件不会替你启用服务商路由。若要在模型菜单里选到它，请在模型设置里添加，或像本仓库的
桌面配置那样在 `llm-pi-ai.providers` 里保留它。

---

## 安装

在本仓库里运行：

```sh
npx @deepseek-ai/dsh plugin --profile desktop add "$PWD/packages/b-1003-ai-connection"
```

把 `desktop` 换成 `ls ~/.dsh/profiles` 显示的名字（桌面应用是 `desktop`，
`npx @deepseek-ai/dsh web` 是 `web`）。如果没有立刻出现，重启应用。

---

## 使用

1. 打开**设置 → 模型**。
2. 找到 **Anthropic** 或 **OpenAI Codex** 卡片。
3. 在 **B-1003** 区块里点**登录**。
4. 点**打开登录页**，在浏览器里完成服务商自己的登录。
5. 如果页面给出验证码，把它填进区块（或从页面复制）再继续。
6. 卡片显示**已登录**后，在模型菜单里选择 Claude 或 GPT 模型。

**退出登录**只删除本机记录，不会取消订阅，也不会在服务商那边撤销授权。

### 状态说明

| 状态 | 含义 |
|---|---|
| **未登录** | 这个服务商还没有凭据记录。 |
| **已登录** | `llm-pi-ai/<provider>` 记录存在，模型请求会使用它。 |
| **正在等待服务商…** | 流程正在运行；请按提示打开链接或回答问题。 |
| **请先保存这个服务商** | 这是还没保存的草稿卡片。先应用服务商表单，再登录。 |

---

## 工作原理

```
设置 → 模型卡片
        │  fetch /b-1003/sign-in、/events、/answer、/cancel、/sign-out
        ▼
B-1003 Host 桥（本包）
        │  ctx.authorization.begin({ method: 'oauth' })
        ▼
@deepseek-ai/dsh-llm-pi-ai  →  pi-ai 服务商登录
        │  浏览器链接、设备码、粘贴码提问
        ▼
Harness 凭据库：llm-pi-ai/<provider>
```

每个服务商同一时间只跑一次登录。运行中再点一次会接回同一次尝试，所以刷新设置页不会丢掉
进度。十分钟内没人完成的尝试会自动取消。

---

## 排错

| 现象 | 可以试试 |
|---|---|
| 服务商卡片上没有 B-1003 区块 | 服务商没有保存，或已安装的 pi-ai 目录没有它的 OAuth 登录。先保存服务商。 |
| 登录页打开了，但浏览器没有回到这里 | 自动回调用的是本机 `127.0.0.1`（Claude 端口 `53692`，OpenAI Codex 端口 `1455`），浏览器必须在这台 Mac 上。若在另一台机器上，请把浏览器里显示的验证码粘贴进来。 |
| “Address already in use”或回调一直不来 | 回调端口被别的程序占着。退出另一个 Claude/Codex 命令行会话再试。 |
| 登录完成但请求仍失败 | 确认模型页里这个服务商已保存并启用；路由和凭据是两件事。 |
| “This Harness build has no authorization service” | 配置里缺少 `authorization` 行。把它加进组合（桌面应用通常自带）。 |

---

## 许可

MIT © Bing Dai

其余 B 系列包见[根目录 README](../../README.zh.md)。
