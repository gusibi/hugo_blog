---
date: 2017-10-28T21:23:56+08:00
description: python 设计模式，工厂方法模式，抽象工厂模式
draft: false
slug: "python-design-pattern-abstract-factory"
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-抽象工厂模式"
---

> `问题：`在上一篇 [python设计模式：工厂方法模式](https://mp.weixin.qq.com/s/3HtKVCzPOmuk5uFpfoBsqA)我们尝试使用工厂方法创建了披萨店，现在为了保证披萨加盟店也能有良好的声誉，我们需要`统一原材料`，这个该如何做呢？

为了确保每家加盟店都是用高质量的原材料，我们打算建造一加原材料工厂，并将原材料运送到各个加盟店。`每个加盟店会对原材料有不同的需求`，这里我们就可以用上上一篇介绍的工厂方法模式了。

1. 首先，建造原料工厂
2. 然后建造区域的原料工厂（继承自原料工厂）
3. 在区域的原料工厂中实现原料的创建方法。
4. 将原料工厂组合起来，加入到 PizzaStore（上一篇中由工厂方法实现）代码中。

按照这个思路，我们先创建原料工厂

## 创建原料工厂

创建原料工厂的实现代码如下：

```python
# 原料
class FreshClams:

    def __str__(self):
        return 'Fresh Clams'

class MarinaraSauce:

    def __str__(self):
        return "Marinara Sauce"

class ThickCrustDough:

    def __str__(self):
        return "Thick Crust Dough"

class ReggianoCheese:

    def __str__(self):
        return "Reggiano Cheese"

class SlicedPepperoni:

    def __str__(self):
        return "Sliced Pepperoni"

class Garlic:

    def __str__(self):
        return "Garlic"

class Onion:

    def __str__(self):
        return "Onion"

class RedPepper:

    def __str__(self):
        return "Red Pepper"

# 披萨店原料工厂
class PizzaIngredientFactory:

    '''
    定义原料工厂
    '''

    def create_dough(self):
        raise NotImplementedError()

    def create_sauce(self):
        raise NotImplementedError()

    def create_cheese(self):
        raise NotImplementedError()

    def create_pepperoni(self):
        raise NotImplementedError()

    def create_clam(self):
        raise NotImplementedError()

    def create_veggies(self):
        raise NotImplementedError()
```

在这个工厂中，每个原料都是一个方法，原料的实现需要在具体的原料工厂中实现。
这里每个原料方法没有做任何工作，只是抛出了`NotImplementedError` 这样做是为了强制子类重新实现相应的方法，如果不重新实现用到时就会抛出 NotImplementedError。

> 当然也可以把 PizzaIngredientFactory 的 metaclass 设置成 abc.ABCMeta 这样的话，这个类就是真正的抽象基类。

### 创建纽约原料工厂

```python
class NYPizzaIngredientFactory(PizzaIngredientFactory):
    def create_dough(self):
        print("Tossing %s" % ThickCrustDough())
        return ThickCrustDough()

    def create_sauce(self):
        print("Adding %s..." % MarinaraSauce())
        return MarinaraSauce()

    def create_cheese(self):
        print("Adding %s..." % ReggianoCheese())
        return ReggianoCheese()

    def create_pepperoni(self):
        print("Adding %s..." % SlicedPepperoni())
        return SlicedPepperoni()

    def create_clam(self):
        print("Adding %s..." % FreshClams())
        return FreshClams()

    def create_veggies(self):
        # 蔬菜可能有多种，这里使用列表
        veggies = [Garlic(), Onion(), RedPepper()]
        for veggie in veggies:
            print("  %s" % veggie)
        return veggies
```

对于原料家族的每一种原料，我们都提供了原料的纽约版本。

### 重做 Pizza 类

```python
class Pizza:
    
    name = None
    dough = None
    sauce = None
    cheese = None
    veggies = []
    pepperoni = None
    clam = None

    def prepare(self):
        raise NotImplementedError()

    def bake(self):
        print("Bake for 25 minutes at 350")

    def cut(self):
        print("Cutting the pizza into diagonal slices")

    def box(self):
        print("Place pizza in official PizzaStore box")

    def __str__(self):
        return self.name
```

上述代码和工厂方法的代码相比，只是把 `prepare()` 方法抽象出来，需要相应的 具体的 pizza 类来实现 `prepare()`。

### 实现 芝加哥芝士披萨

```python
class NYStyleCheesePizza(Pizza):

    def prepare(self):
        dough = self.ingredient_factory.create_dough()
        sauce = self.ingredient_factory.create_sauce()
        cheese = self.ingredient_factory.create_cheese()
        clam = self.ingredient_factory.create_clam()
        veggies = self.ingredient_factory.create_veggies()
```

从上述代码可以发现，Pizza 的原料也是从原料工厂直接获取，现在我们控制了原料。

> 现在，Pizza 类不需要关心原料，只需要负责制作 pizza 就好。Pizza 和原料被解耦。

### 重新实现 PizzaStore

```python
class PizzaStore:
    
    # 需要声明原料工厂
    ingredient_factory = None

    def create_pizza(self, pizza_type):
        # 每个需要子类实现的方法都会抛出NotImplementedError
        # 我们也可以把 PizzaStore 的 metaclass 设置成 abc.ABCMeta
        # 这样的话，这个类就是真正的抽象基类
        raise NotImplementedError()

    def order_pizza(self, pizza_type):  # 现在把 pizza 的类型传入 order_pizza()

        pizza = self.create_pizza(pizza_type)

        #  一旦我们有了一个 pizza，需要做一些准备（擀面皮、加佐料），然后烘烤、切片、装盒
        pizza.prepare()
        pizza.bake()
        pizza.cut()
        pizza.box()
        return pizza

class NYStylePizzStore(PizzaStore):
    
    # 将需要用到的原料工厂赋值给变量 ingredient_factory
    ingredient_factory = NYPizzaIngredientFactory()

    def create_pizza(self, pizza_type):
        # 根据 pizza 类型，我们实例化正确的具体类，然后将其赋值给 pizza 实例变量
        if pizza_type == 'cheese':
            pizza = NYStyleCheesePizza('NY Style Sauce and Cheese Pizza',
                                       self.ingredient_factory)
        elif pizza_type == 'clam':
            pizza = NYStyleClamPizza('NY Style Clam Pizza',
                                     self.ingredient_factory)
        return pizza
```

通过上述代码可以看到我们做了以下工作：
1. 引入了新类型的工厂（抽象工厂）来创建原料家族
2. 通过抽象工厂提供的接口，我们创建了原料家族。
3. 我们的原料代码从实际的 Pizza 工厂中成功解耦，可以应用到不同地方，响应的，我们可以方便的替换原料工厂来生产不同的 pizza。

### 来看下下单的代码

```python
def main():
    nystore = NYStylePizzStore()
    pizza = nystore.order_pizza('cheese')
    print('*' * 10)
    print("goodspeed ordered a %s" % pizza)
    print('*' * 10)
```
和工厂方法的代码相比，没有任何改变。

`[源码参考python-design-patter-abstract-factory.py](https://gist.github.com/gusibi/5e0797f5458678322486f999ca87a180)`

## 抽象工厂模式

> `抽象工厂模式`提供一个接口，用于创建相关或依赖对象的家族，而不需要指定具体类。

也就是说，抽象工厂允许客户使用抽象的接口来创建一组相关的产品，而不需要知道实际产出的具体产品是什么，这样依赖，客户就从具体产品中被解耦。

概括来说就是，抽象工厂是逻辑上的一组工厂方法，每个工厂方法各司其职，负责生产不同种类的对象。

我们来看下 抽象工厂模式 的类图：

![抽象工厂模式类图](http://media.gusibi.mobi/WXTX-aCeU8DaFhBXBHy1D8pqiLDUJggw-XqCGgYTmigQOdi8dly0Z-ujsJVgq7T5)

抽象工厂在 django_factory 中应用比较多，有兴趣的可以看下源码。

## 抽象工厂模式 和 工厂方法模式 的比较

抽象工厂模式 和 工厂方法模式 都是负责创建对象，但 

* `工厂方法模式使用的是继承`
* `抽象工厂模式使用的是对象的组合`

这也就意味着利用`工厂方法`创建对象需要扩展一个类，并覆盖它的工厂方法（负责将客户从具体类中解耦）。
`抽象工厂`提供一个用来创建产品家族的抽象类型，这个类型的子类定义了产品被产生的方法。要想使用这个工厂（`NYPizzaIngredientFactory`），必须先实例化它（`ingredient_factory = NYPizzaIngredientFactory()`），然后将它传入一些针对抽象类型所写的代码中（也做到了将客户从具体产品中解耦），同时还把一群相关的产品集合起来。

#### 工厂方法模式和抽象工厂模式如何选择

开始的时候，可以选择工厂方法模式，因为他很简单（只需要继承，并实现工厂方法即可）。如果后来发现应用需要用到多个工厂方法，那么是时候使用`抽象工厂模式`了，它可以把相关的工厂方法组合起来。

### 抽象工厂模式优点和缺点

#### 优点

* 可以将客户从具体产品中解耦
* 抽象工厂可以让对象创建更容易被追踪
* 同时将对象创建与使用解耦
* 也可以优化内存占用提升应用性能

#### 缺点

因为抽象工厂是将一组相关的产品集合起来，如果需要扩展这组产品，就需要`改变接口`，而改变接口则意味着需要改变`每个子类的接口`


## 参考链接

* [python设计模式：工厂方法模式](https://mp.weixin.qq.com/s/3HtKVCzPOmuk5uFpfoBsqA)
* [python-design-patter-abstract-factory.py https://gist.github.com/gusibi/5e0797f5458678322486f999ca87a180](https://gist.github.com/gusibi/5e0797f5458678322486f999ca87a180)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)