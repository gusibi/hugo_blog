+++
date = "2016-04-11T22:07:09+08:00"
draft = true
title = "跟着代码学go 001"
tags = ["golang"]
categories = ["Development"]
slug = "golang-learning-by-code-001"

+++

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
{{< highlight go >}}
1. go build helloworld.go

// 结果是叫做 helloworld 的可执行文件。

2. ./helloworld

// Hello, world; or καλημε ́ρα κóσμε; or こんにちは世界
{{< /highlight >}}

因此符合规范的函数一般写成如下的形式：
{{< highlight go >}}

func functionName(parameter_list) (return_value_list) {
   …
}
{{< /highlight >}}

## fibonacci 

### 递归版

{{< highlight go >}}
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
{{< /highlight >}}

### 内存版

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



其中：

* parameter_list 的形式为 (param1 type1, param2 type2, …)
* return_value_list 的形式为 (ret1 type1, ret2 type2, …)

