+++
date = "2016-04-11T22:07:09+08:00"
draft = true
title = "golang learning by code 001"
tags = ["golang"]
categories = ["Development"]
slug = "golang-learning-by-code-001"

+++

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


因此符合规范的函数一般写成如下的形式：
{{< highlight go >}}

func functionName(parameter_list) (return_value_list) {
   …
}
{{< /highlight >}}

其中：

* parameter_list 的形式为 (param1 type1, param2 type2, …)
* return_value_list 的形式为 (ret1 type1, ret2 type2, …)

