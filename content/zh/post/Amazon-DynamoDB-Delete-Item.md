+++
date = "2017-03-03T17:19:05+08:00"
title = "Amazon DynamoDB 入门8：删除项目"

draft = false

tags = ["AWS","nosql", "DynamoDB", "python"]
categories = ["development", "nosql", "DynamoDB", "python"]
slug = "Amazon-DynamoDB-Delete-Item"

+++

> 上一篇介绍了DynamoDB 的更新，这一篇将会介绍项目删除操作和dynamoab-py

## 从表中删除数据

在 SQL 中，DELETE 语句从表中删除一个或多个行。*DynamoDB 使用 DeleteItem 操作一次删除一个项目。*

### SQL

在 SQL 中，可使用 DELETE 语句删除一个或多个行。WHERE 子句确定要修改的行。示例如下：

HUGOMORE42

DELETE FROM Music
WHERE Artist = 'The Acme Band' AND SongTitle = 'Look Out, World';
我们可以修改 WHERE 子句以删除多个行。例如，删除某个特殊艺术家的所有歌曲，如下所示：

DELETE FROM Music WHERE Artist = 'The Acme Band'

#### Note
如果省略 WHERE 子句，则数据库会尝试从表中删除所有行。

### DynamoDB

在 DynamoDB 中，可使用 DeleteItem 操作修改单个项目。

(http://docs.aws.amazon.com/zh_cn/amazondynamodb/latest/APIReference/API_DeleteItem.html?shortFooter=true)[API 语法如下]：

```json
{
   "ConditionExpression": "string",
   "ExpressionAttributeNames": {
      "string" : "string"
   },
   "ExpressionAttributeValues": {
      "string" : {
         "B": blob,
         "BOOL": boolean,
         "BS": [ blob ],
         "L": [
            "AttributeValue"
         ],
         "M": {
            "string" : "AttributeValue"
         },
         "N": "string",
         "NS": [ "string" ],
         "NULL": boolean,
         "S": "string",
         "SS": [ "string" ]
      }
   },
   "Key": {
      "string" : {
         "B": blob,
         "BOOL": boolean,
         "BS": [ blob ],
         "L": [
            "AttributeValue"
         ],
         "M": {
            "string" : "AttributeValue"
         },
         "N": "string",
         "NS": [ "string" ],
         "NULL": boolean,
         "S": "string",
         "SS": [ "string" ]
      }
   },
   "ReturnConsumedCapacity": "string",
   "ReturnItemCollectionMetrics": "string",
   "ReturnValues": "string",
   "TableName": "string"
}
```

参数说明：

- Key: 主键，用于定位项目
- TableName：表名 （最小 3. 最大 255）
- ConditionExpression：条件表达式（仅在特定 ConditionExpression 的计算结果为 true 时成功完成）
- ExpressionAttributeNames：条件表达式的名称的别名，比如 date 为保留字，可用别名定义为 #d
- ExpressionAttributeValues：条件表达式的值
- ReturnConsumedCapacity：显示使用的写入容量单位数
    - TOTAL 会返回由表及其所有global secondary index占用的写入容量；
    - INDEXES 仅返回由global secondary index占用的写入容量；
    - NONE 表示您不需要返回任何占用容量统计数据。
- ReturnValues: 更新后返回的数据.
    - NONE - 如果没有特别说明，返回None (这个是默认值)
    - ALL_OLD - 按在进行更新之前的情况，返回整个项目。
- ReturnItemCollectionMetrics： Determines whether item collection metrics are returned. If set to SIZE , the response includes statistics about item collections, if any, that were modified during the operation are returned in the response. If set to NONE (the default), no statistics are returned.

(http://boto3.readthedocs.io/en/stable/reference/services/dynamodb.html?highlight=dynamodb#DynamoDB.Table.delete_item)[boto3语法如下]

```python
response = table.delete_item(
    Key={
        'string': 'string'|123|Binary(b'bytes')|True|None|set(['string'])|set([123])|set([Binary(b'bytes')])|[]|{}
    },
    ConditionalOperator='AND'|'OR',
    ReturnValues='NONE'|'ALL_OLD'|'UPDATED_OLD'|'ALL_NEW'|'UPDATED_NEW',
    ReturnConsumedCapacity='INDEXES'|'TOTAL'|'NONE',
    ReturnItemCollectionMetrics='SIZE'|'NONE',
    ConditionExpression=Attr('myattribute').eq('myvalue'),
    ExpressionAttributeNames={
        'string': 'string'
    },
    ExpressionAttributeValues={
        'string': 'string'|123|Binary(b'bytes')|True|None|set(['string'])|set([123])|set([Binary(b'bytes')])|[]|{}
    }
)
```

在 DynamoDB 中，可使用 DeleteItem 操作从表中删除数据（一次删除一个项目）。必须指定项目的主键值。示例如下：

```python
{
    TableName: "Music",
    Key: {
        Artist: "The Acme Band",
        SongTitle: "Look Out, World"
    }
}
```

#### Note

除了 DeleteItem 之外，Amazon DynamoDB 还支持同时删除多个项目的 BatchWriteItem 操作。

DeleteItem 支持条件写入，在此情况下，操作仅在特定 ConditionExpression 的计算结果为 true 时成功完成。例如，以下 DeleteItem 操作仅在项目具有 RecordLabel 属性时删除项目：

```python
{
    TableName: "Music",
    Key: {
        Artist: "The Acme Band",
        SongTitle: "Look Out, World"
    },
   ConditionExpression: "attribute_exists(RecordLabel)"
}
```

删除操作就这么简单，下边是福利时间。

是不是每次用boto3 操作DynamoDB 都有种痛不欲生的感觉，下边我们介绍一个新工具。

### [dynamodb-py](https://github.com/gusibi/dynamodb-p)

dynamodb-py  是模仿sqlalchemy 编写的DynamoDB ORM 它的使用方法特别简单，下边来看几个示例：

##### 表的操作

```python
from dynamodb.model import Model
from dynamodb.fields import CharField, IntegerField, FloatField, DictField
from dynamodb.table import Table

class Movies(Model):

    __table_name__ = 'Movies'

    ReadCapacityUnits = 10
    WriteCapacityUnits = 10

    year = IntegerField(name='year', hash_key=True)
    title = CharField(name='title', range_key=True)
    rating = FloatField(name='rating', indexed=True)
    rank = IntegerField(name='rank', indexed=True)
    release_date = CharField(name='release_date')
    info = DictField(name='info', default={})

# create_table
Table(Movies()).create()

# update_table
Table(Movies()).update()

# delete_table
Table(Movies()).delete()

```

##### 查询项目

```python
# query without index
items = Movies.query().where(Movies.year.eq(year)).all()
items = Movies.query().where(Movies.year.eq(1985)).limit(10).all()
items = (Movies.query()
        .where(Movies.year.eq(1992),
               Movies.title.between('A', 'L'))
        .all())

# query with index
items = (Movies.query()
        .where(Movies.year.eq(1992),
               Movies.title.between('A', 'L'))
        .order_by(Movies.rating, asc=False)
        .all())
```

##### 更新项目


```python
item = Movies.get(year=year, title=title)

item.update(rank=2467, rating=7.1)
```

##### 删除项目

```python
item = Movies.get(year=year, title=title)

item.delete()
```

就是这么方便。

不过[dynamodb-py](https://github.com/gusibi/dynamodb-p) 还在开发中，欢迎试用，也欢迎贡献自己的力量。

> 终于，下一节介绍索引的查询


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)