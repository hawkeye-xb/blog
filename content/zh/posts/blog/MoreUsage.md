+++
title = '五分钟搭建个人博客：更多设置'
date = 2024-04-26T14:47:40+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true

categories = ['blog']
tags = ['hugo']
series = ['五分钟搭建个人博客']
+++

大家好。

今天接着研究个人站长探索之博客搭建。

上期介绍了些多语言、文章分类、菜单配置等基础的使用方式。下面将介绍更多一些的用法，如果有更多很小的用法或者问题被探索到，也会持续更新在这篇文章里面。有些设置可能仅限于PaperMod主题。

### 文章系列（series）设置
和tags、categories的用法一样。在`/series/` 路由会按照文章头部front matter设置内容分成多个系列。
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
series = ['零基础实战Flutter']
```

### 阅读时长、字数统计
参照[Variables](https://github.com/adityatelange/hugo-PaperMod/wiki/Variables)。**front matter同时也得添加**。使用默认给的功能，先不说最终数据对不对，但是能有/doge。
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

### Markdown 文章内容可以使用的全局常量
为什么有这个需求，在做SaaS下云的时候经常需要将某些文章关键字做修改，还沿用之前的做法就是定义变量、常量，在构建或者运行的时候将内容替换。在写小说还没确定好名字这种场景下，按照变量来预先设置，也是挺好的。

所以专门研究了下，对应文章头部的变量替换，后续也会继续研究下，再结合上配置文件环境（prod、pre）的定制化，这套博客框架也可能可以作为产品“帮助中心”的一个方案。

废话不多说了，看看怎么使用shotcodes实现的吧。首先使用 .Get 0 获取传递给 Shortcode 的第一个参数，并将其存储在变量 $param 中。然后，我们使用 index 函数来检索 .Site.Params 中对应 $param 的值。with 语句确保了只有在该值存在时才会输出。
```html
<!-- layouts/shortcodes/param.html -->
{{ $param := .Get 0 }}
{{ with index .Site.Params $param }}{{ . }}{{ end }}
```
在配置文件中的 params 定义你想要在 Shortcode 中使用的内容。
```yaml
params:
  name: "张三"
  phone: "123-456-7890"
  address: "某市某街某号"
```
在Markdown中使用，name、phone就相当于入参。
```yaml
---
title: "联系信息"
---

姓名：双花括号< param "name" >双花括号
电话：双花括号< param "phone" >双花括号
住址：双花括号< param "address" >双花括号
```

### 首页展示内容排序
设置weight属性就行。

### override css
[Change width of the content #442](https://github.com/adityatelange/hugo-PaperMod/discussions/442).
覆盖修改主题的CSS。

----

### 建议：不要使用index.md
猜测的，会构建index.html，所以在路由下不添加具体路径也可以访问，但是整个目录应该会只打包这个文件。

### 子菜单(目前看是不支持)

----

今天这五分钟，希望对您有帮助/doge。
