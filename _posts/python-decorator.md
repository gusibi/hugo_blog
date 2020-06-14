---
categories: ["development", "python", "读书笔记"]
date: 2017-08-15T22:41:51+08:00
author: goodspeed
permalink: /post/python-decorator
tags: ["python", "tutorial", "读书笔记"]
title: Python 装饰器使用指南
---

> 装饰器是可调用的对象，其参数是另一个函数（被装饰的函数）。

## 装饰器基础知识

首先看一下这段代码

```python
def deco(fn):
    print "I am %s!" % fn.__name__

@deco
def func():
    pass

# output
I am func!

# 没有执行func 函数 但是 deco 被执行了
```

HUGOMORE42

在用某个@decorator来修饰某个函数func时

```python
@decorator
def func():
    pass

```
其解释器会解释成下面这样的语句：

`func = decorator(func)`

> 其实就是把一个函数当参数传到另一个函数中，然后再回调，但是值得注意的是装饰器必须返回一个函数给func

装饰器的一大特性是，能把被装饰的函数替换成其他函数。第二大特性是，装饰器在加载模块时立即执行。

### 装饰器何时执行

装饰器的一个关键特性是，它们在被装饰的函数定义后立即运行。这通常在导入是（python 加载模块时）。

看下下面的示例：

```python
registry = []  # registry 保存被@register 装饰的函数的引用

def register(func):  # register 的参数是一个函数
    print('running register(%s)' % func)  # 打印被装饰的函数
    registry.append(func)  # 把 func 存入 `registery`
    return func  # 返回 func：必须返回函数，这里返回的函数与通过参数传入的一样

@register  # `f1` 和 `f2`被 `@register` 装饰
def f1():
    print('running f1()')

@register
def f2():
    print('running f2()')

def f3():  # <7>
    print('running f3()')

def main():  # main 打印 `registry`，然后调用 f1()、f2()和 f3()
    print('running main()')
    print('registry ->', registry)
    f1()
    f2()
    f3()

if __name__=='__main__':
    main()  # <9>
```

运行代码结果如下：

```python
running register(<function f1 at 0x1023fb378>)
running register(<function f2 at 0x1023fb400>)
running main()
registry -> [<function f1 at 0x1023fb378>, <function f2 at 0x1023fb400>]
running f1()
running f2()
running f3()
```

从结果可以发现`register` 在模块中其他函数之前运行了两次。调用 register 时，传给它的参数是被装饰的函数（例如<function f1 at 0x1023fb378>）。

看完上边的示例我们知道，函数被装饰器装饰后会变成装饰器函数的一个参数，那这时就不得不说变量的作用域了。

## 变量作用域


先看下下边这段代码：

```python
def f1(a):
    print(locals())
    print(a)
    print(b)
    
    
f1(3)
# output
{'a': 3}
3
Traceback(most recent call last):
    File "<stdin>", line 1, in <module>
    File "<stdin>", line 3, in f1
NameError: global name 'b' is not defined
```

这里的错误是因为全局变量 `b` 没有定义，如果我们先在函数外部给 b 赋值，再调用这个方法就不会报错了。

> 函数运行时会创建一个新的作用域（命名空间）。函数的命名空间随着函数调用开始而开始，结束而销毁。
> 这个例子中 f1 的命名空间中只有 {'a': 3}，所以 `b` 会被认为是全局变量。

再看一个例子：

```python
b = 6
def f2(a):
    print(a)
    print(globals())
    print(locals())
    print(b)
    b = 9
    
f2(3)
# output
3
{
    '__name__': '__main__',
    '__doc__': None, 
    '__package__': None, 
    '__loader__': <_frozen_importlib_external.SourceFileLoader object at 0x10c7f2dd8>, 
    '__spec__': None, 
    '__annotations__': {}, 
    '__builtins__': <module 'builtins' (built-in)>, 
    '__file__': '~/var_local.py', 
    '__cached__': None, 
    'b': 6, 
    'f2': <function f2 at 0x10c7e7598>
}
{'a': 3}
3
Traceback(most recent call last):
    File "<stdin>", line 1, in <module>
    File "<stdin>", line 3, in f1
UnboundLocalError: local variable 'b' referenced before assignment
```

