+++
date = "2017-01-18T21:55:39+08:00"
draft = false
title = "Amazon DynamoDB 入门5：索引创建及管理"

tags = ["nosql", "DynamoDB", "python"]
categories = ["development", "nosql", "DynamoDB", "python"]
slug = "AmazonDynamoDBIndexes"
+++

> 上一节我们介绍了项目的添加、修改、获取、删除（CRUD）操作，这一节将介绍索引的创建及管理。

### 创建索引

#### SQL

在关系数据库中，索引是一个数据结构，可对表中的不同的列执行快速查询。可以使用 CREATE INDEX SQL 语句将索引添加到现有表，并指定要建立索引的列。在创建索引后，可以照常查询表中的数据，但现在数据库可使用索引快速查找表中的指定行，而不是扫描整个表。

在创建一个索引后，数据库将自动维护此索引。只要修改表中的数据，就会自动更改索引以反映表中的更改。

HUGOMORE42

在 MySQL 中，您可以创建如下所示的索引：

```
CREATE INDEX GenreAndPriceIndex
ON Music (genre, price);
```
#### DynamoDB

在 DynamoDB 中，我们可以创建和使用secondary index来实现类似目的。

DynamoDB 中的索引与其关系对应项不同。当我们创建secondary index时，必须指定其键属性 - 分区键和排序键。
在创建secondary index后，我们可以对它执行 Query 或 Scan 操作，就如同对表执行这些操作一样。
DynamoDB 没有查询优化程序，因此，仅在我们对secondary index执行 Query 或 Scan 操作时使用它。

DynamoDB 支持两种不同的索引：

* 全局二级索引 - 索引的主键可以是其表中的任意两个属性（**可以在创建表时创建，也可以向现有表添加新全局二级索引，或者删除现有的全局二级索引**）。
* 本地二级索引 - 索引的分区键必须与其表的分区键相同。不过，排序键可以是任何其他属性（**是在创建表的同时创建的。不能向现有表添加本地二级索引，也不能删除已存在的任何本地二级索引**）。


DynamoDB 确保secondary index中的数据最终与其表保持一致。我们可以请求对表或local secondary index**执行强一致性 Query 或 Scan 操作**。但是，**全局二级索引仅支持最终一致性**。

可使用 UpdateTable 操作并指定 GlobalSecondaryIndexUpdates 来将global secondary index添加到现有表：

```
{
    TableName: "Music",
    AttributeDefinitions:[
        {AttributeName: "Genre", AttributeType: "S"},
        {AttributeName: "Price", AttributeType: "N"}
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                IndexName: "GenreAndPriceIndex",
                KeySchema: [
                    {AttributeName: "Genre", KeyType: "HASH"}, //Partition key
                    {AttributeName: "Price", KeyType: "RANGE"}, //Sort key
                ],
                Projection: {
                    "ProjectionType": "ALL"
                },
                ProvisionedThroughput: {
                    "ReadCapacityUnits": 1,"WriteCapacityUnits": 1
                }
            }
        }
    ]
}
```

添加索引时必须向 UpdateTable 提供以下参数：

* TableName – 索引将关联到的表。
* AttributeDefinitions – 索引的键架构属性的数据类型。
* GlobalSecondaryIndexUpdates – 有关要创建的索引的详细信息：

    * IndexName - 索引的名称。
    * KeySchema – 用于索引主键的属性。
    * Projection - 表中要复制到索引的属性。在此情况下，ALL 意味着复制所有属性。
    * ProvisionedThroughput – 每秒需对此索引执行的读取和写入次数。（它与表的预配置吞吐量设置是分开的。）

在此操作中，会将表中的数据回填到新索引。在回填期间，表保持可用。但索引未准备就绪，直至其 Backfilling 属性从 true 变为 false。您可以使用 DescribeTable 操作查看此属性。

#### python 示例

boto3

```
import boto3
db3 = boto3.resource('dynamodb', endpoint_url='http://localhost:8000',  region_name='us-west-2')

table = db3.meta.client.update_table(
    TableName='Music',
    AttributeDefinitions=[
        {
            'AttributeName': "Genre",
            'AttributeType': "S"
        },
        {
            'AttributeName': "Price",
            'AttributeType': "N"
        }
    ],
    GlobalSecondaryIndexUpdates=[
        {
            'Create': {
                'IndexName': "GenreAndPriceIndex",
                'KeySchema': [
                    {'AttributeName': "Genre", 'KeyType': "HASH"},  # Partition key
                    {'AttributeName': "Price", 'KeyType': "RANGE"}, # Sort key
                ],
                'Projection': {
                    "ProjectionType": "ALL"
                },
                'ProvisionedThroughput': {
                    "ReadCapacityUnits": 10,"WriteCapacityUnits": 10
                }
            }
        }
    ]
)

db3.meta.client.describe_table(TableName='Music')
```

