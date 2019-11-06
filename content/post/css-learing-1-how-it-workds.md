---
categories: ["development", "web", "读书笔记", "前端"]
date: 2017-05-27T17:22:49+08:00
draft: false
slug: "css-learing-1-css-how-it-works"
tags: ["css", "读书笔记", "前端", "html", "tutorial"]
title: "CSS入门指南-1：工作原理"
---

> 这是CSS设计指南的读书笔记，用于加深学习效果。

最近想做一个小程序，前端是必修课，那就从css开始吧。

## css 工作原理
每个html元素都有一组样式属性，可以通过css来设定。当html元素的同一个样式属性有多种样式值的时候，css就要靠层叠机智来决定最终应用哪种样式。

HUGOMORE42

### css规则
规则实际上是一条完整的css指令，规则声明了要修改的元素和要应用给改元素的样式。

#### 为文档添加样式的三种方法：
1. 写在元素标签里（也叫行内样式，只能影响它所在的标签，会覆盖嵌入样式和链接样式）
2. 写在\<style> 标签里（也就嵌入样式，应用范围仅限于当前页面，页面样式会覆盖外部样式表中的样式，但会被行内样式覆盖）
3. 写在单独css样式表中（也叫链接样式，样式表是一个扩展名为.css 的文件，可以在任意多个HTML页面链接同一个样式表文件。链接样式的作用范围是整个网站）


除了这三种为页面添加样式的方法，还有一种在样式表中链接其他样式表的方法，使用@import 指令：例如

