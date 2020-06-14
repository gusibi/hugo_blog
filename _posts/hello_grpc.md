---
categories: ["development", "python", "gRPC"]
date: 2018-06-07T23:49:17+08:00
description:  Python gRPC 入门
author: goodspeed
permalink: /post/hello-grpc
tags: ["python", "tutorial", "grpc", "小程序"]
title: Python gRPC 入门
---

> gRPC 一开始由 google 开发，是一款语言中立、平台中立、开源的远程过程调用(RPC)系统。 本文通过一个简单的 Hello World 例子来向您介绍 gRPC 。


### gRPC 是什么？

gRPC 也是基于以下理念：定义一个*服务*，指定其能够被远程调用的方法（包含参数和返回类型）。在服务端实现这个接口，并运行一个 gRPC 服务器来处理客户端调用。在客户端拥有一个*存根*能够像服务端一样的方法。

在 gRPC 里*客户端*应用可以像调用本地对象一样直接调用另一台不同的机器上*服务端*应用的方法，使得我们能够更容易地创建分布式应用和服务。

![gPRC](http://media.gusibi.mobi/t21KzebjklAAMbWL7Aos4KYZLkkbjrGwZkNLUwxrT7Igz1D5Ea2xCJ0W0EOPrgXK)


gRPC 客户端和服务端可以在多种环境中运行和交互，并且可以用任何 gRPC 支持的语言来编写。


> gRPC 支持 C++ Java Python Go Ruby C# Node.js PHP Dart 等语言


gRPC 默认使用 *protocol buffers*，这是 Google 开源的一种轻便高效的结构化数据存储格式，可以用于结构化数据串行化，或者说序列化。它很适合做数据存储或 RPC 数据交换格式。

### 安装 Google Protocol Buffer

#### 方法一（建议使用）



参考文档：[gRPC Python Quickstart](https://grpc.io/docs/quickstart/python.html)



##### 1. 安装 gRPC

```bash

python -m pip install grpcio
# 或者
sudo python -m pip install grpcio

# 在 El Capitan OSX 系统下可能会看到以下报错

$ OSError: [Errno 1] Operation not permitted: '/tmp/pip-qwTLbI-uninstall/System/Library/Frameworks/Python.framework/Versions/2.7/Extras/lib/python/six-1.4.1-py2.7.egg-info'

# 可以使用以下命令
python -m pip install grpcio --ignore-installed
```



##### 2. 安装 gRPC tools



Python gPRC tools 包含 protocol buffer 编译器和用于从 `.proto` 文件生成服务端和客户端代码的插件

```bash
python -m pip install grpcio-tools
```



#### 方法二：

在 github 页面[protobuf Buffers](https://github.com/google/protobuf/releases)可以下载二进制源码，下载后执行以下命令安装：

```bash
tar -zxvf protobuf-all-3.5.1.tar
cd protobuf-all-3.5.1
./configure
make
make install

>> protoc --version
libprotoc 3.5.1  # 安装成功
```

因为是要使用 Protobuf + Python 测试，所以还要安装 python运行环境。[protobuf Buffers python 文档](https://github.com/google/protobuf/tree/master/python)

```bash
# 打开 python 目录
cd python
python setup.py install  # 安装 python 运行环境
```



### Protobuf 基本使用

#### 定义一个消息类型

先来看一个非常简单的例子。假设你想定义一个“搜索请求”的消息格式，每一个请求含有一个查询字符串、你感兴趣的查询结果所在的页数，以及每一页多少条查询结果。可以采用如下的方式来定义消息类型的.proto文件了：

```protobuf
syntax = "proto3";  // 声明使用 proto3 语法

message SearchRequest {
  string query = 1;  // 每个字段都要指定数据类型
  int32 page_number = 2; // 这里的数字2 是标识符，最小的标识号可以从1开始，最大到2^29 - 1, or 536,870,911。不可以使用其中的[19000－19999]
  int32 result_per_page = 3; // 这里是注释，使用 //
}
```



* 文章的第一行指定了你正在使用 proto3 语法：如果不指定，编译器会使用 proto2。`这个指定语法必须是文件的非空非注释的第一行`。
* `SearchRequest`消息格式有三个字段，在消息中承载的数据分别对应于每一个字段。其中每个字段都有一个名字和一种类型。
* 向.proto文件添加注释，可以使用C/C++/java风格的`双斜杠(//)` 语法格式。
* 在消息体中，每个字段都有唯一的一个数字标识符。这些标识符用来在消息的二进制格式中识别各个字段，一旦开始使用就不能再改变。

> [1,15]之内的标识号在编码的时候会占用一个字节。[16,2047]之内的标识号则占用2个字节。所以应该为那些频繁出现的消息元素保留 [1,15]之内的标识号。切记：要为将来有可能添加的、频繁出现的标识号预留一些标识号。



#### 指定字段规则

所指定的消息字段修饰符必须是如下之一：

- singular：一个格式良好的消息应该有0个或者1个这种字段（但是不能超过1个）。

- repeated：在一个格式良好的消息中，这种字段可以重复任意多次（包括0次）。重复的值的顺序会被保留。

  在proto3中，repeated的标量域默认情况虾使用packed。

  

  ```protobuf
  message Test4 {
    repeated int32 d = 4 [packed=true];
  }
  ```

  

#### 数值类型

一个标量消息字段可以含有一个如下的类型——该表格展示了定义于.proto文件中的类型，以及与之对应的、在自动生成的访问类中定义的类型：

| .proto Type | Notes                                                        | C++ Type | Java Type  | Python Type[2] | Go Type | Ruby Type                 |
| ----------- | ------------------------------------------------------------ | -------- | ---------- | -------------- | ------- | ------------------------------ |
| double      |                                                              | double   | double     | float          | float64 | Float                     |
| float       |                                                              | float    | float      | float          | float32 | Float                     |
| int32       | 使用变长编码，对于负值的效率很低，如果你的域有可能有负值，请使用sint64替代 | int32    | int        | int       | int32   | Fixnum 或者 Bignum（根据需要） |
| uint32      | 使用变长编码                                                 | uint32   | int        | int/long       | uint32  | Fixnum 或者 Bignum（根据需要） | 
| uint64      | 使用变长编码                                                 | uint64   | long       | int/long       | uint64  | Bignum                      |
| sint32      | 使用变长编码，这些编码在负值时比int32高效的多                | int32    | int        | int            | int32   | Fixnum 或者 Bignum（根据需要） |
| sint64      | 使用变长编码，有符号的整型值。编码时比通常的int64高效。      | int64    | long       | int/long       | int64   | Bignum                         |
| fixed32     | 总是4个字节，如果数值总是比总是比228大的话，这个类型会比uint32高效。 | uint32   | int        | int            | uint32  | Fixnum 或者 Bignum（根据需要） | 
| fixed64     | 总是8个字节，如果数值总是比总是比256大的话，这个类型会比uint64高效。 | uint64   | long       | int/long       | uint64  | Bignum                      |
| sfixed32    | 总是4个字节                                                  | int32    | int        | int            | int32   | Fixnum 或者 Bignum（根据需要） |
| sfixed64    | 总是8个字节                                                  | int64    | long       | int/long       | int64   | Bignum                      |
| bool        |                                                              | bool     | boolean    | bool           | bool    | TrueClass/FalseClass      |
| string      | 一个字符串必须是UTF-8编码或者7-bit ASCII编码的文本。         | string   | String     | str/unicode    | string  | String (UTF-8)                 |
| bytes       | 可能包含任意顺序的字节数据。                                 | string   | ByteString | str            | []byte  | String (ASCII-8BIT)           |



#### 默认值

当一个消息被解析的时候，如果被编码的信息不包含一个特定的singular元素，被解析的对象锁对应的域被设置位一个默认值，对于不同类型指定如下：

- 对于strings，默认是一个空string

- 对于bytes，默认是一个空的bytes

- 对于bools，默认是false

- 对于数值类型，默认是0

- 对于枚举，默认是第一个定义的枚举值，必须为0;

- 对于消息类型（message），域没有被设置，确切的消息是根据语言确定的，详见[generated code guide](https://developers.google.com/protocol-buffers/docs/reference/overview?hl=zh-cn)

  对于可重复域的默认值是空（通常情况下是对应语言中空列表）。



#### 嵌套类型

你可以在其他消息类型中定义、使用消息类型，在下面的例子中，Result消息就定义在SearchResponse消息内，如：



```protobuf
message SearchResponse {
  message Result {
    string url = 1;
    string title = 2;
    repeated string snippets = 3;
  }
  repeated Result results = 1;
}
```



在 message SearchResponse 中，定义了嵌套消息 `Result`，并用来定义`SearchResponse`消息中的`results`域。



### Protobuf 文件编译



#### 从.proto文件生成了什么？



当用protocol buffer编译器来运行.proto文件时，编译器将生成所选择语言的代码，这些代码可以操作在.proto文件中定义的消息类型，包括获取、设置字段值，将消息序列化到一个输出流中，以及从一个输入流中解析消息。

- 对C++来说，编译器会为每个.proto文件生成一个.h文件和一个.cc文件，.proto文件中的每一个消息有一个对应的类。
- 对Java来说，编译器为每一个消息类型生成了一个.java文件，以及一个特殊的Builder类（该类是用来创建消息类接口的）。
- 对Python来说，有点不太一样——Python编译器为.proto文件中的每个消息类型生成一个含有静态描述符的模块，，该模块与一个元类（metaclass）在运行时（runtime）被用来创建所需的Python数据访问类。
- 对go来说，编译器会位每个消息类型生成了一个.pd.go文件。
- 对于Ruby来说，编译器会为每个消息类型生成了一个.rb文件。
- javaNano来说，编译器输出类似域java但是没有Builder类
- 对于Objective-C来说，编译器会为每个消息类型生成了一个pbobjc.h文件和pbobjcm文件，.proto文件中的每一个消息有一个对应的类。
- 对于C#来说，编译器会为每个消息类型生成了一个.cs文件，.proto文件中的每一个消息有一个对应的类。



### Python gRPC 示例

#### 编译

这里我们用Python 编译一下，看得到什么：

```protobuf
// 文件名 hello.proto
syntax = "proto3";

package hello;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```



使用以下命令编译:

```bash
python -m grpc_tools.protoc -I./ --python_out=. --grpc_python_out=. ./hello.proto
```

生成了两个文件：

* `hello_pb2.py` 此文件包含生成的 request(`HelloRequest`) 和 response(`HelloReply`) 类。
* `hello_pb2_grpc.py` 此文件包含生成的 客户端(`GreeterStub`)和服务端(`GreeterServicer`)的类。

源码地址为[https://github.com/grpc/grpc/blob/master/examples/protos/helloworld.proto](https://github.com/grpc/grpc/blob/master/examples/protos/helloworld.proto)



虽然现在已经生成了服务端和客户端代码，但是我们还需要手动实现以及调用的方法。



#### 创建服务端代码

创建和运行 `Greeter` 服务可以分为两个部分：

- 实现我们服务定义的生成的服务接口：做我们的服务的实际的“工作”的函数。

- 运行一个 gRPC 服务器，监听来自客户端的请求并传输服务的响应。

  

在当前目录，打开文件 greeter_server.py，实现一个新的函数：

```python
from concurrent import futures
import time

import grpc

import hello_pb2
import hello_pb2_grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24


class Greeter(hello_pb2_grpc.GreeterServicer):
	# 工作函数
    def SayHello(self, request, context):
        return hello_pb2.HelloReply(message='Hello, %s!' % request.name)


def serve():
    # gRPC 服务器
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    hello_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    server.add_insecure_port('[::]:50051')
    server.start()  # start() 不会阻塞，如果运行时你的代码没有其它的事情可做，你可能需要循环等待。
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
```

#### 更新客户端代码

在当前目录，打开文件 greeter_client.py，实现一个新的函数：

```python
from __future__ import print_function

import grpc

import hello_pb2
import hello_pb2_grpc


def run():
    channel = grpc.insecure_channel('localhost:50051')
    stub = hello_pb2_grpc.GreeterStub(channel)
    response = stub.SayHello(hello_pb2.HelloRequest(name='goodspeed'))
    print("Greeter client received: " + response.message)


if __name__ == '__main__':
    run()
```



> 对于返回单个应答的 RPC 方法（"response-unary" 方法），gRPC Python 同时支持同步（阻塞）和异步（非阻塞）的控制流语义。对于应答流式 RPC 方法，调用会立即返回一个应答值的迭代器。调用迭代器的 `next()` 方法会阻塞，直到从迭代器产生的应答变得可用。



#### 运行代码



1. 首先运行服务端代码

```bash
python greeter_server.py
```

2. 然后运行客户端代码

```bash
python greeter_client.py
# output

Greeter client received: Hello, goodspeed!
```

> [源码地址: https://github.com/grpc/grpc/tree/master/examples/python](https://github.com/grpc/grpc/tree/master/examples/python)

## 参考链接

* [gRPC 官方文档中文版](https://doc.oschina.net/grpc?t=56831)
* [Protobuf3语言指南](https://blog.csdn.net/u011518120/article/details/54604615)
* [Google Protocol Buffer 的使用和原理](https://www.ibm.com/developerworks/cn/linux/l-cn-gpb/index.html)
* [gRPC Python Quickstart](https://grpc.io/docs/quickstart/python.html)
------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)