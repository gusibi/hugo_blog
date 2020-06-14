---
categories: ["development", "web", "读书笔记", "前端"]
date: 2017-08-10T22:36:53+08:00
description: description
draft: true
permalink: /post/css-learing-4-page-layout
tags: ["css", "读书笔记", "html", "tutorial", "前端"]
title: "CSS入门指南-4：页面布局"
---

> 这是《CSS设计指南》的读书笔记，用于加深学习效果。

## display 属性

`display`是 CSS 中最重要的用于控制布局的属性。每个元素都有一个默认的 display 值。对于大多数元素它们的默认值通常是 block 或 inline 。一个 block 元素通常被叫做块级元素。一个 inline 元素通常被叫做行内元素。

#### block

`div` 是一个标准的块级元素。一个块级元素会新开始一行并且尽可能撑满容器。其他常用的块级元素包括 `p` 、 `form` 和HTML5中的新元素： `header` 、 `footer` 、 `section` 等等。

#### inline

`img` 是一个标准的行内元素。你可以把两个 `<img>` 标签写在两行，但这并不影响图片再浏览器中的显示效果，它们会并列出现在一行上。而且标签直接的空白（标记中的两个<img>标签虽然分别位于两行，但这并不影响图片在浏览器中显示时的效果。图片是行内元素，所以它们显示的时候就会并列出现在一行上。而且，标签之间的空白（包括制表、回车和空格）都会被浏览器忽略。

`a` 元素是最常用的行内元素，它可以被用作链接。

#### none

另一个常用的 display 值是 none。一些特殊元素的默认 display 值是它，例如`script`。display:none 通常被 JavaScript 用来在不删除元素的情况下隐藏或显示元素。
把display设置为 none，该元素及所有包含在其中的元素，都不会在页面中显示。它们原来占据的空间也会被回收。

> 相对的属性是 `visibility`，这个属性常用的值是 visible（默认）和 hidden。把元素的 visibility 设定为 hidden，元素会隐藏，但它占据的空间仍然存在。

#### 其他 display 值

