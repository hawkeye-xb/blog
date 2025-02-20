---
title: Trae 纯黑盒开发体验，两小时完成一款APP
date: 2025-02-06
draft: false
descritpion: '对于 Trae AI 编程工具的一些体验和思考。分别使用了 Web 端、Flutter 跨平台端、Swift 原生端的语言，以黑盒的方式来开发项目，对 Trae 工具的使用和模型遇到的问题做简单的总结。'
categories:
  - other
---

## 前言
早就听闻 Cursor AI 编程大名，由于对 Claude、GPT-4o 有过粗浅的体验，又因为续费购买麻烦（贵），虚拟卡的余额用完了就没有续费，所以一直没有体验过这类工具。    
从作为研发，个人的角度出发，一直认为和问答方式，白盒使用模型辅助编程没有太大的区别，都应该审核生成的代码。   
然而在某书刷到【XX补光灯】的项目后对我冲击非常大，再次让我意识到，大部分的项目，技术从来不是壁垒。   
在准备使用 Deepseek + vscode 插件方案的时候，发现了 Trae AI 这款工具。

## 体验
既然决定使用，那就做点儿用得上的，想了想，最近需要做个产品的 Website 首页。
### Web 开发体验
#### 产品首页开发
在右侧输入框内，简单描述了需求，给出产品的基本信息。很快就给出如何搭建 React 项目，主要代码的编写，本地运行指令。只需要在聊天框里面点击“运行”、“应用”，在代码文件类似 Git 交互似的 “接受” 代码改动即可。    
瞬间就得到了一个简单的网站，并且还能实时预览。过程这里项目和对话数据连接被记录找不到就先不展示了。    
后续再对话，给出下载地址和对页面的修改，都准确无误的修改成功，中间因为 React 版本问题，通过对话也解决了。其中没有做任何的代码审查，只做黑盒的功能测试。   

