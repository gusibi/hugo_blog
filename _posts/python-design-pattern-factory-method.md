---
date: 2017-10-15T13:23:56+08:00
description: python 设计模式，工厂方法模式，简单工厂模式
author: goodspeed
permalink: /post/python-design-pattern-factory-method
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-工厂方法模式"
---

> `题目`：假设你有一个 pizza 店，功能包括`下订单`、`做 pizza`，你的代码会如何写呢？

```python
def order_pizza():
    pizza = Pizza()
    pizza.prepare()
    pizza.bake()
    pizza.cut()
    pizza.box()
    return pizza
```

但是现在你遇到了一个问题，你的 pizza 店需要更多的 pizza，所以现在你需要增加一些代码，来决定适合的 pizza 类型，然后再制造这个 pizza：

```python
def order_pizza(pizza_type):  # 现在把 pizza 的类型传入 order_pizza()

    # 根据 pizza 类型，我们实例化正确的具体类，然后将其赋值给 pizza 实例变量
    if pizza_type == 'cheese':
        pizza = CheesePizza()
    elif pizza_type == 'greek':
        pizza = GreekPizza()
    elif pizza_type == 'pepperoni':
        pizza = PepperoniPizza()
    # 一旦我们有了一个 pizza，需要做一些准备（擀面皮、加佐料），然后烘烤、切片、装盒
    pizza.prepare()
    pizza.bake()
    pizza.cut()
    pizza.box()
    return pizza
```

但是经过几天的实践，你发现顾客喜欢点的 ClamPizza、Veggie Pizza 而 Greek pizza 并没有什么人喜欢，这个时候需要修改代码：

```python
def order_pizza(pizza_type):  # 现在把 pizza 的类型传入 order_pizza()

    # 根据 pizza 类型，我们实例化正确的具体类，然后将其赋值给 pizza 实例变量
    if pizza_type == 'cheese':
        pizza = CheesePizza()
    # elif pizza_type == 'greek':  # greek pizza 不再出现在菜单
    #     pizza = GreekPizza()
    elif pizza_type == 'pepperoni':
        pizza = PepperoniPizza()
    # 新加了 clam pizza 和 veggie pizza
    elif pizza_type == 'clam':
        pizza = ClamPizza()
    elif pizza_type == 'veggie':
        pizza = VeggiePizza()

    #  一旦我们有了一个 pizza，需要做一些准备（擀面皮、加佐料），然后烘烤、切片、装盒
    pizza.prepare()
    pizza.bake()
    pizza.cut()
    pizza.box()
    return pizza
```

现在你发现了一个问题， order_pizza() 是在内部实例化了具体的 `Pizza 类`，并且，order_pizza() 也没有对修改关闭，以至于每次有了新的 pizza 加入都要修改 order_pizza() 的代码。这时一个比较好的办法是把创建 Pizza 对象是抽象出来，修改后的代码如下：

```python
# 把创建对象的代码从 order_pizza 方法中抽离
def create_pizza(pizza_type):
    # 根据 pizza 类型，我们实例化正确的具体类，然后将其赋值给 pizza 实例变量
    if pizza_type == 'cheese':
        pizza = CheesePizza()
    elif pizza_type == 'pepperoni':
        pizza = PepperoniPizza()
    elif pizza_type == 'clam':
        pizza = ClamPizza()
    elif pizza_type == 'veggie':
        pizza = VeggiePizza()
    return pizza

def order_pizza(pizza_type):  # 现在把 pizza 的类型传入 order_pizza()
    # 这里使用 create_pizza() 方法创建 pizza 类
    pizza = create_pizza(pizza_type)

    #  一旦我们有了一个 pizza，需要做一些准备（擀面皮、加佐料），然后烘烤、切片、装盒
    pizza.prepare()
    pizza.bake()
    pizza.cut()
    pizza.box()
    return pizza
```

## 简单工厂模式

我们把创建 pizza 对象的代码提取到一个新的方法中，我们称这个新的方法叫做`工厂`。

> `工厂`处理创建对象的细节，一旦有了`create_pizza`，`order_pizza()` 就成了此对象的客户。当需要 pizza 时，只需要告诉工厂需要什么类型的 pizza，让它做一个即可。

现在 order_pizza() 方法只关心从工厂得到一个 pizza，这个 pizza 实现了 Pizza 的接口，所以它可以调用 `prepare()（准备）`、`bake()（烘烤）`、`cut()（切片）`、`box()（装盒）`

> `问：`现在你可能会问，这段代码看上去更复杂了，有什么好处了呢？看上去只是把问题搬到另一个对象了。
`答：` 现在看来，order_pizza 只是`create_pizza` 的一个客户，其它客户（比如pizza 店菜单 PizzaShopMenu）也可以使用这个工厂来取得 pizza。把创建 pizza 的代码包装进一个类，当以后实现修改时，只需要修改这个部分代码即可。

