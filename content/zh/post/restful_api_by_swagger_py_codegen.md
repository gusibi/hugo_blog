---
categories: ["development", "python"]
date: 2017-07-11T21:29:15+08:00
description: 使用swagger_py_codegen 生成 Flask, Tornado, Falcon，Sanic RESTful API
draft: false
slug: build_restful_api_by_swagger
tags: ["python", "swagger", "restful"]
title: 使用swagger 生成 Flask RESTful API
---

## 什么是 RESTful
 
### 什么是REST

REST（英文：Representational State Transfer，又称具象状态传输）是Roy Thomas Fielding博士于2000年在他的博士论文[1] 中提出来的一种万维网软件架构风格，目的是便于不同软件/程序在网络（例如互联网）中互相传递信息。

REST 的核心是可编辑的资源及其集合，用符合 Atom 文档标准的 Feed 和 Entry 表示。每个资源或者集合有一个惟一的 URI。系统以资源为中心，构建并提供一系列的 Web 服务。

在 REST 中，开发人员显式地使用 HTTP 方法，对系统资源进行创建、读取、更新和删除的操作：

* 使用 POST 方法在服务器上创建资源
* 使用 GET 方法从服务器检索某个资源或者资源集合
* 使用 PUT 方法对服务器的现有资源进行更新
* 使用 DELETE 方法删除服务器的某个资源

如果一个架构符合REST原则，就可以称它为`RESTful架构`。

#### RESTful API 设计定义

以下是几个RESTful API的几个概念。

* 资源（Resource）：系统上的所有事物都被抽象为资源（一篇文章，一张照片，一段语音）
* 集合（Collection）：一组资源的合辑称为集合（几篇文章，几张照片）
* 路径（Endpoint）：路径又称”终点“，表示API的具体网址（每个网址代表一种资源）

那么一个设计良好的RESTful API应该遵循哪些原则呢？

##### 协议

API与用户的通信协议总是使用HTTPs协议。

##### 域名

应该尽量将API部署在专用域名，例如：

```sh
https://apis.gusibi.com
```
#####  API地址和版本

在url中指定API版本。比如：

```sh
https://apis.gusibi.com/v1
```

##### 以资源为中心设计URL

资源是RESTful API的核心元素，所有的操作都是针对特定资源进化的。而资源就是URL表示的，所以简洁、清晰、结构化的URL设计是至关重要的。 
在RESTful 架构中，每个网址代表一种资源（resource），所以网址中不能有动词，只能有名词，而且所用的名词往往与数据库的表格名对应。我们来看一下 Github 的例子：

```sh
/users/:username/repos
/users/:org/repos
/repos/:owner/:repo
/repos/:owner/:repo/tags
/repos/:owner/:repo/branches/:branch
```

##### 使用正确的Method

对于资源的具体操作类型，使用HTTP method 表示。
以下是常用的HTTP方法。

* GET：从服务器取出资源
* POST：在服务器新建一个资源
* PUT：在服务器更新资源（客户端提供改变后的完整资源
* PATCH：在服务器更新资源（客户端只提供改变了属性）
* DELETE：从服务器删除资源

还是使用 github 的例子：

```sh
GET /repos/:owner/:repo/issues
GET /repos/:owner/:repo/issues/:number
POST /repos/:owner/:repo/issues
PATCH /repos/:owner/:repo/issues/:number
DELETE /repos/:owner/:repo
```

##### 正确的过滤信息（filtering）

如果记录数量很多，服务器不能都将他们返回给用户。API应该提供参数，过滤返回结果。

下边是一些是、常见的参数。

* ?limit=10: 指定返回记录的数量
* ?offset=10：指定返回记录的开始位置
* ?page=2&per_page=100：：指定第几页，以及每页的记录数。
* ?sortby=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序。
* ?animal_type_id=1：指定筛选条件

##### 选择合适的状态码

HTTP 应答中，需要带一个很重要的字段：status code。它说明了请求的大致情况，是否正常完成、需要进一步处理、出现了什么错误，对于客户端非常重要。状态码都是三位的整数，大概分成了几个区间：

2XX：请求正常处理并返回
3XX：重定向，请求的资源位置发生变化
4XX：客户端发送的请求有错误
5XX：服务器端错误

