---
title: 'python并发4：使用thread处理并发'
date: 2017-07-02 08:29:39
tags: [python,tutorial,读书笔记,并发]
published: true
hideInList: false
feature: 
isTop: false
---

> 这一篇是Python并发的第四篇，主要介绍进程和线程的定义，Python线程和全局解释器锁以及Python如何使用thread模块处理并发，这篇文章之前发过，但是前几篇介绍到了并发，就顺便再发一下组成一个系列

## 引言&动机

考虑一下这个场景，我们有10000条数据需要处理，处理每条数据需要花费1秒，但读取数据只需要0.1秒，每条数据互不干扰。该如何执行才能花费时间最短呢？

在多线程(MT)编程出现之前，电脑程序的运行由一个执行序列组成，执行序列按顺序在主机的中央处理器(CPU)中运行。无论是任务本身要求顺序执行还是整个程序是由多个子任务组成，程序都是按这种方式执行的。即使子任务相互独立，互相无关(即，一个子任务的结果不影响其它子 任务的结果)时也是这样。

HUGOMORE42

对于上边的问题，如果使用一个执行序列来完成，我们大约需要花费 10000*0.1 + 10000 = 11000 秒。这个时间显然是太长了。

那我们有没有可能在执行计算的同时取数据呢？或者是同时处理几条数据呢？如果可以，这样就能大幅提高任务的效率。这就是多线程编程的目的。

对于本质上就是异步的， 需要有多个并发事务，各个事务的运行顺序可以是不确定的，随机的，不可预测的问题，多线程是最理想的解决方案。这样的任务可以被分成多个执行流，每个流都有一个要完成的目标，然后将得到的结果合并，得到最终的结果。

## 线程和进程

### 什么是进程

进程(有时被称为重量级进程)是程序的一次 执行。每个进程都有自己的地址空间，内存，数据栈以及其它记录其运行轨迹的辅助数据。操作系 统管理在其上运行的所有进程，并为这些进程公平地分配时间。进程也可以通过 fork 和 spawn 操作 来完成其它的任务。不过各个进程有自己的内存空间，数据栈等，所以只能使用进程间通讯(IPC)， 而不能直接共享信息。

### 什么是线程

线程(有时被称为轻量级进程)跟进程有些相似，不同的是，所有的线程运行在同一个进程中， 共享相同的运行环境。它们可以想像成是在主进程或“主线程”中并行运行的“迷你进程”。

线程状态如图

![线程状态如图](http://omuo4kh1k.bkt.clouddn.com/python-thread-status.png)


线程有开始，顺序执行和结束三部分。它有一个自己的指令指针，记录自己运行到什么地方。 线程的运行可能被抢占(中断)，或暂时的被挂起(也叫睡眠)，让其它的线程运行，这叫做让步。 一个进程中的各个线程之间共享同一片数据空间，所以线程之间可以比进程之间更方便地共享数据以及相互通讯。

当然，这样的共享并不是完全没有危险的。如果多个线程共同访问同一片数据，则由于数据访 问的顺序不一样，有可能导致数据结果的不一致的问题。这叫做竞态条件(race condition)。

线程一般都是并发执行的，不过在单 CPU 的系统中，真正的并发是不可能的，每个线程会被安排成每次只运行一小会，然后就把 CPU 让出来，让其它的线程去运行。由于有的函数会在完成之前阻塞住，在没有特别为多线程做修改的情 况下，这种“贪婪”的函数会让 CPU 的时间分配有所倾斜。导致各个线程分配到的运行时间可能不 尽相同，不尽公平。

## Python、线程和全局解释器锁

### 全局解释器锁(GIL)

首先需要明确的一点是GIL并不是Python的特性，它是在实现Python解析器(CPython)时所引入的一个概念。就好比C++是一套语言（语法）标准，但是可以用不同的编译器来编译成可执行代码。同样一段代码可以通过CPython，PyPy，Psyco等不同的Python执行环境来执行（其中的JPython就没有GIL）。

那么CPython实现中的GIL又是什么呢？GIL全称Global Interpreter Lock为了避免误导，我们还是来看一下官方给出的解释：

> In CPython, the global interpreter lock, or GIL, is a mutex that prevents multiple native threads from executing Python bytecodes at once. This lock is necessary mainly because CPython’s memory management is not thread-safe. (However, since the GIL exists, other features have grown to depend on the guarantees that it enforces.)

尽管Python完全支持多线程编程， 但是解释器的C语言实现部分在完全并行执行时并不是线程安全的。 实际上，解释器被一个全局解释器锁保护着，它确保任何时候都只有一个Python线程执行。

在多线程环境中，Python 虚拟机按以下方式执行:

1. 设置GIL
2. 切换到一个线程去执行
3. 运行
  - 指定数量的字节码指令
  - 线程主动让出控制（可以调用time.sleep(0))