还有很多的更有意思的 display 值，几乎所有HTML元素的display属性值要么为block，要么为inline。最明显的一个例外是table元素，它有自己特殊的display属性值。[这里有一份详细的列表](https://developer.mozilla.org/en-US/docs/Web/CSS/display)。

块级元素（比如标题和段落）会相互堆叠在一起沿页面向下排列，每个元素分别占一行。而行内元素（比如链接和图片）则会相互并列，只有在空间不足以并列的情况下才会折到下一行显示 。

块级元素和行内元素是可以互相转化的：

```css
/*默认为块级元素*/
p {display: inline;}
/*默认为行内元素*/
a {display: block;}
```

属性了 display 属性之后，我们来看下页面布局：

## 布局的基本概念

多栏布局有三种基本的实现方案：`固定宽度`、`流动`、 `弹性`。

* 固定宽度布局的大小不会随用户调整浏览器窗口大小而变化，一般是900到1100像素宽。其中960像素是最常见的，因为这个宽度适合所有现代显示器，而且能够被16、12、10、8、6、5、4和3整除，不仅容易计算等宽分栏的数量，而且计算结果也能得到没有小数的像素数。 

* 流动布局的大小会随用户调整浏览器窗口大小而变化。这种布局能够更好地适应大屏幕，但同时也意味着放弃对页面某些方面的控制，比如随着页面宽度变化，文本行的长度和页面元素之间的位置关系都可能变化。Amazon.com的页面采用的就是流动中栏布局，在各栏宽度加大时通过为内容元素周围添加空白来保持内容居中，而且现在的导航条会在布局变窄到某个宽度时收缩进一个下拉菜单中，从而为内容腾出空间。

* 弹性布局与流动布局类似，在浏览器窗口变宽时，不仅布局变宽，而且所有内容元素的大小也会变化，让人产生一种所有东西都变大了的感觉。

### 布局的高度

多数情况下，布局中结构化元素（乃至任何元素）的高度是不必设定的。事实上，我甚至想告诉你根本不应该给元素设定高度。除非你确实需要这样做，比如在页面中创造一个绝对定位的元素。

> 为什么正常情况下都应该保持元素height属性的默认值auto不变呢？很简单，只有这样元素才能随自己包含内容的增加而在垂直方向上扩展。这样扩展的元素会把下方的元素向下推，而布局也能随着内容数量的增减而垂直伸缩。假如你明确设定了元素的高度，那么超出的内容要么被剪掉，要么会跑到容器之外——取决于元素overflow属性的设定。

### 布局的宽度

与高度不同，我们需要更精细地控制布局宽度，以便随着浏览器窗口宽度的合理变化，布局能够作出适当的调整，确保文本行不会过长或过短。如果随意给元素添加内边距、边框，或者元素本身过大，导致浮动元素的宽度超过包含元素的布局宽度，那浮动元素就可能“躲”到其他元素下方。应该让这些内容元素自动扩展到填满栏的宽度。(这是块级元素的默认行为)

## 三栏-固定宽度布局

我们先从一个简单的居中的单栏布局开始吧。看下面 HTML 代码，主要标记的 ID 是 wrapper：

```html
<div id="wrapper">
	<article>
        <h1>Single-Column Layout</h1>
        <p>这是第一段</p>
        <h2>This is a Second-Level Heading</h2>
        <p>这是第二段</p>
    </article>
</div>
```
布局相关 css 如下：

```css
#wrapper {
	width:960px; margin:0 auto; border:1px solid;
}
article {
	background:#ffed53;	
}
```

![效果图](http://media.gusibi.mobi/ehJIyepJP3ARTLkMYIDfndpryupJA8PrXFP1MlcUdPiDuX0gfMZo8r15dRn35M9l)

> 如图所示，通过给外包装设定宽度值，并将其水平外边距设定为 auto，这个单栏布局在页面上居中了。随着向里添加内容，这一栏的高度会相应增加。外包装中的article元素本质上就是一个没有宽度的块级盒子（关于“没有宽度的盒子”，请参见3.2节），它水平扩展填满了外包装。

下面，我们再向外包装里添加一个导航元素，让它作为第二栏。

HTML 代码如下：

```html
<div id="wrapper">
	<nav>
        <ul>
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
            <li><a href="#">Link 3</a></li>
        </ul>
    </nav>
    <article>
        <h1>Single-Column Layout</h1>
        <p>这是第一段</p>
        <h2>This is a Second-Level Heading</h2>
        <p>这是第二段.</p>
    </article>
</div>
```

这里我们将两栏都添加`float: left`，以让它们并排显示。

```css
#wrapper {
	width:960px; 
	margin:0 auto; 
	border:1px solid; 
	overflow:hidden;
}
nav {
	width:150px;
	float:left; /*浮动*/
	background:#dcd9c0;
	}
nav li {
    /*去掉列表项目符号*/
	list-style-type:none;
	}
article {
	width:810px;
	float:left; /*浮动*/
	background:#ffed53;	
	}
```
![效果图](http://media.gusibi.mobi/FJAogkzMENomRRtTqAobo1o3EiGsSSMBjhdz-4NZc2NOP0vaEjUF6br4TeZvH943)
> 这里我们把两栏的总宽度设定为外包装的宽度（150+810=960），并浮动它们，就可以创造出并肩排列的两栏来。每一栏的长度取决于内容多少。

接下来我们添加第三栏。

```html
<div id="wrapper">
	<nav>
        <ul>
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
            <li><a href="#">Link 3</a></li>
        </ul>
    </nav>
    <article>
        <h1>Single-Column Layout</h1>
        <p>这是第一段</p>
        <h2>This is a Second-Level Heading</h2>
        <p>这是第二段.</p>
    </article>
    <aside>
        <h3>This is the Sidebar</h3>
        <p>这是侧边栏.</p>
    </aside>
</div>
```
接下来我们调整一下 article 这一栏的宽度，为第三栏腾出空间

```css
#wrapper {
	width:960px; margin:0 auto; border:1px solid; overflow:hidden;
}
nav {
	width:150px;
	float:left;
	background:#dcd9c0;
}
article {
	width:600px;
	float:left;
	background:#ffed53;	
}
aside {
	width:210px;
	float:left;
	background:#3f7ccf;
}
```

![三栏的示意图](http://media.gusibi.mobi/ih7NWCcRAtvH4fHkIJ26zbdTl0K378Ew4oKFbVu1y8TCUrQsqvFFruceGWPdPoaP)

> 如图所示，通过把三个浮动容器的总宽度设定为恰好等于外包装的宽度（150+600+210=960），就有了三栏布局的框架。

现在我们再添加一个页眉和页脚：

```html
<div id="wrapper">
	<header>
		<h1>A Fixed-Width Layout</h1>
	</header>
	<nav>
        <ul>
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
            <li><a href="#">Link 3</a></li>
        </ul>
    </nav>
    <article>
        <h1>Single-Column Layout</h1>
        <p>这是第一段</p>
        <h2>This is a Second-Level Heading</h2>
        <p>这是第二段.</p>
    </article>
    <aside>
        <h3>This is the Sidebar</h3>
        <p>这是侧边栏.</p>
    </aside>
   	<footer>
        <p>This is the footer. Phasellus pretium gravida interdum. Nam interdum posuere tempus. Ut commodo laoreet dolor, non hendrerit mi dictum vitae. Nam nec egestas libero.</p>
    </footer>
</div>
```
为了让页脚在最下一栏不浮动到 `aside` 后边，我们为页脚应用`clear:both`，以组织它向上移动。
css 样式如下：

```css
* {margin:0; padding:0;} 
#wrapper {
    width:960px;
    margin:0 auto;
    border:1px solid;
} 
header {
    background:#f00;
} 
nav {
    width:150px;
    float:left;
    background:#dcd9c0;
} 
nav li {
    list-style-type:none;
} 
article {
    width:600px;
    float:left;
    background:#ffed53;
}
aside {
    width:210px;
    float:left;
    background:#3f7ccf;
} 
footer {
    clear:both;
    background:#000;
}
```
现在效果如图：
![三栏+页眉+页脚的效果图](http://media.gusibi.mobi/qGmwPd79PzMw_N-UcZFSj8teXyQ11LnBN_r5aeExPp44vtBtZ4YGYRNor_Pp2bfq)

现在各栏太拥挤，每栏的高度也都由文本内容决定，我们现在修改一下，为内容间加上空白。

### 为栏设定内边距和边距

为了让内容与栏边界空开距离，为栏添加水平外边距和内边距，但这样会导致布局宽度增大，进而浮动栏下滑。
比如，我们给 article 增加内边距：

```css
article {
    width: 600px;
    float: left;
    background: #ffed53;
    padding: 10px 20px;
}
```
效果如图：

![article 增加内边距后的效果图](http://media.gusibi.mobi/rjwewoLYNvkPSRnwJYZJTCUqZLYpsDr6P1oFgWe0X3fdQDdApeNcrKvb07jQw4AR)

由于增加了内边距导致`article`的总宽度增加，导致右边的栏不能再与前两排并列在一起。有三种方法来预防改问题发生：

* 从设定的元素宽度中减去添加的水平外边距、边框和内边距的宽度和。 
* 在容器内部的元素上添加内边距或外边距。 
* 使用CSS3的box-sizing属性切换盒子缩放方式，比如section {box-sizing:border-box;} 。 应用box-sizing属性后，给section添加边框和内边距都不会增大盒子，相反会导致内容变窄。

### 重设宽度以抵消内边距和边框

一个代代相传的解决方案是通过数学计算。CSS开发者需要用比他们实际想要的宽度小一点的宽度，需要减去内边距和边框的宽度。`比如我们给600像素宽的中间栏增加了20像素的内边距，为了抵消增加的内边距，可以把栏减少40像素而设定为560像素。`值得庆幸地是你不需要再这么做了...

### 给容器内部元素应用内边距和边框

把外边距和内边距应用到内容元素上确实有效，不过这样的前提是这些元素没有明确的设定宽度，这样内容才会随内外边距的增加而缩小。
与其为容器中的元素添加外边距，不如在栏中再添加一个没有宽度的div，让它包含所有内容元素，然后再给这个div应用边框和内边距。如此一来，只要为内部div设定一次样式，就可以把让所有内容元素与栏边界保持一致的距离。而且，将来再需要调整时也会很方便。任何新增内容元素的宽度都由这个内部div决定。

下面我们用这种方法修复上面第三栏浮动到下边的问题。

```html
<article>
    <div class="inner">
    <!-- 这里是各种内容 -->
    </div>
</article>
```

接下来，我们不仅要给内部 div 应用内边距，还要给她应用外边距和边框。

```css
/*更新 css*/
article {
	width:600px;
	float:left;
	background:#ffed53;
}
article .inner {
	margin:10px; 
	border:2px solid red;
	padding:20px; 
}
```

效果如图：
![给容器内部元素应用内边距和边框的示例图](http://media.gusibi.mobi/rQINy0ZYV9tT-nU7LJPlfY-RqwcDLA7n5PdZzdEEa-eGPz43J0G40nnLbbYvycAa)

以上措施使布局有了明显改观。就这么简单的几下，布局就显得更专业了。处理栏及其内部div的关键在于，浮动栏并设定栏宽，但不给任何内容元素设定宽度。要让内容元素扩展以填充它们的父元素——内部div。这样，只要简单地设定内部div的外边距和内边距，就可以让它们以及它们包含的内容与栏边界保持一定距离。

### 使用 box-sizing:border-box

人们慢慢的意识到传统的盒子模型不直接，所以他们新增了一个叫做 box-sizing 的CSS属性。当你设置一个元素为 box-sizing: border-box; 时，此元素的内边距和边框不再会增加它的宽度。这里有一个与前一页相同的例子，唯一的区别是两个元素都设置了 box-sizing: border-box; 

```css
nav {
	-webkit-box-sizing:border-box;
    -moz-box-sizing:border-box;
	box-sizing:border-box;
	width:150px;
	float:left;
	background:#dcd9c0;
	padding:10px 10px;
	}
article {
	-webkit-box-sizing:border-box;
    -moz-box-sizing:border-box;
	box-sizing:border-box;
	width:600px;
	float:left;
	background:#ffed53;	
	padding:10px 20px;
}
aside {
    -webkit-box-sizing:border-box;
    -moz-box-sizing:border-box;
	box-sizing:border-box;
	width:210px;
	float:left;
	background:#3f7ccf;
	padding:10px 10px;
}
```

![使用 box-sizing: border-box; 的效果图](http://media.gusibi.mobi/W72nR0pZ9isuBunBOxwMX5O1fnacmxEZdNSTQkT0uDPm_87znZleYhehw83kslGH)

这是目前为止最好的解决方法了，那最简单有效的方法就是在 css 里添加这样一条规则：

```css
* {
    -webkit-box-sizing:border-box;
    -moz-box-sizing:border-box;
    box-sizing:border-box;        
    }
```
## 三栏-中栏流动布局

中栏流动布局的目的是在屏幕变窄时，中栏变窄，左栏和右栏宽度不变。
这里我们使用`负外边距`实现。

### 用负外边距实现

实现三栏布局且让中栏内容区流动（不固定）的核心问题是处理右栏的定位，并在中栏内容区大小改变时控制右栏与布局的关系。

这里我们使用`Ryan Brill`给出的控制两个外包装容器的外边距的解决方案。其中一个外包装包围三栏，另一个外保障包围左栏和中栏。

html代码示例如下：
```html
<div id="main_wrapper">
    <header>
        <!-- 页眉-->
    </header>
    <div id="threecolwrap">/*三栏外包装（包围全部三栏）*/
        <div id="twocolwrap">/*两栏外包装（包围左栏和中栏）*/ /*左栏*/
            <nav>
                <!-- 导航 -->
            </nav> /*中栏*/
            <article>
                <!-- 区块 -->
            </article>
        </div>/*结束两栏外包装（twocolwrap）*/ /*右栏*/
        <aside>
            <!-- 侧栏 -->
        </aside>
    </div>/*结束三栏外包装（threecolwrap）*/
    <footer>
        <!-- 页脚 -->
    </footer>
</div> 
```
css规则如下：

```css
* {
    margin: 0;
    padding: 0;
}

body {
    font: 1em helvetica, arial, sans-serif;
}

div#main_wrapper {
    min-width: 600px;
    max-width: 1100px;
    /*超过最大宽度时，居中布局*/
    margin: 0 auto;
    /*背景图片默认从左上角开始拼接*/
    background: url(images/bg_tile_150pxw.png) repeat-y #eee;
}

header {
    padding: 5px 10px;
    background: #3f7ccf;
}

div#threecolwrap {
    /*浮动强制它包围浮动的栏*/
    float: left;
    width: 100%;
    /*背景图片右对齐*/
    background: url(images/bg_tile_210pxw.png) top right repeat-y;
}

div#twocolwrap {
    /*浮动强制它包围浮动的栏*/
    float: left;
    width: 100%;
    /*把右栏拉到区块外边距腾出的位置上*/
    margin-right: -210px;
}

nav {
    float: left;
    width: 150px;
    background: #f00;
    padding: 20px 0;
}

/*让子元素与栏边界保持一定距离*/

nav>* {
    margin: 0 10px;
}

article {
    width: auto;
    margin-left: 150px;
    /*在流动居中的栏右侧腾出空间*/
    margin-right: 210px;
    background: #eee;
    padding: 20px 0;
}

/*让子元素与栏边界保持一定距离*/ 
article>* {
    margin: 0 20px;
}

aside {
    float: left;
    width: 210px;
    background: #ffed53;
    padding: 20px 0;
}

/*让子元素与栏边界保持一定距离*/ 
aside>* {
    margin: 0 10px;
}

footer {
    clear: both;
    width: 100%;
    text-align: center;
    background: #000;
}
```
![宽屏效果](http://media.gusibi.mobi/DMdD7nQ_BMk1Q8tQMwYgnu6BJDVM_BZMRx5C1sUUVj1AtFFb5EkD9aEshr-qDEhb)
![窄屏效果](http://media.gusibi.mobi/9S7ij-86f1AF6eV7jOziitveLNrUpbO_untKwE4uofOXyvE5UrVvxY_1DEnVzp50)

> `基本原理：`上面两幅图展示了流动中栏布局。三栏中的右栏是210像素宽。为了给右栏腾出空间，中栏article元素有一个210像素的右外边距。包围左栏和中栏的两栏外包装上210像素的负右外边距，会把右栏拉回article元素右外边距（在两栏外包装内部右侧）创造的空间内。中栏aticle元素的宽度是auto，因此它仍然会力求占据浮动左栏剩余的所有空间。可是，一方面它自己的右外边距在两栏外包装内为右栏腾出了空间，另一方面两栏外包装的负右外边距又把右栏拉到了该空间内。

### 百分比宽度

上面的例子中，我们用到了`百分比宽度`，百分比是一种相对于包含块的计量单位。你还能同时使用 min-width 和 max-width 来限制最大或最小宽度！

你可以用百分比做布局，但是这需要更多的工作。如果我们上边的例子中 nav 用百分比宽度做布局，当窗口宽度很窄时 nav 的内容会以一种不太友好的方式被包裹起来。

## inline-block 布局

上面的例子我们实现多栏并列的方式是使用`float`，不过我们也可以使用`inline-block`。下边是我们把 float 替换为`inline-block` 的例子。

```css
nav {
	width:150px;
    display: inline-block;
    vertical-align: top;
	background:#dcd9c0;
	}
article {
    word-spacing:0;
	width:600px;
    display: inline-block;
    vertical-align: top;
	background:#ffed53;	
	}
aside {
    word-spacing:0;
	width:210px;
    display: inline-block;
    vertical-align: top;
	background:#3f7ccf;
	}
```

使用`inline-block`，有一些事情需要你牢记：
* vertical-align 属性会影响到 inline-block 元素，你可能会把它的值设置为 top 。
* 你需要设置每一列的宽度
* 如果HTML源代码中元素之间有空格，那么列与列之间会产生空隙

特别是第三条，如果我们不做任何修改，两个 block 之间会存在空格，像这样：

![列与列之间有空格](http://media.gusibi.mobi/8uHhpJiVoVCzg007mXBb2vHjceIB8Ja4Irws_AvxpE07QhjH360KZhiFniFMpmzr)

因为列与列之间产生了空格，所以 aside 跑到了下边。这里最简单的解决办法是：

```html
<nav>
导航
</nav><article>
内容
</article><aside>
第三栏
</aside>
```

其他解决方案可以参考这篇文章 [Fighting the Space Between Inline Block Elements](https://css-tricks.com/fighting-the-space-between-inline-block-elements/)

## 其他布局方式

初次之外，css 还提供了 `column`、`flexbox`等布局方式，这些以后有机会再介绍吧。

## 总结

这篇文章我们介绍了用浮动的有宽度的元素来创建多栏布局、如何让固定布局在页面上居中以及让它们在一定范围内可以伸缩。同时也了解了如何使用内部div在浮动元素中生成间距，而又不会改变布局的总宽度。

## 参考链接
* [CSS入门指南-2：盒子模型、浮动和清除](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752018&idx=1&sn=6915e4f11ba08fa196a64375224cd92e&chksm=80b0b878b7c7316e1a065ae991c534cc11ca5fe72b33690a98fb1c3f6f53f8c98c4c8744cd3a#rd)
* [CSS入门指南-3：定位元素](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752022&idx=1&sn=a37d1ec3bab1d8188ae6ae45b1b1a211&chksm=80b0b87cb7c7316ac3dcf29669d83f84300f1d85f8262848519ab1a37d754846b8eb482be436#rd)
* [学习CSS布局](http://zh.learnlayout.com)
* [Fighting the Space Between Inline Block Elements](https://css-tricks.com/fighting-the-space-between-inline-block-elements/)
* [Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)