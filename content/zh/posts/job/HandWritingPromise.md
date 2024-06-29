---
title: "99%手写的Promise都没法过的case"
date: 2024-06-29T07:47:40.000Z
draft: false
tag: ['手写面试题', 'js']
---
<!-- 2024-06-13T07:47:40.000Z -->
### 如题
今儿个朋友在重构代码的时候，和我吐槽了如下题这么个代码。让判断下调用顺序，真是Promise写出了callback的感觉。    
先不看答案，试试能不能看出来答案。   
这道题可以说99%手写的promise都不能正确输出。（目前使用的是Google Chrome 125.0.6422.176 正式版本，arm64架构）。
```js
// file1
function handleSomethingUsePromise() {
  return new Promise((resolve, reject) => {
    Promise.resolve('api res') // same as http request
      .then((res) => {
        console.info('then1', res);
        resolve(true)
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
[不能直接跑代码的可以跳转查看答案](#如题的答案)

### 再上点儿难度
```ts
// file1
function handleSomethingUsePromise() {
  return new Promise((resolve, reject) => {
    Promise.resolve('api res') // same as http request
      .then((res) => {
        console.info('then1', res);
        resolve(true);
        console.info('last console');
        resolve(false);
      })
      .finally(() => {
        console.info(`request api promise finally`);
        return '我是finally';
      })
      .then((res) => {
        console.info(`finally之后输出什么？${res}`)
      })
  });
}
// file2 import file1
var p = handleSomethingUsePromise()
  .then((res) => {
    console.info('handleSomethingUsePromise then1, res :', res);
    return 'xxx'
  })
  .then((res) => {
    console.info('handleSomethingUsePromise then2, res :', res);
  })
  .finally((res) => {
    console.info('新增的finally')
  })
p.then((res) => {
  console.info('ppp');
})

```
[不能直接跑代码的可以跳转查看答案](#再上点儿难度的答案)
### 另外一题
把上面的题目给另外一个小伙伴，给出的另外一题。
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

<!-- ### 手写
Promise有三种状态，将then、catch接收的函数用数组保存起来，等到状态切换的时候，循环回调就好了。

### 标准
[https://promisesaplus.com/](https://promisesaplus.com/)    
[https://github.com/v8/v8](https://github.com/v8/v8)    
[https://github.com/WebKit/WebKit](https://github.com/WebKit/WebKit) -->


### 【如题】的答案
```js
then1 api res
handleSomethingUsePromise then1, res : true
request api promise finally
handleSomethingUsePromise then2, res : xxx
```
### 【再上点儿难度】的答案
```js
then1 api res
last console
handleSomethingUsePromise then1, res : true
request api promise finally
handleSomethingUsePromise then2, res : xxx
新增的finally
finally之后输出什么？undefined
ppp
```
### 【另外一题的答案】
```js
1
2
3
5
4
undefined
6
```

### 给题不给解，xxxxx
<!-- queueMicrotask、MutationObserver
https://developer.mozilla.org/zh-CN/docs/Web/API/queueMicrotask -->
