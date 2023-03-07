---
date: "2018-10-22T21:36:53+08:00"
draft: false
title: "Solidity 简易教程0x001"
slug: "Solidity-simple-guide-001"
description: "Solidity 简易教程0x001"
tags: ["区块链", "以太坊", "tutorial"]
categories: ["区块链", "后端"]
---

>  Solidity是以太坊的主要编程语言，它是一种静态类型的 JavaScript-esque 语言，是面向合约的、为实现智能合约而创建的高级编程语言，设计的目的是能在以太坊虚拟机（EVM）上运行。
>  
>  `本文基于CryptoZombies，教程地址为：https://cryptozombies.io/zh/lesson/2`


### 地址（address）

以太坊区块链由 account (账户)组成，你可以把它想象成银行账户。一个帐户的余额是以太 （在以太坊区块链上使用的币种），你可以和其他帐户之间支付和接受以太币，就像你的银行帐户可以电汇资金到其他银行帐户一样。

每个帐户都有一个“地址”，你可以把它想象成银行账号。这是账户唯一的标识符，它看起来长这样：

```
0x0cE446255506E92DF41614C46F1d6df9Cc969183
```

> 这是 CryptoZombies 团队的地址，为了表示支持CryptoZombies，可以赞赏一些以太币！


`address`：地址类型存储一个 20 字节的值（以太坊地址的大小）。 地址类型也有成员变量，并作为所有合约的基础。


> `address` 类型是一个160位的值，且不允许任何算数操作。这种类型适合存储合约地址或外部人员的密钥对。




### 映射（mapping）