```
@import url(css/styles.css)
```
@import 指令必须出现在样式表中其他样式之前，否则@吹灭；@import引用的样式表不会被加载。
![css 规则命名惯例](http://omuo4kh1k.bkt.clouddn.com/cpByY2yOl7gHv6vEFDL2CyMt8YJQ-0t0MRxo6itjABg0PeYrrqz6wrIV6q5kKsm8)

对这个基本的结构有三种方法可以进行扩展

**第一种方法：**多个声明包含在一条规则里。

```css
p {color: red; font-size: 12px; font-weight: bold;}
```
**第二种方法：**多个选择器组合在一起。例如：如果想让\<h1>、\<h2>和\<h3>的文本都变成蓝色粗体可以这么写：

```css
h1 {color: blue; font-weight: bold;}
h2 {color: blue; font-weight: bold;}
h3 {color: blue; font-weight: bold;}
```

也可以这么写：

```css
h1, h2, h3 {color: blue; font-weight: bold;}
```

**分组选择符以逗号作为分隔符**

**第三种方法：** 多条规则应用给一个选择符。
例如，写完上边的规则，还想把h3变成斜体，那么可以再为h3单独写一条规则：

```css
h1, h2, h3 {color: blue; font-weight: bold;}
h3 {font-style: italic;}
```

### 选择特定元素的选择符

用于选择特定元素的操作符有三种

1. **上下文选择符**。基于祖先或者同胞元素选择一个元素。
2. **ID和类选择符**。基于id和class属性的值选择元素。
3. **属性选择符**。基于属性的有无和特征选择元素。

#### 上下文选择符

比如我们想给article中的段落设置不同的字号，可以使用上下文选择符来解决。

上下文选择符的格式如下：

> 标签1 标签2 {声明}

其中**标签2** 是我们要选择的目标，而且只有在 **标签1**是其祖先元素的情况下才会被选中。

上下文选择符，叫后代组合式选择符，就是一组以空格分隔的标签名。用于选择作为特定祖先元素后代的标签。

```css
article p {font-weight: bold;}
```

上边例子中，只有article后代的p元素才会应用后边的样式。

**上下文选择符以空格作为分隔符**

##### 特殊的上下文选择符

* 子选择符 >

格式如下：

> 标签1 > 标签2

**标签1** 必须是 **标签2** 的**父元素**，不能是其它的祖先元素。

```css
section > h2 {font-style: italic;}
```

* 紧邻同胞选择符+

格式如下：

> 标签1 + 标签2

标签2 必须紧跟在期同胞标签1后面。

```css
h2 + p {font-variant: small-caps;}
```

标签 h2 和 p 为同一级标签，且标签p和 h2 相邻。(只应用到p标签）

* 一般同胞选择符 ~

格式如下：

> 标签1 ~ 标签2

**标签2** 必须跟在其 **同胞标签1** 后面（可以不相邻）。

```css
h2 ~ a {color: red;}
```

标签a 和 标签h2 同一级，且a标签在h2 标签之后。（只应用与a标签）

* 通用选择符 *

通用选择符 * 是一个通配符，它匹配任何元素。

```css
* {color: green;}
```

这条规则会将所有元素（文本和边框）都变成绿色。

```css
p * {color: red;}
```
这条规则会把p包含的所有元素的文本都变成红色。

```css
section * a {font-size: 1.3em;}
```

所有section标签的 非子标签（*是所有的子标签）的a标签字体设置为 1.3 em;

#### ID和类选择符

使用ID和类选择符，首先要在HTML标记中为元素添加id和class属性。

> 可以给id和class属性设定任意值，但不能以数字或特殊符号开头

##### 类属性

给标签h1添加 specialtext 类。

```css
<h1 class="specialtext">This is text</h1>
```

* 类选择符

格式为：

> .类名

类选择符使用点(.)，紧跟类名。

* 标签带类选择符

格式为：
> 标签1.类名

比如：

```css
p.specialtext {color: red;}
```
只对有 specialtext 类的p标签有效。

* 多类选择符

可以给元素添加多个类：

```html
<p class="specialtext featured">Here the span tag <span> may or may not</span> be styled.</p>
```
多个类名放在同一对引号吃，用空格分隔。

要选择同时存在这两个类名的元素可以这样写：

```css
.specialtext.featured {font-size: 120%;}
```
CSS 选择符的两个类名直接没有空格。如果加了，就变成祖先/后代关系的上下文选择符了。

##### ID属性

ID属性与类写法类似，用#表示。

```html
<p id="specialtext">This is text</p>
```
上边p标签就设置了ID属性specialtext。

相应的ID选择符就这样写：

```css
#specialtext {css样式}
```

选择元素方式其余和class 一致。

#### ID属性和类属性的区别

* ID可以用于页面导航链接中。
例如：

```html
<a href="#bio">Biggraphy</a>
``` 
用户点击这个链接会滚到ID值为bio的位置。如果href属性里只有一个#，那么点击链接会跳到顶部。

* ID值需要时独一无二的。
* 类的目的是为了标识一组具有相同特征的元素，以便我们为这些元素应用相同的css样式。

#### 属性选择符

##### 属性名选择符

格式如下：

> 标签名[属性名]

选择任何带有属性名的标签名。

比如：

```css
img[title] {border: 2px solid blue;}
```

这个规则会选择带有title属性的HTML img元素，title是什么值都可以。

##### 属性值选择符

格式如下：

> 标签名[属性名="属性值"]（在html5中，属性值得引号可不加)

例如：

```css
img[title="red flower"] {border: 2px solid blue;}
```
这个规则会选择带有title属性的HTML img元素，且title值为"red flower"。

#### 伪类

伪类分两种：
1. UI伪类会在HTML元素处于某个状态时，为该元素应用CSS样式。
2. 结构化伪类会在标记中存在某种结构上的关系时，为相应元素应用CSS样式。

伪类使用:(冒号)作为选择符。
两个冒号(::)表示新增的伪元素。

#### UI伪类

UI伪类会基于特定的HTML元素的状态应用样式。

##### 链接伪类

针对链接的伪类有4个：

* Link。 此时，链接为被点击
* Visited。用户点击过链接之后
* Hover。鼠标悬停在链接上
* Active。链接正在被点击

使用方式举例：

```css
a:link {color: black;}
a:visited {color: blue;}
a:hover {text-decoration: none;}
a:active {color: red;}
```

hover伪类可以应用在任何元素。

```css
p:hover {background-color: gray;}
```
##### :focus 伪类

可以应用于任何元素。

点击时会或得焦点。

##### :target 伪类

可以应用于任何元素。
如果用户点击一个指向页面中其他元素的链接，则那个元素就是目标，可以用:target 选中。

比如：

```html
<a href="#more_info">More Infomation</a>
```
应用上伪类后，ID为more_info的元素就是目标。点击a标签时，会应用css样式。

css规则如下：

```css
#more_info:target {background: #eee;}
```

#### 结构化伪类

##### :first-child和:last-child

* :first-child 代表一组同胞元素的第一个元素
* :last-child 代表一组同胞元素的最后一个元素

##### :nth-child

规则如下：

```css
e:nth-child(n)
```

e表示元素名，n表示一个数值。

比如：

```css
li:nth-child(3)
```
会选中一组列表的每个第三项。

#### 伪元素

伪元素是文档中若有实无的元素。
常用的伪类如下：

##### ::first-letter

选择首字母，使用规则：

```css
e::first-letter
```

比如
```css
p::first-letter {font-size:300%;}
```
会让首字母变大。

##### ::first-line 

选择段落的第一行。

```css
e::first-line
```
##### ::before和::after

使用规则如下：

```css
e::before
e::after
```
可用于在特定的元素前面或者后面添加特殊内容。

以上CSS选择符已经介绍完了，接下来讨论在一个大的样式表中，规则选择的问题。

CSS提供了三种机制来决定那条规则会胜出：

* 继承
* 层叠
* 特指

### 继承

CSS属性的值会向下传递。
比如我们添加一条这样的规则：

```css
body: {font-family: arial;}
```

那么文档的所有元素都将继承这个样式。

### 层叠

层叠，是样式在文档层次中逐层叠加的过程，目的是让浏览器面对某个标签特定属性值得多个来源，确定最终使用哪个值。

#### 样式来源

以下是浏览器层叠各个来源样式的顺序：

1. 浏览器默认的样式表
2. 用户的样式表
3. 作者链接样式表（按照它们链接到页面的先后顺序）
4. 作者嵌入样式
5. 作者行内样式

浏览器会按上述顺序依次检查每个来源的样式，并在有定义的情况下，更新对每个标签属性值得设定。整个检查更新过程结束后，再将每个标签已最终设定的样式显示出来。

比如，如果作者链接样式表将p的字体设定为Helvetica，而页面中有一条嵌入规则以相同的选择符吧字体设定为Verdana，那么段落文本最终会以Verdana字体显示。**因为浏览器是在读取链接样式表之后读取嵌入样式。**

#### 层叠规则

**层叠规则一：**找到应用给每个元素和属性的所有声明。

**层叠规则二：**按照顺序和权重排序。浏览器一次检查5个来源，并设定匹配的属性，如果匹配的属性在下一个来源有定义，则更新改属性值。

声明也可以加权重。比如：

```css
p {color: green !important; font-size: 12pt;}
```
空格!important分号(;) 用于加重声明的权重。

这条规则加重了将文本设置为绿色的权重。所以就算层叠的下一来源给段落设定了其他颜色，最终的颜色仍然还是绿色。

**层叠规则三：**按特指度排序。特指度是表示一条规则有多明确。

比如某个样式表中包含如下规则：

```css
p {font-size: 12px;}
p.largetext {font-size: 16px;}

<p class="largetext">A bit of text</p>
```

那么上边的p标签将显示16px 文本，因为第二条规则的选择符既包含标签名，又包含类名（特指度高）。

如果是下边的样式：

```css
p {font-size: 12px;}
.largetext {font-size: 16px;}

<p class="largetext">A bit of text</p>
```
还是会显示16px像素，因为类的特指度高。

**层叠规则四** 顺序决定权重。如果两条规则都影响某一元素的属性，特指度也相同，后出现的胜出。

##### 计算特指度

计算特指度有一个记分规则，被称为“ICE”公式：

**I-C-E**

I(ID)C(Class)E(Element)并非真正的三个数，但是 0-1-12比0-2-0 小。

ICE记分规则如下：

1. 选择符中有一个ID，在I的位置上加1；
2. 选择符中有一个类，在C的位置上加1；
3. 选择符中有一个元素，在E的位置上加1；
4. 得到一个三位数。

好了，我们来看一个例子：


选择符                   | 特指度
----------------------- | -------
p                       | 0-0-1
p.largetext             |0-1-1
p#largetext             |1-0-1
body p#largetext        |1-0-2
body p#largetext ul.mylist| 1-1-3
body p#largetext ul.mylist li | 1-1-4


##### 简化版层叠规则

1. 包含ID的选择符胜过包含类的选择符，包含类的胜过包含标签的选择符。
2. 如果几个不同来源都为同一个标签的同一个属性定义了样式，行内样式胜过嵌入样式，嵌入样式胜过链接样式。在链接样式表中，具有相同特指度的样式，后声明的优先。
3. 规则一胜过规则二。
4. 设定的样式胜过继承的样式。


这一篇我们主要介绍了CSS规则，以及如何用它来为HTML应用样式。

-------
**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)