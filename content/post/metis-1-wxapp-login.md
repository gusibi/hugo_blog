---
categories: ["development", "python", "微信小程序"]
date: 2017-07-30T212:17:13+08:00
description:  python sanic 实现微信小程序登录注册
draft: false
slug: wxapp-dev-how-to-login-and-register-by-python-sanic
tags: ["python", "tutorial", "weixin", "小程序"]
title: 小程序开发：python sanic 实现小程序登录注册
---

开发微信小程序时，接入小程序的授权登录可以快速实现用户注册登录的步骤，是快速建立用户体系的重要一步。这篇文章将介绍 python + sanic + 微信小程序实现用户快速注册登录全栈方案。

**微信小程序登录时序图如下：**

![登录时序图](https://mp.weixin.qq.com/debug/wxadoc/dev/image/login.png?t=2017727)

这个流程分为两大部分：
1. 小程序使用 wx.login() API 获取 code，调用 wx.getUserInfo() API 获取 encryptedData 和 iv，然后将这三个信息发送给第三方服务器。
2. 第三方服务器获取到 code、encryptedData和 iv 后，使用 code 换取 session_key，然后将 session_key 利用 encryptedData 和 iv 解密在服务端获取用户信息。根据用户信息返回 jwt 数据，完成登录。

下面我们先看一下小程序提供的 API。

## 小程序登录 API

在这个授权登录的过程中，用到的 API 如下：

* wx.login
* wx.getUserInfo

`wx.chekSession` 是可选的，这里并没有用到。

### wx.login(OBJECT)

调用此接口可以获取登录凭证（code），以用来换取用户登录态信息，包括用户的唯一标识（openid） 及本次登录的 会话密钥（session_key）。

如果接口调用成功，返回结果如下：

参数名 | 类型 | 说明
------|------|------
errMsg |String| 调用结果
code  |String| 用户允许登录后，回调内容会带上 code（有效期五分钟），开发者需要将 code 发送到开发者服务器后台，使用code 换取 session_key api，将 code 换成 openid 和 session_key

#### code 换取 session_key 

开发者服务器使用登录凭证 code 获取 session_key 和 openid。其中 session_key 是对用户数据进行加密签名的密钥。为了自身应用安全，session_key 不应该在网络上传输。所以这一步应该在服务器端实现。

### wx.getUserInfo

此接口用来获取用户信息。

> 当 `withCredentials` 为 true 时，要求此前有调用过 wx.login 且登录态尚未过期，此时返回的数据会包含 encryptedData, iv 等敏感信息；当 withCredentials 为 false 时，不要求有登录态，返回的数据不包含 encryptedData, iv 等敏感信息。

接口success 时返回参数如下：

参数名 | 类型 | 说明
------|------|------
userInfo |	OBJECT|	用户信息对象，不包含 openid 等敏感信息
rawData	| String |	不包括敏感信息的原始数据字符串，用于计算签名。
signature | 	String |	使用 sha1( rawData + sessionkey ) 得到字符串，用于校验用户信息，参考文档 signature。
encryptedData	|String |	包括敏感数据在内的完整用户信息的加密数据，详细见加密数据解密算法
iv	| String	| 加密算法的初始向量，详细见加密数据解密算法

`encryptedData` 解密后为以下 json 结构，详见加密数据解密算法

```json
{
    "openId": "OPENID",
    "nickName": "NICKNAME",
    "gender": GENDER,
    "city": "CITY",
    "province": "PROVINCE",
    "country": "COUNTRY",
    "avatarUrl": "AVATARURL",
    "unionId": "UNIONID",
    "watermark":
    {
        "appid":"APPID",
    "timestamp":TIMESTAMP
    }
}
```

> 由于解密 encryptedData 需要 session_key 和 iv 所以，在给服务器端发送授权验证的过程中需要将 code、encryptedData 和 iv 一起发送。

## 服务器端提供的 API

服务器端授权需要提供两个 API：

1. /oauth/token 通过小程序提供的验证信息获取服务器自己的 token
2. /accounts/wxapp 如果登录用户是未注册用户，使用此接口注册为新用户。

### 换取第三方 token（/oauth/token）

开始授权时，小程序调用此 API 尝试换取jwt，如果用户未注册返回401，如果用户发送参数错误，返回403。

接口 获取 jwt 成功时返回参数如下：

参数名 | 类型 | 说明
------|------|------
account_id | string | 当前授权用户的用户 ID
access_token | string | jwt（登录流程中的第三方 session_key
token_type | string | token 类型（固定Bearer）

小程序授权后应该先调用此接口，如果结果是用户未注册，则应该调用新用户注册的接口先注册新用户，注册成功后再调用此接口换取 jwt。

### 新用户注册（/accounts/wxapp）

注册新用户时，服务器端需要存储当前用户的 openid，所以和授权接口一样，请求时需要的参数为 code、encryptedData 和 iv。

注册成功后，将返回用户的 ID 和注册时间。此时，应该再次调用获取 token 的接口去换取第三方 token，以用来下次登录。

## 实现流程

接口定义好之后，来看下前后端整体的授权登录流程。

![小程序授权登录流程](http://media.gusibi.mobi/epM1xSYKuQ84VNnsNMH88km6edqNdkLLNcqYyWxs8UYMsUqlasLvYkmb14FtZF9K)

这个流程需要注意的是，在 C 步（使用 code 换取 session ）之后我们得到 session_key，然后需要用 session_key 解密得到用户数据。

然后使用 openid 判断用户是否已经注册，如果用户已经注册，生成  jwt 返回给小程序。
如果用户未注册返回401， 提示用户未注册。

> `jwt(3rd_session)` 用于第三方服务器和小程序之间做登录态校验，为了保证安全性，jwt 应该满足：
> 1. 足够长。建议有 2^128 组合
> 2. 避免使用 srand(当前时间)，然后 rand() 的方法，而是采用操作系统提供的真正随机数机制。
> 3. 设置一定的有效时间，

当然，在小程序中也可以使用手机号登录，不过这是另一个功能了，就不在这里叙述了。

## 代码实现

说了这么多，接下来看代码吧。

### 小程序端代码

代码逻辑为：

1. 用户在小程序授权
2. 小程序将授权消息发送到服务器，服务器检查用户是否已经注册，如果注册返回 jwt，如果没注册提示用户未注册，然后小程序重新请求注册接口，注册用户，注册成功后重复这一步。

为了简便，这里在小程序 启动的时候就请求授权。代码实现如下。

```javascript
//app.js
var config = require('./config.js')

App({
    onLaunch: function() {
        //调用API从本地缓存中获取数据
        var jwt = wx.getStorageSync('jwt');
        var that = this;
        if (!jwt.access_token){ //检查 jwt 是否存在 如果不存在调用登录
            that.login();
        } else {
            console.log(jwt.account_id);
        }
    },
    login: function() {
        // 登录部分代码
        var that = this;
        wx.login({
            // 调用 login 获取 code
            success: function(res) {
                var code = res.code;
                wx.getUserInfo({
                    // 调用 getUserInfo 获取 encryptedData 和 iv
                    success: function(res) {
                        // success
                        that.globalData.userInfo = res.userInfo;
                        var encryptedData = res.encryptedData || 'encry';
                        var iv = res.iv || 'iv';
                        console.log(config.basic_token);
                        wx.request({ // 发送请求 获取 jwt
                            url: config.host + '/auth/oauth/token?code=' + code,
                            header: {
                                Authorization: config.basic_token
                            },
                            data: {
                                username: encryptedData,
                                password: iv,
                                grant_type: "password",
                                auth_approach: 'wxapp',
                            },
                            method: "POST",
                            success: function(res) {
                                if (res.statusCode === 201) {
                                    // 得到 jwt 后存储到 storage，
                                    wx.showToast({
                                        title: '登录成功',
                                        icon: 'success'
                                    });
                                    wx.setStorage({
                                        key: "jwt",
                                        data: res.data
                                    });
                                    that.globalData.access_token = res.data.access_token;
                                    that.globalData.account_id = res.data.sub;
                                } else if (res.statusCode === 401){
                                    // 如果没有注册调用注册接口
                                    that.register();
                                } else {
                                    // 提示错误信息
                                    wx.showToast({
                                        title: res.data.text,
                                        icon: 'success',
                                        duration: 2000
                                    });
                                }
                            },
                            fail: function(res) {
                                console.log('request token fail');
                            }
                        })
                    },
                    fail: function() {
                        // fail
                    },
                    complete: function() {
                        // complete
                    }
                })
            }
        })

    },
    register: function() {
        // 注册代码
        var that = this;
        wx.login({ // 调用登录接口获取 code
            success: function(res) {
                var code = res.code;
                wx.getUserInfo({
                    // 调用 getUserInfo 获取 encryptedData 和 iv
                    success: function(res) {
                        // success
                        that.globalData.userInfo = res.userInfo;
                        var encryptedData = res.encryptedData || 'encry';
                        var iv = res.iv || 'iv';
                        console.log(iv);
                        wx.request({ // 请求注册用户接口
                            url: config.host + '/auth/accounts/wxapp',
                            header: {
                                Authorization: config.basic_token
                            },
                            data: {
                                username: encryptedData,
                                password: iv,
                                code: code,
                            },
                            method: "POST",
                            success: function(res) {
                                if (res.statusCode === 201) {
                                    wx.showToast({
                                        title: '注册成功',
                                        icon: 'success'
                                    });
                                    that.login();
                                } else if (res.statusCode === 400) {
                                    wx.showToast({
                                        title: '用户已注册',
                                        icon: 'success'
                                    });
                                    that.login();
                                } else if (res.statusCode === 403) {
                                    wx.showToast({
                                        title: res.data.text,
                                        icon: 'success'
                                    });
                                }
                                console.log(res.statusCode);
                                console.log('request token success');
                            },
                            fail: function(res) {
                                console.log('request token fail');
                            }
                        })
                    },
                    fail: function() {
                        // fail
                    },
                    complete: function() {
                        // complete
                    }
                })
            }
        })

    },

    get_user_info: function(jwt) {
        wx.request({
            url: config.host + '/auth/accounts/self',
            header: {
                Authorization: jwt.token_type + ' ' + jwt.access_token
            },
            method: "GET",
            success: function (res) {
                if (res.statusCode === 201) {
                    wx.showToast({
                        title: '已注册',
                        icon: 'success'
                    });
                } else if (res.statusCode === 401 || res.statusCode === 403) {
                    wx.showToast({
                        title: '未注册',
                        icon: 'error'
                    });
                }

                console.log(res.statusCode);
                console.log('request token success');
            },
            fail: function (res) {
                console.log('request token fail');
            }
        })
    },

    globalData: {
        userInfo: null
    }
})
```

### 服务端代码

服务端使用 [`sanic`](https://github.com/channelcat/sanic) 框架 + [`swagger_py_codegen`](https://github.com/guokr/swagger-py-codegen) 生成 rest-api。
数据库使用 MongoDB，[`python-weixin`](https://github.com/gusibi/python-weixin) 实现了登录过程中 code 换取 session_key 以及 encryptedData 解密的功能，所以使用python-weixin 作为 python 微信 sdk 使用。

> 为了过滤无效请求，服务器端要求用户在获取 token 或授权时在 header 中带上 `Authorization` 信息。 `Authorization` 在登录前使用的是 Basic 验证（格式 (Basic hashkey) 注 hashkey为client_id + client_secret 做BASE64处理），只是用来校验请求的客户端是否合法。不过Basic 基本等同于明文，并不能用它来进行严格的授权验证。

> jwt 原理及使用参见 [理解JWT（JSON Web Token）认证及实践](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752020&idx=1&sn=b5e56989a57e9b8067eb6614381a04fd&chksm=80b0b87eb7c73168d7eb1d7f1a95e759b9b0934318571de4f6d2455402e654e6c09d9b022f25)

使用 swagger 生成代码结构如下：

![](http://media.gusibi.mobi/BOj58PeS7fLB1FzEivAQA07SYkXPy3ajaajEXKYDUo05rGTfZSThiPg5Mqi7janu)

由于代码太长，这里只放获取 jwt 的逻辑：

```python
def get_wxapp_userinfo(encrypted_data, iv, code):
    from weixin.lib.wxcrypt import WXBizDataCrypt
    from weixin import WXAPPAPI
    from weixin.oauth2 import OAuth2AuthExchangeError
    appid = Config.WXAPP_ID
    secret = Config.WXAPP_SECRET
    api = WXAPPAPI(appid=appid, app_secret=secret)
    try:
        # 使用 code  换取 session key    
        session_info = api.exchange_code_for_session_key(code=code)
    except OAuth2AuthExchangeError as e:
        raise Unauthorized(e.code, e.description)
    session_key = session_info.get('session_key')
    crypt = WXBizDataCrypt(appid, session_key)
    # 解密得到 用户信息
    user_info = crypt.decrypt(encrypted_data, iv)
    return user_info


def verify_wxapp(encrypted_data, iv, code):
    user_info = get_wxapp_userinfo(encrypted_data, iv, code)
    # 获取 openid
    openid = user_info.get('openId', None)
    if openid:
        auth = Account.get_by_wxapp(openid)
        if not auth:
            raise Unauthorized('wxapp_not_registered')
        return auth
    raise Unauthorized('invalid_wxapp_code')
    
    
def create_token(request):
    # verify basic token
    approach = request.json.get('auth_approach')
    username = request.json['username']
    password = request.json['password']
    if approach == 'password':
        account = verify_password(username, password)
    elif approach == 'wxapp':
        account = verify_wxapp(username, password, request.args.get('code'))
    if not account:
        return False, {}
    payload = {
        "iss": Config.ISS,
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 * 7,
        "aud": Config.AUDIENCE,
        "sub": str(account['_id']),
        "nickname": account['nickname'],
        "scopes": ['open']
    }
    token = jwt.encode(payload, 'secret', algorithm='HS256')
    # 由于 account 中 _id 是一个 object 需要转化成字符串
    return True, {'access_token': token, 'account_id': str(account['_id'])}
```

具体代码可以在 [Metis：https://github.com/gusibi/Metis](https://github.com/gusibi/Metis) 查看。

> `Note`: 如果试用代码，请先设定 oauth2_client，使用自己的配置。
> > 不要将私密配置信息提交到 github。

## 参考链接

* [《微信小程序七日谈》- 第五天：你可能要在登录功能上花费大力气：http://www.cnblogs.com/ihardcoder/p/6279602.html](http://www.cnblogs.com/ihardcoder/p/6279602.html)
* [理解JWT（JSON Web Token）认证及实践](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752020&idx=1&sn=b5e56989a57e9b8067eb6614381a04fd&chksm=80b0b87eb7c73168d7eb1d7f1a95e759b9b0934318571de4f6d2455402e654e6c09d9b022f25)
* [网站微信登录－python 实现：http://blog.gusibi.com/post/weixin-python-login/](http://blog.gusibi.com/post/weixin-python-login/)


------


最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
