# B-1002 · 本地模型

[English](README.md) | **简体中文**
“设置 → 模型”页上的卡片，是 B-1001 的界面：引擎状态、引擎里的模型、Hugging Face 搜索，
以及这台电脑到底跑得动什么。

B-1002 自身没有 Host 状态、没有依赖，所有请求都发给 B-1001 的 `/local-engine/*`。

## 卡片内容

1. **你自己的引擎** —— 是否运行、当前模型、端口，以及“启动/停止”“设为我默认的模型”。
2. **这台电脑** —— CPU、核心数、内存与磁盘剩余。
3. **引擎里的模型** —— 每个 GGUF 的大小、适配标记、使用与删除。
4. **在 Hugging Face 上查找** —— 搜索 GGUF 仓库；点开模型进入详情页。

## 适配标记

```
需要 = 文件大小 × 1.2 + 1.5 GB
需要 ≤ 内存的 70%  → 跑得动
需要 ≤ 内存的 90%  → 勉强够用
否则              → 太大了
```

## 详情页

点开一个模型会替换列表，显示：下载量、点赞数、最近更新时间、能力标签、
参数/架构/领域/格式、内存判断、**三个推荐下载（Quality / Balanced / Compact）**、
其余量化折叠在“全部 N 个量化”里，以及 README 摘要。

## 安装

B-1002 只是卡片，需要 B-1001 提供引擎。按顺序安装两者：

```sh
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1001-local-engine"
npx @deepseek-ai/dsh plugin --profile web add "$PWD/packages/b-1002-local-models"
```

这些命令用于命令行启动的 `web` profile。桌面版用户请用应用里的**插件管理**页；
`dsh` 命令行会拒绝 `desktop` profile。

只装 B-1002 不装 B-1001 时，卡片会提示引擎未安装。

## 卸载

```sh
npx @deepseek-ai/dsh plugin --profile web remove @ml-hub476/b-1002-local-models
```

卡片会消失；引擎和已下载的模型仍然保留。桌面版用户请在**插件管理**页移除；命令行会拒绝
`desktop`。如果 B-1002 是随“一次安装包”装上的，请卸载那个包。

## 许可

MIT © Bing Dai

详细步骤（含怎么找到路径）见[根目录 README](../../README.zh.md#安装)。
