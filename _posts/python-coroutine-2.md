---
categories: ["development", "python", "读书笔记"]
date: 2017-06-14T17:22:49+08:00
permalink: /post/python-coroutine-yield-from
tags: ["python", "tutorial","读书笔记"]
title: "python协程2：yield from 从入门到精通"
---

上一篇[python协程1：yield的使用](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751983&idx=1&sn=e4c093c6e5d6e4e8281d76db7c67eb23)介绍了：

* 生成器作为协程使用时的行为和状态
* 使用装饰器预激协程
* 调用方如何使用生成器对象的 .throw(...) 和 .close() 方法控制协程

这一篇将介绍：

* 协程终止时如何返回值
* yield新句法的用途和语义

HUGOMORE42

## 让协程返回值

先看一个例子：
这段代码会返回最终均值的结果，每次激活协程时不会产出移动平均值，而是最后一次返回。

```python
#! -*- coding: utf-8 -*-

from collections import namedtuple

Result = namedtuple('Result', 'count average')


def averager():
    total = 0.0
    count = 0
    average = None
    while True:
        term = yield
        if term is None:
            break  # 为了返回值，协程必须正常终止；这里是退出条件
        total += term
        count += 1
        average = total/count
    # 返回一个namedtuple，包含count和average两个字段。在python3.3前，如果生成器返回值，会报错
    return Result(count, average)
```

我们调用这段代码，结果如下

```python
>>> coro_avg = averager()
>>> next(coro_avg)
>>> coro_avg.send(20) # 并没有返回值
>>> coro_avg.send(30)
>>> coro_avg.send(40)
>>> coro_avg.send(None) # 发送None终止循环，导致协程结束。生成器对象会抛出StopIteration异常。异常对象的value属性保存着返回值。
Traceback (most recent call last):
   ...
StopIteration: Result(count=3, average=30)
```

> return 表达式的值会传给调用方，*赋值给StopIteration* 异常的一个属性。这样做虽然看着别扭，但为了保留生成器对象耗尽时抛出StopIteration异常的行为，也可以理解。

如果我们想获取协程的返回值，可以这么操作：

```python
>>> coro_avg = averager()
>>> next(coro_avg)
>>> coro_avg.send(20) # 并没有返回值
>>> coro_avg.send(30)
>>> coro_avg.send(40)
>>> try:
...     coro_avg.send(None)
... except StopIteration as exc:
...     result = exc.value
...
>>> result
Result(count=3, average=30)

```

看到这我们会说，这是什么鬼，为什么获取返回值要绕这么一大圈，就没有简单的方法吗？

有的，那就是 *yield from*

yield from 结果会在内部自动捕获StopIteration 异常。这种处理方式与 for 循环处理StopIteration异常的方式一样。
对于yield from 结构来说，解释器不仅会捕获StopIteration异常，还会把value属性的值变成yield from 表达式的值。

> 在函数外部不能使用yield from（yield也不行）。

既然我们提到了 *yield from* 那yield from 是什么呢？

## yield from

yield from 是 Python3.3 后新加的语言结构。和其他语言的await关键字类似，它表示：*在生成器 gen 中使用 yield from subgen()时，subgen 会获得控制权，把产出的值传个gen的调用方，即调用方可以直接控制subgen。于此同时，gen会阻塞，等待subgen终止。

yield from 可用于简化for循环中的yield表达式。

例如：

```python
def gen():
    for c in 'AB':
        yield c
    for i in range(1, 3):
        yield i

list(gen())
['A', 'B', '1', '2']
```

可以改写为：

```python
def gen():
    yield from 'AB'
    yield from range(1, 3)
    

list(gen())
['A', 'B', '1', '2']
```