4. 把线程设置完睡眠状态
5. 解锁GIL
6. 再次重复以上步骤

> 对所有面向 I/O 的(会调用内建的操作系统 C 代码的)程序来说，GIL 会在这个 I/O 调用之 前被释放，以允许其它的线程在这个线程等待 I/O 的时候运行。如果某线程并未使用很多 I/O 操作， 它会在自己的时间片内一直占用处理器(和 GIL)。也就是说，I/O 密集型的 Python 程序比计算密集 型的程序更能充分利用多线程环境的好处。

### 退出线程

当一个线程结束计算，它就退出了。线程可以调用 thread.exit()之类的退出函数，也可以使用 Python 退出进程的标准方法，如 sys.exit()或抛出一个 SystemExit 异常等。不过，你不可以直接 “杀掉”("kill")一个线程。

### 在 Python 中使用线程

在 Win32 和 Linux, Solaris, MacOS, \*BSD 等大多数类 Unix 系统上运行时，Python 支持多线程 编程。Python 使用 POSIX 兼容的线程，即 pthreads。

默认情况下，只要在解释器中

```
>> import thread
```

如果没有报错，则说明线程可用。

### Python 的 threading 模块

Python  供了几个用于多线程编程的模块，包括 thread, threading 和 Queue 等。thread 和 threading 模块允许程序员创建和管理线程。thread 模块 供了基本的线程和锁的支持，而 threading  供了更高级别，功能更强的线程管理的功能。Queue 模块允许用户创建一个可以用于多个线程之间 共享数据的队列数据结构。

##### 核心 示:避免使用 thread 模块

出于以下几点考虑，我们不建议您使用 thread 模块。

1. 更高级别的 threading 模块更为先 进，对线程的支持更为完善，而且使用 thread 模块里的属性有可能会与 threading 出现冲突。其次， 低级别的 thread 模块的同步原语很少(实际上只有一个)，而 threading 模块则有很多。
2. 对于你的进程什么时候应该结束完全没有控制，当主线程结束 时，所有的线程都会被强制结束掉，没有警告也不会有正常的清除工作。我们之前说过，至少 threading 模块能确保重要的子线程退出后进程才退出。


## thread 模块

除了产生线程外，thread 模块也提供了基本的同步数 据结构锁对象(lock object，也叫原语锁，简单锁，互斥锁，互斥量，二值信号量)。

thread 模块函数

* start_new_thread(function, args, kwargs=None)：产生一个新的线程，在新线程中用指定的参数和可选的 kwargs 来调用这个函数。
* allocate_lock()：分配一个 LockType 类型的锁对象
* exit()：让线程退出
* acquire(wait=None)：尝试获取锁对象
* locked()：如果获取了锁对象返回 True，否则返回 False
* release()：释放锁

下面是一个使用 thread 的例子：

``` python
import thread
from time import sleep, time


def loop(num):
    print('start loop at:', time())
    sleep(num)
    print('loop done at:', time())


def loop1(num):
    print('start loop 1 at:', time())
    sleep(num)
    print('loop 1 done at:', time())


def main():
    print('starting at:', time())
    thread.start_new_thread(loop, (4,))
    thread.start_new_thread(loop1, (5,))
    sleep(6)
    print('all DONE at:', time())

if __name__ == '__main__':
    main()

('starting at:', 1489387024.886667)
('start loop at:', 1489387024.88705)
('start loop 1 at:', 1489387024.887277)
('loop done at:', 1489387028.888182)
('loop 1 done at:', 1489387029.888904)
('all DONE at:', 1489387030.889918)
```

start_new_thread()要求一定要有前两个参数。所以，就算我们想要运行的函数不要参数，也要传一个空的元组。
为什么要加上sleep(6)这一句呢? 因为，如果我们没有让主线程停下来，那主线程就会运行下一条语句，显示 “all done”，然后就关闭运行着 loop()和 loop1()的两个线程，退出了。

