---
permalink: /post/golang-description
title: golang 介绍
author: goodspeed
tags:
    - golang
    - 读书笔记
date: 2016-04-14T22:44:40+08:00
categories: ["development", "读书笔记", "golang"]
---

## 1. Golang 是什么

Go 官方说明：
> Go 编程语言是一个使得程序员更加有效率的开源项目。Go 是有表达力、简 洁、清晰和有效率的。它的并行机制使其很容易编写多核和网络应用,而新的类型系统允许构建有 性的模块化程序。Go 编译到机器码非常快 速,同时具有便利的垃圾回收和强大的运行时反射。它是快速的、静态类 型编译语言,但是感觉上是动态类型的,解释型语言

HUGOMORE42

## 2. 为什么要开发这个语言

### Go 语言的发展目标

* Go 语言的主要目标是将静态语言的安全性和高效性与动态语言的易开发性进行有机结合
* Go 语言是一门类型安全和内存安全的编程语言。虽然 Go 语言中仍有指针的存在，但并不允许进行指针运算。
* Go 语言的另一个目标是对于网络通信、并发和并行编程的极佳支持，从而更好地利用大量的分布式和多核的计算机
* Go 语言中另一个非常重要的特性就是它的构建速度（编译和链接到机器代码的速度），一般情况下构建一个程序的时间只需要数百毫秒到几秒。
* Go 语言实现高效快速的垃圾回收（使用了一个简单的标记-清除算法）。


## 3. 有什么特性&&用途

### 语言的特性

* 清晰并且简洁

> Go 努力保持小并且优美,你可以在短短几行代码里做许多事情;

* 并行

> Go 语言从本质上（程序和结构方面）来实现并发编程。
> Go 让函数很容易成为非常轻量的线程。这些线程在 Go 中被叫做 goroutines

* Channel

> 这些 goroutines 之间的通讯由 channel[18, 25] 完成

* 快速

> 编译很快,执行也很快。目标是跟 C 一样快。编译时间用秒计算;
> Go 的可执行文件都比相对应的源代码文件要大很多，这恰恰说明了 Go 的 runtime 嵌入到了每一个可执行文件当中。当然，在部署到数量巨大的集群时，较大的文件体积也是比较头疼的问题。但总得来说，Go 的部署工作还是要比 Java 和 Python 轻松得多。因为 Go 不需要依赖任何其它文件，它只需要一个单独的静态文件，这样你也不会像使用其它语言一样在各种不同版本的依赖文件之间混淆。

* 安全

> 当转换一个类型到另一个类型的时候需要显式的转换并遵循严格的规则。Go 有 垃圾收集（使用了一个简单的标记-清除算法）,在 Go 中无须 free(),语言会处理这一切;
> 值得注意的是，因为垃圾回收和自动内存分配的原因，Go 语言不适合用来开发对实时性要求很高的软件。

* 标准格式化

> Go 程序可以被格式化为程序员希望的(几乎)任何形式,但是官方格式是存在的。标准也非常简单:gofmt 的输出就是官方认可的格式;

* 类型后置

> 类型在变量名的后面,像这样 var a int,来代替 C 中的 int a;

* UTF-8

> 任何地方都是 UTF-8 的,包括字符串以及程序代码。你可以在代码中使用 Φ = Φ + 1;

* 开源

> Go 的许可证是完全开源的,参阅 Go 发布的源码中的 LICENSE 文件;

* 尽管 Go 编译器产生的是本地可执行代码，这些代码仍旧运行在 Go 的 runtime（这部分的代码可以在 runtime 包中找到）当中。这个 runtime 类似 Java 和 .NET 语言所用到的虚拟机，它负责管理包括内存分配、垃圾回收（第 10.8 节）、栈处理、goroutine、channel、切片（slice）、map 和反射（reflection）等等。

### 有什么用途

Go 语言被设计成一门应用于搭载 Web 服务器，存储集群或类似用途的巨型中央服务器的系统编程语言。对于高性能分布式系统领域而言，Go 语言无疑比大多数其它语言有着更高的开发效率。它提供了海量并行的支持，这对于游戏服务端的开发特别适用。

[使用 Go 的组织](http://go-lang.cat-v.org/organizations-using-go)


## 4. 有什么缺点

* 为了简化设计，不支持函数重载和操作符重载
* 为了避免在 C/C++ 开发中的一些 Bug 和混乱，不支持隐式转换
* Go 语言通过另一种途径实现面向对象设计来放弃类和类型的继承
> 举例说明用什么途径实现继承

* 尽管在接口的使用方面可以实现类似变体类型的功能，但本身不支持变体类型
* 不支持动态加载代码
* 不支持动态链接库
* 不支持泛型
* 通过 recover 和 panic 来替代异常机制
> 举个异常处理的例子

* 不支持断言
* 不支持静态变量


## 5. 安装

Go 的源代码有以下三个分支：

* Go release：最新稳定版，实际开发最佳选择
* Go weekly：包含最近更新的版本，一般每周更新一次
* Go tip：永远保持最新的版本，相当于内测版

现在release 是1.6 可以按照自己的需求安装

### ubuntu & debian

```bash
sudo apt-get update && apt-get install -y --no-install-recommends \
    g++ gcc libc6-dev make

GOLANG_VERSION=1.6
GOLANG_DOWNLOAD_URL=https://golang.org/dl/go$GOLANG_VERSION.linux-amd64.tar.gz
GOLANG_DOWNLOAD_SHA256=5470eac05d273c74ff8bac7bef5bad0b5abbd1c4052efbdbc8db45332e836b0b

sudo curl -fsSL "$GOLANG_DOWNLOAD_URL" -o golang.tar.gz \
    && echo "$GOLANG_DOWNLOAD_SHA256  golang.tar.gz" | sha256sum -c - \
    && tar -C /usr/local -xzf golang.tar.gz \
    && rm golang.tar.gz

## 也可以直接 sudo apt-get install go 版本可能不是1.6
```

### Mac

```sh
brew install go
```

### Windows

点击下载页面直接下载安装吧 [下载链接] (http://golang.org/dl/)

## 6. 环境配置&编辑器

GOROOT GO语言安装的路径
GOPATH 表示代码包所在的地址，可以设置多个
PATH 可执行程序的路径，在命令行执行命令时，系统默认会在PATH中指定路径里寻找

```sh
# 将以下环境变量加到 .bashrc 或者 .zshrc 文件
# Mac 配置
export GOROOT='/usr/local/Cellar/go/1.6/libexec'
export GOPATH=$HOME/Golang
export PATH=$PATH:$HOME/go/bin:$GOPATH/bin

# ubuntu 配置
export GOROOT='/usr/local/go'
export GOPATH=/go
export PATH=$PATH:$HOME/go/bin:$GOPATH/bin

```

### 编辑器

* vim
* atom
* pyCharm


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)