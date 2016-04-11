+++
date = "2016-04-11T10:47:47+08:00"
draft = false
title = "hugo 使用"
tags = ["test"]
slug = "hugo-simple-use"
+++

### Hello Hugo

Hugo 常用命令 基本配置


### hugo 常用命令

{{< highlight shell >}}
hugo help
hugo version
hugo new site sitename  # 新建一个站点
hugo new post/good-to-great.md  # 添加到content/post 目录
hugo server # 启动server
hugo server --buildDrafts # 预览草稿
hugo undraft content/post/good-to-great.md # 发布一篇文章
hugo server --theme=hugo_zen # 以zen 主题启动server
hugo --theme=hugo_zen 以zen # 主题生成草稿
{{< /highlight >}}

*语法高亮* 

[Syntax Highlighting](https://gohugo.io/extras/highlighting/)

{{< highlight python >}}
# print hello world
print "hello world"
{{< /highlight >}}


### Front Matter Example (in TOML)

[front-matter] (https://gohugo.io/content/front-matter/)

{{< highlight json >}}
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
{{< /highlight >}}

### Markdown 语法说明

[Markdown 语法说明 (简体中文版)] (http://wowubuntu.com/markdown/)


### 参考链接

* [Hugo Quickstart Guide] (https://gohugo.io/overview/quickstart/)
* [Hugo静态网站生成器中文教程] (http://nanshu.wang/post/2015-01-31/)
* [使用hugo搭建个人博客站点] (http://blog.coderzh.com/2015/08/29/hugo/)
* [Hugo中文文档] (http://www.gohugo.org/)