常见的状态码有以下几种：

> 200 OK - [GET]：服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
201 CREATED - [POST/PUT/PATCH]：用户新建或修改数据成功。
204 NO CONTENT - [DELETE]：用户删除数据成功。
400 INVALID REQUEST - [POST/PUT/PATCH]：用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的。
401 Unauthorized - [*]：表示用户没有权限（令牌、用户名、密码错误）。
403 Forbidden - [*] 表示用户得到授权（与401错误相对），但是访问是被禁止的。
404 NOT FOUND - [*]：用户发出的请求针对的是不存在的记录，服务器没有进行操作，该操作是幂等的。
406 Not Acceptable - [GET]：用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
410 Gone -[GET]：用户请求的资源被永久删除，且不会再得到的。
422 Unprocesable entity - [POST/PUT/PATCH] 当创建一个对象时，发生一个验证错误。
500 INTERNAL SERVER ERROR - [*]：服务器发生错误，用户将无法判断发出的请求是否成功。

##### 返回结果

针对不同操作，服务器向用户返回的结果应该符合以下规范。

> GET /collection：返回资源对象的列表（数组）
GET /collection/resource：返回单个资源对象
POST /collection：返回新生成的资源对象
PUT /collection/resource：返回完整的资源对象
PATCH /collection/resource：返回完整的资源对象
DELETE /collection/resource：返回一个空文档

##### 错误处理（Error handling）

如果出错的话，在response body 中通过 message 给出明确的信息。如果状态码是4xx，就应该向用户返回出错信息。

##### 良好的文档

文档应该是规范的API的重要的组成部分，没有文档的API是难以给他人使用的，也是不利于维护的。

##### 其它

* 使用 OAuth2.0 鉴权
* 尽量使用JSON作为返回的数据格式
* 限流

对应上述规则，我们并不能保证其它的API提供者也会遵守，特别是文档，有很大一部分API提供者给出的文档是pdf或者word文档，这是因为在API的迭代开发过程中，文档更新会比较麻烦。

swagger帮API使用者和开发者纠正了这个问题。

## 什么是swagger

Swagger是一个简单但功能强大的API表达工具。改框架为创建JSON或YAML格式的RESTful API 文档提供了OpenAPI规范。swagger文档可由各种编程语言处理，可以在软件开发周期中嵌入源代码控制系统中，以便进行版本管理。使用Swagger生成API，我们可以得到交互式文档，自动生成代码的SDK以及API的发现特性等。

### 如何编写API文档

我们可以选择使用JSON或者YAML来编写API文档。文档示例如下：

json 格式文档：

```json
{
    "swagger": "2.0",
    "info": {
        "version": "1.0.0",
        "title": "Simple API",
        "description": "A simple API to learn how to write OpenAPI Specification"
    },
    "schemes": [
        "https"
    ],
    "host": "simple.api",
    "basePath": "/openapi101",
    "paths": {
        "/persons": {
            "get": {
                "summary": "Gets some persons",
                "description": "Returns a list containing all persons.",
                "responses": {
                    "200": {
                        "description": "A list of Person",
                        "schema": {
                            "type": "array",
                            "items": {
                                "properties": {
                                    "firstName": {
                                        "type": "string"
                                    },
                                    "lastName": {
                                        "type": "string"
                                    },
                                    "username": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```

yaml 格式文档：
```yml
swagger: "2.0"

info:
  version: 1.0.0
  title: Simple API
  description: A simple API to learn how to write OpenAPI Specification

schemes:
  - https
host: simple.api
basePath: /openapi101

paths:
  /persons:
    get:
      summary: Gets some persons
      description: Returns a list containing all persons.
      responses:
        200:
          description: A list of Person
          schema:
            type: array
            items:
              required:
                - username
              properties:
                firstName:
                  type: string
                lastName:
                  type: string
                username:
                  type: string
```

可以发现，yaml格式的文档比json格式的更清晰，可读性更高，推荐使用yaml格式书写文档。

