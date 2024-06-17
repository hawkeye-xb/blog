---
title: "从一道实战题看手写Promise"
date: 2024-06-13T07:47:40.000Z
draft: true
tag: ['手写面试题', 'js']
---

### 如题
今儿个朋友在重构代码的时候，和我吐槽了如下题这么个代码。让判断下调用顺序，真是Promise写出了callback的感觉。
```js
// file1
function handleSomethingUsePromise() {
  return new Promise((resolve, reject) => {
    Promise.resolve('api res') // same as http request
      .then((res) => {
        console.info('then1', res);
        resolve(true) // 
        console.info('last console');
      })
      .finally(() => {
        console.info('request api promise finally');
      })
  });
}
// file2 import file1
handleSomethingUsePromise()
  .then((res) => {
    console.info('handleSomethingUsePromise then1, res :', res);
    return 'xxx'
  })
  .then((res) => {
    console.info('handleSomethingUsePromise then2, res :', res);
  })
```
这里面夹了行`last console`的私货，是因为之前和人辩论时候，以“码”说服了别人，印象较为深刻。
[答案跳转](#答案)

### 再来一题吧
```js
setTimeout(() => {
    console.log(6)
}, 0)

new Promise((res, rej) => {
    console.log(1)
    for(var i = 0;i< 100; i++){
        i == 4 && res(i)
    }
    console.log(2)
})
.then(console.log(3))
.then(res => {
    console.log(res)
})

console.log(5)
```

### 手写
Promise有三种状态，将then、catch接收的函数用数组保存起来，等到状态切换的时候，循环回调就好了。

### 标准
要是有大哥已经阅读源码，踢我下，谢谢。    
[https://promisesaplus.com/](https://promisesaplus.com/)    
[https://github.com/v8/v8](https://github.com/v8/v8)    
[https://github.com/WebKit/WebKit](https://github.com/WebKit/WebKit)


### 答案
```js
then1 api res
last console
handleSomethingUsePromise then1, res : true
request api promise finally
handleSomethingUsePromise then2, res : xxx
```
