---
title: 从版号排序到手写Sort
date: 2024-06-03
draft: false
tag: ['手写面试题', 'js']
---

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