我们有没有更好的办法替换使用sleep() 这种不靠谱的同步方式呢？答案是使用锁，使用了锁，我们就可以在两个线程都退出之后马上退出。


``` python
#! -*- coding: utf-8 -*-

import thread
from time import sleep, time

loops = [4, 2]

def loop(nloop, nsec, lock):
    print('start loop %s at: %s' % (nloop, time()))
    sleep(nsec)
    print('loop %s done at: %s' % (nloop, time()))
    # 每个线程都会被分配一个事先已经获得的锁，在 sleep()的时间到了之后就释放 相应的锁以通知主线程，这个线程已经结束了。
    lock.release()


def main():
    print('starting at:', time())
    locks = []
    nloops = range(len(loops))

    for i in nloops:
        # 调用 thread.allocate_lock()函数创建一个锁的列表
        lock = thread.allocate_lock()
        # 分别调用各个锁的 acquire()函数获得, 获得锁表示“把锁锁上”
        lock.acquire()
        locks.append(lock)

    for i in nloops:
        # 创建线程，每个线程都用各自的循环号，睡眠时间和锁为参数去调用 loop()函数
        thread.start_new_thread(loop, (i, loops[i], locks[i]))

    for i in nloops:
        # 在线程结束的时候，线程要自己去做解锁操作
        # 当前循环只是坐在那一直等(达到暂停主 线程的目的)，直到两个锁都被解锁为止才继续运行。
        while locks[i].locked(): pass

    print('all DONE at:', time())

if __name__ == '__main__':
    main()

```

为什么我们不在创建锁的循环里创建线程呢?有以下几个原因:
1. 我们想到实现线程的同步，所以要让“所有的马同时冲出栅栏”。
2. 获取锁要花一些时间，如果你的 线程退出得“太快”，可能会导致还没有获得锁，线程就已经结束了的情况。

## threading 模块

threading 模块不仅提供了 Thread 类，还提供了各种非常好用的同步机制。

下面是threading 模块里所有的对象：

1. Thread： 表示一个线程的执行的对象
2. Lock： 锁原语对象(跟 thread 模块里的锁对象相同)
3. RLock： 可重入锁对象。使单线程可以再次获得已经获得了的锁(递归锁定)。
4. Condition： 条件变量对象能让一个线程停下来，等待其它线程满足了某个“条件”。 如，状态的改变或值的改变。
5. Event： 通用的条件变量。多个线程可以等待某个事件的发生，在事件发生后， 所有的线程都会被激活。
6. Semaphore： 为等待锁的线程 供一个类似“等候室”的结构
7. BoundedSemaphore： 与 Semaphore 类似，只是它不允许超过初始值
8. Timer： 与 Thread 相似，只是，它要等待一段时间后才开始运行。

#### 守护线程

另一个避免使用 thread 模块的原因是，它不支持守护线程。当主线程退出时，所有的子线程不 论它们是否还在工作，都会被强行退出。有时，我们并不期望这种行为，这时，就引入了守护线程 的概念
threading 模块支持守护线程，它们是这样工作的:守护线程一般是一个等待客户请求的服务器， 如果没有客户 出请求，它就在那等着。如果你设定一个线程为守护线程，就表示你在说这个线程 是不重要的，在进程退出的时候，不用等待这个线程退出。
如果你的主线程要退出的时候，不用等待那些子线程完成，那就设定这些线程的 daemon 属性。 即，在线程开始(调用 thread.start())之前，调用 setDaemon()函数设定线程的 daemon 标志 (thread.setDaemon(True))就表示这个线程“不重要”
如果你想要等待子线程完成再退出，那就什么都不用做，或者显式地调用 thread.setDaemon(False)以保证其 daemon 标志为 False。你可以调用 thread.isDaemon()函数来判 断其 daemon 标志的值。新的子线程会继承其父线程的 daemon 标志。整个 Python 会在所有的非守护 线程退出后才会结束,即进程中没有非守护线程存在的时候才结束。

### Thread 类

Thread类提供了以下方法:

