---
title: 薅Deno 羊毛：一分钟代理OpenAI API
date: 2023-12-07T02:09:26.000Z
draft: false
categories:
  - AI
tags:
  - Deno
  - OpenAI
  - free
series:
  - 薅羊毛
description: ' 在探索低成本使用OpenAI API的道路上，我们借助了Deno的强大功能。通过在Deno Playground中部署一个简单的代理服务器，我们能够绕过地理限制，直接与OpenAI的API进行交互。这个过程不仅节省了VPN和OpenAI Plus会员的费用，还提供了更加灵活和自主的控制方式。通过使用自己的API密钥，并结合国内代理商或拼团的方式，我们可以更加经济高效地进行研究和开发。此外，我们还介绍了如何通过curl命令在终端进行验证，确保一切运行正常。这一切的实现，都离不开Deno的强大支持，它让我们能够更加自由地探索和创新。希望这一分钟的分享，能够为您带来启发和帮助。Deno，确实牛逼！'
---

大家好，今天来薅Deno的羊毛。

对于想使用OpenAI的API，日常使用或者研究的场景来说。专门为此充个VPN，买20刀一个月的plus，成本也略高了点。如果使用API的话，只按照token计数，估计三四个月都用不了20刀。也可以找个国内代理商，或者找人拼团，但是我觉得这种还是自己控制比较好，就研究了怎么低成本的使用API。


### 第一步
登录[https://dash.deno.com/projects](https://dash.deno.com/projects)，New Playground

### 第二步
复制下面代码
```JS
const targetOrigin = "https://api.openai.com";

Deno.serve(async (request) => {
  // 获取原始请求的 URL 和方法
  const { method, url, headers } = request;
  const originalUrl = new URL(url);
  
  // 记录日志
  console.info(`Incoming request: ${method} ${originalUrl.pathname}${originalUrl.search}`);

  // 构建目标 URL
  const targetUrl = new URL(originalUrl.pathname + originalUrl.search, targetOrigin);
  
  try {
    // 准备转发请求的选项
    const requestOptions: RequestInit = {
      method,
      headers: new Headers(headers), // 复制 headers
    };

    // 对于 POST、PUT、PATCH 方法，透传请求体
    if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
      requestOptions.body = await request.arrayBuffer();
    }

    console.info(`targetUrl: ${targetUrl}`);
    // console.debug('requestOptions:', requestOptions); // 里面会有API KEY，可另外处理。
    // 向目标 API 发起请求
    const response = await fetch(targetUrl.toString(), requestOptions);

    // 检查是否是 SSE
    const contentType = response.headers.get("Content-Type");
    console.info(`${targetUrl} response content type is:`, contentType);
    if (contentType === "text/event-stream") {
      // 返回一个新的 ReadableStream，用于将事件流传递给客户端
      const stream = new ReadableStream({
        start(controller) {
          const reader = response.body.getReader();
          return (function pump() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              controller.enqueue(value);
              pump();
            }).catch(error => {
              console.error('Error while reading the stream', error);
              controller.error(error);
              controller.close();
            });
          })();
        },
        cancel() {
          reader.cancel();
        }
      });

      // 返回 Response 对象，透传 SSE
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // 其他类型的响应，直接透传
      const responseBody = await response.arrayBuffer();
      return new Response(responseBody, {
        status: response.status,
        headers: response.headers,
      });
    }
  } catch (error) {
    console.error(`Error proxying request to ${targetUrl}:`, error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
}, { port: 8000 });

console.log(`Proxy server running at http://localhost:8000/`);
```

### 第三步
Save & Deploy

### 第四步
[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) 从里面来个OpenAI 的API key，发请求时候带上。
没Key的可以 [https://bewildcard.com/i/HB0O8Q0Y](https://bewildcard.com/i/HB0O8Q0Y) 从里面注册，按照教程生成，有提供限时虚拟机的梯子，充值可以直接使用支付宝，省事儿；不过手续费不便宜。

#### 客户端
可以去下载[chatBox](https://chatboxai.app/zh)，将当前服务的域名设置在API域名既可。

### 验证
不需要使用chatbox的话直接，终端curl一哈。
```shell
curl --location --request POST 'https://{{YOUR_PROJECT}}.deno.dev' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{YOUR_API_KEY}}' \
--data-raw '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
```
## 最后
在这只是提供一些思路，仅供参考。Deno牛逼🐶。    

今天这一分钟，希望对您有帮助/doge。
