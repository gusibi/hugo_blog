+++
date = "2016-04-11T22:07:09+08:00"
draft = true
title = "跟着代码学go 001 -- 变量&函数"
tags = ["golang"]
categories = ["Development"]
slug = "golang-learning-by-code-001"
description = "跟着代码学golang 变量 函数 基本数据结构"

+++

## 变量&函数

最近在学习golang，写下学习笔记提升记忆。
为了看起来不是那么枯燥，本学习笔记采用分析代码的形式。

首先搬出我们最经典的第一段代码:
### hello world

{{< highlight go >}}

package main // 0

import "fmt" // 1实现格式化的 I/O 

/* Print something */ // 2 
func main() { // 3
	fmt.Println("Hello, world; or καλημε ́ρα κóσμε; orこんにちは 世界") // 4
}

{{< /highlight >}}

0. 首行这个是必须的。所有的 Go 文件以 package <something> 开头,对于独立运行的执行文件必须是 package main;
1. 这是说需要将fmt加入到main。不是main 的包被称为库 末尾以 // 开头的内容是单行注释
2. 这也是注释，表示多行注释。 
3. package main 必须首先出现,紧跟着是 import。在 Go 中,package 总是首先出现, 然后是 import,然后是其他所有内容。当 Go 程序在执行的时候,首先调用的函数 是 main.main(),这是从 C 中继承而来。这里定义了这个函数
4. 调用了来自于 fmt 包的函数打印字符串到屏幕。字符串由 " 包裹,并且可以包含非 ASCII 的字符。这里使用了希腊文和日文、中文"

### 编译和运行代码

构建 Go 程序的最佳途径是使用 go 工具。 构建 helloworld 只需要:
{{< highlight shell >}}
1. go build helloworld.go
# 结果是叫做 helloworld 的可执行文件。
2. ./helloworld
# Hello, world; or καλημε ́ρα κóσμε; or こんにちは世界
{{< /highlight >}}

因此可以说golang中符合规范的函数一般写成如下的形式：

{{< highlight go >}}

func functionName(parameter_list) (return_value_list) {
   …
}

// parameter_list 是参数列表
// return_value_list 是返回值列表 下边有详细的讲解
{{< /highlight >}}


现在我们看一个复杂点的例子:

### fibonacci(递归版)

{{< highlight go >}}
01 package main 
02
03 import "fmt"
04
05 func main() {
06     result := 0
07     for i := 0; i <= 10; i++ {
08	     result = fibonacci(i)
09	     fmt.Printf("fibonacci(%d) is: %d\n", i, result)
10	  }
11 }
12
13 func fibonacci(n int) (res int) {
14     if n <= 1 {
15         res = 1
16 	   } else {
17 	       res = fibonacci(n-1) + fibonacci(n-2)
18 	   }
19 	return
20 }

// outputs

fibonacci(0) is: 1
fibonacci(1) is: 1
fibonacci(2) is: 2
fibonacci(3) is: 3
fibonacci(4) is: 5
fibonacci(5) is: 8
fibonacci(6) is: 13
fibonacci(7) is: 21
fibonacci(8) is: 34
fibonacci(9) is: 55
fibonacci(10) is: 89

{{< /highlight >}}

前5行就不再做描述，来看下第6行

* 第6行定义了一个变量result 默认值是0 golang编译器可以根据默认值0 推断出这是一个int型

#### 变量

Go 是静态类型语 ,不能在运 期改变变量类型。

使用关键字 var 定义变量, 自动初始化为零值。如果提供初始化值,可省略变量类型,由
编译器自动推断。

{{< highlight go >}}
var x int
var f float32 = 1.6
var s = "abc"
{{< /highlight >}}

在函数内部,可用更简略的 ":="  式定义变量。上边第6行的那种写法

可一次定义多个变量。

{{< highlight go >}}
var x, y, z int
var s, n = "abc", 123
var (
	a int
	b float32
)

func main() {
    n, s := 0x1234, "Hello, World!"
    println(x, s, n)
}
{{< /highlight >}}

一个特殊的变量名是 \_(下划线)。任何赋给它的值都被丢弃。在这个例子中,将 35 赋值给 b,同时丢弃 34。
{{< highlight go >}}
    _, b := 34, 35
{{< /highlight >}}

Go 的编译器对声明却未使用的变量在报错

{{< highlight go >}}
var s string // 全局变量没问题。

func main() {

    i := 0 // Error: i declared and not used。(可使  "_ = i" 规避)

}
{{< /highlight >}}

定义完之后的变量可以被重新赋值 比如第8行，将计算结果赋值给result

