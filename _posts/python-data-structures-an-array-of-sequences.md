---
categories: ["development", "python", "读书笔记"]
date: 2017-09-03T14:05:27+08:00
description: 列表、列表推导有关的话题，最后演示如何用列表实现一个优先级队列
author: goodspeed
permalink: /post/python-data-structures-an-array-of-seq-1
tags: ["python", "tutorial","读书笔记"]
title: Python 列表推导及优先级队列的实现
---

> 这一篇是`《流畅的 python》`读书笔记。主要介绍列表、列表推导有关的话题，最后演示如何用列表实现一个优先级队列。

## Python 内置序列类型

Python 标准库用 C 实现了丰富的序列类型：

#### 容器序列：

list、tuple 和 collections.deque 这些序列能存放不同类型的数据。

#### 扁平序列：

str、bytes、bytearray、memoryview 和 array.array，这类序列只能容纳一种类型。

> 容器序列存放的是它们所包含的任意类型的对象的引用，而扁平序列里存放的是值而不是引用（也可以说扁平序列其实存放的是一段连续的内存空间）。

如果按序列是否可被修改来分类，序列分为`可变序列` 和 `不可变序列`:

#### 可变序列

list、bytearray、array.array、collections.deque 和 memoryview。

#### 不可变序列

tuple、str和 bytes。

下图显示了可变序列（MutableSequence）和不可变序列（sequence）的差异：

