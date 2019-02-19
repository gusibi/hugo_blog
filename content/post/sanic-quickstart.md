---
date: 2017-06-25T12:47:34+08:00
description: sanic 快速入门
draft: false
slug: sanic-quickstart
categories: ["development", "python", "framwork"]
tags: ["python", "tutorial", "sanic"]
title: python web 框架 Sanci 快速入门
---

## 简介
Sanic 是一个和类Flask 的基于Python3.5+的web框架，它编写的代码速度特别快。

除了像Flask 以外，Sanic 还支持以异步请求的方式处理请求。这意味着你可以使用新的 async/await 语法，编写非阻塞的快速的代码。

> 关于 asyncio 包的介绍，请参考之前的一篇文章 [python并发2：使用asyncio处理并发](http://blog.gusibi.site/post/python-asyncio/)

Github 地址 是 [https://github.com/channelcat/sanic](https://github.com/channelcat/sanic)，感兴趣的可以去贡献代码。

既然它说速度特别快，我们先看下官方提供的 基准测试结果。

## Sanic基准测试

![sanic benchmarks](http://media.gusibi.mobi/Z4kaZYttJBgd10Nl9CxCc9aRv0lpERgpW2tCnnRjHQ7G3Yb0swwrL2qFBORVcRSp)

这个测试的程序运行在 AWS 实例上，系统是Ubuntu，只使用了一个进程。

Sanic 的开发者说他们的灵感来自于这篇文章 [uvloop: Blazing fast Python networking](https://magic.io/blog/uvloop-blazing-fast-python-networking/)。

那我们就有必要看下uvloop是个什么库。

## uvloop

uvloop 是 asyncio 默认事件循环的替代品，实现的功能完整，切即插即用。uvloop是用CPython 写的，建于libuv之上。
uvloop 可以使 asyncio 更快。事实上，它至少比 nodejs、gevent 和其他 Python 异步框架要快两倍 。基于 uvloop 的 asyncio 的速度几乎接近了 Go 程序的速度。

### 安装 uvloop

uvloop 还只能在 *nix 平台 和 Python3.5+以上版本使用。
使用pip安装：
```bash
pip install uvloop
```
在 asyncio 代码中使用uvloop 也很简单：

```python
import asyncio
import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
```
这得代码使得对任何asyncio.get_event_loop() 的调用都将返回一个uvloop实例。

详细的uvloop 介绍可以看下原文：[uvloop: Blazing fast Python networking](https://magic.io/blog/uvloop-blazing-fast-python-networking/)。

uvloop的github地址是[https://github.com/MagicStack/uvloop](https://github.com/MagicStack/uvloop)。

现在我们开始学习Sanic：

## 安装 Sanic 

```bash
pip install sanic
```

### 创建第一个 sanic 代码

```python
from sanic import Sanic
from sanic.response import text

app = Sanic(__name__)

@app.route("/")
async def test(request):
    return text('Hello world!')

app.run(host="0.0.0.0", port=8000, debug=True)
```

运行代码： `python main.py`, 现在打开浏览器访问 http://0.0.0.0:8000，你会看到 `hello world!`。

如果你熟悉Flask，你会发现，这个语法简直和Flask一模一样。

## 路由（Routing）

路由用于把一个函数绑定到一个 URL。下面是一些基本的例子：

```python
@app.route('/')
def index():
    return text('Index Page')

@app.route('/hello')
def hello():
    return text('Hello World')
```
当然，你还可以动态的变化URL的某些部分，还可以为一个函数指定多个规则。

### 变量规则

通过把 URL 的一部分标记为 <variable_name> 就可以在 URL 中添加变量。标记的 部分会作为关键字参数传递给函数。通过使用 `<converter:variable_name>` ，可以 选择性的加上一个转换器，为变量指定特定的类型，如果传入的类型错误，Sanic会抛出`NotFound`异常。请看下面的例子:

```python
from sanic.response import text

@app.route('/tag/<tag>')
async def tag_handler(request, tag):
    return text('Tag - {}'.format(tag))

@app.route('/number/<integer_arg:int>')
async def integer_handler(request, integer_arg):
    return text('Integer - {}'.format(integer_arg))

@app.route('/number/<number_arg:number>')
async def number_handler(request, number_arg):
    return text('Number - {}'.format(number_arg))

@app.route('/person/<name:[A-z]>')
async def person_handler(request, name):
    return text('Person - {}'.format(name))

@app.route('/folder/<folder_id:[A-z0-9]{0,4}>')
async def folder_handler(request, folder_id):
    return text('Folder - {}'.format(folder_id))
```
### HTTP 请求类型

默认情况下，我们定义的URL只支持`GET` 请求，`@app.route`装饰器提供了一个可选参数`methods`，这个参数允许传入所有HTTP 方法。
例如：
```python
from sanic.response import text

@app.route('/post', methods=['POST'])
async def post_handler(request):
    return text('POST request - {}'.format(request.json))

@app.route('/get', methods=['GET'])
async def get_handler(request):
    return text('GET request - {}'.format(request.args))
```

也可以简写为：

```python
from sanic.response import text

@app.post('/post')
async def post_handler(request):
    return text('POST request - {}'.format(request.json))

@app.get('/get')
async def get_handler(request):
    return text('GET request - {}'.format(request.args))
```
### add_route 方法

除了`@app.route`装饰器，Sanic 还提供了 `add_route` 方法。
> `@app.route` 只是包装了 `add_route`方法。

```python
from sanic.response import text

# Define the handler functions
async def handler1(request):
    return text('OK')

async def handler2(request, name):
    return text('Folder - {}'.format(name))

async def person_handler2(request, name):
    return text('Person - {}'.format(name))

# Add each handler function as a route
app.add_route(handler1, '/test')
app.add_route(handler2, '/folder/<name>')
app.add_route(person_handler2, '/person/<name:[A-z]>', methods=['GET'])
```
### URL 构建

如果可以匹配URL，那么Sanic可以生成URL吗？当然可以，url_for() 函数就是用于构建指定函数的URL的。它把函数名称作为第一个参数，其余参数对应URL中的变量，例如：
```python
@app.route('/')
async def index(request):
    # generate a URL for the endpoint `post_handler`
    url = app.url_for('post_handler', post_id=5)
    # the URL is `/posts/5`, redirect to it
    return redirect(url)


@app.route('/posts/<post_id>')
async def post_handler(request, post_id):
    return text('Post - {}'.format(post_id))
```
未定义变量会作为URL的查询参数：
```python
url = app.url_for('post_handler', post_id=5, arg_one='one', arg_two='two')
# /posts/5?arg_one=one&arg_two=two

# 支持多值参数
url = app.url_for('post_handler', post_id=5, arg_one=['one', 'two'])
# /posts/5?arg_one=one&arg_one=two
```
## 使用蓝图（Blueprint）

Sanic也提供了和Flask 类似的 Blueprint。

Blueprint有以下用途：

* 把一个应用分解为一套蓝图。这是针对大型应用的理想方案：一个项目可以实例化一个 应用，初始化多个扩展，并注册许多蓝图。
* 在一个应用的 URL 前缀和（或）子域上注册一个蓝图。 URL 前缀和（或）子域的参数 成为蓝图中所有视图的通用视图参数（缺省情况下）。
* 使用不同的 URL 规则在应用中多次注册蓝图。
* 通过蓝图提供模板过滤器、静态文件、模板和其他工具。蓝图不必执行应用或视图 函数。

### blueprint 示例

```python
from sanic import Sanic
from sanic.response import json
from sanic import Blueprint

bp = Blueprint('my_blueprint')

@bp.route('/')
async def bp_root(request):
    return json({'my': 'blueprint'})
    
app = Sanic(__name__)
app.blueprint(bp)

app.run(host='0.0.0.0', port=8000, debug=True)
```
Sanic 使用 app.blueprint() 方法注册blueprint。

### 使用蓝图注册全局中间件

```python
@bp.middleware
async def print_on_request(request):
    print("I am a spy")

@bp.middleware('request')
async def halt_request(request):
    return text('I halted the request')

@bp.middleware('response')
async def halt_response(request, response):
    return text('I halted the response')
```

### 使用蓝图处理异常

```python
@bp.exception(NotFound)
def ignore_404s(request, exception):
    return text("Yep, I totally found the page: {}".format(request.url))
```

### 使用蓝图处理静态文件

第一个参数指向当前的Python包
第二个参数是静态文件的目录

```python
bp.static('/folder/to/serve', '/web/path')
```

### 使用url_for

如果要创建页面链接，可以和通常一样使用 url_for() 函数，只是要把蓝图名称作为端点的前缀，并且用一个点（ . ）来 分隔:

```python
@blueprint_v1.route('/')
async def root(request):
    url = app.url_for('v1.post_handler', post_id=5) # --> '/v1/post/5'
    return redirect(url)


@blueprint_v1.route('/post/<post_id>')
async def post_handler(request, post_id):
    return text('Post {} in Blueprint V1'.format(post_id))
```

## 操作请求数据

对于web 应用来说对客户端向服务器发送的数据做出相应很重要，在Sanic中由传入的参数 request来提供请求信息。

> <section class="caption">为什么不像Flask 一样提供一个全局变量 request？</section>
> Flask 是同步请求，每次请求都有一个独立的新线程来处理，这个线程中也只处理这一个请求。而Sanic是基于协程的处理方式，一个线程可以同时处理几个、几十个甚至几百个请求，把request作为全局变量显然会比较难以处理。

Request 对象常用参数有 
#### json（any）  json body

```python
from sanic.response import json

@app.route("/json")
def post_json(request):
    return json({ "received": True, "message": request.json })
```


#### args（dict）  URL请求参数
?key1=value1&key2=value2  将转变为
```json
{'key1': ['value1'], 'key2': ['value2']}
```


#### raw_args（dict） 和args 类似
?key1=value1&key2=value2  将转变为
```json
{'key1': 'value1', 'key2': 'value2'}
```
#### form（dict）处理 POST 表单请求，数据是一个字典
#### body（bytes）处理POST 表单请求，数据是一个字符串

其他参数还有:
* file
* ip
* app
* url
* scheme
* path
* query_string

详细信息参考文档: [Request Data](http://sanic.readthedocs.io/en/latest/sanic/request_data.html)

## 关于响应

Sanic使用response 函数创建响应对象。

* 文本 `response.text('hello world')`
* html `response.html('<p>hello world</p>')`
* json `response.json({'hello': 'world'})`
* file `response.file('/srv/www/hello.txt')`
* streaming 

```python
from sanic import response

@app.route("/streaming")
async def index(request):
    async def streaming_fn(response):
        response.write('foo')
        response.write('bar')
    return response.stream(streaming_fn, content_type='text/plain')
```
* redirect `response.file('/json')`
* raw `response.raw('raw data')`
* 如果想修改响应的headers可以传入headers 参数

```python
from sanic import response

@app.route('/json')
def handle_request(request):
    return response.json(
        {'message': 'Hello world!'},
        headers={'X-Served-By': 'sanic'},
        status=200
    )
```
## 配置管理

应用总是需要一定的配置的。根据应用环境不同，会需要不同的配置。比如开关调试 模式、设置密钥以及其他依赖于环境的东西。
Sanic 的设计思路是在应用开始时载入配置。你可以在代码中直接硬编码写入配置，也可以使用配置文件。

不管你使用何种方式载入配置，都可以使用 Sanic 的 config 属性来操作配置的值。 Sanic 本身就使用这个对象来保存 一些配置，扩展也可以使用这个对象保存配置。同时这也是你保存配置的地方。
### 配置入门
config 实质上是一个字典的子类，可以像字典一样操作：
```python
app = Sanic('myapp')
app.config.DB_NAME = 'appdb'
app.config.DB_USER = 'appuser'
```
也可以一次更新多个配置：

```python
db_settings = {
    'DB_HOST': 'localhost',
    'DB_NAME': 'appdb',
    'DB_USER': 'appuser'
}
app.config.update(db_settings)
```
### 从对象导入配置
```python
import myapp.default_settings

app = Sanic('myapp')
app.config.from_object(myapp.default_settings)
```
这里是我写的聊天机器人的真实配置示例：[https://github.com/gusibi/momo/](https://github.com/gusibi/momo/blob/master/app.py#L17)

### 使用配置文件
如果把配置放在一个单独的文件中会更有用。理想情况下配置文件应当放在应用包的 外面。这样可以在修改配置文件时不影响应用的打包与分发
常见用法如下:
```python
app = Sanic('myapp')
app.config.from_envvar('MYAPP_SETTINGS')
```
首先从 myapp.default_settings 模块载入配置，然后根据 MYAPP_SETTINGS 环境变量所指向的文件的内容重载配置的值。在 启动服务器前，在 Linux 或 OS X 操作系统中，这个环境变量可以在终端中使用 export 命令来设置:
```bash
$ export MYAPP_SETTINGS=/path/to/config_file
$ python myapp.py
```

## 部署
Sanic 项目还不是特别成熟，现在部署比较简陋。对Gunicorn的支持也不完善。
详细信息可以 看下这个问题 [Projects built with sanic?](https://github.com/channelcat/sanic/issues/396)

先在说下我的部署方式
### 使用 supervisord 部署

supervisord 配置文件： [https://github.com/gusibi/momo/blob/master/supervisord.conf](https://github.com/gusibi/momo/blob/master/supervisord.conf)

启动 方式

```bash
supervisord -c supervisor.conf
```

## 总结
试用了下Sanic，把之前的一个聊天机器人从Flask 改成了 Sanic。不得不说，如果你有Flask经验，大致看一下Sanic文档就可以直接上手了。
并且Sanic 的速度比Flask 快很多，只是Sanic配套的包还是太少，用于生产环境有一定的风险。

最后对聊天微信聊天机器人感兴趣的可以看下[https://github.com/gusibi/momo](https://github.com/gusibi/momo)。

## 预告

下一篇将介绍如何使用 Sanic 一步一步创建一个 聊天机器人。

## 参考链接
* [uvloop: Blazing fast Python networking](https://magic.io/blog/uvloop-blazing-fast-python-networking)
* [Sanic Githu 地址](https://github.com/channelcat/sanic)
* [Sanic 文档](http://sanic.readthedocs.io/en/latest/)
- - - - -
最后，感谢女朋友支持。

|>欢迎关注 | >请我喝芬达|
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)

## 彩蛋
**魔魔是我们家巴哥的名字**
贴一张魔魔的照片结束本篇文章。

![](http://media.gusibi.mobi/ocViYNLQGTk_wX2aGhazWKH_q2kkpJkxAosa8f8NbLFLBdHt78dEDYRGklBbBT1J)

