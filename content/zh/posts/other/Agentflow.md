---
title: AgentFlow or Workflow, 类似 n8n 平台的试用体验
date: 2025-10-28
draft: true
descritpion: ''
categories:
  - other
---
国庆期间 OpenAI 发布了 Agent Builder，小范围内发起了讨论。不低的使用门槛，需要经过 Organization 的认证才能使用，不小心 VPN 被检测地区，直接挂了。     
开启类似功能的调研。
忽略自部署协议，可以分为以下两类：
- 代码编辑 Flow 的：perfect, langgraph, airflow 等
- 拖拽生成的：n8n, sim.ai, 11labs, dify 等

从上手难度，排除代码生成的；又因为 n8n, sim.ai, 11labs 这三有 AI 辅助生成流程，稍作摸索也能初步的搭建流程，在免费用量的基础上，进行了试用。

### 11labs
地址：https://elevenlabs.io/app/agents/agents    
文档地址：https://elevenlabs.io/docs/agents-platform/overview

给我感觉和 OpenAI Agent Builder 最相似，构建 agent 而不是 flow，也是最偏技术视角的，极少的节点，交互体验差但略胜 OpenAI（这个 Gmai 授权都得自己走流程）。    
Trigger(触发) 节点之后，接的必须是 Subagent 节点，再之后，才允许接入其它的 agent 或 tools，且统一作为工具使用，包括条件语句。    
对话 - 执行 - 对话，的方式运行，会在长对话中，多次触发执行，<b>还不如直接接 tools 和 MCP</b>。也能理解，毕竟 11labs 强项也不是在这里。

### Sim ai
地址：https://www.sim.ai/    
github 地址：https://github.com/simstudioai/sim

这项目是 Apache2.0 协议，还纳闷怎么挣钱呢，自部署后发现，如果需要支持 Copilot AIGC 的能力，需要在他们平台申请APIKey，还没到研究节点结构，输入输出的时候，这个也不好自己开发。