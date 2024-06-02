---
title: <script> 中的 defer 和 async 属性
date: 2024-06-01
draft: true
---
### [html.spec.whatwg.org 对属性的描述](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-async)
The async and defer attributes are boolean attributes that indicate how the script should be evaluated.
Classic scripts may specify defer or async, but must not specify either unless the src attribute is present. 
Module scripts may specify the async attribute, but must not specify the defer attribute.

Async 和defer 是用于指示脚本应该怎么被解析的布尔值属性。
对于传统的脚本，除非`src`属性存在，否则不能指定defer或者async属性。
对于`module`类型的脚本，可以指定async，但不能指定defer属性。

There are several possible modes that can be selected using these attributes, and depending on the script's type.

这些属性可以被选择使用有几种可能的模式，取决于脚本的类型。

For classic scripts, if the async attribute is present, then the classic script will be fetched in parallel to parsing and evaluated as soon as it is available (potentially before parsing completes).
If the async attribute is not present but the defer attribute is present, then the classic script will be fetched in parallel and evaluated when the page has finished parsing. 
If neither attribute is present, then the script is fetched and evaluated immediately, blocking parsing until these are both complete.

对于存在`async`属性的传统脚本，会并行的获取在解析的时候，在可用的时候立即执行（可能在解析完成之前）。如果是`defer`属性，会同步获取，在解析完成之后才执行。如果两个属性都不存在，解析会阻塞直到脚本获取并执行完成。

For module scripts, if the async attribute is present, then the module script and all its dependencies will be fetched in parallel to parsing, and the module script will be evaluated as soon as it is available (potentially before parsing completes).   
Otherwise, the module script and its dependencies will be fetched in parallel to parsing and evaluated when the page has finished parsing. (The defer attribute has no effect on module scripts.)

对于`module`类型脚本存在`async`属性，该脚本和它的依赖项在解析的过程中会被同时获取，同样的会在可用时候立即执行（可能在解析完成之前）。否则，会并行获取，在解析完成之后执行（`defer`属性对`module`脚本没有影响）。

This is all summarized in the following schematic diagram:
![from https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer](https://html.spec.whatwg.org/images/asyncdefer.svg)

### 问题：async脚本执行的时候，是否会阻塞解析
虽然whatwg给的图已经很清晰了，但是文字描述上没有很明确的表述出，async脚本在加载完成立即执行的时候，是否会阻塞解析。答案是：**会的**。

但是很多人认为，async属性的脚本在执行的过程，并不会阻塞文档的解析，以至于在询问AI的过程中，某些模型坚持认为是不会阻塞的，查看部分博客的时候，多少也看到了些类似的观点。

传统的JS脚本在执行的时候，因为允许修改页面结构，会阻塞页面的解析过程，这个我们是知道的。按照这些原因推测，任何的执行都应该会阻塞解析的。

为了更好的控制接口返回的延迟时间，可以使用[deno deploy playground](https://dash.deno.com/account/overview) 简易的部署个服务，返回`"Content-Type": "application/javascript"`。
```deno
Deno.serve(async (request: Request, response: Response) => {
  const url = new URL(request.url);
  const jsCode = `
    (() => {
      const start = performance.now();
      for(let i =0; i< 100000; i++) {
        console.log('exec');
      }
      console.info(performance.now() - start);
    })()
  `;

  const headers = new Headers();
  headers.set("Content-Type", "application/javascript");

  if (url.pathname === "/api/delay/0.js") {
    return new Response(`console.log("Response after 0 second delay");` + jsCode, { headers });
  } else {
    return new Response("Not found", { status: 404 });
  }
});

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

然后在测试文件中引入
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <!-- 部分带id的标签，用于检测Dom解析 -->
  <script async src="https://dry-pheasant-18.deno.dev/api/delay/0.js"></script>
  <!-- 足够多的标签加长解析时间，和部分带id的标签，用于检测Dom解析 -->
  <script>
    (() => { for(let i =0; i< 100000; i++) {
      // log 一些Dom获取情况
    } })()
  </script>
  <!-- 部分带id的标签，用于检测Dom解析 -->
</body>
</html>
```
通过使用Dom解析之后，可以被JS获取的特性，来判断执行时间段内，是否能够继续继续文档。

测试结果如文档所示，也就是**会阻塞**。

### 最后
最后也侧向说明了AI的局限性，有时候实如鸡肋。


<!-- The exact processing details for these attributes are, for mostly historical reasons, somewhat non-trivial, involving a number of aspects of HTML. The implementation requirements are therefore by necessity scattered throughout the specification. The algorithms below (in this section) describe the core of this processing, but these algorithms reference and are referenced by the parsing rules for script start and end tags in HTML, in foreign content, and in XML, the rules for the document.write() method, the handling of scripting, etc. -->

<!-- 当使用 document.write() 方法插入脚本元素时，这些脚本通常会执行（通常会阻塞进一步的脚本执行或HTML解析）。而当使用 innerHTML 和 outerHTML 属性插入脚本元素时，它们根本不会执行。
（`document.write`是一个在文档仍在解析时向文档流中写入内容的方法。） -->

<!-- document.write() 写入async脚本，async属性也会生效，毕竟相当于就在当前的解析流程中解析到了async属性的script一样。
innerHTML确实不会执行里面的代码。 -->