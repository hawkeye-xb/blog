---
title: 薅羊毛：使用kagi + r.jina.ai 浅浅的翻半拉墙
date: 2024-05-27T02:09:26.000Z
draft: false
categories:
  - other
tags:
  - proxy
  - free
series:
  - 薅羊毛
---

大家好，今天继续薅jina.ai的羊毛。

起因是有朋友使用[kagi搜索](https://kagi.com/)能搜出来被墙了的内容，但是没挂梯子，点进去就是404 Not Found，就很尴尬，而且刚好还体验了[jinaAI](https://jina.ai/)的[URL读取功能](https://r.jina.ai/)。

所以产生了这么个薅羊毛的流程：**kagi搜索 - 404的地址 - r.jina.ai处理后展示。**

非常简单的流程，前天找到我的时候就顺带手给做了。当前代码在[github](https://github.com/hawkeye-xb/jinaAIReader).（后续在更新到方便访问的🐶）。**当然了，jina ai不是这么用的！！！**

#### 实现形式
整体都在在浏览器内操作，所以很自然，使用chrome extensions的方式去实现。

### chrome 插件开发
[chrome 浏览器插件开发](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world) 正好在写这篇文章的时候测试插件，关闭了VPN这个地址是无法访问的，使用插件可以看到文档内容，虽然质量差了点儿哈哈哈哈。

插件开发非常简单，和html开发一般。甚至直接将[官方hello world demo](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/tutorial.hello-world)下载下来，在`chrome://extensions/`打开开发者模式，直接加载项目就可以。

### v0.0.1 小菜一碟
需求非常简单，只需要点击，然后将当前tab地址增加`https://r.jina.ai/`前缀即可。不到半小时就能搞定~

manifest.json添加授权
```json
"permissions": [
  "tabs"
] 
```
html添加点击的按钮
```html
  <ul>
    <div id="usePrefix">use r.jina.ai prefix</div>
  </ul>
  <script src="popup.js"></script>
```
执行插件代码，获取url信息，添加前缀后更新到当前tab上。（注意：该js执行并非在当前tab页面f12唤起的控制台）
```js
document.querySelector('#usePrefix').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currentTab = tabs[0]; // 在当前窗口中获取活动标签
      console.info(currentTab.url); // 输出当前标签的URL
      var newUrl = `https://r.jina.ai/${currentTab.url}`; // 您想要导航到的新URL
      console.info(`newUrl: ${newUrl}`);
      chrome.tabs.update(currentTab.id, {url: newUrl});
  });
});
```

### v0.0.2 ~ v0.0.n-1 痛苦挣扎
默认返回Markdown格式，查看jinaAi reader信息之后，发现支持返回其它的格式。md格式其它解析相关的内容太多，只做查看的话不需要这些内容，就研究返回其它的格式。

可是在URL中无法携带header信息。第一直觉能想到就是使用fetch的时候添加header信息，返回的html内容，就使用blobURL加载到iframe上面就可以，还能加个iframe显示隐藏的标签，一切都是这么的美好。

#### 注入js，获取内容
直接授权`"scripting"`，通过js注入的方式直接获取。
```js
fetch(newUrl, {
  method: 'GET',
  headers: {
    'x-respond-with': 'html',
  },
}).then(response => {
  return response.text();
}).then(data => {
  const blob = new Blob([data], {type: 'text/html'});
  const blobUrl = URL.createObjectURL(blob);

  iframe.src = blobUrl;
  body.appendChild(iframe);
})
```
简单又快捷，关闭VPN测试下流程。ummm... 出现各种host未授权等等报错。简单来说，就是`chrome*://`等自保留的协议和页面，出于一些安全和体验是不允许修改的。原则上插件系统和Tab页错误状态也是应该分开的。

#### 尝试获取chrome error状态
既然没法在当前tab注入，那重定向到别的页面，能正常访问的页面总可以了吧，都到自定义页面，好像也不需要注入了。就直接将包含这段fetch代码的index.html部署到了deno（本以为还得薅Deno deploy的羊毛），通过URL获取传递过来的目标URL。

这会儿又行了哈哈哈哈，不如直接获取当前tab的url加载状态，直接就发起重定向好了。

不管是通过`webNavigation.onCompleted`还是`tabs.onUpdated`页面和插件的js执行环境数据交互，都不能很好的获取。暂且作罢。

### v0.0.n 柳暗花明
于是先朋友去使用，顺便吐槽下实现的过程。刚开始就突然想到，不就是要修改header嘛，直接拦截请求修改多直接啊，还需要什么重定向！！！

AI直接给出的实现方案使用的是`manifest_version: 2`，`webRequest, webRequestBlocking`权限，在`onBeforeSendHeaders`方法，有点儿落后了。还得[stackoverflow](https://stackoverflow.com/questions/3274144/can-i-modify-outgoing-request-headers-with-a-chrome-extension)自己找。

最终是通过下面代码实现添加headers。
```js
initLevelOfDetails();
async function initLevelOfDetails() {
  const levelOfDetails = await getStorage('levelOfDetails');
  setHeaders({
    "X-Return-Format": levelOfDetails.toLowerCase(),
  });
}

async function setHeaders(obj) {
  const allResourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);
  const MY_CUSTOM_RULE_ID = 1

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [MY_CUSTOM_RULE_ID],
    addRules: [
      {
        id: MY_CUSTOM_RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: Object.keys(obj).map(el => {
            const value = obj[el];
            return {
              operation: "set",
              header: el,
              value,
            }
          })
          // requestHeaders: [
          //   {
          //     operation: "set",
          //     header: "X-Return-Format",
          //     value: "screenshot"
          //   },
          // ]
        },
        condition: {
          urlFilter: "r.jina.ai",
          resourceTypes: allResourceTypes
        },
      }
    ],
  });
}
```
验证整个流程，通过kagi搜索 - 进入404页面 - 点击插件直接重定向到r.jina.ai处理返回，能够**免费**浅浅的在墙上探出脑袋，阅读下别的内容。

### 最后
你永远也不知道用户会怎么使用你的产品，说的就是这个了哈哈哈。勉强也能算薅点儿羊毛了，算是对chrome 插件开发的快速探索吧，通信、权限、settings的持久化等。因为属于chrome插件，不能翻墙的也无法通过插件平台下载并且收到插件更新，~~所以后续会探索下Release托管，RSS。提供下载、订阅这类功能。~~ （5G网络、普通网络能访问到github，应该是我本地路由配置有问题导致无法访问。）所以就托管到[github](https://github.com/hawkeye-xb/jinaAIReader)做分发了。
