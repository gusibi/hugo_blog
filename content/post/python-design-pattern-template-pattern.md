---
date: 2018-12-02T17:23:56+08:00
description: python 设计模式 模板方法模式
draft: false
slug: "python-design-pattern-template-pattern"
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-模板方法模式"
---

首先先介绍一下咖啡和茶的冲泡方法：

**茶**

```
1. 把水煮沸
2. 用沸水浸泡茶叶
3. 把茶放到杯子里
```

**咖啡**

```
1. 把水煮沸
2. 用沸水冲泡咖啡
3. 把咖啡倒进杯子
4. 加糖和牛奶
```

用python代码实现冲泡方法大概是这个样子：

```python
# 茶的制作方法
class Tea:

    def prepare_recipe(self):
        # 在下边实现具体步骤
        self.boil_water()
        self.brew_tea_bag()
        self.pour_in_cup()
        
    def boil_water(self):
        print("Boiling water")
        
    def brew_tea_bag(self):
        print("Steeping the tea")
        
    def pour_in_cup(self):
        print("Pouring into cup")
```

```python
# 咖啡的制作方法
class Coffee:

    def prepare_recipe(self):
        # 在下边实现具体步骤
        self.boil_water()
        self.brew_coffee_grinds()
        self.pour_in_cup()
        self.add_sugar_and_milk()
        
    def boil_water(self):
        print("Boiling water")
        
    def brew_coffee_grinds(self):
        print("Dripping Coffee through filter")
        
    def pour_in_cup(self):
        print("Pouring into cup")
        
    def add_sugar_and_milk(self):
        print("Adding Sugar and Milk")
```

仔细看上边两端代码会发现，茶和咖啡的实现方式基本类似，都有`prepare_recipe`，`boil_water`，`pour_in_cup` 这三个方法。

> `问题：`如何重新设计这两个类来让代码更简洁呢？

首先看一下两个类的类图：

