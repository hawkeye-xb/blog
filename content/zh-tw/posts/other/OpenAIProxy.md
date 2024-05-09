 +++
title = 'Deno 羊毛：一分鐘代理OpenAI API'
date = 2023-12-07T10:09:26+08:00
draft = false

categories = ['其他']
tags = ['deno', '代理', 'openai api', '免費']
series = ['薅羊毛']
+++

大家好，今天來薅Deno的羊毛。

對於想使用OpenAI的API，日常使用或者研究的場景來說。專門為此充個VPN，買20刀一個月的plus，成本也略高了點。如果使用API的話，只按照token計數，估計三四個月都用不了20刀。也可以找個國內代理商，或者找人拼團，但是我觉得這種還是自己控制比較好，就研究了怎麼低成本的使用API。


### 第一步
登錄[https://dash.deno.com/projects](https://dash.deno.com/projects)，New Playground

### 第二步
複製下面代碼
```JS
const targetOrigin = "https://api.openai.com";

Deno.serve(async (request) => {
  // 獲取原始請求的 URL 和方法
  const { method, url, headers } = request;
  const originalUrl = new URL(url);
  
  // 記錄日誌
  console.info(`Incoming request: ${method} ${originalUrl.pathname}${originalUrl.search}`);

  // 構建目標 URL
  const targetUrl = new URL(originalUrl.pathname + originalUrl.search, targetOrigin);
  
  try {
    // 準備轉發請求的選項
    const requestOptions: RequestInit = {
      method,
      headers: new Headers(headers), // 複製 headers
    };

    // 對於 POST、PUT、PATCH 方法，透傳請求體
    if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
      requestOptions.body = await request.arrayBuffer();
    }

    console.info(`targetUrl: ${targetUrl}`);
    // console.debug('requestOptions:', requestOptions); // 裡面會有API KEY，可另外處理。
    // 向目標 API 發起請求
    const response = await fetch(targetUrl.toString(), requestOptions);

    // 檢查是否是 SSE
    const contentType = response.headers.get("Content-Type");
    console.info(`${targetUrl} response content type is:`, contentType);
    if (contentType === "text/event-stream") {
      // 返回一個新的 ReadableStream，用於將事件流傳遞給客戶端
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

      // 返回 Response 對象，透傳 SSE
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // 其他類型的響應，直接透傳
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
[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) 從裡面來個OpenAI 的API key，發請求時候帶上。
沒Key的可以 [https://bewildcard.com/i/HB0O8Q0Y](https://bewildcard.com/i/HB0O8Q0Y) 從裡面註冊，按照教程生成，有提供限時虛擬機的梯子，充值可以直接使用支付寶，省事兒；不過手續費不便宜。

#### 客戶端
可以去下載[chatBox](https://chatboxai.app/zh)，將當前服務的域名設置在API域名既可。

### 驗證
不需要使用chatbox的話直接，終端curl一哈。
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
## 最後
在這只是提供一些思路，僅供參考。Deno牛逼🐶。    

今天這一分鐘，希望對您有幫助/doge。


__[文檔由AI翻譯](/posts/blog/autotranslate/)__