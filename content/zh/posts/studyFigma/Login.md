---
title: 学习和研究Figma：登录功能
date: 2024-04-30T02:09:26.000Z
draft: false
ShowReadingTime: true
ShowWordCount: true
isCJKLanguage: true
categories:
  - 学习
tags:
  - Electron
  - Figma
series:
  - 学习和研究Figma
description: ' 在探索Figma登录功能的过程中，我们深入了解了其登录页面的远程加载机制、登录请求的发起、Web授权流程以及最终的登录过程。Figma的登录设计巧妙地利用了Web端的能力，通过授权页面将客户端与第三方登录系统隔离，确保了安全性和灵活性。整个流程涉及多个授权码的设计，以保障用户信息的安全传输。通过这一系列的分析，我们不仅学习了Figma的登录机制，还对Electron框架下的应用唤起和交互有了更深的理解。希望这篇文章能为您在理解和实现类似功能时提供帮助。'
weight: 2
---

大家好。

今天来学习和研究Figma的登录功能，毕竟这是APP所有功能的基础。

当作为前端我们研究某个网页的时候，下意识的就是打开chrome devtool，Figma也是保留了这个快捷键，MacOS环境下，`command + option + i`就可以唤起。

### 加载远端登录页
打开Figma客户端，一阵“白屏”之后，加载出来简单的登录页面。切到Network快捷键`command + shift + R`强制刷新下页面。Doc加载的是`https://www.figma.com/login?locale=en&is_not_gen_0=true`的资源，果然加载的远端资源，一生要强的前端er们，时常和白屏做斗争。这里登录页面猜测都在Web项目维护，做了拆包，查看整体Network资源加载，总共3M多。

#### 白屏
即使只有3M多资源大小，对于现在国内网络环境，如果有插着网线的机器，更是微不足道。但是个人认为，这个页面更新频率不高，可以被划分到本地的渲染进程里，独有的登录页。随安装包分发到本地，通过loadFile加载更为合适。

也可能出于项目管理上的考虑，这么小的内容不值得单独管理，并再为之引入埋点、数据分析监控。

再回到Network，看到除了加载js文件，还加载了登录状态对应提示信息的JSON、两种数据分析监控，甚至还连接了两个ws。