>  Mappings 和[哈希表](https://en.wikipedia.org/wiki/Hash_table)类似，它会执行虚拟初始化，以使所有可能存在的键都映射到一个字节表示为全零的值。

映射是这样定义的：

```javascript
//对于金融应用程序，将用户的余额保存在一个 uint类型的变量中：
mapping (address => uint) public accountBalance;
//或者可以用来通过userId 存储/查找的用户名
mapping (uint => string) userIdToName;
```

映射本质上是存储和查找数据所用的键-值对。在第一个例子中，键是一个 address，值是一个 uint，在第二个例子中，键是一个uint，值是一个 string。

> 映射类型在声明时的形式为 mapping(_KeyType => _ValueType)。 其中 _KeyType 可以是除了映射、变长数组、合约、枚举以及结构体以外的几乎所有类型。 _ValueType 可以是包括映射类型在内的任何类型。

对映射的取值操作如下：

```javascript
userIdToName[12]
// 如果键12 不在 映射中，得到的结果是0
```


> 映射中，实际上并不存储 key，而是存储它的 keccak256 哈希值，从而便于查询实际的值。所以**映射是没有长度的，也没有 key 的集合或 value 的集合的概念。**，你不能像操作`python`字典那应该获取到当前 Mappings 的所有键或者值。


### 特殊变量

在 Solidity 中，在全局命名空间中已经存在了（预设了）一些特殊的变量和函数，他们主要用来提供关于区块链的信息或一些通用的工具函数。

#### msg.sender

 msg.sender指的是当前调用者（或智能合约）的 address。

> 注意：在 Solidity 中，功能执行始终需要从外部调用者开始。 一个合约只会在区块链上什么也不做，除非有人调用其中的函数。所以对于每一个**外部函数**调用，包括 msg.sender 和 msg.value 在内所有 msg 成员的值都会变化。这里包括对库函数的调用。


以下是使用 msg.sender 来更新 mapping 的例子：

```javascript
mapping (address => uint) favoriteNumber;

function setMyNumber(uint _myNumber) public {
  // 更新我们的 `favoriteNumber` 映射来将 `_myNumber`存储在 `msg.sender`名下
  favoriteNumber[msg.sender] = _myNumber;
  // 存储数据至映射的方法和将数据存储在数组相似
}

function whatIsMyNumber() public view returns (uint) {
  // 拿到存储在调用者地址名下的值
  // 若调用者还没调用 setMyNumber， 则值为 `0`
  return favoriteNumber[msg.sender];
}
```

在这个小小的例子中，任何人都可以调用 setMyNumber 在我们的合约中存下一个 uint 并且与他们的地址相绑定。 然后，他们调用 whatIsMyNumber 就会返回他们存储的 uint。

使用 msg.sender 很安全，因为它具有以太坊区块链的安全保障 —— 除非窃取与以太坊地址相关联的私钥，否则是没有办法修改其他人的数据的。

以下是其它的一些特殊变量。

#### 区块和交易属性

- block.blockhash(uint blockNumber) returns (bytes32)：指定区块的区块哈希——仅可用于最新的 256 个区块且不包括当前区块；而 blocks 从 0.4.22 版本开始已经不推荐使用，由 blockhash(uint blockNumber) 代替
- block.coinbase (address): 挖出当前区块的矿工地址
- block.difficulty (uint): 当前区块难度
- block.gaslimit (uint): 当前区块 gas 限额
- block.number (uint): 当前区块号
- block.timestamp (uint): 自 unix epoch 起始当前区块以秒计的时间戳
- gasleft() returns (uint256)：剩余的 gas
- msg.data (bytes): 完整的 calldata
- msg.gas (uint): 剩余 gas - 自 0.4.21 版本开始已经不推荐使用，由 gesleft() 代替
- msg.sender (address): 消息发送者（当前调用）
- msg.sig (bytes4): calldata 的前 4 字节（也就是函数标识符）
- msg.value (uint): 随消息发送的 wei 的数量
- now (uint): 目前区块时间戳（block.timestamp）
- tx.gasprice (uint): 交易的 gas 价格
- tx.origin (address): 交易发起者（完全的调用链）


### 错误处理

Solidity 使用状态恢复异常来处理错误。这种异常将撤消对当前调用（及其所有子调用）中的状态所做的所有更改，并且还向调用者标记错误。 

函数 `assert` 和 `require` 可用于检查条件并在条件不满足时抛出异常。

* assert 函数只能用于测试内部错误，并检查非变量。 
* require 函数用于确认条件有效性，例如输入变量，或合约状态变量是否满足条件，或验证外部合约调用返回的值。

这里主要介绍 `require`

require使得函数在执行过程中，当不满足某些条件时抛出错误，并停止执行：

```javascript
function sayHiToVitalik(string _name) public returns (string) {
  // 比较 _name 是否等于 "Vitalik". 如果不成立，抛出异常并终止程序
  // (敲黑板: Solidity 并不支持原生的字符串比较, 我们只能通过比较
  // 两字符串的 keccak256 哈希值来进行判断)
  require(keccak256(_name) == keccak256("Vitalik"));
  // 如果返回 true, 运行如下语句
  return "Hi!";
}
```

如果你这样调用函数 `sayHiToVitalik("Vitalik")` ,它会返回“Hi！”。而如果调用的时候使用了其他参数，它则会抛出错误并停止执行。

因此，在调用一个函数之前，用 require 验证前置条件是非常有必要的。

> 注意：在 Solidity 中，关键词放置的顺序并不重要

```javascript
// 以下两个语句等效
require(keccak256(_name) == keccak256("Vitalik"));
require(keccak256("Vitalik") == keccak256(_name));
```

### 外/内部函数

除 public 和 private 属性之外，Solidity 还使用了另外两个描述函数可见性的修饰词：internal（内部） 和 external（外部）。

`internal` 和 `private` 类似，不过，如果某个合约继承自其父合约，这个合约即可以访问父合约中定义的`“内部(internal)”函数`。

`external` 与`public` 类似，只不过`external`函数只能在合约之外调用 - 它们不能被合约内的其他函数调用。

声明函数 internal 或 external 类型的语法，与声明 private 和 public类 型相同：

```javascript
contract Sandwich {
  uint private sandwichesEaten = 0;

  function eat() internal {
    sandwichesEaten++;
  }
}

contract BLT is Sandwich {
  uint private baconSandwichesEaten = 0;

  function eatWithBacon() public returns (string) {
    baconSandwichesEaten++;
    // 因为eat() 是internal 的，所以我们能在这里调用
    eat();
  }
}
```

Solidity 有两种函数调用（内部调用不会产生实际的 EVM 调用或称为`消息调用`，而外部调用则会产生一个 EVM 调用）， 函数和状态变量有四种可见性类型。 函数可以指定为 external ，public ，internal 或者 private，默认情况下函数类型为 public。 对于状态变量，不能设置为 external ，默认是 internal 。

* `external ：`
外部函数作为合约接口的一部分，意味着我们可以从其他合约和交易中调用。 一个外部函数 f 不能从内部调用（即 f 不起作用，但 this.f() 可以）。 当收到大量数据的时候，外部函数有时候会更有效率。

* `public ：`
public 函数是合约接口的一部分，可以在内部或通过消息调用。对于公共状态变量， 会自动生成一个 getter 函数。

* `internal ：`
这些函数和状态变量只能是内部访问（即从当前合约内部或从它派生的合约访问），不使用 this 调用。

* `private ：`
private 函数和状态变量仅在当前定义它们的合约中使用，并且不能被派生合约使用。

> 合约中的所有内容对外部观察者都是可见的。设置一些 private 类型只能阻止其他合约访问和修改这些信息， 但是对于区块链外的整个世界它仍然是可见的。


可见性标识符的定义位置，对于状态变量来说是在类型后面，对于函数是在参数列表和返回关键字中间。

```javascript
pragma solidity ^0.4.16;

contract C {
    // 对于函数是在参数列表和返回关键字中间。
    function f(uint a) private pure returns (uint b) { return a + 1; }
    function setData(uint a) internal { data = a; }
    uint public data;  // 对于状态变量来说是在类型后面
}
```

### 函数多值返回

和 python 类似，Solidity 函数支持多值返回，比如：

```javascript

function multipleReturns() internal returns(uint a, uint b, uint c) {
  return (1, 2, 3);
}

function processMultipleReturns() external {
  uint a;
  uint b;
  uint c;
  // 这样来做批量赋值:
  (a, b, c) = multipleReturns();
}

// 或者如果我们只想返回其中一个变量:
function getLastReturnValue() external {
  uint c;
  // 可以对其他字段留空:
  (,,c) = multipleReturns();
}

```

> 这里留空字段使用`,`的方式太不直观了，还不如 python/go 使用下划线`_`代替无用字段。


### Storage与Memory

在 Solidity 中，有两个地方可以存储变量 —— storage 或 memory。

Storage 变量是指永久存储在区块链中的变量。 Memory 变量则是临时的，当外部函数对某合约调用完成时，内存型变量即被移除。 你可以把它想象成存储在你电脑的硬盘或是RAM中数据的关系。

> storage 和 memory 放到状态变量名前边，在类型后边，格式如下：
> `变量类型 <storage|memory> 变量名`

大多数时候都用不到这些关键字，默认情况下 Solidity 会自动处理它们。 状态变量（在函数之外声明的变量）默认为“存储”形式，并永久写入区块链；而在函数内部声明的变量是“内存”型的，它们函数调用结束后消失。

然而也有一些情况下，你需要手动声明存储类型，主要用于处理函数内的 `结构体` 和 `数组` 时：

```javascript
contract SandwichFactory {
  struct Sandwich {
    string name;
    string status;
  }

  Sandwich[] sandwiches;

  function eatSandwich(uint _index) public {
    // Sandwich mySandwich = sandwiches[_index];

    // ^ 看上去很直接，不过 Solidity 将会给出警告
    // 告诉你应该明确在这里定义 `storage` 或者 `memory`。

    // 所以你应该明确定义 `storage`:
    Sandwich storage mySandwich = sandwiches[_index];
    // ...这样 `mySandwich` 是指向 `sandwiches[_index]`的指针
    // 在存储里，另外...
    mySandwich.status = "Eaten!";
    // ...这将永久把 `sandwiches[_index]` 变为区块链上的存储

    // 如果你只想要一个副本，可以使用`memory`:
    Sandwich memory anotherSandwich = sandwiches[_index + 1];
    // ...这样 `anotherSandwich` 就仅仅是一个内存里的副本了
    // 另外
    anotherSandwich.status = "Eaten!";
    // ...将仅仅修改临时变量，对 `sandwiches[_index + 1]` 没有任何影响
    // 不过你可以这样做:
    sandwiches[_index + 1] = anotherSandwich;
    // ...如果你想把副本的改动保存回区块链存储
  }
}
```

如果你还没有完全理解究竟应该使用哪一个，也不用担心 —— 在本教程中，我们将告诉你何时使用 storage 或是 memory，并且当你不得不使用到这些关键字的时候，Solidity 编译器也发警示提醒你的。

现在，只要知道在某些场合下也需要你显式地声明 storage 或 memory就够了！



### 继承


Solidity 的继承和 Python 的继承相似，支持多重继承。
看下面这个例子：

```javascript
contract Doge {
  function catchphrase() public returns (string) {
    return "So Wow CryptoDoge";
  }
}

contract BabyDoge is Doge {
  function anotherCatchphrase() public returns (string) {
    return "Such Moon BabyDoge";
  }
}

// 可以多重继承。请注意，Doge 也是 BabyDoge 的基类，
// 但只有一个 Doge 实例（就像 C++ 中的虚拟继承）。
contract BlackBabyDoge is Doge, BabyDoge {
  function color() public returns (string) {
    return "Black";
  }
}

```

`BabyDoge` 从 `Doge` 那里 `inherits（继承)`过来。 这意味着当编译和部署了 `BabyDoge`，它将可以访问 catchphrase() 和 anotherCatchphrase()和其他我们在 Doge 中定义的其他公共函数（private 函数不可访问）。

Solidity使用 is 从另一个合约派生。派生合约可以访问所有非私有成员，包括内部函数和状态变量，但无法通过 `this` 来外部访问。

#### 基类构造函数的参数

派生合约需要提供基类构造函数需要的所有参数。这可以通过两种方式来完成:

```javascript
pragma solidity ^0.4.0;

contract Base {
    uint x;
    // 这是注册 Base 和设置名称的构造函数。
    function Base(uint _x) public { x = _x; }
}

contract Derived is Base(7) {
    function Derived(uint _y) Base(_y * _y) public {
    }
}

contract Derived1 is Base {
    function Derived1(uint _y) Base(_y * _y) public {
    }
}
```
一种方法直接在继承列表中调用基类构造函数（`is Base(7)`）。 另一种方法是像 `修饰器 modifier` 使用方法一样， 作为派生合约构造函数定义头的一部分，（`Base(_y * _y)`)。 如果构造函数参数是常量并且定义或描述了合约的行为，使用第一种方法比较方便。 如果基类构造函数的参数依赖于派生合约，那么必须使用第二种方法。 如果像这个简单的例子一样，两个地方都用到了，优先使用 修饰器modifier 风格的参数。

