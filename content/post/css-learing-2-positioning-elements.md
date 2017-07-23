---
categories: ["development", "web", "读书笔记", "前端"]
date: 2017-07-19T22:22:49+08:00
draft: true
slug: "css-learing-2-positioning-elements"
tags: ["css", "读书笔记", "html", "前端"]
title: "CSS入门指南-2：盒子模型、浮动和清除"
---
> 这是CSS设计指南的读书笔记，用于加深学习效果。

上一篇介绍了css 的工作原理，这一篇主要介绍`盒子模型`和`浮动`。

## 盒子模型

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

### 简写样式

CSS为边框、内边距和外边距分别规定了简写属性，每个简写声明中，属性值得顺序都是上、右、下、左。

比如：

```css
{
  margin-top: 5px; 
  margin-right: 10px;
  margin-bottom: 12px; 
  margin-left: 8px;
}
```

使用简写则为这样：

```css
{
    margin: 12px 10px 12px 8px;
}
```
如果有一个值没写，那么则使用对边的值。

比如：

```css
{margin: 12px 10px 12px;}
/*等同于*/
{
    margin: 12px 10px 12px 10px;
}
```

如果只写一个值，则4个边都取这个值。

```css
{margin: 12px;}
/*等同于*/
{margin: 12px 12px 12px 12px;}
```

另外每个盒子的属性也分三个粒度，这三个粒度从一般到特殊分别举例如下：

```css
{
    border: 2px dashed red;
}
```

混合使用三种粒度的简写属性达成设计目标是很常见的。比如，想为盒子的上边和下边添加4像素的红色边框，为左边添加1像素宽的红色边框，而右边没有。可以这么写：

```css
{border: 4px solid red;} /* 先给4条边设置相同的样式*/
{border-left-width: 1px;} /* 修改左边框宽度*/
{border-fight: none;} /*移出右边框*/
```

### 盒子边框

border 有三个相关属性。

* 宽度（border-width)。可以使用thin、medium和thick等文本值，也可以使用除百分比和负值之外的任何绝对值。
* 样式（border-style)。有none、hidden、dotted、dashed等文本值。
* 颜色（border-color）。可以使用任意颜色值，包括RGB、HSL、十六进制颜色值和颜色关键字。

### 盒子内边距

内边距是盒子内容区与盒子边框之间的距离。

