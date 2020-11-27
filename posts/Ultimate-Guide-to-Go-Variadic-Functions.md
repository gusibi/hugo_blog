---
title: '【译】golang 可变参数函数终极指南'
date: 2020-08-16 22:29:38
tags: [golang]
published: true
hideInList: false
feature: http://media.gusibi.mobi/fOAjbsODtw2AeVd8OagAvADNACJHu1XFE1MKQ_EBauaKHh7K05KruNKG0SHWU82A
isTop: true
---
> 使用常用模式学习关于go语言可变参数函数的一切

[Ultimate Guide to Go Variadic Functions 原文地址](https://blog.learngoprogramming.com/golang-variadic-funcs-how-to-patterns-369408f19085)

# 什么是可变参数函数？

可变参数函数是指传入参数是可变数量（0到更多）的函数。在输入的变量类型前面的省略号(三点)前缀即构成一个有效的变量。

![2](http://media.gusibi.mobi/-kn_OQyfZYXrKDs4rz2CYh3wtwEQUaEa5gjqqcZd1Db8S-Bm1UtlS3R5Pg_7wT-j)

> 声明一个可变参数名为“ names”，类型为string 的可变参数函数

## 一个简单的可变参数函数

这个 func 以字符串的形式返回传递的参数，字符串之间用空格分隔。

```golang
func toFullname(names ...string) string {
  return strings.Join(names, " ")
}
```

![Image for post](https://miro.medium.com/max/10000/1*_rdOI_SbL9m07QBcKMqz5Q.png)You can pass zero or more params

## 你可以传入零个或多个参数

```go
toFullname("carl", "sagan")// output: "carl sagan"
toFullname("carl")// output: "carl"
toFullname()// output: ""
```

## 什么时候使用可变参数函数？

- *省略创建仅作为函数参数创建临时 slice 变量*
- *当输入参数的长度未知时*
- *表达你增加可读性的意图*

## 例子:

看看 `Go Stdlib` 的 `fmt. Println` 函数，就会明白它是如何使自己变得易于使用的。

它使用可变参数函数接受可选的输入参数数目。

```go
func Println(a ...interface{})
```

如果它不是一个可变参数函数，它看起来会是这样的:

```go
func Println(params []interface{})
```

你需要传递一个 slice 才能使用它ーー verbose，是的! :

```go
fmt.Println([]interface{}{"hello", "world"})
```

相比而言，在可变参数函数形式中，它的使用是简单的:

```go
fmt.Println("hello", "world")
fmt.Println("hello")
fmt.Println()
```

> 在这之后的部分，将会介绍一些关于 可变参数函数 的细节和常用模式的例子。

# 切片与可变参数函数

可变参数在函数中会被转换为“新的”切片。可变参数实际上是 slice 类型的参数的语法糖。

![3](http://media.gusibi.mobi/ELkTXYrLqO41gRC0fl7rz971NPHdCcS0yExDtNqgFCNMjNigJGgDik0XI-tXw3wi)

## 不传入参数

如果不向其传递任何值，就相当于向可变参数函数传递了 nil 切片。

![4](http://media.gusibi.mobi/9RBDcXhqLuLBy4oZOANH_3w6Bez2l5vTYpZounxZna8HaWhiaPXtg9o2g_3dYpgC)

所有非空切片都有内建数组，而 nil 片则没有。

```go
func toFullname(names ...string) []string {
  return names
}

// names 内建数组为: nil
```

但是，当你向可变参数函数添加参数时，它将创建一个与你传入参数相关联的数组，而不再是一个空切片。

go语言内置函数`append` 将参数追加到现有的slice，并返回。`append` 也是一个可变参数函数。

```go
func toFullname(names ...string) []string {
  return append(names, "hey", "what's up?")
}

toFullname()

// output: [hey what's up?]
```

## 如何传递一个切片？

通过将可变参数运算符`...` 加在现有切片后，可以将其传递给可变参数运算符。

```go
names := []string{"carl", "sagan")}

toFullname(names...)// output: "carl sagan"
```

这等同于以下调用:

```go
toFullname("carl", "sagan")
```

**但是，有一点不同：** ，在函数中将直接使用传入的切片而不是创建新的切片。关于这一点，请参阅以下内容。

![5](http://media.gusibi.mobi/I78AMp2oauglKBaN-v2vInPqqOddUZSAnsOLwqI-nOQUu1tUZq5E6H2kb_ksQems)

像下面这样，你也可以将数组作为可变参数函数的参数:

```go
names := [2]string{"carl", "sagan"}
toFullname(names[:]...)
```

## Passed slice’s spooky action at a distance

> 标题不知道怎么翻译...

假设你将一个 slice 作为参数传给一个可变参数函数:

```go
dennis := []string{"dennis", "ritchie"}
toFullname(dennis...)
```

再假设你修改了函数中变量参数的第一项:

```go
func toFullname(names ...string) string {
  names[0] = "guy"
  return strings.Join(names, " ")
}
```

修改它也会影响原始的切片。“ dennis”切片现在变成了:

```go
[]string{"guy", "ritchie"}
```

而不是原始值:

```go
[]string{"dennis", "ritchie"}
```

因为传入的 slice 与 func 内部的 slice 共享相同的底层数组，所以在 func 内部改变 slice 的值也会影响传入的 slice:

![6](http://media.gusibi.mobi/AbFuGA5LzxztjxBQ_D7oWHdkh-AZifMm4m1_E-iGRbezqRmO3ZeT-siWIfoYBnWc)

如果你直接传递参数(不使用切片) ，就不会发生这种情况。

## 动态传递多个切片

假设你想在 slice 传递给 func 之前，在 slice 前面添加“ mr. ”。

```go
names := []string{"carl", "sagan"}
```

首先`append` 函数会创建一个新的切片，然后将names展开， 然后将值依次添加到新创建的切片上，然后再将展开的结果传给 `toFullname` 函数:

```go
toFullname(append([]string{"mr."}, names...)...)

// output: "mr. carl sagan"
```

这和下面的代码一样:

```go
names = append([]string{"mr."}, "carl", "sagan")
toFullname(names...)

// or with this:
toFullname([]string{"mr.", "carl", "sagan"}...)

// or with this—except passing an existing slice:
toFullname("mr.", "carl", "sagan")
```

## 返回传入的切片

不能使用可变参数作为返回结果类型，但是可以将其作为片返回。

```go
func f(nums ...int) []int {
  nums[1] = 10
  return nums
}
```

当你将一个 slice 作为参数传入 f 时，它将返回一个相同的新 slice。传入和返回的切片是相关联的。两个中任意一个改变都会影响到另一个。

```go
nums  := []int{23, 45, 67}
nums2 := f(nums...)
```

这里，nums 和 nums2有相同的元素，因为它们都指向相同的底层数组。

```go
nums  = []int{10, 45, 67}
nums2 = []int{10, 45, 67}
```

👉 [这段代码](https://play.golang.org/p/Jun14DYWvq) 包含关于 slice 基础数组的详细说明

## 扩展操作符反模式

如果你有一个 funcs，它们唯一的用途就是接受可变数量的参数，那么最好使用可变参数函数代替使用 slice。

```go
// Don't do this
toFullname([]string{"rob", "pike"}...)

// Do this
toFullname("rob", "pike")
```

[运行代码](https://play.golang.org/p/oKQjwotLC_)

## 使用可变参数的长度

你可以使用可变参数的长度来改变函数的行为。

```go
func ToIP(parts ...byte) string {
  parts = append(parts, make([]byte, 4-len(parts))...)  
  
  return fmt.Sprintf("%d.%d.%d.%d", 
    parts[0], parts[1], parts[2], parts[3])
}
```

ToIP func 将“ parts”作为可变参数，并使用 parts param 的长度返回默认值为0的字符串形式的 IP 地址。

```go
ToIP(255)   // 255.0.0.0
ToIP(10, 1) // 10.1.0.0
ToIP(127, 0, 0, 1) // 127.0.0.1
```

[运行代码](https://play.golang.org/p/j9RcLvbs3K)

# ✪ 变量函数的签名

尽管可变参数函数是一种语法糖，但它的签名[类型标识](https://golang.org/ref/spec#Type_identity)与接受切片的函数是不同的。

举个例子看一下字符串切片和 ...字符串的区别是什么？

***一个可变参数函数的签名:***

```go
func PrintVariadic(msgs ...string)// signature: func(msgs ...string)
```

***非可变参数函数的签名:***

```go
func PrintSlice(msgs []string)// signature: func([]string)
```

*它们的类型标识不一样，我们把它们赋值给变量:*

```go
variadic := PrintVariadic   // variadic is a func(...string)
slicey := PrintSlice       // slice is a func([]string)
```

因此，其中一个不能替代另一个:

```go
slicey = variadic// error: type mismatch
```

[运行代码](https://play.golang.org/p/fsZYGgTyvF)

# 混合变量和非可变参数

你可以通过把非可变参数放在可变参数之前，将非可变参数与可变参数混合。

```go
func toFullname(id int, names ...string) string {
  return fmt.Sprintf("#%02d: %s", id, strings.Join(names, " "))
}

toFullname(1, "carl", "sagan")// output: "#01: carl sagan"
```

但是，你不能将非可变参数放到可变参数之后:

```go
func toFullname(id int, names ...string, age int) string {}// error
```

[运行代码](https://play.golang.org/p/TlbDYapOCD)

## 接受变量类型的参数

例如，[*Go Stdlib 的 Printf*](https://golang.org/src/fmt/print.go#L189) 函数，使用空接口类型接受任何类型的输入参数。你还可以使用空接口接受任意类型和任意数量的参数。

```go
func Printf(format string, a ...interface{}) (n int, err error) {
    /* this is a pass-through with a... */  
    return Fprintf(os.Stdout, format, a...)
}

fmt.Printf("%d %s %f", 1, "string", 3.14)    // output: "1 string 3.14"
```

## 为什么 Printf 只接受一个变量参数？

查看 Printf 的签名时，会发现它接受一个名为 format 的字符串和一个可变参数。

```go
func Printf(format string, a ...interface{})
```

这是因为format是必需的参数。Printf 强制您提供它，否则代码将无法编译。

如果它通过一个可变参数接收所有参数，那么调用方可能没有提供必要的格式化程序参数，或者从可读性角度来看，它不会像这个参数那么明确。*它清楚地标明了 Printf 需要什么*。

此外，调用时不传人变量参数“a”，它将防止 *Printf* 在 函数中创建一个不必要的切片，一个值为 nil 切片。*This may not be a clear win for Printf but it can be for you in your own code*。

你也可以在自己的代码中使用相同的模式。

## 注意空接口类型

`interface{}`类型也称为空接口类型，这意味着它绕过了自身的 Go 静态类型语义检查。不必要地使用它会给你带来弊大于利的后果。

例如，它可能强制你使用[*reflection*](https://blog.golang.org/laws-of-reflection)，这是一个运行时特性(*instead of fast and safe — compile-time)*。你可能需要自己查找类型错误，而不是依赖于编译器帮你找到它们。

> 在使用空接口之前要仔细考虑，依靠显式类型和接口来实现所需的行为。

## 将切片传递给具有空接口的可变参数

你不能将一个普通的切片传递给一个具有空接口类型的可变参数。具体原因[请阅读这里](https://golang.org/doc/faq#convert_slice_of_interface)。

```go
hellos := []string{"hi", "hello", "merhaba"}
```

*You expect this to work, but it doesn’t:*

你可能期望这能生效，但事实并非如此:

```go
fmt.Println(hellos...)
```

因为，hello 是一个字符串，而不是一个空接口切片。可变参数或切片只能属于一种类型。

首先需要将 *hellos* slice 转换为一个空接口 slice:

```go
var ihellos []interface{} = make([]interface{}, len(hello))for i, hello := range hellos {
  ihellos[i] = hello
}
```

*Now, the expansion operator will work:*

现在，扩展运算符将开始生效:

```go
fmt.Println(ihellos...)
// output: [hi hello merhaba]
```

[运行代码](https://play.golang.org/p/8uRHsHFKSx)

# 函数式编程方面

你还可以使用可变参数函数接受可变数目的函数。让我们声明一个新的 formatter func 类型。格式化程序 func 获取并返回一个字符串:

```go
type formatter func(s string) string
```

让我们声明一个可变参数函数，它接受一个字符串和数量可选的可格式化的类型，以便使用一些pipeline来格式化字符串。

```go
func format(s string, fmtrs ...formatter) string {
  for _, fmtr := range fmtrs {
    s = fmtr(s)
  }  return s
}

format(" alan turing ", trim, last, strings.ToUpper)// output: TURING
```

[运行代码](https://play.golang.org/p/kCOP6_5h-t)

您还可以使用channels、structs等来代替这种链式模式的函数。看* [*这里*](https://golang.org/pkg/io/#MultiReader) *或者* [*这里*](https://golang.org/src/text/template/parse/parse.go?s=1642:1753#L41) *查看示例.*

## 使用结果为slice的函数作为可变参数

让我们重复使用上面的“format func”来创建一个可重用的格式化管道构建器:

```go
func build(f string) []formatter {
  switch f {
    case "lastUpper":
      return []formatter{trim, last, strings.ToUpper}
    case "trimUpper":
      return []formatter{trim, strings.ToUpper}
    // ...etc
    default:
      return identityFormatter
  }
}
```

然后使用 expand 运算符运行它，最后将结果提供给格式 func:

```go
format(" alan turing ", build("lastUpper")...)// output: TURING
```

## 可变参数选项模式

*You may have already been familiar with this pattern from other OOP langs and this has been re-popularized again in Go by Rob Pike* [*here*](https://commandcenter.blogspot.com.tr/2014/01/self-referential-functions-and-design.html) *back in 2014. It’s like the* [*visitor pattern*](https://en.wikipedia.org/wiki/Visitor_pattern)*.*

你可能已经熟悉这种来自其他 OOP 语言的模式，这种[模式](https://commandcenter.blogspot.com.tr/2014/01/self-referential-functions-and-design.html)在2014年 Rob Pike 的 Go 中再次流行起来。这就像是[访客模式](https://en.wikipedia.org/wiki/Visitor_pattern)。

这个例子对你来说可能有点难。如果有不理解的请及时提问<作者不在，查看原文链接提问吧😂>。

让我们创建一个 Logger，可以使用可选模式在运行时更改详细程度和前缀:

```go
type Logger struct {
  verbosity
  prefix string
}
```

使用一个可变的选项参数来改变logger的行为:

```go
func (lo *Logger) SetOptions(opts ...option) {
  for _, applyOptTo := range opts {
    applyOptTo(lo)
  }
}
```

我们创建一些返回配置方法的函数，它们在一个闭包中改变 Logger 的操作行为：

```go
func HighVerbosity() option {
  return func(lo *Logger) {
    lo.verbosity = High
  }
}

func Prefix(s string) option {
  return func(lo *Logger) {
    lo.prefix = s
  }
}
```

现在，让我们用默认选项创建一个新的 Logger:

```go
logger := &Logger{}
```

然后通过变量参数向记录器提供选项:

```go
logger.SetOptions(
  HighVerbosity(), 
  Prefix("ZOMBIE CONTROL"),
)
```

现在让我们检查一下输出:

```go
logger.Critical("zombie outbreak!")
// [ZOMBIE CONTROL] CRITICAL: zombie outbreak!

logger.Info("1 second passed")
// [ZOMBIE CONTROL] INFO: 1 second passed
```

[运行代码](https://play.golang.org/p/X2XHSdYgdq)

# ✪ 无穷无尽的精神食粮！

- 在 Go 2中，有一些可变函数的行为的计划*[*这里*](https://github.com/golang/go/issues/15209)*,* [*here 这里*](https://github.com/golang/go/issues/18605)*,及*[*这里*](https://github.com/golang/go/issues/19218)*.*
- *你可以在 Go 语言标准文档里找到更正式的可变参数函数指南,*[*这里*](https://golang.org/ref/spec#Passing_arguments_to_..._parameters)*,* [*这里*](https://golang.org/ref/spec#Appending_and_copying_slices)*,* [*这里*](https://golang.org/ref/spec#Appending_and_copying_slices) *及*[*这里*](https://golang.org/ref/spec#Type_identity)*.*
- [*使用来自 c 的可变函数*](https://sunzenshen.github.io/tutorials/2015/05/09/cgotchas-intro.html)*.*
- *你可以找到很多语言的可变参数函数声明*[*这里*](https://rosettacode.org/wiki/Variadic_function)*.自由探索吧*

好了，就到这了。谢谢你们的阅读。