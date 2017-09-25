---
date: 2017-09-24T22:29:39+08:00
description: python 观察者模式
draft: false
slug: "python-design-patter-observer"
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-观察者模式"
---

> `题目`：现在你有一个数字，默认格式化程序是以十进制格式展示此数值，但需要提供一个功能，这个程序要支持添加/注册更多的格式化程序（比如：添加一个十六进制格式化程序和一个二进制格式化程序）。每次数值更新时，已注册的程序就会收到通知，并显示更新后的值。

我们看下需求：

1. NumberFormatter 有一个 number 属性
2. 当 number 值修改时，相关的格式化方式展示结果要改变
3. 此系统必须可扩展已适应其他格式化方式的使用。

一个错误的实现可能是这样的：

```python
class NumberFormatter(object):
    def __init__(self, number):
        self.number = number
        
    def show_data(self):
        self.default_formatter()
        self.hex_formatter()
        self.binary_formatter()
        
    def default_formatter(self):
        pass
        
    def hex_formatter(self):
        pass
        
    def binary_formatter(self):
        pass
```

我们可以这么使用：

```python
number = NumberFormatter(10)
number.show_data()
```

但是这样会有一个问题：`这种针对实现的编程会导致我们在增加或者删除需要格式化方式时必须修改代码。`比如我们现在不再需要十六进制数字格式的显示，就需要把 `hex_formatter` 相关的代码删除或者注释掉。

要解决这个问题，就可以用到我们这次要介绍的`观察者模式`了。

## 什么是观察者模式

### 认识观察者模式

我们先看看报纸和杂志的订阅是怎么回事：

1. 报社的业务就是出版报纸
2. 向某家报社订阅报纸，只要他们有新报纸，就会给你送来，只要你是他们的订户，你就会一直受到新报纸。
3. 当你不再想看的时候，取消订阅，他们就不会在送新报纸给你
4. 只要报社还在运营，就会一直有人向他们订阅报纸或取消订阅。

我们用图表示一下，这里`出版者` 改称为`主题(Subject)`，`订阅者`改称为`观察者(Observer)`：