这里我们的工厂`create_order()` 是一个简单的方法，利用方法定义一个简单工厂的方法通常被称为`简单工厂模式`（`简单工厂`更像是一中编程习惯而不是设计模式）。

### 重做 PizzaStore 类

上边的代码中，`order_pizza` 是客户代码，但是为了让我们的 pizza 店有更好的扩展性，这里我们需要把客户代码做一下修改：

```python
class SimplePizzaFactory:

    def create_pizza(self, pizza_type):
        ...
        return pizza

class PizzaStore:
    def order_pizza(self, pizza_type):  # 现在把 pizza 的类型传入 order_pizza()
        factory = SimplePizzaFactory()
        pizza = factory.create_pizza(pizza_type)
        ...
        return pizza
    
    # 下边是其他可能用到的方法
```

这段代码中，我们把一个方法（create_pizza）使用类（SimplePizzaFactory）封装了起来，目的是使工厂可以`通过继承来改变创建方法的行为`，并且这样做，也可以提高工厂方法的扩展性。

现在来看一下我们 pizza 店的类图：

![pizza店类图](http://media.gusibi.mobi/6DtG1bIO_WXNiv0cdjgTA6UP7rze9-4XY7jKkrrwA43Gtx5eHEwkKNGqvQtWs8NM)

### 简单工厂模式的局限

#### 缺点

* 由于工厂类集中了所有产品创建逻辑，违反了高内聚责任分配原则，一旦不能正常工作，整个系统都要受到影响。
* 系统扩展困难，一旦添加新产品就不得不修改工厂逻辑，在产品类型较多时，有可能造成工厂逻辑过于复杂，不利于系统的扩展和维护。

#### 使用场景

* 工厂类负责创建的对象较少
* 客户只知道传入工厂类的参数，对于如何创建对象（逻辑）不关心；客户端既不需要关心创建细节，甚至连类名都不需要记住，只需要知道类型所对应的参数。

为了突破这些局限，我们接着看一下`工厂方法模式`

## 工厂方法模式

> 现在我们有了一个新的问题，我们创建 pizza 店后，现在有人想要加盟，但我们还想要控制一下 pizza 的制作流程，该如何实现呢？

首先，要给 pizza 店使用框架，我们所要做的就是把`create_pizza()`方法放回到`PizzaStore`类中，不过这个方法需要在每个子类中倒要实现一次。现在 `PizzaStore`代码为：

```python
class PizzaStore:

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
```
这样我们就声明了一个工厂方法。这个工厂方法用来处理对象的创建，并将这个创建行为封装在子类中，这样客户程序中关于父类的代码就和子类的对象创建代码解耦成功。

我们将 create_pizza 放回 PizzaStore 的目的是让继承此方法的子类负责定义自己的`create_pizza()` 方法。现在我们看一下PizzaStore 的子类示意图：

![](http://media.gusibi.mobi/tca7Q3e78ijKMLm2vfUvrvR5FiVLM7rBvv6DZ402NsxAkgcUc8xEPsjCvnZALnxK)

这里 `NYStlyePizzaStore` 和 `ChicagoStylePizzaStore` 需要分别定义自己的 `create_pizza` 方法。

现在来看下完整代码：

```python
#! -*- coding: utf-8 -*-

class Pizza:

    name = None
    dough = None
    sauce = None
    toppings = []

    def prepare(self):
        print("Preparing %s" % self.name)
        print("Tossing dough...")
        print("Adding sauce...")
        print("Adding toppings: ")
        for topping in self.toppings:
            print("  %s" % topping)

    def bake(self):
        print("Bake for 25 minutes at 350")

    def cut(self):
        print("Cutting the pizza into diagonal slices")

    def box(self):
        print("Place pizza in official PizzaStore box")

    def __str__(self):
        return self.name


class NYStyleCheesePizza(Pizza):

    name = "NY Style Sauce and Cheese Pizza"
    dough = "Thin Crust Dough"
    sauce = "Marinara Sauce"
    toppings = ["Grated", "Reggiano", "Cheese"]


class ChicagoStyleCheesePizza(Pizza):

    name = "Chicago Style Deep Dish Cheese Pizza"
    dough = "Extra Thick Crust Dough"
    sauce = "Plum Tomato Sauce"
    toppings = ["Shredded", "Mozzarella", "Cheese"]

    def cut(self):
        print("Cutting the pizza into square slices")


class PizzaStore:
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
    def create_pizza(self, pizza_type):
        # 根据 pizza 类型，我们实例化正确的具体类，然后将其赋值给 pizza 实例变量
        if pizza_type == 'cheese':
            pizza = NYStyleCheesePizza()
        return pizza


class ChicagoStylePizzaStore(PizzaStore):
    def create_pizza(self, pizza_type):
        # 根据 pizza 类型，我们实例化正确的具体类，然后将其赋值给 pizza 实例变量
        if pizza_type == 'cheese':
            pizza = ChicagoStyleCheesePizza()
        return pizza


def main():
    nystore = NYStylePizzStore()
    pizza = nystore.order_pizza('cheese')
    print("goodspeed ordered a %s" % pizza)

    print("*" * 100)
    chicago_store = ChicagoStylePizzaStore()
    pizza = chicago_store.order_pizza('cheese')
    print("goodspeed ordered a %s" % pizza)


if __name__ == '__main__':
    main()
```
这里工厂方法 create_pizza() 直接抛出了`NotImplementedError`，这样做事为了强制子类重新实现 create_pizza() 方法，如果不重新实现就会抛出`NotImplementedError`。
当然也可以把 PizzaStore 的 `metaclass` 设置成 `abc.ABCMeta` 这样的话，这个类就是真正的抽象基类。

现在我们看一下工厂方法模式的类图：

![工厂方法模式类图](http://media.gusibi.mobi/X2xyI6pQ3sXdU_Y3Z_CH-qN6zP62jnvQDstKTz8AJL50FS8xhOazvO2RmRhsHH6X)

产品类和创建者类其实是平行的类的层级它们的关系如下图：

![](http://media.gusibi.mobi/LYoRbaaHRx4HhBho1wzNWB9LKxiVfCBJd-WxEkhfKo-9JJUjnFdIJxyEVuJKnhwP)

### 工厂方法模式定义

通过上文的介绍，我们可以得到工厂方法模式大概的定义：

> 在`工厂方法模式`中，工厂父类负责定义创建产品对象的公共接口，而工厂子类则负责生成具体的产品对象，这样做的目的是将产品类的实例化操作延迟到工厂子类中完成，即通过工厂子类来确定究竟应该实例化哪一个具体产品类。

工厂方法模式能够封装具体类型的实例化，抽象的 Creator 提供了一个创建对象的`工厂方法`。在抽象的 Creator 中，任何其他实现的方法，都可能使用到这个方法锁制造出来的产品，但只有子类真正实现这个工厂方法并创建产品。

下图是工厂方法模式原理类图：

![工厂方法模式类图](http://media.gusibi.mobi/jRO23-NdrmQi6ffAX-rpa2rzVSrlIIgzqQbKcSNa96Nshk8bCXFR2_jozUgCoHNa)


### 工厂方法模式优点

* 工厂方法集中的在一个地方创建对象，使对象的跟踪变得更容易。
* 工厂方法模式可以帮助我们将产品的实现从`使用`中`解耦`。如果增加产品或者改变产品的实现，Creator 并不会收到影响。
* 使用工厂方法模式的另一个优点是在系统中加入新产品时，无须修改抽象工厂和抽象产品提供的接口，无须修改客户端，也无须修改其他的具体工厂和具体产品，而只要添加一个具体工厂和具体产品就可以了。这样，系统的可扩展性也就变得非常好，完全符合“开闭原则”。

> 工厂方法可以在必要时创建新的对象，从而提高性能和内存使用率。若直接实例化类来创建对象，那么每次创建新对象就需要分配额外的内存。

## `简单工厂`和`工厂方法`之间的差异

> 简单工厂把全部的事情在一个地方处理完了（create_pizza），而工厂方法是创建了一个框架，让子类去决定如何实现。比如在工厂方法中，order_pizza() 方法提供了一般的框架用来创建 pizza，order_pizza() 方法依赖工厂方法创建具体类，并制造出实际的 pizza。而制造什么样的 pizza 是通过继承 PizzaStore来实现的。  但 `简单工厂` 只是把对象封装起来，并不具备工厂方法的弹性。


## python 应用中使用工厂模式的例子

Django 的 forms 模块使用工厂方法模式来创建表单字段。WTForm 也使用到了工厂方法模式。sqlalchemy 中不同数据库连接部分也用到了工厂方法模式。

## 总结

工厂方法模式的核心思想是定义一个用来创建对象的公共接口，由工厂而不是客户来决定需要被实例化的类，它通常在构造系统整体框架时被用到。工厂方法模式看上去似乎比较简单，但是内涵却极其深刻，抽象、封装、继承、委托、多态等面向对象设计中的理论都得到了很好的体现，应用范围非常广泛。

## 参考

* 《Head First 设计模式》
* 《精通 python 设计模式》
* 《Python 编程实战》
* [Python设计模式系列之三: 创建型Factory Method模式](https://www.ibm.com/developerworks/cn/linux/l-pypt/part3/index.html)

------

最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
