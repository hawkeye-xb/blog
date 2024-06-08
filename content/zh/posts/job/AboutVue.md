---
title: Vue相关
date: 2024-06-07
draft: true
---
### SPA单页面应用 和MPA多页面应用的区别
### 为什么data属性是一个函数而不是一个对象？
[文档](https://v2.cn.vuejs.org/v2/guide/components.html#data-%E5%BF%85%E9%A1%BB%E6%98%AF%E4%B8%80%E4%B8%AA%E5%87%BD%E6%95%B0) 已经不是很可以考究了。
```
/*
const Sub = function VueComponent(this: any, options: any) {
	this._init(options)
} as unknown as typeof Component
* */

function initData(vm) {
  // 获取组件选项中的数据
  let data = vm.$options.data;

  // 将数据赋值给vm._data，并根据数据类型进行处理
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};

  /*
    这里的关键在于，`data`是从`vm.$options.data`引用而来的。
    如果`data`是一个对象，那么当这个组件有多个实例时，它们都会使用同一个`data`对象。
    这会导致数据共享，而不是每个实例拥有独立的数据。

    如果`data`是一个函数，Vue会使用`getData`方法（这是一个包装器，用于执行`data`函数，并添加了一些错误处理）。
    然后返回一个新的对象，这个对象只属于当前正在初始化的`vm`实例。
  */

  // 对数据进行观察（即设置响应式）
  observe(data, true);

  // 省略了其他代码...
}
```
### vue的生命周期
`beforeCreated -> created -> beforeMounted -> Mounted -> beforeUpdated -> updated -> beforeDestroy -> destroyed`
beforeCreated: 初始化双向数据绑定。还没有实例，this无法访问。
created: 实例创建完成，可以访问this，调用methods等。还没开始模板编译，不能访问DOM或者组件。可以发起数据请求，要注意还没发操作DOM。
beforeMounted: 模板编译完成。（子beforeCreate-> ... -> 子mounted）
Mounted: 组件已经被挂载到 DOM 中，可以访问到真实的 DOM 元素。（会出现子为mounted吗？）
### 其它
#### v-show 和 v-if的区别
v-show有Dom元素，使用`display:none` 的方式隐藏。v-if 隐藏时候不会创建元素。
#### v-if 和 v-for
当v-if和v-for一起使用时，Vue.js需要先遍历整个列表，然后对每个项进行条件判断。这可能导致不必要的DOM操作，从而影响性能。
#### nextTick
`Promise.then、MutationObserver、setImmediate、setTimeout`依次降级