`1.` 开始的时候，鸭子对象不是观察者
![](http://media.gusibi.mobi/FfEgRxfZ2c7lzOINxR1JJ9uarNvN0AjO15HBfKxEBoVdr4GANZIFjFmAwq6L9fM-)
`2.` 鸭子对象过来告诉主题，它想当一个观察者（鸭子其实想说的是：我对你的数据改变感兴趣，一有变化请通知我）
![](http://media.gusibi.mobi/2KE6cyN1-K24iLlk-l_WWxjAC894wqhqDWMrfk780kRArv1QQMD7AU66WabDnHZ4)
`3.` 鸭子对象已经是观察者了（鸭子静候通知，一旦接到通知，就会得到一个整数）。
![](http://media.gusibi.mobi/si9qkWv1-wgocRkh8v1gXPbZJlfqpJCsYqXZaQX-8WnY-DbTHGqv_eVLGyy3yfab)
`4.` 主题有了新的数据（现在鸭子和其他所有观察者都会受到通知：`主题已经改变`）
![](http://media.gusibi.mobi/9HhHmLzCUctRb46Te5j1A3OUosE-1f_qp37gC7pLJfQI-OFdxpFgosEfIjV9K8I4)
`5.` 老鼠对象要求从观察者中把自己除名（老鼠已经观察次主题太久，决定不再当观察者了）。
![](http://media.gusibi.mobi/3crIE4jTaaDE3bUWrp3tHL0jb2cKI0pQhaZeJPKh0HTYl_lY7D30uTeaybry0bRZ)
`6.` 老鼠离开了（主题知道老鼠的请求后，把它从观察者中移除了）。
![](http://media.gusibi.mobi/lnPq4IXxYH1fZURcPK2SiLXXbndcgA3f31F9UZ6BSi9QyWO5ZrkswwZ-cxI9_xL5)
`7.` 主题有了一个新的整数（除了老鼠之外，每个观察者都会收到通知，如果老鼠又想当观察者了，它还可以再回来）
![](http://media.gusibi.mobi/_PeyLBIegB7aBqh7oLad5fUs8l1ANeqEEd1zEBkcrY02cN768EIDD33rL75YopbU)

### 定义观察者模式

当你试图勾勒观察者模式时，可以利用报纸订阅服务，以及出版这和订阅者比你这一切。在程序设计中，观察者模式通常被定义为：

>`观察者模式`定义了对象之间的一对多依赖，这样一来，当一个对象改变状态是，它的所有依赖者都会收到通知并自动更新。

我们和之前的例子做个对比：

![](http://media.gusibi.mobi/5ictzh2edjji9GITg0JJXtR9bLqEmPN6XDytKrevXzKKdhtpLbZLRFElxRR3GOo3)

主题和观察者定义了一对多的关系。观察者依赖于此主题，只要主题状态一有变化，观察者就会被通知。根据通知的风格，观察者可能因此新值而更新。

`现在你可能有疑问，这和一对多的关系有何关联？`

> 利用观察者模式，主题是具有状态的对象，并且可以控制这些状态。也就是说，有`一个`具有状态的主题。另一方面，观察者使用这些状态，虽然这些状态不属于他们。有许多观察者，依赖主题告诉他们状态何时改变了。这就产生了一个关系：`一个主题对多个观察者的关系`。

`观察者和主题之间的依赖关系是如何产生的？`

> 主题是真正拥有数据的人，观察者是主题的依赖者，在数据变化时更新，这样比起让许多对象控制同一份数据来，可以得到更干净的 OO 设计。

### 观察者模式的应用案例

观察者模式在实际应用中有许多的案例，比如信息的聚合。无论格式为 RSS、Atom 还是其它，思想多事一样的：你追随某个信息源，当它每次更新时，你都会收到关于更新的通知。
事件驱动系统是一个可以使用观察者模式的例子。在这种系统中，监听者被用于监听特定的事件。监听者的事件被创建出来时就会触发它们。这个事件可以使键入某个特定的键、移动鼠标或者其他。事件扮演发布者的角色，监听者则扮演观察者的角色。

## Python 实现

现在，让我们回到文章开始的那个问题。

这里我们可以实现一个基类 Publisher，包括添加、删除及通知观察者这些公用功能。DefaultFormatter 类继承自 Publisher，并添加格式化程序特定的功能。

![文章开头问题的类图](http://media.gusibi.mobi/pRyxskK89xODXjfsCdPVnnPiJhyP2iyYmYHryZb3taKTnpZxtZZ8TINFsCroP0Y_)

Publisher 的代码如下：

```python
import itertools

'''
观察者模式实现
'''

class Publisher:

    def __init__(self):
        self.observers = set()

    def add(self, observer, *observers):
        for observer in itertools.chain((observer, ), observers):
            self.observers.add(observer)
            observer.update(self)
        else:
            print('Failed to add: {}'.format(observer))

    def remove(self, observer):
        try:
            self.observers.discard(observer)
        except ValueError:
            print('Failed to remove: {}'.format(observer))

    def notify(self):
        [observer.update(self) for observer in self.observers]
```

现在，打算使用观察者模式的模型或类都应该继承 Publisher 类。该类用 set 来保存观察者对象。当用户向 Publisher 注册新的观察者对象时，观察者的 update() 方法会执行，这使得它能够用模型当前的状态初始化自己。模型状态发生变化时，应该调用继承而来的 notify() 方法，这样的话，就会执行每个观察者对象的 update() 方法，以确保他们都能反映出模型的最新状态。

> `add()` 方法的写法值得注意，这里是为了支持可以接受一个或多个观察者对象。这里我们采用了`itertools.chain()` 方法，它可以接受任意数量的  `iterable`，并返回单个`iterable`。遍历这个 iterable，也就相当于依次遍历参数里的那些 iterable。

接下来是 `DefaultFomatter` 类。`__init__()` 做的第一件事就是调用基类的`__init__()` 方法，因为这在 Python 中没法自动完成。`DefaultFormatter` 实例有自己的名字，这样便于我们跟踪其状态。对于`_data` 变量，我们使用了名称改编来声明不能直接访问该变量。`DefaultFormatter` 把`_data` 变量用作一个整数，默认值为0。

```python
class DefaultFormatter(Publisher):

    def __init__(self, name):
        Publisher.__init__(self)
        self.name = name
        self._data = 0

    def __str__(self):
        return "{}: '{}' has data = {}".format(type(self).__name__, self.name, self._data)

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, new_value):
        try:
            self._data = int(new_value)
        except ValueError as e:
            print('Error: {}'.format(e))
        else:
            self.notify()
```

* `__str__()` 方法返回关于发布者名称和 `_data` 值的信息。type(self).__name 是一种获取类名的方便技巧，避免硬编码类名。（不过这会降低代码的可读性）

* `data()` 方法有两个，第一个使用了 `@property` 装饰器来提供_data 变量的读访问方式。这样，我们就能使用 `object.data` 来代替 `object._data`。第二个 data() 方法使用了`@setter` 装饰器，改装饰器会在每次使用赋值操作符(=)为`_data` 变量赋值时被调用。该方法也会尝试把新值强制转换为一个整数，并在转换失败时处理异常。

接下来是添加观察者。`HexFormatter` 和 `BinaryFormatter` 功能基本相似。唯一的不同在于如何格式化从发布者那获取到的数据值，即十六进制和二进制格式化。

```python
class HexFormatter:

    def notify(self, publisher):
        print("{}: '{}' has now hex data= {}".format(type(self).__name__,
                                                     publisher.name, hex(publisher.data)))

class BinaryFormatter:

    def notify(self, publisher):
        print("{}: '{}' has now bin data= {}".format(type(self).__name__,
                                                     publisher.name, bin(publisher.data)))
```

接下来我们添加一下测试数据，运行代码观察一下结果：

```python
def main():
    df = DefaultFormatter('test1')
    print(df)

    print()
    hf = HexFormatter()
    df.add(hf)
    df.data = 3
    print(df)

    print()
    bf = BinaryFormatter()
    df.add(bf)
    df.data = 21
    print(df)

    print()
    df.remove(hf)
    df.data = 40
    print(df)

    print()
    df.remove(hf)
    df.add(bf)

    df.data = 'hello'
    print(df)

    print()
    df.data = 4.2
    print(df)


if __name__ == '__main__':
    main()

```

完整代码参考：[https://gist.github.com/gusibi/93a000c79f3d943dd58dcd39c4b547f1](https://gist.github.com/gusibi/93a000c79f3d943dd58dcd39c4b547f1)

运行代码：

```shell
python observer.py    
## output
DefaultFormatter: 'test1' has data = 0

HexFormatter: 'test1' has now hex data= 0x0
Failed to add: <__main__.HexFormatter object at 0x10277da20>
HexFormatter: 'test1' has now hex data= 0x3
DefaultFormatter: 'test1' has data = 3

BinaryFormatter: 'test1' has now bin data= 0b11
Failed to add: <__main__.BinaryFormatter object at 0x10277da90>
BinaryFormatter: 'test1' has now bin data= 0b10101
HexFormatter: 'test1' has now hex data= 0x15
DefaultFormatter: 'test1' has data = 21

BinaryFormatter: 'test1' has now bin data= 0b101000
DefaultFormatter: 'test1' has data = 40

BinaryFormatter: 'test1' has now bin data= 0b101000
Failed to add: <__main__.BinaryFormatter object at 0x10277da90>
Error: invalid literal for int() with base 10: 'hello'
DefaultFormatter: 'test1' has data = 40

BinaryFormatter: 'test1' has now bin data= 0b100
DefaultFormatter: 'test1' has data = 4

```

在输出中我们看到，添加额外的观察者，就会出现更多的输出；一个观察者被删除后就不再被通知到。

## 总结

这一篇我们介绍了观察者模式的原理以及 Python 代码的实现。在实际的项目开发中，观察者模式广泛的运用于 GUI 编程，而且在仿真及服务器等其他时间处理架构中也能用到，比如：`数据库触发器`、`Django 的信号系统`、`Qt GUI 应用程序框架的信号（signal）与槽（slot）机智`以及`WebSocket`的许多用例。

## 参考链接

* [The 10 Minute Guide to the Observer Pattern in Python：http://www.giantflyingsaucer.com/blog/?p=5117](http://www.giantflyingsaucer.com/blog/?p=5117)
* [Observer：http://python-3-patterns-idioms-test.readthedocs.io/en/latest/Observer.html](http://python-3-patterns-idioms-test.readthedocs.io/en/latest/Observer.html)


------


最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