swagger 官网提供了 [swagger editor: http://editor.swagger.io/#/](http://editor.swagger.io/#/)，你可以在这个编辑器中创建或导入文档，并在交互式环境中浏览它。

以下是您导入 leads.yaml 定义后的 Swagger Editor UI 外观：

![Swagger Editor UI 外观](http://media.gusibi.mobi/5f3vEHQSGzv7HLePBpb-fIZBRCw5wnuCkBe4gPFLMtQTuz4LsZCOMHq5gWv-dlal)

右侧的显示窗格显示了格式化的文档，反映了在左侧窗格中的代码编辑器中执行的更改。代码编辑器会指出了所有格式错误。你可以展开和折叠每个窗格。

### API文档的基本结构

我用一个例子来介绍下swagger文档的基本结构，这里我用yaml格式来编写文档：

```yml
swagger: "2.0"
info:
  title: Sample API
  description: API description in Markdown.
  version: 1.0.0

host: api.example.com
basePath: /v1
schemes:
  - https

paths:
  /users:
    get:
      summary: Returns a list of users.
      description: Optional extended description in Markdown.
      produces:
        - application/json
      responses:
        200:
          description: OK
```

上述文档包括元数据（Metadata）、Base URL、API路径（paths）三部分：

#### Metadata

这部分信息包括swagger 使用的版本：

```yml
swagger: "2.0"
```
API相关的描述信息（比如API介绍、版本等）：

```yml
info:
  title: Sample API
  description: API description in Markdown.
  version: 1.0.0
```

#### Base URL

作为web API，一个很重要的信息就是用来给用户使用的 根URL，可用协议（http/https）、host地址：

```yml
host: api.example.com
basePath: /v1
schemes:
  - https
```

所有的API都是base URL 的相对路径 例如 /users 的API地址是 `https://api.example.com/v1/users`。

#### 路径（Paths）

paths 部分定义API的路径（endpoint）、支持的HTTP 请求方法

```yml
paths:  # 声明路径
  /users:  # 定义API路径
    get:   # 定义请求方式
      summary: Returns a list of users.  # 简介
      description: Optional extended description in Markdown.  # 描述
      produces:
        - application/json    # 定义 服务端response MIME types 
      responses:
        200:    # response 状态码
          description: OK
```

当然这只是个最简单的例子，swagger可定义的内容要比我提到的多的多。
具体详细信息可以看下 [swagger 文档：https://swagger.io/docs/specification/what-is-swagger/](https://swagger.io/docs/specification/what-is-swagger/)。

当然，写完文档并不代表我们的代码就可以直接使用这份文档以及文档中的约束，swagger 还提供了 [swagger-codegen：https://github.com/swagger-api/swagger-codegen](https://github.com/swagger-api/swagger-codegen)。

### swagger_codegen

swagger-codegen 是一个开源的代码生成工具，它包含一个模板驱动引擎，可以直接从我们定义的 swagger 文档中生成可视化的文档查看界面和API客户端。

这是一个开源的项目，地址是[swagger-codegens： https://github.com/swagger-api/swagger-codegen](https://github.com/swagger-api/swagger-codegen)。可以自己安装使用一下。

因为我最常用的语言是Python，所以给大家介绍一个第三方的 python 的代码生成器[swagger-py-codegen：https://github.com/guokr/swagger-py-codegen](https://github.com/guokr/swagger-py-codegen)

## swagger_py_codegen

swagger-py-codegen的亮点是它是一个Python web framework 代码生成器，可以根据swagger 文档自动生成相应web framework 的代码，现在支持 Flask, Tornado，falcon，最新版将支持sanic。

### 安装

可以使用 pip 安装：

```sh
pip install swagger-py-codegen
```
### 使用

安装后使用命令如下：

```sh
swagger_py_codegen --swagger-doc api.yml example-app
```

可选参数有：

```
-s, --swagger, --swagger-doc    Swagger doc file.  [required]
-f, --force                     Force overwrite.
-p, --package                   Package name / application name.
-t, --template-dir              Path of your custom templates directory.
--spec, --specification         Generate online specification json response.
--ui                            Generate swagger ui.
-j, --jobs INTEGER              Parallel jobs for processing.
-tlp, --templates               gen flask/tornado/falcon templates, default flask.
--version                       Show current version.
--help                          Show this message and exit.
```

如果不指定 -tlp 参数，默认使用 flask 作为模板。
如果指定 --ui --spec 参数则会在 由-p 参数指定的目录下生成swagger UI 目录 static。

#### 举个例子

我们这里使用 swagger-py-codegen 提供的测试文档 执行：

```sh
swagger_py_codegen --swagger-doc api.yml example-app --ui --spec
```
生成的代码目录结构如下

```
$tree
.
|__ api.yml

$ swagger_py_codegen -s api.yml example-app -p demo
$ tree (flask-demo)
.
|__ api.yml
|__ example-app
   |__ demo
   |  |__ __init__.py
   |  |__ v1
   |     |__ api
   |     |  |__ __init__.py
   |     |  |__ oauth_auth_approach_approach.py
   |     |  |__ oauth_auth_approach.py
   |     |  |__ users_token.py
   |     |  |__ users_current.py
   |     |  |__ users.py
   |     |__ __init__.py
   |     |__ routes.py
   |     |__ schemas.py
   |     |__ validators.py
   |__ requirements.txt
```

可以看到，这时一个简单的app框架已经生成了，其中 routes.py 是自动生成的路由，validators.py 是response和request的校验代码，schemas.py 是由文档生成的校验规则，api 目录下的各个文件是你定义的endpoint。

这时运行demo 目录下的 `__init__.py` 文件:

```python
python __init__.py 
```
会发现 server 已经启动：

![server 启动示例](http://media.gusibi.mobi/pRyxskK89xODXjfsCdPVns9DJfMA2TF7tDLszenOAvhdB8gf5aBSwkCHCX9rSfQO)

如果生成命令带上 --ui --spec，生成代码的同时也会生成swagger UI：

```sh
swagger_py_codegen --swagger-doc api.yml example-app --ui --spec
```
启动server后在浏览器输入地址 `http://0.0.0.0:8000/static/swagger-ui/index.html#!/default/get_users_uid`

可以看到直接使用的 swagger UI。

![swagger ui 截图](http://media.gusibi.mobi/SGfBUnb6jxikwbr0IxOYROmwpqmScGJBWUHu88v5sIy806XNbk6KWDGGggDIeJH3)

> swagger-py-codegen 认证默认使用 OAuth2 认证方式，认证部分代码需要自己实现。

现在代码结构已经生成，可以安心的写逻辑代码了。

## 总结

这一篇主要介绍了RESTful API以及如何使用swagger编写规范的RESTful API。
最后介绍了如何使用 swagger-py-codegen 生成 web framework 的结构代码。
参考链接中的文章都非常值得一看，建议都看一下。

## 参考链接

* [REST： https://zh.wikipedia.org/wiki/REST](https://zh.wikipedia.org/wiki/REST)
* [RESTful API 设计指南： http://www.ruanyifeng.com/blog/2014/05/restful_api.html](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)
* [Principles of good RESTful API Design： https://codeplanet.io/principles-good-restful-api-design/](https://codeplanet.io/principles-good-restful-api-design/)
* [跟着 Github 学习 Restful HTTP API 设计： http://cizixs.com/2016/12/12/restful-api-design-guide](http://cizixs.com/2016/12/12/restful-api-design-guide)
* [最佳实践：更好的设计你的 REST API： https://www.ibm.com/developerworks/cn/web/1103_chenyan_restapi/](https://www.ibm.com/developerworks/cn/web/1103_chenyan_restapi/)
* [swagger： https://swagger.io/](https://swagger.io/)
* [如何编写基于OpenAPI规范的API文档：https://www.gitbook.com/book/huangwenchao/swagger/details](https://www.gitbook.com/book/huangwenchao/swagger/details)
* [使用 Swagger 文档化和定义 RESTful API：https://www.ibm.com/developerworks/cn/web/wa-use-swagger-to-document-and-define-restful-apis/index.html](https://www.ibm.com/developerworks/cn/web/wa-use-swagger-to-document-and-define-restful-apis/index.html)
* [swagger 文档：https://swagger.io/docs/specification/what-is-swagger/](https://swagger.io/docs/specification/what-is-swagger/)
* [swagger-py-codegen：https://github.com/guokr/swagger-py-codegen](https://github.com/guokr/swagger-py-codegen)

------

最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)

这里是分割线

--------------

公号现在已经开通了留言功能，如果你觉得文章有不对的地方，欢迎指出。
