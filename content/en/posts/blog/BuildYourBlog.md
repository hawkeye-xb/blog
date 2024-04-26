+++
title = 'Build a personal blog in five minutes: build it zero cost'
date = 2024-04-23T10:09:26+08:00
draft = false

categories = ['blog']
tags = ['hugo']
+++

Hello every. 
    
Today we will continue to study the blog construction of personal webmaster exploration.

Personal blog advantages:
 - free, so we alse find free ones😄
 - archive your knowledge
 - global perspective

However, none of the above is necessary hah. What prompted me to set up blog was that it was simple and free. In just five minutes i could build it using Github and Vercel.

In this article you can see how to build a blog using **Hugo(PaperMod theme), Github content management, Vercal static hosting, custom domain, Google analytics, comments and advertising.**

## small fork: builds with one click by Vercel 
Github authorizes [vercel](https://vercel.com/), create a team, create a project, search Hugo template and clone it. After a short wait, you can access it though the domain name in the Domains provided by the Vercel project. At the same time, the Hugo project will be created in Github, and then the content can be written according to the Hugo docs.


## MacOS local env setup
Of course, when we write the content later, we need to see the effect locally before we publish it. Sure you can also read the [Hugo guide](https://gohugo.io/getting-started/quick-start/)

### install Hugo
```shell
brew install hugo
# or
sudo port install hugo
```
verify
```shell
hugo version
# hugo v0.125.2-4e483f5d4abae136c4312d397a55e9e1d39148df+extended darwin/arm64 BuildDate=2024-04-20T15:29:44Z VendorInfo=brew
```
and we need install git, [learn git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## create a new blog in local
`--format yaml` it is the format of the configuration file. The default is .toml. You can choose it according to your personal preference.
```shell
hugo new site MyFreshWebsite --format yaml
# replace MyFreshWebsite with name of your website
```
Enter the 'MyFreshWebsite' directory, install theme([PaperMod](https://github.com/adityatelange/hugo-PaperMod?tab=readme-ov-file)), Using themes through git modules, We cannot and should not actively modify the files of the theme project, this way you can stay up to new.
```shell
cd MyFreshWebsite

# download theme resources
git init
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive # needed when you reclone your repo (submodules may not get cloned automatically)

# add theme dependencies
echo "theme: ['PaperMod']" >> hugo.yaml
```
and we can start it.
```shell
hugo server
```
The `hugo` command can build static resources directly locally. It should be noted that **public** ist the product after construction, in other words, there is no need to manage and upload Github separately.

## deploy to Vercel
Without using the Vercel template, create a new project in Vercel and choose to import from Github(**Import Git Repository**), build command is set to `git submodule update --init --recursive && hugo --gc`. Above, our theme is used through the git module, which leads to problem: theme download may fail when building Vercel project. But, even if fails, it can be built and deployed successfully, an xml error message will appear when accessing the blog, similar`This XML file does not appear to have any style information associated with it. The document tree is shown below.`. So we reset this build command.
![vercel hugo settings2024-04-23 14.48.51.png](https://s2.loli.net/2024/04/23/GM6Yor5qvhKbQe8.png)
In addition, inconsistent Hugo versions can alse cause xml problems. It is recommended to increase the `HUGO_VERSION` environment variable settings.

Immediately afterwards, we will encounter another problem during the first build.
```shell
Skipping build cache since Node.js version changed from "18.x" to "20.x"
Running "vercel build"
Vercel CLI 33.7.1
sh: line 1: hugo: command not found
Error: Command "hugo --gc" exited with 127
```

We provide a package.json file in the root directory here to limit the version to the range.
```json
{
  "engines": {
    "node": "18.x"
  }
}
```
push code it will rebuild.

At this point, we have our own blog and our own website ✿✿ヽ(°▽°)ノ✿。

----

<!-- ## 图床：smms
有了文本内容，当然少不了需要图片，图文并茂才更好的表达内容。这些资源存储成本不低，有免费的咱也不能掏钱，这类产品有非常多，目前使用的[SM.MS](https://smms.app/)做图床，有5个G的免费额度。 -->

## GoogleAnalytics
It's so easy, just get your id.
```yaml
# ...
services:
  googleAnalytics:
    id: G-xxx
# ...
```
### successful verification
On the blog page, open the console(chrome f12) and filter the infomation about the `gtag` file download under the network option. Or deploy it and see data reports on Google console.

## custom domain
Although Vercel will provide the domain name, but it is not yours. Not so easy for visitors to remember.

We can buy a cheap domain name at any registrar for the price of a piece of bread, making your blog look more formal, and make be can making you happier, is not cost /doge.

After the domain name is successfully registered, it takes time(within 48 hours) to be distributed to various DNS servers. But we can go to the corresponding domain name registrar(where it was purchased) and add resolution information to the target server(Vercel), which is the address given by Vercel, as shown below: `76.76.21.21`.

**Google Search Console verify ownership is the same as this.**

Waiting for a while, you can set up a custom domain name and access your blog through your favorite domain name.

![invalid domain config 2024-04-23 15.44.56.png](https://s2.loli.net/2024/04/23/RwspDPGBC1ZJWES.png)

## comments
Some people like the comment function and some don't, here is a quick and easy way to integrate, [giscus](https://giscus.app/), using the Github Discussion. **It's free!** /doge

### Using giscus
1. Check this item in the project settings and select Github Discussions.
1. Make the project public to allow access to comment data.
1. [Install giscus](https://github.com/apps/giscus) to Github project.
1. Copy the script information generated by giscus.
1. Set up [config](https://adityatelange.github.io/hugo-PaperMod/posts/papermod/papermod-features/#comments).
  1. Copy script code into `layouts/partials/comments.html`.
  1. Params add comments: true(yaml), as follows:

```yaml
params:
  comments: true
```

## Google ads
No permission yet. 🕊🕊🕊

## finally
I hope these five minutes today will be helpful to you/doge。
