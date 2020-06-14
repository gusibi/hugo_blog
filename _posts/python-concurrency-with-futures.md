---
categories: ["development", "python", "读书笔记"]
date: 2017-06-17T22:01:51+08:00
author: goodspeed
permalink: /post/python-concurrency-with-futures
tags: ["python", "tutorial","读书笔记", "并发"]
title: python并发 1：使用 futures 处理并发
---

> 作为Python程序员，平时很少使用并发编程，偶尔使用也只需要派生出一批独立的线程，然后放到队列中，批量执行。所以，不夸张的说，虽然我知道线程、进程、并行、并发的概念，但每次使用的时候可能还需要再打开文档回顾一下。

现在这一篇还是 *《流畅的python》读书笔记*，译者在这里把future 翻译为“期物”，我觉得不太合适，既然future不能找到一个合适的词汇，暂时还是直接使用 future 吧。


## concurrent.futures

future 是一种对象，表示异步执行的操作。这个概念是 concurrent.futures模块和asyncio包的基础。

concurrent.futures 模块是Python3.2 引入的，对于Python2x 版本，Python2.5 以上的版本可以安装 futures 包来使用这个模块。

HUGOMORE42

从Python3.4起，标准库中有两个为Future的类：concurrent.futures.Future 和 asyncio.Future。这两个类作用相同：两个Future类的实例都表示可能已经完成或未完成的延迟计算。

Future 封装待完成的操作，可放入队列，完成的状态可以查询，得到结果（或抛出异常）后可以获取结果（或异常）。

我们知道，如果程序中包含I/O操作，程序会有很高的延迟，CPU会处于等待状态，这时如果我们不使用并发会浪费很多时间。

### 示例

我们先举个例子：

下边是有两段代码，主要功能都是从网上下载人口前20的国际的国旗：
第一段代码(flagss.py)是依序下载：下载完一个图片后保存到硬盘，然后请求下一张图片；
第二段代码(flagss_threadpool.py)使用 concurrent.futures 模块，批量下载10张图片。

运行分别运行两段代码3次，结果如下：

images.py 的结果如下

```bash
$ python flags.py
BD BR CD CN DE EG ET FR ID IN IR JP MX NG PH PK RU TR US VN 
20 flags downloaded in 6.18s

$ python flags.py
BD BR CD CN DE EG ET FR ID IN IR JP MX NG PH PK RU TR US VN 
20 flags downloaded in 5.67s

$ python flags.py
BD BR CD CN DE EG ET FR ID IN IR JP MX NG PH PK RU TR US VN 
20 flags downloaded in 6.55s

```

> 可以看到，依次下载10张图片，平均需要6秒

flags_threadpool.py 的结果如下：

```bash
$ python flags_threadpool.py
NG EG VN BR JP FR DE CN TR BD PK MX PH US RU IN ET CD ID IR 
20 flags downloaded in 2.12s

$ python flags_threadpool.py
BR IN DE FR TR RU EG NG JP CN ID ET PK MX PH US IR CD VN BD 
20 flags downloaded in 2.23s

$ python flags_threadpool.py
CN BR DE ID NG RU TR IN MX US IR BD VN CD PH EG FR JP ET PK 
20 flags downloaded in 1.18s

```
> 使用 concurrent.futures 后，下载10张图片平均需要2秒

通过上边的结果我们发现使用 concurrent.futures 后，下载效率大幅提升。

下边我们来看下这两段代码。

同步执行的代码flags.py：

