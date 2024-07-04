+++
title = '学习和研究Figma：WebContentsView（BrowserView） 管理'
date = 2024-05-02
draft = true

ShowReadingTime = true
ShowWordCount = true
isCJKLanguage = true

categories = ['学习']
tags = ['Electron', 'Figma']
series = ['学习和研究Figma']
+++
<!-- https://www.figma.com/blog/introducing-browserview-for-electron/ -->
<!-- 为什么BrowserView比Webview好，只是因为通过不同的进程创建？ -->
<!-- https://stackoverflow.com/questions/66493829/electron-why-does-browserview-has-better-performance-then-webview -->
<!-- ### Why browserView
至于BrowserView为什么好，WebView是一个允许应用程序显示网页的组件，它基于同一个Chromium实例运行，与应用程序共享资源和进程。这意味着WebView与应用的其他部分紧密集成，可以轻松地与JavaScript和Web内容进行交互。但是，这种紧密集成也意味着WebView的性能和资源消耗直接影响到整个应用程序。。对比BrowserView呢，就类似复用了Chromium，另外启动进程，来承载页面，比BrowserWindow需要准备的东西更少，和其类似。与主进程有更快速的数据交互，也可以脱离主进程的Chromium环境做渲染。这可能就是BrowserView的优点吧，待论证。 -->