### 抽象合约

合约函数可以缺少实现，如下例所示（请注意函数声明头由 **;** 结尾）:

```javascript
pragma solidity ^0.4.0;

contract Feline {
    function utterance() public returns (bytes32);
}
```
这些合约无法成功编译（即使它们除了未实现的函数还包含其他已经实现了的函数），但他们可以用作基类合约:

```javascript
pragma solidity ^0.4.0;

contract Feline {
    function utterance() public returns (bytes32);
}

contract Cat is Feline {
    function utterance() public returns (bytes32) { return "miaow"; }
}
```
如果合约继承自抽象合约，并且没有通过重写来实现所有未实现的函数，那么它本身就是抽象的。

### 接口（Interface）

接口类似于抽象合约，但是它们不能实现任何函数。还有进一步的限制：

* 无法继承其他合约或接口。
* 无法定义构造函数。
* 无法定义变量。
* 无法定义结构体
* 无法定义枚举。

首先，看一下一个interface的例子：

```javascript

contract NumberInterface {
  function getNum(address _myAddress) public view returns (uint);
}
```

请注意，这个过程虽然看起来像在定义一个合约，但其实内里不同：

* 首先，只声明了要与之交互的函数 —— 在本例中为 getNum —— 在其中没有使用到任何其他的函数或状态变量。
* 其次，并没有使用大括号（{ 和 }）定义函数体，单单用分号（`;`）结束了函数声明。这使它看起来像一个合约框架。