* run(): 用以表示线程活动的方法。
* start():启动线程活动。
* join([time]): 等待至线程中止。这阻塞调用线程直至线程的join() 方法被调用中止-正常退出或者抛出未处理的异常-或者是可选的超时发生。
* is_alive(): 返回线程是否活动的。
* name(): 设置/返回线程名。
* daemon(): 返回/设置线程的 daemon 标志，一定要在调用 start()函数前设置

用 Thread 类，你可以用多种方法来创建线程。我们在这里介绍三种比较相像的方法。

* 创建一个Thread的实例，传给它一个函数
* 创建一个Thread的实例，传给它一个可调用的类对象
* 从Thread派生出一个子类，创建一个这个子类的实例

下边是三种不同方式的创建线程的示例：

```python
#! -*- coding: utf-8 -*-

# 创建一个Thread的实例，传给它一个函数

import threading
from time import sleep, time

loops = [4, 2]

def loop(nloop, nsec, lock):
    print('start loop %s at: %s' % (nloop, time()))
    sleep(nsec)
    print('loop %s done at: %s' % (nloop, time()))
    # 每个线程都会被分配一个事先已经获得的锁，在 sleep()的时间到了之后就释放 相应的锁以通知主线程，这个线程已经结束了。


def main():
    print('starting at:', time())
    threads = []
    nloops = range(len(loops))

    for i in nloops:
        t = threading.Thread(target=loop, args=(i, loops[i]))
        threads.append(t)

    for i in nloops:
        # start threads
        threads[i].start()

    for i in nloops:
        # wait for all
        # join()会等到线程结束，或者在给了 timeout 参数的时候，等到超时为止。
        # 使用 join()看上去 会比使用一个等待锁释放的无限循环清楚一些(这种锁也被称为"spinlock")
        threads[i].join()  # threads to finish

    print('all DONE at:', time())

if __name__ == '__main__':
    main()
```
与传一个函数很相似的另一个方法是在创建线程的时候，传一个可调用的类的实例供线程启动 的时候执行——这是多线程编程的一个更为面向对象的方法。相对于一个或几个函数来说，由于类 对象里可以使用类的强大的功能，可以保存更多的信息，这种方法更为灵活

```python
#! -*- coding: utf-8 -*-

# 创建一个 Thread 的实例，传给它一个可调用的类对象

from threading import Thread
from time import sleep, time


loops = [4, 2]


class ThreadFunc(object):

    def __init__(self, func, args, name=""):
        self.name = name
        self.func = func
        self.args = args

    def __call__(self):
        # 创建新线程的时候，Thread 对象会调用我们的 ThreadFunc 对象，这时会用到一个特殊函数 __call__()。
        self.func(*self.args)


def loop(nloop, nsec):
    print('start loop %s at: %s' % (nloop, time()))
    sleep(nsec)
    print('loop %s done at: %s' % (nloop, time()))


def main():
    print('starting at:', time())
    threads = []
    nloops = range(len(loops))

    for i in nloops:
        t = Thread(target=ThreadFunc(loop, (i, loops[i]), loop.__name__))
        threads.append(t)

    for i in nloops:
        # start threads
        threads[i].start()

    for i in nloops:
        # wait for all
        # join()会等到线程结束，或者在给了 timeout 参数的时候，等到超时为止。
        # 使用 join()看上去 会比使用一个等待锁释放的无限循环清楚一些(这种锁也被称为"spinlock")
        threads[i].join()  # threads to finish

    print('all DONE at:', time())


if __name__ == '__main__':
    main()

```

最后一个例子介绍如何子类化 Thread 类，这与上一个例子中的创建一个可调用的类非常像。使用子类化创建线程(第 29-30 行)使代码看上去更清晰明了。

