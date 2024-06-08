---
title: 汇总
date: 2024-06-03
draft: true
---
### 从应用场景去复习面试题

### 给版本号排序
```js
var versions = ['2.0.1', '1.1.0', '1.0.2', '2.0.0', '1.0.0', '3.0.10', '2.1.10', '2.0.0'];

versions.sort((a, b) => {
    const alist = a.split('.');
    const blist = b.split('.');

    for (let i = 0; i < alist.length; i ++) {
        if (alist[i] > blist[i]) {
            return 1;
        } else if (alist[i] < blist[i]) {
            return -1;
        } else {
            continue;
        }
    }

    return 0;
})
```
### sort是怎么实现的
| compareFn(a, b) 返回值 | 排序顺序 |
| ---- | ---- |
| > 0 | a 在 b 后，如 [b, a] |
| < 0 | a 在 b 前，如 [a, b] |
| === 0 | 保持 a 和 b 原来的顺序 |

```js
const MySort = function (list, compareFn) {
    if (!compareFn) throw "compareFn is not a function";
    if (list.length <= 1) return list;
    // null list fn ...
    const mid = Math.floor(list.length / 2);
    const midValue = list[mid];
    const beforeList = [];
    const midList = []
    const afterList = [];

    for(let i = 0; i < list.length; i ++) {
        if (
            compareFn(list[i], list[mid]) < 0
        ) {
            beforeList.push(list[i])
        } else if (
            compareFn(list[i], list[mid]) > 0
        ) {
            afterList.push(list[i])
        } else {
            midList.push(list[i])
        }
    }

    return [].concat(
        MySort(beforeList, compareFn),
        midList,
        MySort(afterList, compareFn)
    )
}
```

（别的实现方式）

### SPA和传统页面的区别
微前端会涉及

<!-- 掌握诸如Webpack等构建工具的使用; -->
### Webpack
#### 常用有哪些参数
#### loader 和plugin的区别
#### babel loader是怎么工作的
#### eslint 是怎么工作的
#### verify 是怎么工作的

### Vite 和 Webpack的区别
#### vite在开发electron 项目主进程的过程中，会有什么优势吗？


### node和浏览器的事件循环有什么区别