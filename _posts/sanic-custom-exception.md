---
date: 2017-08-05T10:23:35+08:00
description: 自定义 sanic 异常处理
draft: false
permalink: /post/sanic-custom-exception
categories: ["development", "python", "framwork"]
tags: ["python", "tutorial", "sanic"]
title: 自定义 Sanic Exception
---

> `Sanic` 是一个和类Flask 的基于Python3.5+的web框架，它使用了 Python3 异步特性，有远超 flask 的性能。

编写 RESTful API 的时候，我们会定义特定的异常错误类型，比如我定义的错误返回值格式为：

```json
{
  "error_code": 0,
  "message": "string",
  "text": "string"
}
```

不同的错误信息指定不同的 http 状态码。

sanic 提供了几种常用的 exception：

* NotFound(404)
* Forbidden(403)
* ServerError(500)
* InvalidUsage(400)
* Unauthorized(401)
* RequestTimeout(408)
* PayloadTooLarge(413)

这些 exception 继承自 SanicException 类：

```python
class SanicException(Exception):

    def __init__(self, message, status_code=None):
        super().__init__(message)

        if status_code is not None:
            self.status_code = status_code
```

从上述代码可以看出，这些异常只能指定 message 和 status_code 参数，那我们可不可以自定义 exception 然后在自定义的 exception 中增加参数呢？下面的代码是按照这个思路修改后的代码：

```python
class ApiException(SanicException):

    def __init__(self, code, message=None, text=None, status_code=None):
        super().__init__(message)
        self.error_code = code
        self.message = message
        self.text = text

        if status_code is not None:
            self.status_code = status_code
```
使用后我得到一个结果如下：

![错误结果示例](http://media.gusibi.mobi/2VpVk8OPGxBl7oZ4qzyU7pBroeXXUslZ5vWiHRPnq0cZ1fFUsGDd23o5Gk7knIUa)

从结果可以发现，除了 http 状态码使我想要的其它全错，连 `content-type` 都是 `text/plain; charset=utf-8`，为什么会这样呢，我们定义的参数code 和 text 去了哪里？

翻开 sanic handler 的代码[https://github.com/channelcat/sanic/blob/master/sanic/handlers.py](https://github.com/channelcat/sanic/blob/master/sanic/handlers.py)我找到了答案：

```python
def default(self, request, exception):
        self.log(format_exc())
        if issubclass(type(exception), SanicException):
            # 如果是 SanicException 类，返回格式是定义好的，
            # response 处理方法用的是 text
            return text(
                'Error: {}'.format(exception),
                status=getattr(exception, 'status_code', 500),
                headers=getattr(exception, 'headers', dict())
            )
        elif self.debug:
            html_output = self._render_traceback_html(exception, request)

            response_message = (
                'Exception occurred while handling uri: "{}"\n{}'.format(
                    request.url, format_exc()))
            log.error(response_message)
            return html(html_output, status=500)
        else:
            return html(INTERNAL_SERVER_ERROR_HTML, status=500)
```

> 从源码可以看出，如果response 结果是 SanicException 类，response 处理方法会改用text，响应内容格式为 `Error: status_code`。

看来直接使用自定义异常类的方法不能满足我们上边定义的 json 格式（需要有 error_code、message 和 text）数据的要求。那我们能不能自定义 异常处理方法呢？`答案当然是可以。`

下面介绍两种自定义异常处理的方法：

## 使用 response.json 

这种方法比较简单，既然 sanic 异常处理是把错误信息使用 response.text() 方法返回，那我们改成 response.json() 不就可以了么。sanic response 提供了 json 的响应对象。可以使用 response.json 定义一个错误处理方法：

```python
def json_error(error_code, message, text, status_code):
    return json(
        {
            'error_code': error_code,
            'message': message,
            'text': text
        },
        status=status_code)
```

这样我们只需要在需要抛出异常的地方 `return json_error(code, msg, text, status_code)`。
 
使用这种方法有一点需要注意：

```python

def get_account():
    ...
    if account:
        return account
    else:
        # 如果用户没找到 返回错误信息
        return json_error(code, msg, text, status_code)
    
@app.route("/")
async def test(request):
    account = get_account()
    return text('Hello world!')
```
这段代码中，如果我们没有找到用户信息，json_error 的返回结果会赋值给 account，并不会抛出异常，如果需要抛出异常，我们需要在 test 方法中检查 account 的结果，如果包含 account 是 response.json 对象， 直接 return， 更正后的代码如下：

```python
@app.route("/")
async def test(request):
    account = get_account()
    if isinstance(account, response.json):
        return account
    return text('Hello world!')
```

这样虽然简单，但是会增加很多不必要的判断，那有没有方法可以直接抛出异常呢？这时就可以使用 sanic 提供的 `@app.exception` 装饰器了。

## 使用 Handling exceptions

sanic 提供了一个 `@app.exception`装饰器，使用它可以覆盖默认的异常处理方法。它的使用方法也很简单：

```python
from sanic.response import text
from sanic.exceptions import NotFound

@app.exception(NotFound)
def ignore_404s(request, exception):
    return text("Yep, I totally found the page: {}".format(request.url))
```

这个装饰器允许我们传入一个需要捕获的异常的列表，然后，就可以在自定义方法中返回任意的响应数据了。

以下自定义的异常处理类：

```python
error_codes = {
    'invalid_token': ('Invalid token', '无效的token'),
}

def add_status_code(code):
    """
    Decorator used for adding exceptions to _sanic_exceptions.
    """
    def class_decorator(cls):
        cls.status_code = code
        return cls
    return class_decorator


class MetisException(SanicException):

    def __init__(self, code, message=None, text=None, status_code=None):
        super().__init__(message)
        self.error_code = code
        _message, _text = error_codes.get(code, (None, None))
        self.message = message or _message
        self.text = text or _text

        if status_code is not None:
            self.status_code = status_code

@add_status_code(404)
class NotFound(MetisException):
    pass

@add_status_code(400)
class BadRequest(MetisException):
    pass

# 使用 app.exception 捕获异常，返回自定义响应数据
@app.exception(Unauthorized, NotFound, BadRequest)
def json_error(request, exception):
    return json(
        {
            'error_code': exception.error_code,
            'message': exception.message,
            'text': exception.text
        },
        status=exception.status_code)
``` 

## 参考链接

* [Sanic Exceptions：http://sanic.readthedocs.io/en/latest/sanic/exceptions.html](http://sanic.readthedocs.io/en/latest/sanic/exceptions.html)
* [Metis：https://github.com/gusibi/Metis](https://github.com/gusibi/Metis)

------

最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
