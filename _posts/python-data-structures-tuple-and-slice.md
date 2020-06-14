---
categories: ["development", "python", "读书笔记"]
date: 2017-09-10T14:05:27+08:00
description: 元组，切片以及对序列的一系列操作
author: goodspeed
permalink: /post/python-data-structures-an-array-of-seq-2
tags: ["python", "tutorial","读书笔记"]
title: Python 元组和分片
---

> 这一篇是`《流畅的 python》`读书笔记。主要介绍元组、分片、序列赋值以及引用了大师 Edsger W.Dijkstra`为什么序列从0开始计数`的解释。

## 元组

在有些python 的介绍中，元组被称为`不可变列表`，这其实是不准确的，没有完全概括元组的特点。元组除了用作不可变列表，还可以用于`没有字段名的记录`。

### 元组和记录

元组其实是对数据的记录：元组中的每个元素都存放了记录中一个字段的数据，外加这个数据的位置。

如果把元组当作一些字段的集合，数量和位置信息会变得非常重要。比如以下几条用元组表示的记录：

```python
 >>> lax_coordinates = (33.9425, -118.408056) # 洛杉矶国际机场的经纬度
 # 东京的一些信息：市名、年份、人口、人口变化和面积
 >>> city, year, pop, chg, area = ('Tokyo', 2003, 32450, 0.66, 8014)
```

以上这两个元组每个位置都对应一个数据记录。

### 元组拆包

```python
>>> city, year, pop, chg, area = ('Tokyo', 2003, 32450, 0.66, 8014)
```

这个例子中，我们把元组的数据用一条语句分别赋值给 city, year, pop, chg, area，这就是元组拆包的一个具体应用。

> 元组拆包可以应用到任何可迭代对象上，但是被迭代的对象窄的元素的数量必须跟接受这些元素的元组的空档数一致。

比如：

```python
>>> lax_coordinates = (33.9425, -118.408056)
>>> latitude, longitude = lax_coordinates
>>> latitude
33.9425
>>> longitude
-118.408056
```

还可以用 `*` 运算符把一个可迭代对象拆开作为函数的参数：

```python
>>> divmod(20, 8)
(2, 4)
>>> t = (20, 8)
>>> divmode(*t)
(2, 4)
>>> quotient, remainder = divmode(*t)
>>> quotient, remainder
(2, 4)
```

在进行拆包是，我们可能对元组的某些值并不感兴趣，这时可以用 `_` 占位符处理。比如：

```python
>>> divmode(20, 8)
(2, 4)
>>> _, remainder = divmode(20, 8)  # 这里我们只关心第二个值
>>> remainder
4
```

在处理函数参数时，我们经常用`*args` 来表示不确定数量的参数。在`python3`中，这个概念被扩展到了平行赋值中：

```python
# python 3 代码示例
>>> a, b, *rest = range(5)
>> a, b, rest
(0, 1, [2, 3, 4])
# * 前缀只能用在一个变量名前，这个变量可以在其他位置
>>> a, *rest, c, d = range(5) 
>> a, rest, c, d
(0, [1, 2], 3, 4)
>>> a, b, *rest = range(2)
>> a, b, rest
(0, 1, [])
```
元组也支持嵌套拆包，比如：

```python
>>> l = (1, 2, 3, (4, 5))
>>> a, b, c, (d, e) = l
>>> d
4
>>> 5
4
```

### 具名元组

元组作为记录除了位置以外还少一个功能，那就是无法给字段命名，`namedtuple`解决了这个问题。

namedtuple 使用方式实例：

```python
>>> from collecitons import namedtuple
>>> city = namedtuple('City', 'name country population coordinates')
>>> tokyo = City('Tokyo', 'JP', 36.933, (35.689722, 139.691667))
>>> tokyo.population  # 可以使用字段名获取字段信息
36.933
>>> tokyo[1] # 也可以使用位置获取字段信息
'JP'
>>> City._fields # _fields 属性是一个包含这个类所有字段名的元组 
('name', 'country', 'population', 'coordinates')
>>> tokyo_data = ('Tokyo', 'JP', 36.933, (35.689722, 139.691667))
>>> tokyo = City._make(tokyo_data) # _make() 方法接受一个可迭代对象生成这个类的实例，和 City(*tokyo_data) 作用一致
>>>  tokyo._asdict() # _asdict() 把具名元组以 collections.OrderedDict 的形式呈现
OrderedDict([('name', 'Tokyo'), ('country', 'JP'), ('population', 36.933), ('coordinates', (35.689722, 139.691667))])
```
> `collections.namedtuple` 是一个工厂函数，它可以用来构建一个带字段名的元组和一个有名字的类。
> `namedtuple` 构建的类的实例锁消耗的内存和元组是一样的，因为字段名都被存放在对应的类里。这个实例和普通的对象实例相比也更小一些，因为 在这个实例中，Python 不需要用 `__dict__` 来存放这些实例的属性

## 切片

Python 中列表、元组、字符串都支持切片操作。

在切片和区间操作里不包含区间范围的最后一个元素是 Python 的风格。这样做的好处如下：
* 当只有最后一个位置信息时，我们可以快速看出切片和区间里有几个元素：range(3) 和 mylist[:3] 都只返回三个元素
* 当气质位置可见时，可以快速计算出切片和区间的长度，用后一个数减去第一个下标（stop-start）即可。
* 这样还可以让我们利用任意一个下标来把序列分割成不重复的两部分，只要写成 mylist[:x] 和 mylist[x:] 就可以。