```python
#! -*- coding: utf-8 -*-

# 创建一个 Thread 的实例，传给它一个可调用的类对象

from threading import Thread
from time import sleep, time


loops = [4, 2]


class MyThread(Thread):

    def __init__(self, func, args, name=""):
        super(MyThread, self).__init__()
        self.name = name
        self.func = func
        self.args = args

    def getResult(self):
        return self.res

    def run(self):
        # 创建新线程的时候，Thread 对象会调用我们的 ThreadFunc 对象，这时会用到一个特殊函数 __call__()。
        print 'starting', self.name, 'at:', time()
        self.res = self.func(*self.args)
        print self.name, 'finished at:', time()



def loop(nloop, nsec):
    print('start loop %s at: %s' % (nloop, time()))
    sleep(nsec)
    print('loop %s done at: %s' % (nloop, time()))


def main():
    print('starting at:', time())
    threads = []
    nloops = range(len(loops))

    for i in nloops:
        t = MyThread(loop, (i, loops[i]), loop.__name__)
        threads.append(t)

    for i in nloops:
        # start threads
        threads[i].start()

    for i in nloops:
        # wait for all
        # join()会等到线程结束，或者在给了 timeout 参数的时候，等到超时为止。
        # 使用 join()看上去 会比使用一个等待锁释放的无限循环清楚一些(这种锁也被称为"spinlock")
        threads[i].join()  # threads to finish

    print('all DONE at:', time())


if __name__ == '__main__':
    main()

```

#### 下载国旗的例子

下面，我们接我们之前按之前并发的套路，用实现一下使用 threading 并发下载国旗

```python
# python3

import threading
from threading import Thread

from flags import save_flag, show, main, get_flag


class MyThread(Thread):

    def __init__(self, func, args, name=""):
        super(MyThread, self).__init__()
        self.name = name
        self.func = func
        self.args = args

    def getResult(self):
        return self.res

    def run(self):
        # 创建新线程的时候，Thread 对象会调用我们的 ThreadFunc 对象，这时会用到一个特殊函数 __call__()。
        self.res = self.func(*self.args)


def download_one(cc):  # <3>
    image = get_flag(cc)
    show(cc)
    save_flag(image, cc.lower() + '.gif')
    return cc


def download_many(cc_list):
    threads = []
    for cc in cc_list:
        thread = MyThread(download_one, (cc, ), download_one.__name__)
        threads.append(thread)

    for thread in threads:
        # 启动线程
        thread.start()

    for thread in threads:
        # wait for all
        # join()会等到线程结束，或者在给了 timeout 参数的时候，等到超时为止。
        # 使用 join()看上去 会比使用一个等待锁释放的无限循环清楚一些(这种锁也被称为"spinlock")
        thread.join()

    return len(list(threads))  # <7>


if __name__ == '__main__':
    main(download_many)
```

执行代码发现和使用协程相比速度基本一致。

除了各种同步对象和线程对象外，threading 模块还 供了一些函数。

* active_count(): 当前活动的线程对象的数量
* current_thread(): 返回当前线程对象
* enumerate(): 返回当前活动线程的列表
* settrace(func): 为所有线程设置一个跟踪函数
* setprofile(func): 为所有线程设置一个 profile 函数

### Lock & RLock

原语锁定是一个同步原语，状态是锁定或未锁定。两个方法acquire()和release() 用于加锁和释放锁。
RLock 可重入锁是一个类似于Lock对象的同步原语，但同一个线程可以多次调用。

Lock 不支持递归加锁，也就是说即便在同 线程中，也必须等待锁释放。通常建议改  RLock， 它会处理 "owning thread" 和 "recursion level" 状态，对于同 线程的多次请求锁 为，只累加
计数器。每次调 release() 将递减该计数器，直到 0 时释放锁，因此 acquire() 和 release() 必须 要成对出现。

```python

from time import sleep
from threading import current_thread, Thread

lock = Rlock()

def show():
    with lock:
        print current_thread().name, i
        sleep(0.1)

def test():
    with lock:
        for i in range(3):
            show(i)

for i in range(2):
    Thread(target=test).start()
```

### Event

事件用于在线程间通信。一个线程发出一个信号，其他一个或多个线程等待。
Event 通过通过 个内部标记来协调多线程运 。 法 wait() 阻塞线程执 ，直到标记为 True。 set() 将标记设为 True，clear() 更改标记为 False。isSet() 用于判断标记状态。

```python
from threading import Event

def test_event():
    e = Event()
    def test():
        for i in range(5):
            print 'start wait'
            e.wait()
            e.clear()  # 如果不调用clear()，那么标记一直为 True，wait()就不会发生阻塞行为
            print i
Thread(target=test).start()
return e


e = test_event()
```

### Condition

条件变量和 Lock 参数一样，也是一个，也是一个同步原语，当需要线程关注特定的状态变化或事件的发生时使用这个锁定。

