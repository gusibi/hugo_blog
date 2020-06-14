---
date: 2017-11-12T21:16:56+08:00
description: python 设计模式，建造者模式
draft: false
permalink: /post/python-design-pattern-builder
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-建造者模式"
---

> `问题：`在上一篇[python设计模式：抽象工厂模式](https://mp.weixin.qq.com/s/mdulFWnTUiNvitNb2A5ZOQ)中，我们尝试用抽象工厂模式规范化了 Pizza 原材料的供应以及 Pizza 的创建。但是我们忽略了一个问题，那就是每种 Pizza 的烘焙时间依赖于生面团的厚度和使用的配料，它们所需的时间是不一样的。那这时我们改如何处理呢？

Pizza 的制作流程包括：准备（擀面皮、加佐料），然后烘烤、切片、装盒。这些有特定的顺序，不能错乱。

为了保证 生产 Pizza 的步骤不会出错，我们打算指派一个创建者，创建者用于控制 Pizza 的制作流程。


## 创建 Pizza 创建者

首先我们定义一个 Pizza

```python
class Pizza:

    def __init__(self, name):
        self.name = name
        self.dough = None
        self.sauce = None
        self.toppings = []

    def prepare_dough(self, dough):
        self.dough = dough
        print(self.dough)
        print('preparing the {} dough of your {}...'.format(self.dough, self))
        time.sleep(STEP_DELAY)
        print('Done with the {} dough'.format(self.dough))

    def __str__(self):
        return self.name
```

然后我们抽象出一个创建者：

```python
class PizzaBuilder(object):

    name = None

    def __init__(self):
        self.progress = PIZZA_PROGRESS
        self.baking_time = 5

    def prepare_dough(self):
        raise NotImplementedError()

    def add_sauce(self):
        raise NotImplementedError()

    def add_topping(self):
        raise NotImplementedError()

    def bake(self):
        raise NotImplementedError()

    def cut(self):
        raise NotImplementedError()

    def box(self):
        raise NotImplementedError()

    @property
    def pizza(self):
        return Pizza(self.name)

```

### 创建具体建造者


```python
class NYStyleCheeseBuilder(PizzaBuilder):

    name = 'NY Style Sauce and Cheese Pizza'

    def prepare_dough(self):
        self.progress = PIZZA_PROGRESS[0]
        self.pizza.prepare_dough('thin')

    def add_sauce(self):
        print('adding the tomato sauce to your pizza..')
        self.pizza.sauce = 'tomato'
        time.sleep(STEP_DELAY)
        print('done with the tomato sauce')

    def add_topping(self):
        print('adding the topping (grated reggiano cheese) to your pizza')
        self.pizza.toppings.append(["Grated", "Reggiano", "Cheese"])
        time.sleep(STEP_DELAY)
        print('done with the topping (grated reggiano cheese)')

    def bake(self):
        self.progress = PIZZA_PROGRESS[1]
        print('baking your pizza for {} seconds'.format(self.baking_time))
        time.sleep(self.baking_time)

    def cut(self):
        self.progress = PIZZA_PROGRESS[2]
        print("Cutting the pizza into diagonal slices")

    def box(self):
        self.progress = PIZZA_PROGRESS[3]
        print("Place pizza in official PizzaStore box")
```


### 创建指挥者

```python
class Waiter:
    # 指挥者

    def __init__(self):
        self.builder = None

    def construct_pizza(self, builder):
        self.builder = builder
        #  一旦我们有了一个 pizza，需要做一些准备（擀面皮、加佐料），然后烘烤、切片、装盒
        [step() for step in (builder.prepare_dough, builder.add_sauce,
                             builder.add_topping, builder.bake,
                             builder.cut, builder.box)]

    @property
    def pizza(self):
        return self.builder.pizza
```

完整代码参考：[python-design-patter-builder](https://gist.github.com/gusibi/8f84ec29e6b9d42ad2de224dc731a6bf)

从这个例子我可以看出，建造者模式包含如下角色：

* Builder：抽象建造者(Builder)（引入抽象建造者的目的，是为了将建造的具体过程交与它的子类来实现。这样更容易扩展。一般至少会有两个抽象方法，一个用来建造产品，一个是用来返回产品。）
* ConcreteBuilder：具体建造者(CommonBuilder、SuperBuilder)（实现抽象类的所有未实现的方法，具体来说一般是两项任务：组建产品；返回组建好的产品。）
* Director：指挥者(Director)（负责调用适当的建造者来组建产品，指挥者类一般不与产品类发生依赖关系，与指挥者类直接交互的是建造者类。一般来说，指挥者类被用来封装程序中易变的部分。）
* Product：产品角色(Role)

## 建造者模式

造者模式(Builder Pattern)：将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。也可以说，每个产品的建造会遵循同样的流程，不过流程内的每一个步骤都不尽相同。

> 建造者模式又可以称为生成器模式。

![建造者模式类图](http://media.gusibi.mobi/XYQwmOYBhmsCsm3_Tg9UDoZD50j-X6CS9_ywASYrKXUKBhx5Qokk9Y7w3B9EDWbc)


### 建造者模式在软件中的应用

* django-widgy是一个 Django的第三方树编辑器扩展，可用作内容管理系统(Content Management System，CMS)。它包含一个网页构建器，用来创建具有不同布局的HTML页面。

* django-query-builder是另一个基于建造者模式的Django第三方扩展库，该扩展库可用于动态 地构建SQL查询。使用它，我们能够控制一个查询的方方面面，并能创建不同种类的查询，从简 单的到非常复杂的都可以


## 建造者模式和工厂模式的区别

看上边这个例子，你可能会疑惑，为什么明明可以使用工厂方法模式可以解决的问题，要换成建造者模式呢？

通过代码可以看出，建造者模式和工厂方法模式最大的区别是，建造者模式多了一个指挥者的角色。`建造者负责创建复杂对象的各个组成部分。而指挥者使用一个建造者实例控制建造的过程`。

`与工厂模式相比，建造者模式一般用来创建更为复杂的对象`，因为对象的创建过程更为复杂，因此将对象的创建过程独立出来组成一个新的类——指挥者类。

建造者模式通常用于补充工厂模式的不足，尤其是在如下场景中：

* 要求一个对象有不同的表现，并且希望将对象的构造与表现解耦
* 要求在某个时间点创建对象，但在稍后的时间点再访问


## 参考链接


* [讲故事，学（Java）设计模式—建造者模式](http://www.importnew.com/6841.html)
* [设计模式（九）——建造者模式](http://www.hollischuang.com/archives/1477)
* [23种设计模式（4）：建造者模式](http://blog.csdn.net/zhengzhb/article/details/7375966)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)