编译器就是靠这些特征认出它是一个接口的。

> 就像继承其他合约一样，合约可以继承接口。

可以在合约中这样使用接口：

```javascript
contract MyContract {
  address NumberInterfaceAddress = 0xab38...;
  // ^ 这是FavoriteNumber合约在以太坊上的地址
  NumberInterface numberContract = NumberInterface(NumberInterfaceAddress);
  // 现在变量 `numberContract` 指向另一个合约对象

  function someFunction() public {
    // 现在我们可以调用在那个合约中声明的 `getNum`函数:
    uint num = numberContract.getNum(msg.sender);
    // ...在这儿使用 `num`变量做些什么
  }
}
```

通过这种方式，只要将合约的可见性设置为`public`(公共)或`external`(外部)，它们就可以与以太坊区块链上的任何其他合约进行交互。


### 与其他合约的交互

如果一个合约需要和区块链上的其他的合约会话，则需先定义一个 interface (接口)。

先举一个简单的栗子。 假设在区块链上有这么一个合约：

```javascript
contract LuckyNumber {
  mapping(address => uint) numbers;

  function setNum(uint _num) public {
    numbers[msg.sender] = _num;
  }

  function getNum(address _myAddress) public view returns (uint) {
    return numbers[_myAddress];
  }
}
```

