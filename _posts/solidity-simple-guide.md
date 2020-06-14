---
date: 2018-09-04T21:36:53+08:00
title: "Solidity 简易教程"
author: goodspeed
permalink: /post/Solidity-simple-guide
description: "Solidity 简易教程"
tags: ["区块链", "以太坊", "tutorial"]
categories: ["区块链", "后端"]
---

>  Solidity是以太坊的主要编程语言，它是一种静态类型的 JavaScript-esque 语言，是面向合约的、为实现智能合约而创建的高级编程语言，设计的目的是能在以太坊虚拟机（EVM）上运行。
>  
>  本文基于CryptoZombies，教程地址为：https://cryptozombies.io/zh/


###  合约


Solidity 的代码都包裹在**合约**里面. 一份`合约`就是以太应币应用的基本模块， 所有的变量和函数都属于一份合约, 它是你所有应用的起点.

一份名为 `HelloWorld` 的空合约如下:

```javascript
contract HelloWorld {

}
```


#### hello world

首先看一个简单的智能合约。

```javascript
pragma solidity ^0.4.0;

contract SimpleStorage {
    uint storedData; // 声明一个类型为 uint (256位无符号整数）的状态变量，叫做 storedData

    function set(uint x) public {
        storedData = x; // 状态变量可以直接访问，不需要使用 this. 或者 self. 这样的前缀
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
```




所有的 Solidity 源码都必须冠以 "version pragma" — 标明 Solidity 编译器的版本. 以避免将来新的编译器可能破坏你的代码。

例如: `pragma solidity ^0.4.0;` (当前 Solidity 的最新版本是 0.4.0).

> 关键字 `pragma` 的含义是，一般来说，pragmas（编译指令）是告知编译器如何处理源代码的指令的（例如， [pragma once](https://en.wikipedia.org/wiki/Pragma_once) ）。



Solidity中合约的含义就是一组代码（它的 *函数* )和数据（它的 *状态* ），它们位于以太坊区块链的一个特定地址上。

该合约能完成的事情并不多：它能允许任何人在合约中存储一个单独的数字，并且这个数字可以被世界上任何人访问，且没有可行的办法阻止你发布这个数字。当然，任何人都可以再次调用 `set` ，传入不同的值，覆盖你的数字，但是这个数字仍会被存储在区块链的历史记录中。



> Solidity 语句以分号（**;**）结尾



### 状态变量

**状态变量**是被永久地保存在合约中。也就是说它们被写入以太币区块链中，想象成写入一个数据库。



```javascript
contract HelloWorld {
   // 这个无符号整数将会永久的被保存在区块链中
   uint myUnsignedInteger = 100;
}
```


在上面的例子中，定义 `myUnsignedInteger` 为 `uint` 类型，并赋值100。

> `uint` 无符号数据类型， 指**其值不能是负数**，对于有符号的整数存在名为 `int` 的数据类型。
>
> Solidity中， `uint` 实际上是 `uint256`代名词， 一个256位的无符号整数。



程序有时需要对不同类型的数据进行操作，因为 Solidity 是静态类型语言，对不同类型的数据进行运算会抛出异常，比如：

```go
uint8 a = 5;
uint b = 6;
// 将会抛出错误，因为 a * b 返回 uint, 而不是 uint8:
uint8 c = a * b;
```

`a * b` 返回类型是 `uint`, 但是当我们尝试用 `uint8` 类型接收时, 就会造成潜在的错误。这时，就需要显式的进行数据类型转换：

```go
// 我们需要将 b 转换为 uint8:
uint8 c = a * uint8(b);
```



> 把它的数据类型转换为 `uint8`, 就可以了，编译器也不会出错。



Solidity 支持多种数据类型，比如：

* string（字符串）：字符串用于保存任意长度的 UTF-8 编码数据
* fixedArray（静态数组）：固定长度的数组
* dynamicArray（动态数组）：长度不固定，可以动态添加元素的数组
* enum（枚举）
* mapping
* 等



### 数学运算



在 Solidity 中，数学运算很直观明了，与其它程序设计语言相同:

- 加法: `x + y`
- 减法: `x - y`,
- 乘法: `x * y`
- 除法: `x / y`
- 取模 / 求余: `x % y` *(例如, 13 % 5 余 3, 因为13除以5，余3)*
- 乘方: `x ** y`



### 结构体



Solidity 提供了 `结构体`，用来表示更复杂的数据类型。



```c
struct Person {
  uint age;
  string name;
}
```

结构体允许你生成一个更复杂的数据类型，它有多个属性。

