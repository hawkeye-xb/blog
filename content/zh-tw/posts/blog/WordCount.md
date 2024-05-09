 ---
title: '五分鐘搭建個人部落格：字數統計，可配置的front-matter'
date: 2024-04-29T14:47:40+08:00
draft: false
---
{{< param "buildBlogSeriesOpeningRemarks" >}}

這次是使用node腳本實現的front-matter可配置。

上次在[系列文章](/zh-tw/series/五分鐘搭建個人部落格/)“更多設置”中簡單介紹過字數統計功能。在英文環境下稍微驗證了下效果後就沒過多留意了，但是，在今天切到中文語言下，發現只有短短的100來個字，啊？！

![ 2024-04-29 22.45.58.png](https://s2.loli.net/2024/04/29/nR1P2IgWKtZQHFs.png)

### hasCJKLanguage
簡單研究了下，大概是在文本渲染、分詞、搜索或者字體處理等方面，CJK語言因為其獨特的字符集和排版規則，通常需要特別對待。CJK是中文（Chinese）、日文（Japanese）、韓文（Korean）的縮寫。

所以Hugo提供了[hasCJKLanguage](https://gohugo.io/getting-started/configuration/#hascjklanguage)配置。同樣的，也需要再front-matter上設置[isCJKLanguage](https://gohugo.io/content-management/front-matter/#iscjklanguage)。
```yaml
# config yaml file
params:
  ShowWordCount: true
  ShowReadingTime: true
  hasCJKLanguage: true
```
```md
<!-- article front-matter  -->
+++
ShowReadingTime = true
ShowWordCount = true
isCJKLanguage = true
+++
```

在將參數複製了幾個文件之後... 我發現還有好多草稿文件🤦🏻‍♀️。
就又簡單研究了下。

在全局配置`isCJKLanguage: true`並不可以，後續有機會再研究源碼看看這些參數都是什麼個實現方式。

### archetypes
發現有推薦這個東西的，看了這個不是在創建時候的模板麼。在使用指令創建文件的時候，會根據該目錄路徑對應起來，使用模板。比如在`content/zh/`下創建新文件，會使用`archetypes/zh/`下的模板。

對於現有存量文章來說，並不適用。

況且模板文件存在最大一個問題就是，模板修改，通過模板創建的文件並不會修改。

### data
接著又找到了data目錄下的數據使用，但是只能在模板文件中使用，模板參數中還不知道有什麼參數可以獲取，怎麼設置...

### node代碼修改文章isCJKLanguage配置
半天也沒有找到有暴露構建前的生命週期鉤子，或者在某個步驟能夠修改，構建完成之後倒是有個[PostProcess](https://gohugo.io/hugo-pipes/postprocess/)。

一氣之下... 掏出老工具node（主要是Vercel設置了node，可以直接使用）。直接修改文章內容，給頭部添加上isCJKLanguage屬性/doge。

這一下午迭代的