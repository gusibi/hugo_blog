+++
date = "2017-01-18T21:53:38+08:00"
draft = false
title = "Amazon DynamoDB 入门4：项目的基本操作（CRUD）"

tags = ["nosql", "DynamoDB", "python"]
categories = ["development", "nosql", "DynamoDB", "python"]
slug = "Amazon-DynamoDB-Items-CRUD"
+++

> 上一节我们介绍了DynamoDB 表的操作，这一节将介绍项目的添加 修改 获取 删除操作。

## 创建项目

Amazon DynamoDB 提供了 PutItem 和 BatchWriteItem 两种方式写入数据

### 添加单个项目

在 Amazon DynamoDB 中，使用 PutItem 操作向表添加项目：

HUGOMORE42

```
{
    TableName: "Music",
    Item: {
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today",
        "AlbumTitle":"Somewhat Famous",
        "Year": 2015,
        "Price": 2.14,
        "Genre": "Country",
        "Tags": {
            "Composers": [
                  "Smith",
                  "Jones",
                  "Davis"
            ],
            "LengthInSeconds": 214
        }
    }
}
```

此表的主键包含 Artist 和 SongTitle。您必须为这些属性指定值。
以下是要了解的有关此 PutItem 示例的几个关键事项：

* DynamoDB 使用 JSON 提供对文档的本机支持。这使得 DynamoDB 非常适合存储半结构化数据，例如 Tags。您也可以从 JSON 文档中检索和操作数据。 
* 除了主键（Artist 和 SongTitle），Music 表没有预定义的属性。 
* 大多数 SQL 数据库是面向事务的。当您发出 INSERT 语句时，数据修改不是永久性的，直至您发出 COMMIT 语句。利用 Amazon DynamoDB，当 DynamoDB 通过 HTTP 200 状态代码 (OK) 进行回复时，PutItem 操作的效果是永久性的。 

#### Python Example

boto3

```
# ...
table = db3.Table('Music')
table.put_item(
      Item = {
        "Artist": "No One You Know",
        "SongTitle": "My Dog Spot",
        "AlbumTitle": "Hey Now",
        "Price": Decimal('1.98'),
        "Genre": "Country",
        "CriticRating": Decimal('8.4')
    }
)

Out[98]:
{'ResponseMetadata': {'HTTPHeaders': {'content-length': '2',
   'content-type': 'application/x-amz-json-1.0',
   'server': 'Jetty(8.1.12.v20130726)',
   'x-amz-crc32': '2745614147',
   'x-amzn-requestid': 'c7c6be12-9752-403f-97b1-a9ac451a0a98'},
  'HTTPStatusCode': 200,
  'RequestId': 'c7c6be12-9752-403f-97b1-a9ac451a0a98',
  'RetryAttempts': 0}}

table.put_item(
      Item = {
        "Artist": "No One You Know",
        "SongTitle": "Somewhere Down The Road",
        "AlbumTitle":"Somewhat Famous",
        "Genre": "Country",
        "CriticRating": Decimal('8.4'),
        "Year": 1984
    }
)
table.put_item(
      Item = {
        "Artist": "The Acme Band",
        "SongTitle": "Still In Love",
        "AlbumTitle":"The Buck Starts Here",
        "Price": Decimal('2.47'),
        "Genre": "Rock",
        "PromotionInfo": {
            "RadioStationsPlaying":[
                 "KHCR", "KBQX", "WTNR", "WJJH"
            ],
            "TourDates": {
                "Seattle": "20150625",
                "Cleveland": "20150630"
            },
            "Rotation": "Heavy"
        }
    }
)

table.put_item(
      Item = {
        "Artist": "The Acme Band",
        "SongTitle": "Look Out, World",
        "AlbumTitle":"The Buck Starts Here",
        "Price": Decimal('0.99'),
        "Genre": "Rock"
    }
)

```
Note

* PutItem 是覆盖操作，如果主键相同，第二次执行将覆盖掉之前的数据
* 除了 PutItem 之外，Amazon DynamoDB 还支持同时写入多个（最多25个）项目的 BatchWriteItem 操作。

### 添加多个项目

#### Python Example

boto3

```
# ...
table = db3.Table('Music')

with table.batch_writer() as batch:
    batch.put_item(
        Item = {
            "Artist": "The Acme Band",
            "SongTitle": "Look Out, World",
            "AlbumTitle":"The Buck Starts Here",
            "Price": Decimal('0.99'),
            "Genre": "Rock"
        }
    )
    batch.put_item(
        Item = {
            "Artist": "The Acme Band 0",
            "SongTitle": "Look Out, World",
            "AlbumTitle":"The Buck Starts Here",
            "Price": Decimal('1.99'),
            "Genre": "Rock"
        }
    )
    batch.put_item(
        Item = {
            "Artist": "The Acme Band 1",
            "SongTitle": "Look Out, World",
            "AlbumTitle":"The Buck Starts Here",
            "Price": Decimal('2.99'),
            "Genre": "Rock"
        }
    )
    batch.put_item(
        Item = {
            "Artist": "The Acme Band 1",
            "SongTitle": "Look Out, World",
            "AlbumTitle":"The Buck Starts Here",
        }
    )
```