下面来看一个复杂点的例子：(来自Python cookbook 3 ，github源码地址 [https://github.com/dabeaz/python-cookbook/blob/master/src/4/how_to_flatten_a_nested_sequence/example.py](https://github.com/dabeaz/python-cookbook/blob/master/src/4/how_to_flatten_a_nested_sequence/example.py))

```python
# Example of flattening a nested sequence using subgenerators

from collections import Iterable

def flatten(items, ignore_types=(str, bytes)):
    for x in items:
        if isinstance(x, Iterable) and not isinstance(x, ignore_types):
            yield from flatten(x) # 这里递归调用，如果x是可迭代对象，继续分解
        else:
            yield x

items = [1, 2, [3, 4, [5, 6], 7], 8]

# Produces 1 2 3 4 5 6 7 8
for x in flatten(items):
    print(x)

items = ['Dave', 'Paula', ['Thomas', 'Lewis']]
for x in flatten(items):
    print(x)
```

yield from x 表达式对x对象做的第一件事是，调用 iter(x)，获取迭代器。所以要求x是可迭代对象。

PEP380 的标题是 ”syntax for delegating to subgenerator“(把指责委托给子生成器的句法)。由此我们可以知道，yield from是可以实现嵌套生成器的使用。

yield from 的主要功能是打开双向通道，把最外层的调用方与最内层的子生成器连接起来，使两者可以直接发送和产出值，还可以直接传入异常，而不用在中间的协程添加异常处理的代码。

yield from 包含几个概念：

* 委派生成器

包含yield from <iterable> 表达式的生成器函数

* 子生成器

从yield from <iterable> 部分获取的生成器。

* 调用方

调用委派生成器的客户端（调用方）代码

这个示意图是 对yield from 的调用过程

![](http://omuo4kh1k.bkt.clouddn.com/z6VQ9oWIy-KOo2eJckn6_FDzRaiZoxdyyvbe-QstGCLw5p5AlJ43coiNPMy23Rup)

委派生成器在 yield from 表达式处暂停时，调用方可以直接把数据发给字生成器，子生成器再把产出的值发送给调用方。子生成器返回之后，解释器会抛出StopIteration异常，并把返回值附加到异常对象上，只是委派生成器恢复。

> 这个图来自于Paul
 Sokolovsky 的 [How Python 3.3 "yield from" construct works](http://flupy.org/resources/yield-from.pdf)

 下边这个例子是对yield from 的一个应用：


```python
 #! -*- coding: utf-8 -*-

from collections import namedtuple


Result = namedtuple('Result', 'count average')


# 子生成器
# 这个例子和上边示例中的 averager 协程一样，只不过这里是作为字生成器使用
def averager():
    total = 0.0
    count = 0
    average = None
    while True:
        # main 函数发送数据到这里 
        term = yield
        if term is None: # 终止条件
            break
        total += term
        count += 1
        average = total/count
    return Result(count, average) # 返回的Result 会成为grouper函数中yield from表达式的值


# 委派生成器
def grouper(results, key):
     # 这个循环每次都会新建一个averager 实例，每个实例都是作为协程使用的生成器对象
    while True:
        # grouper 发送的每个值都会经由yield from 处理，通过管道传给averager 实例。grouper会在yield from表达式处暂停，等待averager实例处理客户端发来的值。averager实例运行完毕后，返回的值绑定到results[key] 上。while 循环会不断创建averager实例，处理更多的值。
        results[key] = yield from averager()


# 调用方
def main(data):
    results = {}
    for key, values in data.items():
        # group 是调用grouper函数得到的生成器对象，传给grouper 函数的第一个参数是results，用于收集结果；第二个是某个键
        group = grouper(results, key)
        next(group)
        for value in values:
            # 把各个value传给grouper 传入的值最终到达averager函数中；
            # grouper并不知道传入的是什么，同时grouper实例在yield from处暂停
            group.send(value)
        # 把None传入groupper，传入的值最终到达averager函数中，导致当前实例终止。然后继续创建下一个实例。
        # 如果没有group.send(None)，那么averager子生成器永远不会终止，委派生成器也永远不会在此激活，也就不会为result[key]赋值
        group.send(None)
    report(results)


# 输出报告
def report(results):
    for key, result in sorted(results.items()):
        group, unit = key.split(';')
        print('{:2} {:5} averaging {:.2f}{}'.format(result.count, group, result.average, unit))


data = {
    'girls;kg':[40, 41, 42, 43, 44, 54],
    'girls;m': [1.5, 1.6, 1.8, 1.5, 1.45, 1.6],
    'boys;kg':[50, 51, 62, 53, 54, 54],
    'boys;m': [1.6, 1.8, 1.8, 1.7, 1.55, 1.6],
}

if __name__ == '__main__':
    main(data)
```

> 这段代码从一个字典中读取男生和女生的身高和体重。然后把数据传给之前定义的 averager 协程，最后生成一个报告。

执行结果为

```python
6 boys  averaging 54.00kg
6 boys  averaging 1.68m
6 girls averaging 44.00kg
6 girls averaging 1.58m
```

这断代码展示了yield from 结构最简单的用法。委派生成器相当于管道，所以可以把任意数量的委派生成器连接在一起---一个委派生成器使用yield from 调用一个子生成器，而那个子生成器本身也是委派生成器，使用yield from调用另一个生成器。最终以一个只是用yield表达式的生成器（或者任意可迭代对象）结束。

## yield from 的意义

PEP380 分6点说明了yield from 的行为。

* 子生成器产出的值都直接传给委派生成器的调用方（客户端代码）
* 使用send() 方法发给委派生成器的值都直接传给子生成器。如果发送的值是None，那么会调用子生成器的 __next__()方法。如果发送的值不是None，那么会调用子生成器的send()方法。如果调用的方法抛出StopIteration异常，那么委派生成器恢复运行。任何其他异常都会向上冒泡，传给委派生成器。
* 生成器退出时，生成器（或子生成器）中的return expr 表达式会触发 StopIteration(expr) 异常抛出。
* yield from表达式的值是子生成器终止时传给StopIteration异常的第一个参数。
* 传入委派生成器的异常，除了 GeneratorExit 之外都传给子生成器的throw()方法。如果调用throw()方法时抛出 StopIteration 异常，委派生成器恢复运行。StopIteration之外的异常会向上冒泡。传给委派生成器。
* 如果把 GeneratorExit 异常传入委派生成器，或者在委派生成器上调用close() 方法，那么在子生成器上调用close() 方法，如果他有的话。如果调用close() 方法导致异常抛出，那么异常会向上冒泡，传给委派生成器；否则，委派生成器抛出 GeneratorExit 异常。

yield from的具体语义很难理解，不过我们可以看下Greg Ewing 的伪代码，通过伪代码分析一下：

```python
RESULT = yield from EXPR

# is semantically equivalent to
# EXPR 可以是任何可迭代对象，因为获取迭代器_i 使用的是iter()函数。
_i = iter(EXPR)
try:
    _y = next(_i) # 2 预激字生成器，结果保存在_y 中，作为第一个产出的值
except StopIteration as _e:
    # 3 如果调用的方法抛出StopIteration异常，获取异常对象的value属性，赋值给_r
    _r = _e.value
else:
    while 1: # 4 运行这个循环时，委派生成器会阻塞，只能作为调用方和子生成器直接的通道
        try:
            _s = yield _y # 5 产出子生成器当前产出的元素；等待调用方发送_s中保存的值。
        except GeneratorExit as _e:
            # 6 这一部分是用于关闭委派生成器和子生成器，因为子生成器可以是任意可迭代对象，所以可能没有close() 方法。
            try:
                _m = _i.close
            except AttributeError:
                pass
            else:
                _m()
            # 如果调用close() 方法导致异常抛出，那么异常会向上冒泡，传给委派生成器；否则，委派生成器抛出 GeneratorExit 异常。
            raise _e
        except BaseException as _e: # 7 这一部分处理调用方通过.throw() 方法传入的异常。如果子生成器是迭代器，没有throw()方法，这种情况会导致委派生成器抛出异常
            _x = sys.exc_info()
            try:
                # 传入委派生成器的异常，除了 GeneratorExit 之外都传给子生成器的throw()方法。
                _m = _i.throw
            except AttributeError:
                # 子生成器一迭代器，没有throw()方法， 调用throw()方法时抛出AttributeError异常传给委派生成器
                raise _e
            else: # 8
                try:
                    _y = _m(*_x)
                except StopIteration as _e:
                     # 如果调用throw()方法时抛出 StopIteration 异常，委派生成器恢复运行。
                     # StopIteration之外的异常会向上冒泡。传给委派生成器。
                    _r = _e.value
                    break
        else: # 9 如果产出值时没有异常
            try: # 10 尝试让子生成器向前执行
                if _s is None: 
                    # 11. 如果发送的值是None，那么会调用子生成器的 __next__()方法。
                    _y = next(_i)
                else:
                    # 11. 如果发送的值不是None，那么会调用子生成器的send()方法。
                    _y = _i.send(_s)
            except StopIteration as _e: # 12
                # 2. 如果调用的方法抛出StopIteration异常，获取异常对象的value属性，赋值给_r, 退出循环，委派生成器恢复运行。任何其他异常都会向上冒泡，传给委派生成器。
                _r = _e.value 
                break
RESULT = _r #13 返回的结果是 _r 即整个yield from表达式的值
```

上段代码变量说明:

* _i 迭代器（子生成器）
* _y 产出的值 （子生成器产出的值）
* _r 结果 （最终的结果  即整个yield from表达式的值）
* _s 发送的值 （调用方发给委派生成器的值，这个只会传给子生成器）
* _e 异常 （异常对象）

我们可以看到在代码的第一个 try 部分 使用 _y = next(_i) 预激了子生成器。这可以看出，上一篇我们使用的用于自动预激的装饰器与yield from 语句不兼容。

除了这段伪代码之外，[PEP380](https://www.python.org/dev/peps/pep-0380/#proposal) 还有个说明：

```python
In a generator, the statement

return value

is semantically equivalent to

raise StopIteration(value)

except that, as currently, the exception cannot be caught by except clauses within the returning generator.
```

这也就是为什么 yield from 可以使用return 来返回值而 yield 只能使用 try ... except StopIteration ... 来捕获异常的value 值。

```python
>>> try:
...     coro_avg.send(None)
... except StopIteration as exc:
...     result = exc.value
...
>>> result
```

到这里，我们已经了解了 yield from 的具体细节。下一篇，会分析一个使用协程的经典案例： 仿真编程。这个案例说明了如何使用协程在单线程中管理并发活动。

## 参考文档

* 流畅的python 第16章（这是读书笔记，这是读书笔记）
* [PEP 380-- Syntax for Delegating to a Subgenerator](https://www.python.org/dev/peps/pep-0380/#proposal)
* [How Python 3.3 "yield from" construct works](http://flupy.org/resources/yield-from.pdf)

----------------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)