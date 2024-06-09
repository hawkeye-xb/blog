---
title: 手写面试题
date: 2024-06-08T07:47:40.000Z
draft: false
tags: ['手写']
---

### 手写Instanceof
instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
```js
function myInstanceof(left, right) {
  // 如果 left 不是对象，直接返回 false
  if (typeof left !== 'object' || left === null) return false;
  // 获取left对象的原型;
  let proto = Object.getPrototypeOf(left)
  // 构造函数的 prototype 对象是否在对象的原型链上
  while (true) {
    if (!proto) return false;
    if (proto === right.prototype) return true;

    // 如果没有找到，就继续从其原型上找，Object.getPrototypeOf方法用来获取指定对象的原型
    proto = Object.getPrototypeOf(proto);
  }
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