BatchWriteItem 使用 overwrite_by_pkeys=['partition_key','sort_key'] 参数去除项目中重复的部分。

```
with table.batch_writer(overwrite_by_pkeys=['partition_key', 'sort_key']) as batch:
    batch.put_item(
        Item={
            'partition_key': 'p1',
            'sort_key': 's1',
            'other': '111',
        }
    )
    batch.put_item(
        Item={
            'partition_key': 'p1',
            'sort_key': 's1',
            'other': '222',
        }
    )
```
去重后，等同于:

```
with table.batch_writer(overwrite_by_pkeys=['partition_key', 'sort_key']) as batch:
    batch.put_item(
        Item={
            'partition_key': 'p1',
            'sort_key': 's1',
            'other': '222',
        }
    )
```


## 读取数据


利用 SQL，我们可以使用 SELECT 语句从表中检索一个或多个行。可使用 WHERE 子句来确定返回给您的数据

DynamoDB 提供以下操作来读取数据：

* GetItem - 从表中检索单个项目。这是读取单个项目的最高效方式，因为它将提供对项目的物理位置的直接访问。（DynamoDB 还提供 BatchGetItem 操作，在单个操作中执行最多 100 个 GetItem 调用。）
* Query - 检索具有特定分区键的所有项目。在这些项目中，您可以将条件应用于排序键并仅检索一部分数据。Query提供对存储数据的分区的快速高效的访问。
* Scan - 检索指定表中的所有项目。

Note

利用关系数据库，您可以使用 SELECT 语句联接多个表中的数据并返回结果。联接是关系模型的基础。要确保联接高效执行，应持续优化数据库及其应用程序的性能。
DynamoDB 是一个非关系 NoSQL 数据库且不支持表联接。相反，应用程序一次从一个表中读取数据。

### 使用项目的主键读取项目

DynamoDB 提供 GetItem 操作来按项目的主键检索项目。

默认情况下，GetItem 将返回整个项目及其所有属性。

```
{
    TableName: "Music",
    Key: {
        "Artist": "No One You Know",
        "SongTitle": "Call Me Today"
    }
}
```

可以添加 ProjectionExpression 参数以仅返回一些属性：

```
{
    TableName: "Music",
    Key: {
        "Artist": "No One You Know",
        "SongTitle": "Call Me Today"
    },
    "ProjectionExpression": "AlbumTitle, Price"
}
```

* DynamoDB GetItem 操作非常高效：此操作使用主键值确定相关项目的准确存储位置，并直接此位置检索该项目。
* SQL SELECT 语句支持多种查询和表扫描。DynamoDB 通过其 Query 和 Scan 操作提供相似功能，如查询表和扫描表中所述。
* SQL SELECT 语句可执行表联接，这允许您同时从多个表中检索数据。DynamoDB 是一个非关系数据库。因此，它不支持表联接。

> Query 和 Scan 操作将在之后的章节详细介绍。

#### Python Example

boto3

```
# ...
table = db3.Table('Music')
response = table.get_item(
    Key={
        "Artist": "The Acme Band",
        "SongTitle": "Still In Love"
    }
)
item = response['Item']
print(item)

# output
{
        "Artist": "The Acme Band",
        "SongTitle": "Still In Love",
        "AlbumTitle":"The Buck Starts Here",
        "Price": Decimal('2.47'),
        "Genre": "Rock",
        "PromotionInfo": {
            "RadioStationsPlaying":[
                 "KHCR", "KBQX", "WTNR", "WJJH"
            ],
            "TourDates": {
                "Seattle": "20150625",
                "Cleveland": "20150630"
            },
            "Rotation": "Heavy"
        }
    }

response = table.get_item(
    Key={
        "Artist": "The Acme Band",
        "SongTitle": "Still In Love"
    },
    ProjectionExpression = "AlbumTitle, Price"
)
item = response['Item']
print(item)
{
    'AlbumTitle': u'The Buck Starts Here',
    'Price': Decimal('2.47')
}
```
## 更新

SQL 语言提供用于修改数据的 UPDATE 语句。DynamoDB 使用 UpdateItem 操作完成类似的任务。

在 DynamoDB 中，可使用 UpdateItem 操作修改单个项目。（如果要修改多个项目，则必须使用多个 UpdateItem 操作。）
示例如下：

```
{
    TableName: "Music",
    Key: {
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression: "SET RecordLabel = :label",
    ExpressionAttributeValues: {
        ":label": "Global Records"
    }
}
```

