+++
date = "2016-09-05T17:59:45+08:00"
draft = false
title = "网站微信登录－python 实现"
tags = ["python"]
categories = ["Development"]
slug = "weixin-python-login"

+++

最近我们的网站要加微信登录功能，找了python sdk 感觉都不满意，然后就参考instagram python sdk 自己造了轮子。

轮子 github 地址  [python-weixin](https://github.com/gusibi/python-weixin)

### 根据需求选择相应的登录方式

微信现在提供两种登录接入方式

* 移动应用微信登录
* 网站应用微信登录

*这里我们使用的是网站应用微信登录*

按照 官方流程

1. 注册并通过开放平台开发者资质认证

注册微信开放平台帐号后，在帐号中心中填写开发者资质认证申请，并等待认证通过。

2. 创建网站应用

通过填写网站应用名称、简介和图标，以及各平台下载地址等资料，创建网站应用

3. 接入微信登录

在资源中心查阅网站应用开发文档,开发接入微信登陆功能，让用户可使用微信登录你的网站应用
 

如果已经完成上面的操作，请继续往下看
 

微信网站应用微信登录是基于OAuth2.0协议标准构建的微信OAuth2.0授权登录系统。

微信OAuth2.0授权登录目前支持authorization_code模式，适用于拥有server端的应用授权。该模式整体流程为：

1. 第三方发起微信授权登录请求，微信用户允许授权第三方应用后，微信会拉起应用或重定向到第三方网站，并且带上授权临时票据code参数；
2. 通过code参数加上AppID和AppSecret等，通过API换取access_token；
3. 通过access_token进行接口调用，获取用户基本数据资源或帮助用户实现基本操作。

-------

#### 获取access_token 时序图

![获取access_token 时序图](https://res.wx.qq.com/open/zh_CN/htmledition/res/img/pic/web-wxlogin/12168b9.png)
 

具体流程请参考官方文档，我们这里只说一下python的实现方法。官方文档地址 [点这里](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&lang=zh_CN&token=db685a316b7e3933cae42c5ca91d4e024125d1b8&appid=wx6d8c79fb64de6c08)
 

参考python-instagram 我写了一个 [python-weixin] (https://github.com/gusibi/python-weixin)一个微信python SDK

不过现在还只有微信接入、获取用户信息、 刷新refresh_token 等简单功能

-------
### 安装 

#### 方法一 手动安装
1. 首先 需要把代码clone到本地
2. python setup.py install

#### 方法二 pip install

{{< highlight shell >}}

pip install git+https://github.com/gusibi/python-weixin.git@master

{{</highlight>}}

-------

### 使用方式

{{< highlight python >}}

from weixin.client import WeixinAPI

APP_ID = 'your app id'
APP_SECRET = 'your app secret'
REDIRECT_URI = 'http://your_domain.com/redirect_uri'  # 这里一定要注意 地址一定要加上http/https

scope = ("snsapi_login", )
api = WeixinAPI(appid=APP_ID,
                app_secret=APP_SECRET,
                redirect_uri=REDIRECT_URI)

authorize_url = api.get_authorize_url(scope=scope)
{{< /highlight >}}

现在将 authorize_url地址(如 http://yoursite.com/login/weixin)在浏览器打开， 将跳转到微信登录页面，使用手机扫码登录后将跳转到

http://your_domain.com/redirect_uri?code=CODE&state=STATE 页面

现在我们就可以使用code 来获取登录的 access_token

{{< highlight python >}}
access_token = api.exchange_code_for_access_token(code=code)
{{< /highlight >}}

access_token 信息为

{{< highlight python >}}
{ 
"access_token":"ACCESS_TOKEN", 
"expires_in":7200, 
"refresh_token":"REFRESH_TOKEN",
"openid":"OPENID", 
"scope":"SCOPE" 
}
{{< /highlight >}}

|参数	|说明|
| ------------- |:-------------|
|access_token	|接口调用凭证（有效期目前为2个小时）|
|expires_in	|access_token接口调用凭证超时时间，单位（秒）|
|refresh_token	|用户刷新access_token（有效期目前为30天）|
|openid	|授权用户唯一标识|
|scope	|用户授权的作用域，使用逗号（,）分隔|
 

获取access_token后，就可以进行接口调用，有以下前提：

1. access_token有效且未超时；
2. 微信用户已授权给第三方应用帐号相应接口作用域（scope）。

对于接口作用域（scope），能调用的接口有以下：

| 授权作用域（scope）|接口| 接口说明|
| ------------- |:------------- |:-----|
| snsapi_base|/sns/oauth2/access_token	|通过code换取access_token、refresh_token和已授权scope|
| snsapi_base| /sns/oauth2/refresh_token	|刷新或续期access_token使用|
| snsapi_base| /sns/auth	|检查access_token有效性|
| snsapi_userinfo|/sns/userinfo	|获取用户个人信息|
 

{{< highlight python >}}
api = WeixinAPI(appid=APP_ID,
                app_secret=APP_SECRET,
                redirect_uri=REDIRECT_URI)

# 刷新或续期access_token使用
refresh_token = api.exchange_refresh_token_for_access_token(refresh_token=auth_info['refresh_token'])

api = WeixinAPI(access_token=auth_info['access_token'])

# 获取用户个人信息
user = api.user(openid=auth_info['openid'])

# 检查access_token有效性
v = api.validate_token(openid=auth_info['openid'])
{{< /highlight >}}
 

现在就微信登录就完成了

-------

下面是用 flask 实现的完整的例子

{{< highlight python >}}
from flask import Flask
from flask import Markup
from flask import redirect
from flask import request
from flask import jsonify

from weixin.client import WeixinAPI
from weixin.oauth2 import OAuth2AuthExchangeError

app = Flask(__name__)

APP_ID = 'appid'
APP_SECRET = 'app secret'
REDIRECT_URI = 'http://localhost.com/authorization'


@app.route("/authorization")
def authorization():
    code = request.args.get('code')
    api = WeixinAPI(appid=APP_ID,
                    app_secret=APP_SECRET,
                    redirect_uri=REDIRECT_URI)
    auth_info = api.exchange_code_for_access_token(code=code)
    api = WeixinAPI(access_token=auth_info['access_token'])
    resp = api.user(openid=auth_info['openid'])
    return jsonify(resp)


@app.route("/login")
def login():
    api = WeixinAPI(appid=APP_ID,
                    app_secret=APP_SECRET,
                    redirect_uri=REDIRECT_URI)
    redirect_uri = api.get_authorize_login_url(scope=("snsapi_login",))
    return redirect(redirect_uri)


@app.route("/")
def hello():
    return Markup('<a href="%s">weixin login!</a>') % '/login'

if __name__ == "__main__":
    app.run(debug=True)
 
{{< /highlight >}}

#### 参考链接：

* [微信网站应用接入文档](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&lang=zh_CN&token=db685a316b7e3933cae42c5ca91d4e024125d1b8&appid=wx6d8c79fb64de6c08)
* [网站应用创建地址](https://open.weixin.qq.com/cgi-bin/frame?t=home/web_tmpl&lang=zh_CN)
* [python-weixin]  (https://github.com/gusibi/python-weixin)
