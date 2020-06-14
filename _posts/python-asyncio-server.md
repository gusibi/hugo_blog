---
date: 2017-06-30T16:29:39+08:00
description: python asyncio 介绍
draft: false
permalink: /post/python-asyncio-server
categories: ["development", "python", "读书笔记"]
tags: ["python", "tutorial", "读书笔记", "并发"]
title: "python并发3：使用asyncio编写服务器"
---

> <section class="caption">asyncio </section> 上一篇我们介绍了 asyncio 包，以及如何使用异步编程管理网络应用中的高并发。在这一篇，我们主要介绍使用 asyncio 包编程的两个例子。

## async/await语法

我们先介绍下 async/await 语法，要不然看完这篇可能会困惑，为什么之前使用 asyncio.coroutine 装饰器 和 yield from，这里都是 用的 async 和 await？

> [python并发2：使用asyncio处理并发](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751998&idx=1&sn=37833d3d7582d38f85a526de7eeda814)

async/await 是Python3.5 的新语法，语法如下：

```python
async def read_data(db):
    pass
```
async 是明确将函数声明为协程的关键字，即使没有await表达式，函数执行也会返回一个协程对象。
在协程函数内部，可以在某个表达式之前使用 await 关键字来暂停协程的执行，以等待某协程完成：

```python
async def read_data(db):
    data = await db.fetch('SELECT ...')
```

这个代码如果使用 asyncio.coroutine 装饰器语法为：

```python
@asyncio.coroutine
def read_data(db):
    data = yield from db.fetch('SELECT ...')
```

这两段代码执行的结果是一样的，也就是说 可以把 asyncio.coroutine 替换为 async， yield from 替换为 await。

使用新的语法有什么好处呢：
* 使生成器和协程的概念更容易理解，因为语法不同
* 可以消除由于重构时不小心移出协程中yield 声明而导致的不明确错误，这回导致协程变成普通的生成器。

## 使用 asyncio 包编写服务器

这个例子主要是使用 asyncio 包 和 unicodedata 模块，实现通过规范名称查找Unicode 字符。

我们先来看一下代码：