![可变序列(MutableSequence)和不可变序列（sequence）的差异](http://media.gusibi.mobi/Wlrr9jXCMsTupf03pVmVSkCb4ObKTI8g7QWycfjJS80UJ7tHptjZsHLLCz3evCZM)

从这个图可以看出，可变序列从不可变序列那里继承了一些方法。

## 列表推导和生成器表达式

列表（list）是 Python 中最基础的序列类型。list 是一个可变序列，并且能同时存放不同类型的元素。
列表的基础用法这里就不再介绍了，这里主要介绍一下列表推导。

### 列表推导和可读性

列表推导是构建列表的快捷方式，并且有更好的可读性。
先看下面两段代码：

`#1. 把一个字符串变成 unicode 码位的列表`

```python
>>> symbols = '$&@#%^&*'
>>> codes = []
>>> for symbol in symbols:
        codes.append(ord(symbol))

>>> codes
[36, 38, 64, 35, 37, 94, 38, 42]
```

`#2. 把一个字符串变成 unicode 码位的列表 使用列表推导`

```python
>>> symbols = '$&@#%^&*'
>>> codes = [ord(s) for s in symbols]
>>> codes
[36, 38, 64, 35, 37, 94, 38, 42]
```

对比发现，如果理解列表推导的话，第二段代码比第一段更简洁可读性也更好。
当然，列表推导也不应该被滥用，通常的原则是`只用列表推导来创建新的列表，并且尽量保持简短。`
如果列表推导超过两行，就应该考虑要不要使用 `for` 循环重写了。

#### NOTE 

> 在 Python2 中列表推导有变量泄露的问题

`#Python2 的例子`
```python
>>> x = 'my precious'
>>> dummy = [x for x in 'ABC']
>>> x
'C'
```

这里 x 原来的值被取代了，变成了列表推导中的最后一个值，需要避免这个问题。好消息是 Python3解决了这个问题。

`#Python3 的例子`
```python
>>> x = 'ABC'
>>> dummy = [ord(x) for x in x]
>>> x 
'ABC'
>>> dummy
[65, 66, 67]
```

可以看到，这里 x 原有的值被保留了，列表推导也创建了正确的列表。

### 笛卡尔积

列表推导还可以生成两个或以上的可迭代类型的笛卡尔积。

> 笛卡尔积是一个列表，列表里的元素是由输入的可迭代类型的元素对构成的元组，因此笛卡尔积列表的长度等于输入变量的长度的成绩，如图所示：

![笛卡尔积](http://media.gusibi.mobi/Ug5fo3x6f2sM4pGOavCxHcmMpLbEnw6sCyZ6_9HMMHSbbrKQXahYQDsZC1bhxpp2)

`# 使用列表推导计算笛卡尔积代码如下`
```python
>>> suits = ['spades', 'diamonds', 'clubs', 'hearts']
>>> nums = ['A', 'K', 'Q']
>>> cards = [(num, suit) for num in nums for suit in suits]
>>> cards
[('A', 'spades'),
 ('A', 'diamonds'),
 ('A', 'clubs'),
 ('A', 'hearts'),
 ('K', 'spades'),
 ('K', 'diamonds'),
 ('K', 'clubs'),
 ('K', 'hearts'),
 ('Q', 'spades'),
 ('Q', 'diamonds'),
 ('Q', 'clubs'),
 ('Q', 'hearts')]
```
这里得到的结果是先按数字排列，再按图案排列。如果想先按图案排列再按数字排列，只需要调整 for 从句的先后顺序。

### 过滤序列元素

> `问题`：你有一个数据序列，想利用一些规则从中提取出需要的值或者是缩短序列

最简单的过滤序列元素的方法是使用列表推导。比如：

```python
>>> mylist = [1, 4, -5, 10, -7, 2, 3, -1]
>>> [n for n in mylist if n >0]
[1, 4, 10, 2, 3]
```

使用列表推导的一个潜在缺陷就是若干输入非常大的时候会产生一个非常大的结果集，占用大量内存。这个时候，使用生成器表达式迭代产生过滤元素是一个好的选择。

### 生成器表达式

生成器表达式遵守了迭代器协议，可以逐个产出元素，而不是先建立一个完整的列表，然后再把这个列表传递到某个构造函数里。

> 生成器表达式的语法跟列表推导差不多，只需要把方括号换成圆括号。

`# 使用生成器表达式创建列表`
```python
>>> pos = (n for n in mylist if n > 0)
>>> pos
<generator object <genexpr> at 0x1006a0eb0>
>>> for x in pos:
... print(x) 
...
1
4
10 
2 
3
```

*如果生成器表达式是一个函数调用过程中唯一的参数，那么不需要额外再用括号把它围起来。例如：*

```python
tuple(n for n in mylist)
```

*如果生成器表达式是一个函数调用过程中其中一个参数，此时括号是必须的。比如：*

```python
>>> import array
>>> array.array('list', (n for n in mylist))
array('list', [1, 4, 10, 2, 3])
```

## 实现一个优先级队列

### 问题

怎么实现一个按优先级排序的队列？并在这个队列上每次 pop 操作总是返回优先级最高的那个元素

### 解决方法

> 利用 `heapq` 模块

`heapq` 是 python 的内置模块，源码位于 Lib/heapq.py ，该模块提供了基于堆的优先排序算法。

> 堆的逻辑结构就是完全二叉树，并且二叉树中父节点的值小于等于该节点的所有子节点的值。这种实现可以使用 heap[k] <= heap[2k+1] 并且 heap[k] <= heap[2k+2] （其中 k 为索引，从 0 开始计数）的形式体现，对于堆来说，最小元素即为根元素 heap[0]。

可以通过 list 对 heap 进行初始化，或者通过 api 中的 heapify 将已知的 list 转化为 heap 对象。

heapq 提供的一些方法如下：

* heap = [] #创建了一个空堆 
* heapq.heappush(heap, item)：向 heap 中插入一个元素
* heapq.heappop(heap)：返回 root 节点，即 heap 中最小的元素
* heapq.heappushpop(heap, item)：向 heap 中加入 item 元素，并返回 heap 中最小元素
* heapq.heapify(x)
* heapq.nlargest(n, iterable, key=None)：返回可枚举对象中的 n 个最大值，并返回一个结果集 list，key 为对该结果集的操作
* heapq.nsmallest(n, iterable, key=None)：同上相反

实现如下：
```python
import heapq
class PriorityQueue: 
    def __init__(self):
        self._queue = []
        self._index = 0
        
    def push(self, item, priority):
        heapq.heappush(self._queue, (-priority, self._index, item)) 
        self._index += 1
        
    def pop(self):
        return heapq.heappop(self._queue)[-1]
```

下面是它的使用方法：

```python
>>> class Item:
        def __init__(self, name):
            self.name = name
        def __repr__(self):
            return 'Item({!r})'.format(self.name)
            
>>> q = PriorityQueue()
>>> q.push(Item('foo'), 1)
>>> q.push(Item('bar'), 5)
>>> q.push(Item('spam'), 4)
>>> q.push(Item('grok'), 1)
>>> q.pop()
Item('bar') 
>>> q.pop() 
Item('spam') 
>>> q.pop() 
Item('foo') 
>>> q.pop() 
Item('grok')
```

通过执行结果我们可以发现，第一个 pop() 操作返回优先级最高的元素。两个优先级相同的元素（foo 和 grok），pop 操作按照它们被插入到队列的顺序返回。

函数 heapq.heappush() 和 heapq.heappop() 分别在队列 queue 上插入和删除第一个元素，并且队列 queue 保证 第一个元素拥有最小优先级。 heappop() 函数总是返回 *`最小的`* 的元素，这就是保证队列 pop 操作返回正确元素的关键。另外，由于 push 和 pop 操作`时间复杂度为 O(log N)，其中 N 是堆的大小`，因此就算是 N 很大的时候它们 运行速度也依旧很快。
*`在上面代码中，队列包含了一个 (-priority, index, item) 的元组。优先级为负 数的目的是使得元素按照优先级从高到低排序。这个跟普通的按优先级从低到高排序的堆排序恰巧相反。`*
index 变量的作用是保证同等优先级元素的正确排序。通过保存一个不断增加的 index 下标变量，可以确保元素按照它们插入的顺序排序。而且， index 变量也在相 同优先级元素比较的时候起到重要作用。

实现上边排序的关键是 元组是支持比较的：

```python
>>> a = (1, Item('foo')) 
>>> b = (5, Item('bar')) 
>>> a < b
True
>>> c = (1, Item('grok'))
>>> a < c
Traceback (most recent call last):
File "<stdin>", line 1, in <module> 
TypeError: unorderable types: Item() < Item()
```

当第一个值大小相等时，由于`Item` 并不支持比较会抛出 `TypeError`。为了避免上述错误，我们引入了`index`（不可能用两个元素有相同的 index 值）， 变量组成了(priority, index, item) 三元组。现在再比较就不会出现上述问题了：

```python
>>> a = (1, 0, Item('foo')) 
>>> b = (5, 1, Item('bar')) 
>>> c = (1, 2, Item('grok')) 
>>> a < b
True
>>> a < c 
True
```

> 主要介绍列表、列表推导有关的话题，最后演示如何用`heapq`和`列表`实现一个优先级队列。下一篇介绍`元组`

## 参考链接

* [Heap queue algorithm](https://docs.python.org/2/library/heapq.html)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)
