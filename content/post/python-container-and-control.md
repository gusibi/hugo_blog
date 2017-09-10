---
categories:
- xxx
- xxxx
date: 2017-09-05T17:44:27+08:00
description: description
draft: true
slug: url-path
tags:
- xx
- xxxx
title: title
---


## 容器

Python 内置了丰富的容器类型：list、tuple、set、dict和 collections 中的namedtuple()、deque、ChainMap、Counter、OrderedDict、defaultdict。
collections 相关的数据结构暂时先不介绍，这一篇先介绍 list、tuple、set 和 dict。

> `解释：`容器类型相对应的是扁平的数据类型，容器存放的是它们所包含的任意类型的对象的引用，而扁平的数据结构存放的是值而不是引用。
> 换句话说，扁平的数据结构其实是一段连续的内存空间，它里边只能存放字符、字节和数值这种基础类型，并且只能是其中的一种。
> `可能越解释越不清楚了`

### list（列表）

#### 初始化列表

```python
empty_list = []  # 初始化一个空列表
nums = [1]  # 初始化只有一个值的列表
numbers = [1, 2, 3, 4]  # 初始化一个有四个数字的列表
strings = ['a', 'b', 'c', 'd']  # 初始化一个有四个字符的列表
```
列表中的元素可以是任意数据类型，比如：

```python
list1 = ['1', 2, 'c', 'hello' ['world']] 
```

列表 list1 中包含了数字、字符串以及一个列表。

#### 访问列表

可以使用 len() 方法获取 list 元素的个数。

列表用索引来访问 list 中每个位置的元素，索引从0开始

```python
>>> nums = [1, 2, 3, 4, 5]
>>> nums[0]  # 索引从0开始
1
>>> nums[3]
4
>>> nums[5]
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
IndexError: list index out of range
```
当索引超出了范围时，Python会报一个IndexError错误。

索引还可以是负值，比如

```python
>>> nums[-1]  # 最后一个是-1 倒数第二个是 -2 依次类推 
5
>>> nums[-3]
3
>>> nums[-6]  # 负值的索引超出了范围时，也会报一个IndexError错误。
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
IndexError: list index out of range
```

如果列表中的元素也是列表：

```python
>>> nums = [1, 2, [3, 4, 5]]
>>> nums
[1, 2, [3, 4, 5]]
# 要访问内部列表的中的值可以这样
>>> nums[2][2]
5
```

#### 分片

列表可以使用索引获取特定位置的元素，也可以传入两个索引获取索引之间的元素，比如：

```python
>>> nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
>>> nums
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
>>> nums[0:1]
[0]
>>> nums[0:5]
[0, 1, 2, 3, 4]
>>> nums[1:7]
[1, 2, 3, 4, 5, 6]
```
通过上边的例子可以看出，分片的语法结构为

```python
list[start_index:end_index]
```
意思是 取列表中从 start_index 位置开始取，取值个数为 end_index-start_index，也就是取 list[start_index] 到 list[end_index-1] 的元素。
#### 列表常用方法

##### append
列表是可变的，可以往list中追加元素到末尾：

```python
>>> nums = []
>>> nums
[]
>>> nums.append(1)  # 使用 append 方法往列表的末尾追加元素
>>> nums
[1]
```

##### insert

把元素插入到指定位置：

```python
>>> nums = [0, 2, 3]
>>> nums
[0, 2, 3]
>>> nums.insert(1, 10)  # 向索引位置1 处插入数字10
>>> nums
[0, 10, 2, 3]
# 如果指定的索引超过了列表的长度，会把元素插入到最后
>>> nums.insert(10, 5)
>>> nums
[0, 10, 2, 3, 5]
```

##### pop

删除末尾的元素：

```python
>>> nums = [1, 2, 3, 4]
>>> nums.pop()
4
>>> nums
[1, 2, 3]
```

删除指定位置的元素：