```python
# charfinder.py
import sys
import re
import unicodedata
import pickle
import warnings
import itertools
import functools
from collections import namedtuple

RE_WORD = re.compile('\w+')
RE_UNICODE_NAME = re.compile('^[A-Z0-9 -]+$')
RE_CODEPOINT = re.compile('U\+[0-9A-F]{4, 6}')

INDEX_NAME = 'charfinder_index.pickle'
MINIMUM_SAVE_LEN = 10000
CJK_UNI_PREFIX = 'CJK UNIFIED IDEOGRAPH'
CJK_CMP_PREFIX = 'CJK COMPATIBILITY IDEOGRAPH'

sample_chars = [
    '$',  # DOLLAR SIGN
    'A',  # LATIN CAPITAL LETTER A
    'a',  # LATIN SMALL LETTER A
    '\u20a0',  # EURO-CURRENCY SIGN
    '\u20ac',  # EURO SIGN
]

CharDescription = namedtuple('CharDescription', 'code_str char name')

QueryResult = namedtuple('QueryResult', 'count items')


def tokenize(text):
    '''
    :param text: 
    :return: return iterable of uppercased words 
    '''
    for match in RE_WORD.finditer(text):
        yield match.group().upper()


def query_type(text):
    text_upper = text.upper()
    if 'U+' in text_upper:
        return 'CODEPOINT'
    elif RE_UNICODE_NAME.match(text_upper):
        return 'NAME'
    else:
        return 'CHARACTERS'


class UnicodeNameIndex:
    # unicode name 索引类

    def __init__(self, chars=None):
        self.load(chars)

    def load(self, chars=None):
        # 加载 unicode name    
        self.index = None
        if chars is None:
            try:
                with open(INDEX_NAME, 'rb') as fp:
                    self.index = pickle.load(fp)
            except OSError:
                pass
        if self.index is None:
            self.build_index(chars)
        if len(self.index) > MINIMUM_SAVE_LEN:
            try:
                self.save()
            except OSError as exc:
                warnings.warn('Could not save {!r}: {}'
                              .format(INDEX_NAME, exc))

    def save(self):
        with open(INDEX_NAME, 'wb') as fp:
            pickle.dump(self.index, fp)

    def build_index(self, chars=None):
        if chars is None:
            chars = (chr(i) for i in range(32, sys.maxunicode))
        index = {}
        for char in chars:
            try:
                name = unicodedata.name(char)
            except ValueError:
                continue
            if name.startswith(CJK_UNI_PREFIX):
                name = CJK_UNI_PREFIX
            elif name.startswith(CJK_CMP_PREFIX):
                name = CJK_CMP_PREFIX

            for word in tokenize(name):
                index.setdefault(word, set()).add(char)

        self.index = index

    def word_rank(self, top=None):
        # (len(self.index[key], key) 是一个生成器，需要用list 转成列表，要不然下边排序会报错
        res = [list((len(self.index[key], key)) for key in self.index)]
        res.sort(key=lambda  item: (-item[0], item[1]))
        if top is not None:
            res = res[:top]
        return res

    def word_report(self, top=None):
        for postings, key in self.word_rank(top):
            print('{:5} {}'.format(postings, key))

    def find_chars(self, query, start=0, stop=None):
        stop = sys.maxsize if stop is None else stop
        result_sets = []
        for word in tokenize(query):
            # tokenize 是query 的生成器 a b 会是 ['a', 'b'] 的生成器
            chars = self.index.get(word)
            if chars is None:
                result_sets = []
                break
            result_sets.append(chars)

        if not result_sets:
            return QueryResult(0, ())

        result = functools.reduce(set.intersection, result_sets)
        result = sorted(result)  # must sort to support start, stop
        result_iter = itertools.islice(result, start, stop)
        return QueryResult(len(result),
                           (char for char in result_iter))

    def describe(self, char):
        code_str = 'U+{:04X}'.format(ord(char))
        name = unicodedata.name(char)
        return CharDescription(code_str, char, name)

    def find_descriptions(self, query, start=0, stop=None):
        for char in self.find_chars(query, start, stop).items:
            yield self.describe(char)

    def get_descriptions(self, chars):
        for char in chars:
            yield self.describe(char)

    def describe_str(self, char):
        return '{:7}\t{}\t{}'.format(*self.describe(char))

    def find_description_strs(self, query, start=0, stop=None):
        for char in self.find_chars(query, start, stop).items:
            yield self.describe_str(char)

    @staticmethod  # not an instance method due to concurrency
    def status(query, counter):
        if counter == 0:
            msg = 'No match'
        elif counter == 1:
            msg = '1 match'
        else:
            msg = '{} matches'.format(counter)
        return '{} for {!r}'.format(msg, query)

def main(*args):
    index = UnicodeNameIndex()
    query = ' '.join(args)
    n = 0
    for n, line in enumerate(index.find_description_strs(query), 1):
        print(line)
    print('({})'.format(index.status(query, n)))


if __name__ == '__main__':
    if len(sys.argv) > 1:
        main(*sys.argv[1:])
    else:
        print('Usage: {} word1 [word2]...'.format(sys.argv[0]))

```

这个模块读取Python内建的Unicode数据库，为每个字符名称中的每个单词建立索引，然后倒排索引，存入一个字典。
例如，在倒排索引中，'SUN' 键对应的条目是一个集合，里面是名称中包含'SUN' 这个词的10个Unicode字符。倒排索引保存在本地一个名为charfinder_index.pickle 的文件中。如果查询多个单词，会计算从索引中所得集合的交集。
运行示例如下：

```python
    >>> main('rook')  # doctest: +NORMALIZE_WHITESPACE
    U+2656  ♖  WHITE CHESS ROOK
    U+265C  ♜  BLACK CHESS ROOK
    (2 matches for 'rook')
    >>> main('rook', 'black')  # doctest: +NORMALIZE_WHITESPACE
    U+265C  ♜  BLACK CHESS ROOK
    (1 match for 'rook black')
    >>> main('white bishop')  # doctest: +NORMALIZE_WHITESPACE
    U+2657  ♗   WHITE CHESS BISHOP
    (1 match for 'white bishop')
    >>> main("jabberwocky's vest")
    (No match for "jabberwocky's vest")
```

这个模块没有使用并发，主要作用是为使用 asyncio 包编写的服务器提供支持。
下面我们来看下 tcp_charfinder.py 脚本：

