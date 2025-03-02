---
title: 手写面试题
date: 2024-06-08T07:47:40.000Z
draft: false
tag: ['手写面试题', 'js']
description: ''
---
### 手写call、apply、bind
区别：
- call 接收多个参数
- apply 接收数组
- bind 返回函数，不直接调用。能够分两次接收参数。

原理上就是把function挂在target对象上面，通过target.function 的方式，隐式的将执行上下文修改。
#### myCall
```js
Function.prototype.myCall = function(context = window, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('xxx');
  }

  const uniqueKey = Symbol();
  context[uniqueKey] = this;
  const res = context[uniqueKey](...args);
  delete context[uniqueKey];

  return res;
}
```
#### myApply
```js
Function.prototype.myApply = function(context = window, args = []) {
  if (typeof this !== 'function') {
    throw new TypeError('xxx');
  }

  if (!Array.isArray(args)) {
    throw new TypeError('xxx');
  }

  const uniqueKey = Symbol();
  context[uniqueKey] = this;
  const res = context[uniqueKey](...args);
  delete context[uniqueKey];

  return res;
}
```
#### myBind
```js
Function.prototype.myBind = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('xxx');
  }

  const callback = this;
  return function(...newArgs) {
    const uniqueKey = Symbol();
    context[uniqueKey] = callback;
    const res = context[uniqueKey](...args, ...newArgs);
    delete context[uniqueKey];

    return res;
  }
}
```

### 手写Instanceof
instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
```js
function myInstanceof(obj, constructor) {
  // 如果 obj 是 null 或 undefined，直接返回 false
  if (obj === null || obj === undefined) {
    return false;
  }

  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj);

  // 遍历原型链
  while (proto !== null) {
    // 如果找到了构造函数的 prototype 属性，返回 true
    if (proto === constructor.prototype) {
      return true;
    }
    // 继续向上查找原型链
    proto = Object.getPrototypeOf(proto);
  }

  // 如果遍历完原型链都没有找到，返回 false
  return false;
}

```

### 手写new
```js
const myNew = (constructor, ...args) => {
  // 1. 创建proto 指向构造函数prototype的对象
  const that = Object.create(constructor.prototype);
  // 2. 调用构造函数。传入参数
  const obj =  constructor.apply(that, args);
  
  if(obj && typeof obj === 'object') {
    return obj;
  } else {
    return that;
  }
}
```

### 手写Sort
[手写sort](./MySort.md)