切片除了开始和结束的下标之外还可以有第三个参数，比如：`s[a:b:c]`，这里 c 表示取值的间隔，c 还可以为负值，负值意味着反向取值。

```python
>>> s = 'bicycle'
>>> s[::3]
'bye'
>>> s[::-1]
'elcycib'
>>> s[::2]
'eccb'
```

a:b:c 这种用法只能作为索引或者下标在[] 中返回一个切片对象：slice(a, b, c)。对 seq[start:stop:step] 进行求值的时候，Python 会调用 seq.__getitem__(slice(start:stop:step)]。

### 给切片赋值

如果把切片放在赋值语句的左边，或者把它作为 del 操作的对象，我们就可以对序列进行嫁接、切除或修改操作，比如：

```python
>>> l = list(range(10))
>>> l
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
>>> l[2:5] = [20, 30]
>>> l
[0, 1, 20, 30, 5, 6, 7, 8, 9]
>>> del l[5:7]
[0, 1, 20, 30, 5, 8, 9]
>>> l[3::2] = [11, 22]
>>> l
[0, 1, 20, 11, 5, 22, 9]
>>> l[2:5] = 100
Traceback (most recent call last):
      file "<stdin>", line 1 in <moduld>
TypeError: can only assign an iterable
```

> 如果赋值的对象是一个切片，那么赋值语句的右侧必须是一个可迭代对象。

### 给切片命名

如果代码中已经出现了大量的无法直视的硬编码切片下标，可以使用给切片命名的方式清理代码。比如你有一段代码要从一个记录字符串中几个固定位置提取出特定的数据字段  比如文件或类似格式 :

```python
### 01234567890123456789012345678901234567890123456789012345678901234
record = '............100....513.25........'
cost = int(record[20:23]) * float(record[31:37])
# 这时，可以先给切片命名,以避免大量无法理解的硬编码下标，使代码可读性更强
SHARES= slice(20, 23)
PRICE = slice(31, 37)
cost = int(record[SHARES]) * float(record[PRICE])
```

slice() 函数创建了一个`切片对象`，可以被用在任何切片允许使用的地方，比如：

```python
>>> items = [0, 1, 2, 3, 4, 5, 6]
>>> a = slice(2, 4)
>>> items[2:4]
[2, 3]
>>> items[a]
[2, 3]
>>> items[a] = [10, 11]
>>> items
[0, 1, 10, 11, 4, 5, 6]
```
如果你有一个切片对象 a，还可以调用 a.start, a.stop, a.step 来获取更多信息，比如：

```python
>>> a = slice(5, 50, 2)
>>> a.start
5
>>> a.step
2
```

## 扩展阅读 为什么下标要从0开始

Python 里的范围（range）和切片都不会反悔第二个下标所指的元素，计算机科学领域的大师 Edsger W.Dijkstra 在一个很短的备忘录 [Why numbering should start at zero](http://www.cs.utexas.edu/users/EWD/transcriptions/EWD08xx/EWD831.html) 里对这一惯例做了说明。以下是部分关键说明：

为了表示出自然数的子序列，2, 3, ... , 12，不使用省略记号那三个点号，我们可以选择4种约定方式：

* a) 2 ≤ i < 13
* b) 1 < i ≤ 12
* c) 2 ≤ i ≤ 12
* d) 1 < i < 13

是否有什么理由，使选择其中一种约定比其它约定要好呢？是的，确实有理由。可以观察到，a) 和 b)有个优点，`上下边界的相减得到的差，正好等于子序列的长度`。另外，作为推论，下面观察也成立：在 a)，b)中，`假如两个子序列相邻的话，其中一个序列的上界，就等于另一个序列的下界`。但上面观察，并不能让我们从a), b)两者中选出更好的一个。让我们重新开始分析。

一定存在最小的自然数。假如像b)和d)那样，子序列并不包括下界，那么当子序列从最小的自然数开始算起的时候，会使得下界进入非自然数的区域。这就比较丑陋了。所以对于下界来说，我们更应该采用≤，正如a)或c)那样。
现在考虑，假如子序列包括上界，那么当子序列从最小的自然数开始算起，并且序列为空的时候，上界也会进入非自然数的区域。这也是丑陋的。所以，对于上界，我们更应该采用 <, 正如a)或b)那样。因此我们得出结论，约定a)是更好的选择。

> * 比如要表示 `0, 1, 2, 3` 如果用 b) d) 的方式，下界就要表示成 `-1 < i`
> * 如果一个空序列用 c) 其实是无法表示的,用 a) 则可以表示成 0 ≤ i < 0


## 总结

这一篇主要介绍元组、分片、序列赋值以及对`为什么序列从0开始计数`做了摘录。

## 参考链接

* [Why numbering should start at zero](http://www.cs.utexas.edu/users/EWD/transcriptions/EWD08xx/EWD831.html)
* [Why numbering should start at zero: http://www.cs.utexas.edu/users/EWD/ewd08xx/EWD831.PDF](http://www.cs.utexas.edu/users/EWD/ewd08xx/EWD831.PDF)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)
