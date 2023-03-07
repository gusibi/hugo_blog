+++
date = "2017-01-31T17:46:28+08:00"
draft = false
title = "Amazon DynamoDB 入门6：query 和 scan"

tags = ["AWS", "nosql", "DynamoDB", "python"]
categories = ["development", "nosql", "DynamoDB", "python"]
slug = "Amazon-DynamoDB-Query-And-Scan"
+++

> 上一节我们介绍了DynamoDB索引的创建及管理，这一节我们将介绍query（查询）和scan（扫描）的使用。

# 查询Query

SQL 可使用 SELECT 语句查询关键列、非关键列或任意组合。WHERE 子句确定返回的行。

DynamoDB Query 操作提供对存储数据的物理位置的快速高效访问。 可以将 Query 用于任何具有复合主键（分区键和排序键）的表。这里的表必须指定分区键的相等条件，并且可以选择性为排序键提供另一个条件。 KeyConditionExpression 参数指定要查询的键值。

HUGOMORE42

> 可使用可选 FilterExpression 在结果中的找出某些符号条件的项目。

在 DynamoDB 中，必须使用 ExpressionAttributeValues 作为表达式参数（例如，KeyConditionExpression和 FilterExpression）中的占位符。这类似于在关系数据库中使用绑定变量，在运行时将实际值代入 SELECT语句。 下边是query的语法：

```python
response = table.query(
    IndexName='string',
    Select='ALL_ATTRIBUTES'|'ALL_PROJECTED_ATTRIBUTES'|'SPECIFIC_ATTRIBUTES'|'COUNT',
    AttributesToGet=[
        'string',
    ],
    Limit=123,
    ConsistentRead=True|False,
    ConditionalOperator='AND'|'OR',
    ScanIndexForward=True|False,
    ExclusiveStartKey={
      'string': 'string'|123|Binary(b'bytes')|True|None|set(['string'])|set([123])|set([Binary(b'bytes')])|[]|{}
    },
    ReturnConsumedCapacity='INDEXES'|'TOTAL'|'NONE',
    ProjectionExpression='string',
    FilterExpression=Attr('myattribute').eq('myvalue'),
    KeyConditionExpression=Key('mykey').eq('myvalue'),
    ExpressionAttributeNames={
        'string': 'string'
    },
    ExpressionAttributeValues={
        'string': 'string'|123|Binary(b'bytes')|True|None|set(['string'])|set([123])|set([Binary(b'bytes')])|[]|{}
    }
)
```

参数说明：

- ExclusiveStartKey: 起始查询的key，也就是上一页的最后一条数据
- ConsistentRead: 是否使用强制一致性 默认False
- ScanIndexForward: 索引的排序方式 True 为正序 False 为倒序 默认True
- ReturnConsumedCapacity: DynamoDB 将返回条件写入期间使用的写入容量单位数

  - TOTAL 会返回由表及其所有global secondary index占用的写入容量；
  - INDEXES 仅返回由global secondary index占用的写入容量；
  - NONE 表示您不需要返回任何占用容量统计数据。

- ProjectionExpression: 用于指定要在扫描结果中包含的属性

- FilterExpression: 指定一个条件，以便仅返回符合条件的项目

- KeyConditionExpression: 要查询的键值

- ExpressionAttributeNames: 提供名称替换功能
- ExpressionAttributeValues: 提供值替换功能

以下是 DynamoDB 中的几个 Query 示例：

返回 Aritist = 'No One You Know' SongTitle='Call Me Today' 的歌曲：

```json
{
    TableName: "Music",
    KeyConditionExpression: "Artist = :a and SongTitle = :t",
    ExpressionAttributeValues: {
        ":a": "No One You Know",
        ":t": "Call Me Today"
    }
}
```

返回 Aitist='No One You Know' 的所以歌曲：

```json
{
    TableName: "Music",
    KeyConditionExpression: "Artist = :a",
    ExpressionAttributeValues: {
        ":a": "No One You Know"
    }
}
```

返回Aritist ='No One You Know' 并且 SongTitle 开头为Call 的所有歌曲：

```json
{
    TableName: "Music",
    KeyConditionExpression: "Artist = :a and begins_with(SongTitle, :t)",
    ExpressionAttributeValues: {
        ":a": "No One You Know",
        ":t": "Call"
    }
}
```

返回Aritist ='No One You Know' 并且 SongTitle 开头为Today 并且价格小于1 的所有歌曲：

```json
{
    TableName: "Music",
    KeyConditionExpression: "Artist = :a and contains(SongTitle, :t)",
    FilterExpression: "price < :p",
    ExpressionAttributeValues: {
        ":a": "No One You Know",
        ":t": "Today",
        ":p": 1.00
    }
}
```

## Python Example

