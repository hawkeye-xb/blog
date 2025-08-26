---
title: Monorepo 多 SPA 下 Cloudflare 转发配置
date: 2025-07-23
draft: false
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

2. 部署文件目录下添加 functions/auth/[[path]].js （注意名称需要是[[path]].js）对应 Path 的路由配置文件。拦截处理对应 Path 请求。
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

### Cloudflare 转发原理
#### 1. 边缘函数 (Edge Functions)
- 在 Cloudflare 的全球边缘节点上执行 JavaScript 代码
- 可以拦截和修改请求，实现路由重写、重定向等逻辑
- 执行速度快，延迟低

#### 2. 路由匹配优先级
- `_routes.json` 定义路由规则和优先级
- 支持通配符匹配 (`*`) 和参数捕获 (`[[path]]`)
- 按配置顺序依次匹配，找到第一个匹配项即停止

#### 3. 请求处理流程
```
用户请求 → Cloudflare 边缘节点 → 检查 _routes.json → 匹配函数 → 执行函数逻辑 → 返回响应
```

#### 4. 核心优势
- **全局分发**: 利用 Cloudflare 的 CDN 网络，就近访问
- **动态路由**: 通过 JavaScript 实现复杂的路由逻辑
- **性能优化**: 边缘计算减少回源请求，提升响应速度
- **成本效益**: 免费额度足够个人和小型项目使用

这种架构特别适合 SPA 应用，可以在边缘节点处理前端路由，避免 404 错误，同时保持静态资源的正常访问。
