---
title: Chromium 的“后门”：CommandLine
date: 2025-03-14
draft: false
descritpion: ''
categories:
  - Electron
series:
  - Electron
---

### 概念
Chromium（和Chrome）接受命令行开关，以启用特定功能或修改其他默认功能；Electron CommandLine Class 就是用于操作Chromium读取的应用程序的命令行参数的。

打个比方，在调试 node 的时候，时常会使用 `node --inspect` 这样带命令行参数的指令来启动项目。Electron CommandLine 就类似这样，用特定功能启动 Chromium。     

打开 `chrome://version/` 也能看到对应启动的信息。
<a href="/images/electron/chrome-version.png" data-lightbox="chrome-version" data-title="chrome-version">
  <img src="/images/electron/chrome-version.png" alt="chrome-version">
</a>

跳转到 `chrome://flags/` 能看到当前设备所支持的指令。
<a href="/images/electron/chrome-flags.png" data-lightbox="chrome-flags" data-title="chrome-flags">
  <img src="/images/electron/chrome-flags.png" alt="chrome-flags">
</a>

需要注意的是，有些开关是用于开发和临时情况。Chromium 不会通知更改或删除，得自行关注。
### 应用场景
有了大概的了解，那它到底能做什么事情呢？既然作为“后门”，在技术上的意义可以让我们绕过应用层限制，无需用户手动操作，直接修改底层 Chromium/V8 的运行时参数（如关闭安全策略、开启硬件加速）。

### 如何使用
回到 Electron，CommandLine 类提供了指令设置的增删改查。
- commandLine.hasSwitch(switch)：命令行开关是否存在
- commandLine.getSwitchValue(switch)：获取值，默认空字符串
- commandLine.appendSwitch(switch[, value])：添加开关
- commandLine.appendArgument(value)：追加到命令行的参数
- commandLine.removeSwitch(switch)：删除指定的开关，恢复到默认

这些参数直接传递给 Chromium 引擎，是不会影响应用启动时从操作系统获取的 `process.argv`。

作为命令行开关，可能会影响内部模块或着整个生命周期，所以**需要在app模块的ready事件发出之前添加**。

```js
const { app } = require('electron')
app.commandLine.appendSwitch('remote-debugging-port', '8315')
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')

app.whenReady().then(() => {
  // Your code here
})
```
### 常用指令
渲染相关
- app.commandLine.appendSwitch('disable-gpu'); 关闭 GPU
- app.commandLine.appendSwitch('ignore-gpu-blacklist'); 忽略 GPU 黑名单
- app.commandLine.appendSwitch('use-angle', 'opengl'); 使用 opengl api，苹果逐步在废弃相关
- app.commandLine.appendSwitch('disable-frame-rate-limit'); 忽略帧率限制

调试相关
- app.commandLine.appendSwitch('ignore-certificate-errors'); 忽略证书错误
- app.commandLine.appendSwitch('inspect'); node 进程的调试，chrome://inspect （Node 的）

V8 相关
- app.commandLine.appendSwitch('js-flags', '--max-old-space-size=2048'); 设置运行内存限制

网络相关
- app.commandLine.appendSwitch('no-proxy-server'); 直连模式
- app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1'); 某些域名通过特定代理

实验性功能
- app.commandLine.appendSwitch('enable-features', 'WebGPU');
- app.commandLine.appendSwitch('disable-features', 'PictureInPicture');

等等非常多的指令，有的是在 [Electron 文档](https://www.electronjs.org/zh/docs/latest/api/command-line-switches) 中有出现的，想了解更多可以看 [List of Chromium Command Line Switches](https://peter.sh/experiments/chromium-command-line-switches/) 。   

比如：设置 `app.commandLine.appendSwitch('use-angle', 'opengl');` 之后，我的设备通过 `const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');` 就获取不到 WebGL 的支持信息了。

`app.commandLine.appendSwitch('js-flags', '--max-old-space-size=2048');` V8 的就需要通过参数的方式传入。
```js
{
  jsHeapSizeLimit: 2248146944,
  totalJSHeapSize: 14384451,
  usedJSHeapSize: 8923123
}
```

### 最后
CommandLine 作为 Electron 中连接应用层与 Chromium 引擎的重要桥梁，为开发者提供了灵活的底层配置能力。通过合理使用这些命令行开关，我们可以：

1. 优化应用性能：通过调整 GPU、内存等参数
2. 增强开发体验：启用调试端口、忽略证书错误等
3. 实现特殊需求：自定义网络代理、开启实验性功能等

需要注意的是，在使用这些命令行开关时要谨慎：
- 务必在 app ready 事件之前设置
- 关注所用开关的兼容性和稳定性
- 在生产环境中要谨慎使用实验性功能

掌握 CommandLine 的使用，能让我们在 Electron 应用开发中游刃有余，但也要记住权力越大，责任越大。合理使用这个"后门"，才能让应用更加强大和稳定。

### 参考和引用
**注**：关于 Electron CommandLine 相关的信息较少，以上内容仅是个人理解。    
[Github 代码](https://github.com/hawkeye-xb/electron-learn/tree/main/command-line)    

[Class: CommandLine](https://www.electronjs.org/zh/docs/latest/api/command-line)    
[Supported Command Line Switches](https://www.electronjs.org/zh/docs/latest/api/command-line-switches)    

[Run Chromium with flags](https://chromium.googlesource.com/playground/chromium-org-site/+/master/developers/how-tos/run-chromium-with-flags.md)    
[Run Chromium with command-line switches](https://www.chromium.org/developers/how-tos/run-chromium-with-flags/)    
[List of Chromium Command Line Switches](https://peter.sh/experiments/chromium-command-line-switches/)    
[]()    
[]()    