```python
#! -*- coding: utf-8 -*-

import os
import time
import sys

import requests  # <1>

POP20_CC = ('CN IN US ID BR PK NG BD RU JP '
            'MX PH VN ET EG DE IR TR CD FR').split()  # <2>

BASE_URL = 'http://flupy.org/data/flags'  # <3>

DEST_DIR = 'images/'  # <4>


# 保存图片
def save_flag(img, filename):  # <5>
    path = os.path.join(DEST_DIR, filename)
    with open(path, 'wb') as fp:
        fp.write(img)


# 下载图片
def get_flag(cc):  # <6>
    url = '{}/{cc}/{cc}.gif'.format(BASE_URL, cc=cc.lower())
    # 这里我们使用 requests 包，需要先通过pypi安装
    resp = requests.get(url)
    return resp.content


# 显示一个字符串，然后刷新sys.stdout,目的是在一行消息中看到进度
def show(text):  # <7>
    print(text, end=' ')
    sys.stdout.flush()


def download_many(cc_list):  # <8>
    for cc in sorted(cc_list):  # <9>
        image = get_flag(cc)
        show(cc)
        save_flag(image, cc.lower() + '.gif')

    return len(cc_list)


def main(download_many):  # <10>
    t0 = time.time()
    count = download_many(POP20_CC)
    elapsed = time.time() - t0
    msg = '\n{} flags downloaded in {:.2f}s'
    print(msg.format(count, elapsed))


if __name__ == '__main__':
    main(download_many)  # <11>
```

使用 concurrent.future 并发的代码 flags_threadpool.py

```python
#! -*- coding: utf-8 -*-

from concurrent import futures

from flags import save_flag, get_flag, show, main

# 设定ThreadPoolExecutor 类最多使用几个线程
MAX_WORKERS = 20


# 下载一个图片
def download_one(cc):
    image = get_flag(cc)
    show(cc)
    save_flag(image, cc.lower() + '.gif')
    return cc


def download_many(cc_list):
    # 设定工作的线程数量，使用约需的最大值与要处理的数量直接较小的那个值，以免创建多余的线程
    workers = min(MAX_WORKERS, len(cc_list))  # <4>
    # 使用工作的线程数实例化ThreadPoolExecutor类；
    # executor.__exit__方法会调用executor.shutdown(wait=True)方法，
    # 它会在所有线程都执行完毕前阻塞线程
    with futures.ThreadPoolExecutor(workers) as executor:  # <5>
        # map 与内置map方法类似，不过download_one 函数会在多个线程中并发调用；
        # map 方法返回一个生成器，因此可以迭代，
        # 迭代器的__next__方法调用各个Future 的 result 方法
        res = executor.map(download_one, sorted(cc_list))

    # 返回获取的结果数量；如果有现成抛出异常，会在这里抛出
    # 这与隐式调用next() 函数从迭代器中获取相应的返回值一样。
    return len(list(res))  # <7>
    return len(results)


if __name__ == '__main__':
    main(download_many)
```

上边的代码，我们对 concurrent.futures 的使用有了大致的了解。但 future 在哪里呢，我们并没有看到。

Future 是 concurrent.futures 模块和 asyncio 包的重要组件。从Python3.4起，标准库中有两个为Future的类：concurrent.futures.Future 和 asyncio.Future。这两个Future作用相同。

Future 封装待完成的操作，可放入队列，完成的状态可以查询，得到结果（或抛出异常）后可以获取结果（或异常）。
Future 表示终将发生的事情，而确定某件事情会发生的唯一方式是执行的时间已经排定。因此只有把某件事交给 concurrent.futures.Executor 子类处理时，才会创建 concurrent.futures.Future 实例。

> 例如，调用Executor.submit() 方法的参数是一个可调用的对象，调用这个方法后会为传入的可调用对象排期，并返回一个Future。

Future 有三个重要的方法：

* .done()  返回布尔值，表示Future 是否已经执行
* .add_done_callback() 这个方法只有一个参数，类型是可调用对象，Future运行结束后会回调这个对象。
* .result() 如果 Future 运行结束后调用result(), 会返回可调用对象的结果或者抛出执行可调用对象时抛出的异常，如果是 Future 没有运行结束时调用 f.result()方法，这时会阻塞调用方所在的线程，直到有结果返回。此时result 方法还可以接收 timeout 参数，如果在指定的时间内 Future 没有运行完毕，会抛出 TimeoutError 异常。

> asyncio.Future.result 方法不支持设定超时时间，如果想获取 Future 的结果，可以使用 yield from 结构


为了加深对 Future 的理解，现在我们修改下 flags_threadpool.py download_many 函数。


