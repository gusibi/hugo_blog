---
categories: ["development", "web", "读书笔记"]
date: 2017-06-06T17:22:49+08:00
draft: true
slug: "css-learing-1-positioning-elements"
tags: ["css", "读书笔记"]
title: "CSS入门指南： （2）定位元素"
---


## 定位元素

上一篇介绍了css 的工作原理，这一篇介绍css是如何定位元素的。

### 盒子模型

> 所谓盒子模型，就是浏览器为页面中的每个HTML元素生成的矩形盒子。这些盒子们都要按照可见版式模型在页面上排布。

可见的页面版式主要由三个属性控制：position、display和float。

* position：控制页面上元素的位置关系
* display：控制元素是堆叠、并排还是不在页面出现
* float：提供控制的方式，以便吧元素组成多栏布局

元素盒子的属性可以分成三组：

* 边框(board)。可以甚至边框的宽窄、样式和颜色
* 内边距(padding)。可以甚至盒子内容区与边框的间距
* 外边距(margin)。可以设置盒子与相邻元素的间距


![盒模型示意图展示了HTML元素的边框、内边距和外边距之间的关系](http://omuo4kh1k.bkt.clouddn.com/4J2VDi7TIFFuSOVgWp-3uuDrzvYh7oMDxeNv5OxgpaQoUGlHPo8tL43fAa5iheKn)

元素盒子还有一个背景层，可以改变颜色，也可以添加图片。

#### 简写样式

CSS为边框、内边距和外边距分别规定了简写属性，每个简写声明中，属性值得顺序都是上、右、下、左。

比如：

```
{
  margin-top: 5px; margin-right: 10px;
  margin-bottom: 12px; margin-left: 8px;
}
```

使用简写则为这样：

```
{margin: 12px 10px 12px 8px;}
```
如果有一个值没写，那么则使用对边的值。

比如：

```
{margin: 12px 10px 12px 10px;}
```
等同于
```
{margin: 12px 10px 12px;}
```
如果只写一个值，则4个边都取这个值。

```
{margin: 12px;}
/*等同于*/
{margin: 12px 12px 12px 12px;}
```
另外每个盒子的属性也分三个粒度，这三个粒度从一般到特殊分别举例如下：

```
{border: 2px dashed red;}
```

混合使用三种粒度的简写属性达成设计目标是很常见的。比如，想为盒子的上边和下边添加4像素的红色边框，为左边添加1像素宽的红色边框，而右边没有。可以这么写：

```
{border: 4px solid red;} /* 先给4条边设置相同的样式*/
{border-left-width: 1px;} /* 修改左边框宽度*/
{border-fight: none;} /*移出右边框*/
```

#### 盒子边框

border 有三个相关属性。

* 宽度（border-width)。可以使用thin、medium和thick等文本值，也可以使用除百分比和负值之外的任何绝对值。
* 样式（border-style)。有none、hidden、dotted、dashed等文本值。
* 颜色（border-color）。可以使用任意颜色值，包括RGB、HSL、十六进制颜色值和颜色关键字。

#### 盒子内边距

内边距是盒子内容区与盒子边框之间的距离。

![](http://omuo4kh1k.bkt.clouddn.com/sKiD0I3LeE7lTK8rARqH8TFpzVK9vh4QoAWCg_7Ll7m9V8VMkBNKY_YfvVUueia8)

上图的样式为：
```
p {font:16px helvetica, sans-serif; width:220px; border:2px solid red; background-color:#caebff;}
```
可以看到在没有设定内边距的情况下，内容紧挨着边框。

设定边框后：
```
p {font:16px helvetica, arial, sans-serif; width:220px; border:2px solid red; background-color:#caebff; padding:10px;}
```
效果如下，可以看到样式舒服了很多：

![](http://omuo4kh1k.bkt.clouddn.com/k6hxSxGq2igZL_RfVnFVqsdD-kX40LgyIPKoXyOprfTQfgL2DdnU4RRBB0c7qYXB)

> 内边距在盒子的内部，所以也会取得盒子背景。也就是说，多出来的内边距并没有挤压文本内容，实际是加在了声明的盒子宽度之上。

#### 盒子外边距



