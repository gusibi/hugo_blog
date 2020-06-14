---
date: 2017-11-26T12:59:39+08:00
description: python 单例模式
author: goodspeed
permalink: /post/"python-design-pattern-singleton
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-单例模式"
---

> `问题：`现代化的巧克力工厂具备计算机控制的巧克力锅炉。锅炉做的事情就是把巧克力和牛奶融在一起，然后送到下一个阶段，以制成巧克力棒。下边是一个巧克力公司锅炉控制器的代码，仔细观察一下，这段代码有什么问题？

```python
class ChocolateBoiler(object):

    def __init__(self):
        self.empty = True
        self.boiled = False

    def fill(self):
        # 向锅炉填充巧克力和牛奶混合物
        # 在锅炉内填充原料时，锅炉必须是空的。
        # 一旦填入原料，就要把empty 和 boiled 标志设置好
        if self.empty:
            self.empty = False
            self.boiled = False

    def drain(self):
        # 排出煮沸的巧克力和牛奶
        # 锅炉排出时，必须是满的且煮沸的。
        # 排出完毕empty 设置为 true
        if not self.empty and self.boiled:
            self.empty = True

    def boil(self):
        # 将颅内物煮沸
        # 煮混合物时，锅炉内必须是满的且没有煮沸过
        # 一旦煮沸，就把 boiled 设置为 true
        if not self.empty and not self.boiled:
            self.boiled = True
```

从代码可以看出，他们加入了多种判断，以防止不好的事情发生。如果同时存在两个`ChocolateBoiler`实例，那这么多判断岂不是失去作用了。那我们改如何实现这个需求呢？这个问题的核心是，我们要先判断实例是不是已经存在，如果存在就不再创建。

```python
_chocolate_boiler_instance = None  # 声明实例

def chocolate_boiler():
    global _chocolate_boiler_instance  # 使用全局变量

    if _chocolate_boiler_instance is not None: # 判断是否存在，如果存在，直接返回
        return _chocolate_boiler_instance
    else:
        # 如果不存在，创建一个新的
        _chocolate_boiler_instance = ChocolateBoiler()
        return _chocolate_boiler_instance
```

现在我们需要获取 `ChocolateBoiler` 实例的时候只需要调用 chocolate_boiler 方法获取实例即可保证同时只有一个 `ChocolateBoiler`实例。

这种保证 `ChocolateBoiler`类只有一个实例，并提供一个全局访问点的模式，就是`单例模式`。

## 单例模式
### 定义

> `单例模式：`确保一个类只有一个实例，并提供一个全局访问点。

* 也就是说，我们使用单例模式要把某个类设计成自己管理的一个单独实例，同时也避免其他类再自行产生实例。并且只允许通过单例类获取单例的实例。
* 我们也提供对这个实例的全局访问点：当你需要实例时，像类查询，它会返回单个实例。

### 实现

python 实现单例模式有多种方案：
#### 使用 metaclass

《python cookbook》提供了非常易用的 `Singleton` 类，只要继承它，就会成为单例。

```python
# python 3 代码实现
class Singleton(type):

    def __init__(self, *args, **kwargs):
        self.__instance = None
        super().__init__(*args, **kwargs)

    def __call__(self, *args, **kwargs):
        if self.__instance is None:
            # 如果 __instance 不存在，创建新的实例
            self.__instance = super().__call__(*args, **kwargs)
            return self.__instance
        else:
            # 如果存在，直接返回
            return self.__instance


class Spam(metaclass=Singleton):

    def __init__(self):
        print('Creating Spam')

a = Spam()
b = Spam()

print(a is b)  # 这里输出为 True
```

元类（metaclass）可以控制类的创建过程，它主要做三件事：

* 拦截类的创建
* 修改类的定义
* 返回修改后的类

例子中我们构造了一个Singleton元类，并使用__call__方法使其能够模拟函数的行为。构造类 Spam 时，将其元类设为Singleton，那么创建类对象 Spam 时，行为发生如下：