创建结构体方式为：



```go
// 创建一个新的Person:
Person satoshi = Person(172, "Satoshi");
```



### 数组

Solidity 提供两种类型的数组：`静态数组`和`动态数组`。



```go
// 固定长度为2的静态数组:
uint[2] fixedArray;
// 固定长度为5的string类型的静态数组:
string[5] stringArray;
// 动态数组，长度不固定，可以动态添加元素:
uint[] dynamicArray;
```

使用 push 函数向数组中添加值：

```javascript
fixedArray.push[123] 
fixedArray.push[234]
// fixedArray 值为 [123, 234]
```

> `array.push()` 在数组的 **尾部** 加入新元素 ，所以元素在数组中的顺序就是添加的顺序
> `array.push()` 会返回数组的长度。


Solidity 数组支持多种类型，比如结构体：


```c
struct Person {
  uint age;
  string name;
}

Person[] people; // dynamic Array, we can keep adding to it
```



结构体类型的数组添加值的方式为：

```c
people.push(Person(16, "Vitalik"));
// 也可以使用下面的方式，推荐使用上述一行简洁的方式

Person satoshi = Person(172, "Satoshi");
people.push(satoshi);
```



#### 公共数组



也可以使用`public`定义公共数组，Solidity 会自动创建`getter`方法。语法如下：

```c
struct Person {
  uint age;
  string name;
}

Person[] public people; // dynamic Array, we can keep adding to it
```



> 公共数组支持其它的合约读取数据（但不能写入数据），所以这在合约中是一个有用的保存公共数据的模式。（有点像全局变量，所有合约共享同一个“内存空间“，厉害了！）



### 函数



Solidity 中，函数定义如下：

```javascript
function eatHamburgers(string _name, uint _amount) {

}
```



> `Solidity`  习惯上函数里的变量都是以(**_**)开头 (但不是硬性规定) 以区别全局变量。



这是一个名为 `eatHamburgers` 的函数，它接受两个参数：一个 `string`类型的 和 一个 `uint`类型的。现在函数内部还是空的。

函数调用如下：



```go
eatHamburgers("vitalik", 100);
```



#### 私有/公共函数



Solidity 函数分为私有函数和共有函数。

> Solidity 定义的函数的属性默认为`公共`。 这就意味着任何一方 (或其它合约) 都可以调用你合约里的函数。



显然，不是什么时候都需要这样，而且这样的合约易于受到攻击。所以将自己的函数定义为`私有`是一个好的编程习惯，只有当你需要外部世界调用它时才将它设置为`公共`。
>
> 可以把所有的函数都显式的声明 `public`和`private`来规避这个问题。



定义私有函数比较简单，只需要在函数参数后添加 `private`关键字即可。示例如下：



```go
uint[] numbers;

function _addToArray(uint _number) private {
  numbers.push(_number);
}
```



这意味着只有我们合约中的其它函数才能够调用这个函数，给 `numbers`数组添加新成员。

> 和函数的参数类似，私有函数的名字用(`_`)起始。



> `注意：`在智能合约中你所用的一切都是公开可见的，即便是局部变量和被标记成 `private` 的状态变量也是如此。



#### 返回值

和其它语言一样，Solidity 函数也有返回值，示例如下：



```go
string greeting = "What's up dog";

function sayHello() public returns (string) {
  return greeting;
}
```



返回值使用 `returns`关键字标注。（已经是非常奇怪的写法了。。）



#### 修饰符



##### view

> `constant` 是 `view` 的别名



```go
string greeting = "What's up dog";

function sayHello() public returns (string) {
  return greeting;
}
```



像 `sayHello` 函数这种实际上没有改变合约中数据内容的情况，可以把函数定义为`view`，这意味着此函数只读不修改数据。可以使用以下声明方式：



```javascript
function sayHello() public view returns (string) {}
```

可以将函数声明为 `view` 类型，这种情况下要保证不修改状态。

下面的语句被认为是修改状态：