```python
def download_many(cc_list):
    cc_list = cc_list[:5]
    with futures.ThreadPoolExecutor(max_workers=3) as executor:
        to_do = []
        # 用于创建并排定 future
        for cc in sorted(cc_list):
            # submit 方法排定可调用对象的执行时间然后返回一个future，表示这个待执行的操作
            future = executor.submit(download_one, cc)
            to_do.append(future)
            msg = 'Scheduled for {}: {}'
            print(msg.format(cc, future))
        
        results = []
        # 用于获取future 结果
        # as_completed 接收一个future 列表，返回值是一个迭代器，在运行结束后产出future
        for future in futures.as_completed(to_do):
            res = future.result()
            msg = '{} result: {!r}'
            print(msg.format(future, res))
            results.append(res)
    
    return len(results)

```

现在执行代码，运行结果如下：

```python
Scheduled for BR: <Future at 0x10d43cb70 state=running>
Scheduled for CN: <Future at 0x10d4434a8 state=running>
Scheduled for ID: <Future at 0x10d443ef0 state=running>
Scheduled for IN: <Future at 0x10d443978 state=pending>
Scheduled for US: <Future at 0x10d44f748 state=pending>
BR <Future at 0x10d43cb70 state=finished returned str> result: 'BR'
IN <Future at 0x10d443978 state=finished returned str> result: 'IN'
CN <Future at 0x10d4434a8 state=finished returned str> result: 'CN'
ID <Future at 0x10d443ef0 state=finished returned str> result: 'ID'
US <Future at 0x10d44f748 state=finished returned str> result: 'US'

5 flags downloaded in 1.47s
```

从结果可以看到，future 的 repr() 方法会显示状态，前三个 是running 是因为我们设定了三个进程，所以后两个是pendding 状态。如果将max_workers参数设置为5，结果就会全都是 running。

虽然，使用 future 的脚步比第一个脚本的执行速度快了很多，但由于受GIL的限制，下载并不是并行的。

## GIL（Global Interpreter Lock）和阻塞型I/O

CPython 解释器本身不是线程安全的，因此解释器被一个全局解释器锁保护着，它确保任何时候都只有一个Python线程执行。

然而，Python标准库中所有执行阻塞型I/O操作的函数，在等待系统返回结果时都会释放GIL。这意味着I/O密集型Python程序能从中受益：一个Python线程等待网络响应时，阻塞型I/O函数会释放GIL，再运行一个线程。

> Python 标准库中所有阻塞型I/O函数都会释放GIL，允许其他线程运行。time.sleep()函数也会释放GIL。

**那么如何在CPU密集型作业中使用 concurrent.futures 模块绕开GIL呢？**

答案是 使用 *ProcessPoolExecutor* 类。

使用这个模块可以在做CPU密集型工作是绕开GIL，利用所有可用核心。


ThreadPoolExecutor 和 ProcessPoolExecutor 都实现了通用的 Executor 接口，所以，我们可以轻松的将基于线程的方案改为使用进程的方案。

比如下边这样：

```python
def download_many(cc_list):
    workers = min(MAX_WORKERS, len(cc_list))
    with futures.ThreadPoolExecutor(workers) as executor:
        pass

# 改成
def download_many(cc_list):
    with futures.ProcessPoolExecutor() as executor:
        pass
```

需要注意的是，ThreadPoolExecutor 需要指定 max_workers 参数，
而 ProcessPoolExecutor 的这个参数是可选的默认值是 os.cup_count()(计算机cpu核心数)。

ProcessPoolExecutor 的价值主要体现在CPU密集型作业上。

> 使用Python处理CPU密集型工作，应该试试PyPy，会有更高的执行速度。

现在我们回到开始的代码，看下 Executor.map 函数。

文档中对map函数的介绍如下。

> map(func, *iterables, timeout=None, chunksize=1)

> 等同于 map(func, *iterables)，不同的是 func 是异步执行的，并且可以同时进行对 func 的多个调用。如果调用 __next__()，则返回的迭代器提出 concurrent.futures.TimeoutError，并且在从 Executor.map() 的原始调用起的 timeout 秒之后结果不可用。 timeout 可以是int或float。如果未指定 timeout 或 None，则等待时间没有限制。如果调用引发异常，那么当从迭代器检索其值时，将引发异常。当使用 ProcessPoolExecutor 时，此方法将 iterables 分成多个块，它作为单独的任务提交到进程池。这些块的（近似）大小可以通过将 chunksize 设置为正整数来指定。对于非常长的迭代，与默认大小1相比，使用大值 chunksize 可以显着提高性能。使用 ThreadPoolExecutor，chunksize 没有效果。

