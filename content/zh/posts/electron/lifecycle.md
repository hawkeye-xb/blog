---
title: 生命周期
date: 2025-03-13
draft: false
descritpion: ''
categories:
  - Electron
series:
  - Electron
---

生命周期函数可以分为 APP 的生命周期，创建视图（BrowserWindow、BrowserView）和插件的生命周期。
### APP LifeCycle
- will-finish-launching
- ready: electron 已经准备好，可以创建 BrowserWindow，调用 dialog、ipc 等模块
- before-quit
- will-quit
- quit

**注:** 在 Windows 系统中，因系统关机/重启或用户注销而关闭，`before-quit` `will-quit` `quit` 事件不会被触发。如果有 fork 启动的进程，可以利用心跳结合退出函数来关闭。
### BrowserWindow
```js
function createWindow() {
  const win = new BrowserWindow()

  // 1. 窗口创建和显示
  win.on('ready-to-show', () => {})  // 窗口准备好显示
  win.on('show', () => {})          // 窗口显示时
  win.on('hide', () => {})          // 窗口隐藏时

  // 2. 窗口状态
  win.on('focus', () => {})         // 窗口获得焦点
  win.on('blur', () => {})          // 窗口失去焦点
  win.on('maximize', () => {})      // 窗口最大化
  win.on('unmaximize', () => {})    // 窗口取消最大化
  win.on('minimize', () => {})      // 窗口最小化
  win.on('restore', () => {})       // 窗口从最小化恢复

  // 3. 窗口移动和调整
  win.on('move', () => {})          // 窗口移动时
  win.on('moved', () => {})         // 窗口移动完成
  win.on('resize', () => {})        // 窗口大小改变时
  win.on('resized', () => {})       // 窗口大小改变完成

  // 4. 窗口关闭流程
  win.on('close', (e) => {})        // 窗口即将关闭
  win.on('closed', () => {})        // 窗口已关闭
}
```
运行周期相关性较大的有 `ready-to-show` `close` `closed`；WebContent 的周期属于当前又独立，和 HTML 内部的周期（如： redirectStart、navigationStart）更为相关。可以通过持有 WebContent 对这些周期做黑白名单拦截、修改。

#### WebContent
```js
function createWindow() {
  const win = new BrowserWindow()
  
  // WebContents 是 BrowserWindow 的属性
  const { webContents } = win
  
  // 页面加载生命周期
  webContents.on('did-start-loading', () => {})
  webContents.on('did-start-navigation', () => {})
  webContents.on('will-navigate', () => {})
  webContents.on('did-navigate', () => {})
  webContents.on('dom-ready', () => {})
  webContents.on('did-finish-load', () => {})
  
  // 页面状态变化
  webContents.on('did-fail-load', () => {})
  webContents.on('crashed', () => {})
  webContents.on('unresponsive', () => {})
  webContents.on('responsive', () => {})
}
```

### Plugins（待补充）

### 生命周期图
<a href="/images/electron/electron-lifecycle.png" data-lightbox="lifecycle" data-title="lifecycle">
  <img src="/images/electron/electron-lifecycle.png" alt="lifecycle">
</a>

### 参考和引用
[app](https://www.electronjs.org/zh/docs/latest/api/app)    
[BrowserWindow](https://www.electronjs.org/zh/docs/latest/api/browser-window#windestroy)    
[webContents](https://www.electronjs.org/zh/docs/latest/api/web-contents)    