boto3

返回 Aitist='The Acme Band' 的所有歌曲：

```python
# ...
from boto3.dynamodb.conditions import Key, Attr

table = db3.Table('Music')

response = table.query(
    KeyConditionExpression=Key('Artist').eq('The Acme Band')
)

items = response['Items']
print(items)

## output
[
{
    u'Genre': u'Rock',
    u'Price': Decimal('0.99'),
    u'Artist': u'The Acme Band',
    u'SongTitle': u'Look Out, World',
    u'AlbumTitle': u'The Buck Starts Here'
},
{
    u'Artist': u'The Acme Band',
    u'Price': Decimal('2.47'),
    u'AlbumTitle': u'The Buck Starts Here',
    u'PromotionInfo': {
        u'RadioStationsPlaying': [u'KHCR', u'KBQX', u'WTNR', u'WJJH'],
        u'Rotation': u'Heavy',
        u'TourDates': {u'Seattle': u'20150625', u'Cleveland': u'20150630'}
    },
    u'Genre': u'Rock', u'SongTitle': u'Still In Love'
    }
]
```

返回 Artist='No One You Know' 并且SongTitle='Somewhere Down The Road' 的所有歌曲：

```python
response = table.query(
    KeyConditionExpression=Key('Artist').eq('No One You Know') & Key('SongTitle').eq('Somewhere Down The Road')
)
items = response['Items']
print(items)

## output

[{
    u'Artist': u'No One You Know',
    u'AlbumTitle': u'Somewhat Famous',
    u'CriticRating': Decimal('8.4'),
    u'Year': Decimal('1984'),
    u'Genre': u'Country',
    u'SongTitle': u'Somewhere Down The Road'
  }
]
```

返回Aritist ='No One You Know' 并且 SongTitle 开头为 Call 的所有歌曲：

```python
response = table.query(
    KeyConditionExpression=Key('Artist').eq('The Acme Band') & Key('SongTitle').begins_with('Look')
)
items = response['Items']
print(items)

## output

[
{
    u'Genre': u'Rock',
    u'Price': Decimal('0.99'),
    u'Artist': u'The Acme Band',
    u'SongTitle': u'Look Out, World',
    u'AlbumTitle': u'The Buck Starts Here'
}
]
```

返回Aritist ='No One You Know' 并且 SongTitle 开头为Today 并且价格小于1 的所有歌曲：

```python
response = table.query(
    KeyConditionExpression=Key('Artist').eq('The Acme Band'),
    FilterExpression=Attr('Price').lt(1)
)
items = response['Items']
print(items)

## output
[{
    u'Genre': u'Rock',
    u'Price': Decimal('0.99'),
    u'Artist': u'The Acme Band',
    u'SongTitle': u'Look Out, World',
    u'AlbumTitle': u'The Buck Starts Here'
},
]
```

### Note

特别注意： 如果筛选条件是排序键，则是先过滤再返回结果，和SQL中where 筛选类似。 如果排序值不是排序建，则先返回结果再过滤。

例如：

表结构和项目值如下：

```
Table Test:
    a: hash_key
    b: range_key
    c: number

for i in range(10):
    Test(a=1, b=i*10, c=i*20)
```

查询：

```python
response = table.query(
    KeyConditionExpression=Key('a').eq('1') & Key('b').gt('40'),
    Limit=2
)

查询结果为两个项目：

a=1, b=50, c=80
a=1, b=60, c=100

response = table.query(
    KeyConditionExpression=Key('a').eq('1'),
    FilterExpression=Attr('c').gt('80'),
    Limit=2
)

会发现查询没有结果。

这是因为DynamoDB 会默认按照 b 正序排列，limit=2 则限定了结果为：
a=1, b=10, c=20
a=1, b=20, c=40

可以看出，这个结果中并没有符合 c > 80 的项目。
所以 结果为空。

不过还是会占读取吞吐量。
```

## Scan

在 SQL 中，不带 WHERE 子句的 SELECT 语句将返回表中的每个行。在 DynamoDB 中，Scan 操作可执行相同的工作。在这两种情况下，您都可以检索所有项目或部分项目。 无论您使用的是 SQL 还是 NoSQL 数据库，都应谨慎使用扫描操作，因为它们会占用大量系统资源

在 SQL 中，可在不指定 WHERE 子句的情况下使用 SELECT 语句扫描表并检索其所有数据。您可以在结果中请求一个或多个列。或者，如果您使用通配符 (*)，则可请求所有列。 下面是一些示例：

```sql
/* Return all of the data in the table */
SELECT * FROM Music;
/* Return all of the values for Artist and Title */
SELECT Artist, Title FROM Music;
```

DynamoDB 提供以相似方式工作的 Scan 操作。 下面是Scan 的语法示例：

