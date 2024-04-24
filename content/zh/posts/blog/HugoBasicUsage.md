+++
title = '五分钟搭建个人博客：设置分类、搜索、多语言等'
date = 2024-04-24T14:47:40+08:00
draft = true
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
### 分类
### 搜索

