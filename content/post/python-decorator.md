+++
date = "2016-04-11T15:23:11+08:00"
draft = false
title = "python 装饰器使用指南"
tags = ["python"]
categories = [ "Development" ]
slug = "python-decorator"
+++

## 变量

{{< highlight python >}}
name = 'world'
x = 3
{{< /highlight >}}
	

变量是代表某个值的名字

## 函数


{{< highlight python >}}
def hello(name):
    return 'hello' + name

>> hello('word)
hello word
{{< /highlight >}}
	

函数通过def关键字、函数名和可选的参数列表定义。

是可以调用的，它执行某种行为并且返回一个值。

函数内部也可以定义函数

{{< highlight python >}}
def outer():
    x = 1
    def inner():
	    print x # 1
	    inner()

>> outer()
1
{{< /highlight >}}

## 作用域&生存周期

{{< highlight python >}}
def func(x):
    print 'x is', x
    print locals()

func(50)

>> x is 50
{'x': 50}

>> print x
Traceback (most recent call last):
NameError: name 'x' is not defined
{{< /highlight >}}

函数会创建一个新的作用域（命名空间）。

函数的命名空间随着函数调用开始而开始，结束而销毁

{{< highlight python >}}
g = 'global variable'
	
>> print globals()
{'g': 'global variable',
 '__builtins__': <module '__builtin__' (built-in)>,
 '__file__': 'test.py',
 '__package__': None,
 'func': <function func at 0x10472d8c0>,
 '__name__': '__main__',
 '__doc__': None}

def foo():
    g = 'test'
	print 'g is', g
	print locals()
	print globals()

>> foo()
g is test
{'g': 'test'}	
{'g': 'global variable',
 '__builtins__': <module '__builtin__' (built-in)>,
 '__file__': 'test.py',
 '__package__': None,
 'func': <function func at 0x10472d8c0>,
 '__name__': '__main__',
 '__doc__': None}

>> print g
global variable
{{< /highlight >}}

在函数内部遇到变量的时候会有现在自己的命名空间里找

*猜一下段代码会执行的结果是什么*

{{< highlight python >}}
g = '我已经定义了'
def foo():
    print g
    g = '我重新定义了'
    print g
{{< /highlight >}}

[答案](http://stackoverflow.com/questions/1281184/why-cant-i-set-a-global-variable-in-python)

## 函数参数

函数有两种参数

1. 位置参数
2. 命名参数

{{< highlight python >}}
def foo(x, y=0):
	return x - y
{{< /highlight >}}

[*args and **kwargs? [duplicate]](http://stackoverflow.com/questions/3394835/args-and-kwargs)

## python 中一切都是对象

函数和python中其他一样都是对象

{{< highlight python >}}
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
{{< /highlight >}}
	
所以函数也可以作为参数传递给其它函数，也可以被当做返回值返回

{{< highlight python >}}
def add(x, y):
	return x + y
		
def apply(func):
	return func

>> a = apply(add)
>> type(a)
<type 'function'>
	
>> a(1, 2)
>> 3
{{< /highlight >}}
	

## 闭包

{{< highlight python >}}
def make_adder(a):
    def adder(b):
        return b + a
    return adder
    
add = make_adder(5)

>> add
# output
<function adder at 0x108166140>

>> add(3)
# output
8
{{< /highlight >}}

* adder 就是一个闭包 
* 也可以说 make_adder 指向一个闭包 
* 或者说 make_add 是闭包的工厂函数

> 闭包可以认为是一个内层函数(adder)，由一个变量指代，而这个变量相对于外层包含它的函数而言，是本地变量
> 
> 嵌套定义在非全局作用域里面的函数能够记住它在被定义的时候它所处的封闭命名空间

*闭包只是在形式和表现上像函数，但实际上不是函数。函数是一些可执行的代码，这些代码在函数被定义后就确定了，不会在执行时发生变化，所以一个函数只有一个实例。闭包在运行时可以有多个实例，不同的引用环境和相同的函数组合可以产生不同的实例。*


## 装饰器

对一个已有的模块做一些“修饰工作”，所谓修饰工作就是想给现有的模块加上一些小装饰（一些小功能，这些小功能可能好多模块都会用到），但又不让这个小装饰（小功能）侵入到原有的模块中的代码里去

{{< highlight python >}}
def my_decorator(func):
    def wrapper():
        print "Before the function runs"
        func()
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
{{< /highlight >}}

装饰器是设计模式中[装饰器模式](https://zh.wikipedia.org/wiki/%E4%BF%AE%E9%A5%B0%E6%A8%A1%E5%BC%8F)（[英文版](https://en.wikipedia.org/wiki/Decorator_pattern)）的python实现

## 多个装饰器

**装饰器可以嵌套使用**

{{< highlight python >}}
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
{{< /highlight >}}

#### outputs:
#嵌套两个装饰器
{{< highlight python >}}
>> sandwich = bread(ingredients(sandwich))
>> sandwich()
{{< /highlight >}}

#### outputs:

{{< highlight html >}}
```
</''''''\>
 #tomatoes#
 --ham--
 ~salad~
<\______/>
```
{{< /highlight >}}

更简单的写法

{{< highlight python >}}
@bread
@ingredients
def sandwich(food="--ham--"):
    print food

{{< /highlight >}}

**装饰器的顺序是很重要的**

{{< highlight python >}}
@ingredients
@bread
def sandwich(food="--ham--"):
    print food

# outputs:

```
 #tomatoes#
 </' ' ' ' ' '\>
   --ham--
 <\______/>
 ~salad~
```
{{< /highlight >}}


## Decorator 的本质

首先看一下这段代码

{{< highlight python >}}
def deco(fn):
    print "I am %s!" % fn.__name__
 
@deco
def func():
    pass
    
# output
I am func!

# 没有执行func 函数 但是 deco 被执行了
{{< /highlight >}}

在用某个@decorator来修饰某个函数func时

{{< highlight python >}}
@decorator
def func():
    pass

{{< /highlight >}}
其解释器会解释成下面这样的语句：

`func = decorator(func)`

> 其实就是把一个函数当参数传到另一个函数中，然后再回调
> 但是值得注意的是装饰器必须返回一个函数给func

回到刚才的例子

{{< highlight python >}}

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

{{< /highlight >}}

my_decorator(my_func)返回了wrapper()函数，所以，my_func其实变成了wrapper的一个变量，而后面的my_func()执行其实变成了wrapper()

{{< highlight python >}}
比如：多个decorator

@decorator_one
@decorator_two
def func():
    pass
    
相当于：

func = decorator_one(decorator_two(func))

比如：带参数的decorator：

@decorator(arg1, arg2)
def func():
    pass
相当于：

func = decorator(arg1,arg2)(func)
{{< /highlight >}}


## 带参数的装饰器

首先看一下， 如果被装饰的方法有参数

{{< highlight python >}}
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
{{< /highlight >}}

通常我们都使用更加通用的装饰器，可以作用在任何函数或对象方法上，而不必关系其参数 使用

{{< highlight python >}}
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

{{< /highlight >}}

上边的示例是带参数的被装饰函数

现在我们看一下向装饰器本身传递参数


**向装饰器本身传递参数**


再看一下这段代码

{{< highlight python >}}
def deco(fn):
    print "I am %s!" % fn.__name__
 
@deco
def func():
    pass
    
# output
I am func!

{{< /highlight >}}

*没有执行func 函数 但是 deco 被执行了*

> 在用某个@deco来修饰某个函数func时
其解释器会解释成下面这样的语句：

`func = deco(func)`

**装饰器必须使用函数作为参数**，你不能直接传递参数给装饰器本身

如果想传递参数给装饰器，可以 **声明一个用于创建装饰器的函数**

{{< highlight python >}}
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

{{< /highlight >}}
**使用@修饰**

{{< highlight python >}}
decorated_function = new_deco(decorated_function)

# 等价于下面的方法

@new_deco
def func():
    print "I am the decorated function"


@decorator_maker()
def func():
    print "I am the decorated function"

{{< /highlight >}}

> my_decorator（装饰器函数）是decorator_maker（装饰器生成函数）的内部函数
所以可以使用把参数加在decorator_maker（装饰器生成函数）的方法像装饰器传递参数

{{< highlight python >}}
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

{{< /highlight >}}

这里装饰器生成函数内部传递参数是闭包的特性


## 使用装饰器需要注意

* 装饰器是Python2.4的新特性
* 装饰器会降低代码的性能
* 装饰器仅在Python代码导入时被调用一次,之后你不能动态地改变参数.当你使用"import x",函数已经被装饰

最后Python2.5解决了最后一个问题，它提供functools模块，包含functools.wraps.这个函数会将被装饰函数的名称，模块，文档字符串拷贝给封装函数


{{< highlight python >}}
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

{{< /highlight >}}
**"functools" 可以修正这个错误**

{{< highlight python >}}

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
{{< /highlight >}}

## 类装饰器
{{< highlight python >}}
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
{{< /highlight >}}

我们可以看到这个类中有两个成员：

1. 一个是__init__()，这个方法是在我们给某个函数decorator时被调用，所以，需要有一个func的参数，也就是被decorator的函数。
2. 一个是__call__()，这个方法是在我们调用被decorator函数时被调用的

**如果decorator有参数的话，__init__() 就不能传入func了，而fn是在__call__的时候传入**

{{< highlight python >}}
class myDecorator(object):
 
    def __init__(self, arg1, arg2):
        self.arg1 = arg2
 
    def __call__(self, func):
        def wrapped(*args, **kwargs):
            return self.func(*args, **kwargs)
        return wrapped 
{{< /highlight >}}

##装饰器示例

{{< highlight python >}}
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
{{< /highlight >}}

* 装饰器做缓存

{{< highlight python >}}

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
{{< /highlight >}}

*15言和知性中用到的缓存*

{{< highlight python >}}
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
{{< /highlight >}}
    
[更多缓存示例](http://git.iguokr.com/stable/gkapp-sex/blob/master/src/sex/core/helpers.py)

* 统计代码运行时间

{{< highlight python >}}
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
{{< /highlight >}}

* [【更多debug工具 示例】](http://git.iguokr.com/stable/guokr-core/blob/master/src/guokr/platform/flask/debug.py)
* [【flask route】](https://github.com/mitsuhiko/flask/blob/master/flask/app.py#L1040)
* [PythonDecoratorLibrary] (https://wiki.python.org/moin/PythonDecoratorLibrary)
* [关于Python Decroator的各种提案](https://wiki.python.org/moin/PythonDecoratorProposals)

Python本身提供了一些装饰器：property,staticmethod

### 参考链接

1. [How can I make a chain of function decorators in Python?](http://stackoverflow.com/questions/739654/how-can-i-make-a-chain-of-function-decorators-in-python/1594484#1594484)
2. [理解PYTHON中的装饰器](http://www.wklken.me/posts/2013/07/19/python-translate-decorator.html#_1)
3. [Python修饰器的函数式编程](http://coolshell.cn/articles/11265.html)
4. [Understanding Python Decorators in 12 Easy Steps!](http://simeonfranklin.com/blog/2012/jul/1/python-decorators-in-12-steps/)
5. [PEP 0318 -- Decorators for Functions and Methods](https://www.python.org/dev/peps/pep-0318/)
6. [PEP 3129 -- Class Decorators](https://www.python.org/dev/peps/pep-3129/)
