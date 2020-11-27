---
title: 'Golang 学习笔记-2：控制流'
date: 2018-04-17 15:49:35
tags: [golang,读书笔记]
published: true
hideInList: false
feature: 
isTop: false
---

> 上一篇我们了解了golang 的变量、函数和基本类型，这一篇将介绍一下控制流

现在我们看一个复杂点的例子:

### fibonacci(递归版)

``` go
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
```


* for i := 0; i <= 10; i++ {} 第7行是一个循环结构 这里for 循环是一个控制流

## 控制流
### For

Go 只有一种循环接口-- `for 循环`

For 支持三种循环方式,包括类 while 语法

#### 1 基本for循环 支持初始化语句
``` go
s := "abc"
for i, n := 0, len(s); i < n; i++ {
	// i, n 为定义的变量 只在for 循环内作用
    println(s[i])
}
```

*基本的 for 循环包含三个由分号分开的组成部分：*

* 初始化语句：在第一次循环执行前被执行
* 循环条件表达式：每轮迭代开始前被求值
* 后置语句：每轮迭代后被执行

#### 2 替代 while (n > 0) {}

C 的 while 在 Go 中叫做 for

``` go
n := len(s)
// 循环初始化语句和后置语句都是可选的。
for n > 0 { // 等同于 for (; n > 0;) {}
    println(s[n])
    n--
}
```

#### 3 死循环
```go
    for { // while true
        println(s)
    }
```

### IF…ELSE

> 就像 for 循环一样，Go 的 if 语句也不要求用 ( ) 将条件括起来，同时， { } 还是必须有的

* 条件表达式必须是布尔类型，可省略条件表达式括号
* 支持初始化语句,可定义代码块局部变量
* 代码块左大括号必须在条件表达式尾部

```go
x := 0

// if x > 10  // Error: missing condition in if statement(左大括号必须在条件表达式尾部)
// {
// }

if x > 10{
    ...
}else{
    ...
}

if n := "abc"; x > 0 {  // 初始化语句(在这里是定义变量)
	println(n[2])
} else if x < 0 {
	println(n[1])
} else {
    println(n[0])     // 局部变量 n 有效范围是 整个 if/else 块
}
```

> if 语句定义的变量作用域仅在if范围之内(包含else语句)
> 不支持三元操作符 "a > b ? a : b"

以上是上段代码出现的两个控制流，剩下的控制流还有

* Switch
* Range
* Goto, Break, Continue, defer

### Switch

switch 语句用于选择执行，语法如下：

```go
    switch optionalStatement; optionalExpression{
		case expressionList1: block1
		...
		case expressionListN: blockN
		default: blockD
	}
```

先看一个例子:

```go
package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Print("Go runs on ")
	switch os := runtime.GOOS; os { // 将 os 与 case 条件匹配
	case "darwin":
		fmt.Println("OS X.")
	case "linux":
		fmt.Println("Linux.")
	case "plan9", "openbsd": // 多个条件命中其一即可(OR)
		fmt.Println("plan9 | openbsd")
	default:
		// freebsd, openbsd,
		// plan9, windows...
		fmt.Printf("%s.", os)
	}
}

```

* 如果有可选语句声明, 分号是必要的, 无论后边的可选表达式语句是否出现(如果可选语句没有出现默认为true)
* 每一个case 语句必须要有一个表达式列表，多个用分号隔开
* switch 语句自上而下执行，当匹配成功后执行case分支的代码块，执行结束后退出switch
```go
switch i {
case 0: // 空分支，只有当 i == 0 时才会进入分支 相当于 "case 0: break;"
case 1:
    f() // 当 i == 0 时函数不会被调用
}
```

* 如果想要在执行完每个分支的代码后还继续执行后续的分支代码，可以使用fallthrough 关键字达到目的

```go
package main

import "fmt"

func switch1(n int) {
	switch { // 这里用的是没有条件的switch 语句会直接执行
	case n == 0:
		fmt.Println(0)
		fallthrough  // fallthrough 需放在 case 块结尾，可用 break 阻止
	case n == 1: // 如果匹配到0 这里会继续执行
		fmt.Println(1)
	case n == 2: // fallthrough 不会对这里有作用
		fmt.Println(2)
	default:
		fmt.Println("default")
	}
}

func main() {
	switch1(0)
}
# output
0
1
```
* 用 default 可以指定当其他所有分支都不匹配的时候的行为

```go
    switch i {
    	case 0:
    	case 1:
    		f()
    	default:
    		g()  // 当i不等于0 或 1 时调用
    }
```

### Range

> Range 类似迭代器的操作，返回(索引，值)或(健，值)

它可以迭代任何一个集合（包括字符串、数组、数组指针、切片、字典、通道）