> output

```
{'ResponseMetadata': {'HTTPHeaders': {'content-length': '1082',
   'content-type': 'application/x-amz-json-1.0',
   'server': 'Jetty(8.1.12.v20130726)',
   'x-amz-crc32': '3717567836',
   'x-amzn-requestid': 'd63c0176-8257-428b-b6f3-af87219ba45b'},
  'HTTPStatusCode': 200,
  'RequestId': 'd63c0176-8257-428b-b6f3-af87219ba45b',
  'RetryAttempts': 0},
 u'Table': {u'AttributeDefinitions': [{u'AttributeName': u'Artist',
    u'AttributeType': u'S'},
   {u'AttributeName': u'Price', u'AttributeType': u'N'},
   {u'AttributeName': u'SongTitle', u'AttributeType': u'S'},
   {u'AttributeName': u'Genre', u'AttributeType': u'S'}],
  u'CreationDateTime': datetime.datetime(2017, 1, 14, 3, 9, 42, 63000, tzinfo=tzlocal()),
  u'GlobalSecondaryIndexes': [{u'IndexArn': u'arn:aws:dynamodb:ddblocal:000000000000:table/Music/index/GenreAndPriceIndex',
    u'IndexName': u'GenreAndPriceIndex',
    u'IndexSizeBytes': 0,
    u'IndexStatus': u'ACTIVE',
    u'ItemCount': 0,
    u'KeySchema': [{u'AttributeName': u'Genre', u'KeyType': u'HASH'},
     {u'AttributeName': u'Price', u'KeyType': u'RANGE'}],
    u'Projection': {u'ProjectionType': u'ALL'},
    u'ProvisionedThroughput': {u'ReadCapacityUnits': 10,
     u'WriteCapacityUnits': 10}}],
  u'ItemCount': 0,
  u'KeySchema': [{u'AttributeName': u'Artist', u'KeyType': u'HASH'},
   {u'AttributeName': u'SongTitle', u'KeyType': u'RANGE'}],
  u'ProvisionedThroughput': {u'LastDecreaseDateTime': datetime.datetime(1970, 1, 1, 8, 0, tzinfo=tzlocal()),
   u'LastIncreaseDateTime': datetime.datetime(1970, 1, 1, 8, 0, tzinfo=tzlocal()),
   u'NumberOfDecreasesToday': 0,
   u'ReadCapacityUnits': 10,
   u'WriteCapacityUnits': 10},
  u'TableArn': u'arn:aws:dynamodb:ddblocal:000000000000:table/Music',
  u'TableName': u'Music',
  u'TableSizeBytes': 0,
  u'TableStatus': u'ACTIVE'}}

```
---------
### 索引扩展

### 管理索引

索引可以访问替代查询模式，并可以加快查询速度。

无论使用的是关系数据库还是 DynamoDB，在创建索引时都应谨慎。只要对表进行写入，就必须更新表的所有索引。在具有大型表的写入密集型环境中，这会占用大量系统资源。

为了对表中的数据进行高效访问，Amazon DynamoDB 对主键属性创建并维护索引。这可以让应用程序通过指定主键值快速地检索数据。
可以对表创建一个或多个二级索引，然后对这些索引发出 Query 或 Scan 请求，以便通过主键以外的属性对数据进行高效访问。

secondary index 是一种数据结构，它包含表中属性的子集以及一个支持 Query 操作的替代键。我们可以使用 Query 从索引中检索数据，其方式与对表使用 Query 大致相同。一个表可以有多个secondary index，这样，应用程序可以访问许多不同的查询模式。

> 也可以对索引使用 Scan，其方式与对表使用 Scan 大致相同。

secondary index中的数据由从表投影 或复制到索引中的属性组成。在创建secondary index时，可以定义索引的替代键以及要在索引中投影的任何其他属性。DynamoDB 将这些属性与表中的主键属性一起复制到索引中。然后，就可以像查询或扫描表一样查询或扫描该索引。

每个secondary index都由 DynamoDB 自动维护。在表中添加、修改或删除项目时，表上的所有索引也会更新。

