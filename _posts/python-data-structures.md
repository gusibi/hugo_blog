---
permalink: /post/python-data-structures
title: "Python Data Structures"
author: goodspeed
tags:
    - python
    - 算法
date: 2016-10-16T22:03:53+08:00
categories: ["development", "读书笔记", "python"]
---


## python 数据结构

* Python 的 list 是怎么回事，为什么有近乎无限大小的空间？为什么专门有一个固定长度且不能修改的数据结构 tuple 而不全用 list？
* list 的 insert 和 append 的费时是一样的吗？
* Python 的 dict 是怎么回事，为什么可以用字符串数字等等东西来索引？是怎么搜索的？在 dict 中找一个元素，和在 list 里面找一个元素有什么区别？
* Python 内置的 list, dict, set, ...数据结构，你应该在什么样的场景下使用？

HUGOMORE42

Python中常见的数据结构可以统称为容器（container）。序列（如列表和元组）、映射（如字典）以及集合（set）是三类主要的容器。

### 列表

和字符串一样，列表也是序列式的数据类型，可以通过下标或者切片操作来访问某一个或者某一块连续的元素。
不同之处：
1. 列表可以包含不同类型的对象
2. 列表长度是可变的

python中list并不是我们传统意义上的列表。传统列表--通常也叫做链表（linked list）--通常是由一系列节点来实现的，其每一个节点（尾节点除外）中都持有一个指向下一个节点的引用。

链表的简单实现：

```

class Node:
	def __init__(self, value, next=None):
		self.value = value
		self.next = next


>>> L = Node("a", Node("b", Node("c", Node("d"))))
>>> L.next.next.value

'c'

# 这是一个单向链表。双向链表的各节点中还需持有一个指向前一节点的引用。

# TODO 双向列表的实现

```

但Python中的list则与此有些不同。它不是由若干个独立的节点相互引用而成的，而是一整个单一连续的内存区块--我们通常称之为数组（array）。


### 树与图的实现

* 邻接列表及其类似结构
* 邻接矩阵
* 树的实现

###
