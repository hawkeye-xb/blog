---
title: IPC Electron 进程间通信
date: 2025-03-12
draft: false
descritpion: ''
categories:
  - Electron
---

### 背景
进程间通信（IPC，Inter-Process Communication）是 Electron 中构建功能丰富的桌面应用程序的关键部分之一。在深入探讨 Electron IPC 的实现之前，我们先来了解这种设计的背景。

假设我们使用单个进程来管理多窗口、多标签页以及第三方插件的加载，这种方式可以有效减少额外进程的资源消耗。然而，这也带来了显著的弊端：任何窗口或插件的崩溃都可能导致整个应用程序瘫痪。为了解决这一问题，Chrome 团队采用了多进程模型，将浏览器划分为多个独立进程（如浏览器进程、渲染进程、插件进程等），每个进程负责特定任务，彼此隔离。即使某个渲染进程崩溃，也不会影响主进程或其他窗口的正常运行。

Electron 继承了 Chromium 的多进程架构。虽然 Electron 提供了 contextIsolation 和 nodeIntegration 等配置选项，允许渲染进程直接调用 Node.js 功能，但这也带来了安全隐患——任何加载的 HTML 内容（包括第三方脚本）都可以无限制地访问本地资源。这在浏览器环境中是不可想象的，但在桌面客户端中却是常见需求，因为客户端的优势之一正是能够与本地系统深度集成。

所以，我们需要在隔离上下文的环境下，有选择地暴露主进程的能力给渲染进程，同时避免安全漏洞。IPC 正是解决这一问题的核心机制，通过它，主进程和渲染进程可以在安全、高效的前提下进行通信。

### Electron IPC 的实现原理
Electron IPC 是基于 Chromium IPC 机制封装而来的，其底层依赖管道（Pipe）或类似机制。简单来说，管道就像一根电话线，由操作系统管理两个进程之间的连接。发送端将数据序列化后写入管道，操作系统通过文件描述符通知接收端进程，接收端像接线员一样取出数据并反序列化。这种通信通常是单向的，若需双向交互，则需要额外的管道或机制。

#### 管道的工作原理
1. 数据写入：发送进程（如渲染进程）将消息序列化为字节流（通常是 JSON 格式），通过管道的写入端送入内核缓冲区。
1. 事件通知：操作系统通过文件描述符监控管道状态，当缓冲区有数据时，通知接收进程（如主进程）。
1. 数据读取：接收进程的事件循环检测到管道可读后，从读取端取出字节流。
1. 反序列化：接收端将字节流还原为原始数据结构（如 JavaScript 对象），并触发相应的处理逻辑。

在 Electron 中，管道的具体实现因平台而异。    

#### 管道的问题
尽管管道简单高效，但也存在问题：
1. 性能瓶颈：频繁的序列化和反序列化增加了 CPU 开销，尤其在传输大数据时。
1. 接口复杂性：开发者需要手动定义消息格式和事件监听，代码维护成本较高。
1. 安全性问题：低级的管道机制难以保证数据的完整性或防止未授权访问。

#### Mojo
对此 Chromium 提供了更高效、类型安全且灵活的 Mojo 解决方案。
1. 通过消息管道（Message Pipe）和数据管道（Data Pipe）支持零拷贝传输，减少序列化开销。
1. 支持双向通信和复杂的交互模式，无需额外管道。
1. 细粒度的权限控制和句柄传递机制，确保通信安全。

### 主进程与渲染进程通信
在了解了以上内容之后，Electron 已经提供 ipcMain 和 ipcRenderer 模块，实现主进程和渲染进程之间的通信。

#### 渲染进程 --> 主进程
有以下方式：
- ipcRenderer.send(channel: string, ...args: any[]): void;
- ipcRenderer.sendSync(channel: string, ...args: any[]): any;
- invoke(channel: string, ...args: any[]): Promise<any>;

`channel` 是方法名称，`args` 会通过结构化的克隆算法进行序列化，就像 `window.postMessage` 一样，因此不会包含原型链。**函数、承诺、符号、WeakMaps 或 WeakSet** 这些都是会引发异常（例如：Uncaught Error: An object could not be cloned.）的数据，非标准 JavaScript 类型（如 DOM 对象或`ImageBitmap`、`File`、`DOMMatrix` 等）主进程无法解析的也不可以。    

另外，`sendSync` 同步消息将阻止整个渲染进程进程，直到主进程 `event.returnValue` 回复。    
如果想从主进程接收返回响应，例如方法调用的结果，建议使用 `ipcRenderer.invoke`。

