---
title: '《理解 unix 进程》笔记-1'
date: 2018-03-25 15:25:53
tags: [进程,并发,读书笔记,后端]
published: true
hideInList: false
feature: 
isTop: false
---

## UNIX 进程

### 系统调用

Unix 系统是由用户空间（userland）和内核组成。Unix 内核位于计算机硬件之上，是与硬件交互的中介。这些交互包括通过问卷系统进程读/写、在网络上发送数据、分配内存，以及通过扬声器播放音频。这些都是用户应用程序所不能涉及的，只能通过系统调用来完成。

> `系统调用`为内核和用户空间搭建了桥梁。规定了程序和计算机硬件直接所允许发生的一切交互。

进程是 Unix 系统的基石，所有的代码都是在进程中运行。

unix 中的进程创建是通过内核系统调用 fork() 实现的。当一个进程产生一个 fork 请求时，操作系统执行以下功能：

1. 为新进程在进程表中分配一个空项
2. 为子进程赋一个唯一的进程标识符
3. 为一个父进程上下文的逻辑副本，不包括共享内存区
4. 增加父进程拥有的所有文件的计数器，以表示有一个另外的进程现在也用户这些文件。
5. 把子进程置为就绪态
6. 向父进程返回子进程的进程号；对子进程返回0。

所有这些操作都在父进程的内核态下完成。

### 进程皆有标识

在系统中运行的所有进程都有一个唯一的进程标识符，称为 pid。

> pid 并不传达关于进程本身的任何信息，仅仅是一个数字标识

在 python 中查看当前进程 pid 可以使用 `getpid()` 方法。

```python
>>> import os

>>> print os.getpid()
26164
```

> 在实际应用中，pid 可以加入都日志信息中，这样当多个进程向同一个文件写入日志的时候，就可以知道哪一行是由哪个进程写入的。

### 进程皆有父

系统中运行的每一个进程都有对应的父进程。每个进程都知道它父进程的标识符（ppid）。

在 python 中查看当前进程 pid 可以使用 `getppid()` 方法。

```python
>>> import os

>>> print os.getpid()
26164
>>> print os.getppid()
26125
```

### 进程皆有文件描述符

在 Unix 中，一切都是文件。