```python
>>> nums.pop(1)
2
>>> nums
[1, 3]
>>> nums.pop(3)  # 指定的位置超出了列表的大小
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
IndexError: list index out of range
```

##### sorted

排序列表：

```python
>>> nums = [1, 4, 2, 3]
>>> sorted(nums)
[1, 2, 3, 4]
```

sorted() 函数会把传入的列表作为参数，返回一个排序后的列表（`注意`：sorted 返回一个新的列表，并不会改变当前列表）

```python
# 接上一段代码
>>> nums
[1, 4, 2, 3]
```

修改指定位置的值：

```python
>>> nums = [1, 2, 3, 4, 5, 6]
>>> nums[1]
2
>>> nums[1] = 10
>>> nums
[1, 10, 3, 4, 5, 6]
```

### tuple

元组和列表类似，这里主要说一下不同：

#### 1：初始化方式不同

元组使用半角小括号`()`，列表使用方括号`[]`

```python
>>> nums = ()  # 声明一个没有元素的空元组
>>> nums
()
>>> nums = (1, 2, 3)
>>> nums
(1, 2, 3)
```

如果元组中只有一个值，声明的时候要在第一个元素后加逗号(,):

```python
>>> nums = (1,)
>>> nums
(1, )
>>> nums = (1)  # 不加逗号python 认为这里的括号是数学运算符
>>> nums
1
```

> 不加逗号python 认为这里的括号是`数学运算符`，对数字1 进行单独运算结果还是 1，所以返回1

#### 2： 元组不可变

元组一旦声明，它的元素是不可变的，不能使用 append、pop、insert 等方法。

```python
>>> nums = (1, 2, 3)
>>> nums.append()
Traceback (most recent call last)
<ipython-input-23-926c4dd5b5cb> in <module>()
----> 1 nums.append(1)
AttributeError: 'tuple' object has no attribute 'append'
```

其它获取元素的方法和列表的一致。

### 练习

请用索引取出下面list的指定元素：

```python
# -*- coding: utf-8 -*-

L = [
    ['Apple', 'Google', 'Microsoft'],
    ['Java', 'Python', 'Ruby', 'PHP'],
    ['Adam', 'Bart', 'Lisa']
]
 
# 打印Apple:
print ?
# 打印Python:
print ?
# 将 PHP 修改为 JavaScript
```

### dict（字典）

dict 是使用键-值（key-value）存储，具有极快查询速度的一种数据结构。

#### 初始化字典

比如我们可以用一个dict 存储一个用户信息：

```python
user = {
    'nickname': 'goodspeed',
    'avatar': 'http://url.jpg',
}
```

#### 访问字典里的数据

如果我们想查找字典里的某个值，可以根据 key 读取。比如

```python
>>> user = {
    'nickname': 'goodspeed',
    'avatar': 'http://url.jpg',
}
>>> nickname = user['nickname']
>>> nickname
goodspeed
```

如果我们使用了一个不存在的 `key`，dict 会报错：
```python
>>> user = {}
>>> user['nickname']
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
KeyError: 'nickname'
```
 
上边这个例子是因为 dict `user` 不存在`key` nickname，所以抛出`KeyError` 异常。

> 如何避免KeyError 错误呢？

1. 使用之前充分了解 dict 结构（不靠谱，程序总是存在各种各样的可能，谁知道到底有没有）
2. 取值之前先判断 `key` 是否存在（使用 `in` 判断)

```python
>>> user = {
    'nickname': 'goodspeed',
    'age': 8
}
>>> 'nickname' in user  # user 有 nickname 这个 key
True
>>> 'avatar' in user # user 没有 nickname 这个 key
False
```

如果我们使用这种方式取值代码可能是这样的：

```python
user = {
    'nickname': 'goodspeed',
    'age': 8
}
if 'nickname' in user:
    nickname = user['nickname']
else:
    nickanme = '默认值'     
```

这显然太啰嗦了，python 有更好的办法：

3. 使用 `get()` 方法，比如：

