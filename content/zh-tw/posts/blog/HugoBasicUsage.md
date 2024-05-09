 +++
title = '五分鐘搭建個人部落格：設定裝飾，多語言、分類、搜尋等'
date = 2024-04-24T14:47:40+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true

categories = ['部落格']
tags = ['hugo']
series = ['五分鐘搭建個人部落格']
+++

大家好。
    
今天繼續研究個人站長探索之部落格搭建。

我們零成本搭建完部落格之後，頁面就孤零零的只有文章內容，沒有合理的分類、排列，沒有多語言切換的支持，甚至還沒有部落格的介紹、歡迎語這些，略顯單薄。今天我們就給它加上。

首先，當然先找找抄的Demo了，在[PaperMod Github](https://github.com/adityatelange/hugo-PaperMod?tab=readme-ov-file) 有[Demo](https://adityatelange.github.io/hugo-PaperMod/)代碼的地址，看看頁面合適的內容，直接參照[項目代碼](https://github.com/adityatelange/hugo-PaperMod/tree/exampleSite)。

### hugo 基礎使用
[內容組織方式](https://gohugo.io/content-management/organization/) 是按照來源結構組織的，也就是說，在`content`目錄下有`zh`和`en`目錄，是通過切換URL來達到切換語言的目的的。

### 多語言
既然都脫離平台了，當然需要支持英文環境。看配置文件直接在language下區分了配置信息，但是缺少了默認語言和語言目錄相關信息。
```yaml
# 默認語言
defaultContentLanguage: zh
defaultContentLanguageInSubdir: true

# ...
languages:
  en:
    languageName: "English"
    contentDir: "content/en" # 指定語言文件目錄
  # ...
  zh:
    languageName: "簡體中文(chinese)"
    contentDir: "content/zh"
```
### 歡迎語
再仔細查看demo配置文件，params下的homeInfoParams很明顯就是當前的歡迎語，如需支持多語言，都得單獨設置在對應語言的配置下。如：
```yaml
zh:
  languageName: "簡體中文(chinese)"
  contentDir: "content/zh"
  
  params:
    homeInfoParams:
      Content: >
        👋 歡迎來到Hawkeye-xb 的部落格!
```

### 社交icon（Github icon）
在歡迎語下面提供直接跳轉網址的社交按鈕，比如說Github、推特（X）等。
```yaml
socialIcons:
  - name: github
    title: View Source on Github
    url: "https://github.com/adityatelange/hugo-PaperMod"
```

### 配置文件拆分
慢慢的，若是需要支持的語言種類多的話，咱們會面臨配置文件會很長很長的問題。[configuration-directory](https://gohugo.io/getting-started/configuration/#configuration-directory)用來做環境區分的剛好可以將config文件拆開，滿足咱的需求。

比如給出的多個菜單配置的例子
```shell
my-project/
└── config/
    ├── _default/
    │   ├── hugo.toml
    │   ├── menus.en.toml
    │   ├── menus.de.toml
    │   └── params.toml
    └── production/
        └── params.toml
```
目錄結構還可以再menus目錄下，分別創建en、de的配置文件。

### 菜單
頭部的菜單導航，一眼望去，menu關鍵字就是了。
```yaml
menu:
  main:
    - name: Archive
      url: archives
      weight: 5
    - name: Search
      url: search/
      weight: 10
```
這裡URL對應跳轉的頁面，和上面說的內容組織結構相對應。weight是對應排序的權重。

### 搜尋、歸檔
正好菜單這裡分別是歸檔和搜尋的URL，意味著我們需要這兩個path，再在demo頁面看看效果，我們需要對應功能的頁面。問題就來了，需要寫輸入框代碼這些嗎？看看demo相關文件：[search](https://github.com/adityatelange/hugo-PaperMod/blob/exampleSite/content/search.md?plain=1)、[archives](https://github.com/adityatelange/hugo-PaperMod/blob/exampleSite/content/archives.md?plain=1)。
```markdown
---
title: "Search"
placeholder: Search demo site with full text fuzzy search ...
layout: "search"
---
```
簡單粗暴~

### 類別、標籤
[分類taxonomies](https://gohugo.io/content-management/taxonomies/) 在配置文件開啟之後，對應文章定制配置上面，添加上tags和categories就可以。
```yaml
taxonomies:
  category: categories
  tag: tags
  series: series
```
文章頭部
```markdown
+++
...
categories = ['部落格']
tags = ['hugo']
...
+++
```

### 最後
到這裡稍微匯總下，我們設置了Hugo部落格的**多語言配置**。    
在這基礎上，設置**歡迎語、社交圖標**和對應的**菜單**。    
再往菜單添加了**歸檔、搜尋、類別和標籤**，這麼多的內容。

今天這五分鐘，希望對您有幫助/doge。




__[文檔由AI翻譯](/posts/blog/autotranslate/)__