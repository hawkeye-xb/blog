 +++
title = '五分鐘搭建個人部落格：更多設定'
description = '五分鐘搭建個人部落格：更多設定。深入探討Hugo個人部落格的高級設定，包括文章系列設定、閱讀時長和字數統計、全域常數的使用、首頁內容排序、CSS覆蓋等。還提供了如何優化SEO的建議，如添加獨特、簡潔、包含關鍵詞的meta描述。'
date = 2024-04-26T14:47:40+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true

categories = ['部落格']
tags = ['hugo']
series = ['五分鐘搭建個人部落格']
+++

大家好。

今天接著研究個人站長探索之部落格搭建。

上期介紹了些多語言、文章分類、選單配置等基礎的使用方式。下面將介紹更多一些的用法，如果有更多很小的用法或者問題被探索到，也會持續更新在這篇文章裡面。有些設定可能僅限於PaperMod主題。

### 文章系列（series）設定
和tags、categories的用法一樣。在`/series/` 路由會按照文章頭部front matter設定內容分成多個系列。
```yaml
taxonomies:
  category: categories
  tag: tags
  series: series
```
```yaml
- identifier: series
  name: 系列
  url: /series/
  weight: 290
```
```yaml
series = ['零基礎實戰Flutter']
```

### 閱讀時長、字數統計
參照[Variables](https://github.com/adityatelange/hugo-PaperMod/wiki/Variables)。**front matter同時也得添加**。使用預設給的功能，先不說最終數據對不對，但是能有/doge。
```yaml
params:
  ShowWordCount: true
  ShowReadingTime: true
```
```md
+++
ShowReadingTime = true
ShowWordCount = true
+++
```

### Markdown 文章內容可以使用的全域常數
為什麼有這個需求，在做SaaS下雲的時候經常需要將某些文章關鍵字做修改，還沿用之前的做法就是定義變量、常量，在構建或者運行的時候將內容替換。在寫小說還沒確定好名字這種場景下，按照變量來預先設置，也是挺好的。

所以專門研究了下，對應文章頭部的變量替換，後續也會繼續研究下，再結合上配置文件環境（prod、pre）的定制化，這套部落格框架也可能可以作為產品“幫助中心”的一個方案。

廢話不多說了，看看怎麼使用shotcodes實現的吧。首先使用 .Get 0 獲取傳遞給 Shortcode 的第一個參數，並將其儲存在變量 $param 中。然後，我們使用 index 函數來檢索 .Site.Params 中對應 $param 的值。with 語句確保了只有在该值存在時才會輸出。
```html
<!-- layouts/shortcodes/param.html -->
{{ $param := .Get 0 }}
{{ with index .Site.Params $param }}{{ . }}{{ end }}
```
在配置文件中的 params 定義你想要在 Shortcode 中使用的內容。
```yaml
params:
  name: "張三"
  phone: "123-456-7890"
  address: "某市某街某號"
```
在Markdown中使用，name、phone就相當於入參。
```yaml
---
title: "聯繫信息"
---

姓名：雙花括號< param "name" >雙花括號
電話：雙花括號< param "phone" >雙花括號
住址：雙花括號< param "address" >雙花括號
```

### 首頁展示內容排序
設置weight屬性就行。

### CSS覆蓋
[Change width of the content #442](https://github.com/adityatelange/hugo-PaperMod/discussions/442).
覆蓋修改主題的CSS。

----

### 添加文章描述
<!-- ![seo meta description 2024-05-08 14.23.18.png](https://s2.loli.net/2024/05/08/uA1M62VGxgTWzHS.png) -->
front-matter 的description對應的是HTML meta的description，如不單獨設置，則預設使用文章內容，SEO功能性沒這麼強。`<meta name="description" content="...">`標籤的作用是提供一個頁面的簡短描述。這個描述通常在搜索引擎結果頁面（SERPs）上顯示為頁面的摘要，有助於用戶了解頁面內容是否與他們的搜索查詢相關。

對於SEO來說，meta描述標籤應該：
 - 包含相關關鍵詞：這有助於搜索引擎理解頁面的內容。
 - 是獨一無二的：每個頁面都應該有一個獨特的描述。
 - 簡潔明了：通常建議長度在150-160個字符之間。
```markdown
+++
title = '五分鐘搭建個人部落格：零成本搭建'
description = '五分鐘搭建個人部落格：零成本搭建。使用Hugo框架和Vercel部署，詳細介紹了如何創建、配置和部署個人部落格。包括本地環境搭建、新項目創建、部署到Vercel、圖床使用、數據分析、自定義域名、評論功能等內容。'
date = 2024-04-23T10:09:26+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true

categories = ['部落格']
tags = ['hugo']
series = ['五分鐘搭建個人部落格']
+++
```
看了PaperMod代碼，description信息會展示在文章頭部，並沒有類似showDescription配置項，所以直接在CSS上覆蓋代碼，全部在頁面上隱藏信息，僅提供給meta使用。
```css
/* 隱藏文章頭部的描述，僅僅當成meta使用即可 */
.post-description {
  display: none;
}
```

### 建議：不要使用index.md
猜測的，會構建index.html，所以在路由下不添加具體路徑也可以訪問，但是整個目錄應該會只打包這個文件。

### 子選單 ~~(目前看是不支持)~~ 
[自己動手，豐衣足食](/zh/posts/blog/supportdropdownsubmenu/)

### 最後
今天這五分鐘，希望對您有幫助/doge。


__[文檔由AI翻譯](/posts/blog/autotranslate/)__