![2bd637fbc0532bd0bafbf861005fabd3.png](http://media.gusibi.mobi/jom4jOc8uWezDNwLSyqUYcOF5pXzLTh4ztvglMCIajscrtcrp3T5eyH7YnOgZbwD)

1. 每个类中都有 `prepare_recipe() boil_water() pour_in_cup()`方法。
2. 每个类中`prepare_recipe()`方法的实现都不一样。


现在把`prepare_recipe() boil_water() pour_in_cup()`三个方法抽取出来做成一个父类`CoffeineBeverage()`，`Tea` 和 `Coffee` 都继自`CoffeineBeverage()`。


![ce3e56409c313d4ce42e9878f3b5c8f4.png](http://media.gusibi.mobi/GTzGMHTGpxLF8o69DDykX4MCpkoy2Xf-uuGFWOIgARmWqv9xLnP5g74QKmgYf95d)

> 因为每个类中`prepare_recipe()`实现的方法不一样，所以`Tea` 和 `Coffee` 类都分别实现了 `prepare_recipe()`。
> `问题`: 那么，有没有办法将`prepare_recipe()`也抽象化？



对比 `Tea` 和 `Coffee` 的`prepare_recipe()` 方法会发现，他们之间的差异主要是：

```python

def prepare_recipe(self):
    # 相同部分隐藏
    # self.boil_water()
    self.brew_tea_bag()  # 差异1
    #self.pour_in_cup()
        
def prepare_recipe(self):
    # 相同部分隐藏
    # self.boil_water()
    self.brew_coffee_grinds() # 差异1
    # self.pour_in_cup()
    self.add_sugar_and_milk() # 差异2

```

这里的实现思路是，将两处差异分别用新的方法名代替，替换后结果如下：

```python

def prepare_recipe(self):
    # 新的实现方法
    self.boil_water()
    self.brew() # 差异1 使用brew 代替 brew_tea_bag 和 brew_coffee_grinds
    self.pour_in_cup()
    self.add_condiments() # 差异2 Tea 不需要此方法，可以用空的实现代替

```

新的类图如下：

![bff9cea3d8f8226b6a9bb29c1deb8d88.png](http://media.gusibi.mobi/Fqusr6qE_RUIHrwJIoNIvR64HEE8LSNWndLIz3gmtNXNqdGw0nJ12GR9-l4SvD7T)

现在，类 `Tea` 和 `Coffee` 只需要实现具体的 `brew()`和 `add_condiments()` 方法即可。代码实现如下：

```python

class CoffeineBeverage:

    def prepare_recipe(self):
        # 新的实现方法
        self.boil_water()
        self.brew() 
        self.pour_in_cup()
        self.add_condiments()
        
    def boil_water(self):
        print("Boiling water")
        
    def brew(self):
        # 需要在子类实现
        raise NotImplementedError
        
    def pour_in_cup(self):
        print("Pouring into cup")
        
    def add_condiments(self):
        # 这里其实是个钩子方法，子类可以视情况选择是否覆盖
        # 钩子方法是一个可选方法，也可以让钩子方法作为某些条件触发后的动作
        pass

# 茶的制作方法
class Tea(CoffeineBeverage):
        
    def brew(self):
        # 父类中声明了 raise NotImplementedError，这里必须要实现此方法
        print("Steeping the tea")
        
    # Tea 不需要 add_condiments 方法，所以这里不需要实现

# 咖啡的制作方法
class Coffee(CoffeineBeverage):
        
    def brew(self):
        # 父类中声明了 raise NotImplementedError，这里必须要实现此方法
        print("Dripping Coffee through filter")
        
    def add_condiments(self):
        print("Adding Sugar and Milk")
```

### 模板方法


上述抽象过程使用的就是模板方法。模板方法定义了一个算法的步骤，并且允许子类为一个或多个步骤提供实现。在这个例子中，`prepare_recipe` 就是一个模板方法。

> `定义：`模板方法牧师在一个方法中定义一个算法的骨架，而将一些步骤延迟到子类中。模板方法使得子类可以在不改变算法结构的情况下，重新定义算法中的某些步骤。

#### 优点

1. 使用模板方法可以将代码的复用最大化
2. 子类只需要实现自己的方法，将算法和实现的耦合降低。


#### 好莱坞原则

模板方法使用到了一个原则，`好莱坞原则`。

> `好莱坞原则`，别调用我，我会调用你。

![好莱坞原则](http://media.gusibi.mobi/F62XbVcTYD9i-4swfqL5_sgS8SYXCfyB_2h2pEJq2BIZ8LikiEF2Yulq3HIxvISz)
在这个原则之下，允许低层组件将自己挂钩到系统上，但是由高层组件来决定什么时候使用这些低层组件。

在上边的例子中，CoffeineBeverage 是高层组件，Coffee和Tea 是低层组件，他们不会之间调用抽象类（CoffeineBeverage）。


### 一个例子🌰

Python 第三方表单验证包 wtforms 的表单验证部分就使用到了模板方法模式。Field 类中`validate`方法就是一个模板方法，在这个方法中，会调用 `pre_validate`， `_run_validation_chain`，`post_validate`方法来验证表单，这些方法也都可以在子类中重新实现。具体实现可以参考以下源码。

源码地址：[https://github.com/wtforms/wtforms/blob/master/src/wtforms/fields/core.py](https://github.com/wtforms/wtforms/blob/master/src/wtforms/fields/core.py#L225)

## 参考链接
* [https://github.com/wtforms/wtforms/blob/master/src/wtforms/fields/core.py](https://github.com/wtforms/wtforms/blob/master/src/wtforms/fields/core.py#L225)

------
> 本文例子来自《Head First 设计模式》

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![](http://media.gusibi.mobi/ah0mqMXMtdJb9Yj03suu-NGEyVRxyEuOIT5bXSv7ip5aqtHkiRjTTl8SMRMv3Qp5)
