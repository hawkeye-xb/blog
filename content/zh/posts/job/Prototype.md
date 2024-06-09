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

结合以下图片观看更直观
![prototype.png](https://s2.loli.net/2024/06/09/w6dvK1x9Tibntep.png)

那了解这个有什么用处吗？
### 属性继承
属性继承，实例在当前找不到属性值的时候，会尝试在它的原型链上查找。
```js
var o = {
	a: 1, 
	b: 2,
	__proto__: {
    b: 3,
    c: 4,
  }
};
Object.prototype.e = 5;

o.__proto__ === Object.prototype // false
o.e // 5 这里还能输出是因为 o.__proto__.__proto__ === Object.prototype

new Object().e // 5
new Object().__proto__ === Object.prototype // true
```
【警告：有一个常见的错误实践（misfeature）：扩展 Object.prototype 或其它内置原型。】

### 继承
一组属性应该出现在每一个实例上，那我们就可以重用它们——尤其是对于方法。
```js
function Parent(name) {
	this.name = name;
}
Parent.prototype.sayHello = function() {
	return "Hello, " + this.name;
};
new Parent('xixi').sayHello(); // 'Hello, xixi'
```
很简易的，就能实现类似继承的能力。通过查看属性，发现new新创建实例中，并不存在`prototype`，如果想要再继承这个实例，创建新的实例，需要将原型和构造函数补充完整。

假设创建Child类：
```js
function Child(name, age) {
	Parent.call(this, name); // 调用父类构造函数，继承属性
	this.age = age;
}

Child.prototype = Object.create(Parent.prototype); // 创建一个父类原型的新实例作为子类的原型
Child.prototype.constructor = Child; // 修正子类的构造函数指向

// 额外的，Child 特有的函数
Child.prototype.sayAge = function() {
	return "I am " + this.age + " years old";
};
var child = new Child("Tom", 10);
console.log(child.sayHello()); // 输出: Hello, Tom
console.log(child.sayAge());  // 输出: I am 10 years old
```