基本语法如下:

```go
coll := 3string["a", "b", "c"]
for ix, val := range coll {
   ...
}

// 允许返回单值

for ix := range coll {
    println(ix, coll[ix])
}

// 也可以使用 _ 忽略

for _, val := range coll {
    println(val)
}

// 也可以只迭代，不返回。可用来执行清空 channel 等操作

for range coll {
    ...
}
```

val 始终为集合中对应索引的值拷贝，因此它一般只具有只读性质，对它所做的任何修改都不会影响到集合中原有的值（译者注：如果 val 为指针，则会产生指针的拷贝，依旧可以修改集合中的原值
一个字符串是 Unicode 编码的字符（或称之为 rune）集合，因此您也可以用它迭代字符串

下面是每种数据类型使用range时 ix和val 的值

| date type   | ix      | value    | 值类型        |
| ----------- | ------- | -------- | ------------- |
| string      | index   | s[index] | unicode, rune |
| array/slice | index   | s[index] |               |
| map         | key     | m[index] |               |
| channel     | element |          |               |

> range 会复制目标数据。字符串、切片基本结构是个很小的结构体，而字典、通道本身是指针封装，复制成本很小，无需专门优化。
>
> 如果是数组，可改成数组指针或者切片类型。

### Break continue

break 和 continue 都可在多级嵌套循环中跳出

> break 可用于 for、switch、select语句，终止整个语句块执行
>
> continue 仅能 于 for 循环，终止后续操作，立即进入下一轮循环。

### goto

goto 语句可以配合标签（label）形式的标识符使用，即某一行第一个以冒号`:`结尾的单词，标签区分大小写。

```go
package main

func main() {
    i:=0
    HERE:
	    print(i)
		i++
        if i==5 {
	        return
	    }
        goto HERE
}
# output 01234
```

> 使用标签和 goto 语句是不被鼓励的：它们会很快导致非常糟糕的程序设计，而且总有更加可读的替代方案来实现相同的需求。

for、switch 或 select 语句都可以配合标签（label）形式的标识符使用

```go
package main

import "fmt"

func main() {

LABEL1:
    for i := 0; i <= 5; i++ {
		for j := 0; j <= 5; j++ {
			if j == 4 {
				continue LABEL1
			}
			fmt.Printf("i is: %d, and j is: %d\n", i, j)
		}
	}
}

```

> continue 语句指向 LABEL1，当执行到该语句的时候，就会跳转到 LABEL1 标签的位置

### defer

defer 语句会延迟函数的执行直到上层函数返回

延迟调用的参数会立刻生成，但是在上层函数返回前函数都不会被调用

```go
package main

import "fmt"

func main() {
	defer fmt.Println("world")

	fmt.Println("hello")
}

// output
hello
world
```

*defer 栈*

延迟的函数调用被压入一个栈中。当函数返回时， 会按照后进先出的顺序调用被延迟的函数调用。
defer 常用来定义简单的方法

```go
package main

import "fmt"

func main() {
	fmt.Println("counting")

	for i := 0; i < 10; i++ {
			defer fmt.Println(i)
		}

		fmt.Println("done")
}
// 可以想一下会输出什么
// 代码执行 https://tour.go-zh.org/flowcontrol/13
```

*关键字 defer 允许我们进行一些函数执行完成后的收尾工作，例如：*

* 关闭文件流：

    // open a file defer file.Close()

* 解锁一个加锁的资源

    mu.Lock() defer mu.Unlock()

* 打印最终报告

    printHeader() defer printFooter()

* 关闭数据库链接

	// open a database connection defer disconnectFromDB()

合理使用 defer 语句能够使得代码更加简洁。

下面的代码展示了在调试时使用 defer 语句的手法

```go
package main

import (
	"io"
    "log"
)

func func1(s string) (n int, err error) {
    defer func() {
	        log.Printf("func1(%q) = %d, %v", s, n, err)
	    }()
    return 7, io.EOF
}

func main() {
    func1("Go")
}

// 输出
Output: 2016/04/25 10:46:11 func1("Go") = 7, EOF
```

更多defer 的用法([https://blog.go-zh.org/defer-panic-and-recover](https://blog.go-zh.org/defer-panic-and-recover))

### 参考链接

[Go 指南](https://tour.go-zh.org/flowcontrol/1)
[The way to go -- 控制结构](https://github.com/Unknwon/the-way-to-go_ZH_CN/blob/master/eBook/05.0.md)
[Effective Go](https://golang.org/doc/effective_go.html)

到这里简单的控制流用法讲解就结束了

下节将会是golang 数据结构部分, 会用到的代码为

### fibonacci(内存版)

```go
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
```

------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)