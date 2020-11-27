---
title: '垃圾回收算法|引用计数法'
date: 2018-08-12 11:15:05
tags: [垃圾回收,算法,读书笔记]
published: true
hideInList: false
feature: 
isTop: false
---


> 本文是《垃圾回收的算法与实现》读书笔记
>
> 上一篇为[《GC 标记-清除算法》](https://mp.weixin.qq.com/s/mJo5ADptfDxEVoqZjUIWTw) 


### 引用计数算法

> 给对象中添加一个引用计数器，每当有一个地方引用它时，计数器的值就加1；当引用失效时，计数器值就减1；任何时刻计数器为0的对象就是不可能再被使用的。这也就是需要回收的对象。
>
> `引用计数算法`是对象记录自己被多少**程序**引用，引用计数为零的对象将被清除。
>
> `计数器`表示的是有多少程序引用了这个对象（被引用数）。计数器是无符号整数。

#### 计数器的增减

引用计数法没有明确启动 GC 的语句，它与程序的执行密切相关，在程序的处理过程中通过增减计数器的值来进行内存管理。



##### **new_obj()** 函数

与`GC标记-清除`算法相同，程序在生成新对象的时候会调用 new_obj()函数。



```c
func new_obj(size){
    obj = pickup_chunk(size, $free_list)
    
    if(obj == NULL)
        allocation_fail()
    else
        obj.ref_cnt = 1  // 新对象第一只被分配是引用数为1
        return obj
}
```



这里 `pickup_chunk()`函数的用法与`GC标记-清除算法`中的用法大致相同。不同的是这里返回 NULL 时，分配就失败了。这里 `ref_cnt` 域代表的是 obj 的计数器。



> 在引用计数算法中，除了连接到空闲链表的对象，其他对象都是活跃对象。所以如果 pickup_chunk()返回 NULL，堆中也就没有其它大小合适的块了。



##### **update_ptr()** 函数

update_ptr() 函数用于更新指针 `ptr`，使其指向对象 obj，同时进行计数器值的增减。



```c
func update_ptr(ptr, obj){
    inc_ref_cnt(obj)     // obj 引用计数+1
    dec_ref_cnt(*ptr)    // ptr之前指向的对象(*ptr)的引用计数-1
    *ptr = obj
}
```



>  这里 update_ptr 为什么需要先调用 `inc_ref_cnt`，再调用`dec_ref_cnt`呢？
>
> 是因为有可能 *ptr和 obj 可能是同一个对象，如果先调用`dec_ref_cnt`可能会误伤。



**inc_ref_cnt()**函数

这里inc_ref_cnt函数只对对象 obj 引用计数+1

```go
func inc_ref_cnt(obj){
    obj.ref_cnt++
}
```



**dec_ref_cnt()** 函数

这里 dec_ref_cnt 函数会把之前引用的对象进行-1 操作，如果这时对象的计数器变为0，说明这个对象是一个垃圾对象，需要销毁，那么被它引用的对象的计数器值都需要相应的-1。

```go
func dec_ref_cnt(obj){
    obj_ref_cnt--
    if(obj.ref_cnt == 0)
        for(child : children(obj))
            dec_ref_cnt(*child)  // 递归将被需要销毁对象引用的对象计数-1
    reclaim(obj)
}
```



![update_prt() 函数执行是的情况](http://media.gusibi.mobi/txUtZf4Me8iDveCpZWKaqzhnqxhuGwmSLwX8NxfJEAa3UC1D1byrEpmfLgpAXTQp)



上图这里开始时，A 指向 B，第二步 A 指向了 C。可以看到通过更新，B 的计数器值变为了0，因此 B 被回收（连接到空闲链表），C 的计数器值由1变成了2。



> 通过上边的介绍，应该可以看出引用计数垃圾回收的特点。
>
> 1. 在变更数组元素的时候会进行指针更新
> 2. 通过更新执行计数可能会产生没有被任何程序引用的垃圾对象
> 3. 引用计数算法会时刻监控更新指针是否会产生垃圾对象，一旦生成会立刻被回收。
>
> 所以如果调用 `pickup_chunk`函数返回 NULL，说明堆中所有对象都是活跃对象。



#### 引用计数算法的优点

1. 可立即回收垃圾

   > 每个对象都知道自己的引用计数，当变为0时可以立即回收，将自己接到空闲链表

2. 最大暂停时间短

   > 因为只要程序更新指针时程序就会执行垃圾回收，也就是每次通过执行程序生成垃圾时，这些垃圾都会被回收，内存管理的开销分布于整个应用程序运行期间，无需挂起应用程序的运行来做，因此消减了最大暂停时间（但是增多了垃圾回收的次数）
   >
   > > `最大暂停时间`，因执行 GC 而暂停执行程序的最长时间。

3. 不需要沿指针查找

   > 产生的垃圾立即就连接到了空闲链表，所以不需要查找哪些对象是需要回收的

#### 引用计数算法的缺点

1. 计数器值的增减处理频繁

   > 因为每次对象更新都需要对计数器进行增减，特别是被引用次数多的对象。

2. 计数器需要占用很多位

   > 计数器的值最大必须要能数完堆中所有对象的引用数。比如我们用的机器是32位，那么极端情况，可能需要让2的32次方个对象同时引用一个对象。这就必须要确保各对象的计数器有32位大小。也就是对于所有对象，必须保留32位的空间。
   >
   > 假如对象只有两个域，那么其计数器就占用了整体的1/3。

3. 循环引用无法回收

   > 这个比较好理解，循环引用会让计数器最小值为1，不会变为0。



#### 循环引用



```python
class Person{  // 定义 Person 类
    string name
    Person lover
}

lilw = new Person("李雷")    // 生成 person 类的实例 lilw
hjmmwmw = new Person("韩梅梅") // 生成 person 类的实例 hjmwmw

lilw.lover = hjmwmw   // lilw 引用 hjmwmw
hjmwmw.lover = lilw   // hjmwmw 引用 lilw

```



像这样，两个对象相互引用，所以各个对象的计数器都为1，且这些对象没有被其他对象引用。所以计数器最小值也为1，不可能为0。



### 延迟引用计数法



引用计数法虽然缩小了`最大暂停时间`，但是`计数器的增减处理`特别多。为了改善这个缺点，`延迟引用计数法(Deferred Reference Counting)`被研究了出来。



通过上边的描述，可以知道之所以计数器增减处理特别繁重，是因为有些增减是根引用的变化，因此我们可以让根引用的指针变化不反映在计数器上。比如我们把 `update_ptr($ptr, obj)`改写成`*$ptr = obj`，这样频繁重写对重对象中引用关系时，计数器也不需要修改。但是这有一个问题，那就是计数器并不能正确反映出对象被引用的次数，就有可能会出现，对象仍在活动，却被回收。



在**延迟引用计数法**中使用`ZCT(Zero Count Table)`，来修正这一错误。

> ZCT 是一个表，它会事先记录下计数器在 `dec_ref_cnt()`函数作用下变成 0 的对象。



![ZCT](http://media.gusibi.mobi/R24lHD7lfMxlk4zSb5OE5gbhXy6YDtoMdjmdwMpEaX5uo_rRofrRZmqHcF5c99xD)

#### dec_ref_cnt 函数

在延迟引用计数法中，引用计数为0 的对象并不一定是垃圾，会先存入到 zct 中保留。

```go
func dec_ref_cnt(obj){
    obj_ref_cnt--
    if(obj.ref_cnt == 0) //引用计数为0 先存入到 $zct 中保留
        if(is_full($zct) == TRUE) // 如果 $zct 表已经满了 先扫描 zct 表，清除真正的垃圾
            scan_zct()
        push($zct, obj)
}
```



#### scan_zct 函数

```python
func scan_zct(){
    for(r: $roots)
        (*r).ref_cnt++
    
    for(obj : $zct)
        if(obj.ref_cnt == 0)
            remove($zct, obj)
            delete(obj)
    
    for(r: $roots)
        (*).ref_cnt--
}
```



1. 第二行和第三行，程序先把所有根直接引用的计数器都进行增量。这样，来修正计数器的值。
2. 接下来检查 `$zct` 表中的对象，如果此时计数器还为0，则说明没有任何引用，那么将对象先从 `$zct`中清除，然后调用 `delete()`回收。

delete() 函数定义如下：



```python
func delete(obj){
    for(child : children(obj)) // 递归清理对象的子对象
        (*child).ref_cnt--
        if (*child).ref_cnt == 0 
            delete(*child)
    
    reclaim(obj)
}
```



#### new_obj() 函数

除 dec_ref_cnt 函数需要调整，new_obj 函数也要做相应的修改。

```go
func new_obj(size){
    obj = pickup_chunk(size, $free_list)
    
    if(obj == NULL) // 空间不足
        scan_zct()  // 扫描 zct 以便获取空间
        obj = pickup_chunk(size, $free_list) // 再次尝试分配
        if(obj == NULL)
            allocation_fail()  // 提示失败
            
     obj.ref_cnt = 1
     return obj
}
```



> 如果第一次分配空间不足，需要扫描 $zct，以便再次分配，如果这时空间还不足，就提示失败



在延迟引用计数法中，程序延迟了根引用的计数，通过延迟，减轻了因根引用频繁变化而导致的计数器增减所带来的额外的负担。

但是，延迟引用计数却不能马上将垃圾进行回收，`可立即回收垃圾`这一优点也就不存在了。`scan_zct`函数也会增加程序的最大暂停时间。



### Sticky 引用计数法

对于引用计数法，有一个不能忽略的部分是计数器位宽的设置。假设为了反映所有引用，计数器需要1个字（32位机器就是32位）的空间。但是这会大量的消耗内存空间。比如，2个字的对象就需要一个字的计数器。也就是计数器会使对象所占的空间增大1.5倍。



`sticky 引用计数法`就是用来减少位宽的。

> 如果我们为计数器的位数设为5，那么计数器最大的引用数为31，如果有超过31个对象引用，就会爆表。对于爆表，我们怎么处理呢？



#### 1. 什么都不做

这种处理方式对于计数器爆表的对象，再有新的引用也不在增加，当然，当计数器为0 的时候，也不能直接回收（因为可能还有对象在引用）。这样其实是会产生残留的对象占用内存。

> 不过，研究表明，大部分对象其实只被引用了一次就被回收了，出现5位计数器溢出的情况少之又少。
>
> 爆表的对象大部分也都是重要的对象，不会轻易回收。
>
> 所以，什么都不做也是一个不错的办法。

#### 2. 使用GC 标记-清除算法进行管理

这种方法是，对于爆表的对象，使用 GC 标记-清除算法来管理。

```go
func mark_sweep_for_counter_overflow(){
    reset_all_ref_cnt()
    mark_phase()
    sweep_phase()
}
```



首先，把所有对象的计数器都设为0，然后进行标记和清除阶段。

标记阶段代码为：

```go
func mark_phase(){
    for (r: $roots)  // 先把根引用的对象推到标记栈中
        push(*r, $mark_stack)
    
    while(is_empty($mark_stack) == False) // 如果堆不为空
        obj = pop($mark_stack)
        obj.ref_cnt++  
        if(obj.ref_cnt == 1) // 这里必须把各个对象及其子对象堆进行标记一次
            for(child : children(obj))
                push(*child, $mark_stack)
}
```



>  在标记阶段，先把根引用的对象推到标记栈中
>
> 然后按顺序从标记栈中取出对象，对计数器进行增量操作。
>
> 对于循环引用的对象来说，obj.ref_cnt >  1，为了避免无谓的 push 这里需要进行 if(obj.ref_cnt == 1) 的判断



清除阶段代码为：

```go
func sweep_phase(){
    sweeping = $heap_top
    while(sweeping < $heap_end)  // 因为循环引用的所有对象都会被 push 到 head_end 所以也能被回收
        if(sweeping.ref_cnt == 0)
            reclaim(sweeping)
        sweeping += sweeping.size
}
```



在清除阶段，程序会搜索整个堆，回收计数器仍为0的对象。



> 这里的 GC 标记-清除算法和上一篇[GC 标记-清除算法](https://mp.weixin.qq.com/s/mJo5ADptfDxEVoqZjUIWTw) 主要不同点如下：
>
> 1. 开始时将所有对象的计数器值设为0
> 2. 不标记对象，而是对计数器进行增量操作
> 3. 为了对计数器进行增量操作，算法对活动对象进行了不止一次的搜索。



这里将 GC 标记-清除算法和引用计数法结合起来，在计数器溢出后，对象称为垃圾也不会漏掉清除。并且也能回收循环引用的垃圾。

因为在查找对象时不是设置标志位而是把计数器进行增量，所以需要多次查找活动对象，所以这里的标记处理比以往的标记清除花的时间更长，吞吐量会相应的降低。


## 参考链接

* [垃圾回收的算法与实现](https://book.douban.com/subject/26821357/)
* [《GC 标记-清除算法》](https://mp.weixin.qq.com/s/mJo5ADptfDxEVoqZjUIWTw)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)