![一切皆文件](<http://media.gusibi.mobi/7_BEou-9LxGREQm2CyB18Oeb93T8Pp_shyshaDgE5teiRCA48OatdxhJWq8J07wF>)

无论何时在进程中打开一个资源，你都会获得一个文件描述符编号（file description number）。文件描述符并不会在无关进程之间共享，它只存在于其所属的进程之中。

```python
#! -*- coding: utf-8 -*-

import os

p = open('test.txt', 'wb')
print(p.name, p.fileno())

p1 = open('test1.txt', 'wb')
print(p1.name, p1.fileno())

p.close()

p2 = open('test2.txt', 'wb')
print(p2.name, p2.fileno())

print(p.name, p.fileno())
```


输出：

```shell
test.txt 3
test1.txt 4
test2.txt 3
Traceback (most recent call last):
  File "/Users/gs/Desktop/fdn.py", line 16, in <module>
    print(p.name, p.fileno())
ValueError: I/O operation on closed file
```


> 进程打开所有资源都会获得一个用于标识的唯一数字。
>
> 打开多个资源所分配的文件描述符编号是尚未使用的最小的数值。
>
> 资源一旦关闭，对应的文件描述符编号就会释放又能继续使用了。
>
> 文件描述符只是用来跟踪打开的资源，已经关闭的资源是没有文件描述符的。

标准流

每个 Unix 进程都有三个打开的资源，它们是标准输入（STDIN）、标准输出（STDOUT）和标准错误（STDERR）。

* STDIN 提供了一种从键盘或管道中读取输入的通用方法
* STDOUT 和 STDERR 提供了一种向显示器、文件或打印机等输出写入内容的通用方法。
* STDIN、STDOUT、STDERR 也是文件

```python
import sys

print(sys.stdin.fileno())
print(sys.stdout.fileno())
print(sys.stderr.fileno())
```

输出：

```shell
0
1
2
```

### 进程皆有资源限制

> 文件描述符代表已打开的资源，当资源没有被关闭的时候，文件描述符编号会一直递增，那一个进程可以拥有多少个文件描述符呢？

可以使用`getrlimit`找出限制：

```python
import resource

print(resource.getrlimit(resource.RLIMIT_NOFILE))
```

输出：

```shell
(10496, 9223372036854775807)
```



可以看到输出的结果是一个元组，里边有两个元素，第一个元素是文件描述符的软限制，第二个是文件描述符的硬限制。

> `软限制`：软限制其实不算限制，因为每个进程都可以修改这个值。超出这个值后会抛出一个异常。
>
> `硬限制`: 硬限制只有超级用户才能修改，但是硬限制其实是一个无限大的数字，可以认为是没有限制。

`getrlimit`还可以查询其它限制，比如：

* `RLIMIT_NPROC`  用户可拥有的最大进程数
* `RLIMIT_FSIZE` 进程可创建的最大文件。如果进程试图超出这一限制时，核心会给其发送SIGXFSZ信号，默认情况下将终止进程的执行。

详细信息可以查看 [Recource 文档](https://docs.python.org/2/library/resource.html)

可以使用 `setrlimit`来修改软限制：

```python
import resource

print(resource.getrlimit(resource.RLIMIT_NOFILE))
resource.setrlimit(resource.RLIMIT_NOFILE, (2048, resource.RLIM_INFINITY))
print(resource.getrlimit(resource.RLIMIT_NOFILE))
```

输出：

```shell
(10496, 9223372036854775807)
(2048, 9223372036854775807)
```

> `硬限制`的大小不建议修改，因为它是不可逆的。

python 中如果超出了软限制，会抛出 OSError：

```python
import resource

resource.setrlimit(resource.RLIMIT_NOFILE, (3, resource.RLIM_INFINITY))
print(resource.getrlimit(resource.RLIMIT_NOFILE))

p = open('test.txt', 'wb')
print(p.name, p.fileno())
```

输出：

```python
(3, 9223372036854775807)
Traceback (most recent call last):
  File "/Users/gs/Desktop/fdn.py", line 30, in <module>
OSError: [Errno 24] Too many open files: 'test.txt'
```

> 多数程序是不需要修改系统资源限制的，但对一些特殊工具，这是必须的步骤。
>
> 比如压测工具 httperf：如果我们使用命令 httperf —hog —server www —num-conn 5000 这样的命令，就需要 httperf 创建5000个并发连接，如果这里超出了软限制，就会抛出异常。
>
> 所以在压测之前httperf需要先调高软限制。

### 进程皆有退出码

当进程结束时，都会留下数字（0-255）退出码，操作系统根据退出码可以知道进程是否运行正常。

>  退出码0被认为是顺利结束，其他退出码表示出现了错误

python 使用 os.exit() 来退出进程


```python
#! -*- coding: utf-8 -*-

import sys

sys.exit() # 这将使进程携带状态码0退出

try:
    sys.exit(2)
except SystemExit as e:
    print('error', e)  # 这里将打印 exit 中的参数 2
```



> `sys.exit()` 会引发一个异常，如果异常没有被捕获，那么 python 解释器将会退出。如果有捕获此异常代码，那么代码继续执行。



```python
#! -*- coding: utf-8 -*-
import sys
import atexit

def test():
    print("hello exit")

atexit.register(test)

sys.exit() # 也可以是 raise
```



> 当 exit 被调用时，在进程结束之前，python 会调用 atexit 所定义的语句。



### 进程皆可衍生

衍生是 Unix 编程中最强大的概念之一。fork 系统调用允许允许中的进程以编程的形式创建新的进程。这个新进程和原始进程一模一样。

> 进行衍生时，调用 fork 的进程被称为`父进程`，新创建的进程被称为`子进程`。
>
> 子进程从父进程处继承了其所占用内存中的所有内容，以及所有属于父进程的已打开的文件描述符。

* 子进程拥有自己唯一的 pid
* 子进程的ppid 就是调用 fork 的进程的 pid
* fork 调用时，子进程从父进程处继承了所有的文件描述符，也获得了父进程所有的文件描述符编号。这样，两个进程就可以共享打开的文件、套接字等。
* 子进程继承了父进程内存中所有的数据
* 子进程可以随意更改其内存内容的副本，而不会对父进程造成影响。



```python
#! -*- coding: utf-8 -*-

import os, sys

print('current pid:', os.getpid())
pid = os.fork()

print('pid', pid)

if pid == 0:
    print('I am child process (%s) and my parent is %s.' % (os.getpid(), os.getppid())) 
else:
    print('I (%s) just created a child process (%s).' % (os.getpid(), pid))
```

输出：

```python
current pid: 9316
pid 9317
I (9316) just created a child process (9317).
pid 0
I am child process (9317) and my parent is 9316.
```

> `fork()`函数是 python 的内建函数，子进程拥有返回0，而父进程返回子进程的 ID。
>
> 所以这段代码中，if 语句由子进程执行，而 else 语句由父进程执行。


考虑一个问题：

由于 fork 的时候创建了一个和父进程一模一样的子进程，它包含了父进程在内存中的一切内容。如果，父进程占用内存特别大怎么办呢？


> Unix 采用的是写时复制（copy-on-write，CoW）的方法，所以 fork 的时候父进程和子进程是共享内存中数据的，直到它们中的一个需要对数据进程修改，才会进行内存复制，使得两个进程保持适当的隔离。



### 孤儿进程

> 当通过终端启动单个进程时，通常只有这个进程向 STDOUT 写入，从键盘获取输入或者侦听 Ctrl+C 已待退出。
>
> 但是，如果进程衍生出了子进程，当你按下 Ctrl+C 的时候，哪一个进程应该退出呢？是全部退出还是只有父进程退出？



```python
#! -*- coding: utf-8 -*-
import time
import os, sys

print('current pid:', os.getpid())
pid = os.fork()
print('pid', pid)

if pid == 0:
    for i in range(5):
        time.sleep(1)
        print("I'm an orphan!")
else:
    sys.exit('Parent process died...')
```

执行代码，打印结果如下：

![](<http://media.gusibi.mobi/kiV8luPm0vIwOTZRnYTlUyVD4zjBKHa03kBjjFeBJHGSUmIVt8ZXZ70JzvpILfhm>)



通过打印结果会发现，运行程序父进程结束后，立刻放回到终端命令提示符下，此时终端被子进程输出到 STDOUT 的内容重写了。

> 父进程结束后，子进程并不好退出，还是会继续运行。
>
> 这种操作适用于希望子进程异步的处理其他事务，而父进程按原计划运行的场景。

### 进程皆可待

如果想监控子进程的动向，应该怎么操作呢？

Python 提供了 `os.wait()` 方法。

```python
#! -*- coding: utf-8 -*-
import time
import os, sys
from subprocess import Popen

print('current pid:', os.getpid())
pid = os.fork()
print('pid', pid)

if pid == 0:
    for i in range(5):
        time.sleep(1)
        print("I'm an orphan!")
else:
    os.wait()
    sys.exit('Parent process died...')
```

输出如下：

![](<http://media.gusibi.mobi/W8LmJ8a_SIDIQlOHElCueUTd5v8T8eu6yQTd8x9uHCxcLHyh29mvwJZqk98VkFE0>)

这一次，所有输出都打印出来之后，控制才返回给终端。

那么，os.wait() 做了什么呢❓

> os.wait() 是一个阻塞调用，该调用使得父进程一直等到它的子进程退出之后才继续执行。
>
> 这个方法会返回一个元组，包含 pid 和退出码。


### 僵尸进程

### 进程皆可获得信号

### 进程皆可通信

### 守护进程

## 参考链接


------


**最后，感谢女朋友支持和包容，比❤️**

想了解以下内容可以在公号输入相应关键字获取历史文章： `公号&小程序` | `设计模式` | `并发&协程`

| 关注 |赞赏 |
|---|---|
|![](http://media.gusibi.mobi/kel2L88yf9YXZYecLIn0LPZPSXc7zJfHyGUz5biWsZrGh7xF2JONZT93dgClGdMn)|![](http://media.gusibi.mobi/VFjjmZ7cgkIkpieAFHYXcLVBB8f9snm2vAzc0GyLjSmCzok8mL3vqLNMzYVvrDha)|
