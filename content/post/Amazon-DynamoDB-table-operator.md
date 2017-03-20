+++
date = "2017-01-14T18:13:42+08:00"
title = "Amazon DynamoDB 入门3： 表的基本操作"
draft = false

tags = ["nosql", "DynamoDB", "python"]
categories = ["development", "nosql", "DynamoDB", "python"]
slug = "Amazon-DynamoDB-Table-Operator"
+++

> 之前两篇文章介绍了DynamoDB如何在本地安装以及基本的工作原理和API，这一节主要介绍如何使用DynamoDB。

基本的DynamoDB 操作包括表操作、项目操作和索引管理。

首先是链接数据库。和关系型数据库不同，**DynamoDB 是一项 Web 服务，与其进行的交互是无状态的。应用程序不需要维护持久性网络连接。相反，与 DynamoDB 的交互是通过 HTTP(S) 请求和响应进行的。**

HUGOMORE42

执行某项操作的步骤为：

1. **应用程序将 HTTP(S) 请求发送到 DynamoDB。该请求包含要执行的 DynamoDB 操作的名称和参数。DynamoDB 将立即执行请求。**
2. **DynamoDB 返回一个包含操作结果的 HTTP(S) 响应。如果出错，DynamoDB 将返回 HTTP 错误状态和消息。**

大多数情况下，我们编写应用程序代码访问DynamoDB。同时还可以使用 AWS 管理控制台或 AWS Command Line Interface (AWS CLI) 向 DynamoDB 发送临时请求并查看结果。

剩下的就让我们用代码展示吧！

## 表操作

我们知道，关系模型需要一个明确定义的架构，其中，数据将标准化为表、列和行。此外，在表、列、索引和其他数据库元素之间定义所有关系。但 DynamoDB 不同，**DynamoDB 没有架构。每个表必须具有一个用来唯一标识每个数据项目的主键，但对其他非键属性没有类似的约束。DynamoDB 可以管理结构化或半结构化的数据，包括 JSON 文档。**

表是关系数据库和 DynamoDB 中的基本数据结构。关系数据库管理系统 (RDBMS) 要求在创建表时定义表的架构。相比之下，DynamoDB 表没有架构 - 与主键不同，我们在创建表时无需定义任何属性或数据类型。

### 新建表

DynamoDB 使用 CreateTable 操作创建表，并指定参数，请求语法如下所示：

```
{
   "AttributeDefinitions": [
      {
         "AttributeName": "string",
         "AttributeType": "string"
      }
   ],
   "GlobalSecondaryIndexes": [
      {
         "IndexName": "string",
         "KeySchema": [
            {
               "AttributeName": "string",
               "KeyType": "string"
            }
         ],
         "Projection": {
            "NonKeyAttributes": [ "string" ],
            "ProjectionType": "string"
         },
         "ProvisionedThroughput": {
            "ReadCapacityUnits": number,
            "WriteCapacityUnits": number
         }
      }
   ],
   "KeySchema": [
      {
         "AttributeName": "string",
         "KeyType": "string"
      }
   ],
   "LocalSecondaryIndexes": [
      {
         "IndexName": "string",
         "KeySchema": [
            {
               "AttributeName": "string",
               "KeyType": "string"
            }
         ],
         "Projection": {
            "NonKeyAttributes": [ "string" ],
            "ProjectionType": "string"
         }
      }
   ],
   "ProvisionedThroughput": {
      "ReadCapacityUnits": number,
      "WriteCapacityUnits": number
   },
   "StreamSpecification": {
      "StreamEnabled": boolean,
      "StreamViewType": "string"
   },
   "TableName": "string"
}


```

必须向 CreateTable 提供以下参数：

* TableName – 表名称。
* KeySchema – 用于主键的属性。有关更多信息，请参阅 表、项目和属性 和 主键。
* AttributeDefinitions – 键架构属性的数据类型。
* ProvisionedThroughput – 每秒需对此表执行的读取和写入次数。DynamoDB 将保留足量的存储和系统资源，以便始终满足吞吐量要求。也可在创建之后使用 UpdateTable 操作后更改这些设置。存储分配完全由 DynamoDB 管理，我们无需指定表的存储要求。

