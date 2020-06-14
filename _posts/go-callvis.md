---
date: 2020-01-19T23:14:13+08:00
title: "「工具推荐」golang 代码可视化工具 go-callvis"
author: goodspeed
permalink: /post/go-callvis
description: "golang 代码可视化工具 go-callvis"
tags: ["工具", "golang"]
categories: ["golang"]
---

##  「工具推荐」[go-callvis](https://github.com/TrueFurby/go-callvis)

go-callvis是相对 以图片的形式展示了go程序的调用关系，这个工具在看复杂项目时尤其有用。

>  亲测，借助它看祖传golang代码，头痛好多了。



### 安装

```sh
go get -u github.com/TrueFurby/go-callvis
# or
git clone https://github.com/TrueFurby/go-callvis.git
cd go-callvis && make install
```



运行依赖

- [Go](https://golang.org/dl/) 1.12+
- [Graphviz：http://www.graphviz.org/download/](http://www.graphviz.org/download/) Mac 可以直接 brew install graphviz



[项目地址：https://github.com/TrueFurby/go-callvis](https://github.com/TrueFurby/go-callvis)



### 使用命令

命令特别简单，只需要简单的输入：


```sh
go-callvis [OPTIONS] <main package>
```



这里 main package 是包含代码的main函数所在的包，比如项目 https://github.com/gusibi/oneplus/tree/master/idgenerator

目录结构为：

```sh
.
├── README.md
└── src
    ├── dbs
    ├── go.mod
    ├── go.sum
    ├── idg
    │   ├── area_code.go
    │   ├── idg.go
    │   ├── idg_test.go
    │   ├── index.go
    │   ├── index_test.go
    │   ├── sort.go
    │   ├── sort_test.go
    │   ├── wr.go
    │   └── wr_test.go
    ├── main.go
    └── sorteDB
```

其中src目录是一个go package，运行go-callvis 时就需要先**cd src/**，然后再执行命令：



```sh
go-callvis  -group pkg,type md52id
```

> md52id 是package name，已在go.mod中声明，pakage name是一个必须要带的参数。

 

运行命令，默认会打开浏览器加载地址**http://localhost:7878**

> 图片格式为 svg，也可以添加 -format=png，指定以png形式展示
>
> 推荐使用svg，svg格式的内容是可交互的，比如这里想查看gin包的内容就可以点击 对应的模块来看详情。

![](http://media.gusibi.mobi/clJZosivjY3n-3G5Bm-kQu6BbuAAV5z_L8iMjR8CoJSknZWRTiF51g9X8hHVq0jk)

结果如果所示，图像展示的结果就是这个包所有的调用关系，按包的调用层级由左向右排列。第二列上边是 gin 框架的代码，如果看代码时不想看这部分，可以使用 ignore 参数排除掉。

命令为：

```sh
go-callvis -group pkg,type -ignore github.com/gin-gonic/gin md52id
```

> 这里 gin 包的名字是 *github.com/gin-gonic/gin*而不是 *gin*
>
> 如果要再排出idg 包，可以直接加在gin 包后边，用,（英文逗号）隔开。
>
> 使用limit 命令可以得到相同的结果
>
> go-callvis  -group pkg,type -limit md52id md52id

得到的结果为：

![](http://media.gusibi.mobi/I8l10FfoYRXYj0VtxMqbTwsz-mpQ7jsgaiq4Exd_8WNglM_mYDbWF6sye9x2uO-c)

如果想看idg包内部的调用关系，可以使用 focus 命令，指定idg 包，命令如下：

```sh
go-callvis -focus=md52id/idg -group pkg,type -limit md52id md52id
```



结果如图：	![](http://media.gusibi.mobi/7WYETqHNJ2ShtiLf-rHKyWqLOnGVdLnBzTGiA_JBdzL26WwnwwaTkZ4xFBTh4-D4)



详细命令可以参考：https://github.com/TrueFurby/go-callvis/tree/master/examples



使用go-callvis ，直观的展示代码的调用关系，对于大项目的源码尤其有用，比如下图是gin stagic 包的调用关系：



![](http://media.gusibi.mobi/VjziH07V8r_X33RlnVo2WeEWa0od4OvAnw9eJoCiAd1eLAAC-I3XuniOeWK0OVCW)



通过图可以直观的看到，

1. static 调用了 staticFS，而staticFS 只使用了 HEAD和GET 方法。
2. 所有的http method 最终都是通过调用handler来处理响应的。

### ### go-callvis 的另类用法



go-callvis 也可以用来评估系统设计是否合理，代码是否清晰，下图是docker 的调用图：



![](http://media.gusibi.mobi/8vZ7dwD6bLOVUBecbWsC5ZMTDOSUeeLzRw2kfxL44TVO8BM0AFGHGzVO1iHJCFqd)



> 原图地址：http://media.gusibi.mobi/8vZ7dwD6bLOVUBecbWsC5ZMTDOSUeeLzRw2kfxL44TVO8BM0AFGHGzVO1iHJCFqd



可以看到，代码结构非常清晰，调用链也比较简单，项目成功果然每一环都做的非常完美。

### References

`[1]` go-callvis: *https://github.com/TrueFurby/go-callvis*
`[2]` Go: *https://golang.org/dl/*
`[3]` Graphviz：http://www.graphviz.org/download/: *http://www.graphviz.org/download/*
`[4]` 项目地址：https://github.com/TrueFurby/go-callvis: *https://github.com/TrueFurby/go-callvis*

------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推

以下是shopee内推广告，「深圳、新加坡、上海」的职位都有，感兴趣的可以留言或者识别二维码直接投递。

![](http://media.gusibi.mobi/3Z6eP3JKdGQkAdfFm3X9cgV1x46YLwIX8iP8Rvg7_QSwYKYTRjAyt0jVEHKdql3P)

