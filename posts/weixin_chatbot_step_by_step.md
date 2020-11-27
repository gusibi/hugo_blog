---
title: '微信公号DIY：一小时搭建微信聊天机器人'
date: 2017-07-05 15:47:13
tags: [python,tutorial,weixin,公众号]
published: true
hideInList: false
feature: 
isTop: false
---

> 最近借用了女朋友的公号，感觉如果只是用来发文章，太浪费微信给提供的这些功能了。想了想，先从最简单的开始，做一个聊天机器人吧。

使用Python实现聊天机器人的方案有多种：AIML、chatterBot以及图灵聊天机器人和微软小冰等。

考虑到以后可能会做一些定制化的需求，这里我选择了`chatterBot`（[github 项目地址：https://github.com/gunthercox/ChatterBot](https://github.com/gunthercox/ChatterBot))。

chatterbot是一款python接口的，基于一系列规则和机器学习算法完成的聊天机器人。具有结构清晰，可扩展性好，简单实用的特点。



chatterBot 的工作流程如图：

![chatterBot 工作流程](http://media.gusibi.mobi/l-OywTEmN9B6u_RevUWyUpAD9yeHyChmh55q7fIObhC82Wf9X-DTxCF6oGI4tqG7)

1. 输入模块（input adapter）从终端或者API等输入源获取数据
2. 输入源会被指定的逻辑处理模块（logic Adapter）分别处理，逻辑处理模块会匹配训练集中已知的最接近输入数据句子A，然后根据句子A去找到相关度最高的结果B，如果有多个逻辑处理模块返回了不同的结果，会返回一个相关度最高的结果。
3. 输出模块（output adapter）将匹配到的结果返回给终端或者API。


值得一说的是chatterBot 是一个模块化的项目，分为 input Adapter、logic Adapter、storage Adapter、output Adapter以及Trainer 模块。

logic Adapter是一个插件式设计，主进程在启动时会将用户定义的所有逻辑处理插件添加到logic context中，然后交MultiLogicAdapter 进行处理，MultiLogicAdapter 依次调用每个 logic Adapter，logic Adapter 被调用时先执行can_process 方式判断输入是否可以命中这个逻辑处理插件。比如”今天天气怎么样“这样的问题显然需要命中天气逻辑处理插件，这时时间逻辑处理插件的can_process 则会返回False。在命中后logic Adapter 负责计算出对应的回答（Statement对象）以及可信度（confidence），MultiLogicAdapter会取可信度最高的回答，并进入下一步。

下面我们来看下 chatterBot 如何使用

## chatterBot 安装&使用

### 安装

chatterBot 是使用Python编写的，可以使用 pip 安装：

```bash
pip install chatterbot
```

> chatterBot 的中文对话要求Python3 以上版本，建议在Python3.x 环境下开发

### 测试

打开iPython，输入测试一下

```bash
In [1]: from chatterbot import ChatBot  # import ChatBot

In [2]: momo = ChatBot('Momo', trainer='chatterbot.trainers.ChatterBotCorpusTrainer')
/Users/gs/.virtualenvs/py3/lib/python3.6/site-packages/chatterbot/storage/jsonfile.py:26: UnsuitableForProductionWarning: The JsonFileStorageAdapter is not recommended for production environments.
  self.UnsuitableForProductionWarning  # 这里storage adapter 默认使用的是 json 格式存储数据的，如果想在服务端部署，应该避免使用这种格式，因为实在是太慢了

In [3]: momo.train("chatterbot.corpus.chinese")  # 指定训练集，这里我们使用中文

# 下边是对话结果
In [4]: momo.get_response('你好')
Out[4]: <Statement text:你好>

In [5]: momo.get_response('怎么了')
Out[5]: <Statement text:没什么.>

In [6]: momo.get_response('你知道它的所有内容吗?')
Out[6]: <Statement text:优美胜于丑陋.>

In [7]: momo.get_response('你是一个程序员吗?')
Out[7]: <Statement text:我是个程序员>

In [8]: momo.get_response('你使用什么语言呢？')
Out[8]: <Statement text:我经常使用 Python, Java 和 C++ .>
```

这时你已经可以和机器人对话了，不过现在由于训练数据太少，机器人只能返回简单的对话。
> 这里是默认的中文对话训练数据 [中文训练数据地址：https://github.com/gunthercox/chatterbot-corpus/tree/master/chatterbot_corpus/data/chinese](https://github.com/gunthercox/chatterbot-corpus/tree/master/chatterbot_corpus/data/chinese)。

那么我们怎么添加训练数据呢？

### 训练机器人

chatterBot 内置了training class，自带的方法有两种，一种是使用通过输入list 来训练，比如 ["你好", "我不好"]，后者是前者的回答，另一种是通过导入Corpus 格式的文件来训练。也支持自定义的训练模块，不过最终都是转为上述两种类型。

chatterBot 通过调用 train() 函数训练，不过在这之前要先用 set_trainer() 来进行设置。例如：

```bash
In [12]: from chatterbot.trainers import ListTrainer  # 导入训练模块的 ListTrainer 类

In [13]: momo.get_response('你叫什么?')  # 现在是答非所问，因为在这之前我们并没有训练过
Out[13]: <Statement text:我在烤蛋糕.>

In [14]: momo.set_trainer(ListTrainer)  # 指定训练方式

In [15]: momo.train(['你叫什么?', '我叫魔魔！'])  # 训练

In [16]: momo.get_response('你叫什么?')  # 现在机器人已经可以回答了
Out[16]: <Statement text:我叫魔魔！>
```

训练好的数据默认存在 ./database.db，这里使用的是 jsondb。

对 chatterBot 的介绍先到这里，具体用法可以参考文档：[ChatterBot Tutorial：http://chatterbot.readthedocs.io/en/stable/tutorial.html](http://chatterbot.readthedocs.io/en/stable/tutorial.html)

接下来，介绍如何在项目中使用 chatterBot。

## 使用 Sanic 创建项目

Sanic 是一个和类Flask 的基于Python3.5+的web框架，它编写的代码速度特别快。

除了像Flask 以外，Sanic 还支持以异步请求的方式处理请求。这意味着你可以使用新的 async/await 语法，编写非阻塞的快速的代码。

对 Sanic 不了解的可以参考我之前的一篇文章： [python web 框架 Sanci 快速入门](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752001&idx=1&sn=2c2e84f5f493514fdbff482a28dd7551&chksm=80b0b86bb7c7317df9d1c7b13411a231b91bb107de5e99c5379a3d9d072d5d3fb8117f364188#rd)，可以在公号输入 【sanic】获取文章地址。

这里之所以使用 Sanic 是因为他和Flask 非常像，之前我一直使用Flask，并且它也是专门为Python3.5 写的，使用到了协程。

首先建个项目，这里项目我已经建好了，项目结构如下：

```sh
.
├── LICENSE
├── README.md
├── manage.py   # 运行文件 启动项目 使用 python manage.py 命令
├── momo
│   ├── __init__.py
│   ├── app.py          # 创建app 模块
│   ├── helper.py  
│   ├── settings.py     # 应用配置
│   └── views
│       ├── __init__.py
│       ├── hello.py    # 测试模块
│       └── mweixin.py  # 微信消息处理模块
├── requirements.txt
└── supervisord.conf
```
源码我已经上传到github，有兴趣的可以看一下，也可以直接拉下来测试。
[项目代码地址](https://github.com/gusibi/momo/tree/chatterbot)

我们先重点看下 `hello.py` 文件 和 `helper.py `。

```python
# hello.py
# -*- coding: utf-8 -*-

from sanic import Sanic, Blueprint
from sanic.views import HTTPMethodView
from sanic.response import text

from momo.helper import get_momo_answer  # 导入获取机器人回答获取函数


blueprint = Blueprint('index', url_prefix='/')


class ChatBot(HTTPMethodView):
    # 聊天机器人 http 请求处理逻辑
    async def get(self, request):
        ask = request.args.get('ask')
        # 先获取url 参数值 如果没有值，返回 '你说啥'
        if ask:
            answer = get_momo_answer(ask)
            return text(answer)
        return text('你说啥?')


blueprint.add_route(ChatBot.as_view(), '/momo')
```

```python
# helper.py
from chatterbot import ChatBot

momo_chat = ChatBot(
    'Momo',
    # 指定存储方式 使用mongodb 存储数据
    storage_adapter='chatterbot.storage.MongoDatabaseAdapter',
    # 指定 logic adpater 这里我们指定三个
    logic_adapters=[
        "chatterbot.logic.BestMatch", 
        "chatterbot.logic.MathematicalEvaluation",  # 数学模块
        "chatterbot.logic.TimeLogicAdapter",   # 时间模块
    ],
    input_adapter='chatterbot.input.VariableInputTypeAdapter',
    output_adapter='chatterbot.output.OutputAdapter',
    database='chatterbot',
    read_only=True
)


def get_momo_answer(content):
    # 获取机器人返回结果函数
    response = momo_chat.get_response(content)
    if isinstance(response, str):
        return response
    return response.text

```
运行命令 `python manage.py` 启动项目。

在浏览器访问url： [http://0.0.0.0:8000/momo?ask=你是程序员吗](http://0.0.0.0:8000/momo?ask=你是程序员吗)

![运行结果](http://media.gusibi.mobi/3l0HV4l5N473KqwM6C35IW78zP5j0qybSymjK4HHzeFj3KbMkH3jS7W_kpsF-EtX)

到这里，我们已经启动了一个web 项目，可以通过访问url 的方式和机器人对话，是时候接入微信公号了！

## 接入微信公众号

### 前提

1. 拥有一个可以使用的微信公众号（订阅号服务号都可以，如果没有，可以使用微信提供的测试账号）
2. 拥有一个外网可以访问的服务器（vps 或公有云都可以 aws 新用户免费使用一年，可以试试）
3. 服务器配置了python3 环境，（建议使用 virtualenvwrapper 配置虚拟环境）

### 微信设置

登录微信公众号： [https://mp.weixin.qq.com](https://mp.weixin.qq.com)

#### 打开：开发>基本配置
查看公号开发信息：

![公号基本信息](http://media.gusibi.mobi/JZqW6bMs4_qRB-XnMoPZNMHWUh3uI3l482UTg6EbkrN0KZSisiloqhV4uCBuLPYP)

#### 开启服务器配置：
**设置请求url，这里是你配置的url（需要外网可访问，只能是80或443端口）**

![开启服务器配置](http://media.gusibi.mobi/gx5Ssn4Taoq-BDMJ0Dty56ks7IkWR9ruCn5oMYuXEUMDeNj8YgCSM8caxI3AVzcu)
填写token和EncodingAESKey，这里我选择的是兼容模式，既有明文方便调试，又有信息加密。

![配置服务器](http://media.gusibi.mobi/CghRlbwDFA2-U2I9mOZZZitRiT-gRnj433UPHuRMh9jEEbUMuzE8PfrmCc9lZqNk)

详细配置可以参考官方文档：[接入指南](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1445241432)

如果你的 `服务器地址` 已经配置完成，现在点击提交应该就成功了。如果没有成功我们接下来看怎么配置服务器地址。

### 代码示例

先看下 微信请求的视图代码：

```python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from six import StringIO

import re
import xmltodict
from chatterbot.trainers import ListTrainer

from sanic import Blueprint
from sanic.views import HTTPMethodView
from sanic.response import text
from sanic.exceptions import ServerError

from weixin import WeixinMpAPI
from weixin.lib.WXBizMsgCrypt import WXBizMsgCrypt

from momo.settings import Config

blueprint = Blueprint('weixin', url_prefix='/weixin')


class WXRequestView(HTTPMethodView):

    def _get_args(self, request):
        # 获取微信请求参数，加上token  拼接为完整的请求参数
        params = request.raw_args
        if not params:
            raise ServerError("invalid params", status_code=400)
        args = {
            'mp_token': Config.WEIXINMP_TOKEN,
            'signature': params.get('signature'),
            'timestamp': params.get('timestamp'),
            'echostr': params.get('echostr'),
            'nonce': params.get('nonce'),
        }
        return args

    def get(self, request):
        # 微信验证服务器这一步是get  请求，参数可以使用 request.raw_args 获取
        args = self._get_args(request)
        weixin = WeixinMpAPI(**args) # 这里我使用了 第三方包 python-weixin 可以直接实例化一个WeixinMpAPI对象
        if weixin.validate_signature(): # 验证参数合法性
            # 如果参数争取，我们将微信发过来的echostr参数再返回给微信，否则返回 fail
            return text(args.get('echostr') or 'fail')
        return text('fail')
        
blueprint.add_route(WXRequestView.as_view(), '/request')
```
这里处理微信请求我使用的是 我用python 写的 微信SDK [python-weixin](https://github.com/gusibi/python-weixin)，可以使用 pip 安装：

```bash
pip install python-weixin
```

这个包最新版本对Python3 加密解密有点问题，可以直接从github 安装:

```bash
pip install git+https://github.com/zongxiao/python-weixin.git@py3
```

然后更新 app.py 文件：

```python
# -*- coding: utf-8 -*-
from sanic import Sanic
from momo.settings import Config


def create_app(register_bp=True, test=False):
    # 创建app    
    app = Sanic(__name__)
    if test:
        app.config['TESTING'] = True
    # 从object 导入配置
    app.config.from_object(Config)
    register_blueprints(app)
    return app


def register_blueprints(app):
    from momo.views.hello import blueprint as hello_bp
    from momo.views.mweixin import blueprint as wx_bp
    app.register_blueprint(hello_bp)
    # 注册 wx_bp 
    app.register_blueprint(wx_bp)
```

详细代码参考github: [微信聊天机器人 momo](https://github.com/gusibi/momo/tree/chatterbot)

## 接入聊天机器人

现在我们公号已经接入了自己的服务，是时候接入微信聊天机器人。

微信聊天机器人的工作流程如下：

![微信聊天机器人工作流程](http://media.gusibi.mobi/p88CrkRItlwU7VXo7uihsd9DPV-vSexkuXqKuQ1ZJGlFrFT25AzhvkFh2Aqc6Ajn)

看我们消息逻辑处理代码：

```python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from six import StringIO

import re
import xmltodict
from chatterbot.trainers import ListTrainer

from sanic import Blueprint
from sanic.views import HTTPMethodView
from sanic.response import text
from sanic.exceptions import ServerError

from weixin import WeixinMpAPI
from weixin.reply import TextReply
from weixin.response import WXResponse as _WXResponse
from weixin.lib.WXBizMsgCrypt import WXBizMsgCrypt

from momo.settings import Config
from momo.helper import validate_xml, smart_str, get_momo_answer
from momo.media import media_fetch


blueprint = Blueprint('weixin', url_prefix='/weixin')

appid = smart_str(Config.WEIXINMP_APPID)
token = smart_str(Config.WEIXINMP_TOKEN)
encoding_aeskey = smart_str(Config.WEIXINMP_ENCODINGAESKEY)

# 关注后自动返回的文案
AUTO_REPLY_CONTENT = """
Hi，朋友！
这是我妈四月的公号，我是魔魔，我可以陪你聊天呦！
我还能"记账"，输入"记账"会有惊喜呦！
<a href="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzAwNjI5MjAzNw==&scene=124#wechat_redirect">历史记录</a>
"""


class ReplyContent(object):

    _source = 'value'

    def __init__(self, event, keyword, content=None, momo=True):
        self.momo = momo
        self.event = event
        self.content = content
        self.keyword = keyword
        if self.event == 'scan':
            pass

    @property
    def value(self):
        if self.momo:
            answer = get_momo_answer(self.content)
            return answer
        return ''


class WXResponse(_WXResponse):

    auto_reply_content = AUTO_REPLY_CONTENT

    def _subscribe_event_handler(self):
        # 关注公号后的处理逻辑
        self.reply_params['content'] = self.auto_reply_content
        self.reply = TextReply(**self.reply_params).render()

    def _unsubscribe_event_handler(self):
        # 取关后的处理逻辑，取关我估计会哭吧
        pass

    def _text_msg_handler(self):
        # 文字消息处理逻辑 聊天机器人的主要逻辑
        event_key = 'text'
        content = self.data.get('Content')
        reply_content = ReplyContent('text', event_key, content)
        self.reply_params['content'] = reply_content.value
        self.reply = TextReply(**self.reply_params).render()


class WXRequestView(HTTPMethodView):

    def _get_args(self, request):
        params = request.raw_args
        if not params:
            raise ServerError("invalid params", status_code=400)
        args = {
            'mp_token': Config.WEIXINMP_TOKEN,
            'signature': params.get('signature'),
            'timestamp': params.get('timestamp'),
            'echostr': params.get('echostr'),
            'nonce': params.get('nonce'),
        }
        return args

    def get(self, request):
        args = self._get_args(request)
        weixin = WeixinMpAPI(**args)
        if weixin.validate_signature():
            return text(args.get('echostr') or 'fail')
        return text('fail')

    def _get_xml(self, data):
        post_str = smart_str(data)
        # 验证xml 格式是否正确
        validate_xml(StringIO(post_str))
        return post_str

    def _decrypt_xml(self, params, crypt, xml_str):
        # 解密消息
        nonce = params.get('nonce')
        msg_sign = params.get('msg_signature')
        timestamp = params.get('timestamp')
        ret, decryp_xml = crypt.DecryptMsg(xml_str, msg_sign,
                                           timestamp, nonce)
        return decryp_xml, nonce

    def _encryp_xml(self, crypt, to_xml, nonce):
        # 加密消息
        to_xml = smart_str(to_xml)
        ret, encrypt_xml = crypt.EncryptMsg(to_xml, nonce)
        return encrypt_xml

    def post(self, request):
        # 获取微信服务器发送的请求参数
        args = self._get_args(request)
        weixin = WeixinMpAPI(**args)
        if not weixin.validate_signature(): # 验证参数合法性
            raise AttributeError("Invalid weixin signature")
        xml_str = self._get_xml(request.body)  # 获取form data
        crypt = WXBizMsgCrypt(token, encoding_aeskey, appid) 
        decryp_xml, nonce = self._decrypt_xml(request.raw_args, crypt, xml_str) # 解密
        xml_dict = xmltodict.parse(decryp_xml)
        xml = WXResponse(xml_dict)() or 'success' # 使用WXResponse 根据消息获取机器人返回值
        encryp_xml = self._encryp_xml(crypt, xml, nonce) # 加密消息
        return text(encryp_xml or xml) # 回应微信请求


blueprint.add_route(WXRequestView.as_view(), '/request')

```

可以看到，我处理微信请求返回结果比较简单，也是使用的 python-weixin 包封装的接口，
主要的处理逻辑是 WXResponse。

这里需要注意的是，如果服务器在5秒内没有响应微信服务器会重试。为了加快响应速度，不要在服务器 将 chatterBot 的 storage adapter 设置为使用 jsondb。

上边这些就是，微信聊天机器人的主要处理逻辑，我们运行服务，示例如下：

![聊天示例图](http://media.gusibi.mobi/gdLue88YMxJcy0hDqcWntqUHl_ekWu99WXe_vbphQy5TetIuESae-M6lEaWw2WqP)

可以看到这里聊天机器人也可以做简单的数学运算和报时，是因为我在上边指定处理逻辑的时候添加了数学模块和时间模块：

```python
momo_chat = ChatBot(
    'Momo',
    # 指定存储方式 使用mongodb 存储数据
    storage_adapter='chatterbot.storage.MongoDatabaseAdapter',
    # 指定 logic adpater 这里我们指定三个
    logic_adapters=[
        "chatterbot.logic.BestMatch", 
        "chatterbot.logic.MathematicalEvaluation",  # 数学模块
        "chatterbot.logic.TimeLogicAdapter",   # 时间模块
    ],
    input_adapter='chatterbot.input.VariableInputTypeAdapter',
    output_adapter='chatterbot.output.OutputAdapter',
    database='chatterbot',
    read_only=True
)
```

到这里，微信机器人的搭建就完成了，详细代码已经长传到了 [github: https://github.com/gusibi/momo/tree/chatterbot](https://github.com/gusibi/momo/tree/chatterbot)，感兴趣的可以参考一下。

## 参考链接

* [ChatterBot 项目地址：https://github.com/gunthercox/ChatterBot](https://github.com/gunthercox/ChatterBot)
* [ChatterBot Tutorial：http://chatterbot.readthedocs.io/en/stable/tutorial.html](http://chatterbot.readthedocs.io/en/stable/tutorial.html)
* [用Python快速实现一个聊天机器人：http://www.jianshu.com/p/d1333fde266f](http://www.jianshu.com/p/d1333fde266f)
* [基于Python-ChatterBot搭建不同adapter的聊天机器人：https://ask.hellobi.com/blog/guodongwei1991/7626](https://ask.hellobi.com/blog/guodongwei1991/7626)
* [擁有自動學習的 Python 機器人 - ChatterBot：https://kantai235.github.io/2017/03/16/ChatterBotTeaching/](https://kantai235.github.io/2017/03/16/ChatterBotTeaching/)
* [使用 ChatterBot构建聊天机器人：https://www.biaodianfu.com/chatterbot.html](https://www.biaodianfu.com/chatterbot.html)
* [python-weixin sdk: https://github.com/gusibi/python-weixin](https://github.com/gusibi/python-weixin)

## 预告

这里，聊天机器人还是比较简单的只能回复简单的对话，下一篇将要结束如何在公号训练机器人以及一个更实用的功能，如何让公号变成一个博客写作助手。

------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)