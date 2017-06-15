---
categories: ["development", "python", "读书笔记"]
date: 2017-06-15T19:22:49+08:00
draft: false
slug: "python-coroutine-discrete-event-simulation"
tags: ["python", "读书笔记"]
title: "python协程3：用仿真实验学习协程"
---

前两篇我们已经介绍了[python 协程的使用](https://gusibi.github.io/post/python-coroutine-1-yield/)和[yield from 的原理](https://gusibi.github.io/post/python-coroutine-yield-from/)，这一篇，我们用一个例子来揭示如何使用协程在单线程中管理并发活动。

## 什么是离散事件仿真

Wiki上的定义是：

> 离散事件仿真将系统随时间的变化抽象成一系列的离散时间点上的事件，通过按照事件时间顺序处理事件来演进，是一种事件驱动的仿真世界观。离散事件仿真将系统的变化看做一个事件，因此系统任何的变化都只能是通过处理相应的事件来实现，在两个相邻的事件之间，系统状态维持前一个事件发生后的状态不变。

人话说就是一种把系统建模成一系列事件的仿真系统。在离散事件仿真中，仿真“钟”向前推进的量不是固定的，而是直接推进到下一个事件模型的模拟时间。

假设我们抽象模拟出租车的运营过程，其中一个事件是乘客上车，下一个事件则是乘客下车。不管乘客做了5分钟还是50分钟，一旦下车，仿真钟就会更新，指向此次运营的结束时间。

事件？是不是想到了协程！

协程恰好为实现离散事件仿真提供了合理的抽象。

> 第一门面向对象的语音 Simula 引入协程这个概念就是为了支持仿真。
> Simpy 是一个实现离散事件仿真的Python包，通过一个协程表示离散事件仿真系统的各个进程。

## 出租车对运营仿真

仿真程序会创建几辆出租车，每辆出租车会拉几个乘客，然后回家。出租车会首先驶离车库，四处徘徊，寻找乘客；拉到乘客后，行程开始；乘客下车后，继续四处徘徊。

徘徊和行程所用的时间使用指数分布生成，我们将时间设为分钟数，以便显示清楚。

完整代码如下：(taxi_sim.py)

```python

#! -*- coding: utf-8 -*-
import random
import collections
import queue
import argparse

DEFAULT_NUMBER_OF_TAXIS = 3
DEFAULT_END_TIME = 180
SEARCH_DURATION = 5
TRIP_DURATION = 20
DEPARTURE_INTERAVAL = 5


# time 是事件发生的仿真时间，proc 是出租车进程实例的编号，action是描述活动的字符串
Event = collections.namedtuple('Event', 'time proc action')

# 开始 出租车进程
# 每辆出租车调用一次taxi_process 函数，创建一个生成器对象，表示各辆出租车的运营过程。
def taxi_process(ident, trips, start_time=0):
    '''
    每次状态变化时向创建事件，把控制权交给仿真器
    :param ident: 出租车编号
    :param trips: 出租车回家前的行程数量
    :param start_time: 离开车库的时间
    :return: 
    '''
    time = yield Event(start_time, ident, 'leave garage') # 产出的第一个Event
    for i in range(trips):  # 每次行程都会执行一遍这个代码块
        # 产出一个Event实例，表示拉到了乘客 协程在这里暂停 等待下一次send() 激活
        time = yield Event(time, ident, 'pick up passenger')
         # 产出一个Event实例，表示乘客下车 协程在这里暂停 等待下一次send() 激活
        time = yield Event(time, ident, 'drop off passenger')
    # 指定的行程数量完成后，for 循环结束，最后产出 'going home' 事件。协程最后一次暂停
    yield Event(time, ident, 'going home')
    # 协程执行到最后 抛出StopIteration 异常


def compute_duration(previous_action):
    '''使用指数分布计算操作的耗时'''
    if previous_action in ['leave garage', 'drop off passenger']:
        # 新状态是四处徘徊
        interval = SEARCH_DURATION
    elif previous_action == 'pick up passenger':
        # 新状态是开始行程
        interval = TRIP_DURATION
    elif previous_action == 'going home':
        interval = 1
    else:
        raise ValueError('Unkonw previous_action: %s' % previous_action)
    return int(random.expovariate(1/interval)) + 1


# 开始仿真
class Simulator:

    def __init__(self, procs_map):
        self.events = queue.PriorityQueue()  # 带优先级的队列 会按时间正向排序
        self.procs = dict(procs_map) # 从获取的procs_map 参数中创建本地副本，为了不修改用户传入的值

    def run(self, end_time):
        '''
        调度并显示事件，直到时间结束
        :param end_time:  结束时间 只需要指定一个参数
        :return: 
        '''
        # 调度各辆出租车的第一个事件
        for iden, proc in sorted(self.procs.items()):
            first_event = next(proc)  # 预激协程 并产出一个 Event 对象
            self.events.put(first_event)  # 把各个事件加到self.events 属性表示的 PriorityQueue对象中

        # 此次仿真的主循环
        sim_time = 0  # 把 sim_time 归0
        while sim_time < end_time:
            if self.events.empty(): # 事件全部完成后退出循环
                print('*** end of event ***')
                break
            current_event = self.events.get() # 获取优先级最高(time 属性最小)的事件
            sim_time, proc_id, previous_action = current_event # 更新 sim_time
            print('taxi:', proc_id, proc_id * '  ', current_event)
            active_proc = self.procs[proc_id]  # 从self.procs 字典中获取表示当前活动的出租车协程
            next_time = sim_time + compute_duration(previous_action)
            try:
                next_event = active_proc.send(next_time)  # 把计算得到的时间发送给出租车协程。协程会产出下一个事件，或者抛出 StopIteration
            except StopIteration:
                del self.procs[proc_id]  # 如果有异常 表示已经退出， 删除这个协程
            else:
                self.events.put(next_event)  # 如果没有异常，把next_event 加入到队列
        else:  # 如果超时 则走到这里
            msg = '*** end of simulation time: {} event pendding ***'
            print(msg.format(self.events.qsize()))



def main(end_time=DEFAULT_END_TIME, num_taxis=DEFAULT_NUMBER_OF_TAXIS,
         seed=None):
    '''初始化随机生成器，构建过程，运行仿真程序'''
    if seed is not None:
        random.seed(seed)  # 获取可复现的结果
    # 构建taxis 字典。值是三个参数不同的生成器对象。
    taxis = {i: taxi_process(i, (i + 1) * 2, i*DEPARTURE_INTERAVAL)
             for i in range(num_taxis)}
    sim = Simulator(taxis)
    sim.run(end_time)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Taxi fleet simulator.')
    parser.add_argument('-e', '--end-time', type=int,
                        default=DEFAULT_END_TIME,
                        help='simulation end time; default=%s' % DEFAULT_END_TIME)
    parser.add_argument('-t', '--taxis', type=int,
                        default=DEFAULT_NUMBER_OF_TAXIS,
                        help='number of taxis running; default = %s' % DEFAULT_NUMBER_OF_TAXIS)
    parser.add_argument('-s', '--seed', type=int, default=None,
                        help='random generator seed (for testing)')

    args = parser.parse_args()
    main(args.end_time, args.taxis, args.seed)

```

运行程序，

```sh
# -s 3 参数设置随机生成器的种子，以便调试的时候随机数不变，输出相同的结果
python taxi_sim.py -s 3
```

输出结果如下图

![](http://omuo4kh1k.bkt.clouddn.com/LEcgG_eLqVy8TH3DX6zFYPa9Kw1c5ykRQ9cSdEa4P00ATIbfCq2aI_49CtskhGyI)

从结果我们可以看出，3辆出租车的行程是交叉进行的。不同颜色的箭头代表不同出租车从乘客上车到乘客下车的跨度。

从结果可以看出：

* 出租车每5隔分钟从车库出发
* 0 号出租车2分钟后拉到乘客（time=2），1号出租车3分钟后拉到乘客（time=8），2号出租车5分钟后拉到乘客（time=15）
* 0 号出租车拉了两个乘客
* 1 号出租车拉了4个乘客
* 2 号出租车拉了6个乘客
* 在此次示中，所有排定的事件都在默认的仿真时间内完成

我们先在控制台中调用taxi_process 函数，自己驾驶一辆出租车，示例如下：

```python
In [1]: from taxi_sim import taxi_process
# 创建一个生成器，表示一辆出租车 编号是13 从t=0 开始，有两次行程
In [2]: taxi = taxi_process(ident=13, trips=2, start_time=0) 

In [3]: next(taxi) # 预激协程
Out[3]: Event(time=0, proc=13, action='leave garage')

# 发送当前时间 在控制台中，变量_绑定的是前一个结果
# _.time + 7 是 0 + 7
In [4]: taxi.send(_.time+7) 
Out[4]: Event(time=7, proc=13, action='pick up passenger') # 这个事件有for循环在第一个行程的开头产出

# 发送_.time+12 表示这个乘客用时12分钟
In [5]: taxi.send(_.time+12)
Out[5]: Event(time=19, proc=13, action='drop off passenger')

# 徘徊了29 分钟
In [6]: taxi.send(_.time+29)
Out[6]: Event(time=48, proc=13, action='pick up passenger')

# 乘坐了50分钟
In [7]: taxi.send(_.time+50)
Out[7]: Event(time=98, proc=13, action='drop off passenger')

# 两次行程结束 for 循环结束产出'going home'
In [8]: taxi.send(_.time+5)
Out[8]: Event(time=103, proc=13, action='going home')

# 再发送值，会执行到末尾 协程返回后 抛出 StopIteration 异常
In [9]: taxi.send(_.time+10)
---------------------------------------------------------------------------
StopIteration                            Traceback (most recent call last)
<ipython-input-9-d775cc8cc079> in <module>()
----> 1 taxi.send(_.time+10)

StopIteration:
```

在这个示例中，我们用控制台模拟仿真主循环。从taxi协程中产出的Event实例中获取 .time 属性，随意加一个数，然后调用send()方法发送两数之和，重新激活协程。

在taxi_sim.py 代码中，出租车协程由 Simulator.run 方法中的主循环驱动。

Simulator 类的主要数据结构如下：

self.events

    PriorityQueue 对象，保存Event实例。元素可以放进PriorityQueue对象中，然后按 item[0](对象的time 属性)依序取出（按从小到大）。

self.procs

    一个字典，把出租车的编号映射到仿真过程的进程（表示出租车生成器的对象）。这个属性会绑定前面所示的taxis字典副本。

> 优先队列是离散事件仿真系统的基础构件：创建事件的顺序不定，放入这种队列后，可以按各个事件排定的顺序取出。

比如，我们把两个事件放入队列：

```python
Event(time=14, proc=0, action='pick up passenger')
Event(time=10, proc=1, action='pick up passenger')
```

这个意思是 0号出租车14分拉到一个乘客，1号出租车10分拉到一个乘客。但是主循环获取的第一个事件将是

Event(time=10, proc=1, action='pick up passenger')

下面我们分析一下仿真系统的主算法--Simulator.run 方法。

1. 迭代表示各辆出租车的进程
  * 在各辆出租车上调用next()函数，预激协程。
  * 把各个事件放入Simulator类的self.events属性中。
2. 满足 sim_time < end_time 条件是，运行仿真系统的主循环。
  * 检查self.events 属性是否为空；如果为空，跳出循环
  * 从self.events 中获取当前事件
  * 显示获取的Event对象
  * 获取curent_event 的time 属性，更新仿真时间
  * 把时间发送给current_event 的pro属性标识的协程，产出下一个事件
  * 把next_event 添加到self.events 队列中，排定 next_event 

我们代码中 while 循环有一个else 语句，仿真系统到达结束时间后，代码会执行else中的语句。

这个示例主要是想说明如何在一个主循环中处理事件，以及如何通过发送数据驱动协程，同时解释了如何使用生成器代替线程和回调，实现并发。

> 并发： 多个任务交替执行
>
> 并行： 多个任务同时执行

到这里 Python协程系列的三篇文章就结束了。

> 我们会看到，协程做面向事件编程时，会不断把控制权让步给主循环，激活并向前运行其他协程，从而执行各个并发活动。
>
> 协程一种协作式多任务：协程显式自主的把控制权让步给中央调度程序。
>
> 多线程实现的是抢占式多任务。调度程序可以在任何时刻暂停线程，把控制权交给其他线程

## 前两篇文章

[python 协程1：协程10分钟入门](https://gusibi.github.io/post/python-coroutine-1-yield/)
[python 协程2：yield from 从入门到精通](https://gusibi.github.io/post/python-coroutine-yield-from/)

再次说明一下，这几篇是《流畅的python》一书的读书笔记，作者提供了大量的扩展阅读，有兴趣的可以看一下。

## 扩展阅读

* [Generator Tricks for Systems Programmers](http://www.dabeaz.com/generators/)
* [A Curious Course on Coroutines and Concurrency](http://www.dabeaz.com/coroutines/)
* [Generators: The Final Frontier](http://www.dabeaz.com/finalgenerator/)
* [greedy algorithm with coroutines](http://seriously.dontusethiscode.com/2013/05/01/greedy-coroutine.html)
* BinaryTree类、一个简单的XML解析器、和一个任务调度器[Proposal for a yield from statement for Python](http://www.cosc.canterbury.ac.nz/greg.ewing/python/yield-from/yield_from.html)
* [考虑用协程操作多个函数](http://www.effectivepython.com/2015/03/10/consider-coroutines-to-run-many-functions-concurrently/)

最后，感谢女朋友支持。

恩，也欢迎打赏。

![喜欢也可以微信打赏一下](http://omuo4kh1k.bkt.clouddn.com/qn-FaCXmUz7zHtZgN4Je1CEE94ibt5cZRr3_iavTVsMioCR83oNa8d4pq1fgo84y)