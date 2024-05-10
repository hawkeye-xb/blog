+++
title = 'Build a personal blog in five minutes: i18n, categories, search settings'
date = 2024-04-24T14:47:40+08:00
draft = false

ShowReadingTime = true
ShowWordCount = true

categories = ['blog']
tags = ['hugo']
series = ['Build a personal blog in five minutes']
+++

Hello everyone. 
    
Today we will continue to study the blog construction of personal webmaster exploration.

After we builded the blog, the page was all alone with only the article content. No support for classification arrangement, and mult-language switching, and there is not even a blog introduction or welcome message. This is a little too shabby. Let's decorate it.

Of course, you can alse directly refer to the configuration of the [Demo](https://adityatelange.github.io/hugo-PaperMod/) project.

## hugo basic usage

### [Content organization](https://gohugo.io/content-management/organization/)
Hugo assumes that the same structure that works to organize your source content is used to organize the rendered site.

### i18n
The Demo project is missing information about the default language and language directory.
```yaml
defaultContentLanguage: zh
defaultContentLanguageInSubdir: true

# ...
languages:
  en:
    languageName: "English"
    contentDir: "content/en"
# ...
  zh:
    languageName: "简体中文(chinese)"
    contentDir: "content/zh"
```

### welcome message
```yaml
en:
  languageName: "EN"
  contentDir: "content/en"

  params:
    homeInfoParams:
      Content: >
        👋 Welcome to Hawkeye-xb blog!
```

### social icon（Github icon）
```yaml
params:
  socialIcons:
    - name: github
      title: View Source on Github
      url: "https://github.com/hawkeye-xb/blog"
```

### configuration file splitting
If there are many languages to be supported, the configuration file will become very long. [Configuration-directory](https://gohugo.io/getting-started/configuration/#configuration-directory) can handle this problem. It can alse be split according to env.

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

### menu
No method has been found for the dropdown submenu.
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
Weight is sorting.

### search
It just so happens that the menu here is the URL of archive and search respectively.

The search function requires creating files and setting layout.
```markdown
<!-- --- -->
title: "Search"
placeholder: Search demo site with full text fuzzy search ...
layout: "search"
<!-- --- -->
```
It was verified that entering any content in the search box did not display any matching items. You also need [paperMod fuseOpts](https://github.com/adityatelange/hugo-PaperMod/wiki/Variables) to implement the search.

```
fuseOpts:
  isCaseSensitive: false
  shouldSort: true
  location: 0
  distance: 1000
  threshold: 0.4
  minMatchCharLength: 0
  limit: 10 # refer: https://www.fusejs.io/api/methods.html#search
  keys: ["title", "permalink", "summary", "content"] ##  can be less but not more than shown in list
```
And [hugo output settings](https://gohugo.io/templates/output-formats/), to provide content for the search function.
```yaml
params:
outputs:
  home:
    - HTML
    - RSS
    - JSON
```

### category, tag, series
category, tag, series alse need to define the category in front matter.
```yaml
taxonomies:
  category: categories
  tag: tags
  series: series
```
front matter
```markdown
+++
...
categories = ['blog']
tags = ['hugo']
...
+++
```

### finally
To summarize here, we have set up the **multi-language** of Hugo blog.
On this basis, set the **welcome message, social icons** and **menu**.
Added **archive, search, category and tag** to the menu.

I hope these five minutes today will be helpful to you/doge。
