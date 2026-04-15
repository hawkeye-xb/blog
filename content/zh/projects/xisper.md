---
title: "Xisper"
description: "macOS 语音听写输入法，按下 Fn 即刻说话，角色词库让每个行业都能精准转写"
status: "alpha"
tech: ["Swift", "Vue", "TypeScript", "ASR", "AI"]
weight: 1
links:
  - name: "官网"
    url: "https://xisper-landing.hawkeye-xb.com/"
  - name: "下载"
    url: "https://xisper.hawkeye-xb.com/api/v1/app/mac/updates/download/production/latest"
---

Xisper 是一款 macOS 原生语音听写输入法。按下 Fn 键开始说话，松开即完成输入——适用于任何应用。

## 核心特性

- **角色词库** — 开发者、律师、医生、产品经理等行业专属热词与纠错规则，一键切换
- **实时转写** — 流式 ASR 引擎，亚秒级延迟，自动过滤语气词、智能标点
- **AI 润色** — 转写后自动修正语法、优化表达，口语变书面语
- **全局可用** — 系统级工具，邮件、聊天、代码注释、文档编辑，随处可用

## 技术架构

- 原生 Swift 应用，仅 2.3 MB，支持 macOS 13+
- monorepo 架构（Turborepo + pnpm）
- Landing Page: Vue 3 + TypeScript + Tailwind CSS
- 后端服务 + AI Worker 支撑语音处理与智能纠错
