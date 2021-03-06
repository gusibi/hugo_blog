---
date: "2019-06-03T21:14:10+08:00"
draft: false
title: "为什么json 不能使用 int64类型"
slug: "why-json-unspport-int64"
description: "json javacript 不能使用int64"
tags: ["前端", "JavaScript", "development"]
categories: ["前端", "架构设计", "development"]
---

### json 简介

JSON(JavaScript Object Notation) 是一种轻量级的数据交换格式。 易于人阅读和编写。同时也易于机器解析和生成。 **它基于JavaScript Programming Language, Standard ECMA-262 3rd Edition - December 1999的一个子集**。 JSON采用完全独立于语言的文本格式，但是也使用了类似于C语言家族的习惯（包括C, C++, C#, Java, JavaScript, Perl, Python等）。 这些特性使JSON成为理想的数据交换语言。

JSON支持两种数据结构存在：

* 对象（object）：一个对象包含一系列非排序的名称／值对(pair)，一个对象以{开始，并以}结束。每个名称／值对之间使用 **:** 分割。
* 数组 (array)：一个数组是一个值(value)的集合，一个数组以 **[** 开始，并以]结束。数组成员之间使用 **,** 分割。
具体的格式如下：

```json
[value1, value2, value3]
```

* 名称／值（pair）：名称和值之间使用 **:** 隔开，格式如下：

```json
{name:value}
```

> 名称必须是字符串类型； 
> 值(value)必须是可以是字符串(string)，数值(number)，对象(object)，有序列表(array)，或者 false， null， true 的其中一种。

JSON的格式描述可以参考RFC 4627。


### 为什么JSON不支持 int64 类型？

通过上面的介绍有两个关键点：

1. JSON 是基于 JavaScript Programming Language, Standard ECMA-262 3rd Edition - December 1999的一个子集
2. JSON 支持number 类型

Javascript的数字存储使用了IEEE 754中规定的双精度浮点数数据类型，而这一数据类型能够安全存储 -(2^53-1) 到 2^53-1 之间的数值（包含边界值）。JSON 是Javascript 的一个子集，所以它也遵守这个规则。

以下是rfc7159的说明：

> Note that when such software is used, numbers that are integers and
   are in the range [-(2^53)+1, (2^53)-1] are interoperable in the
   sense that implementations will agree exactly on their numeric
   values.


> 这两个边界值可以通过 JavaScript 的 Number.MAX_SAFE_INTEGER 和 Number.MIN_SAFE_INTEGER 获取。

![](http://media.gusibi.mobi/json1.png)

> 安全存储的意思是指能够准确区分两个不相同的值，比如，253 - 1 是一个安全整数，它能被精确表示，在任何 IEEE-754 舍入模式（rounding mode）下，没有其他整数舍入结果为该整数。作为对比，253 就不是一个安全整数，它能够使用 IEEE-754 表示，但是 253 + 1 不能使用 IEEE-754 直接表示，在就近舍入（round-to-nearest）和向零舍入中，会被舍入为 253。
> Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2 将得到 true的结果，而这在数学上是错误的。
> 同样 105308320612483198 === 105308320612483200 结果也是true

int64 类型的数值范围是 -(2^63-1) 到 2^63-1。使用int64 类型json 对于超出范围的数字，会出现解析错误的情况。

![](http://media.gusibi.mobi/json2.png)


一个建议：对于大数字来说，使用str 是一个好的选择。或者用类似这样的结构：

```json
{"int": 105308320612483198, "int_str": "105308320612483198"}
```

在json 中使用的时候 使用 int_str 属性。

### python 对json 的处理

python 中 int 类型值远远超过IEEE 754 中定义的双精度值的范围，所以对于在python中使用的json数据，可以使用放心使用 int64 类型（python中的long ）。但是如果序列化后的数据要被其它语言的解析器（比如：JavaScript的解析器）解析的时候，就要当心数值是不是超出了安全数的范围。如果超出，这里推荐使用字符串类型来代替数值类型。





## 参考链接

* [RFC7159](https://tools.ietf.org/html/rfc7159.html)
* [介绍JSON](http://www.json.org/json-zh.html)
* [IEEE 754](https://zh.wikipedia.org/zh-hans/IEEE_754)


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)