![figma login load res 2024-04-30 11.27.30.png](https://s2.loli.net/2024/04/30/2APMHYSunZzb1Iv.png)

### 发起登录请求
不管点击login还是create account，获取该次登录的hash。
```
https://www.figma.com/api/session/app_auth
```
```json
{
  "meta": {
    "id": "auth_code_1",
    "app_type": "desktop"
  },
}
```
### Web授权
这时候会唤起默认浏览器，打开授权页面，如: `https://www.figma.com/app_auth/{{ auth_code_1 }}/grant?desktop_protocol=figma&locale=en`。

打开的地址会携带重新唤起APP的协议头`desktop_protocol=figma`。

#### electron唤起默认浏览器打开URL
框架默认支持功能。
```js
const { shell } = require('electron');

// 在默认浏览器中打开URL
shell.openExternal('https://www.example.com').then(() => {
  console.log('网页已在浏览器中打开！');
}).catch(err => {
  console.error('打开浏览器失败:', err);
});
```
##### 跨平台实现
在Windows上，可以使用ShellExecute或ShellExecuteEx函数。MacOS则是NSWorkspace的openURL方法，Linux有xdg-open。印象中几个平台都支持，只是在Linux反向唤起APP的时候，设置比较麻烦。

#### 授权登录
到这里完全就托管给web端去实现登录了，不管是未注册、未登录还是直接授权，能都够复用现有的Web能力了。为什么要这么做呢？直接将登录页面嵌入客户端，不更好吗？如果登录与后续绑定倒是挺合适的，但是如果涉及到三方、单点登录这些场景，就不这么好处理了。

举个例子，假设需要接入第三方内部OA系统的授权登录，出于安全考虑，不允许在非安全客户端环境下登录，这样则需要接入该三方提供的SDK，或者将客户端环境，设置成为可以被校验安全的环境（比如固定的UA字段）。不管是修改环境还是接入SDK，都需要对客户端做出兼容修改。一旦接入的客户量足够多，这种方案根本管理不过来，无法维护。况且，Web端也需要进行相应的兼容。

这里跳转到浏览器，使用Web的登录状态，不管叫中介、代理还是什么模式都好，就将客户端和三方隔离开了。

再结合Figma面向团队、组织这类ToB模式的产品，就更好理解客户端为什么选择了这种登录方式了。

#### 同意授权
回到Figma登录流程，在web端有登录状态之后，点击授权，发起请求验证登录。
```
https://www.figma.com/api/session/app_auth/{{ auth_code_1 }}/grant
```
```
{
  "error": false,
  "status": 200,
  "meta": {
    "id": "auth_code_1",
    "app_type": "desktop",
    "g_secret": "auth_code_2"
  },
  "i18n": null
}
```

#### URL Scheme，浏览器唤起electron客户端
获得g_secret信息后，流程就需要重新唤起客户端APP了。不管是桌面端还是移动端，外部唤起APP，都需要再URL Scheme表注册内容，在协议请求的时候，会去校验这个表，如存在对应协议，则会获取协议的启动路径，执行APP的启动文件。

electron 可以通过[protocol](https://www.electronjs.org/zh/docs/latest/api/protocol)模块设置URL Scheme。
```js
const { app, protocol, net } = require('electron')

app.whenReady().then(() => {
  protocol.handle('atom', (request) =>
    net.fetch('file://' + request.url.slice('atom://'.length)))
})
```
或者通过构建工具如[electron builder](https://www.electron.build/api/programmatic-usage.html)配置。不太建议自行管理，需要兼容多平台。**另外需要注意杀毒软件，可能会导致注册失败**.

接着我们将Network过滤状态调整为过滤刚才请求头的协议`figma://`。很明显，将二次验证的g_secret在唤起APP的时候传递过去了。
```
figma://app_auth/redeem?g_secret=auth_code_2
```

### 登录
流程回到客户端，在授权之前把Network网络调成3G，方便我们观察数据。直接的就能看到，客户端使用`g_secret`请求接口，换取用户id。
```
https://www.figma.com/api/session/app_auth/redeem

{
  g_secret: "auth_code_2"
}
```
```json
{
    "error": false,
    "status": 200,
    "meta": {
        "workspace": {
            "userId": "userId",
            "orgId": null
        }
    },
    "i18n": null
}
```

最终时序图如下
![figma login time picture.png](https://s2.loli.net/2024/04/30/p3xLJrX2We1nvFj.png)

对着这完整的流程，为什么要设计这么多授权相关的code呢？直接将web端的登录状态保持信息（Cookie）给到客户端不就可以了吗？

首先在产品形态上，客户端和Web不应该共用Cookie，也不能在URL通过明文传输（前端之间加密可以说是加寂寞），所以设计的`g_secret`，回看唤起客户端的URL，这个值其实也很不安全，按道理客户端需要保有用来处理`g_secret`值的信息，并且在获取用户信息的时候同时提供。换言之，第一步的id和g_secret对应不上也是不允许的。这里Figma使用了个临时的回话，Cookie里的figma.session来做这件事情，再进一步释放了客户端的复杂度。这里没做`g_secret`存活时间、在另外机器使用的验证，原理都有做时效和使用次数的限制的。

在这整个流程中，目前还没有认识到会是哪种具名的授权方式。大家如果知道，还望告知。

### 最后
最后总结下，本文主要拆解了Figma客户端的登录整个流程，并且对Electron唤起浏览器、浏览器唤起Electron做了个简单的介绍。

学习和研究Figma的登录功能，就先到这里了，希望对您有帮助。
