---
date: 2018-02-22T20:45:22+08:00
description: golang 学习笔记 变量 函数 基本数据结构
draft:  false
slug: golang-learing-note-1
tags: ["golang", "读书笔记"]
title: Golang 学习笔记-1：变量&函数
---

## 变量&函数

最近在学习golang，写下学习笔记提升记忆。
为了看起来不是那么枯燥，本学习笔记采用分析代码的形式。

首先搬出我们最经典的第一段代码:

### hello world

```go
    package main // 0

    import "fmt" // 1实现格式化的 I/O

    /* Print something */ // 2
    func main() { // 3
    	fmt.Println("Hello, world; or καλημε ́ρα κóσμε; orこんにちは 世界") // 4
    }
```

首先我们要认识到

> 每个Go 程序都是由包组成，程序的运行入口是包main

0. 首行这个是必须的。所有的 Go 文件以 package <something> 开头,对于独立运行的执行文件必须是 package main;
1. 这是说需要将fmt加入到main。不是main 的包被称为库 末尾以 // 开头的内容是单行注释 Package fmt包含有格式化I/O函数，类似于C语言的printf和scanf
2. 这也是注释，表示多行注释。
3. package main 必须首先出现,紧跟着是 import。在 Go 中,package 总是首先出现, 然后是 import,然后是其他所有内容。当 Go 程序在执行的时候,首先调用的函数 是 main.main(),这是从 C 中继承而来。这里定义了这个函数
4. 调用了来自于 fmt 包的函数打印字符串到屏幕。字符串由 " 包裹,并且可以包含非 ASCII 的字符。这里使用了希腊文和日文、中文"

### 编译和运行代码

构建 Go 程序的最佳途径是使用 go 工具。 构建 helloworld 只需要:

```
    1. go build helloworld.go
    # 结果是叫做 helloworld 的可执行文件。
    2. ./helloworld
    # Hello, world; or καλημε ́ρα κóσμε; or こんにちは世界
```


### 变量

Go 是静态类型语言，不能在运行期改变变量类型。

变量如果不提供初始化值将自动初始化为零值。如果提供初始化值，可省略变量类型，由编译器自动推断。

```go
    var x int
    // 使用关键字 var 定义变量, 跟函数的参数列表一样，类型在后面。
    var c, python, java bool
    // 多个相同类型的变量可以写在一行。
    var f float32 = 1.6
    var i, j int = 1, 2
    // 变量定义可以包含初始值，每个变量对应一个。
    var s = "abc"
    // 如果初始化是使用表达式，则可以省略类型；变量从初始值中获得类型。
```

变量在定义时没有明确的初始化时会赋值为*零值* 。

零值是：

* 数值类型为 0 ，
* 布尔类型为 false ，
* 字符串为 "" （空字符串）。

在函数内部,可用更简略的 ":="  式定义变量。

```go
    func main() {
        n, s := 12, "Hello, World!"
        println(s, n)
    }
```

> 函数外的每个语句都必须以关键字开始（ var 、 func 、等等）， := 结构不能使用在函数外。

可一次定义多个变量。

```go
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
```

一个特殊的变量名是 \_(下划线)。任何赋给它的值都被丢弃。在这个例子中,将 35 赋值给 b,同时丢弃 34。

```go
    _, b := 34, 35
```

Go 的编译器会对声明却未使用的变量报错

```go
    var s string // 全局变量没问题。

    func main() {
        i := 0 // Error: i declared and not used。(可使  "_ = i" 规避)
    }
```

定义完之后的变量可以被重新赋值 比如第8行，将计算结果赋值给result。

### 常量

> 常量值必须是编译期可确定的数字、字符串、布尔值。

常量的定义与变量类似，只不过使用 const 关键字

```go
    const x, y int = 1, 2
    const s = "Hello, World!"
    // 多常量初始化 // 类型推断
    // 常量组
    const (
    	a, b = 10, 100
    	c bool = false
    )

    func main() _{
    	const x = 'xxx'      // 未使用局部常量不会引发编译错误
    }
```

在常量中，如果不提供类型和初始化值，那么被看作和上一常量相同

```go
    const (
		s = "abc"
		x           // x = "abc"
	)
```

#### 变量值的引用

通常情况下 go 语言的`变量持有相应的值`。
对于`通道`、`函数`、`方法`、`映射`以及`切片`的引用变量，它们持有的都是`引用`，也既是`保存指针的变量`。

**值在传递给函数或者方法的时候会被复制一次**

不同类型参数所占空间如下：

