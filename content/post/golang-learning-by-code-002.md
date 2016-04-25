+++
date = "2016-04-25T14:50:09+08:00"
draft = true
title = "跟着代码学go 002 -- 控制流"
tags = ["golang"]
categories = ["Development"]
slug = "golang-learning-by-code-002"
description = "跟着代码学golang 控制流"

+++

## 控制流

上一篇我们了解了golang 的变量、函数和基本类型，这一篇将介绍一下控制流

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
