---
title: js this 题目
date: 2024-06-10T07:47:40.000Z
draft: true
---
一个函数作为普通函数被调用（而不是作为对象的方法、通过 new 关键字、call、apply 或 bind 方法调用）时，在非严格模式下，函数内部的 this 将指向全局对象。在严格模式下，this 将是 undefined。这是 JavaScript 中 this 绑定的一个基本规则。

箭头函数不会创建自己的this上下文，而是继承外层作用域的this。这意味着箭头函数内部的this是在函数定义时确定的，而不是在函数调用时。
<!-- 谁调用的，就是谁。
箭头函数则是定义时候是谁，就是谁。 -->

### 题目一：
```ts
var name = 'window';

var person = {
    name: 'person',
    sayName: function() {
        return function() {
            console.log(this.name);
        };
    }
};

person.sayName()(); // 输出什么？
```
### 题目二：
注意console的是that
```ts
var name = 'window';

var person = {
    name: 'person',
    sayName: function() {
        var that = this;
        return function() {
            console.log(that.name);
        };
    }
};

person.sayName()(); // 输出什么？
```
### 考题三：
```ts
var name = 'window';

var person = {
    name: 'person',
    sayName: function() {
        return () => {
            console.log(this.name);
        };
    }
};

person.sayName()(); // 输出什么？
```
### 考题四：
```ts
var name = 'window';

function Person(name) {
    this.name = name;
    this.sayName = function() {
        console.log(this.name);
    };
}

var john = new Person('John');
var sayJohnName = john.sayName;
sayJohnName(); // 输出什么？
```
### 考题五：
```ts
var name = 'window';

function Person(name) {
    this.name = name;
    this.sayName = function() {
        console.log(this.name);
    };
}

var john = new Person('John');
var sayJohnName = john.sayName.bind(john);
sayJohnName(); // 输出什么？
```
### 考题六：
```ts
var name = 'window';

var person = {
    name: 'person',
    friends: ['Tom', 'Jerry'],
    introduce: function() {
        this.friends.forEach(function(friend) {
            console.log(this.name + ' knows ' + friend);
        });
    }
};

person.introduce(); // 输出什么？
```
### 考题七：
```ts
var name = 'window';

function Person(name) {
    this.name = name;
    this.sayName = function() {
        console.log(this.name);
    };
}

var john = new Person('John');
var sayJohnName = john.sayName;
var anotherPerson = { name: 'Another Person' };
sayJohnName.call(anotherPerson); // 输出什么？
```
### 考题一答案：
输出：window。

person.sayName()返回了一个新的函数，然后这个新函数**被直接调用**，所以this指向全局对象。
### 考题二答案：
输出：person。

因为that变量捕获了sayName方法调用时的this，即person对象，所以即使内部函数**被直接调用**，that.name仍然指向person对象的name属性。
### 考题三答案：
输出：person。

person.sayName() 函数执行时候定义的箭头函数，其中的this继承自定义时的外部作用域，即sayName方法的this，也就是person对象。
### 考题四答案：
输出：window。

因为sayJohnName函数**被直接调用。**
### 考题五答案：
答案：John。

因为sayJohnName函数是通过bind方法绑定到john对象的，所以无论它如何被调用，this都指向john对象。
### 考题六答案：
```ts
this.friends.forEach(function(friend) {
		console.log(this.name + ' knows ' + friend);
}.bind(this));
```

```ts
this.friends.forEach(friend => {
		console.log(this.name + ' knows ' + friend);
});
```
