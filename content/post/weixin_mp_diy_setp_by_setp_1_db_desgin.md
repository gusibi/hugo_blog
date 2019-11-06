---
categories: ["development", "python", "微信"]
date: 2017-07-16T21:14:10+08:00
description: 微信公号DIY python 实现 MongoDB 简易ORM & 公号记账应用数据库设计
draft: false
slug: wechat-diy-keep-accounts-db-desgin
tags: ["python", "tutorial", "weixin", "公众号", "记账"]
title: 微信公号DIY：MongoDB 简易ORM & 公号记账数据库设计
---

前两篇 `微信公号DIY` 系列:
* [微信公号DIY：一小时搭建微信聊天机器人](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752007&idx=1&sn=46cf89695e8147fb30acb162ec895290&chksm=80b0b86db7c7317bca8612498cb7b01bc541d5b03399496fd5ce06291b844c0af9920d09f8fc#rd) 
* [微信公号DIY：训练聊天机器人&公号变身图片上传工具](https://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655752009&idx=1&sn=b6d533c6bf408daec7229e2ddb6843a0&chksm=80b0b863b7c73175ff3d6300ad1a2f9e013c5614397a7115a73eba38af715e9a905e28aaa49e#rd)  

介绍了如何使用搭建&训练聊天机器人以及让公号支持图片上传到七牛，把公号变成一个七牛图片上传客户端。这一篇将继续开发公号，让公号变成一个更加实用的工具`账本`（理财从记账开始）。

> `代码：` 项目代码已上传至github，地址为[gusibi/momo：https://github.com/gusibi/momo](https://github.com/gusibi/momo)

HUGOMORE42

## 账本功能

账本是一个功能比较简单应用，公号内只需要支持：
1. 记账（记账，修改金额，取消记账）
2. 账单统计（提供数据和图片形式的统计功能）

当然后台管理功能就比较多了，这个以后再介绍。

对于数据存储，我选择的是MongoDB（选MongoDB的原因是，之前没用过，想试一下），我们先看下MongoDB和关系型数据库的不同。

## MongoDB

### 什么是MongoDB ?

MongoDB 是由C++语言编写的，是一个开放源代码的面向文档的数据库,易于开发和缩放。

> mongo和传统关系数据库的最本质的区别在那里呢？MongoDB 是文档模型。

关系模型和文档模型的区别在哪里？

* 关系模型需要你把一个数据对象，拆分成零部件，然后存到各个相应的表里，需要的是最后把它拼起来。举例子来说，假设我们要做一个CRM应用，那么要管理客户的基本信息，包括客户名字、地址、电话等。由于每个客户可能有多个电话，那么按照第三范式，我们会把电话号码用单独的一个表来存储，并在显示客户信息的时候通过关联把需要的信息取回来。
* 而MongoDB的文档模式，与这个模式大不相同。由于我们的存储单位是一个文档，可以支持数组和嵌套文档，所以很多时候你直接用一个这样的文档就可以涵盖这个客户相关的所有个人信息。关系型数据库的关联功能不一定就是它的优势，而是它能够工作的必要条件。 而在MongoDB里面，利用富文档的性质，很多时候，关联是个伪需求，可以通过合理建模来避免做关联。
![关系模型和文档模型区别图例](http://www.mongoing.com/wp-content/uploads/2016/01/MongoDB-%E6%A8%A1%E5%BC%8F%E8%AE%BE%E8%AE%A1%E8%BF%9B%E9%98%B6%E6%A1%88%E4%BE%8B_%E9%A1%B5%E9%9D%A2_04-1024x791.png)

### MongoDB 概念解析

在mongodb中基本的概念是文档、集合、数据库，下表是MongoDB和关系型数据库概念对比：

|SQL术语/概念	|MongoDB术语/概念	|解释/说明|
|------|------|------|
|database	   |database	|数据库
|table	       |collection	|数据库表/集合
|row	       |document	|数据记录行/文档
|column	       |field	    |数据字段/域
|index	       |index	    |索引
|table         |joins	    |表连接,MongoDB不支持
|primary key	|primary key	|主键,MongoDB自动将_id字段设置为主键

通过下图实例，我们也可以更直观的的了解Mongo中的一些概念：

![Mongo中的一些概念](http://www.runoob.com/wp-content/uploads/2013/10/Figure-1-Mapping-Table-to-Collection-1.png)

接下来，我从使用的角度来介绍下如何使用 python 如何使用MongoDB，在这个过程中，我会实现一个简单的MongoDB的ORM，同时也会解释一下涉及到的概念。

## 简易 Python MongoDB ORM
### python 使用 mongodb

首先，需要确认已经安装了 PyMongo，如果没有安装，使用以下命令安装：

```sh
pip install pymongo
# 或者
easy_install pymongo
```
详细安装步骤参考: [PyMongo Installing / Upgrading](http://api.mongodb.com/python/current/installation.html)

#### 连接 MongoClient：

```python
>>> from pymongo import MongoClient
>>> client = MongoClient()
```
上述命令会使用Mongo的默认host和端口号，和以下命令作用相同：
```python
client = MongoClient('localhost', 27017) # mongo 默认端口号
为27017
# 也可以这样写
client = MongoClient('mongodb://localhost:27017/')
```

#### 选择一个数据库

获取 MongoClient 后我们接下来要做的是选择要执行的数据库，命令如下：

```python
>>> db = client.test_database # test_database 是选择的数据库名称
# 也可以使用下述方式
>>> db = client['test-database']
```

> `数据库（Database）` 
> 一个mongodb中可以建立多个数据库。
MongoDB的默认数据库为"db"，该数据库存储在data目录中。
MongoDB的单个实例可以容纳多个独立的数据库，每一个都有自己的集合和权限，不同的数据库也放置在不同的文件中。
"show dbs" 命令可以显示所有数据的列表。
> 执行 "db" 命令可以显示当前数据库对象或集合。
> 运行"use"命令，可以连接到一个指定的数据库。

#### 获取集合

选择数据库后，接下来就是选择一个集合（Collection），获取一个集合和选择一个数据库的方式基本一致：

```python
>>> collection = db.test_collection  # test_collection 是集合名称
# 也可以使用字典的形式
>>> collection = db['test-collection']
```

> `集合（collection）`
> 集合就是 MongoDB 文档组，类似于 RDBMS （关系数据库管理系统：Relational Database Management System)中的表。
集合存在于数据库中，集合没有固定的结构，这意味着你在对集合可以插入不同格式和类型的数据，但通常情况下我们插入集合的数据都会有一定的关联性。
> `当第一个文档插入时，集合就会被创建。`
> 集合名`不能是空字符串""`。
> 集合名`不能含有\0字符（空字符)`，这个字符表示集合名的结尾。
> 集合名`不能以"system."开头`，这是为系统集合保留的前缀。
> 用户创建的集合名字`不能含有保留字符`。有些驱动程序的确支持在集合名里面包含，这是因为某些系统生成的集合中包含该字符。除非你要访问这种系统创建的集合，否则千万不要在名字里出现$。　

了解这几个操作后我们把这几个封装一下：

```python
from six import with_metaclass
from pymongo import MongoClient
from momo.settings import Config

pyclient = MongoClient(Config.MONGO_MASTER_URL)

class ModelMetaclass(type):
    """
    Metaclass of the Model.
    """
    __collection__ = None

    def __init__(cls, name, bases, attrs):
        super(ModelMetaclass, cls).__init__(name, bases, attrs)
        cls.db = pyclient['momo_bill']  # 数据库名称，也可以作为参数传递 通常情况下一个应用只是用一个数据库就能实现需求
        if cls.__collection__:
            cls.collection = cls.db[cls.__collection__]


class Model(with_metaclass(ModelMetaclass, object)):

    __collection__ = 'model_base'
```

现在我们可以这样定义一个集合（Collection）：
```python
class Account(Model):

    '''
    暂时在这里声明文档结构，用不用做校验，只是方便自己查阅
    以后也不会变成类似 SQLAlchemy 那种强校验的形式
    :param _id: '用户ID',
    :param nickname: '用户昵称 用户显示',
    :param username: '用户名 用于登录',
    :param avatar: '头像',
    :param password: '密码',
    :param created_time: '创建时间',
    '''
    __collection__ = 'account'  # 集合名
```

使用方式：

```python
account = Account()
```
现在就已经指定了数据库和集合，可以自由做 CURD 操作了（虽然还不支持）。

#### 创建文档（insert document）

使用PyMongo 创建文档非常方便：

```python
>>> import datetime
>>> account = {"nickname": "Mike",
...         "username": "mike",
...         "avatar": "http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK",
...         "password": "password",
...         "created_time": datetime.datetime.utcnow()}

>>> accounts = db.account
>>> account_id = accounts.insert_one(account).inserted_id
>>> account_id
ObjectId('...')
```

创建一个文档时，你可以指定 `_id`，如果不指定，系统会自动添加上`_id` 字段，这个字段必须是唯一不可重复的字段。

也可是使用 `collection_names` 命令显示所有的集合：
```python
>>> db.collection_names(include_system_collections=False)
[u'account']
```
> `文档（Document）` 文档是一组键值(key-value)对(即BSON)。MongoDB 的文档不需要设置相同的字段，并且相同的字段不需要相同的数据类型，这与关系型数据库有很大的区别，也是 MongoDB 非常突出的特点。

现在我们给这个简易ORM添加创建文档的功能：
```python
class Model(with_metaclass(ModelMetaclass, object)):

    __collection__ = 'model_base'

    @classmethod
    def insert(cls, **kwargs):
        # insert one document
        doc = cls.collection.insert_one(kwargs)
        return doc
        
    @classmethod
    def bulk_inserts(cls, *params):
        '''
        :param params: document list
        :return: 
        '''
        results = cls.collection.insert_many(params)
        return results        
```

创建一个文档方法为：

```python
account = Account.insert("nickname": "Mike",
        "username": "mike",
        "avatar": "http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK",
        "password": "password",
        "created_time": datetime.datetime.utcnow())
```

#### 查询文档

使用 `find_one` 获取单个文档：

```python
accounts.find_one()
```

> 如果没有任何筛选条件，find_one 命令会取集合中的第一个文档
> 如果有筛选条件，会取符合条件的第一个文档

```python
accounts.find_one({"nickname": "mike"})
```

使用 `ObjectId` 查询单个文档：

```python
accounts.find_one({"_id": account_id})
```

将这个添加到ORM中：

```python
class Model(with_metaclass(ModelMetaclass, object)):

    __collection__ = 'model_base'

    @classmethod
    def get(cls, _id=None, **kwargs):
        if _id: # 如果有_id
            doc = cls.collection.find_one({'_id': _id})
        else: # 如果没有id
            doc = cls.collection.find_one(kwargs)
        return doc
```
如果你想获取多个文档可以使用`find`命令。

使用`find`命令获取多个文档

```python
accounts.find()
# 当然支持筛选条件
accounts.find({"nickname": "mike"})
```

将这个功能添加到ORM：

```python
class Model(with_metaclass(ModelMetaclass, object)):

    __collection__ = 'model_base'
    
    @classmethod
    def find(cls, filter=None, projection=None, skip=0, limit=20, **kwargs):
        docs = cls.collection.find(filter=filter,
                                   projection=projection,
                                   skip=skip, 
                                   limit=limit,
                                   **kwargs)
        return docs
```

现在我们可以这样做查询操作：

```python
account = Account.get(_id='account_id')
accounts = Account.find({'name': "mike"})
```

#### 修改（update）

更新操作[文档地址：http://api.mongodb.com/python/current/api/pymongo/collection.html#pymongo.collection.Collection.update_one](http://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=update_one#pymongo.collection.Collection.update_one)：

> `update_one`(filter, update, upsert=False, bypass_document_validation=False, collation=None)

更新一个符合筛选条件的文档 upsert 如果为True 则会在没有匹配到文档的时候创建一个
> `update_many`(filter, update, upsert=False, bypass_document_validation=False, collation=None)

更新全部符合筛选条件的文档 upsert 如果为True 则会在没有匹配到文档的时候创建一个

添加到ORM中：

```python
class Model(with_metaclass(ModelMetaclass, object)):

    __collection__ = 'model_base'
    
    @classmethod
    def update_one(cls, filter, **kwargs):
        result = cls.collection.update_one(filter, **kwargs)
        return result

    @classmethod
    def update_many(cls, filter, **kwargs):
        results = cls.collection.update_many(filter, **kwargs)
        return results
```

可以看到，我这里并没有做多余的操作，只是直接调用了PyMongo的方法。

#### 删除

删除操作和update类似但是比较简单：

> delete_one(filter, collation=None):

删除一个匹配到的文档

> delete_many(filter, collation=None):

删除全部匹配到的文档

添加到ORM中：

```python
class Model(with_metaclass(ModelMetaclass, object)):

    __collection__ = 'model_base'

    @classmethod
    def delete_one(cls, **filter):
        cls.collection.delete_one(filter)

    @classmethod
    def delete_many(cls, **filter):
        cls.collection.delete_many(filter)

```

到这里，简易的ORM就实现了（这只能算是个功能简单的框，可以再自由添加其它更多的功能）。

接下来是账本文档结构的设计

## 账本数据结构设计

账本需要包含的数据有：

* 账户所有人
* 账单记录
* 账单分类

那么我们至少需要三个集合：

```python
{
    'account': {  # 用户集合
        '_id': '用户ID',
        'nickname': '用户昵称',
        'username': '用户名 用于登录',
        'avatar': '头像',
        'password': '密码',
        'created_time': '创建时间',
    },
    'bill': { # 账单集合
        '_id': '账单ID',
        'uid': '用户ID',
        'money': '金额 精确到分',
        'tag': '标签',
        'remark': '备注',
        'created_time': '创建时间',
    },
    'tag': {  # 账单标签
        '_id': '标签ID',
        'name': '标签名',
        'icon': '标签图标',
        'uid': '创建者ID（默认是管理员）',
        'created_time': '创建时间',
    }
}
```

这里账单和用户使用 uid 作为引用的关联，account 和 bill 是一对多关系。

> 当然你也可以再加一个账本的集合，用户和账本对应，这时，账单可以作为账本中的一个list数据结构（单个文档有16M的限制，如果存储超过这个大小不能使用这种形式，数据量大的时候，查询操作会比较缓慢）。

作为公号中的账本，我们暂时不加账本功能，因为这会让我们的操作变得复杂。

因为公号里的每次操作都是独立请求，并没有上下文。所以我们要记录记账这个操作走到了哪一步，接下来改干嘛。

记账逻辑如图：

![公号记账流程图](http://media.gusibi.mobi/5hzgvdbSsM37XRm-A8mRkPe6d2sHmvvT6w3RgNAKzoHxZwpxcE3f_tRBsFxRgA-p)

所以我们这里要有数据来记录当前的操作步骤以及接下来改有的操作步骤：

```python
{
    'account_workflow': {  # 用户当前工作流
        '_id': 'id', 
        'next': '下一步的操作',
        'uid': '用户ID',
        'workflow': '使用的工作流',
        'created_time': '开始时间'
    }
}
```

这个集合记录了我们当前所在的工作流，下一步该走向哪一步。

> 这个集合需要设置文档的过期时间，比如输入 “记账” 激活记账工作流后，如果10分钟没有操作完成，那么需要重新开始。以免输入记账后不完成不能继续其它的操作。

下面的这个集合记录了哪些关键字可以激活工作流，对应的工作流是什么以及开始哪个动作。

```python
{
    'keyword': {  # 特殊关键字
        '_id': '关键字ID',
        'word': '关键字',
        'data': {
            'workflow': '工作流',
            'action': '工作流动作',
            'value': '返回值',
            'type': '返回值类型 url|pic|text',
        },
        'created_time': '创建时间'
    },
}
```

到这里账本的数据库设计就结束了。

## 总结

这一篇主要介绍了MongoDB，PyMongo 的使用以及如何编写一个简易的MongoDB ORM。
然后又介绍了基于 MongoDB 的公号账本应用的数据库设计。

### 预告

下一篇我们将介绍，如何实现记账功能。

以下是操作截图。

![记账](http://media.gusibi.mobi/SDTcm0mQp-0ugO8R9bz9NxA-HrhsKBXCdEK85exrLYmU7EiI2X07FhsVRFhQqj3K)
![修改金额](http://media.gusibi.mobi/Ya4Ip_QWn_XR2CnG5yipx9ZeG7s6wJZy8_SFYIKYPLOFk75KPq54e42x27v6kjD4)
![取消记账](http://media.gusibi.mobi/JdJvDNlb4SyvozhE-1YSPdkTWkrk8A1BSO6pxmLUzHpF-7QyqEQYACAeetdkhbFo)

欢迎关注公号`四月（April_Louisa）`试用。

## 参考链接

* [MongoDB数据库设计中6条重要的经验法则：http://www.cnblogs.com/WeiGe/p/4903850.html](http://www.cnblogs.com/WeiGe/p/4903850.html)
* [MongoDB 进阶模式设计：http://www.mongoing.com/mongodb-advanced-pattern-design](http://www.mongoing.com/mongodb-advanced-pattern-design)
* [MongoDB 概念解析：http://www.runoob.com/mongodb/mongodb-databases-documents-collections.html](http://www.runoob.com/mongodb/mongodb-databases-documents-collections.html)
* [PyMongo 3.4.0 Documentation：http://api.mongodb.com/python/current/index.html](http://api.mongodb.com/python/current/index.html)

-------
**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)