这是个很简单的合约，可以用它存储自己的幸运号码，并将其与调用者的以太坊地址关联。 这样其他人就可以通过地址查找幸运号码了。

现在假设我们有一个外部合约，使用 getNum 函数可读取其中的数据。

首先，我们定义 LuckyNumber 合约的 interface ：

```javascript

contract NumberInterface {
  function getNum(address _myAddress) public view returns (uint);
}
```

使用这个接口，合约就知道其他合约的函数是怎样的，应该如何调用，以及可期待什么类型的返回值。


下面是一个示例代码，会用到上边的知识点：

```javascript
pragma solidity ^0.4.19;

contract ZombieFactory {

    event NewZombie(uint zombieId, string name, uint dna);

    uint dnaDigits = 16;
    uint dnaModulus = 10 ** dnaDigits;

    struct Zombie {
        string name;
        uint dna;
    }

    Zombie[] public zombies;

    // 创建一个叫做 zombieToOwner 的映射。其键是一个uint，值为 address。映射属性为public
    mapping (uint => address) public zombieToOwner;
    // 创建一个名为 ownerZombieCount 的映射，其中键是 address，值是 uint
    mapping (address => uint) ownerZombieCount;

    function _createZombie(string _name, uint _dna) private {
        uint id = zombies.push(Zombie(_name, _dna)) - 1;
        zombieToOwner[id] = msg.sender;
        ownerZombieCount[msg.sender]++;
        NewZombie(id, _name, _dna);
    }

    function _generateRandomDna(string _str) private view returns (uint) {
        uint rand = uint(keccak256(_str));
        return rand % dnaModulus;
    }

    function createRandomZombie(string _name) public {
        // 我们使用了 require 来确保这个函数只有在每个用户第一次调用它的时候执行，用以创建初始僵尸
        require(ownerZombieCount[msg.sender] == 0);
        uint randDna = _generateRandomDna(_name);
        _createZombie(_name, randDna);
    }

}

// CryptoKitties 合约提供了getKitty 函数，它返回所有的加密猫的数据，包括它的“基因”（僵尸游戏要用它生成新的僵尸）。
// 一个获取 kitty 的接口
contract KittyInterface {
  
  // 在interface里定义了 getKitty 函数 在 returns 语句之后用分号
  function getKitty(uint256 _id) external view returns (
    bool isGestating,
    bool isReady,
    uint256 cooldownIndex,
    uint256 nextActionAt,
    uint256 siringWithId,
    uint256 birthTime,
    uint256 matronId,
    uint256 sireId,
    uint256 generation,
    uint256 genes
  );
}

//ZombieFeeding继承自 `ZombieFactory 合约
contract ZombieFeeding is ZombieFactory {
  
  // CryptoKitties 合约的地址
  address ckAddress = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
  // 创建一个名为 kittyContract 的 KittyInterface，并用 ckAddress 为它初始化 
  KittyInterface kittyContract = KittyInterface(ckAddress);
  
  function feedAndMultiply(uint _zombieId, uint _targetDna, string _species) public {
      // 确保对自己僵尸的所有权
      require(msg.sender == zombieToOwner[_zombieId]);
      // 声明一个名为 myZombie 数据类型为Zombie的 storage 类型本地变量
      Zombie storage myZombie = zombies[_zombieId];
      _targetDna = _targetDna % dnaModulus;
      uint newDna = (myZombie.dna + _targetDna) / 2;
      // Add an if statement here
      if (keccak256(_species) == keccak256("kitty")){
          newDna = newDna - newDna％100 + 99;
      }
      _createZombie("NoName", newDna);
  }
  
  function feedOnKitty(uint _zombieId, uint _kittyId) public {
    uint kittyDna;
    // 多值返回，这里只需要最后一个值
    (,,,,,,,,,kittyDna) = kittyContract.getKitty(_kittyId);
    feedAndMultiply(_zombieId, kittyDna, "kitty");
  }
}