这个例子和上一个例子不同是，我现在函数外部定义了全局变量`b`，但是执行`f2` 这个方法并没有打印6，这是为什么呢？
这是因为执行函数时 Python 会尝试从局部变量中获取 `b`，函数对于已经引用但未赋值的变量并不会自动声明为局部变量，所以解释器发现后边的赋值之前有引用就会抛出 `UnboundLocalError` 错误。

> Python 不要求声明变量，但是假定在函数定义体中赋值的变量是局部变量。

如果要让解释器把`b`当做全局变量，要使用`global`声明：

```python
b = 6
def f3(a):
    global b
    print(a)
    print(b)
    b = 9
    
f2(3)
# output
3
6
```

## 闭包

> `闭包`是一种函数，它会保留定义函数时存在的自由变量的绑定，这样调用函数时，虽然定义作用域不可用，但仍能使用那些绑定。

介绍闭包前先要说明一下 Python 的函数参数

### 函数的两种参数

函数有两种参数

1. 位置参数
2. 命名参数

```python
def foo(x, y=0):
	return x - y
```

### python 中一切都是对象

函数和python中其他一样都是对象

```python
In [7]: class A(object):
   ...:     pass


In [8]: A
Out[8]: __main__.A
In [9]: type(A)
Out[9]: type
In [10]: def foo():
   ....:     pass


In [11]: type(foo)
Out[11]: function

In [12]: A.__class__
Out[12]: type

In [13]: foo.__class__
Out[13]: function

In [14]: a = 1
In [15]: a.__class__
Out[15]: int

# 类 是对象
In [16]: issubclass(A.__class__, object)
Out[16]: True

# 变量 是对象
In [17]: issubclass(a.__class__, object)
Out[17]: True

# 函数 是对象
In [18]: issubclass(foo.__class__, object)
Out[18]: True
```

所以函数也可以作为参数传递给其它函数，也可以被当做返回值返回

```python
def add(x, y):
	return x + y

def apply(func):
	return func

>> a = apply(add)
>> type(a)
<type 'function'>

>> a(1, 2)
>> 3
```

### 闭包的使用

先来看一个示例：假设有个名为 avg 的函数，它的作用是计算不断增加的系列值的均值；
它是这么使用的：

```python
>>> avg(10)
10
>>> avg(11)
10.5
>>> avg(12)
11
```

那么我们考虑下，avg 从何而来，它又在哪里保存历史值呢，这个用闭包如何实现呢？
下边的代码是闭包的实现：

```python
def make_averager():
    series = []

    def averager(new_value):
        series.append(new_value)
        total = sum(series)
        return total/len(series)

    return averager
```

调用  `make_averager` 时，返回一个 averager 函数对象。每次调用 averager 时，它都会把参数添加到系列值中，然后计算当前平均值。

```python
avg = make_averager()

>>> avg(10)
10
>>> avg(11)
10.5
>>> avg(12)
11
```

> `series` 是`make_averager` 函数的局部变量，因为那个函数的定义体中初始化了`series: series=[]`。但在`averager` 函数中，`series` 是自由变量（指未在本地作用域中绑定的变量）。

