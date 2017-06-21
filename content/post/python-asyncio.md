---
date: 2017-06-19T20:32:38+08:00
description: description
draft: true
slug: "python-asyncio"
categories: ["development", "python", "读书笔记"]
tags: ["python", "读书笔记"]
title: "python并发2：使用asyncio处理并发"
---

## asyncio 

asyncio 是Python3.4 之后引入的标准库的，这个包使用事件循环驱动的协程实现并发。

这个包在引入标准库之前代号 “Tulip”（郁金香），所以在网上搜索资料时，会经常看到这种花的名字。


## 线程与协程

我们先看两断代码，分别用 threading 模块和asyncio 包实现的一段代码。

```python
# sinner_thread.py

import threading
import itertools
import time
import sys


class Signal: # 这个类定义一个可变对象，用于从外部控制线程
    go = True


def spin(msg, signal):  # 这个函数会在单独的线程中运行，signal 参数是前边定义的Signal类的实例
    write, flush = sys.stdout.write, sys.stdout.flush
    for char in itertools.cycle('|/-\\'):  # itertools.cycle 函数从指定的序列中反复不断地生成元素
        status = char + ' ' + msg
        write(status)
        flush()
        write('\x08' * len(status))  # 使用退格符把光标移回行首
        time.sleep(.1)  # 每 0.1 秒刷新一次
        if not signal.go:  # 如果 go属性不是 True，退出循环
            break

    write(' ' * len(status) + '\x08' * len(status))  # 使用空格清除状态消息，把光标移回开头


def slow_function():  # 模拟耗时操作
    # 假装等待I/O一段时间
    time.sleep(3)  # 调用sleep 会阻塞主线程，这么做事为了释放GIL，创建从属线程
    return 42


def supervisor():  # 这个函数设置从属线程，显示线程对象，运行耗时计算，最后杀死进程
    signal = Signal()
    spinner = threading.Thread(target=spin,
                               args=('thinking!', signal))
    print('spinner object:', spinner)  # 显示线程对象 输出 spinner object: <Thread(Thread-1, initial)>
    spinner.start()  # 启动从属进程
    result = slow_function()  # 运行slow_function 行数，阻塞主线程。同时丛书线程以动画形式旋转指针
    signal.go = False
    spinner.join()  # 等待spinner 线程结束
    return result

def main():
    result = supervisor()  
    print('Answer', result)


if __name__ == '__main__':
    main()

```

执行一下，结果大致是这个样子：

![](http://omuo4kh1k.bkt.clouddn.com/QQ20170619-224013-HD.gif)

这是一个动图，“thinking" 前的 \ 线是会动的（为了录屏，我把sleep 的时间调大了）

> python 并没有提供终止线程的API，所以若想关闭线程，必须给线程发送消息。这里我们使用signal.go 属性：在主线程中把它设置为False后，spinner 线程会接收到，然后退出

现在我们再看下使用 asyncio 包的版本：

```python
# spinner_asyncio.py
# 通过协程以动画的形式显示文本式旋转指针

import asyncio
import itertools
import sys


@asyncio.coroutine # 打算交给asyncio 处理的协程要使用 @asyncio.coroutine 装饰
def spin(msg):
    write, flush = sys.stdout.write, sys.stdout.flush
    for char in itertools.cycle('|/-\\'):  # itertools.cycle 函数从指定的序列中反复不断地生成元素
        status = char + ' ' + msg
        write(status)
        flush()
        write('\x08' * len(status))  # 使用退格符把光标移回行首
        try:
            yield from asyncio.sleep(0.1)  # 使用 yield from asyncio.sleep(0.1) 代替 time.sleep(.1), 这样的休眠不会阻塞事件循环
        except asyncio.CancelledError:  # 如果 spin 函数苏醒后抛出 asyncio.CancelledError 异常，其原因是发出了取消请求
            break

    write(' ' * len(status) + '\x08' * len(status))  # 使用空格清除状态消息，把光标移回开头


@asyncio.coroutine
def slow_function():  # 5 现在此函数是协程，使用休眠假装进行I/O 操作时，使用 yield from 继续执行事件循环
    # 假装等待I/O一段时间
    yield from asyncio.sleep(3)  # 此表达式把控制权交给主循环，在休眠结束后回复这个协程
    return 42


@asyncio.coroutine
def supervisor():  #7 这个函数也是协程，因此可以使用 yield from 驱动 slow_function
    spinner = asyncio.async(spin('thinking!'))  # asyncio.async() 函数排定协程的运行时间，使用一个 Task 对象包装spin 协程，并立即返回
    print('spinner object:', spinner)  # Task 对象，输出类似 spinner object: <Task pending coro=<spin() running at spinner_asyncio.py:6>>
    # 驱动slow_function() 函数，结束后，获取返回值。同事事件循环继续运行，
    # 因为slow_function 函数最后使用yield from asyncio.sleep(3) 表达式把控制权交给主循环
    result = yield from slow_function()
    # Task 对象可以取消；取消后会在协程当前暂停的yield处抛出 asyncio.CancelledError 异常
    # 协程可以捕获这个异常，也可以延迟取消，甚至拒绝取消
    spinner.cancel()

    return result

def main():
    loop = asyncio.get_event_loop()  # 获取事件循环引用
    # 驱动supervisor 协程，让它运行完毕；这个协程的返回值是这次调用的返回值
    result = loop.run_until_complete(supervisor())
    loop.close()
    print('Answer', result)


if __name__ == '__main__':
    main()
```

> 除非想阻塞主线程，从而冻结事件循环或整个应用，否则不要再 asyncio 协程中使用 time.sleep().
> 如果协程需要在一段时间内什么都不做，应该使用 yield from asyncio.sleep(DELAY)

使用 @asyncio.coroutine 装饰器不是强制要求，但建议这么做因为这样能在代码中突显协程，如果还没从中产出值，协程就把垃圾回收了（意味着操作未完成，可能有缺陷），可以发出警告。这个装饰器不会预激协程。

这两段代码的执行结果基本相同，现在我们看一下两段代码的核心代码 supervisor 主要区别：


## 总结

这一篇我们讨论了：

* 对比了一个多线程程序和asyncio版，说明了多线程和异步任务之间的关系
* 比较了 asyncio.Future 类 和 concurrent.futures.Future 类的区别
* 如何使用异步编程管理网络应用中的高并发
* 在异步编程中，与回调相比，协程显著提升性能的方式
* 如何把阻塞的操作交给线程池处理，从而避免阻塞事件循环
* 使用 asyncio 编写服务器


## 参考链接

* [asyncio — Asynchronous I/O, event loop, coroutines and tasks](https://docs.python.org/3/library/asyncio.html)
* [PEP 0492 Coroutines with async and await syntax](https://www.python.org/dev/peps/pep-0492/)
* [Python 之 asyncio](https://juejin.im/entry/57b138e1165abd00542ab1fa)
* [我所不能理解的Python中的Asyncio模块](https://python.freelycode.com/contribution/detail/515)

最后，感谢女朋友支持。

|>欢迎关注 | >请我喝芬达|
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)