```

> 这段代码看起来内容有点多，可以拆分一下，把 `ZombieFactory`代码提取到一个新的文件`zombiefactory.sol`，现在就可以使用 import 语句来导入另一个文件的代码。

### import

在 Solidity 中，当你有多个文件并且想把一个文件导入另一个文件时，可以使用 import 语句：

```javascript

import "./someothercontract.sol";

contract newContract is SomeOtherContract {

}
```

这样当我们在合约（contract）目录下有一个名为 someothercontract.sol 的文件（ ./ 就是同一目录的意思），它就会被编译器导入。

> 这一点和 go 类似，在同一目录下文件中的内容可以直接使用，而不用使用 **xxx.name** 的形式。


### 测试调用


编译和部署 ZombieFeeding，就可以将这个合约部署到以太坊了。最终完成的这个合约继承自 ZombieFactory，因此它可以访问自己和父辈合约中的所有 public 方法。

下面是一个与ZombieFeeding合约进行交互的例子， 这个例子使用了 JavaScript 和 web3.js：

```javascript
var abi = /* abi generated by the compiler */
var ZombieFeedingContract = web3.eth.contract(abi)
var contractAddress = /* our contract address on Ethereum after deploying */
var ZombieFeeding = ZombieFeedingContract.at(contractAddress)

// 假设我们有我们的僵尸ID和要攻击的猫咪ID
let zombieId = 1;
let kittyId = 1;

// 要拿到猫咪的DNA，我们需要调用它的API。这些数据保存在它们的服务器上而不是区块链上。
// 如果一切都在区块链上，我们就不用担心它们的服务器挂了，或者它们修改了API，
// 或者因为不喜欢我们的僵尸游戏而封杀了我们
let apiUrl = "https://api.cryptokitties.co/kitties/" + kittyId
$.get(apiUrl, function(data) {
  let imgUrl = data.image_url
  // 一些显示图片的代码
})

// 当用户点击一只猫咪的时候:
$(".kittyImage").click(function(e) {
  // 调用我们合约的 `feedOnKitty` 函数
  ZombieFeeding.feedOnKitty(zombieId, kittyId)
})

// 侦听来自我们合约的新僵尸事件好来处理
ZombieFactory.NewZombie(function(error, result) {
  if (error) return
  // 这个函数用来显示僵尸:
  generateZombie(result.zombieId, result.name, result.dna)
})
```

### 参考链接

- [Solidity 文档：https://solidity-cn.readthedocs.io/zh/develop/index.html](https://solidity-cn.readthedocs.io/zh/develop/index.html)
- [cryptozombie-lessons2 僵尸攻击人类：https://cryptozombies.io/zh/lesson/2](https://cryptozombies.io/zh/lesson/2)
- [Solidity 简易教程](https://mp.weixin.qq.com/s/1MaIc7uNqBMx-_eO4WGQgA)


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![](http://media.gusibi.mobi/ah0mqMXMtdJb9Yj03suu-NGEyVRxyEuOIT5bXSv7ip5aqtHkiRjTTl8SMRMv3Qp5)