* for i := 0; i <= 10; i++ {} 第7行是一个循环结构 这里for 循环是一个控制流

#### 控制流
##### For

Golang For 支持三种循环方式,包括类 while 语法

{{< highlight go >}}
s := "abc"
for i, n := 0, len(s); i < n; i++ {
	// i, n 为定义的变量 只在for 循环内作用
    println(s[i])
}

n := len(s)
for n > 0 { // while n > 0
    println(s[n])
    n--
}

for { // while true
    println(s)
}

{{< /highlight >}}

##### IF

* 可省略条件表达式括号
* 支持初始化语句,可定义代码块局部变量
* 代码块左大括号必须在条件表达式尾部

{{< highlight go >}}
x := 0

// if x > 10  // Error: missing condition in if statement(左大括号必须在条件表达式尾部)
// {
// }

if n := "abc"; x > 0 {  // 初始化语句(在这里是定义变量)
	println(n[2])
} else if x < 0 {
	println(n[1])
} else {
	println(n[0])
}

{{< /highlight >}}

> 不支持三元操作符 "a > b ? a : b"

#### 其它控制流

* Range
* Switch
* Goto, Break, Continue

这个时候看下第13行 *函数的定义*

#### 函数定义

> 不支持 嵌套 (nested)、重载 (overload) 和 默认参数 (default parameter)

* 无需声明原型。
* 支持不定长变参。
* 支持多返回值。
* 支持命名返回参数。
* 支持匿名函数和闭包。

> 使用关键字 func 定义函数,左大括号依旧不能另起一行

{{< highlight go >}}
func test(x, y int, s string) (r int, s string) { // 类型相同的相邻参数可合并
    n := x + y                                    // 多返回值必须用括号。 
    return n, fmt.Sprintf(s, n)
}

// 第一行 关键字 func 用于定义一个函数
// 第一行 test 是你函数的名字
// 第一行 int类型的变量x,y 和string类型的变量s作为输入参数 参数用pass-by-value方式传递,意味着它们会被复制
// 第一行 变量 r 和 s 是这个函数的 命名返回值。在 Go 的函数中可以返回多个值
// 第一行 如果不想对返回的参数命名,只需要提供类型:(int, string)。 如果只有一个返回值,可以省略圆括号。如果函数是一个子过程,并且没有任何返回值,也可以省略这些内容
// 第二 三行 是函数体。注意 return 是一个语句,所以包裹参数的括号是可选的
{{< /highlight >}}

> 函数是第 类对象,可作为参数传递

就像其他在 Go 中的其他东西一样,函数也是值而已。它们可以像下面这样赋值给变量:

{{< highlight go >}}
func main() {
    a := func() {                  // 定义一个匿名函数,并且赋值给 a
		println("Hello")
	}                              // 这里没有 ()
    a()                            // 调用函数
}
{{< /highlight >}}

如果使用 fmt.Printf("\%T\n", a) 打印 a 的类型,输出结果是 func()

#### 返回值

Go 函数的返回值或者结果参数可以指定一个名字,并且像原始的变量那样使用,就像 输入参数那样。如果对其命名,在函数开始时,它们会用其类型的零值初始化

{{< highlight go >}}
func test() (i int){ // 初始化返回值为i 
	i = 1            // 因为i 已经初始化 可以直接赋值
    return           // 隐式的返回i
}
{{< /highlight >}}

返回结果也可以不指定名字
{{< highlight go >}}
func test() int{       
    i := 1            // 定义变量i 并赋默认值为1
    return i          // 返回i
}
{{< /highlight >}}


> 有返回值的函数,必须有明确的return 语句,否则会引发编译错误

### fibonacci(内存版)

{{< highlight go >}}
package main

import (
    "fmt"
    "time"
)

const LIM = 41

var fibs [LIM]uint64

func main() {
    var result uint64 = 0
    start := time.Now()
    for i := 0; i < LIM; i++ {
		result = fibonacci(i)
		fmt.Printf("fibonacci(%d) is: %d\n", i, result)
    }
    end := time.Now()
    delta := end.Sub(start)
    fmt.Printf("longCalculation took this amount of time: %s\n", delta)
}
func fibonacci(n int) (res uint64) {
    // memoization: check if fibonacci(n) is already known in array:
    if fibs[n] != 0 {
		res = fibs[n]
		return
    }
    if n <= 1 {
		res = 1
    } else {
		res = fibonacci(n-1) + fibonacci(n-2)
    }
    fibs[n] = res
    return
}
{{< /highlight >}}