> 在 3.5 版更改: 添加了 chunksize 参数。

Executor.map 还有个特性比较有用，那就是这个函数返回结果的顺序于调用开始的顺序是一致的。如果第一个调用称其结果用时10秒，其他调用只用1秒，代码会阻塞10秒，获取map方法返回的生成器产出的第一个结果。

如果不是获取到所有结果再处理，通常会使用 Executor.submit + Executor.as_completed 组合使用的方案。

Executor.submit + Executor.as_completed 这个组合更灵活，因为submit方法能处理不同的可调用对象和参数，而executor.map 只能处理参数不同的同一个可调用对象。此外，传给futures.as_completed 函数的期物集合可以来自不同的 Executor 实例。

## future 的异常处理

futures 有三个异常类：

* exception concurrent.futures.CancelledError  在future取消时引发。
* exception concurrent.futures.TimeoutError 在future操作超过给定超时时触发。
* exception concurrent.futures.process.BrokenProcessPool
从 RuntimeError 派生，当 ProcessPoolExecutor 的一个工人以非干净方式终止（例如，如果它从外部被杀死）时，引发此异常类。

我们先看一下，future.result() 出现异常的处理情况。代码改动如下：

```python

# 将第一个 CN 改为CN1 也可以是其它任意错误代码
POP20_CC = ('CN1 IN US ID BR PK NG BD RU JP '
            'MX PH VN ET EG DE IR TR CD FR').split()


def get_flag(cc):  # <6>
    url = '{}/{cc}/{cc}.gif'.format(BASE_URL, cc=cc.lower())
    resp = requests.get(url)
    if resp.status_code != 200:  # <1>
        resp.raise_for_status() # 如果不是200 抛出异常
    return resp.content

def download_one(cc):
    try:
        image = get_flag(cc)
    # 捕获 requests.exceptions.HTTPError
    except requests.exceptions.HTTPError as exc:  #
        # 如果有异常 直接抛出
        raise
    else:
        save_flag(image, cc.lower() + '.gif')
    return cc

```

现在执行代码，会发现 download_one 中的异常传递到了download_many 中,并且导致抛出了异常，未执行完的其它future 也都中断。

为了能保证其它没有错误的future 可以正常执行，这里我们需要对future.result() 做异常处理。

改动结果如下：

```python
def download_many(cc_list):
    cc_list = cc_list[:5]
    with futures.ThreadPoolExecutor(max_workers=20) as executor:
        to_do_map = {}
        for cc in sorted(cc_list):
            future = executor.submit(download_one, cc)
            to_do_map[future] = cc
            msg = 'Scheduled for {}: {}'
            print(msg.format(cc, future))

        results = []
        for future in futures.as_completed(to_do_map):
            try:
                res = future.result()
            except requests.exceptions.HTTPError as exc:
                # 处理可能出现的异常
                error_msg = '{} result {}'.format(cc, exc)
            else:
                error_msg = ''
            if error_msg:
                cc = to_do_map[future]  # <16>
                print('*** Error for {}: {}'.format(cc, error_msg))
            else:
                msg = '{} result: {!r}'
                print(msg.format(future, res))
                results.append(res)

    return len(results)

```

这里我们用到了一个对 futures.as_completed 函数特别有用的惯用法：构建一个字典，把各个future映射到其他数据（future运行结束后可能用的）上。这样，虽然 future生成的顺序虽然已经乱了，依然便于使用结果做后续处理。

一篇写完了没有总结总感觉少点什么，所以。

## 总结

Python 自 0.9.8 版就支持线程了，concurrent.futures 只不过是使用线程的最新方式。

futures.ThreadPoolExecutor 类封装了 threading 模块的组件，使使用线程变得更加方便。

顺便再推荐一下 《流畅的python》，绝对值得一下。

下一篇笔记应该是使用 asyncio 处理并发。

------------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)