Spam = Singleton(name,bases,class_dict)，Spam 其实为Singleton类的一个实例。

创建 Spam 的实例时，Spam()=Singleton(name,bases,class_dict)()=Singleton(name,bases,class_dict).__call__()，这样就将 Spam 的所有实例都指向了 Spam 的属性 __instance上。

#### 使用 __new__

我们可以使用 __new__ 来控制实例的创建过程，代码如下:

```python
class Singleton(object):

    __instance = None

    def __new__(cls, *args, **kw):
        if not cls.__instance:
            cls.__instance = super().__new__(cls, *args, **kw)
        return cls.__instance

class Foo(Singleton):
    a = 1

one = Foo()
two = Foo()
assert one == two
assert one is two
assert id(one) == id(two)
```

通过 __new__ 方法，将类的实例在创建的时候绑定到类属性 __instance 上。如果cls.__instance 为None，说明类还未实例化，实例化并将实例绑定到cls.__instance 以后每次实例化的时候都返回第一次实例化创建的实例。注意从Singleton派生子类的时候，不要重载__new__。

#### 使用装饰器

```python
import functools

def singleton(cls):
    ''' Use class as singleton. '''
    # 首先将 __new__ 方法赋值给 __new_original__
    cls.__new_original__ = cls.__new__

    @functools.wraps(cls.__new__)
    def singleton_new(cls, *args, **kw):
        # 尝试从 __dict__ 取 __it__
        it =  cls.__dict__.get('__it__')
        if it is not None: # 如果有值，说明实例已经创建，返回实例
            return it
        # 如果实例不存在，使用 __new_original__ 创建实例，并将实例赋值给 __it__
        cls.__it__ = it = cls.__new_original__(cls, *args, **kw)
        it.__init_original__(*args, **kw)
        return it
    # class 将原有__new__ 方法用 singleton_new 替换
    cls.__new__ = singleton_new
    cls.__init_original__ = cls.__init__
    cls.__init__ = object.__init__

    return cls

#
# 使用示例
#
@singleton
class Foo:
    def __new__(cls):
        cls.x = 10
        return object.__new__(cls)

    def __init__(self):
        assert self.x == 10
        self.x = 15


assert Foo().x == 15
Foo().x = 20
assert Foo().x == 20
```

这种方法的内部实现和使用 `__new__` 类似：

* 首先，将 __new__ 方法赋值给 __new_original__，原有 __new__ 方法用 singleton_new 替换，定义  __init_original__ 并将 cls.__init__ 赋值给 __init_original__
* 在 singleton_new 方法内部，尝试从 __dict__ 取 __it__（实例）
* 如果实例不存在，使用 __new_original__ 创建实例，并将实例赋值给 __it__，然后返回实例

#### 最简单的方式

将名字singleton绑定到实例上，singleton就是它自己类的唯一对象了。

```python
class singleton(object):
    pass
singleton = singleton()
```

[https://github.com/gusibi/Metis/blob/master/apis/v1/schemas.py#L107](https://github.com/gusibi/Metis/blob/master/apis/v1/schemas.py#L107) 使用的就是这种方式，用来获取全局的 request

> Python 的模块就是天然的单例模式，因为模块在第一次导入时，会生成 .pyc 文件，当第二次导入时，就会直接加载 .pyc 文件，而不会再次执行模块代码。因此，我们只需把相关的函数和数据定义在一个模块中，就可以获得一个单例对象了。

## 参考链接

* [Creating a singleton in Python](https://stackoverflow.com/questions/6760685/creating-a-singleton-in-python#)
* [Python单例模式](https://www.cnblogs.com/linxiyue/p/3902256.html)
* [Why is __init__() always called after __new__()?](https://stackoverflow.com/questions/674304/why-is-init-always-called-after-new)
------


最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
