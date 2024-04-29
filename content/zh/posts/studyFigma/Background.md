+++
title = '学习和研究Figma：背景'
date = 2024-04-28T10:09:26+08:00
draft = true

ShowReadingTime = true
ShowWordCount = true
isCJKLanguage = true

categories = ['学习']
tags = ['Electron', 'Figma']
series = ['学习和研究Figma']
+++

大家好。

前些时候看Electron更新的[blog](https://www.electronjs.org/blog/electron-30-0)，已经迭代30.0.0版本了，提供WebContentsView将browserView废弃了。

![electron blog 30v remove bv 2024-04-28 18.04.06.png](https://s2.loli.net/2024/04/28/JDay3nrHqkWusBd.png)

想起当时接触客户端开发还是NW，了解Electron的时候才11.0.0的版本。那这和[Figma](https://www.figma.com/)有什么关系呢？在探索互联网产品的整个流程中，不管是设计、原型还是研发，多多少少都接触过Figma这款产品，或者听过Adobe计划两百亿美金收购Figma的事件，结果暂且不论，可以见得Figma这款产品的影响力。打开这款产品的安装包，我们可以看到，它使用的正是Electron框架，browserView都是Figma团队提供的。

一开始，还能直接解包看到Figma的源码，现在直接解包asar会出现内存越界，作为前端，目前还不知道怎么处理。不过这也不影响我们学习和研究Figma基础的功能。也是因为有些时间没有开发Electron，借此机会，学习使用Electron的功能特性，当然过程可能会涉及到别的端。

不管是产品视角看待功能，还是研发思维看待实现，说不定能够有不同的角度，设计和研发能够相互理解哈哈哈/doge。