---
date: 2018-12-31T12:59:39+08:00
description: python 状态模式
draft: false
slug: "python-design-pattern-state"
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-状态模式"
---

> `问题：`有一个糖果公司需要设计一个糖果售卖机，控制流程如下图，需要怎么实现？

![1b0d0134acf9ab9b2240066f847412f1.png](evernotecid://49E50F6F-983A-4D9E-90FA-7763241410D1/appyinxiangcom/8460937/ENResource/p3610)

这是一个状态图，每个圆圈都是一种状态。很明显，有`有25分钱`、 `没有25分钱`、 `售出糖果`、 `糖果售罄`**四个状态**，同时也对应**四个动作**：`投入25分钱`，`退回25分钱`，`转动曲柄`和`发放糖果`。

那如何从状态图得到真正的代码呢？

简单代码实现如下：

```python
#! -*- coding: utf-8 -*-

class GumballMachine:

    # 找出所有状态，并创建实例变量来持有当前状态，然后定义状态的值
    STATE_SOLD_OUT = 0
    STATE_NO_QUARTER = 1
    STATE_HAS_QUARTER = 2
    STATE_SOLD = 3

    state = STATE_SOLD_OUT

    def __init__(self, count=0):
        self.count = count
        if count > 0:
            self.state = self.STATE_NO_QUARTER

    def __str__(self):
        return "Gumball machine current state: %s" % self.state

    def insert_quarter(self):
        # 投入25分钱
        if self.state == self.STATE_HAS_QUARTER: # 如果已经投过
            print("You can't insert another quarter")
        elif self.state == self.STATE_NO_QUARTER: # 如果没有投过
            self.state = self.STATE_HAS_QUARTER
            print("You inserted a quarter")
        elif self.state == self.STATE_SOLD_OUT: # 如果已经售罄
            print("You can't insert a quarter, the machine is sold out")
        elif self.state == self.STATE_SOLD: # 如果刚刚买了糖果
            print("Please wait, we're already giving you a gumball")

    def eject_quarter(self):
        # 退回25分
        if self.state == self.STATE_HAS_QUARTER:
            print("Quarter returned")
            self.state = self.STATE_NO_QUARTER
        elif self.state == self.STATE_NO_QUARTER:
            print("You haven't inserted a quarter")
        elif self.state == self.STATE_SOLD:
            print("Sorry, you alread turned the crank")
        elif self.state == self.SOLD_OUT:
            print("You can't eject, you haven't inserted")

    def turn_crank(self):
        # 转动曲柄
        if self.state == self.STATE_SOLD:
            print("Turning twice doesn't get you another gumball")
        elif self.state == self.STATE_NO_QUARTER:
            print("You turned but there's no quarter")
        elif self.state == self.STATE_SOLD_OUT:
            print("You turned, but there are no gumballs")
        elif self.state == self.STATE_HAS_QUARTER:
            print("You turned...")
            self.state = self.STATE_SOLD
            self.dispense()
    
    def dispense(self):
        # 发放糖果
        if self.state == self.STATE_SOLD:
            print("A gumball comes rolling out the slot")
            self.count -= 1
            if self.count == 0:
                self.state = self.STATE_SOLD_OUT
            else:
                self.state = self.STATE_NO_QUARTER
        elif self.state == self.STATE_NO_QUARTER:
            print("You need to pay first")
        elif self.state == self.STATE_SOLD_OUT:
            print("No gumball dispensed")
        elif self.state == self.STATE_HAS_QUARTER:
            print("No gumball dispensed")


if __name__ == "__main__":
    # 以下是代码测试
    gumball_machine = GumballMachine(5) # 装入5 个糖果
    print(gumball_machine)

    gumball_machine.insert_quarter() # 投入25分钱
    gumball_machine.turn_crank() # 转动曲柄
    print(gumball_machine)

    gumball_machine.insert_quarter() #投入25分钱
    gumball_machine.eject_quarter()  # 退钱
    gumball_machine.turn_crank()     # 转动曲柄

    print(gumball_machine)
    
    gumball_machine.insert_quarter() # 投入25分钱
    gumball_machine.turn_crank() # 转动曲柄 
    gumball_machine.insert_quarter() # 投入25分钱 
    gumball_machine.turn_crank()  # 转动曲柄
    gumball_machine.eject_quarter() # 退钱

    print(gumball_machine)
```

这段代码有几个问题：

1. 没有遵守开放-关闭原则
2. 更像是面向过程的设计
3. 状态转化被埋藏在条件语句中
4. 未来加入新的需求，需要改动的较多，不易维护，可能会出bug


如何改进呢？

> 考虑**封装变化**，把每个状态的行为都放在各自的类中，每个状态只要实现自己的动作，用加入新类的方式来实现新状态的加入。

1. 定义State 父类，在这个类中，糖果机的每个动作都有一个应对的方法
2. 为机器中的每个状态实现状态类，这些类将负责在对应的状态下进行机器的行为
3. 摆脱旧的条件代码，将动作委托到状态类

新的实现代码如下：

```python
#! -*- coding: utf-8 -*-

class State:
    # 定义state基类
    def insert_quarter(self):
        pass

    def eject_quarter(self):
        pass

    def turn_crank(self):
        pass

    def dispense(self):
        pass


class SoldOutState(State):
    # 继承State 类
    def __init__(self, gumball_machine):
        self.gumball_machine = gumball_machine

    def __str__(self):
        return "sold_out"

    def insert_quarter(self):
        print("You can't insert a quarter, the machine is sold out")

    def eject_quarter(self):
        print("You can't eject, you haven't inserted a quarter yet")

    def turn_crank(self):
        print("You turned, but ther are no gumballs")

    def dispense(self):
        print("No gumball dispensed")


class SoldState(State):
    # 继承State 类
    def __init__(self, gumball_machine):
        self.gumball_machine = gumball_machine

    def __str__(self):
        return "sold"

    def insert_quarter(self):
        print("Please wait, we're already giving you a gumball")

    def eject_quarter(self):
        print("Sorry, you already turned the crank")

    def turn_crank(self):
        print("Turning twice doesn't get you another gumball")

    def dispense(self):
        self.gumball_machine.release_ball()
        if gumball_machine.count > 0:
            self.gumball_machine.state = self.gumball_machine.no_quarter_state
        else:
            print("Oops, out of gumballs!")
            self.gumball_machine.state = self.gumball_machine.soldout_state


class NoQuarterState(State):
    # 继承State 类
    def __init__(self, gumball_machine):
        self.gumball_machine = gumball_machine

    def __str__(self):
        return "no_quarter"

    def insert_quarter(self):
        # 投币 并且改变状态
        print("You inserted a quarter")
        self.gumball_machine.state = self.gumball_machine.has_quarter_state

    def eject_quarter(self):
        print("You haven't insert a quarter")

    def turn_crank(self):
        print("You turned, but there's no quarter")

    def dispense(self):
        print("You need to pay first")


class HasQuarterState(State):
    # 继承State 类
    def __init__(self, gumball_machine):
        self.gumball_machine = gumball_machine

    def __str__(self):
        return "has_quarter"

    def insert_quarter(self):
        print("You can't insert another quarter")

    def eject_quarter(self):
        print("Quarter returned")
        self.gumball_machine.state = self.gumball_machine.no_quarter_state

    def turn_crank(self):
        print("You turned...")
        self.gumball_machine.state = self.gumball_machine.sold_state

    def dispense(self):
        print("No gumball dispensed")


class GumballMachine:

    def __init__(self, count=0):
        self.count = count
        # 找出所有状态，并创建实例变量来持有当前状态，然后定义状态的值
        self.soldout_state = SoldOutState(self)
        self.no_quarter_state = NoQuarterState(self)
        self.has_quarter_state = HasQuarterState(self)
        self.sold_state = SoldState(self)
        if count > 0:
            self.state = self.no_quarter_state
        else:
            self.state = self.soldout_state

    def __str__(self):
        return ">>> Gumball machine current state: %s" % self.state

    def insert_quarter(self):
        # 投入25分钱
        self.state.insert_quarter()

    def eject_quarter(self):
        # 退回25分
        self.state.eject_quarter()
        # print("state", self.state, type(self.state))

    def turn_crank(self):
        # 转动曲柄
        # print("state", self.state, type(self.state))
        self.state.turn_crank()
	    self.state.dispense()
    
    def release_ball(self):
        # 发放糖果
        print("A gumball comes rolling out the slot...")
        if self.count > 0:
            self.count -= 1
        
        
if __name__ == "__main__":
    # 以下是代码测试
    gumball_machine = GumballMachine(5) # 装入5 个糖果
    print(gumball_machine)

    gumball_machine.insert_quarter() # 投入25分钱
    gumball_machine.turn_crank() # 转动曲柄
    print(gumball_machine)

    gumball_machine.insert_quarter() #投入25分钱
    gumball_machine.eject_quarter()  # 退钱
    gumball_machine.turn_crank()     # 转动曲柄

    print(gumball_machine)
    
    gumball_machine.insert_quarter() # 投入25分钱
    gumball_machine.turn_crank() # 转动曲柄 
    gumball_machine.insert_quarter() # 投入25分钱 
    gumball_machine.turn_crank()  # 转动曲柄
    gumball_machine.eject_quarter() # 退钱

    print(gumball_machine)
```

重构后的代码相对于之前的代码做了哪些事情呢？

1. 将每个状态的行为局部话到自己的类中
2. 删除if 语句
3. 将**状态类**对修改关闭，对糖果季类对**扩展开放**

下图是刚初始状态图示：

![](http://media.gusibi.mobi/JR9i8dFfJU6cVB2NGvZh0BtL8IwXfODdcURvHOl-VI_L805iSpbq3p0heRCN5BIm)

上面重构部分代码使用的就是状态模式：

### 定义

> `状态模式`: 状态模式允许对象在内部状态改变时改变它的行为，对象看起来好像修改了它的类。

状态模式的类图如下：

![](http://media.gusibi.mobi/_UOHaXfAO3xSgJJws_AoNGSDKWxCz6sD-N3xKvcY1hq_ZttIir68g9Ql295f8vED)

> 状态模式是将多个行为封装在状态对象中， context 的行为随时可委托到其中一个状态中。当前状态在不同的状态对象中改变，以反映出context 内部的状态，context 的行为也会随之改变。



### 扩展

> 如果，现在要在这四个状态的基础上再加一个状态（购买糖果后，有10%的概率再得一个），该如何实现呢？


```python
# 添加WinnerState 类，只有dispense 方法不同，可以从SoldState 类继承
class WinnerState(SoldState):
    
    def __str__(self):
        return "winner"

    def dispense(self):
        print("You're a WINNER! You get two gumballs for your quarter")
        self.gumball_machine.release_ball()
        if gumball_machine.count == 0:
            self.gumball_machine.state = self.gumball_machine.soldout_state
        else:
            self.gumball_machine.release_ball()
            if gumball_machine.count > 0:
                self.gumball_machine.state = self.gumball_machine.no_quarter_state
            else:
                print("Oops, out of gumballs!")
                self.gumball_machine.state = self.gumball_machine.soldout_state

# 修改turn_crank 方法
class HasQuarterState(State):
    ...
    def turn_crank(self):
        print("You turned...")
        winner = random.randint(0, 9)
        if winner == 4 and self.gumball_machine.count > 1: # 如果库存大于 1 并且随机数等于4（可以是0到9任意值）
            self.gumball_machine.state = self.gumball_machine.winner_state
        else:
            self.gumball_machine.state = self.gumball_machine.sold_state


# 在 GumballMachine 中初始化
class GumballMachine:

    def __init__(self, count=0):
        self.count = count
        # 找出所有状态，并创建实例变量来持有当前状态，然后定义状态的值
        ...
        self.winner_state = WinnerState(self)
        ...
```

### 总结

1. 状态模式允许一个对象给予内部状态而拥有不同的行为
2. 状态模式用类代表状态
3. Context 会将行为委托给当前状态对象
4. 通过将每状态封装进一个类，把改变局部化
5. 状态装欢可以由State 类或Context 类控制
6. 使用状态模式会增加类的数目
7. 状态类可以被多个Context 实例共享

------

> 本文例子来自《Head First 设计模式》。

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![](http://media.gusibi.mobi/ah0mqMXMtdJb9Yj03suu-NGEyVRxyEuOIT5bXSv7ip5aqtHkiRjTTl8SMRMv3Qp5)
