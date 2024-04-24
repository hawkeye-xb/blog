+++
title = '五分钟搭建个人博客：零成本搭建'
date = 2024-04-23T10:09:26+08:00
draft = false

categories = ['blog']
tags = ['hugo']
+++

大家好。 
    
今天接着研究个人站长探索之博客搭建。

大家可能会想，我们国内有各种各样的平台，能够分享心情状态、生活、技术等等，图文并茂。有很好的内容编辑、数据分析、评论和广告接入等工具。为什么还需要自建博客呢？没有流量，没有阅读	，还得辛苦维护。     
最大的优势就是打造个人品牌的同时还比较“自由”，毕竟在别人的地方就得遵守别人的规则；再有就是不同平台都有自己的特色，自建博客可以当个人输出的归档；虽然没有平台推荐，但是视野可以扩展到全球，总不能分布到每个地区的专有平台，这渠道也太多了。

<!-- ## 整体流程 -->
即使有说的这些优势，搭建麻烦也不见得非得要自建。要是放在以前类似购买维护服务器就这一项都给我劝退了。好在现在博客框架，静态网站托管服务等让这个过程无比简单。就这么说，如果你有Github账号，五分钟就能搭起来，甚至都不用五分钟，授权Vercel后，只需网址上勾选即可。

这里我也是使用了Hugo（PaperMod主题），Github管理内容，Vercel部署静态资源，完成带<font color=#000000>自定义域名、GoogleAnalytics、评论、广告</font>的博客。   

