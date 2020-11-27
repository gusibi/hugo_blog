---
title: 'Amazon DynamoDB 入门7：项目更新'
date: 2017-02-07 14:23:33
tags: [AWS,nosql,DynamoDB,python,database]
published: true
hideInList: false
feature: 
isTop: false
---

> 上一节介绍了DynamoDB 的查询，本来计划这一节介绍使用索引的查询，不过随机看到了更新操作，就先写更新操作吧

## update (修改表中的数据)

SQL 语言提供用于修改数据的 UPDATE 语句。DynamoDB 使用 UpdateItem 操作完成类似的任务。

### SQL

在 SQL 中，可使用 UPDATE 语句修改一个或多个行。SET 子句为一个或多个列指定新值，WHERE 子句确定修改的行。示例如下：

```sql
UPDATE Music
SET RecordLabel = 'Global Records'
WHERE Artist = 'No One You Know' AND SongTitle = 'Call Me Today';
```

HUGOMORE42

如果任何行均不匹配 WHERE 子句，则 UPDATE 语句不起作用。

### DynamoDB

在 DynamoDB 中，可使用 UpdateItem 操作修改单个项目。

API 语法如下：

```json
{
   "AttributeUpdates": {
      "string" : {
         "Action": "string",
         "Value": {
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
      }
   },
   "ConditionalOperator": "string",
   "ConditionExpression": "string",
   "Expected": {
      "string" : {
         "AttributeValueList": [
            {
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
         ],
         "ComparisonOperator": "string",
         "Exists": boolean,
         "Value": {
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
      }
   },
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
   "TableName": "string",
   "UpdateExpression": "string"
}
```

参数说明：

- Key: 主键，用于定位项目
- TableName：表名 （最小 3. 最大 255）
- Expected：
- AttributeUpdates： 遗留参数，已废弃
- ConditionalOperator： 遗留参数，已废弃
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
    - ALL_NEW - 按在进行更新之后的情况，返回整个项目。
    - UPDATED_OLD - 按在进行更新之前的情况，仅返回更新的值。
    - UPDATED_NEW - 按在进行更新之后的情况，仅返回更新的值。
- UpdateExpression：指定要修改的属性以及这些属性的新值，更新表达式还指定如何修改属性。下面是更新表达式的语法摘要：
```
update-expression ::=
SET set-action , ...
| REMOVE remove-action , ...  
| ADD add-action , ...
| DELETE delete-action , ...  
```
更新表达式由多个部分组成。每个部分以一个 SET、REMOVE、ADD 或 DELETE 关键字开头。您可在更新表达式中按任意顺序包含其中任意部分。但是，每个部分关键字只能出现一次。您可以同时修改多个属性。以下是更新表达式的一些示例：

* SET list[0] = :val1
* REMOVE #m.nestedField1, #m.nestedField2
* ADD aNumber :val2, anotherNumber :val3
* DELETE aSet :val4

以下示例显示了带有多个部分的单个更新表达式：

```json
SET list[0] = :val1 REMOVE #m.nestedField1, #m.nestedField2 ADD aNumber :val2, anotherNumber :val3 DELETE aSet :val4
```

我们可以在更新表达式中使用任意属性名称，*第一个字符是 a-z 或 A-Z*，*第二个字符（如果存在）是 a-z、A-Z 或 0-9*。
如果属性名称不满足此要求，则需要将表达式属性名称定义为占位符。更多信息参考（表达式属性名称）。

要在更新表达式中指定文本值，可以使用表达式属性值。更多信息参考（表达式属性值）。

------

##### SET

在更新表达式中使用 SET 操作可将一个或多个属性与值添加到项目。如果这些属性已存在，则更新。还可以使用 SET 来加或减数字类型的属性。对多个属性执行 SET 操作，使用逗号分隔。

set语法如下：
```
set-action ::=
    path = value

value ::=
    operand
    | operand '+' operand
    | operand '-' operand

operand ::=
    path | function
```

* path 元素是项目的文档路径。(比如项目中info 为字典 info 中 a 的路径为info['a'])
* operand 元素可以为项目的文档路径，或者为函数。

SET 操作支持以下函数：

* if_not_exists (path, operand) - 如果项目在指定 path 中不包含属性，则 if_not_exists 的求值结果为 operand；否则求值结果为 path。您可以使用此函数来避免覆盖项目中已存在的属性。
* list_append (operand, operand) - 此函数的求值结果为列表，新元素将添加到列表中。新元素必须包含在列表中，例如要向列表中添加 2，操作数将成为 [2]。您可以通过反转操作数的顺序，将新元素附加到列表的开头或结尾。

以下是在这些函数中使用 SET 操作的一些示例。

如果属性已存在，则以下示例不执行任何操作；否则它会将属性设置为默认值。
```
SET Price = if_not_exists(Price, 100)
```
以下示例将新元素添加到 FiveStar 评论列表。表达式属性名称 #pr 是 ProductReviews；属性值 :r 是只包含一个元素的列表。如果列表之前有两个元素 [0] 和 [1]，则新元素将为 [2]。
```
SET #pr.FiveStar = list_append(#pr.FiveStar, :r)
```
以下示例将另一个元素添加到 FiveStar 评论列表中，但此时元素将附加到列表开头的位置 [0] 处。列表中的所有其他元素将会移动一位。
```
SET #pr.FiveStar = list_append(:r, #pr.FiveStar)
```

##### REMOVE

在更新表达式中使用 REMOVE 操作可从项目中删除一个或多个元素。要执行多个 REMOVE 操作，请使用逗号分隔。

