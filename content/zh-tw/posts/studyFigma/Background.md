 +++
title = '學習和研究Figma：背景'
date = 2024-04-28T10:09:26+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true
isCJKLanguage = true

categories = ['學習']
tags = ['Electron', 'Figma']
series = ['學習和研究Figma']
+++

大家好。

前些時候看Electron更新的[blog](https://www.electronjs.org/blog/electron-30-0)，已經迭代30.0.0版本了，提供WebContentsView將browserView廢棄了。

![electron blog 30v remove bv 2024-04-28 18.04.06.png](https://s2.loli.net/2024/04/28/JDay3nrHqkWusBd.png)

想起當時接觸客戶端開發還是NW，了解Electron的時候才11.0.0的版本。那這和[Figma](https://www.figma.com/)有什麼關係呢？在探索互聯網產品的整個流程中，不管是設計、原型還是研發，多多少少都接觸過Figma這款產品，或者聽過Adobe計劃兩百億美金收購Figma的事件，結果暫且不論，可以見得Figma這款產品的影響力。打開這款產品的安裝包，我們可以看到，它使用的正是Electron框架，browserView都是Figma團隊提供的。

一開始，還能直接解包看到Figma的源碼，現在直接解包asar會出現記憶體越界，作為前端，目前還不知道怎麼處理。不過這也不影響我們學習和研究Figma基礎的功能。也是因為有些時間沒有開發Electron，藉此機會，學習使用Electron的功能特性，當然過程可能會涉及到別的端。

不管是產品視角看待功能，還是研發思維看待實現，說不定能夠有不同的角度，設計和研發能夠相互理解哈哈哈/doge。

__[文件由AI翻譯](/posts/blog/autotranslate/)__