---
author: goodspeed
date: 2016-04-11T10:47:47+08:00
title: "hugo 使用"
permalink: /post/hugo-simple-use
---

### Hello Hugo

Hugo 常用命令 基本配置


### hugo 常用命令

```shell script
hugo help
hugo version
hugo new site sitename  # 新建一个站点
hugo new post/good-to-great.md  # 添加到content/post 目录
hugo server # 启动server
hugo server --buildDrafts # 预览草稿
hugo undraft content/post/good-to-great.md # 发布一篇文章
hugo server --theme=hugo_zen # 以zen 主题启动server
hugo --theme=hugo_zen 以zen # 主题生成草稿
```

*语法高亮*

[Syntax Highlighting](https://gohugo.io/extras/highlighting/)

```python
# print hello world
print "hello world"
```


### Front Matter Example (in TOML)

[front-matter] (https://gohugo.io/content/front-matter/)

```json
+++
title = "Hugo: A fast and flexible static site generator"
description = "Hugo: A fast and flexible static site generator"
tags = [ "Development", "Go", "fast", "Blogging" ]
categories = [ "Development" ]
date = "2012-04-06"
series = [ "Go Web Dev" ]
slug = "hugo-可以替代url"
project_url = "https://github.com/spf13/hugo"
+++
```

### Markdown 语法说明

[Markdown 语法说明 (简体中文版)] (http://wowubuntu.com/markdown/)


### 参考链接

* [Hugo Quickstart Guide] (https://gohugo.io/overview/quickstart/)
* [Hugo静态网站生成器中文教程] (http://nanshu.wang/post/2015-01-31/)
* [使用hugo搭建个人博客站点] (http://blog.coderzh.com/2015/08/29/hugo/)
* [Hugo中文文档] (http://www.gohugo.org/)

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)