<!-- ## 搭建过程 -->
再唠叨下为什么选择这些，Hugo是使用Golang开发的，后续如果访问量多自建服务还能简单些，远没有Wordpress复杂；Vercel则是在国内外都有cdn加速。
## Vercel 一键搭建
Github授权 [vercel](https://vercel.com/)，创建团队，创建项目后，选择clone template，从所有的模板里面搜索Hugo，选中部署项目即可。稍作等待之后就可以通过项目右边Domains中的域名访问博客了，同时也会在Github里面创建Hugo项目，后续根据Hugo文档编写内容即可。

## MacOS 本地环境搭建
当然后续咱们在写内容的时候，需要在本地看过效果，才能真正发布出来。下面是在MacOS系统下环境搭建，当然[Hugo官方引导](https://gohugo.io/getting-started/quick-start/)也很清晰。
### 安装 Hugo
```shell
brew install hugo
# 或者
sudo port install hugo
```
验证安装成功
```shell
hugo version
# hugo v0.125.2-4e483f5d4abae136c4312d397a55e9e1d39148df+extended darwin/arm64 BuildDate=2024-04-20T15:29:44Z VendorInfo=brew
```
git操作这里就不多展开了，具体可以在[git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)安装和学习。

## 创建新项目
安装之后我们就可以创建我们第一个博客了。`--format yaml` 是配置文件的格式，默认.toml，根据个人喜好选择就可以。
```shell
hugo new site MyFreshWebsite --format yaml
# replace MyFreshWebsite with name of your website
```
进入到生成的 MyFreshWebsite 目录，初始化主题（这里使用的是[PaperMod](https://github.com/adityatelange/hugo-PaperMod?tab=readme-ov-file)），通过git模块的方式使用主题的，也就是说不能也不应该主动修改主题项目的文件，这样才能在需要更新的时候，通过git更新。也是因为这种方式部署的时候遇到了些问题，后续说明。
```shell
cd MyFreshWebsite

# 下载主题资源
git init
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive # needed when you reclone your repo (submodules may not get cloned automatically)

# 给配置文件添加主题依赖
echo "theme: ['PaperMod']" >> hugo.yaml
```
在这里基本就准备完毕了，接下来就能启动项目了。`-D`
```shell
hugo server
```
如果需要本地构建静态文件，直接`hugo`就会在public生成资源了。需要稍加注意的是public是构建之后的产物，也就是说不需要单独管理和上传Github的，可以`.gitignore`（需要创建）选择将其忽略。

## 部署到 Vercel
在Vercel创建新的项目，选择从Github导入“Import Git Repository”，框架选择Hugo（不选也没关系，反正都得改），将构建指令Build Command设置为`git submodule update --init --recursive && hugo --gc`。上面说过我们使用的主题是通过git模块的，这就导致一个问题，在Vercel构建的时候可能会下载失败。即使下载失败也是可以构建、部署成功，但是在访问的时候会出现xml错误提示，类似`This XML file does not appear to have any style information associated with it. The document tree is shown below.` 。
![vercel hugo settings2024-04-23 14.48.51.png](https://s2.loli.net/2024/04/23/GM6Yor5qvhKbQe8.png)
除此之外，Hugo版本不一致也会导致xml问题，所以建议增加`HUGO_VERSION`环境变量设置。完成之后会触发第一次构建部署，可能会遇到以下报错。
```shell
Skipping build cache since Node.js version changed from "18.x" to "20.x"
Running "vercel build"
Vercel CLI 33.7.1
sh: line 1: hugo: command not found
Error: Command "hugo --gc" exited with 127
```
这里根目录提供个package.json 文件，将版本限制在范围内即可
```json
{
  "engines": {
    "node": "18.x"
  }
}
```
重新将代码推到Github，就会触发自动构建。

到这里，我们就拥有了自己的博客，自己的网站啦✿✿ヽ(°▽°)ノ✿。

----

## 图床：smms
有了文本内容，当然少不了需要图片，图文并茂才更好的表达内容。这些资源存储成本不低，有免费的咱也不能掏钱，这类产品有非常多，目前使用的[SM.MS](https://smms.app/)做图床，有5个G的免费额度。

## 数据分析：GoogleAnalytics
如果希望能够收集访问的数据，根据反馈去让自己的输出内容好，写作手法提升，这套主题可以说几乎零修改就能接入GoogleAnalytics。不需要修改主题文件，增加代码片段，也不需要添加全局的layouts文件和主题相冲突。将id设置到配置文件即可。
```yaml
# ...
services:
  googleAnalytics:
    id: G-xxx
# ...
```
### 接入成功验证
在开发阶段和正式博客页面，打开控制台(f12)，network选项下过滤到gtag文件的信息，代表是有相关代码，就是接入成功了。在相关网站也能看到访问数据的报告了。

## 自定义域名
虽然通过Vercel托管之后，会给到个随机的xxx.vercel.app域名，显得不是这么的正式，让人容易记住。可以去申请个人相关的域名，比如.xyz或其它后缀的域名，几块十块的一年。到目前为止支付的第一笔钱，让博客显得更正式，自己更开心的成本，不算成本（狗头）。

域名注册成功之后需要经过一段时间（48小时内）才能分发到各个DNS解析服务器。这时候在Vercel会设置不上，但是会给出这边DNS的地址，去到相应的域名注册商（购买域名的地方），添加解析到目标服务器，也就是Vercel给出的地址，如下图76.76.21.21。稍微等待一会，就能设置上自定义的域名了，通过喜欢的域名访问自己的博客了。
![invalid domain config 2024-04-23 15.44.56.png](https://s2.loli.net/2024/04/23/RwspDPGBC1ZJWES.png)

## 评论功能
评论功能就挺仁者见仁智者见智的，有的并不喜欢开放在个人博客，只想安安静静写作。评论模块搭建也有不同的方式，这里给出集成速度快、简单的[giscus](https://giscus.app/zh-CN) 方式，利用的是Github Discussion功能，设置简单，永久免费~。其它优势可以参考[giscus网址](https://giscus.app/zh-CN)。
### 部署步骤
1. 开通GitHub Discussions，具体就是在项目的settings 中把该项勾选上即可。（[github文档](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository)）
1. 将项目设置为public，能被别人访问，获取到评论数据。如对项目有协议要求或者其它问题，可以考虑另外的方案。
1. 将[giscus 安装](https://github.com/apps/giscus)到项目里面。
1. 输入[giscus](https://giscus.app/zh-CN)网址中生成script信息（标题：启用 giscus）。
1. 接入项目，这里PaperMod主题也给出了[配置方式](https://adityatelange.github.io/hugo-PaperMod/posts/papermod/papermod-features/#comments)。
1. 生成的script代码复制到`layouts/partials/comments.html`
1. 配置文件params增加comments: true, 如下：
```yaml
params:
  comments: true
```
本地启动项目就能看到评论区域了。
## Google ads
ads接入好像是需要前提条件，先🕊一下。

## 最后
最后，麻雀虽小，五脏俱全了。五分钟/doge，快速搭建自己的博客。