![变量示意图](http://media.gusibi.mobi/wNM0i84JsmsgldhxUjV1TP1M43awUXzWTWU8YY7goHgKOjrZCW8l5qxeo6bYSY46)
> `averager` 的闭包延伸到那个函数的作用域之外，包含自由变量`series`的绑定。

* avg 就是一个闭包
* 也可以说 make_averager 指向一个闭包
* 或者说 make_averager 是闭包的工厂函数

> 闭包可以认为是一个内层函数(averager)，由一个变量指代，而这个变量相对于外层包含它的函数而言，是本地变量
> 嵌套定义在非全局作用域里面的函数能够记住它在被定义的时候它所处的封闭命名空间

> `闭包` 只是在形式和表现上像函数，但实际上不是函数。函数是一些可执行的代码，这些代码在函数被定义后就确定了，不会在执行时发生变化，所以一个函数只有一个实例。闭包在运行时可以有多个实例，不同的引用环境和相同的函数组合可以产生不同的实例。

## 装饰器

### 实现一个简单的装饰器

对一个已有的模块做一些“修饰工作”，所谓修饰工作就是想给现有的模块加上一些小装饰（一些小功能，这些小功能可能好多模块都会用到），但又不让这个小装饰（小功能）侵入到原有的模块中的代码里去

```python
def my_decorator(func):
    def wrapper():
        print "Before the function runs"
        func() # 这行代码可用，是因为 wrapper 的闭包中包含自由变量 func
        print "After the function runs"
    return wrapper

def my_func():
    print "I am a stand alone function"


>> my_func()

# output
I am a stand alone function

# 然后，我们在这里装饰这个函数
# 将函数传递给装饰器，装饰器将动态地将其包装在任何想执行的代码中，然后返回一个新的函数

>> my_func = my_decorator(my_func)
>> my_func()
#output
Before the function runs
I am a stand alone function
After the function runs

# 也可以这么写

@ my_decorator
def my_func():
    print "I am a stand alone function"

>> my_func()
#output
Before the function runs
I am a stand alone function
After the function runs
```

装饰器是设计模式中[装饰器模式](https://zh.wikipedia.org/wiki/%E4%BF%AE%E9%A5%B0%E6%A8%A1%E5%BC%8F)（[英文版](https://en.wikipedia.org/wiki/Decorator_pattern)）的python实现。

### 多个装饰器

**装饰器可以嵌套使用**

```python
def bread(func):
    def wrapper():
        print "</''''''\>"
        func()
        print "<\______/>"
    return wrapper

def ingredients(func):
    def wrapper():
        print "#tomatoes#"
        func()
        print "~salad~"
    return wrapper

def sandwich(food="--ham--"):
    print food

#### outputs:
```

### 嵌套两个装饰器

```python
>> sandwich = bread(ingredients(sandwich))
>> sandwich()

#### outputs
</''''''\>
 #tomatoes#
 --ham--
 ~salad~
<\______/>
```

更简单的写法

```python
@bread
@ingredients
def sandwich(food="--ham--"):
    print food

```

**装饰器的顺序是很重要的**

如果我们换下顺序就会发现，三明治变成了披萨。。

```python
@ingredients
@bread
def sandwich(food="--ham--"):
    print food

# outputs:
    
 #tomatoes#
 </' ' ' ' ' '\>
   --ham--
 <\______/>
 ~salad~
```


### Decorator 的工作原理

首先看一下这段代码

```python
def deco(fn):
    print "I am %s!" % fn.__name__

@deco
def func():
    pass

# output
I am func!

# 没有执行func 函数 但是 deco 被执行了
```

在用某个@decorator来修饰某个函数func时

```python
@decorator
def func():
    pass

```
其解释器会解释成下面这样的语句：

`func = decorator(func)`

> 其实就是把一个函数当参数传到另一个函数中，然后再回调
> 但是值得注意的是装饰器必须返回一个函数给func

回到刚才的例子

```python

def my_decorator(func):
    def wrapper():
        print "Before the function runs"
        func()
        print "After the function runs"
    return wrapper

def my_func():
    print "I am a stand alone function"

>> my_func = my_decorator(my_func)
>> my_func()
#output
Before the function runs
I am a stand alone function
After the function runs

```

my_decorator(my_func)返回了wrapper()函数，所以，my_func其实变成了wrapper的一个变量，而后面的my_func()执行其实变成了wrapper()


比如：多个decorator
```python
@decorator_one
@decorator_two
def func():
    pass
```
相当于：

```python
func = decorator_one(decorator_two(func))
```
比如：带参数的decorator：

```python
@decorator(arg1, arg2)
def func():
    pass
# 相当于：

func = decorator(arg1,arg2)(func)
```


### 带参数的装饰器

首先看一下， 如果被装饰的方法有参数

```python
def a_decorator(method_to_decorate):
    def wrapper(self, x):
        x -= 3
        print 'x is %s' % x
        method_to_decorate(self, x)
    return wrapper


class A(object):

    def __init__(self):
        self.b = 42

    @a_decorator
    def number(self, x):
        print "b is %s" % (self.b + x)


a = A()
a.number(-3)

# output
x is -6
b is 36
```

通常我们都使用更加通用的装饰器，可以作用在任何函数或对象方法上，而不必关心其参数使用

```python
def a_decorator(method_to_decorate):
    def wrapper(*args, **kwargs):
        print '****** args ******'
        print args
        print kwargs
        method_to_decorate(*args, **kwargs)
    return wrapper

@a_decorator
def func():
    pass

func()
#output
****** args ******
()
{}

@a_decorator
def func_with_args(a, b=0):
    pass
    return a + b

func_with_args(1, b=2)

#output
****** args ******
(1,)
{'b': 2}

```

上边的示例是带参数的被装饰函数

现在我们看一下向装饰器本身传递参数


### 向装饰器本身传递参数

**装饰器必须使用函数作为参数**，你不能直接传递参数给装饰器本身
如果想传递参数给装饰器，可以 **声明一个用于创建装饰器的函数**

```python
# 我是一个创建装饰器的函数
def decorator_maker():
    print "I make decorators!"

    def my_decorator(func):
        print "I am a decorator!"

        def wrapped():
            print "I am the wrapper around the decorated function. "
            return func()

        print "As the decorator, I return the wrapped function."
        return wrapped

    print "As a decorator maker, I return a decorator"
    return my_decorator

# decorator_maker()返回的是一个装饰器
new_deco = decorator_maker()

#outputs
I make decorators!
As a decorator maker, I return a decorator

# 使用装饰器
def decorated_function():
    print "I am the decorated function"

decorated_function = new_deco(decorated_function)   
decorated_function()

# outputs
I make decorators!
As a decorator maker, I return a decorator
I am a decorator!
As the decorator, I return the wrapped function.
I am the wrapper around the decorated function.
I am the decorated  function

```
**使用@修饰**

```python
decorated_function = new_deco(decorated_function)

# 等价于下面的方法

@new_deco
def func():
    print "I am the decorated function"


@decorator_maker()
def func():
    print "I am the decorated function"

```

> my_decorator（装饰器函数）是decorator_maker（装饰器生成函数）的内部函数
所以可以使用把参数加在decorator_maker（装饰器生成函数）的方法像装饰器传递参数

```python
# 我是一个创建带参数装饰器的函数
def decorator_maker_with_arguments(darg1, darg2):
    print "I make decorators! And I accept arguments:", darg1, darg2

    def my_decorator(func):
        print "I am a decorator! Somehow you passed me arguments:", darg1, darg2

        def wrapped(farg1, farg2):
            print "I am the wrapper around the decorated function."
            print "I can access all the variables", darg1, darg2, farg1, farg2
            return func(farg1, farg2)

        print "As the decorator, I return the wrapped function."
        return wrapped

    print "As a decorator maker, I return a decorator"
    return my_decorator

@decorator_maker_with_arguments("deco_arg1", "deco_arg2")
def decorated_function_with_arguments(function_arg1, function_arg2):
    print ("I am the decorated function and only knows about my arguments: {0}"
           " {1}".format(function_arg1, function_arg2))


decorated_function_with_arguments('farg1', 'farg2')

# outputs

I make decorators! And I accept arguments: deco_arg1 deco_arg2
As a decorator maker, I return a decorator
I am a decorator! Somehow you passed me arguments: deco_arg1 deco_arg2
As the decorator, I return the wrapped function.
I am the wrapper around the decorated function.
I can access all the variables deco_arg1 deco_arg2 farg1 farg2
I am the decorated function and only knows about my arguments: farg1 farg2    

```

这里装饰器生成函数内部传递参数是闭包的特性

### 使用装饰器需要注意

* 装饰器是Python2.4的新特性
* 装饰器会降低代码的性能
* 装饰器仅在Python代码导入时被调用一次,之后你不能动态地改变参数.当你使用"import x",函数已经被装饰

#### 使用 `functools.wraps`

最后Python2.5解决了最后一个问题，它提供`functools`模块，包含`functools.wraps`，这个函数会将被装饰函数的名称、模块、文档字符串拷贝给封装函数


```python
def foo():
    print "foo"

print foo.__name__
#outputs: foo

# 但当你使用装饰器
def bar(func):
    def wrapper():
        print "bar"
        return func()
    return wrapper

@bar
def foo():
    print "foo"

print foo.__name__
#outputs: wrapper

```
**"functools" 可以修正这个错误**

```python

import functools

def bar(func):
    # 我们所说的 "wrapper", 封装 "func"
    @functools.wraps(func)
    def wrapper():
        print "bar"
        return func()
    return wrapper

@bar
def foo():
    print "foo"

# 得到的是原始的名称, 而不是封装器的名称
print foo.__name__
#outputs: foo
```

### 类装饰器

```python
class myDecorator(object):

    def __init__(self, func):
        print "inside myDecorator.__init__()"
        self.func = func

    def __call__(self):
        self.func()
        print "inside myDecorator.__call__()"

@myDecorator
def aFunction():
    print "inside aFunction()"

print "Finished decorating aFunction()"

aFunction()

# output：
# inside myDecorator.__init__()
# Finished decorating aFunction()
# inside aFunction()
# inside myDecorator.__call__()
```

我们可以看到这个类中有两个成员：

1. 一个是__init__()，这个方法是在我们给某个函数decorator时被调用，所以，需要有一个func的参数，也就是被decorator的函数。
2. 一个是__call__()，这个方法是在我们调用被decorator函数时被调用的

**如果decorator有参数的话，__init__() 就不能传入func了，而fn是在__call__的时候传入**

```python
class myDecorator(object):

    def __init__(self, arg1, arg2):
        self.arg1 = arg2

    def __call__(self, func):
        def wrapped(*args, **kwargs):
            return self.func(*args, **kwargs)
        return wrapped
```

## 装饰器示例

Python 内置了三个用于装饰方法的函数：property、classmethod和 staticmethod。
另一个常见的装饰器是 functools.wraps，它的作用是协助构建行为良好的装饰器。

#### functools.lru_cache 

`functools.lru_cache` 实现了内存缓存功能，它可以把耗时长的函数结果保存起来，避免传入相同参数时重复计算。

我们自己的实现代码如下：

```python

from functools import wraps
def memo(fn):
    cache = {}
    miss = object()

    @wraps(fn)
    def wrapper(*args):
        result = cache.get(args, miss)
        if result is miss:
            result = fn(*args)
            print "{0} has been used: {1}x".format(fn.__name__, wrapper.count)
            cache[args] = result
        return result

    return wrapper

@memo
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

#### 统计函数执行次数的装饰器

```python
def counter(func):
    """
    记录并打印一个函数的执行次数
    """
    def wrapper(*args, **kwargs):
        wrapper.count = wrapper.count + 1
        res = func(*args, **kwargs)
        print "{0} has been used: {1}x".format(func.__name__, wrapper.count)
        return res
    wrapper.count = 0
    return wrapper
```

* 装饰器做缓存


#### 带有过期时间的内存缓存

```python
def cache_for(duration):
    def deco(func):
        @wraps(func)
        def fn(*args, **kwargs):
            key = pickle.dumps((args, kwargs))
            value, expire = func.func_dict.get(key, (None, None))
            now = int(time.time())
            if value is not None and expire > now:
                return value
            value = func(*args, **kwargs)
            func.func_dict[key] = (value, int(time.time()) + duration)
            return value
        return fn
    return deco
```

#### 统计代码运行时间

```python
def timeit(fn):

    @wraps(fn)
    def real_fn(*args, **kwargs):
        if config.common['ENVIRON'] == 'PRODUCTION':
            return fn(*args, **kwargs)

        _start = time.time()
        #app.logger.debug('Start timeit for %s' % fn.__name__)
        result = fn(*args, **kwargs)
        _end = time.time()
        _last = _end - _start
        app.logger.debug('End timeit for %s in %s seconds.' %
                         (fn.__name__, _last))
        return result

    return real_fn
```


### 参考链接

1. [How can I make a chain of function decorators in Python?](http://stackoverflow.com/questions/739654/how-can-i-make-a-chain-of-function-decorators-in-python/1594484#1594484)
2. [理解PYTHON中的装饰器](http://www.wklken.me/posts/2013/07/19/python-translate-decorator.html#_1)
3. [Python修饰器的函数式编程](http://coolshell.cn/articles/11265.html)
4. [Understanding Python Decorators in 12 Easy Steps!](http://simeonfranklin.com/blog/2012/jul/1/python-decorators-in-12-steps/)
5. [PEP 0318 -- Decorators for Functions and Methods](https://www.python.org/dev/peps/pep-0318/)
6. [PEP 3129 -- Class Decorators](https://www.python.org/dev/peps/pep-3129/)
7. [*args and **kwargs? [duplicate]](http://stackoverflow.com/questions/3394835/args-and-kwargs)
8. [why-cant-i-set-a-global-variable-in-python](http://stackoverflow.com/questions/1281184/why-cant-i-set-a-global-variable-in-python)
9. [【flask route】](https://github.com/mitsuhiko/flask/blob/master/flask/app.py#L1040)
10. [PythonDecoratorLibrary](https://wiki.python.org/moin/PythonDecoratorLibrary)
11. [关于Python Decroator的各种提案](https://wiki.python.org/moin/PythonDecoratorProposals)

------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)