* 必须指定要修改的项目的 Key 属性和一个用于指定属性值的 UpdateExpression。
* UpdateItem 替换整个项目，而不是替换单个属性。
* UpdateItem 的行为与**“upsert”操作的行为类似**：如果项目位于表中，则更新项目，否则添加（插入）新项目。
* UpdateItem 支持条件写入，在此情况下，操作仅在特定 ConditionExpression 的计算结果为 true 时成功完成

```
{
    TableName: "Music",
    Key: {
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression: "SET RecordLabel = :label",
    ConditionExpression: "Price >= :p",
    ExpressionAttributeValues: {
        ":label": "Global Records",
        ":p": 2.00
    }
}
```

* UpdateItem 还支持原子计数器或类型为 Number 的属性（可递增或递减）。

以下是一个 UpdateItem 操作的示例，它初始化一个新属性 (Plays) 来跟踪歌曲的已播放次数：

```
{
    TableName: "Music",
    Key: {
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression: "SET Plays = :val",
    ExpressionAttributeValues: {
        ":val": 0
    },
    ReturnValues: "UPDATED_NEW"
}

```

ReturnValues 参数设置为 UPDATED_NEW，这将返回已更新的任何属性的新值。在此示例中，它返回 0（零）。

当某人播放此歌曲时，可使用以下 UpdateItem 操作来将 Plays 增加 1：

```
{
    TableName: "Music",
    Key: {
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression: "SET Plays = Plays + :incr",
    ExpressionAttributeValues: {
        ":incr": 1
    },
    ReturnValues: "UPDATED_NEW"
}
```
#### Python Example

boto3
使用 UpdateItem 操作修改单个项目

```
import boto3
import json
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

db3 = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")

table = db3.Table('Music')

response = table.update_item(
    Key={
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression="SET RecordLabel = :label",
    ExpressionAttributeValues={
        ":label": "Global Records"
    },
    ReturnValues="UPDATED_NEW"
)

print(json.dumps(response, indent=4, cls=DecimalEncoder))
```

UpdateItem 条件写入 价格大于或等于 2.00 UpdateItem 执行更新

```
table = db3.Table('Music')

response = table.update_item(
    Key={
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression="SET RecordLabel = :label",
    ConditionExpression="Price >= :p",
    ExpressionAttributeValues={
        ":label": "Global Records",
        ":p": 2.00
    },
    ReturnValues="UPDATED_NEW"
)

```
UpdateItem 操作的示例，它初始化一个新属性 (Plays) 来跟踪歌曲的已播放次数

```
table = db3.Table('Music')

response = table.update_item(
    Key={
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression="SET Plays = :val",
    ExpressionAttributeValues={
        ":val": 0
    },
    ReturnValues="UPDATED_NEW"
)

```
使用 UpdateItem 操作来将 Plays 增加 1

```
table = db3.Table('Music')

response = table.update_item(
    Key={
        "Artist":"No One You Know",
        "SongTitle":"Call Me Today"
    },
    UpdateExpression="SET Plays = Plays + :incr",
    ExpressionAttributeValues={
        ":incr": 1
    },
    ReturnValues="UPDATED_NEW"
)

```

## 删除项目

在 SQL 中，DELETE 语句从表中删除一个或多个行。DynamoDB 使用 DeleteItem 操作一次删除一个项目。

在 DynamoDB 中，可使用 DeleteItem 操作从表中删除数据（一次删除一个项目）。您必须指定项目的主键值。示例如下：

```
{
    TableName: "Music",
    Key: {
        Artist: "The Acme Band",
        SongTitle: "Look Out, World"
    }
}
```

Note

除了 DeleteItem 之外，Amazon DynamoDB 还支持同时删除多个项目的 BatchWriteItem 操作。

DeleteItem 支持条件写入，在此情况下，操作仅在特定 ConditionExpression 的计算结果为 true 时成功完成。例如，以下 DeleteItem 操作仅在项目具有 RecordLabel 属性时删除项目：

```
{
    TableName: "Music",
    Key: {
        Artist: "The Acme Band",
        SongTitle: "Look Out, World"
    },
   ConditionExpression: "attribute_exists(RecordLabel)"
}
```

#### Python Example

boto3

```
table = db3.Table('Music')
table.delete_item(
    Key={
        'AlbumTitle': 'Hey Now'
        'Artist': 'No One You Know'
    }
)

```

> 这一节我们介绍了项目的基本操作（CRUD），下一节将介绍索引的创建和管理。

[原文地址](http://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751948&idx=1&sn=22046f0c62fa0e3a740306b5f106488a&chksm=80b0b826b7c73130e0f65057f83aebea9b41c5edcdccd3230a07fe24f5864c5ed11e89f0ae05#rd)