```js
// main.js 主进程
ipcMain.on('sync-message', (event, arg) => {
  event.returnValue = '这是同步回复'
})

ipcMain.on('async-message', (event, arg) => {
  event.reply('async-reply', '这是异步回复')
})

ipcMain.handle('invoke-message', async (event, arg) => {
  return '这是 invoke 回复'
})

// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  sendSync: (message) => ipcRenderer.sendSync('sync-message', message),
  
  sendAsync: (message) => ipcRenderer.send('async-message', message),
  onAsyncReply: (callback) => ipcRenderer.on('async-reply', (event, ...args) => callback(...args)),
  
  invoke: (message) => ipcRenderer.invoke('invoke-message', message)
})

// html
const response = window.electronAPI.sendSync('这是同步消息')
```

#### 主进程 --> 渲染进程
同样的，主进程除了被动接受后返回，还可以主动通过 `webContents.send` 通知到渲染进程（`ipcRenderer.on`接收方式）。
- send(channel: string, ...args: any[]): void;

IPC 参数格式也受到类似的限制。   
另外，除了 IPC 之外，还可以使用 webContents.executeJavaScript 在渲染进程中直接执行 JavaScript 代码。

```js
// main.js 主进程广播消息到所有窗口
function broadcastMessage(message) {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(win => {
    win.webContents.send('broadcast-message', message)
  })
}
// 使用 executeJavaScript 执行代码
win.webContents.executeJavaScript(`
  document.getElementById('js-messages').innerHTML += '<p>通过 executeJavaScript 注入的消息: ${new Date().toLocaleTimeString()}</p>'
`)

// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  onBroadcast: (callback) => {
    ipcRenderer.on('broadcast-message', (event, ...args) => callback(...args))
  }
})

// html
window.electronAPI.onBroadcast((data) => {
  const div = document.getElementById('broadcast-messages')
  div.innerHTML += `<p>收到广播消息: ${data.message} (${data.time})</p>`
})
```

#### 渲染进程 <==> 渲染进程
Electron 中没有直接的方法可以使用 ipcMain 和 ipcRenderer 模块在渲染进程之间发送消息。实现这个效果最简单的方式就是将主进程作为渲染进程之间的消息代理。 这需要将消息从一个渲染进程发送到主进程，然后主进程将消息转发到另一个渲染进程。    

另一种就是利用 **MessagePost** ，是一个允许在不同上下文之间传递消息的Web功能。属于原生功能，Electron 只是充当了建立初始连接的角色（MessageChannelMain 为 MessageChannel node 环境下的特殊实现），使用 Worker 也是可以的。由于 MessagePort 是一个 Transferable 对象，不能被复制，只能被转移所有权（转移后会失去访问权），postMessage 的第三个参数 transfer list 专门用于转移这类对象。

Electron 下代码如下：
```js
// main.js 主进程
async function setupMessageChannel() {
  // 使用 MessageChannelMain 创建通道
  const { port1, port2 } = new MessageChannelMain()

  // 将端口发送给各自的渲染进程
  win1.webContents.postMessage('port', null, [port1])
  win2.webContents.postMessage('port', null, [port2])
}

// preload.js
let messagePort = null
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息
  sendMessage: (message) => {
    if (messagePort) {
      messagePort.postMessage(message)
    }
  },
  
  // 接收消息
  onMessageReceived: (callback) => {
    // 监听端口设置
    ipcRenderer.on('port', (event) => {
      messagePort = event.ports[0]
      messagePort.onmessage = (event) => callback(event.data)
      messagePort.start()
    })
  }
})

// html
```
[MessagePort 代码地址](https://github.com/hawkeye-xb/electron-learn/tree/main/ipc)

### 最后
本篇简单的介绍了 Electron IPC 的基本概念和使用，知道其边界，能做和不能做的。希望有所帮助，想更深入了解可以查阅 Chromium 相关文档。

### 参考和引用
[Inter-process Communication (IPC)](https://www.chromium.org/developers/design-documents/inter-process-communication/)    
[Mojo](https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md)    
[Electron 文档: 流程模型](https://www.electronjs.org/zh/docs/latest/tutorial/process-model)    
[Electron 文档: WebPreferences](https://www.electronjs.org/zh/docs/latest/api/structures/web-preferences)    
[Electron 文档: 上下文隔离](https://www.electronjs.org/zh/docs/latest/tutorial/context-isolation)  
[Electron 文档: 进程间通信](https://www.electronjs.org/docs/latest/tutorial/ipc)      
[Electron 中的消息端口](https://www.electronjs.org/zh/docs/latest/tutorial/message-ports)    
[MessagePort](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort)    
[electron.d.ts](https://www.npmjs.com/package/electron?activeTab=code)