```python
# tcp_charfinder.py
import sys
import asyncio

# 用于构建索引，提供查询方法
from charfinder import UnicodeNameIndex

CRLF = b'\r\n'
PROMPT = b'?> '

# 实例化UnicodeNameIndex 类，它会使用charfinder_index.pickle 文件
index = UnicodeNameIndex()

async def handle_queries(reader, writer):
    # 这个协程要传给asyncio.start_server 函数，接收的两个参数是asyncio.StreamReader 对象和 asyncio.StreamWriter 对象
    while True:  # 这个循环处理会话，直到从客户端收到控制字符后退出
        writer.write(PROMPT)  # can't await!  # 这个方法不是协程，只是普通函数；这一行发送 ?> 提示符
        await writer.drain()  # must await!  # 这个方法刷新writer 缓冲；因为它是协程，所以要用 await
        data = await reader.readline()  # 这个方法也是协程，返回一个bytes对象，也要用await
        try:
            query = data.decode().strip()
        except UnicodeDecodeError:
            # Telenet 客户端发送控制字符时，可能会抛出UnicodeDecodeError异常
            # 我们这里默认发送空字符
            query = '\x00'
        client = writer.get_extra_info('peername')  # 返回套接字连接的远程地址
        print('Received from {}: {!r}'.format(client, query))  # 在控制台打印查询记录
        if query:
            if ord(query[:1]) < 32:  # 如果收到控制字符或者空字符，退出循环
                break
            # 返回一个生成器，产出包含Unicode 码位、真正的字符和字符名称的字符串
            lines = list(index.find_description_strs(query)) 
            if lines:
                # 使用默认的UTF-8 编码把lines    转换成bytes 对象，并在每一行末添加回车符合换行符
                # 参数列表是一个生成器
                writer.writelines(line.encode() + CRLF for line in lines) 
            writer.write(index.status(query, len(lines)).encode() + CRLF) # 输出状态

            await writer.drain()  # 刷新输出缓冲
            print('Sent {} results'.format(len(lines)))  # 在服务器控制台记录响应

    print('Close the client socket')  # 在控制台记录会话结束
    writer.close()  # 关闭StreamWriter流



def main(address='127.0.0.1', port=2323):  # 添加默认地址和端口，所以调用默认可以不加参数
    port = int(port)
    loop = asyncio.get_event_loop()
    # asyncio.start_server 协程运行结束后，
    # 返回的协程对象返回一个asyncio.Server 实例，即一个TCP套接字服务器
    server_coro = asyncio.start_server(handle_queries, address, port,
                                loop=loop) 
    server = loop.run_until_complete(server_coro) # 驱动server_coro 协程，启动服务器

    host = server.sockets[0].getsockname()  # 获得这个服务器的第一个套接字的地址和端口
    print('Serving on {}. Hit CTRL-C to stop.'.format(host))  # 在控制台中显示地址和端口
    try:
        loop.run_forever()  # 运行事件循环 main 函数在这里阻塞，直到服务器的控制台中按CTRL-C 键
    except KeyboardInterrupt:  # CTRL+C pressed
        pass

    print('Server shutting down.')
    server.close()
    # server.wait_closed返回一个 future
    # 调用loop.run_until_complete 方法，运行 future
    loop.run_until_complete(server.wait_closed())  
    loop.close()  # 终止事件循环


if __name__ == '__main__':
    main(*sys.argv[1:])

```

运行 tcp_charfinders.py

```bash
python tcp_charfinders.py
```

打开终端，使用 telnet 命令请求服务，运行结果如下所示：

