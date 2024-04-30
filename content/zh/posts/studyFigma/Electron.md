+++
title = '学习和研究Figma：Electron开发环境搭建'
date = 2024-04-28T10:09:26+08:00
draft = true

ShowReadingTime = true
ShowWordCount = true

categories = ['学习']
tags = ['Electron', 'Figma', 'Figma功能']
series = ['学习和研究Figma']
+++

大家好。

今天来学习和研究ummmm... Electron。[quick start](https://www.electronjs.org/zh/docs/latest/tutorial/quick-start) 给出的内容已经足够简单和清晰了，为什么还单独说明呢？

有两个点原因吧，
Electron没有很好的类似：Electron + Vue/React/Other Template 这种框架，较多人把这两者组合起来的时候，喜欢将Electron的配置文件和Vue/React的配置文件结合起来，最终都在`src/`目录下管理包括进程、UI等代码。当然不是说这样不好，参照看了很多业内大佬的书籍、博客等都是这样处理的，这样确实能够很方便的统一管理，可以利用Webpack、Vite等打包工具的便利性，很简单的就将TypeScript等使用起来。对于不需要管理主、子进程的情况下，确实是非常好的实现方式。

但是需要管理子进程（BrowserView）的情况下，结合一些以前做移动端项目的体验，我觉得就没这么合适了。再者就是，客户端进程提供给Web的接口，理应是有版本控制的，类似服务端/api/v1/这样，不然是跟不上Electron版本迭代的，所以分离这些部分是合理的。

我认为不管渲染的什么内容，通过什么途径过来的（可以是本地加载、远端加载），端的渲染进程都是作为UI的父级容器存在的，父级容器按理（但不应该）可以对子内容进行操作，例如拦截、注入等（这个操作我记得Webview可以做到控制Dom元素），对于UI渲染，加载执行JS的子元素，只应该通过IPC以类似调用接口的方式，获取子进程提供的信息。子进程则通过规则和主进程通信，间接去和运行环境、数据持久化等做交互。

如下图:
![Electron Project arch .png](https://s2.loli.net/2024/04/28/2XtiM4qQBTmEDpo.png)

这种结构的好处是目录结构比较清晰，对于进程渲染需要加载的本地文件、远端文件，不管是以Vue/React，创建新项目维护都可以。不足之处也在目录、项目管理上，要有比较整体的角度，每个项目的配置文件都独立管理，不能共用构建环境参数，多项目管理也很麻烦，项目间数据交互成本高。

因为这部分内容个性化区别大，习惯也不同，做了几次qs快捷项目，没整理清楚需要的内容，也就作罢，不如就直接研究Figma客户端如何实现的。
