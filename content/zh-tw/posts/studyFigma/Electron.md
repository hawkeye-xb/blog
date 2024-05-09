 +++
title = '學習和研究Figma：Electron'
date = 2024-04-28T10:09:26+08:00
draft = true

ShowReadingTime = true
ShowWordCount = true

categories = ['學習']
tags = ['Electron', 'Figma', 'Figma功能']
series = ['學習和研究Figma']
+++

大家好。

今天我們來學習和研究Electron。[快速開始](https://www.electronjs.org/zh/docs/latest/tutorial/quick-start) 提供的內容已經足夠簡單和清晰，但為什麼還要單獨說明呢？

有兩個原因：
Electron並沒有很好的類似：Electron + Vue/React/Other Template 這樣的框架，許多人將這兩者結合時，喜歡將Electron的配置文件和Vue/React的配置文件結合起來，最終都在`src/`目錄下管理包括進程、UI等代碼。當然，這樣做並不是不好，參考了很多業內大佬的書籍、博客等都是這樣處理的，這樣確實能夠很方便地統一管理，可以利用Webpack、Vite等打包工具的便利性，很簡單地將TypeScript等使用起來。對於不需要管理主、子進程的情況下，確實是非常好的實現方式。

但是，在需要管理子進程（BrowserView）的情況下，結合一些以前做移動端項目的經驗，我覺得這樣就不太合適了。再者，客戶端進程提供給Web的接口，理應是有版本控制的，類似服務端/api/v1/這樣，否則是跟不上Electron版本迭代的，所以分離這些部分是合理的。

我認為，不管渲染的是什麼內容，通過什麼途徑過來的（可以是本地加載、遠端加載），端的渲染進程都是作為UI的父級容器存在的，父級容器按理（但不应该）可以對子內容進行操作，例如攔截、注入等（這個操作我記得Webview可以做到控制Dom元素），對於UI渲染，加載執行JS的子元素，只應該通過IPC以類似調用接口的方式，獲取子進程提供的信息。子進程則通過規則和主進程通信，間接去和運行環境、數據持久化等做交互。

如下圖所示：
![Electron Project arch .png](https://s2.loli.net/2024/04/28/2XtiM4qQBTmEDpo.png)

這種結構的好處是目錄結構比較清晰，對於進程渲染需要加載的本地文件、遠端文件，不管是以Vue/React，創建新項目維護都可以。不足之處也在目錄、項目管理上，要有比較整體的角度，每個項目的配��文件都獨立管理，不能共用構建環境參數，多項目管理也很麻煩，項目間數據交互成本高。

因為這部分內容個性化區別大，習慣也不同，做了幾次qs快捷項目，沒整理清楚需要的內容，也就作罷，不如就直接研究Figma客戶端如何實現的。

----

electron-forge 提供了基礎版本的。

__[文檔由AI翻譯](/posts/blog/autotranslate/)__