AttributeType 的定义中：

* S - 字符串类型
* N - 数字类型
* B - 二进制类型 

#### Python Example

boto3

```
import boto3
db3 = boto3.resource('dynamodb', endpoint_url='http://localhost:8000',  region_name='us-west-2')


table = db3.create_table(
    TableName='Music',
    KeySchema=[
        {
            'AttributeName': "Artist",
            'KeyType': "HASH"
        },
        {
            'AttributeName': "SongTitle",
            'KeyType': "RANGE"
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': "Artist",
            'AttributeType': "S"
        },
        {
            'AttributeName': "SongTitle",
            'AttributeType': "S"
        }
    ],
    ProvisionedThroughput={       
        'ReadCapacityUnits': 1,
        'WriteCapacityUnits': 1
    }
)


# Wait until the table exists.
table.meta.client.get_waiter('table_exists').wait(TableName='Music')

# Print out some data about the table.
print(table.item_count)

```
此表的主键包括 Artist（分区键）和 SongTitle（排序键）。

### 获取有关表的信息

表建好后，我们可以使用 DescribeTable 命令查看表的信息。
唯一的参数是表名称，如下所示：

```
{
    TableName : "Music"
}
```

来自 DescribeTable 回复如下所示：

```
{
  "Table": {
    "AttributeDefinitions": [
      {
        "AttributeName": "Artist",
        "AttributeType": "S"
      },
      {
        "AttributeName": "SongTitle",
        "AttributeType": "S"
      }
    ],
    "TableName": "Music",
    "KeySchema": [
      {
        "AttributeName": "Artist",
        "KeyType": "HASH"  //Partition key
      },
      {
        "AttributeName": "SongTitle",
        "KeyType": "RANGE"  //Sort key
      }
    ],

    ...remaining output omitted...
```

DescribeTable 还将返回有关表中的索引、预配置的吞吐量设置、大约项目数和其他元数据的信息。

#### Python Example

boto3

```
import boto3
db3 = boto3.resource('dynamodb', endpoint_url='http://localhost:8000',  region_name='us-west-2')

db3.meta.client.describe_table(TableName='Music')
```
```
# 返回结果如下

{'ResponseMetadata': {'HTTPHeaders': {'content-length': '569',
   'content-type': 'application/x-amz-json-1.0',
   'server': 'Jetty(8.1.12.v20130726)',
   'x-amz-crc32': '2801025854',
   'x-amzn-requestid': '2dafeeab-8d79-4b32-ad1f-03983624ab41'},
  'HTTPStatusCode': 200,
  'RequestId': '2dafeeab-8d79-4b32-ad1f-03983624ab41',
  'RetryAttempts': 0},
 u'Table': {u'AttributeDefinitions': [{u'AttributeName': u'Artist',
    u'AttributeType': u'S'},
   {u'AttributeName': u'SongTitle', u'AttributeType': u'S'}],
  u'CreationDateTime': datetime.datetime(2016, 12, 28, 11, 25, 12, 657000, tzinfo=tzlocal()),
  u'ItemCount': 0,
  u'KeySchema': [{u'AttributeName': u'Artist', u'KeyType': u'HASH'},
   {u'AttributeName': u'SongTitle', u'KeyType': u'RANGE'}],
  u'ProvisionedThroughput': {u'LastDecreaseDateTime': datetime.datetime(1970, 1, 1, 8, 0, tzinfo=tzlocal()),
   u'LastIncreaseDateTime': datetime.datetime(1970, 1, 1, 8, 0, tzinfo=tzlocal()),
   u'NumberOfDecreasesToday': 0,
   u'ReadCapacityUnits': 1,
   u'WriteCapacityUnits': 1},
  u'TableArn': u'arn:aws:dynamodb:ddblocal:000000000000:table/Music',
  u'TableName': u'Music',
  u'TableSizeBytes': 0,
  u'TableStatus': u'ACTIVE'}}
```

