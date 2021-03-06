---
date: 2018-11-25T17:23:56+08:00
description: python 设计模式 外观模式
draft: false
slug: "python-design-pattern-facade-pattern"
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-外观模式"
---

上一篇[《python设计模式-适配器模式》](https://mp.weixin.qq.com/s/69j6WbV_NoSumRuLj_gGug)介绍了如何将一个类的接口转换成另一个符合期望的接口。这一篇将要介绍需要一个为了简化接口而改变接口的新模式-外观模式（Facade-Pattern）。

### 问题

> `问题`：如果你组装了一套家庭影院，内含播放器、投影机、自动屏幕、立体声音响、爆米花机等。如何设计一个遥控器，可以简单的操作这个系统中的各个组件呢？

首先来看一下最笨方式观赏电影的步骤：

1. 打开爆米花机
2. 开始爆米花
3. 将灯光调暗
4. 放下屏幕
5. 打开投影仪
6. 将投影机的输入切换到播放器
7. 将投影及设置在宽屏模式
8. 打开功放
9. 将功放的输入设置为播放器
10. 将攻防设置为环绕立体声
11. 将攻防音量调到适中
12. 打开播放器
13. 播放电影

写成类和方法的调用大概是以下的样子：


```python

# 打开爆米花机，开始爆米花
poper.on()
poper.pop()
# 灯光调暗
lights.dim(10)

# 放下屏幕
screen.down()

# 打开投影仪，设置为宽屏模式
projector.on()
projector.setInput(dvd)
projector.wideScreenMode()

# 打开功放 设置为DVD 调整成环绕立体声模式，音量调到5
amp.on()
amp.setDvd(dvd)
amp.setSurroundSound()
amp.setVolume(5)

# 打开dvd 播放器
dvd.on()
dvd.play(movie)
```

可以看到代码中涉及到6个不同的类，而且电影看完后还需要回退，一切都要再反着重来一遍。怎样简化一下操作呢？
现在，外观模式就可以大展身手了。
> 使用外观模式，可以通过实现一个提供更合理的接口的外观类，将子系统变得更容易使用。当然，原来的接口还在。

### 解决方法

**先来看一下外观模式如何运作**

![外观模式类图](http://media.gusibi.mobi/gqxnhAKcJZ7wYLGuWwls8NkjFUsAqou-lwHvR7I9Jrhk5sXtQv6xAqhqMnbO2ITW)

1. 这里为家庭影院系统创建了一个新的外观类`HomeTheaterFacade`，这个类暴露出来几个简单的方法，比如`watchMovie`，`endMovie`。
2. 这个外观类将家庭影院的多个组件看作一个子系统，通过调用这个子系统来实现`watchMovie`方法。
3. 外观只提供了一个更直接的操作方式，并没有将原来的子系统隔离，子系统的功能还可以使用


> `注意：`
> 1. 可以有多个外观
> 2. 外观提供简化的接口，但不隔离子系统
> 3. 外观将实现从子系统中解耦，比如：现在有个子系统的组件需要升级换代，只需要把外观代码做相应的修改就可以实现
> 4. 外观和适配器都可以包装多个类，但是`外观的意图时简化接口的调用`，而`适配器的意图是将接口转换成不同的接口`。


### 示例

```python

class HomeTheaterFacade(object):

    #先声明需要用的子组件
    amp = Amplifier()
    tuner = Tuner()
    dvd = DvdPlayer()
    cd = CdPlayer()
    projector = Projector()
    lights = TheaterLights()
    screen = Screen()
    popper = PopcornPopper()
    
    def watchMovie(self, movie):
        # watchMovie 将之前需要手动处理的任务批量处理
        print("Get ready to watch a movie...")
        # 打开爆米花机，开始爆米花
        self.poper.on()
        self.poper.pop()
        # 灯光调暗
        self.lights.dim(10)

        # 放下屏幕
        self.screen.down()

        # 打开投影仪，设置为宽屏模式
        self.projector.on()
        self.projector.setInput(dvd)
        self.projector.wideScreenMode()

        # 打开功放 设置为DVD 调整成环绕立体声模式，音量调到5
        self.amp.on()
        self.amp.setDvd(dvd)
        self.amp.setSurroundSound()
        self.amp.setVolume(5)

        # 打开dvd 播放器
        self.dvd.on()
        self.dvd.play(movie)
    
    def endMovie(self):
        # endMovie 负责关闭一切，由子系统中的组件完成
        print("Shutting movie theater down...")
        self.popper.off()
        self.lights.on()
        self.screen.up()
        self.projector.off()
        self.amp.off()
        self.dvd.stop()
        self.dvd.eject()
        self.dvd.off()
```

##### 代码使用

```python
def main():
    home_theater = HomeTheaterFacade() # 实例化外观
    home_theater.watchMovice() # 使用简化方法开启 关闭电影ß
    home_theater.endMovice()
```
### 定义

> `定义：`外观模式提供了一个统一的接口，用来访问子系统中的一群接口。外观定义了一个高层接口，让子系统更容易使用。

![外观模式类图](http://media.gusibi.mobi/LTw5Md09LS2JDhLP5TKFay5jNCGUK93PgDVhpB3clEv-8RzKOfyOFCvLlIzn4D0V)

从类图也可以了解到，外观模式的主要意图是提供一个更简单易用的接口。


#### 最少知识原则（least Knowledge）

`最少知识原则`的意思是减少对象之间的交互，只和几个特定的对象交互。
> 这个原则是希望在设计中，不要耦合太多的类，以免修改系统时，会影响到其它部分。

比如：如果想从DVD播放器获取音响的音量，可以在Dvd播放器中加入一个方法，用来像音响请求当前音量，而不是先返回音响对象，再从音响对象返回音量。

```python
# 不好的实践
def get_volume():
    tuner = dvd.tuner()
    return tuner.get_volume
    

# 好的实践
def get_volume():
    # 这里要给dvd 对象加一个get_volume方法
    return dvd.get_volume
```

> `缺点：`虽然这个原则减少了对象之间的依赖，但是也会导致更多的包装被制造出来（比如上边例子中，就需要给`dvd 加一个 get_volume`方法），这也可能会导致系统更复杂。

再回顾一下外观模式的例子，会发现外观模式符合`最少知识原则`，客户端只有`HomeTheaterFacade`这一个交互对象。它的存在让系统调用变的更简单，并且如果需要子系统有模块需要升级，只需要修改`HomeTheaterFacade`这个类就可以完成升级。

------

> 本文例子来自《Head First 设计模式》。


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![](http://media.gusibi.mobi/ah0mqMXMtdJb9Yj03suu-NGEyVRxyEuOIT5bXSv7ip5aqtHkiRjTTl8SMRMv3Qp5)