```python
>>> user = {
    'nickname': 'goodspeed',
    'age': 8
}

>>> nickname = user.get('nickname', '如果nickname 不存在，我是默认值')
>>> nickname
goodspeed

>>> avatar = user.get('avatar', 'avatar 不存在，取到的值就是我')
>>> avatar
avatar 不存在，取到的值就是我
```

> 简单多了吧 🙄🙃

#### 更新 dict

dict 是可变容器，它的数据可以增加修改，比如

```python
>>> user = { # 初始化一个字典 只有一个 nickname key
    'nickname': 'goodspeed',
}
>>> user['age'] = 8
>>> user
{
    'nickname': 'goodspeed',
    'age': 8
}
# 我说我8岁大家都不信，非让我写真实年龄，没办法我只能改了🤷‍♀️
>>> user['age'] = 9 # 这下满意了吧
>>> user
{
    'nickname': 'goodspeed',
    'age': 9
}
```

> 那如果想一次更新多个值呢? 使用`update` 方法

```python
>>> user = {} # 初始化一个空字典
>>> user.update({'nickname': 'goodspeed', 'age': 8}) # 使用 update 更新字典
>>> user
{
    'nickname': 'goodspeed',
    'age': 8
}
```

#### 字典 key 注意事项

1. key 必须是不可变对象（可以暂时限制为，字符，数字等值）
2. key 不能重复，如果重复设置，后边的值会覆盖前一次的值

### set

set 和 dict 类似，也是一组 key 的集合，但是 set 只有 key 没有对应的 value。

> set 中也没有重复的 key

#### 初始化一个set

```python
>>> s = set() # 初始化一个空的集合
# 也可以把一个序列作为初始化参数
>>> sl = set([1, 2, 3])  # 把列表作为参数
>>> sl
{1, 2, 3}
>>> st = set((1, 2, 3)) # 把元组作为参数
>>> st
{1, 2, 3}
>>> ss = set('hello') # 把字符串作为参数
>>> ss
{'e', 'h', 'l', 'o'}
```

> set 中的 key 是无序的（顺序如何，看 set 心情）

#### set 常用方法

##### add 

使用 add 向 set 添加一个 元素。

```python
>>> s = set()
>>> s.add(1)
>>> s
{1}
>>> s.add(2)
>>> s
{2, 1}
```

set 中的 key 是不可重复的所以，使用 add 添加相同的 key，会自动去重，比如

```python
>>> s = set()
>>> for i in range(10): # 向集合添加10次字符 'a'
        s.add('a')
>>> s 
{'a'} #  set 自动去重，所以仍然只有一个元素
```

##### remove

set 可是已使用 `remove()` 方法删除集合中的一个 key，比如：
```python
>>> s = set([1, 2, 3])
>>> s.remove(1)
>>> s
{2, 3}
>>> s.remove(4)  # 如果使用 remove 删除一个不存在的 key，会抛出 KeyError 错误
Traceback (most recent call last)
<ipython-input-20-737bdeaad795> in <module>()
----> 1 s.remove(4)
KeyError: 4
```

## 流程控制

### 条件判断 if

条件判断是程序的一个基本流程控制。语法结构如下：

```python
if 条件:
    条件成立执行语句
elif 第二个条件:
    条件成立执行语句
else:
    上述条件都不成立，执行的语句
```

#### if 语句注意事项

* 条件语句后要加冒号`:`
* if 语句是从上向下依次执行的，如果在某个判断上是 True，剩下的语句就不会执行了。
* 通过布尔运算得到结果为 True，条件就算成立

> 空列表，空字典，空元组，空集合，空字符串，0都不为真

```python
>>> s = set()
>>> if s:
        print '这不是一个空集合'
    else:
        print 's 为空集合'    
```

#### boolean

布尔值只有两个值 True、False。在Python中，可以直接用True、False表示布尔值（请注意大小写），也可以通过布尔运算计算出来：

```python
>>> True
True
>>> False
False
>>> 3 > 2
True
>>> 3 > 5
False
```

