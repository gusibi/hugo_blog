---
categories: ["development", "web", "读书笔记", "前端"]
date: 2017-07-26T22:21:49+08:00
draft: false
slug: "css-learing-3-positioning-elements"
tags: ["css", "读书笔记", "html", "tutorial", "前端"]
title: "CSS入门指南-3：定位元素"
---

> 这是《CSS设计指南》的读书笔记，用于加深学习效果。
前一篇[CSS入门指南-2：盒子模型、浮动和清除](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752018&idx=1&sn=6915e4f11ba08fa196a64375224cd92e&chksm=80b0b878b7c7316e1a065ae991c534cc11ca5fe72b33690a98fb1c3f6f53f8c98c4c8744cd3a#rd)介绍了css盒子模型、浮动和清除，这一篇介绍 css元素的定位。

## 定位（position）
CSS 布局的核心是 position 属性，对元素盒子应用这个属性，可以相对于它在常规文档流中的位置重新定位。
position 属性有4个值：`static`、`relative`、`absoulte`、`fixed`，默认值为 static。

接下来我会用以下四个段落来逐个说明这些属性是什么意思。

```html
<p id="first">First Paragraph</p>
<p id="Second">Second Paragraph</p>
<p id="specialpara">Third Paragraph</p>
<p id="fourth">First Paragraph</p>
```

### 静态定位（static）

我们先看一下四个段落都采用静态定位的效果。

![四段都采用静态定位的图示](http://media.gusibi.mobi/R_7xrRQEA1TEc4S1GJsxwpfz99rx6nvnb0KZNOc1m-D5P8bdMAq-mQsvZ85xxMSb)

> 静态定位下，每个元素在处在常规文档流中，它们都是块级元素，所以会在页面中自上而下地堆叠。

### 相对定位（relative）

现在我把第三段的 position 属性设置为 relative。

```css
p#specialpara {
    position: relative;
    top: 25px;
    left: 30px;
}
```

因为相对定位`相对的是它原来在文档流中的位置（默认位置）`，所以如果只设置 position 样式不会有任何变化。这里我同时设置了 top 和 left 属性来改变它的位置。

现在它的效果如图所示：

![第三段使用相对定位的效果图](http://media.gusibi.mobi/5OFF-2lXXl-JAY4tUuAl0V3Z5q6livJzUz11Fs7N8nIbz9mYgGp8GlzA6oM6_U9J)

> 现在，第三段从原来的元素（body）中挣脱了出来，与它在文档中的默认位置相比向下移动了25像素，向右移动了30像素。

需要注意的是，除了这个元素自己相对于原始位置挪动了一下以外，页面没有任何改变。这个元素原来占据的空间没有动，其他元素也没动。

这时，如果不想第四段被它挡住，可以给第四段设置一个 margin-top 值。

### 绝对定位（absoulte）

绝对定位跟静态定位和相对定位相比，它会把元素彻底从文档流中拿出来。

我们把 position 改为绝对定位看一下：

```css
p#specialpara {
    position: absoulte;
    top: 25px;
    left: 30px;
}
```

效果如图：

![第三段使用绝对定位的效果图](http://media.gusibi.mobi/2-U0Y3OwzCz9gOLmV-LF96-U1nnRhPUjvX6InOVjCfPo9vWCqwx0d_mQlmsFCkWL)

> 可以看到，第三段原来的位置被回收了。这说明绝对定位的元素脱离了常规文档流，它现在是相对于顶级元素 body 在定位。

现在就涉及到一个概念：`定位上下文`，这个后边说，先继续看最后一种定位方式：`固定定位`。

> `盒子位移属性是如何工作？`

>盒子的位移属性有四个“top、right、bottom和left”，用来指定元素的定位位置和方向。这些属性只能在元素的“position”属性设置了“relative、absolute和fixed”属性值，才生效。

>对于相对定位元素，这些属性的设置让元素从默认位置移动。例如，top设置一个值“20px”在一个相对定位的元素上，这个元素会在原来位置向下移动“20px”。

>对于绝对定位和固定定位，这些属性指定了元素与父元素边缘之间的距离，例如，绝对定位的元素设置一个“top”值为“20px”，将使绝对定位元素相对于其设置了相对定位的祖先元素顶部边缘向下移动“20px”，反之，如果设置一个“top”值为“20px”，将使绝对定位元素相对于其设置了相对定位的祖先元素顶部边缘向上移动“20px”。（绝对定位的参考点是其祖先元素设置了“relative”或者“absolute”值）。

事实上，一个相对定位元素同时设置了“top”和“bottom”位移属性值，实际上“top”优先级高于“bottom”。然而，一个相对定位元素同时设置了“left”和“right”位移属性，他们的优先级取决于页面使用的是哪种语言，例如，如果你的页面是英文页面，那么“left”位移属性优先级高，如果你的页面是阿拉伯语，那么“right”的位移属性优先级高

### 固定定位（fixed）

固定定位与绝对定位类似，我们先看下把定位改为相对定位的效果：

```css
p#specialpara {
    position: fixed;
    top: 25px;
    left: 30px;
}
```

效果如图：

![第三段使用固定定位的效果图](http://media.gusibi.mobi/g_yr-9KcVSriUd_apawLXJRM3qoZ5fHF3rbJXhq2kUafT3A_eg9D2Jv8Dd0sUTMf)

> 这样看效果和绝对定位完全一致，但是固定定位的定位上下文是`浏览器窗口`，她并不会随页面滚动。

以下是使用相对定位和固定定位的图示：

![使用固定定位的示意图](http://media.gusibi.mobi/31atM18aEdu0ogKsBdM0c1Dmc-l_Gyw2sIee4TE6NCCIG7A1YXAbSUZA_OWRUttM)

![使用绝对定位的示意图](http://media.gusibi.mobi/G0pLxrvwS6cxCaesieCs9inVKgzsyolbzRFIYcqvwDhnIIprWTlRWj8p6UCFo9SP)

#### 固定页头和页脚

固定定位最常见的一种用途就是在页面中创建一个固定头部、或者脚部、或者固定页面的一个侧面。就算是用户移动浏览器的滚动条，还是会固定在页面。

现在我们来看下定位上下文。

## 定位上下文

把元素的 position 属性设定为 relative、absolute或 fixed 后，可以使用 top、right、bottom 和 left 属性，相对于另一个元素移动该元素的位置。这里`另一个元素`就是当前元素的`定位上下文`。

我们在介绍绝对定位的时候说过，绝对定位元素默认的定位上下文是  `body`，这是因为 body 是标记中所有元素唯一的祖先元素。不过，如果把他相应的元素设定为 relative，绝对定位元素的任何祖先元素都可以成为它的定位上下文。

比如：

```html
<body>
    <div id="outer">
      <div id="inner"> This is text for a paragraph to demonstrate contextual
        positioning. Here are two divs, one nested in the other. The inner div now
        has absolute positioning, so it positions itself relative to the default
        positioning context, body.</div>
    </div>
</body>
```

css 样式如下：

```css
div#outer {
    width:250px; 
    margin:100px 40px; 
    border-top:3px solid red;
}
div#inner {
    top:10px; 
    left:20px; 
    background:#DDD;
}
```

结果如图：

![两个嵌套的 div。给外部的上方加了边框，给内部的加了背景](http://media.gusibi.mobi/GMOwNNvXspDO5-z8jgN_xtU39GWx6F8kGIgO4f1rjWfLBbY8GxRspaF65xve5nJy)

> 这里内部和外部的 div 都是是静态定位，不存在谁是谁的定位上下文这个问题，所以 top 和 left 属性并没有生效。

下面我们把内部 div 设定为绝对定位，来看一下变化。

```css
div#inner {
    top:10px; 
    left:20px; 
    background:#DDD;
}
```

这是效果如图：
![这里由于定位上下文是 body，所以 top 和 left 都是相对于 body 的移动](http://media.gusibi.mobi/tIL-dsUeItz8GycFe89rmxUphejURxfSZLEkO4KjefpEJATysQV5_Ny-EujVmlcT)

这里由于不存在相对定位的其他祖先元素可以作为定位上下文，绝对定位只能相对于 body 定位。

> 事实上，只要把元素的外边距和内边距设定好，多数情况下使用静态定位就可以实现页面布局了。`除非真正需要那么做，否则不要轻易修改元素的 position 属性。`

现在我们把外部 div 的 position 设置为 relative：

```css
div#outer {
    position: relative;
    width:250px; 
    margin:100px 40px; 
    border-top:3px solid red;
}
```

![外部 div 改为相对定位的效果图](http://media.gusibi.mobi/jA4DvQn5T5PjIWmFJc7FE8bx5a31PMF5Y8czNOGD0d_5MdAoE_PM44bIT1-fa0_y)

外部 div 改为相对定位之后，后代中绝对定位的元素就会按照 top 和 left 属性的设定，相对于外部 div 定位。此时内部 div的 top 和 left 属性参照的就是外部 div。

最后我们说一下和定位相关的显示属性。

## 显示属性

所有的元素都有`display`属性。display 属性有两个最常用的值：`block（块级元素）`和`inline（行内元素）`。

* 块级元素：比如段落、标题、列表等，在浏览器中上下堆叠显示。
* 行内元素：比如 a、span、和 img，在浏览器中左右并排显示，只有前一行没有空间时才会显示对下一行。

块级元素和行内元素是可以互相转化的：

```css
/*默认为块级元素*/
p {display: inline;}
/*默认为行内元素*/
a {display: block;}
```

> display 还有一个属性值：`none`。把display设置为 none，该元素及所有包含在其中的元素，都不会在页面中显示。它们原来占据的空间也会被回收
> 相对的属性是 `visibility`，这个属性常用的值是 visible（默认）和 hidden。把元素的 visibility 设定为 hidden，元素会隐藏，但它占据的空间仍然存在。

我们上一篇 [CSS入门指南-2：盒子模型、浮动和清除](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752018&idx=1&sn=6915e4f11ba08fa196a64375224cd92e&chksm=80b0b878b7c7316e1a065ae991c534cc11ca5fe72b33690a98fb1c3f6f53f8c98c4c8744cd3a#rd) 中提到的 `clearfix` 类就用到了这个属性，在那里我们会添加一个块级元素，然后把内容隐藏，以用来清除浮动。clearfix 的样式如下：

```css
.clearfix:after {
     content: ".";
     display: block;
     height: 0;
     clear: both;
     visibility: hidden;
    }
```

## 参考链接

* [10步掌握CSS定位: position static relative absolute float](http://www.see-design.com.tw/i/css_position.html)
* [HTML和CSS高级指南之二——定位详解](https://www.w3cplus.com/css/advanced-html-css-lesson2-detailed-css-positioning.html)
------


最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
