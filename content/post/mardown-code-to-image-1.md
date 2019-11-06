---
categories: ["development", "python", "golang"]
date: 2019-06-13T23:34:53+08:00
description: markdown中code生成图片的思路
draft: false
slug: markdown-code-to-image-1
tags: ["python", "tutorial", "golang", "公众号"]
title: "markdown中code生成图片的思路"
---

最近在头条上写东西，遇到了一个比较烦的事情---**编辑器不支持代码**。这对于一个像我这样使用代码凑字数的人来说实在不是一个好的消息。但是等头条改进编辑器太遥远了，只能自己自足实现一个替代方案了--把代码替换成图片。

一段代码的时候，我随手截图，简单完成了；
两段代码的时候，我随手随手截图，也完成了；
三段代码的时候，我随手随手随手截图，强忍着完成了；
等我发现代码越来越多的时候，不能忍了。
懒惰是程序员的美德，不能再花费时间干这些事情了。我觉得要写个程序，把markdown 中的代码自动生成图片。

**考虑了一下，大概需要做的工作是：**

1. 把markdown 中 "``` ```" 包换的代码提取出来（也可以使用工具先把markdown 转换成html 再解析html 取出code
2. 把每一段code 分别生成图片
3. 把图片对应的代码替换掉


想想还是很简单的。那就开始吧。

但是到第二步的时候遇到了问题，**code 如何生成图片，生成什么样的图片？**

1. 首先code 需要保持原有的样式，如果能高亮那就更好了（嗯，高亮
2. 生成图片的时候是把code 作为文字使用PIL（我使用python）写在背景上么，图片大小是多少，高亮怎么实现
3. 算了，还是先把code 生成html，然后截取html页面吧。（这样html 还能使用 highlight.js 来实现高亮）
4. 如何动态生成包含code 的html 页面呢？
5. 如何把截取html 页面呢？


**动态生成包含code 的html 页面有两个思路：**

1. 使用post 请求，把code 写入数据库（或者文件），然后返回id，再使用id GET 请求获取页面（需要存储，两次请求）
2. 压缩code，把code 作为url参数，使用GET请求获取页面（可能会造成url太长的错误）


**那如何截取html呢？**

如果是python，可以使用pyqt，渲染html页面，截取webview。
如果使用node，可以使用 html2canvas。

大致流程如下：

![](http://media.gusibi.mobi/AeaSby9Zk5mB9lMW2hiZDbSzaQa9VlpRaHomeb_mVndzFIn6oMEKbIKJqk3P59_U)


**哎，这一篇没有代码，就凑不了多少字。**


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)