1. 修改状态变量。
2. [产生事件](https://solidity-cn.readthedocs.io/zh/develop/contracts.html#events)。
3. [创建其它合约](https://solidity-cn.readthedocs.io/zh/develop/control-structures.html#creating-contracts)。
4. 使用 `selfdestruct`。
5. 通过调用发送以太币。
6. 调用任何没有标记为 `view` 或者 `pure` 的函数。
7. 使用低级调用。
8. 使用包含特定操作码的内联汇编。



##### pure

pure 比 view 更轻量，使用这个修饰符修饰的函数甚至都不会读取合约中的数据，例如：

```javascript
function _multiply(uint a, uint b) private pure returns (uint) { return a * b; }
```

这个函数没有读取应用里的状态，它的返回值只和它输入的参数相关。



>  Solidity 编辑器会给出提示，提醒你使用 pure/view修饰符。



函数可以声明为 `pure` ，在这种情况下，承诺不读取或修改状态。

除了上面解释的状态修改语句列表之外，以下被认为是从状态中读取：

1. 读取状态变量。
2. 访问 `this.balance` 或者 `<address>.balance`。
3. 访问 `block`，`tx`， `msg` 中任意成员 （除 `msg.sig` 和 `msg.data` 之外）。
4. 调用任何未标记为 `pure` 的函数。
5. 使用包含某些操作码的内联汇编。



##### payable



payable 关键字用来说明，这个函数可以接受以太币，如果没有这个关键字，函数会自动拒绝所有发送给它的以太币。   



### 事件

**事件** 是合约和区块链通讯的一种机制。你的前端应用“监听”某些事件，并做出反应。例如：



```javascript
// 这里建立事件
event IntegersAdded(uint x, uint y, uint result);

function add(uint _x, uint _y) public {
  uint result = _x + _y;
  //触发事件，通知app
  IntegersAdded(_x, _y, result);
  return result;
}
```



用户界面（当然也包括服务器应用程序）可以监听区块链上正在发送的事件，而不会花费太多成本。一旦它被发出，监听该事件的listener都将收到通知。而所有的事件都包含了 `from` ， `to` 和 `amount` 三个参数，可方便追踪事务。 为了监听这个事件，你可以使用如下代码（javascript 实现）：



```javascript
var abi = /* abi 由编译器产生 */;
var ClientReceipt = web3.eth.contract(abi);
var clientReceipt = ClientReceipt.at("0x1234...ab67" /* 地址 */);

var event = clientReceipt.IntegersAdded();

// 监视变化
event.watch(function(error, result){
    // 结果包括对 `Deposit` 的调用参数在内的各种信息。
    if (!error)
        console.log(result);
});

// 或者通过回调立即开始观察
var event = clientReceipt.IntegersAdded(function(error, result) {
    if (!error)
        console.log(result);
});
```





### 代码示例

下面是一个完整的代码示例：


```javascript
pragma solidity ^0.4.19;

contract ZombieFactory {

    // 建立事件
    event NewZombie(uint zombieId, string name, uint dna);

    uint dnaDigits = 16;  // 定义状态变量
    uint dnaModulus = 10 ** dnaDigits;

    struct Zombie {  // 定义结构体
        string name;
        uint dna;
    }

    Zombie[] public zombies;  // 定义动态数组

    // 创建私有函数，私有函数命名使用 _ 前缀
    function _createZombie(string _name, uint _dna) private {
        // 函数参数命名 使用 _ 作为前缀
        // arrays.push() 将元素加入到数组尾部，并且返回数组的长度
        uint id = zombies.push(Zombie(_name, _dna)) - 1;
        // 触发事件
        NewZombie(id, _name, _dna);
    }

    // view 为函数修饰符，表示此函数不需要更新或创建状态变量
    // pure 表示函数不需要使用状态变量
    function _generateRandomDna(string _str) private view returns (uint) {
        // 使用 keccak256 创建一个伪随机数
        uint rand = uint(keccak256(_str));
        return rand % dnaModulus;
    }

    function createRandomZombie(string _name) public {
        uint randDna = _generateRandomDna(_name);
        _createZombie(_name, randDna);
    }

}

```

> Ethereum 内部有一个散列函数keccak256，它用了SHA3版本。一个散列函数基本上就是把一个字符串转换为一个256位的16进制数字。
> 在智能合约中使用随机数很难保证节点不作弊， 这是因为智能合约中的随机数一般要依赖计算节点的本地时间得到， 而本地时间是可以被恶意节点伪造的，因此这种方法并不安全。 通行的做法是采用 链外off-chain 的第三方服务，比如 Oraclize 来获取随机数）。


### 参考链接

- [Solidity 文档: https://solidity-cn.readthedocs.io/zh/develop/index.html](https://solidity-cn.readthedocs.io/zh/develop/index.html)
- [cryptozombie-lessons: https://cryptozombies.io/zh/](https://cryptozombies.io/zh/)


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![](http://media.gusibi.mobi/ah0mqMXMtdJb9Yj03suu-NGEyVRxyEuOIT5bXSv7ip5aqtHkiRjTTl8SMRMv3Qp5?)