![](http://omuo4kh1k.bkt.clouddn.com/sKiD0I3LeE7lTK8rARqH8TFpzVK9vh4QoAWCg_7Ll7m9V8VMkBNKY_YfvVUueia8)

上图的样式为：

```css
p {
    font: 16px helvetica, sans-serif; 
    width: 220px; 
    border: 2px solid red; 
    background-color: #caebff;
}
```
可以看到在没有设定内边距的情况下，内容紧挨着边框。

设定边框后：

```css
p {
    font: 16px helvetica, arial, sans-serif; 
    width: 220px; 
    border: 2px solid red; 
    background-color: #caebff; 
    padding: 10px;
}
```
效果如下，可以看到样式舒服了很多：

![添加内边距后的效果图](http://omuo4kh1k.bkt.clouddn.com/k6hxSxGq2igZL_RfVnFVqsdD-kX40LgyIPKoXyOprfTQfgL2DdnU4RRBB0c7qYXB)

> 内边距在盒子的内部，所以也会取得盒子背景。也就是说，多出来的内边距并没有挤压文本内容，实际是加在了声明的盒子宽度之上。

### 盒子外边距

![外边距的例子](http://media.gusibi.mobi/nU6FAYz7aFdQrfj7ByrBHbcvJx5F86G_jlpttdfaGt24vpb4KsYUln3JuVW7ZZ14)

上图的例子中，第一组是默认情况，第二组是在第一组基础上添加了边框，第三组是把第二组的外边距设置为了0，标题和段落全紧挨在一起了。

> 推荐大家吧这条规则作为样式表的第一条规则：

```css
* {margin: 0; padding: 0;}
```

这条规则是把所有元素默认的外边距和内边距都设定为0。这样，我们可以为那些真正需要添加边距的元素设定边距。

### 叠加外边距

比如下边这个样式：

```css
p {
    height: 50px;
    border: 1px solid #000;
    backgroundcolor: #fff;
    margin-top: 50px;
    margin-bottom: 30px;
}
```

如果我们把这个样式应用到3个前后相接的段落上，由于上边距和下边距相邻，`你可能会认为他们之间的外边距是80（50+30）像素，但是实际上是50像素`，这就是边距叠加。

> 垂直方向上外边距会叠加 水平方向的不会
> `外边距单位` 根据经验，水平边距可以使用像素，以便该段文本始终与包含元素边界保持固定间距，不受自豪变大或变小的影响。而对于上下外边距，已`em` 为单位则可以让段间距随字号变化而相应增大或缩小。


### 盒子有多大

### 没有宽度的盒子

如果没有显式的设置元素的 `width` 属性，我们就称这个盒子没有宽度。
如果没有设定 width， 那么这个属性的默认值是 auto，会让元素的宽度扩展到与父元素同宽。

我们看个例子🌰：

```html
<body>
<p> 这个元素没有设置宽度</p>
</body>
```

设置样式：

```css
body {
    font-family: helvetica, arial, sans-serif;
    size: 1em;
    marging: 0px;
    background-color: #caebff;
}

p {
    margin: 0;
    background-color: #fff;
}
```

![不设置宽度的样式](http://media.gusibi.mobi/ZzLp1aWGAOITCd_lxtpRdQ6NX1NRqE8Sgjk38YvazbBCB8nExjmrAL5CPZsDAG7U)

可以看到，不给段落设置宽度，段落会填满 body 元素。

为了更加明显，我给段落左右分别加一个边框，再加一个外边距。

```css
p {
    margin:0 30px; 
    background-color:#fff; 
    padding:0 20px; 
    border: solid red; 
    border-width: 0 6px;
}
```

![段落添加左右边框](http://media.gusibi.mobi/Wc3Sep8w8seiPVOK-aC70y-maRXmdR0gqqLq9pLXZvjtu0FuTKruWq8mKX_dLMj6)

这时段落内容区域变成了 288像素（我把浏览器宽度手动调成了400px，400-(20+6+30)x2）。

> `结论`：没有宽度的元素始终会扩展到填满其父元素的宽度为止。添加水平边框、内边距和外边距会导致内容宽度减少，减少量等于水平边框、内边距和外边距的和。

### 有宽度的盒子

还是上边的例子，我们先把外边距去掉，固定宽度400px；

```css
p {
    width:400px; 
    margin:0; 
    padding:0 20px;  
    border:solid red;  
    border-width: 0 6px  0 6px;  
    background-color:#fff;
}
```

![设定宽度、内边距、边框的样式](http://media.gusibi.mobi/p-NHopjzQr4Wb9oQGYVrmjTT-kROYvB0p-cBVEW2uEtliPKnMDxZC-0NowuYuzs0)

可以看到，盒子的宽度并不是400px，而是452像素（400+(20+6)*2）。

再给盒子加上外边距：

```css
p {
    width:400px; 
    margin:0 30px; 
    padding:0 20px;  
    border:solid red;  
    border-width: 0 6px  0 6px;  
    background-color:#fff;
}
```

![设定宽度、内边距、外边距、边框的样式](http://media.gusibi.mobi/t1Np4vU0aQAiAJ-anFl4nJEEJVh_58Mtv5wgwG6umS103kIolQz374za8QFWbiP1)

可以看到，这时总宽度达到了512像素（30+6+20+400+20+6+30=512）

> `结论`: 为设定了宽度的盒子添加边框、内边距和外边距，会导致盒子更宽。实际上盒子的 width 属性设定的只是盒子内容区的宽度，而非盒子整体的宽度

## 浮动与清除

### 浮动

css 设计 float（浮动）属性的主要目的是为了实现文本绕排图片的效果，这个属性也是创建多栏布局最简单的方式。
我们先看一个例子：

```html
<img .../>
<p>..the paragraph text...</p>
```

css 规则如下。

```css
p {
    margin: 0;
    border: 1px solid red;
}
img {
    float: left;
    margin: 0 4px 4px 0;
}
```
这个例子的样式如图所示：
![](http://media.gusibi.mobi/oO9LyVmGMagZ6OLJTOp6X4cVPsXliIY5i6DgzFeFm7tflJwZeZLbImciTfmC9yDl)
> 这里我们给图片加了 `float: left` 样式，这时浏览器就会把图片向上推，直到它碰到父元素的内边界（也就是body）。后面的内容不再认为浮动元素在它的前边，所以它会占据父元素左上角的位置。不过，它的内容会绕开浮动的图片。

### 创建分栏

在上面的基初上如何使内容分栏呢？
只要再用一`float` 属性就可以了。

```css
p {
    float: left; /* 加上这两行*/
    width: 200px;
    ...
}
```

![](http://media.gusibi.mobi/uLsus15W0rQdkt-NzbZwFJuRlczzkEyAWgLb94eGAOGJN-9P_Xi644qyJcgviz8w)

这样同时浮动图片和有宽度的段落，会使图片绕排效果消失，而浮动的段落也向左向上移动。变成了多栏的效果。

### 围住浮动元素

看下这个例子：

```html
<section>
    <img src="images/rubber_duck2.jpg">
    <p>It's fun to float.</p>
</section>
<footer>Here is the footer element that runs across</footer>
```

应用样式如下：

```css
section {
    border: 1px solid blue;
    margin: 0 0 10px 0;
}
p {
    marging: 0;
}
footer {
    border: 1px solid red;
}
```

效果如图：

![浮动图片后标题跑到了右边，但父元素section也收缩到只包含文本的高度](http://media.gusibi.mobi/FgZ9xXjRtez6W2GXoMKbhzDq25LRtJISiO90AYkJ6yEKJ9WB0QUvU1Zz-f7wEmlB)

但这并不是我们想要的，我们并不想让footer 被提到上边。
浮动元素脱离了原来的文档流，不受父元素的控制。如果我们想让父元素还包含浮动的子元素，怎么做呢？
有三种方法：

#### 为父元素应用 `overflow: hidden`

只需要在 `section` 加上这个样式：
```css
section {
    overflow: hidden;
    ...
}
```
现在效果如图：

![section 又包围了浮动的图片](http://media.gusibi.mobi/Kepon_jsAnaY99ITC0Oc5SapqZD5PjXOhwAuyeX-O8OH2Ag2hmryl9wH5jdI_gSR)

> 实际上，`overflow: hidden` 声明凯真正用途是防止包含元素被超大内容撑大。也就是说应用上这个之后，包含元素（父元素）会保持其设定的宽度，如果子元素过大，会被截掉。

#### 浮动父元素

第二种方法是让父元素和子元素同时浮动。

```css
section {
    float: left;
    width: 100%;
    border: 1px solid blue;
}
img {
    float: left;
}
footer {
    border: 1px solid red;
    clear: left;
}
```

浮动section 后，不管其子元素是否浮动，都会被包围。因此需要用 `width: 100%` 让section 与浏览器同宽。由于section 也浮动，所以footer 会往它旁边挤，这时需要使用 `clear: left` 以保证不会被提升到浮动的元素旁边。

#### 在父元素内容的末尾添加浮动元素，可以直接在标记中加，也可以通过给父元素添加clearfix 类来加。

第三种方法是给父元素添加一个非浮动的子元素，然后清除该子元素。

> 这种方式可以生效是因为父元素一定会包围非浮动子元素，且清除会让这个子元素处于最下。

这里我们使用神奇的 `clearfix` 规则：

```css
.clearfix:after {
	 content: ".";
	 display: block;
	 height: 0;
	 clear: both;
	 visibility: hidden;
	}
```

这个 `clearfix` 规则最早是由程序员 `Tony Aslett` 发明的，它只添加了一个清除的包含句点作为非浮动元素（必须有内容，句点是最小的内容）。规则中其他生命是为了确保这个伪元素没有高度，而且不可见。

> `after` 会在元素内容（而不是元素后插入一个伪元素）
> 使用clear: both 意味着 section 中新增的子元素会被清除左右浮动元素。

我们看了三种方法围住浮动元素的方式。

那如果没有父元素，如果清除浮动呢？

比如下边这个例子：

```html
<section>
    <img src="images/rubber_duck3.jpg">
    <p>This text sits next to the image and because the text extends below the bottom of the image, the next image positions itself correctly under the previous image.</p>
    <img src="images/beach_ball.jpg">
    <p>This text is short, so the next image can float up beside this one.</p>
    <img src="images/yellow_float.jpg">
    <p>Because the previous image's text does not extend below it, this image and text move up next to the previous image. This problem can be solved by the use of the clear property.</p>
</section>
```
样式如下：

```css
section {
    width:300px; b
    order:1px solid red;
}
img {
    float:left; 
    margin:0 4px 4px 0;
}
p {
    font-family:helvetica, arial, sans-serif; 
    margin:0 0 5px 0;
}
```

效果如图所示：

![](http://media.gusibi.mobi/bgZc0EUo1bur6AIje1zvk3hrV2XF4obDGJ3YzGRfDEriPyfneQWQ45Xb5iEVIJCD)

由于第二张图下方有空间，所以第三张图及说明文字会上浮到第二张图片右侧，这并不是我们想要的结果。

我们想要的效果是如下图这样：

![](http://media.gusibi.mobi/VBkwrlGf31kzH72-6luCmCeBgqCB2_-8giCfqQtY9KBWV0pU-5KsUFJ8STTJde2J)

那怎么实现呢？ 还是应用 `clearfix` 规则。为每个段落加上clearfix 类。通过`clearfix`类清除元素后，布局就是我们希望的了。


这一篇主要介绍了盒子模型，浮动和清除。下一篇介绍css 布局。

-------
最后，感谢女朋友支持。

| >欢迎关注(April_Louisa) | >请我喝芬达
|------- | -------
|![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)