|类型        | 占用空间   | 
|:-------   |:-----  |
|bool       |类型占1~8个字节
|传递字符串   |占 16个字节（64位）或者8个字节（32位）
|传递切片     |占 16个字节（64位）或者12个字节（32位）
|传递指针     |占 8个字节（64位）或者4个字节（32位）

> `数组`是按值传递的，所以传递大数组代价较大 可用切片代替

`变量是赋给内存块的名字，该内存块用于保存特定的数据类型`。

`指针是指保存了另一个变量内存地址的变量`。创建的指针用来指向另一个某种类型的变量。
为了便于理解，我们看以下两段代码。

```go
x := 3    y := 22
// 变量 x, y 为int型 分别赋值 3   22  内存地址 0xf840000148   0xf840000150
x == 3  &&  y == 22
```

```go
pi := &x

// 变量pi 为 *int(指向int型变量的指针)   在这里我们将变量x的内存地址赋值给pi，即pi 保存了另一个变量的内存地址（这也是指针定义）

pi == 3 && x == 3 && y == 22  
x++

// x + 1 此时 x==4 pi 指向x的内存地址 所以

pi == 4 && x == 4 && y == 22

*pi++

// *pi ++ 意为着pi指向的值增加
*pi == 5 & x == 5 && y == 22

pi := &y

//pi 指向y的内存地址
*pi == 22 && x == 5 && y == 22

*pi++

// *pi++ 意为着pi指向的值增加

*pi == 23 && x == 5 && y == 23
```

### 基本类型

Go 有明确的数字类型命名, 支持 Unicode, 支持常用数据结构

|类型          | 长度   | 默认值| 说明|
|:-------      |:-----  | :---- | :----   |
|bool          | 1      | false |
|byte          | 1      | 0     | unit8
|rune          | 4      | 0     | int32 的别名 代表一个Unicode 码
|int, unit     | 4 或 8 | 0     | 32 或 64
|int8, unit8   | 1      | 0     | -128 ~ 127, 0~255
|int16, unit16 | 2      | 0     | -32768 ~ 32767, 0 ~ 65535
|int32, unit32 | 4      | 0     | -21亿~ 21亿, 0 ~ 42亿
|int64, unit64 | 8      | 0     |
|float32       | 4      | 0.0   |
|float64       | 8      | 0.0   |
|complex64     | 8      |       |
|complex128    | 16     |       |
|unitptr       | 4或8   |       | 足以存储指针的unit32 或unit64 整数
|array         |        |       | 值类型
|struct        |        |       | 值类型
|string        |        | ""    | UTF-8 字符串
|slice         |        | nil   | 引用类型
|map           |        | nil   | 引用类型
|channel       |        | nil   | 引用类型
|interface     |        | nil   | 接口
|function      |        | nil   | 函数

> `int`，`uint` 和 `uintptr` 类型在32位的系统上一般是32位，而在64位系统上是64位。当你需要使用一个整数类型时，你应该首选 `int`，仅当有特别的理由才使用定长整数类型或者无符号整数类型。
> 引用类型包括 `slice`、`map` 和 `channel`。它们有复杂的内部结构,除了申请内存外,还需要初始化相关属性

### 类型转换

**go `不支持` 隐式的类型转换**

> 使用表达式 T(v) 将值 v 转换为类型 T 。

```go
var b byte = 100
// var n int = b // Error: cannot use b (type byte) as type int in assignment
var n int = int(b) // 显式转换

```

**不能将其他类型当 bool 值使用**

```go
a := 100
if a {                  // Error: non-bool a (type int) used as if condition
    println("true")
}
```

### 函数

首先看下面这段代码

```go
    package main

    import "fmt"

    func add(x int, y int) int {
    	return x + y
    }

    func main() {
    	fmt.Println(add(42, 13))
    }
```

#### 函数定义

> 使用关键字 func 定义函数,左大括号不能另起一行

golang中符合规范的函数一般写成如下的形式：

```go
    func functionName(parameter_list) (return_value_list) {
       …
    }

    // parameter_list 是参数列表
    // return_value_list 是返回值列表 下边有详细的讲解
```

#### 函数的特性

* 无需声明原型。 (1)
* 支持不定长变参。
* 支持多返回值。
* 支持命名返回参数。
* 支持匿名函数和闭包。
* 不支持 嵌套 (nested)、重载 (overload) 和 默认参数 (default parameter)

```go
    func test(x int, y int, s string) (r int, s string) { // 类型相同的相邻参数可合并
        n := x + y                                    // 多返回值必须用括号。
        return n, fmt.Sprintf(s, n)
    }
```