可以认为，除了Lock带有的锁定池外，Condition还包含一个等待池，池中的线程处于状态图中的等待阻塞状态，直到另一个线程调用notify()/notifyAll()通知；得到通知后线程进入锁定池等待锁定。

构造方法：
Condition([lock/rlock])

Condition 有以下这些方法：
* acquire([timeout])/release(): 调用关联的锁的相应方法。
* wait([timeout]): 调用这个方法将使线程进入Condition的等待池等待通知，并释放锁。使用前线程必须已获得锁定，否则将抛出异常。
* notify(): 调用这个方法将从等待池挑选一个线程并通知，收到通知的线程将自动调用acquire()尝试获得锁定（进入锁定池）；其他线程仍然在等待池中。调用这个方法不会释放锁定。使用前线程必须已获得锁定，否则将抛出异常。
* notifyAll(): 调用这个方法将通知等待池中所有的线程，这些线程都将进入锁定池尝试获得锁定。调用这个方法不会释放锁定。使用前线程必须已获得锁定，否则将抛出异常。

```python
from threading import Condition, current_thread, Thread

con = Condition()

def tc1():
    with con:
        for i in range(5):
            print current_thread().name, i
            sleep(0.3)
            if i == 3:
                con.wait()


def tc2():
    with con:
        for i in range(5):
            print current_thread().name, i
            sleep(0.1)
            con.notify()

Thread(target=tc1).start()
Thread(target=tc2).start()

Thread-1 0
Thread-1 1
Thread-1 2
Thread-1 3    # 让出锁
Thread-2 0
Thread-2 1
Thread-2 2
Thread-2 3
Thread-2 4
Thread-1 4    # 重新获取锁，继续执

```

只有获取锁的线程才能调用 wait() 和 notify()，因此必须在锁释放前调用。
当 wait() 释放锁后，其他线程也可进入 wait 状态。notifyAll() 激活所有等待线程，让它们去抢锁然后完成后续执行。


### 生产者-消费者问题和 Queue 模块

现在我们用一个经典的(生产者消费者)例子来介绍一下 Queue模块。

生产者消费者的场景是： 生产者生产货物，然后把货物放到一个队列之类的数据结构中，生产货物所要花费的时间无法预先确定。消费者消耗生产者生产的货物的时间也是不确定的。

常用的 Queue 模块的属性:

* queue(size): 创建一个大小为size的Queue对象。
* qsize(): 返回队列的大小(由于在返回的时候，队列可能会被其它线程修改，所以这个值是近似值)
* empty(): 如果队列为空返回 True，否则返回 False
* full(): 如果队列已满返回 True，否则返回 False
* put(item,block=0): 把item放到队列中，如果给了block(不为0)，函数会一直阻塞到队列中有空间为止
* get(block=0): 从队列中取一个对象，如果给了 block(不为 0)，函数会一直阻塞到队列中有对象为止

Queue 模块可以用来进行线程间通讯，让各个线程之间共享数据。

现在，我们创建一个队列，让 生产者(线程)把新生产的货物放进去供消费者(线程)使用。

```python
# python2
#! -*- coding: utf-8 -*-

from Queue import Queue
from random import randint
from time import sleep, time
from threading import Thread


class MyThread(Thread):

    def __init__(self, func, args, name=""):
        super(MyThread, self).__init__()
        self.name = name
        self.func = func
        self.args = args

    def getResult(self):
        return self.res

    def run(self):
        # 创建新线程的时候，Thread 对象会调用我们的 ThreadFunc 对象，这时会用到一个特殊函数 __call__()。
        print 'starting', self.name, 'at:', time()
        self.res = self.func(*self.args)
        print self.name, 'finished at:', time()


# writeQ()和 readQ()函数分别用来把对象放入队列和消耗队列中的一个对象。在这里我们使用 字符串'xxx'来表示队列中的对象。
def writeQ(queue):
    print 'producing object for Q...'
    queue.put('xxx', 1)
    print "size now", queue.qsize()


def readQ(queue):
    queue.get(1)
    print("consumed object from Q... size now", queue.qsize())


def writer(queue, loops):
    # writer()函数只做一件事，就是一次往队列中放入一个对象，等待一会，然后再做同样的事
    for i in range(loops):
        writeQ(queue)
        sleep(1)


def reader(queue, loops):
    # reader()函数只做一件事，就是一次从队列中取出一个对象，等待一会，然后再做同样的事
    for i in range(loops):
        readQ(queue)
        sleep(randint(2, 5))


# 设置有多少个线程要被运行
funcs = [writer, reader]
nfuncs = range(len(funcs))


def main():
    nloops = randint(10, 20)
    q = Queue(32)
    threads = []

    for i in nfuncs:
        t = MyThread(funcs[i], (q, nloops), funcs[i].__name__)
        threads.append(t)

    for i in nfuncs:
        threads[i].start()

    for i in nfuncs:
        threads[i].join()
        print threads[i].getResult()

    print 'all DONE'


if __name__ == '__main__':
    main()
```