![在 telnet 会话中访问tcp版字符串查找服务器所做的查询](http://media.gusibi.mobi/gjKne6lhnA1QoQEksLjU8ujZEIlaH-F622yCUcfD6QTB-M6DT84qK04A9rLMSosx)

main 函数几乎会立即显示 Serving on... 消息，然后在调用loop.run_forever() 方法时阻塞。这时，控制权流动到事件循环中，而且一直等待，偶尔会回到handle_queries 协程，这个协程需要等待网络发送或接收数据时，控制权又交给事件循环。

handle_queries 协程可以处理多个客户端发来的多次请求。只要有新客户端连接服务器，就会启动一个handle_queries 协程实例。

> handle_queries 的I/O操作都是使用bytes格式。我们从网络得到的数据要解码，发出去的数据也要编码

asyncio包提供了高层的流API，提供了现成的服务器，我们只需要实现一个处理程序。详细信息可以查看文档：[https://docs.python.org/3/library/asyncio-stream.html](https://docs.python.org/3/library/asyncio-stream.html)

虽然，asyncio包提供了服务器，但是功能相对来说还是比较简陋的，现在我们使用一下 基于asyncio包的 web 框架 sanci，用它来实现一个http版的简易服务器

> <section class="caption">sanic</section> 的简单入门在上一篇文章有介绍，[python web 框架 Sanci 快速入门](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752001&idx=1&sn=2c2e84f5f493514fdbff482a28dd7551&chksm=80b0b86bb7c7317df9d1c7b13411a231b91bb107de5e99c5379a3d9d072d5d3fb8117f364188#rd)

## 使用 sanic 包编写web 服务器
 
Sanic 是一个和类Flask 的基于Python3.5+的web框架，提供了比较高阶的API，比如路由、request参数，response等，我们只需要实现处理逻辑即可。

下边是使用 sanic 实现的简易的 字符查询http web 服务：

```python
from sanic import Sanic
from sanic import response

from charfinder import UnicodeNameIndex

app = Sanic()

index = UnicodeNameIndex()

html_temp = '<p>{char}</p>'

@app.route('/charfinder')  # app.route 函数的第一个参数是url path，我们这里指定路径是charfinder
async def charfinder(request):
    # request.args 可以取到url 的查询参数
    # ?key1=value1&key2=value2 的结果是 {'key1': ['value1'], 'key2': ['value2']}
    # 我们这里支持传入多个查询参数，所以这里使用 request.args.getlist('char')
    # 如果我们 使用 request.args.get('char') 只能取到第一个参数
    query = request.args.getlist('char')
    query = ' '.join(query)
    lines = list(index.find_description_strs(query))
    # 将得到的结果生成html
    html = '\n'.join([html_temp.format(char=line) for line in lines])
    return response.html(html)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)  # 设置服务器运行地址和端口号
```

对比两段代码可以发现，使用 sanic 非常简单。

运行服务：

```sh
python http_charsfinder.py
```
我们在浏览器输入地址 http://0.0.0.0:8000/charfinder?char=sun 结果示例如下

![http://media.gusibi.mobi/BruF3mWEA0c2KEh5wqP92DajeNuZ_2LI6LeamF-kpYcDqmy8xlVw3V98tbIdHEeI](http://media.gusibi.mobi/BruF3mWEA0c2KEh5wqP92DajeNuZ_2LI6LeamF-kpYcDqmy8xlVw3V98tbIdHEeI)

### 现在对比下两段代码 

在TCP 的示例中，服务器通过main函数下的这两行代码创建并排定运行时间：

```python
server_coro = asyncio.start_server(handle_queries, address, port,
                                loop=loop)
server = loop.run_until_complete(server_coro)
```

而在sanic的HTTP示例中，使用，创建服务器：

```python
app.run(host="0.0.0.0", port=8000)
```

这两个看起来运行方式完全不同，但如果我们翻开sanic的源码会看到 app.run() 内部是调用 的 `server_coroutine = loop.create_server()`创建服务器，
server_coroutine 是通过 `loop.run_until_complete()`驱动的。

所以说，为了启动服务器，这两个都是由 loop.run_until_complete 驱动，完成运行的。只不过 sanic 封装了run 方法，使得使用更加方便。

> 这里可以得到一个基本事实：只有驱动协程，协程才能做事，而驱动 asyncio.coroutine 装饰的协程有两种方式，使用 yield from 或者传给asyncio 包中某个参数为协程或future的函数，例如 run_until_complete

现在如果你搜索 cjk，会得到7万多条数据3M 的一个html文件，耗时大约2s，这如果是生产服务的一个请求，耗时2s是不能接收的，我们可以使用分页，这样我们可以每次只取200条数据，当用户想看更多数据时再使用 ajax 或者 websockets发送下一批数据。

这一篇我们使用 asyncio 包实现了TCP服务器，使用sanic（基于asyncio `sanic 默认使用 uvloop替代asyncio`）实现了HTTP服务器，用于按名称搜索Unicode 字符。但是并没有涉及服务器并发部分，这部分可以以后再讨论。

> 这一篇还是 《流畅的python》asyncio 一章的读书笔记，下一篇将是python并发的第三篇，《使用线程处理并发》。

## 参考链接

* [Python 3.5将支持Async/Await异步编程:http://www.infoq.com/cn/news/2015/05/python-async-await](http://www.infoq.com/cn/news/2015/05/python-async-await)
* [python web 框架 Sanci 快速入门](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752001&idx=1&sn=2c2e84f5f493514fdbff482a28dd7551&chksm=80b0b86bb7c7317df9d1c7b13411a231b91bb107de5e99c5379a3d9d072d5d3fb8117f364188#rd)
* [python并发2：使用asyncio处理并发](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751998&idx=1&sn=37833d3d7582d38f85a526de7eeda814)

------
**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)