DynamoDB 支持两种secondary index：

* Global secondary index – 其分区键和排序键可以与表上的分区键和排序键不同的索引。global secondary index被视为“全局”，是因为对索引进行的查询可以跨表中所有分区的所有数据。
* Local secondary index – 一种分区键与表中的相同但排序键与表中的不同的索引。local secondary index的含义是“本地”，表示local secondary index的每个分区的范围都限定为具有相同分区键值的表分区。


下表是global secondary index与local secondary index的主要差异：

-------

性能 | 全局二级索引  | 本地二级索引
---|---|---
键架构|	global secondary index的**主键可以是简单主键（分区键）或复合主键（分区键和排序键）**。	|local secondary index的**主键必须是复合主键**（分区键和排序键）。
键属性|	索引分区键和排序键（如果有）可以是字符串、数字或二进制类型的任何表属性。	|索引的分区键是与表的分区键相同的属性。排序键可以是字符串、数字或二进制类型的任何表属性。
每个分区键值的大小限制|	global secondary index**没有大小限制**。	|对于每个分区键值，**所有索引项目的大小总和必须为 10GB 或更小**。
在线索引操作|	可以在创建表时创建Global secondary index。也可以向现有表添加新global secondary index，或者删除现有global secondary index。|Local secondary index是在**创建表的同时创建的**。不能向现有表添加local secondary index，也不能删除已存在的任何local secondary index。
查询和分区|	通过global secondary index，**可以跨所有分区查询整个表**。	|借助local secondary index，**可以对查询中分区键值指定的单个分区进行查询**。
读取一致性|	对global secondary index进行的查询**仅支持最终一致性**。	|查询local secondary index时，**可以选择最终一致性或强一致性**。
预配置吞吐量使用|	每个global secondary index都**有自己的用于读取和写入活动的预配置吞吐量设置**。对global secondary index进行的查询或扫描会占用索引（而非表）的容量单位。global secondary index更新也是如此，因为会进行表写入。	|对local secondary index进行的查询或扫描**会占用表的读取容量单位**。向表写入时，其local secondary index也会更新；这些更新会占用表的写入容量单位。
投影属性|	对于global secondary index查询或扫描，**只能请求投影到索引中的属性**。DynamoDB 不从表提取任何属性。	|如果您查询或扫描local secondary index，可以**请求未投影到索引中的属性**。DynamoDB 自动从表提取这些属性。

-------

> 如果要创建多个含有secondary index的表，必须按顺序执行此操作。例如，先创建第一个表，等待其状态变为 ACTIVE，创建下一个表，等待其状态变为 ACTIVE，依此类推。如果我们尝试同时创建多个含有secondary index的表，DynamoDB 会返回 LimitExceededException。

对于每个secondary index，必须指定以下内容：

* 要创建的索引的类型 – global secondary index或local secondary index。
* 索引的名称。索引的命名规则与表的命名规则相同，对于听一个表的不同索引，索名称必须是唯一的，不过，与不同的表的索引的名称可以相同。
* 索引的键架构。索引键架构中的每个属性必须是类型为字符串、数字或二进制的顶级属性。其他数据类型，包括文档和集，均不受支持。键架构的其他要求取决于索引的类型：
    * 对于global secondary index，分区键可以是任何标量表属性。排序键是可选的，也可以是任何标量表属性。
    * 对于local secondary index，分区键必须与表的分区键相同，排序键必须是非键表属性。
* 从表投影到索引中的其他属性（如果有）必须是除表键属性之外的属性。（表键属性会自动投影到每个索引）
* 索引的预配置吞吐量设置（如有必要）：
    * 对于global secondary index，必须指定读取和写入容量单位设置。这些预配置吞吐量设置独立于表的设置。
    * 对于local secondary index，无需指定读取和写入容量单位设置。对local secondary index进行的读取和写入操作会占用其父表的预配置吞吐量设置。

> 为获得最大查询灵活性，您可以为每个表创建最多 5 个 global secondary index和最多 5 个local secondary index。

可以使用 DescribeTable 操作获取表上secondary index的详细列表。DescribeTable 返回表上每个secondary index的名称、存储大小和项目数。**系统并不会实时更新这些值，但会大约每隔六个小时刷新一次**。

[原文地址](http://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751953&idx=1&sn=13195866ffc6106d90bb60df86347101&chksm=80b0b83bb7c7312d00c186d2603835ff7f49a6c0fb77c1c94c3ee7cd30b45f7661c7b8c03e42#rd)