### FAQ

##### 进程与线程。线程与进程的区别是什么?

进程(有时被称为重量级进程)是程序的一次 执行。每个进程都有自己的地址空间，内存，数据栈以及其它记录其运行轨迹的辅助数据。
线程(有时被称为轻量级进程)跟进程有些相似，不同的是，所有的线程运行在同一个进程中， 共享相同的运行环境。它们可以想像成是在主进程或“主线程”中并行运行的“迷你进程”。

这篇文章很好的解释了 线程和进程的区别，推荐阅读: http://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html

##### Python 的线程。在 Python 中，哪一种多线程的程序表现得更好，I/O 密集型的还是计算 密集型的?

由于GIL的缘故，对所有面向 I/O 的(会调用内建的操作系统 C 代码的)程序来说，GIL 会在这个 I/O 调用之 前被释放，以允许其它的线程在这个线程等待 I/O 的时候运行。如果某线程并未使用很多 I/O 操作， 它会在自己的时间片内一直占用处理器(和 GIL)。也就是说，I/O 密集型的 Python 程序比计算密集 型的程序更能充分利用多线程环境的好处。

##### 线程。你认为，多CPU 的系统与一般的系统有什么大的不同?多线程的程序在这种系统上的表现会怎么样?

Python的线程就是C语言的一个pthread，并通过操作系统调度算法进行调度（例如linux是CFS）。为了让各个线程能够平均利用CPU时间，python会计算当前已执行的微代码数量，达到一定阈值后就强制释放GIL。而这时也会触发一次操作系统的线程调度（当然是否真正进行上下文切换由操作系统自主决定）。
伪代码

```python
while True:
    acquire GIL
    for i in 1000:
        do something
    release GIL
    /* Give Operating System a chance to do thread scheduling */
```

这种模式在只有一个CPU核心的情况下毫无问题。任何一个线程被唤起时都能成功获得到GIL（因为只有释放了GIL才会引发线程调度）。
但当CPU有多个核心的时候，问题就来了。从伪代码可以看到，从release GIL到acquire GIL之间几乎是没有间隙的。所以当其他在其他核心上的线程被唤醒时，大部分情况下主线程已经又再一次获取到GIL了。这个时候被唤醒执行的线程只能白白的浪费CPU时间，看着另一个线程拿着GIL欢快的执行着。然后达到切换时间后进入待调度状态，再被唤醒，再等待，以此往复恶性循环。
简单的总结下就是：Python的多线程在多核CPU上，只对于IO密集型计算产生正面效果；而当有至少有一个CPU密集型线程存在，那么多线程效率会由于GIL而大幅下降。

##### 线程池。修改 生成者消费者 的代码，不再是一个生产者和一个消费者，而是可以有任意个 消费者线程(一个线程池)，每个线程可以在任意时刻处理或消耗任意多个产品。

## 参考文章

* [进程与线程的一个简单解释 http://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html](http://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html)
* [Python的GIL是什么鬼，多线程性能究竟如何 http://cenalulu.github.io/python/gil-in-python/](http://cenalulu.github.io/python/gil-in-python/)
* [Python的全局锁问题 http://python3-cookbook.readthedocs.io/zh_CN/latest/c12/p09_dealing_with_gil_stop_worring_about_it.html](http://python3-cookbook.readthedocs.io/zh_CN/latest/c12/p09_dealing_with_gil_stop_worring_about_it.html)
* [Python线程指南 http://www.cnblogs.com/huxi/archive/2010/06/26/1765808.html](http://www.cnblogs.com/huxi/archive/2010/06/26/1765808.html)


|>欢迎关注 | >请我喝芬达|
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