布尔值和条件运算是条件判断的基本条件，比如：

```python
age = 4
if age > 3:
    print '成熟点，你已经不是3岁的孩子了'
elif age > 20:
    print '你都是中年人了，可怜🤕'
else:
    print '你3岁小孩懂什么'
```

> 我们上边说过，if 语句是从上向下依次执行的，如果某个判断为 True，剩下的就会忽略不在执行，那么，这个代码中第二个判断 `age > 20` 永远不会执行，因为 `> 20` 肯定也 大于 3，会执行第一个条件

### 循环

要打印2次 `hello world` 我们可以直接写：

```python
print 'hello world'
print 'hello world'
```

但是如果我们要打印100 次、1000次就需要用到循环语句了。
Python 循环有两种方式：计数循环和条件循环。

#### 计数循环（for...in）

计数循环的示例如下：

```python
for i in [1, 2, 3, 4]:
    print i
```

* 变量 i 从1开始
* 对应列表的每一个值，循环会把指令块中所有代码执行一遍
* 每次执行循环时，变量 i 会赋值为列表中的下一个值
* 每次循环称为一次迭代

> `for 循环` 不仅仅可以用在 list 上，还可以作用在其他可迭代对象上（元组、字典、集合、字符串等）

#### range() 函数

* range() 会创建一个列表，其中包含某个范围内的数
* range(5) —> [0, 1, 2, 3, 4]
* range(1, 6) —> [1, 2, 3, 4, 5, 6]
* range(x, y) 默认从0计数，循环次数为 y-x

range 函数不仅仅只是可以每次增加一个数，还可以指定步长，比如：

* range(1, 10, 2) —> [1, 3, 5, 7, 9]
这个意思是，生成一个列表，从1开始，到10结束，每个数字间隔为2（后一个数字减前一个数字值为2）

##### range() 还可以反向计数

* range(5, 1, -1) —> [5, 4, 3, 2]

##### 练习

使用 for 循环 计算 1到100 的和。

#### 条件循环（while）

条件循环基本语法为：

```python
while 条件:
    语句块
```

只要满足条件，就会不断循环：

```python
while True:
    print 'hello' 
```

这个循环因为 True 一直为真，所以条件一直满足，所以如果运行代码，会一直打印 hello 字符串。

所以使用 while 循环要在代码块中设定可以跳出的条件，比如：

```python
a = 0
while a< 100:
    print a
    a = a + 1 # a 不停自加
```

可以执行下上述代码，看下效果。

##### 练习

使用 while 循环，计算1，2， 3...100 的和。


### 跳出循环

跳出循环有两种形式，使用 `break` 或着使用 `continue`。

#### break

如果在循环中使用 `break` 循环会直接结束，之后的循环就不再执行

```python
>>> for i in range(100):
        if i > 2: # 当i = 3 时 循环就直接退出
            break
        print i
0
1
2
```
这段代码执行之会打印 0 1 2 因为大于2后循环会直接终结。

#### continue

在循环中使用 `continue`，此次循环会被跳过，直接执行下一次循环

```python
>>> for i in range(5):
        if i == 3:
            continue
        print i
0
1
2
4
```
上边这段代码，当 i 值等于3时，我们跳过当前循环，直接执行下一次，所以执行的结果为

0, 1, 2, 4

#### 练习

使用 continue 计算 1 到 3245 间所有数字中奇数的和。
 
## 参考链接

* [使用list和tuple](https://www.liaoxuefeng.com/wiki/0014316089557264a6b348958f449949df42a6d3a2e542c000/0014316724772904521142196b74a3f8abf93d8e97c6ee6000)
* [python基础数据类型及内置容器详解](http://blog.csdn.net/qq_30490125/article/details/50916268)
* [条件判断和循环](https://www.liaoxuefeng.com/wiki/001374738125095c955c1e6d8bb493182103fac9270762a000/001374738281887b88350bd21544e6095d55eaf54cac23f000)

------


最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
