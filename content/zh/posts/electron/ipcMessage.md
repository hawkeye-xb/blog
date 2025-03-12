---
title: IPC Electron 进程间通信
date: 2025-03-12
draft: false
descritpion: ''
categories:
  - Electron
---

### 背景
进程间通信 (IPC) 是在 Electron 中构建功能丰富的桌面应用程序的关键部分之一。但是在说 IPC 之前，让我们来了解下这样设计的背景。    
假设我们使用单个进程来管理多窗口、多标签和第三方插件的加载，可以很有效的减少额外进程的消耗，但也同时意味着任意内容的崩溃，都会影响到整个进程；为了解决这个问题，Chrome 团队选择多进程模型。       
在这基础上，Electron 也可以通过设置类似 contextIsolation、nodeIntegration 等配置，让渲染进程（的JS）直接调用 node 能力，存在的问题很明显，任何加载的 HTML 都能毫无节制的试探访问本地的资源。由于相比较浏览器，客户端的优势之一也是在此。   
所以，我们需要隔离上下文的环境下，有选择的暴露客户端的能力。

### Electron IPC 的实现原理
Electron IPC 是在 Chromium IPC 之上再度封装而来，底层依赖于管道（Pipe）或类似的机制，简单的说，这个管道就类似电话线，由操作系统管理两个进程之间的连接，发送端将序列化的数据放入管道，操作系统根据文件描述符通知进程，进程类似接线员的角色，把数据取出来反序列化，并且通常是单向传输的。    
针对性能瓶颈（序列化）、接口复杂性（单向）和安全性问题，Chromium 提供了更高效、类型安全且灵活的 Mojo 解决方案。


### 引用
[Electron 文档: 流程模型](https://www.electronjs.org/zh/docs/latest/tutorial/process-model)    
[Electron 文档: WebPreferences](https://www.electronjs.org/zh/docs/latest/api/structures/web-preferences)    
[Electron 文档: 上下文隔离](https://www.electronjs.org/zh/docs/latest/tutorial/context-isolation)  
[Electron 文档: 进程间通信](https://www.electronjs.org/docs/latest/tutorial/ipc)      
[Inter-process Communication (IPC)](https://www.chromium.org/developers/design-documents/inter-process-communication/)    
[Mojo](https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md)