### 删除表

当不再需要一个表并希望将它永久性丢弃时，可使用 DeleteTable：

表一经删除便无法恢复。（一些关系数据库允许撤消 DROP TABLE 操作）

```
{
    TableName: "Music"
}
```

#### Python Example

boto3

 ```
from __future__ import print_function # Python 2/3 compatibility
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")

table = dynamodb.Table('Music')

table.delete()

## output

{'ResponseMetadata': {
    'HTTPHeaders': {
        'content-length': '1012',
        'content-type': 'application/x-amz-json-1.0',
        'server': 'Jetty(8.1.12.v20130726)',
        'x-amz-crc32': '2473676771',
        'x-amzn-requestid': '84938373-870f-420f-b19e-4de2c6301743'},
    'HTTPStatusCode': 200,
    'RequestId': '84938373-870f-420f-b19e-4de2c6301743',
    'RetryAttempts': 0},
    u'TableDescription': {
    ...
    }
}
 ```

### 修改表

当一个表创建好之后如果想要调整，可以使用UpdateTable命令

修改表时我们一次只可以做一个操作:

	* 修改预设的吞吐量。
	* 开启或者停止使用Streams。
	* 删除一个全局耳机索引。
	* 创建一个全局的二级索引。当索引开始后台执行时，可以使用UpdateTable进行下一个操作。

> UpdateTable 是一个异步操作; 当它开始执行时，表的状态将由 ACTIVE 变为 UPDATING。

请求语法为：

```
{
   "AttributeDefinitions": [
      {
         "AttributeName": "string",
         "AttributeType": "string"
      }
   ],
   "GlobalSecondaryIndexUpdates": [
      {
         "Create": {
            "IndexName": "string",
            "KeySchema": [
               {
                  "AttributeName": "string",
                  "KeyType": "string"
               }
            ],
            "Projection": {
               "NonKeyAttributes": [ "string" ],
               "ProjectionType": "string"
            },
            "ProvisionedThroughput": {
               "ReadCapacityUnits": number,
               "WriteCapacityUnits": number
            }
         },
         "Delete": {
            "IndexName": "string"
         },
         "Update": {
            "IndexName": "string",
            "ProvisionedThroughput": {
               "ReadCapacityUnits": number,
               "WriteCapacityUnits": number
            }
         }
      }
   ],
   "ProvisionedThroughput": {
      "ReadCapacityUnits": number,
      "WriteCapacityUnits": number
   },
   "StreamSpecification": {
      "StreamEnabled": boolean,
      "StreamViewType": "string"
   },
   "TableName": "string"
}

```

#### Python Example

boto3

```
import boto3
db3 = boto3.resource('dynamodb', endpoint_url='http://localhost:8000',  region_name='us-west-2')


table = db3.meta.client.update_table(
    TableName='Music',
    AttributeDefinitions=[
        {
            'AttributeName': "Artist",
            'AttributeType': "S"
        },
        {
            'AttributeName': "SongTitle",
            'AttributeType': "S"
        }
    ],
    ProvisionedThroughput={       
        'ReadCapacityUnits': 10,
        'WriteCapacityUnits': 10
    }
)

db3.meta.client.describe_table(TableName='Music')

```

现在查看Music 表会发现预设的吞吐量都已经修改为了10

[DynamoDB UpdateTable 操作](http://docs.aws.amazon.com/zh_cn/amazondynamodb/latest/APIReference/API_UpdateTable.html)

> 下一篇我们将要结束DynamoDB 最常用的部分，**项目的基本操作（CRUD）**。

[原文链接](http://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751935&idx=3&sn=7dac29e441ebaabfbf70600fee042bd3&chksm=80b0b9d5b7c730c390dd96fc1c4853219fd8d39a634506081631b41e147faaee38f0e8d35730#rd)
