---
date: "2019-04-29T21:05:57+08:00"
draft: false
title: "JWT RefreshToken 实践"
slug: "jwt-refresh-token"
description: "jwt refresh token "
tags: ["restful", "tutorial", "后端"]
categories: ["development", "web",  "后端"]
---


> Json web token (JWT), 根据官网的定义，是为了在网络应用环境间传递声明而执行的一种基于JSON的开放标准（(RFC 7519).该token被设计为紧凑且安全的，特别适用于分布式站点的单点登录（SSO）场景。JWT的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息，以便于从资源服务器获取资源，也可以增加一些额外的其它业务逻辑所必须的声明信息，该token也可直接被用于认证，也可被加密。
> 详细介绍可以查看这篇文章 [理解JWT（JSON Web Token）认证及实践](https://mp.weixin.qq.com/s/gUgh_kmMu0Hmobeah7wNLQ)

## JWT 特点

### 优点

* 体积小，因而传输速度快
* 传输方式多样，可以通过URL/POST参数/HTTP头部等方式传输
* 严格的结构化。它自身（在 payload 中）就包含了所有与用户相关的验证消息，如用户可访问路由、访问有效期等信息，服务器无需再去连接数据库验证信息的有效性，并且 payload 支持为你的应用而定制化。
* 支持跨域验证，可以应用于单点登录。

### 存在的问题

JWT 自身（在 payload 中）就包含了所有与用户相关的验证消息，所以通常情况下不需要保存。这种设计存在几个问题：

1. Token不能撤销--客户端重置密码后之前的JWT依然可以使用（JWT 并没有过期或者失效
2. 不支持refresh token，JWT过期后需要执行登录授权的完整流程
3. 无法知道用户签发了几个JWT

针对第一个问题，可能的解决方法有：

1. 保存JWT到数据库（或Redis），这样可以针对每个JWT单独校验
2. 在重置密码等需要作废之前全部JWT时，把操作时间点记录到数据库（或Redis），校验JWT时同时判断此JWT创建之后有没有过重置密码等类似操作，如果有校验不通过


当然，这种解决方法都会多一次数据库请求，JWT自身可校验的优势会有所减少，同时也会影响认证效率。

这篇文章主要介绍解决第二个问题（不支持refresh token）的思路。

### refresh token

refresh token是OAuth2 认证中的一个概念，和OAuth2 的access token 一起生成，表示更新令牌，过期所需时间比access toen 要长，可以用来获取下一次的access token。

如果JWT 需要添加 refresh token支持，refresh token需要满足的条件有一下几项：

1. 和JWT一起生成返回给客户端
2. 有实效时间，有效时间比JWT要长
3. 只能用来换取下一次JWT，不能用于访问认证
4. 不能重复使用（可选）


#### refresh token 获取流程

![](http://media.gusibi.mobi/kY3mm6nLAlHkGDxHJF1WLctLSbp9eA-6iirdYBlC0CDwMcq_rTPsCWpAhmWUr_nJ)

#### refresh token 使用流程

![](http://media.gusibi.mobi/-PJDYI_rQ-EiYl6aGJ-_zPtkgKY9nRnBnShAj47rsoEY115E8IRlM4zMuOvx70zi)

## 代码示例

```python
import jwt
import time

# 使用 sanic 作为restful api 框架 
def create_token(account_id, username):
    payload = {
        "iss": "gusibi.mobi",
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 * 7,
        "aud": "www.gusibi.mobi",
        "sub": account_id,
        "username": username,
        "scopes": ['open']
    }
    token = jwt.encode(payload, 'secret', algorithm='HS256')
    payload['grant_type'] = "refresh"
    refresh_token = jwt.encode(payload, 'secret', algorithm='HS256')
    return True, {
        'access_token': token,
        'account_id': account_id,
        "refresh_token": refresh_token
        }

# 验证refresh token 出否有效
def verify_refresh_token(token):
    payload = jwt.decode(token, 'secret', audience='www.gusibi.com', algorithms=['HS256'])
    # 校验token 是否有效，以及是否是refresh token，验证通过后生成新的token 以及 refresh_token
    if payload and payload.get('grant_type') == 'refresh':
        # 如果需要标记此token 已经使用，需要借助redis 或者数据库（推荐redis）
        return True, payload
    return False, None

# 验证token 是否有效
def verify_bearer_token(token):
    #  如果在生成token的时候使用了aud参数，那么校验的时候也需要添加此参数
    payload = jwt.decode(token, 'secret', audience='www.gusibi.com', algorithms=['HS256'])
    # 校验token 是否有效，以及不能是refresh token
    if payload and not payload.get('grant_type') == 'refresh':
        return True, payload
    return False, None
```


## 参考链接

* [理解JWT（JSON Web Token）认证及实践](https://mp.weixin.qq.com/s/gUgh_kmMu0Hmobeah7wNLQ)
* [理解OAuth 2.0](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)[1] 

References
[1] 理解OAuth 2.0: http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)