下面是更新表达式中的 REMOVE 的语法摘要。唯一的操作数是您要删除的属性的文档路径：

```
remove-action ::=
    path
```
以下是使用 REMOVE 操作的更新表达式示例。从项目中删除多个属性：

```
REMOVE Title, RelatedItems[2], Pictures.RearView
```
对列表元素使用 REMOVE

当删除现有列表元素时，剩余的元素将会移位。例如，考虑以下列表：
```
MyNumbers: { ["Zero","One","Two","Three","Four"] }
```
列表包含元素 [0]、[1]、[2]、[3] 和 [4]。现在，我们使用 REMOVE 操作删除两个元素：
```
REMOVE MyNumbers[1], MyNumbers[3]
```
剩余的元素会向右移位，生成带有元素 [0]、[1] 和 [2] 的列表，每个元素具有以下数据：
```
MyNumbers: { ["Zero","Two","Four"] }
```
> 如果您使用 REMOVE 来删除超出列表中最后一个元素位置的不存在项目，则将不执行任何操作：也就是不删除任何数据。例如，以下表达式对 MyNumbers 列表没有任何效果：

```
REMOVE MyNumbers[11]
```

##### ADD

*ADD 操作仅支持数字和集数据类型。一般而言，我们建议使用 SET 而不是 ADD。*

在更新表达式中使用 ADD 可执行以下任一操作：

* 如果属性尚不存在，则将新属性及其值添加到项目。
* 如果属性已存在，则 ADD 的行为取决于属性的数据类型：
* 如果属性是数字，并且添加的值也是数字，则该值将按数学运算与现有属性相加。（如果该值为负数，则从现有属性减去该值。）
* 如果属性是集，并且您添加的值也是集，则该值将附加到现有集中。
* 要执行多个 ADD 操作，请使用逗号分隔。

在以下语法摘要中：

* path 元素是属性的文档路径。属性必须为数字或集数据类型。
* value 元素是要与属性相加的值（对于数字数据类型），或者是要附加到属性中的集（对于集类型）。

```
add-action ::=
    path value
```

以下是使用 add 操作的一些更新表达式示例。

以下示例对数字进行加运算。表达式属性值 :n 是数字，此值将与 Price 相加。
```
ADD Price :n
```
以下示例将一个或多个值添加到 Color 集。表达式属性值 :c 是字符串集。
```
ADD Color :c
```

##### DELETE

*DELETE 操作只支持集数据类型。*

在更新表达式中使用 DELETE 操作可从集中删除元素。要执行多个 DELETE 操作，请使用逗号分隔。

在以下语法摘要中：

* path 元素是属性的文档路径。该属性必须是集数据类型。
* value 元素是集中要删除的元素。

```
delete-action ::=
    path value
```

以下示例使用 DELETE 操作从 Color 集中删除元素。表达式属性值 :c 是字符串集。

```
DELETE Color :c
```

#### UpdateItem 示例如下：

```json
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

* UpdateItem必须指定要修改的项目的 Key 属性和一个用于指定属性值的 UpdateExpression。
* UpdateItem 替换整个项目，而不是替换单个属性。
* UpdateItem 的行为与“upsert”操作的行为类似：如果项目位于表中，则更新项目，否则添加（插入）新项目。
* UpdateItem只能修改单个项目，如果要修改多个项目，则必须使用多个 UpdateItem 操作。
* UpdateItem 支持条件写入，在此情况下，操作仅在特定 ConditionExpression 的计算结果为 true 时成功完成。例如，除非歌曲的价格大于或等于 2.00，否则以下 UpdateItem 操作不会执行更新：

#### 条件写入

要执行条件更新，请使用更新表达式以及条件表达式来执行 UpdateItem 操作。要继续执行操作，条件表达式的求值结果必须为 true；否则操作将失败。

假设您要将某项目的价格提高一定金额，如 :amt，但前提是结果不得超过最高价。为此，您可以计算当前允许提价的最高价，然后从最高价中减去提高的金额 :amt。将结果定义为 :limit，然后使用以下条件表达式：

条件表达式：Price <= :limit)
更新表达式：SET Price = Price + :amt
现在假设您要为项目设置前视图图片，不过前提是该项目还没有任何图片，不希望覆盖任何现有元素。您可以使用以下表达式来执行操作：

更新表达式：SET Pictures.FrontView = :myUR
（假设 :myURL 是项目图片的位置，例如 http://example.com/picture.jpg。）
条件表达式：attribute_not_exists(Pictures.FrontView)

```python
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

* UpdateItem 还支持原子计数器或类型为 Number 的属性（可递增或递减）。原子计数器在很多方面都类似于 SQL 数据库中的顺序生成器、身份列或自递增字段。

以下是一个 UpdateItem 操作的示例，它初始化一个新属性 (Plays) 来跟踪歌曲的已播放次数：

```json
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

#### 总结一下

* UpdateItem 一次只能更新一个项目
* UpdateItem 更新更新整个项目而不是只修改特点的值
* UpdateItem 支持条件写入

> 这一节我们介绍了DynamoDB 项目的更新操作，下一节我们将介绍项目的删除操作（索引的查询又要延后了。。

[原文链接](http://mp.weixin.qq.com/s?__biz=MzAwNjI5MjAzNw==&mid=2655751962&idx=1&sn=9d3e387c3fa946305598bc269b40fd3e&chksm=80b0b830b7c73126364b48cb33915d9a51552327afb4cc73388984f5449f99871fd44465baa6#rd)


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)