---
categories:
- 读书笔记
- 后端
- development
date: 2018-07-21T11:15:05+08:00
description: 垃圾回收算法|标记-清除算法
permalink: /post/gc-mark-sweep
tags:
- 垃圾回收
- 算法
- 读书笔记
title: 垃圾回收算法|GC标记-清除算法
---

> 本文是《垃圾回收的算法与实现》读书笔记


![](http://media.gusibi.mobi/kJ8L52gJq08Mi142RTC-wAwzbMUgwGTKue3rPKNWVrYTlvOMczGlXFvmEt1C1MRM)

### 什么是GC标记-清除算法（Mark Sweep GC）

GC 标记-清除算法由`标记阶段`和`清除阶段`构成。在标记阶段会把所有的活动对象都做上标记，然后在清除阶段会把没有标记的对象，也就是`非活动`对象回收。


> `名词解释：`
>
> 在 GC 的世界里`对象`指的是通过应用程序利用的数据的集合。是 GC 的基本单位。一般由头（header）和域（field）构成。
>
> `活动对象:`能通过引用程序引用的对象就被称为活动对象。（可以直接或间接从全局变量空间中引出的对象）
>
> `非活动对象:`不能通过程序引用的对象呗称为非活动对象。（这就是被清除的目标）



标记-清除算法的伪代码如下所示：



```go
func mark_sweep(){
    mark_phase()   // 标记阶段
    sweep_phase()  // 清除阶段
} 
```



### 标记阶段



> 标记阶段就是遍历对象并标记的处理过程。

标记阶段伪代码如下：

```go
func mark_phase(){
    for (r : $roots)  // 在标记阶段，会给所有的活动对象打上标记
        mark(*r)
}

func mark(){
    if (obj.mark == False)
        obj.mark = True            // 先标记找出的活动对象
        for (child: children(obj)) // 然后递归的标记通过指针数组能访问到的对象
            mark(*child)
}
```



> 这里 `$root `是指针对象的起点，通过$root 可以遍历全部活动对象。

下图是标记前和标记后内存中堆的状态

![执行 GC 前堆的状态](http://media.gusibi.mobi/E66QEbTr9uxUcn-_4HAJbjhIiPrO_gZ-RQcn6Wiiu8iQnP9wlA5xZ5KACvMLvEK-)

![执行 GC 后堆的状态](http://media.gusibi.mobi/7_BEou-9LxGREQm2CyB18NZLRMh43R8g6xY2UwXfHXw7eyYwpaSvSWPndirCzuHv)



### 清除阶段

> 在清除阶段，collector 会遍历整个堆，回收没有打上标记的对象（垃圾），使其能再次利用。

sweep_phase() 函数伪代码实现如下：



```go
func sweep_phase(){
    sweeping = $heap_start            // 首先将堆的首地址赋值给 sweeping
    while(sweeping < $head_end){
        if(sweeping.mark == TRUE)
            // 如果是标记状态就设为 FALSE，如果是活动对象，还会在标记阶段被标记为 TRUE
            sweeping.mark == FALSE    
        else:
            sweeping.next = $free_list   // 将非活动对象 拼接到 $free_list 头部位置
            $free_list = sweeping
        sweeping += sweeping.size
    }     
}
```



> `size` 域指的是存储对象大小的域，在对象头中事先定义。
>
> `next` 域只在生成空闲链表以及从空闲链表中取出分块时才会用到。
>
> `分块(chunk)` 这里是指为利用对象而事先准备出来的空间。
>
> 内存中区块的块生路线为 `分块-->活动对象-->垃圾—>分块-->... `

在清除阶段我们会把非活动回收再利用。回收对象就是把对象作为分块，连接到被称为`空闲链表`的单向链表。之后再分配空间时只需遍历这个空闲链表就可以了找到分块了。

下图是清除阶段结束后堆的状态：

![清除阶段结束后堆的状态](http://media.gusibi.mobi/S1zEqC5TqtGnlofpDBf-8u_hBaLrtqyMT_vpEePlcVTVwVaJ_zwLFdXnIGbKfGBT)



### 分配

> 回收垃圾的目的是为了能再次分配

当程序申请分块时，怎样才能把大小合适的分块分配给程序呢？

分配伪代码如下：



```go
func new_obj(size){  // size 是需要的分块大小
    chunk = pickup_chunk(size, $free_list)  // 遍历 $free_list 寻找大于等于 size 的分块
    if(chunk != NULL)  
        return chunk
    else
        allocation_fail()   // 如果没找到大小合适的分块 提示分配失败
}
```



`pickup_chunk()`函数不止返回和 size 大小相同的分块，也会返回大于 size 大小的分块（这时会将其分割成 size 大小的分块和去掉 size 后剩余大小的分块，并把剩余部分还给空闲链表）。



> 分配策略有三种 `First-fit`,`Best-fit`,`Worst-fit`
>
> `First-fit`：发现大于等于 size的分块立刻返回
>
> `Best-fit`：找到大小和 size 相等的分块再返回
>
> ``Worst-fit`：找到最大的分块，然后分割成 size 大小和剩余大小（这种方法容易产生大量小的分块



#### 合并

根据分配策略的不同，分配过程中会出现大量小的分块，如果分块是连续的，我们就可以把小分块合并成一个大的分块，`合并是在清除阶段完成的`，包含了合并策略的清除代码如下：



```go
func sweep_phase(){
    sweeping = $heap_start            // 首先将堆的首地址赋值给 sweeping
    while(sweeping < $head_end){
        if(sweeping.mark == TRUE)
            // 如果是标记状态就设为 FALSE，如果是活动对象，还会在标记阶段被标记为 TRUE
            sweeping.mark == FALSE    
        else:
            if(sweeping == $free_list + $free_list.size)  // 堆的地址正好和空闲链表大小相同
                $free_list.size += sweeping.size
            else
                sweeping.next = $free_list   // 将非活动对象 拼接到 $free_list 头部位置
                $free_list = sweeping
        sweeping += sweeping.size
    }     
}
```



> `$heap_end = $heap_start + HEAP_SIZE`
>
> 所以这里`sweeping == $free_list + $free_list.size`可以理解为需要清除的堆的地址正好和空闲链接相邻



### 优/缺 点

#### 优点

* 实现简单
* 与`保守式 GC 算法`兼容



#### 缺点

* 碎片化严重（由上面描述的分配算法可知，容易产生大量小的分块
* 分配速度慢（由于空闲区块是用链表实现，分块可能都不连续，每次分配都需要遍历空闲链表，极端情况是需要遍历整个链表的。
* 与`写时复制技术`不兼容

> 写时复制（copy-on-write）是众多 UNIX 操作系统用到的内存优化的方法。比如在 Linux 系统中使用 fork() 函数复制进程时，大部分内存空间都不会被复制，只是复制进程，只有在内存中内容被改变时才会复制内存数据。
>
> 但是如果使用标记清除算法，这时内存会被设置`标志位`，就会频繁发生不应该发生的复制。

### 多个空闲链表

上面所说的标记清除算法只用到了一个空闲链表对大小不一的分块统一处理。但这样做每次都需要遍历一遍来寻找大小合适的分块，非常浪费时间。

这里我们使用多个空闲链表的方法来存储非活动对象。比如：将两个字的分块组成一个空闲链表，三个字的分块组成另一个空闲链表，等等。。

这时，如果需要分配三个字的分块，那我们只需要查询对应的三个字的空闲链表就可以了。

> 到底需要制造多少个空闲链表呢？
>
> 因为通常程序不会 申请特别大的分块，所以我们通常给分块大小设置一个上限，比如100，大于这个上限的组成一个特殊的空闲链表。这样101 个空闲链表就够了。

### 位图标记

在单纯的 GC 标记-清除算法中，用于标记的位是被分配到对象头中的。算法是把对象和头一并处理，但这和写时复制不兼容。

`位图标记`法是只收集各个对象的标志位并表格化，不喝对象一起管理。在标记的时候不在对象的头里设置位置，而是在特定的表格中置位。



![位图标记](http://media.gusibi.mobi/hEEQsacTXvFE97jV14u-Jc-ghhrDKg6TY_w20Mvizspa1cmEQFvtV5ADazkBAOy0)



> 在位图标记中重要的是，位图表格中位的位置要和堆里的各个对象切实对应。一般来说堆中的一个字会分配到一个位。



位图标记中 mark() 函数的伪代码实现如下：



```go
func mark(obj){
    obj_num = (obj - $heap_start) / WORD_LENGTH  // WORD_LENGTH 是一个常量，表示机器中一个字的位宽
    index = obj_num / WORD_LENGTH
    offset = obj_num % WORD_LENGTH
    
    if ($bitmap_tbl[index] & (1 << offset)) == 0
        $bitmap_tbl[index] |= (1 << offset)
        for (child: children(obj)) // 然后递归的标记通过指针数组能访问到的对象
            mark(*child)
}
```



这里 obj_num 指的是从位图表格前面数，obj 的标志位在第几个。例如 E 的 obj_num 是8。

obj_num 除以 WORD_LENGTH 得到的商 index 以及余数 offset 来分别表示位图表格的行编号和列编号。



#### 优点

* 和写时复制技术兼容
* 清除更高效（只需要遍历位图表格就可以，清除的时候也只需要清除表格中的标志位）。

### 延迟清除

清除操作所花费的时间和堆的大小成正比，堆越大，标记-清除 动作花费的时间越长，也就越影响程序的运行。

延迟清除（lazy sweep）是缩短清除操作花费导致程序最大暂停时间的方法。

> `最大暂停时间`，因执行 GC 而暂停执行程序的最长时间。

延迟清除中 new_obj() 函数会在分配的时候调用 `lazy_sweep()`函数，进行清除操作。如果它能用清除操作来分配分块，就会返回分块，如果不能分配分块，就会执行标记操作。然后重复这个步骤，直到找到分块或者`allocation_fail`



通过延迟清除法可以缩减程序的暂停时间，不过延迟效果并不是均衡的。比如下图这种刚标记完堆的情况：

![堆里垃圾分布不均的情况](http://media.gusibi.mobi/yOIKeU-sQUx1m4C56IcH__oPcq3aR7zKxokJ0kiaqGfBCT9UNqUGnXUalUmcLM9S)



这时，活动对象和非活动对象都是相邻分布，如果程序在活动对象周围开始清除，那它找到的对象都是活动对象不可清除，只能不停遍历，暂停时间就会变长。

## 参考链接

* [垃圾回收的算法与实现](https://book.douban.com/subject/26821357/)
* [画说 Ruby 与 Python 垃圾回收](https://mp.weixin.qq.com/s/4aEUixY3cioH2OXTgYX0Mg)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)