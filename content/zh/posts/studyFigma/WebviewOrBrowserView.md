---
title: 学习和研究Figma：WebviewTag 还是BrowserView？
date: 2024-07-13
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
description: ''
---

大家好。

今天继续来学习Figma客户端。在看[Electron Web Embeds](https://www.electronjs.org/docs/latest/tutorial/web-embeds#webview) 文档的时候，知道官方因为Webview结构还在发生变化，而不推荐使用。但如果锁定Electron版本不再升级，这种不用考虑结构变动的情况下，到底应该使用WebviewTag还是BrowserView呢？

### Figma 是如何选择的？
当然了，BrowserView都是Figma牵头提供的，这里选择很明显，但是为什么需要这个东西呢？[好些年前（2017）是这么说的](https://www.Figma.com/blog/introducing-browserview-for-electron/)：
 - 在使用<webview>时遇到了比如拖放功能的bug和性能问题。
 - BrowserView不再使用DOM层次结构，使用位于操作系统窗口层次结构（类似chrome标签管理）。提升了性能，**消除了与<webview>相关的大量特定bug**。
 - 新的问题，不能使用常规的HTML和CSS布局和层叠。

也没有说明具体的性能问题和bug。    
[Stackoverflow: Electron: Why does BrowserView has better performance then Webview?](https://stackoverflow.com/questions/66493829/electron-why-does-browserview-has-better-performance-then-webview) 在翻了不少内容，也没有找到比较好的答案。

### 从实现方式分析
#### setTopBrowserView
[BrowserView文档描述](https://www.electronjs.org/zh/docs/latest/api/browser-view): 它就像一个子窗口，除了它的位置是相对于父窗口。    
就挺直观的描述了，可以理解为使用chrome打开了多个窗口，都缩放成为对应的大小在屏幕排列。都是同级的窗口，只需要简单的做z轴堆叠（setTopBrowserView）和平面排列即可。    
   
#### 标签
以特有的<webview></webview>标签方式使用，能够通过JS获取Dom元素并且对其进行操作。就意味着需要在依赖加载的HTML中解析到<webview></webview>标签，加载内容后再在标签位置渲染。
<!-- ，完成之后通过ifrmae使得能在同一个渲染引擎内做渲染。    -->
```cpp
// shell/browser/api/electron_api_web_contents.h
// 函数名AttachTolframe表明它的功能是将当前WebContents对象附加到一个iframe元素

  // Methods for creating <webview>.
  [[nodiscard]] bool is_guest() const { return type_ == Type::kWebView; }
  void AttachToIframe(content::WebContents* embedder_web_contents,
                      int embedder_frame_id);
  void DetachFromOuterFrame();
```
Element
![2024-07-13 15.52.43.png](https://s2.loli.net/2024/07/13/W6jbSVFJtToZvpY.png)
Layout
![2024-07-13 15.52.54.png](https://s2.loli.net/2024/07/13/MlikWf24zjpuJdt.png)
<!-- 【再补充layer图 和Element图来佐证】 -->
<!-- 至此，可以大概的猜测，其实是通过<webview></webview>标签，将当前WebContents对象附加到一个iframe元素，然后通过iframe元素的DOM操作，来实现Webview的功能。 -->
简单查看[Electron代码](https://github.com/electron/electron/blob/main/shell/browser/api/electron_api_web_contents.h#L299)，再佐以WebviewTag运行时候的Element结构、Layer布局图片。不管是怎么实现的（还没看懂代码）注册Webview标签，渲染进程完成之后给出的什么产物，使得能在同一个引擎内渲染。至少也够证明在同样的引擎内渲染这个事情了。   
假设Webview进程和BrowserView进程中间做的事情一样（假设最后输出Bitmap），Webview依赖的渲染引擎，每次都需要额外计算“合成”最终的渲染效果，在多标签页、页面内容复杂，需要频繁的缩放拖拽的情景下，Webview确实会拥有额外的性能开销。

### 该如何选择
花这么些功夫，只是想通过逻辑上去证明BrowserView在性能上的优势。即便如此，基于不同的结构实现方式导致的，那不同场景下应该怎么选择呢？
对性能要求高、tab多的场景，更适合使用BrowserView，如果还有类似浏览器拖拽tab标签，打开独立窗口这种场景，更不能够创建新的窗口，再由<webview></webview>从头加载内容了。   
但是对性要求不这么高的，也就没有必要额外的去管理BrowserView层级、进程生命周期了。

### Figma如何做BV层级管理的
这里Figma选择的，就开卷答题了，肯定就是BrowserView了。Figma有多BrowserView管理的场景，同时也有标题管理栏覆盖内容的场景。多窗口、多BrowserView的管理方式无法验证，后续直接给出我的一些思考和实践。对于BrowserView层级的管理，Figma会将标签管理栏始终设置为Top，点击展开内容的时候把标签管理栏这个View高度设置窗口高度，最直接证明就是hover状态无法穿透当前的BrowserView。      
未遮挡的hover状态
![2024-07-13 17.49.47.png](https://s2.loli.net/2024/07/13/dJHoENbciWXQars.png)
遮挡的hover状态
![2024-07-13 17.50.39.png](https://s2.loli.net/2024/07/13/ojFZD52zHryA6EG.png)

印象中也看到过有大佬用debugtron验证这个结论，写文章的时候尝试再使用debugtron去连接Figma的进程，但是没有成功。

### 最后
BrowserView 改名叫 WebContentsView了。
<!-- 这里Figma选择的，就开卷答题了，肯定就是BrowserView了。现在官方改名WebContentsView.。 -->
