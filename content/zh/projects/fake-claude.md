---
title: "fake-claude"
description: "在终端中伪造 Claude Code 工作——逼真的输出、实时动画、零依赖的娱乐工具"
status: "stable"
tech: ["TypeScript", "Node.js", "ANSI", "CLI"]
weight: 3
links:
  - name: "GitHub"
    url: "https://github.com/hawkeye-xb/fake-claude"
  - name: "npm"
    url: "https://www.npmjs.com/package/fake-claude"
---

fake-claude 是一个趣味命令行工具，可以在你的终端中伪造 Claude Code 在工作。灵感来自 [genact](https://github.com/svenstaro/genact)。

## 核心特性

- **逼真的输出** — 模拟 Claude Code 真实的终端格式和动画
- **思考动画** — 187 个真实动词的旋转微调器（Caffeinating, Kwisatz-haderaching...）
- **工具模拟** — 支持 Read、Update、Write、Bash、Grep、Glob 等工具的模拟
- **差异展示** — 带行号的 Diff 输出，显示增删的行数
- **权限提示** — 逼真的多选权限提示自动选择
- **零依赖** — 纯 TypeScript 实现，无运行时依赖，内存安全

## 技术栈

- TypeScript (ES2022, Node16 modules)
- 纯 ANSI 转义码实现，无 UI 框架
- 可编译为多平台独立二进制文件
- 支持 macOS (Apple Silicon/Intel)、Linux (x86_64/ARM64)
