---
title: 零基础实战Flutter：环境搭建(macOS M芯片)
date: 2024-04-02
draft: false
categories: ['Flutter']
series: ['零基础实战Flutter']
description: ' 在MacOS M1芯片机器上搭建Flutter开发环境，首先需要安装Rosetta以兼容x86_64指令集。接着，下载并解压Flutter SDK到指定目录，并配置环境变量。建议安装Xcode和Android Studio以完善开发工具链。使用`flutter doctor`命令检查工具链的完整性。对于CocoaPods的安装，可参考相关指南。安装开发工具的Flutter插件后，即可创建并运行Flutter项目。在开发过程中，`r`命令用于热更新，`R`用于热重启，而终端输出的DevTools地址可用于调试。'
---

MacOS M1芯片机器。

[Start building Flutter iOS apps on macOS](https://docs.flutter.dev/get-started/install/macos/mobile-ios?tab=download)

直接按照文档操作也都能完成，M系列芯片在一些依赖上安装略微麻烦。

### Rosetta

M芯片执行x86_64指令集的兼容层，使用softwareupdate 安装Rosetta并且接受协议。

```jsx
sudo softwareupdate --install-rosetta --agree-to-license
```

### **初始化 Flutter SDK**

下载对应的SDK包，创建并且解压到 `~/development/`.目录，将bin文件PATH 导出（如果想换目录，修改导出的路径即可）。下面这些步骤官网都挺齐全。

1. 下载地址：https://docs.flutter.dev/release/archive?tab=macos 
2. 创建目录 ~/development/ 
3. 解压SDK（注意替换包名）

```jsx
unzip ~/development/flutter_sdk_v1.0.0.zip -d ~/development/
```

1. 创建或修改 ~/.zshenv 文件
2. 最后添加bin导出

```jsx
export PATH=$HOME/development/flutter/bin:$PATH
```

1. 重新打开新的终端

### 开发环境

建议直接下载xcode、Android studio，使用工具链方便。过程可以多次`flutter doctor` 检查缺失的工具。如果不做IOS或者Android开发，可以无视flutter doctor的相关报错。

M系列下下载 CocoaPod参考：

[How to run CocoaPods on Apple Silicon (M1)](https://stackoverflow.com/questions/64901180/how-to-run-cocoapods-on-apple-silicon-m1)

### 开发工具

安装对应开发工具的Flutter开发插件，使用对应方法创建并且启动项目。

### CMD

```jsx
flutter create my_app
cd my_app
flutter pub get
flutter run
```

终端每次启动之后会输出以下内容：

```jsx
Installing build/app/outputs/flutter-apk/app-debug.apk...           9.3s
Syncing files to device sdk gphone64 arm64...                      147ms

Flutter run key commands.
r Hot reload. 🔥🔥🔥
R Hot restart.
h List all available interactive commands.
d Detach (terminate "flutter run" but leave application running).
c Clear the screen
q Quit (terminate the application on the device).

A Dart VM Service on sdk gphone64 arm64 is available at: http://127.0.0.1:56456/1Aldd0I28OM=/
The Flutter DevTools debugger and profiler on sdk gphone64 arm64 is available at: http://127.0.0.1:9100?uri=http://127.0.0.1:56456/1Aldd0I28OM=/
```
至此，就可以进行项目的开发，想法的实现了~

稍微需要注意的是：

r热更新，vscode启动的save代码会自动执行 r热更新；部分需要重启项目，R，在终端输入就可以。

还有可以看到最后一行输出的地址，在浏览器输入，能看到devTool，调试使用。

----
<!-- [下一篇：项目开发的一些过程](https://juejin.cn/post/7355389990531416116) -->
