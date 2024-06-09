---
title: 原型链
date: 2024-06-07T07:47:40.000Z
draft: false
---

当谈到继承时，JavaScript 只有一种结构：对象。每个实例对象（object）都有一个私有属性（称之为 proto ）指向它的构造函数的原型对象（prototype）。该原型对象也有一个自己的原型对象（proto），层层向上直到一个对象的原型对象为 null。根据定义，null 没有原型，并作为这个原型链中的最后一个环节。

MDN Web Doc: 继承与原型链

官方非常直观的表述，可以通过代码直接观察到。假设：
```js
function Foo() { console.log('this is Foo') };
var obj = new Object({ name: 'first object' });
const foo1 = new Foo();

foo1.__proto__ === Foo.prototype // true 
Foo.__proto__ === Function.prototype // true

Function.__proto__ === Object.prototype // false ☆☆☆
Function.prototype // ƒ () { [native code] }
Function.__proto__ === Function.prototype // true

Object.__proto__ === Function.prototype // true
Object.prototype.__proto__ === null // true

Function.prototype.__proto__ === Object.prototype // true
obj.__proto__ === Object.prototype // true
```
可以看到中间混进去了个`false`，正常实例的`prototype`会是个对象，也就是它的原型对象是`object（小写）`，所以它`Function.prototype.__proto__ === Object.prototype`，而`Object.prototype.__proto__`的原型对象已经没有可以依赖的了，指向了`null`。

因为`Object`构造函数本身也是一个函数，而所有函数都是通过`Function`构造函数创建的。
所以`Object.__proto__ === Function.prototype`反而会是`true`。

`Function`构造函数也是个函数，它自己指向了自身的prototype `Function.__proto__ === Function.prototype // true`。