[Website 地址](https://p-pass-file-website.deno.dev/)

小吃一惊，整个过程非常顺畅，体验非常好。对于非研发角色来说，抹平了很多前置的问题。

#### checklist 开发
想起了之前用 Flutter 开发的独立开发者三件套之一的 [Checklist](https://github.com/hawkeye-xb/checklist)，于是想看看 Trae 深浅如何。

于是我发起了对话：
> 我想要开发Web页面，以类似华为备忘录卡片形式，可以快速添加check list的（不需要嵌套）功能，最主要的是，可以根据某个check list 快速的复制出来一份新的，复制出来的内容选中状态全部设置为未选中，title是被复制的title + 当前日期。要简约好看。

得到初步的代码回复，运行之后报错，内容直接从终端“添加到对话”，给出了修改方案（报错信息在终端关闭之后被清理，按道理也是属于对话内容，也可以作为对话调试的内容被保留的，可能是终端涉及了本地用户信息不做保留？）。

<a href="/images/other/trae/chat1.png" data-lightbox="chat1" data-title="chat1">
  <img src="/images/other/trae/chat1.png" alt="chat1">
</a>

继续发起对话：
> 清单里面的项需要修改和删除。并且给每个清单增加收藏功能，收藏的排序排在前面。

> 增加本地保存功能，实时的保留清单的数据和状态。

功能都完整实现了，于是询问如何部署到 deno deploy，也给出了比较合理的 pipeline 代码。这里因为配置 Token 麻烦，就直接手动操作了。

#### 以为自己改了。
这里部署的时候，出现了几个 ESLint 报错，复制给 Trae 进行修复。代码标识的注释也给出了修复内容，但是没有生效。

<a href="/images/other/trae/chat2.png" data-lightbox="chat2" data-title="chat2">
  <img src="/images/other/trae/chat2.png" alt="chat2">
</a>

瑕不掩瑜，重复给出错误信息后修改成功，最终部署成功。    

[部署地址](https://copy-checklist-hxb.deno.dev/)

### Flutter 开发体验
在 Web 端使用整体还是让人惊艳的，对于之前所实现的 Flutter 项目，觉得不是很完善，顾不上其他，拍马梳理了需求（[需求梳理地址](https://kr1wuqvrba.feishu.cn/docx/LL7UdCTeqowW6Lx6Y6nctkVnnyk?from=from_copylink)），过程中都幻想着有个不错的小应用可以使用了。

于是乎，一股脑的将需求发给 Trae，很快就得到几个文件，和是否进行后续功能开发的提示。按照返回的提示对话，直接完成了代码再运行，最后还让检查了需求。
<a href="/images/other/trae/chat3.png" data-lightbox="chat3" data-title="chat3">
  <img src="/images/other/trae/chat3.png" alt="chat3">
</a>

都标记已完成。（这后面感觉就是在体验模型了）

#### 长对话后遗忘。
一些运行终端报错和基础功能错误，多轮对话后也都修复了。
其中对话：
```shell
checklist 页面
需求：点击保存的时候，不要退出。
bug：点击退出选择不保存，数据发生了修改并保存。期望不保存。
```
在继续进行数据状态修复的对话后，发现需求【点击保存的时候，不要退出】又变回了退出。再次修复后没过多久，也再次出现了。

#### 改不动了。
在使用了数据和状态管理之后，代码量已经超千行。对于一些内容无论怎么强调也都没有实现相关功能了。
```shell
修改：
旅游的黄色用暗黄色
新增标签的颜色中，已有的颜色不能选择
```
```shell
标签管理：
删除标签操作不能在颜色选择的地方，修改为在编辑后面。
新增或者修改颜色，已经使用了的颜色不能被选择的功能没有实现。
```

最终差强人意，主要频繁的黑盒测试测烦了（理解测试！！！），得到了个能用又不太能用，并且不好看的 APP（有些按钮因为点击区域的问题，Flutter 非常难调整）。当然，没有审核任何一行代码，全是黑盒操作。看代码的事情，dddd。

### Swfit 开发体验
（为什么选择 Swift：原生更贴合零基础开发应用直觉的选择， vscode + 纯终端 开发更难）    

注意到有 Workspace 可以选择，也支持图片多模态。
<a href="/images/other/trae/chat4.png" data-lightbox="chat4" data-title="chat4">
  <img src="/images/other/trae/chat4.png" alt="chat4">
</a>

换个聊天方式指不定更好呢。于是立马用手机截了几张图，把 checklist 的需求拆开来对话，手拉着手，一步步走。

<a href="/images/other/trae/chat5.png" data-lightbox="chat5" data-title="chat5">
  <img src="/images/other/trae/chat5.png" alt="chat5">
</a>

#### 循环修改。
一顿无脑的提供报错信息，调整参考范围，然而却出现了首页使用组件入参，组件定义对应不上的循环修改的问题。

之前积攒的期待也消耗完了，更应该控制变量再去尝试的。本想就此放弃了，出门在公园溜了一圈儿之后。决定换个更简单的需求，也使用 Swift 来开发个【xx补光灯】！打不过就加入，没问题吧。

<a href="/images/other/trae/chat5_1.png" data-lightbox="chat5_1" data-title="chat5_1">
  <img src="/images/other/trae/chat5_1.png" alt="chat5_1">
</a>
在多次回退版本之后，就只保留到当前版本了。

【[最终产品](https://github.com/hawkeye-xb/fill-light)】

虽然没有做个人实用的需求，但在使用时间不长的情况下，算是有个完成度较好的产出了。简短的对话也都贴在地址的 README 里了。

支持了功能：
- 调整颜色，保存、快速使用、删除已调好的颜色。
- 纯补光模式。
- 补光自拍模式。

<a href="/images/other/trae/chat6.png" data-lightbox="chat6" data-title="chat6">
  <img src="/images/other/trae/chat6.png" alt="chat6">
</a>

## 总结
这个过程中，其实更多的是对模型能力的尝试了，LLM 模型存在的问题，依旧是没法避免。

对 Trae 的体验，除了有时候网络连接问题，检测不到代码更新、重复写入的代码片段需要手动处理外。
**对话生成的指令一键输入终端、或直接运行；生成代码直接应用，代码审核的方式接受，根据对话内容回滚代码版本；多模态结合、预览等等**非常的具有产品力（也体验了 Builder 全自动模式）。

落地过 AI Agent 开发，深知其中的艰难。为了更好、更稳定，每增加的链条节点，难度都是成倍增长，每每期望能有个通用模型，一把完成内容，但又深知不同的垂类，需要提供不同的辅助。

感谢 Trae 能让我们能够体验这种编程方式，用更简单直观的方式，能让没有相关经验的也有机会实现自己的想法。接下来我会继续使用白盒的方式、扩展到更多的端（服务端）体验，看看与现有项目能够碰撞出来什么火花。感谢您的阅读。
