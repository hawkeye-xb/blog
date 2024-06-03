---
title: 奇怪的知识：js如何判断系统架构
date: 2024-06-03
draft: false
categories:
  - other
---

### 场景：点击按钮下载什么架构的客户端
为啥需要JS判断当前浏览器所属的系统架构？可以代入到场景：如果需要自行分发arm、x86技术架构的客户端安装包（为了控制包大小等），怎么能让用户直接点击下载按钮，下载正确的技术架构，而不是需要用户了解相关内容，查看本机架构呢？

### UserAgent?
大部分都建议通过UA 匹配相关信息，去判断，如下面代码展示。
```js
navigator.userAgent
// 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
```
但是这是个运行在MacOS arm架构芯片的Chrome上。

### Platform？
ua不行，那再在`navigator`找找呢？`.platform`。也还是不准确。
```js
navigator.platform
// 'MacIntel'
```
### [getHighEntropyValues](https://developer.mozilla.org/zh-CN/docs/Web/API/NavigatorUAData/getHighEntropyValues)
js其实在这种场景挺束手无策的，相关浏览器运行在什么架构下，自己也无法控制，甚至还有在arm架构上运行x86应用的，那到底算什么架构呢？（说的就是浓眉大眼的Rosetta）。

好在还有[getHighEntropyValues](https://developer.mozilla.org/zh-CN/docs/Web/API/NavigatorUAData/getHighEntropyValues) 能够挣扎下。**不过作为实验性接口，需要考虑兼容性。**
```js
navigator.userAgentData.getHighEntropyValues(['architecture']).then(res => console.log(res))
/*
{
    "architecture": "arm",
    "brands": [
        {
            "brand": "Google Chrome",
            "version": "125"
        },
        {
            "brand": "Chromium",
            "version": "125"
        },
        {
            "brand": "Not.A/Brand",
            "version": "24"
        }
    ],
    "mobile": false,
    "platform": "macOS"
}
*/
```

该接口也仅能在较新的浏览器上使用，可能会让代码多一些判断条件，但是能让部分用户体验好些，就得自己权衡了。

### 判断Rosetta
其实还想好奇在Rosetta环境运行的Chrome，这个接口获取的数据会是什么。折腾半天没找到专门的x86的Chrome安装包，就作罢。理应不做兼容，在Rosetta启动的进程获取的就应该会是x86。

为啥好奇这个呢，这就多啰嗦下了。

### 场景：客户端x86自动更新，真的是应该下载这个架构的包吗
有些客户端在一开始或有其他原因，导致可能只支持了MacOS的Intel芯片，还做了自动更新，下载地址指向对应架构的安装包（Electron）。这时候，如果支持arm芯片的时候，原先通过Rosetta启动的用户，就没法很好的更新到合适的架构上来了。

虽然如此，但是也没有系统也没有给出判断的办法，只能通过些曲线救国的方案了，通过调用终端指令了。

```iterm
sysctl sysctl.proc_translated
```
sysctl 是一个在 Unix-like 系统上用来读取和设置系统内核参数的命令行工具。sysctl.proc_translated 是一个特定的内核参数，用于指示当前正在运行的进程是否是通过 Rosetta 翻译运行的。
- 当前进程如果是原生 ARM 架构的，这个值会是 0。
- 如果当前进程是通过 Rosetta 翻译的，这个值会是非 0。

### 最后
今天分享JS的小函数，给出了使用的场景，又因为做过类似的而好奇，多啰嗦了些。希望对大家有帮助/doge。