> 关键字 `func` 用于定义一个函数
> `test` 是你函数的名字
> int 类型的变量 x, y 和 string 类型的变量 s 作为`输入参数`参数用`pass-by-value`方式传递,意味着它们会被复制
> 当`两个或多个连续的函数命名参数是同一类型`，则除了最后一个类型之外，其他都可以省略。

在这个例子中：
```go
x int, y int
```
被缩写为
```go
x, y int
```

`变量` r 和 s 是这个函数的`命名返回值`。在 Go 的函数中可以返回多个值。
如果不想对返回的参数命名,只需要提供类型:(int, string)。 如果`只有一个返回值`，可以省略圆括号。如果函数是一个子过程,并且没有任何返回值,也可以省略这些内容。
函数体。注意 return 是一个语句,所以包裹参数的括号是可选的。
不定长参数其实就是slice，只能有一个，且必须是最后一个。

```go
    func test(s string, n ...int) string {
        var x int
    		for _, i := range n {
    			 x += i
    		}
    	return fmt.Sprintf(s, x)
    }
    // 使用slice 做变参时，必须展开
    func main() {
        s := []int{1, 2, 3}
        println(test("sum: %d", s...))
    }
```

> 函数是第一类对象,可作为参数传递

就像其他在 Go 中的其他东西一样,函数也是值而已。它们可以像下面这样赋值给变量:

```go
    func main() {
        a := func() {                  // 定义一个匿名函数,并且赋值给 a
    		println("Hello")
    	}                              // 这里没有 ()
        a()                            // 调用函数
    }
```

如果使用 fmt.Printf("\%T\n", a) 打印 a 的类型,输出结果是 func()

#### 返回值

函数可以返回任意数量返回值

Go 函数的返回值或者结果参数可以指定一个名字,并且像原始的变量那样使用,就像 输入参数那样。如果对其命名,在函数开始时,它们会用其类型的零值初始化

```go
    package main

    import "fmt"

    func swap(x, y string) (string, string) {
    	return y, x
    }

    func main() {
    	a, b := swap("hello", "world")
    	fmt.Println(a, b)
    }

    /*
       函数可以返回任意数量返回值
       swap 函数返回了两个字符串
    */

```

Go 的返回值可以被命名，并且就像在函数体开头声明的变量那样使用。

```go
    package main

    import "fmt"

    func split(sum int) (x, y int) { // 初始化返回值为 x,y
    	x = sum * 4 / 9              // x,y 已经初始化，可以直接赋值使用
    	y = sum - x
    	return                       // 隐式返回x,y(裸返回)
    }

    func main() {
    	fmt.Println(split(17))
    }

    /*
       在长的函数中这样的裸返回会影响代码的可读性。
    */
```

> 有返回值的函数,必须有明确的return 语句,否则会引发编译错误

### 名词解释

函数原型

> `函数声明`由函数返回类型、函数名和形参列表组成。形参列表必须包括形参类型,但是不必对形参命名。这三个元素被称为函数原型,函数原型描述了函数的接口
`函数原型`类似函数定义时的函数头，又称函数声明。为了能使函数在定义之前就能被调用，C++规定可以先说明函数原型，然后就可以调用函数。函数定义可放在程序后面。 由于函数原型是一条语句，因此函数原型必须以分号结束。函数原型由函数返回类型、函数名和参数表组成，它与函数定义的返回类型、函数名和参数表必须一致。函数原型必须包含参数的标识符（对函数声明而言是可选的）
注意：`函数原型与函数定义`必须一致，否则会引起连接错误。

## 下节预告

变量和函数部分暂时这些，有更新还会补充。下一篇将会是控制流。
将会用到的代码为:

```go
    package main

    import "fmt"

    func main() {
        result := 0
        for i := 0; i <= 10; i++ {
          result = fibonacci(i)
          fmt.Printf("fibonacci(%d) is: %d\n", i, result)
       }
    }

    func fibonacci(n int) (res int) {
        if n <= 1 {
            res = 1
    	   } else {
    	       res = fibonacci(n-1) + fibonacci(n-2)
    	   }
    	return
    }
```

## 参考链接

* [Go 指南](https://tour.go-zh.org/basics/4)
* [The way to go -- 变量](https://github.com/Unknwon/the-way-to-go_ZH_CN/blob/master/eBook/04.4.md)
* [Effective Go](https://golang.org/doc/effective_go.html)

------

**最后，感谢女朋友支持和包容，比❤️**

想了解以下内容可以在公号输入相应关键字获取历史文章： `公号&小程序` | `设计模式` | `并发&协程`

![欢迎赞赏关注](http://media.gusibi.mobi/W_z-w16GQEiCp9Vo3DDrtC-9e8kceGKtJsNSNdF1rfvTGGUMdTup0IK0xkrSR9S0)
