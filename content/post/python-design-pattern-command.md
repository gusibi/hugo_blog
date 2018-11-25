---
date: 2018-01-09T23:16:56+08:00
description: python 设计模式，命令模式
draft: false
slug: "python-design-pattern-command"
categories: ["development", "python",  "设计模式"]
tags: ["python", "读书笔记", "设计模式"]
title: "python设计模式-命令模式"
---


### 命令模式


> `题目：` 现在要做一个智能家居控制遥控器，功能如下图所示。

![智能家居遥控器](<http://media.gusibi.mobi/UPqlqNDZ-vRoQN65O3JhR8egeJyz2zIVfbPRV7V47ZhMsWp0aT6awTJoplv_XQbw>)


> 下图是家电厂商提供的类，接口各有差异，并且以后这种类可能会越来越多。

![家电厂商类](<http://media.gusibi.mobi/vcUsidbuki8NvnE6GIQ4V-UtyVMw5I3B1C3GkIceIETTGiMuYdTYnD2NSFaJOzTn>)



观察厂商提供的类，你会发现，好多类提供了 on()、off() 方法，除此之外，还有一些方法像 dim()、setTemperature()、setVolumn()、setDirection()。由此我们可以想象，之后还会有更多的厂商类，每个类还会有各式各样的方法。

如果我们把这些类都用到遥控器代码中，代码就会多一大堆的 if 语句，例如 

```python
if slot1 == Light:
    light.on()
elif slot1 == Hottub:
    hottob.jetsOn()
```

并且更严重的是，每次有新的厂商类加进来，遥控器的代码都要做相应的改动。

这个时候我们就要把`动作的请求者（遥控器）`从`动作的执行者（厂商类）`对象中解耦。



>  如何实现解耦呢？

我们可以使用`命令对象`。利用命令对象，把请求（比如打开电灯）封装成一个特定对象。所以，如果对每个按钮都存储一个命令对象，那么当按钮按下的时候，就可以请求命令对象做相关的工作。此时，遥控器并不需要知道工作的内容是什么，只要有个命令对象能和正确的对象沟通，把事情做好就可以了。



下面我们拿餐厅点餐的操作来介绍下命令模式。



餐厅通常是这样工作的：

1. 顾客点餐，把订单交给服务员
2. 服务员拿了订单，把订单交给厨师。
3. 厨师拿到订单后根据订单准备餐点。

![](<http://media.gusibi.mobi/yzFfIqvBPf9WmHIashy3smiDYBsJbsr-pT5d7I9JnFVoLLron_ZVyXhot3-VufIT>)

这里我们把订单想象成一个用来请求准备餐点的对象，

* 和一般对象一样，订单对象可以被传递：从服务员传递到订单柜台，订单的接口只包含一个方法 orderUp()。这个方法封装了准备餐点所需的动作。
* 服务员的工作就是接受订单，然后调用订单的 orderUp() 方法，她不需要知道订单内容是什么。
* 厨师是一个对象，他知道如何准备准备餐点，是任务真正的执行者。



> 如果我们把餐厅想象成OO 设计模式的一种模型，这个模型允许将”发出请求的对象“和”接受与执行这些请求的对象“分隔开来。比如对于遥控器 API，我们要分隔开”发出请求的按钮代码“和”执行请求的厂商特定对象”。



`回到命令模式`我们把餐厅的工作流程图转换为命令模式的流程图：这里 client 对应上一张图的顾客，command 对应订单，Invoker 对应服务员，Receiver 对应的是厨师。



![](http://media.gusibi.mobi/xnRDNC6NqVbMnXzD66vzgCAICcb3tKcXDGyBDxZuERwAwI0TnUQACv6MhFEezDAO)





## 命令模式



先来看下命令模式的定义：

> `命令模式`将”请求“封装成对象，以便使用不同的请求、队列或者日志来参数化其他对象。命令模式也支持可撤销的操作。

通过上边的定义我们知道，一个命令对象通过在特定接收者上绑定一组动作来封装一个请求。要达到这一点，命令对象将动作和接收者包进对象中。这个对象只暴露一个 execute() 方法，当此方法被调用时，接收者就会进行这些动作。

命令模式类图如下：

![命令模式类图](<http://media.gusibi.mobi/BehmMRbLQ_w7RbvRD7q0DIu78jUvQ07v9zSVqFp79D8COVe6VL2UxtZjgw_C10fr>)



> 回到遥控器的设计：我们打算将遥控器的每个插槽，对应到一个命令，这样就让遥控器变成了`调用者`。当按下按钮，相应命令对象的 execute() 方法就会被调用，其结果就是接收者(例如：电灯、风扇、音响)的动作被调用。



![](<http://media.gusibi.mobi/ddLNmiEJXUuiKe7rChshd-mPX-ycVAJGYFw3MLv8M24D_A0pOSGfDwBWPxK5ZMgT>)



命令模式还支持撤销，该命令提供和 execute() 方法相反的 undo() 方法。不管 execute() 做了什么，undo() 都会倒转过来。



## 代码实现



### 遥控器的实现



```python
class RemoteControl(object):

    def __init__(self):
        # 遥控器要处理7个开与关的命令
        self.on_commands = [NoCommand() for i in range(7)] 
        self.off_commands = [NoCommand() for i in range(7)]
        self.undo_command = None  # 将前一个命令记录在这里

    def set_command(self, slot, on_command, off_command):
        # 预先给每个插槽设置一个空命令的命令
        # set_command 命令必须要有三个参数(插槽的位置、开的命令、关的命令)
        self.on_commands[slot] = on_command
        self.off_commands[slot] = off_command

    def on_button_was_pressed(self, slot):
        command = self.on_commands[slot]
        command.execute()
        self.undo_command = command
        
    # 当按下开或关的按钮，硬件就会负责调用对应的方法
    def off_button_was_pressed(self, slot):
        command = self.off_commands[slot]
        command.execute()
        self.undo_command = command

    def undo_button_was_pressed(self):
        self.undo_command.undo()

    def __str__(self):
        # 这里负责打印每个插槽和它对应的命令
        for i in range(7):
            print('[slot %d] %s %s' % (i,
                                       self.on_commands[i].__class__.__name__,
                                       self.off_commands[i].__class__.__name__))
        return ''

```



### 命令的实现



这里实现一个基类，这个基类有两个方法，execute 和 undo，命令封装了某个特定厂商类的一组动作，遥控器可以通过调用 execute() 方法，执行这些动作，也可以使用 undo() 方法撤销这些动作：

```python
class Command(object):

    def execute(self):
        # 每个需要子类实现的方法都会抛出NotImplementedError
        # 这样的话，这个类就是真正的抽象基类
        raise NotImplementedError()

    def undo(self):
        raise NotImplementedError()


# 在遥控器中，我们不想每次都检查是否某个插槽都加载了命令，
# 所以我们给每个插槽预先设定一个NoCommand 对象
# 所以没有被明确指定命令的插槽，其命令将是默认的 NoCommand 对象
class NoCommand(Command):

    def execute(self):
        print('Command Not Found')

    def undo(self):
        print('Command Not Found')
```



以下是电灯类，利用 Command 基类，每个动作都被实现成一个简单的命令对象。命令对象持有对一个厂商类的实例的引用，并实现了一个 execute()。这个方法会调用厂商类实现的一个或多个方法，完成特定的行为，在这个例子中，有两个类，分别打开电灯与关闭电灯。

```python
class Light(object):

    def __init__(self, name):
        # 因为电灯包括 living room light 和 kitchen light
        self.name = name

    def on(self):
        print('%s Light is On' % self.name)

    def off(self):
        print('%s Light is Off' % self.name)


# 电灯打开的开关类
class LightOnCommand(Command):

    def __init__(self, light):
        self.light = light

    def execute(self):
        self.light.on()

    def undo(self):
        # undo 是关闭电灯
        self.light.off()

        
class LightOffCommand(Command):

    def __init__(self, light):
        self.light = light

    def execute(self):
        self.light.off()

    def undo(self):
        self.light.on()
```



执行代码，这里创建多个命令对象，然后将其加载到遥控器的插槽中。每个命令对象都封装了某个家电自动化的一项请求：

```python
def remote_control_test():
    remote = RemoteControl()

    living_room_light = Light('Living Room')
    kitchen_light = Light('Kitchen')

    living_room_light_on = LightOnCommand(living_room_light)
    living_room_light_off = LightOffCommand(living_room_light)
    kitchen_light_on = LightOnCommand(kitchen_light)
    kitchen_light_off = LightOffCommand(kitchen_light)

    remote.set_command(0, living_room_light_on, living_room_light_off)
    remote.set_command(1, kitchen_light_on, kitchen_light_off)

    print(remote)

    remote.on_button_was_pressed(0)
    remote.off_button_was_pressed(0)
    remote.undo_button_was_pressed()
    remote.on_button_was_pressed(1)
    remote.off_button_was_pressed(1)
    remote.undo_button_was_pressed()
```

执行后输出为：

```bash
[slot 0] LightOnCommand LightOffCommand
[slot 1] LightOnCommand LightOffCommand
[slot 2] NoCommand NoCommand
[slot 3] NoCommand NoCommand
[slot 4] NoCommand NoCommand
[slot 5] NoCommand NoCommand
[slot 6] NoCommand NoCommand

Living Room Light is On
Living Room Light is Off
Living Room Light is On
Kitchen Light is On
Kitchen Light is Off
Kitchen Light is On
```



## 集合多个命令



通常，我们还希望能有一个开关一键打开所有的灯，然后也可以一键关闭所有的灯，这里我们使用 `MacroCommand`:



```python
class MacroCommand(Command):

    def __init__(self, commands):
        # 首先创建一个 commands 的 list，这里可以存放多个命令
        self.commands = commands

    def execute(self):
        # 执行时，依次执行多个开关
        for command in self.commands:
            command.execute()

    def undo(self):
        # 撤销时，给所有命令执行 undo 操作
        for command in self.commands:
            command.undo()
```



测试开关集合：



```python
def remote_control_test():
    remote = RemoteControl()
    
    living_room_light = Light('Living Room')
    kitchen_light = Light('Kitchen')
    garage_door = GarageDoor()

    living_room_light_on = LightOnCommand(living_room_light)
    living_room_light_off = LightOffCommand(living_room_light)
    kitchen_light_on = LightOnCommand(kitchen_light)
    kitchen_light_off = LightOffCommand(kitchen_light)

    garage_door_open = GarageDoorOpenCommand(garage_door)
    garage_door_close = GarageDoorCloseCommand(garage_door)
    
    # 测试开关集合
    party_on_macro = MacroCommand([living_room_light_on, kitchen_light_on])
    party_off_macro = MacroCommand([living_room_light_off, kitchen_light_off])
    remote.set_command(3, party_on_macro, party_off_macro)
    print('--pushing macro on--')
    remote.on_button_was_pressed(3)
    print('--pushing macro off--')
    remote.off_button_was_pressed(3)
    print('--push macro undo--')
    remote.undo_button_was_pressed()
```



当然，我们也可以使用一个列表来记录命令的记录，实现多层次的撤销操作。



## 命令模式的用途



### 1. 队列请求

命令可以将运算块打包（一个接收者和一组动作），然后将它传来传去，就像是一般的对象一样。即使在命令对象被创建许久以后，运算依然可以被调用。我们可以利用这些特性衍生一些应用，例如：日程安排、线程池、工作队列等。

> `想象一个工作队列:`你在某一端添加命令，然后在另一端则是线程。线程进行下面的动作：从队列中取出一个命令，调用它的 execute() 方法，等待这个调用完成，然后将次命令对象丢弃，再取下一个命令

此时的工作队列和计算的对象之间是完全解耦的，此刻线程可能进行的是音频转码，下一个命令可能就变成了用户评分计算。



### 2.  日志请求



某些应用需要我们将所有的动作都记录在日志中，并能在系统死机之后，重新调用这些动作恢复到之前的状态。通过新增两个方法（store()、load()），命令模式能够支持这一点。这些数据最好是持久化到硬盘。



> `要怎么做呢?` 当我们执行命令时，将历史记录存储到磁盘，一旦系统死机，我们就将命令对象重新加载，并成批的依次调用这些对象的 execute() 方法。



比如对于excel，我们可能想要实现的错误恢复方式是将电子表格的操作记录在日志中，而不是每次电子表格一有变化就记录整个电子表格。数据库的事务（transaction）也是使用这个技巧，也就是说，一整群操作必须全部进行完成，或者没有任何操作。



## 参考链接

[命令模式完整代码-https://gist.github.com/gusibi/e66134218fdecff59e5690298d657c26](https://gist.github.com/gusibi/e66134218fdecff59e5690298d657c26)

------


最后，感谢女朋友支持。

| 欢迎关注(April_Louisa)                       | 请我喝芬达                                    |
| ---------------------------------------- | ---------------------------------------- |
| ![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK) | ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc) |
