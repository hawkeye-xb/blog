---
title: Monorepo 多 SPA 下 Cloudflare 转发配置
date: 2025-08-20
draft: true
descritpion: ''
categories:
  - other
---

前端在 Monorepo 架构下（多HTML），难免是需要做静态资源的转发配置。    
如果每个 Path 都有对应的资源，那也好说，但在现今 SPA 下，会有前端单页面托管处理路由的跳转逻辑，就难免出现访问某些 Path 下不存在的路由，或直接访问其自路由的情况下，到底应该加载哪个文件的问题。

自建 Nginx 服务，增加对应 Path 转发的 try-files 也就可以。
使用 Cloudflare （因为免费）则需要做如下配置。

1. 部署文件目录下添加 _routes.json，告知服务检测路由配置。// 例如：
```json
{
  "version": 1,
  "include": ["/auth/*"],
  "exclude": []
}
```

2. 部署文件目录下添加 functions/auth/[[path]].js 对应 Path 的路由配置文件。拦截处理对应 Path 请求。
```js
async function requestHandler({ request, next }, pathName) {
  const url = new URL(request.url);

  // 排除所有资源文件请求
  if (url.pathname.match(/\.(js|css|png|jpg|json|ico)$/)) {
    return next(request); // 直接返回原始资源
  }

  // 如果是静态资源 static/
  if (url.pathname.match(/\/static\//) || url.pathname.match(/\/images\//)) {
    return next(request); // 直接返回原始资源
  }

  // 仅重写页面路由请求
  url.pathname = pathName;
  return next(new Request(url));
}


export const onRequest = context => {
  return requestHandler(context, '/auth/index.html');
};

```

#### 为什么不使用 Redirects 和 Rewrites
不支持、不满足场景。

[Redirects · Cloudflare Pages docs](https://developers.cloudflare.com/pages/configuration/redirects/)    
[Routing · Cloudflare Pages docs](https://developers.cloudflare.com/pages/functions/api-reference/)