```python
response = table.scan(
    IndexName='string',
    AttributesToGet=[
        'string',
    ],
    Limit=123,
    Select='ALL_ATTRIBUTES'|'ALL_PROJECTED_ATTRIBUTES'|'SPECIFIC_ATTRIBUTES'|'COUNT',
    ConditionalOperator='AND'|'OR',
    ExclusiveStartKey={
        'string': 'string'|123|Binary(b'bytes')|True|None|set(['string'])|set([123])|set([Binary(b'bytes')])|[]|{}
    },
    ReturnConsumedCapacity='INDEXES'|'TOTAL'|'NONE',
    TotalSegments=123,
    Segment=123,
    ProjectionExpression='string',
    FilterExpression=Attr('myattribute').eq('myvalue'),
    ExpressionAttributeNames={
        'string': 'string'
    },
    ExpressionAttributeValues={
        'string': 'string'|123|Binary(b'bytes')|True|None|set(['string'])|set([123])|set([Binary(b'bytes')])|[]|{}
    },
    ConsistentRead=True|False
)
```

参数说明：

- ExclusiveStartKey: 起始查询的key，也就是上一页的最后一条数据
- ConsistentRead: 是否使用强制一致性 默认False
- ScanIndexForward: 索引的排序方式 True 为正序 False 为倒序 默认True
- ReturnConsumedCapacity: DynamoDB 将返回条件写入期间使用的写入容量单位数

  - TOTAL 会返回由表及其所有global secondary index占用的写入容量；
  - INDEXES 仅返回由global secondary index占用的写入容量；
  - NONE 表示您不需要返回任何占用容量统计数据。

- ProjectionExpression: 用于指定要在扫描结果中包含的属性

- FilterExpression: 指定一个条件，以便仅返回符合条件的项目

- KeyConditionExpression: 要查询的键值

- ExpressionAttributeNames: 提供名称替换功能
- ExpressionAttributeValues: 提供值替换功能

> scan 的查询方式是先扫描所有数据，筛选条件也仅在扫描整个表后进行应用，所以会占用大量的读取吞吐量。

下面是一些示例：

```json
// Return all of the data in the table
{
    TableName:  "Music"
}
// Return all of the values for Artist and Title
{
    TableName:  "Music",
    ProjectionExpression: "Artist, Title"
}
```

Scan 操作还提供一个 FilterExpression 参数以过滤符合条件的项目。在扫描整个表后且结果返回之前，应用 FilterExpression。（建议不要对大型表这样做：即使仅返回几个匹配项目，仍需为整个 Scan 付费。会占用吞吐量）

### Python Example

boto3

返回Aritist ='No One You Know' 并且 SongTitle 开头为Today 并且价格小于1 的所有歌曲：

```python
response = table.scan(
    FilterExpression=Attr('Price').lt(2)&Key('Artist').eq('The Acme Band')
)
items = response['Items']
print(items)

## output
[{
    u'Genre': u'Rock',
    u'Price': Decimal('0.99'),
    u'Artist': u'The Acme Band',
    u'SongTitle': u'Look Out, World',
    u'AlbumTitle': u'The Buck Starts Here'
},]
```

在代码中，请注意以下情况：

- ProjectionExpression 用于指定要在扫描结果中包含的属性。
- FilterExpression 用于指定一个条件，以便仅返回符合条件的项目。所有其他项目都将被舍弃。
- scan 方法每次返回项目的一个子集（称为页面）。响应中的 LastEvaluatedKey 值随后通过 ExclusiveStartKey 参数传递给 scan 方法。当返回最后一页后，LastEvaluatedKey 将不是响应的一部分。

Note

- ExpressionAttributeNames 提供名称替换功能。我们使用此参数是因为 year 是 DynamoDB 中的保留字，您不能直接在任何表达式中使用它，包括 KeyConditionExpression。我们使用表达式属性名称 #yr 来解决此问题。
- ExpressionAttributeValues 提供值替换功能。我们使用此参数是因为您不能在任何表达式中使用文字，包括 KeyConditionExpression。我们使用表达式属性值 :yyyy 来解决此问题。

> 这一节我们介绍了DynamoDB query和scan的基本用法，下一节将介绍使用索引查询

tips:
从这几篇的介绍可以发现DynamoDB的查询语法比较繁琐，写起来非常麻烦，所以我模仿sqlalchemy 写了一个orm，欢迎使用[!https://github.com/gusibi/dynamodb-py](https://github.com/gusibi/dynamodb-py)

[原文地址](http://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751959&idx=1&sn=ba71eac3e0113239031c326e421015ea&chksm=80b0b83db7c7312b0eaf427dee3abdf6a94a7694d9c58974912db368d88128900da77ab25aba#rd)


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)