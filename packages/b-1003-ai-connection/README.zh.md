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
| **模型卡片**（`client.js`） | 每张支持 OAuth 的服务商卡片上的 “B-1003” 区块：登录状态、**是哪个账号**（邮箱和套餐）、**登录**、登录页链接、设备码/粘贴码、问题、**退出登录**。 |
| **账号查询**（`lib/account.js`） | 把保存的凭据变成它所属的账号——邮箱加订阅档位——让“已登录”能说出*是谁*。 |
| **组合包补丁**（`cordis.patch.yml`） | 插入一行，同时挂载上面这些。 |

令牌由服务商的登录流程通过 Harness 凭据层写入 `llm-pi-ai/<provider>`；**退出登录**也通过
同一层删除这条记录。账号查询只读这条记录：令牌只会进请求头，不会进日志、错误信息或卡片。

## 登录的是哪个账号

卡片回答登录按钮回答不了的问题：这台 Mac 花的到底是**哪个** Claude 或 ChatGPT 账号。
两个服务商，两种查法。

| 服务商 | 怎么读到账号 | 代价 |
|---|---|---|
| **ChatGPT / OpenAI Codex** | 保存的凭据是 JWT，声明里就有邮箱（`https://api.openai.com/profile`）和套餐（`https://api.openai.com/auth` 的 `chatgpt_plan_type`）。 | 本地解码，不发请求。 |
| **Claude / Anthropic** | 保存的是不透明的 `sk-ant-oat01-…` 令牌，读不出字段，于是请求 `GET https://api.anthropic.com/api/oauth/profile`——Claude CLI 查 `/status` 用的正是这个接口。 | 一次 HTTPS 请求，缓存五分钟。 |

结果显示在**当前账号**一行：邮箱，加一个套餐标签，例如 **Claude Pro**、**Claude Max**、
**ChatGPT Plus**、**ChatGPT Pro**。已登录但读不出账号时，卡片会用一行小字说明原因——令牌被
拒绝、令牌没有 `user:profile` 权限、连不上接口——而不是让绿点把失败盖住。

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
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1003-ai-connection"
```

命令用 `web`。桌面版用户请用应用里的**插件管理**页；`dsh` 命令行会拒绝 `desktop` profile。
如果没有立刻出现，重启应用。

---

## 卸载

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1003-ai-connection
```

卸载插件不会删除已经保存的登录记录。想删除的话，先在**设置 → 模型**里点**退出登录**。
桌面版用户请在**插件管理**页移除；命令行会拒绝 `desktop`。如果 B-1003 是随“一次安装包”
装上的，请卸载那个包。

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
| **当前账号 `you@example.com`** | 记录能说出主人；旁边的标签就是套餐。 |
| **本机保存的登录已被拒绝** | 账号读不出来：令牌过期或已被撤销。点**重新登录**刷新。 |
| **正在等待服务商…** | 流程正在运行；请按提示打开链接或回答问题。 |
| **请先保存这个服务商** | 这是还没保存的草稿卡片。先应用服务商表单，再登录。 |

---

## 工作原理

```
设置 → 模型卡片
        │  fetch /b-1003/sign-in、/events、/answer、/cancel、/sign-out、/account
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

## 测试

账号查询的测试不需要联网，也不需要真的登录过：

```sh
node --test packages/b-1003-ai-connection/test/account.test.mjs
```

---

## 许可

MIT © Bing Dai

其余 B 系列包见[根目录 README](../../README.zh.md)。
