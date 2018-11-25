---
date: 2018-11-03T21:23:56+08:00
description: python 设计模式，适配器模式
draft: false
slug: "python-design-pattern-adapter"
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-适配器模式"
---

> `问题`：假设有一个软件系统，你希望它能在不改变现有代码的前提下和一个新的厂商类库搭配使用，但是这个新厂商所设计出来的接口不同于旧厂商的接口

![](http://media.gusibi.mobi/ggjMjkbHdiBnU8YUY0iNQe3I9XXxZ_OYE0o7uI2Gxw8CXzOP1_WyHjcVrbXiDvcc)

**这个问题和下图的问题类似**

![](http://media.gusibi.mobi/TWyhF3_0rCaiR4WVmmmVQN05VLUR0pVgbHL28bV4ce2Kim_i74yFICJDqEnoVi2L)

美国标准的插头🔌无法在欧洲标准的插座上使用，通常的做法是什么呢？

> 添加一个插头适配器，适配器的作用是将欧式插头转换成美式插座，以便于让美式插头可以使用。

### 解决方案

所以，面对一个有全新接口的类库而又不能改变现有代码时，最先想到的做法是，在这两个系统之间添加一个适配器。

![](http://media.gusibi.mobi/VxXkkbIoWmKptVX2qSd_WNGrO2KdVgnrmMpe_sPdhuMk6xeVqLnJd3TN2qTY7k1q)

### 简单的例子

> 有一个系统，需要一个鸭子🦆对象，但是现在只有一个火鸡🦃对象。鸭子和火鸡对象的功能简单描述如下：

```python

# 鸭子的简单描述
class Duck:
    def quack(self):
        # 会呱呱叫
        print("Quack")
    
    def fly(self):
        # 飞的能力
        print("I'm flying")
        
# 火鸡的简单描述
class Turkey:
    def gobble(self):
        # 不会呱呱叫，只会咯咯叫
        print("Gobble gobble")
    
    def fly(self):
        # 飞的能力 但是飞不远
        print("I'm flying a short distance")
    
```

因为现在没有鸭子对象，只能那火鸡对象冒充。由于鸭子对象和火鸡对象功能不同，不能直接拿来用，现在就需要使用适配器来完成这个功能：

```python
class TurkeyAdapter(Duck):
    turkey = Turkey()  # 这里实际使用的是火鸡对象
    
    # 实现鸭子对象拥有的quack方法
    def quack(self):
        self.turkey.gobble()
    
    def fly(self):
        # 假设火鸡比鸭子飞的短，为了模拟鸭子的动作，多飞几次
        for i in range(5):
            turkey.fly()
```

接下来调用就可以像使用鸭子对象一样使用火鸡适配后的对象。

```python
# test

duck = Duck()
duck.quack()
duck.fly()

turkey_adapter = Duck()
turkey_adapter.quack()
turkey_adapter.fly()
```

**现在再来看一下适配器使用的过程：**

![](http://media.gusibi.mobi/Y5ID_UHcjlr0row8knQGM5vb8KNtRSlH_-6k-SrVOgvbAsE-iH7kweMC-mgvIGnM)

1. 客户通过被适配者实现的接口调用适配器
2. 适配器将请求转换为被适配者可以响应的请求
3. 被适配者响应，把结果返回给适配器，然后适配器再将结果响应给客户。

通过这个例子，接下来看一下适配器模式的正式定义

### 定义

> `适配器模式：`将一个类的接口，转换成客户期望的另一个接口。适配器让原本接口不兼容的类可以合作。

#### 优点

* 可以通过创建适配器进行接口转换，让不兼容的接口兼容，让客户从实现的接口的解耦。
* 使用对象组合，以修改的接口包装被适配者
* 被适配的子类可以搭配着适配器使用
* 满足开放/封闭原则（open/close principle）

> `开放/封闭原则`是面向对象设计的基本原则之一，声明一个软件实体应该对扩展是开放的，对修改是关闭的。



### 真实世界中的适配器

* xmltodict 可以将 xml 转换为 json
* grpc 也可以认为是一种适配器，提供了跨语言调用能力
* sqlalchemy 可以在不改变代码的情况下对接多种数据库


> 本文例子来自《Head First 设计模式》。


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![](http://media.gusibi.mobi/ah0mqMXMtdJb9Yj03suu-NGEyVRxyEuOIT5bXSv7ip5aqtHkiRjTTl8SMRMv3Qp5)
