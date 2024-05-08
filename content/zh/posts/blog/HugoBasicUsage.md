+++
title = '五分钟搭建个人博客：设置装饰，多语言、分类、搜索等'
date = 2024-04-24T14:47:40+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true

categories = ['blog']
tags = ['hugo']
series = ['五分钟搭建个人博客']
+++

大家好。
    
今天接着研究个人站长探索之博客搭建。

我们零成本搭建完博客之后，页面就孤零零的只有文章内容，没有合理的分类、排列，没有多语言切换的支持，甚至还没有博客的介绍、欢迎语这些，略显单薄。今天我们就给它加上。

首先，当然先找找抄的Demo了，在[PaperMod Github](https://github.com/adityatelange/hugo-PaperMod?tab=readme-ov-file) 有[Demo](https://adityatelange.github.io/hugo-PaperMod/)代码的地址，看看页面合适的内容，直接参照[项目代码](https://github.com/adityatelange/hugo-PaperMod/tree/exampleSite)。

### hugo 基础使用
[内容组织方式](https://gohugo.io/content-management/organization/) 是按照来源结构组织的，也就是说，在`content`目录下有`zh`和`en`目录，是通过切换URL来达到切换语言的目的的。

### 多语言
既然都脱离平台了，当然需要支持英文环境。看配置文件直接在language下区分了配置信息，但是缺少了默认语言和语言目录相关信息。
```yaml
# 默认语言
defaultContentLanguage: zh
defaultContentLanguageInSubdir: true

# ...
languages:
  en:
    languageName: "English"
    contentDir: "content/en" # 指定语言文件目录
  # ...
  zh:
    languageName: "简体中文(chinese)"
    contentDir: "content/zh"
```
### 欢迎语
再仔细查看demo配置文件，params下的homeInfoParams很明显就是当前的欢迎语，如需支持多语言，都得单独设置在对应语言的配置下。如：
```yaml
zh:
  languageName: "简体中文(chinese)"
  contentDir: "content/zh"
  
  params:
    homeInfoParams:
      Content: >
        👋 欢迎来到Hawkeye-xb 的博客!
```

### 社交icon（Github icon）
在欢迎语下面提供直接跳转网址的社交按钮，比如说Github、推特（X）等。
```yaml
socialIcons:
  - name: github
    title: View Source on Github
    url: "https://github.com/adityatelange/hugo-PaperMod"
```

### 配置文件拆分
慢慢的，若是需要支持的语言种类多的话，咱们会面临配置文件会很长很长的问题。[configuration-directory](https://gohugo.io/getting-started/configuration/#configuration-directory)用来做环境区分的刚好可以将config文件拆开，满足咱的需求。

比如给出的多个菜单配置的例子
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
目录结构还可以再menus目录下，分别创建en、de的配置文件。

### 菜单
头部的菜单导航，一眼望去，menu关键字就是了。
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
这里URL对应跳转的页面，和上面说的内容组织结构相对应。weight是对应排序的权重。

### 搜索、归档
正好菜单这里分别是归档和搜索的URL，意味着我们需要这两个path，再在demo页面看看效果，我们需要对应功能的页面。问题就来了，需要写输入框代码这些吗？看看demo相关文件：[search](https://github.com/adityatelange/hugo-PaperMod/blob/exampleSite/content/search.md?plain=1)、[archives](https://github.com/adityatelange/hugo-PaperMod/blob/exampleSite/content/archives.md?plain=1)。
```markdown
---
title: "Search"
placeholder: Search demo site with full text fuzzy search ...
layout: "search"
---
```
简单粗暴~

### 类别、标签
[分类taxonomies](https://gohugo.io/content-management/taxonomies/) 在配置文件开启之后，对应文章定制配置上面，添加上tags和categories就可以。
```yaml
taxonomies:
  category: categories
  tag: tags
  series: series
```
文章头部
```markdown
+++
...
categories = ['blog']
tags = ['hugo']
...
+++
```

### 最后
到这里稍微汇总下，我们设置了Hugo博客的**多语言配置**。    
在这基础上，设置**欢迎语、社交图标**和对应的**菜单**。    
再往菜单添加了**归档、搜索、类别和标签**，这么多的内容。

今天这五分钟，希望对您有帮助/doge。


