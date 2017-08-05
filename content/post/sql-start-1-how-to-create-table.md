---
categories:
- xxx
- xxxx
date: 2017-07-30T08:02:22+08:00
description: description
draft: true
slug: url-path
tags:
- xx
- xxxx
title: title
---

## 数据库基础

### 数据库

数据库是保存有组织的数据的容器（通常是一个文件或一组文件）。

一个 excel 文件。

**这里是一个 excel 文件图片**

![这里是一个 excel 文件图片](http://media.gusibi.mobi/WzFaDj_ugK7JLrtKzU-L9oTWY5qSXEHa0FszhV8gQicJWSZtHsXFss34r-TkRUJQ)

**这里是一个数据库图片**

![这里是一个数据库图片](http://media.gusibi.mobi/GtovdBEGv1VzGyeGImgE45jrJuakyx9-Bmkltwm5kNgKpKrgBB00sk_1yPC_IgnC)

> 通常人们用数据库代表他们使用的数据库软件。不过确切的说，数据库软件应称作数据库管理系统。

### 表

表是某种特定数据的结构化清单。

excel 中的 sheet。

数据库中每个表都有一个自己的名字来标识自己，这个名字是唯一的，即数据库中没有其他表具有相同的名字。（不同的数据库可以有不同的名字）

**这里是一个 sheet结构**

![这里是一个 sheet结构](http://media.gusibi.mobi/NCnjCS_QjOinK0X1e1p5uTvx7iYjTfFGZE_rn8CRk-m_mNZbrsqzq2kaUYqpTSCT)

**这里是一个表结构**

![这里是一个表结构](http://media.gusibi.mobi/AOjmnriLW8FxYAQqBUcZJSw-9NrzJ3rZPrqjfJf0MGBLQjTfhp1urWCRc9PRxIF5)

> 表具有一些特性，这些特性定义了数据在表中如何存储，包含存储什么样的数据，数据如何分解，各部分信息如何命名等信息。描述表的这组信息就是所谓的模式，模式可以用来描述数据库中特定的表，也可以描述整个数据库。

### 列和数据类型

表由列组成。列存储表中某部分的信息。

> 列是表中的一个字段。所有表都是由一个或多个列组成。

**这是表结构**

![这是表结构，指出哪些是列](http://media.gusibi.mobi/iUwFYgJyLqZoJ88D0AWfHHKS3aOtPrK7q_l98-PUyeMQ2DJrHAkUjOdrYhcagOe2)

每一列存储着某种特定的信息。例如在顾客表中，一列存储顾客编号，另一列存储顾客姓名，而地址、城市、州以及邮编全都存储在各自的列中。

数据库中每个列都有相应的数据类型。数据类型(datatype)定义了列可以存储哪些数据种类。例如，如果列中存储的是数字(或许是订单中的物品数)，则相应的数据类型应该为数值类型。如果列中存储的是日期、文本、注释、金额等，则应该规定好恰当的数据类型。

> 数据类型是每列所允许的类型。每个列都有相应的数据类型，它限制该列中存储的数据。
> 数据类型限定了可存储在列中的数据种类(例如，防止在数值字段中录入字符值)。数据类型还帮助正确地分类数据。因此，在创建表时必须特别关注所用的数据类型。

### 行

> 行是表中的一个记录。

表中的数据是按行存储的，所保存的每个记录存储在自己的行内。

### 主键

一列(或一组列)，其值能够唯一标识表中每一行。（用户表的用户 ID，问题表的问题 ID）

> 表可以不创建主键，正常情况下，我们都会给每个表创建一个主键，以便以后的数据操作和管理。

每个列都可以做主键，需要的条件：

* 任意两行都不具有相同的主键值;
* 每一行都必须具有一个主键值(主键列不允许NULL值); 
* 主键列中的值不允许修改或更新; 
* 主键值不能重用(如果某行从表中删除，它的主键不能赋给以后的新行)

## 操作表

### 创建表

创建表用到的命令是 `CREATE TABLE`，需要注意的点为：

1. 给表起一个独特（不能和其它表重名）的名字
2. 然后在括号内来定义每一列的列表，在表中是什么样的数据类型以及要加的限制（比如，不能重复，最长多少字符..)

```sql
CREATE TABLE account(
 user_id integer PRIMARY KEY, 
 username VARCHAR (50) UNIQUE NOT NULL,
 password VARCHAR (50) NOT NULL,
 created_on TIMESTAMP NOT NULL DEFAULT now(),
 last_login TIMESTAMP
);
```

表名： account
列名： user_id, username, password, created_on, last_login
PRIMARY KEY: 表明这是主键。
UNIQUE: 表明这个字段值不能重复。
NOT NULL: 表明该列不能为空。
DEFAULT: 用来指定默认值。

### 删除表

```sql
DROP TABLE account;
```

### 更新表

> 更新操作

## 插入数据

### 数据插入

语法格式：

```sql
INSERT INTO TABLE_NAME (column1, column2, column3,...columnN)  
VALUES (value1, value2, value3,...valueN);
```

> `column1`, `column2`, `column3`,...`columnN` 是要插入数据的表中的列的名称。

#### 插入完整的行

```sql
INSERT INTO account (user_id, username, password, created_on, last_login)  
VALUES (1, 'fenda', 'fenda123', now(), now());
```

> 重复执行会报错，因为 user_id 和 username 不能重复。

#### 插入部分行

可为空的，设置了默认值的字段可以不设定值。

```sql
INSERT INTO account (user_id, username, password)  
VALUES (2, 'zaihang', 'fenda123');
```

这里，created_on 和 last_login 并没有指定值。

## 检索数据

SQL语句是由简单的英语单词构成的。这些单词称为关键字，每个SQL语句都是由一个或多个关键字构成的。最经常使用的SQL语句大概就是SELECT语句了SELECT语句了。它的用途是从一个或多个表中检索信息。

> 为了使用SELECT检索表数据，必须至少给出两条信息——想选择什么，以及从什么地方选择

### 检索单个列

```sql
select user_id from account;
```

> 上述语句利用SELECT语句从 account 表中检索一个名为 user_id 的列。所需的列名写在SELECT关键字之后，FROM关键字指出从哪个表中检索。

这条SELECT语句将返回表中的所有行。数据没有过滤(过滤将得出结果集的一个子集)，也没有排序。

**注意**

* 多条SQL语句必须以分号(;)分隔。多数DBMS不需要在单条SQL语句后加分号，但Postgresql必须在单条SQL语句后加上分号。当然，如果愿意可以总是加上分号。事实上，即使不一定需要，加上分号也肯定没有坏处。
* `SQL语句不区分大小写`，因此SELECT与select是相同的。
* 在处理SQL语句时，其中所有空格都被忽略。SQL语句可以写成长长的一行，也可以分写在多行。下面这三种写法的作用是一样的。

```sql
-- 1
select user_id from account;

-- 2
select user_id
from account;

-- 3
select
user_id
from
account;
```

> SQL 使用 `双横线（--）` 注释

### 什么时候需要注释

* SQL语句变长，复杂性增加时，你就会想添加一些描述性的注释，这便于你自己今后参考，或者供项目后续参与人员参考；
* 在SQL文件开始处添加程序员的联系方式、程序描述以及一些说明的内容。
* 暂时停止要执行的SQL代码。如果你碰到一个长SQL语句，而只想测试它的一部分，那么应该注释掉一些代码， 以便数据库将其视为注释而加以忽略。

```sql
select user_id  -- 这是注释（可是试试把 -- 去掉看会发生什么）
from account;

/* SELECT user_id,  FROM account; */
SELECT username
FROM account;
```

### 检索多个列

```sql
select user_id, username from account;
```

### 检索所有列

```sql
select * from account;
```

### 限制结果

```sql
select * from account limit 1;

select * from account where user_id> 1 limit 1;
```

## 排序检索数据

`ORDER BY` 对产生的输出排序。

### 排序数据

```sql
select * from trade where operate_type='recharge' order by operate_fee; -- 按充值金额从小到大

select * from trade where operate_type='recharge' order by operate_fee desc; -- 按充值金额从大到小
```

### 按多个列排序

```sql
-- 按充值金额从小到大 金额相同的按充值时间从大到小
select * from trade where operate_type='recharge' order by operate_fee, date_created desc; 

-- 按充值金额从大到小 金额相同的按充值金额从小到大
select * from trade where operate_type='recharge' order by operate_fee desc, date_created; 
```

## 过滤数据

### 使用 where 子句

```sql
select * from trade where where operate_type='recharge' and operate_fee > 1000 limit 1;
```

### where 子句操作符

```sql
select * from trade where operate_fee = 1000;

select * from trade where operate_fee > 1000;

select * from trade where operate_fee >= 1000;

select * from trade where operate_fee < 1000;

select * from trade where operate_fee <= 1000;
```

### 组合 where 子句

```sql
select * from trade where operate_fee <= 1000 and date_created > '2017-04-05';

select * from trade where date_created < '2017-08-05' and date_created > '2017-04-05';

select * from trade where date_created > '2017-07-05' or date_created < '2017-04-05';
```

#### 求值顺序

```sql
-- 先组合 date_created < '2017-04-05' and operate_fee > 1000 
-- 再判断 date_created > '2017-07-05'
-- 意思是 查询创建时间大于 2017-07-05 和 创建于 2017-04-05 之前的
-- 金额大于1000的充值数据。
select * from trade 
    where date_created > '2017-07-05' 
    or date_created < '2017-04-05' 
    and operate_fee > 1000 
    and operate_type='recharge';

-- 查询 创建时间在 2017-04-05 之前 
-- 或者 2017-07-05之后的 充值金额大于1000的订单
select * from trade 
    where (date_created > '2017-07-05' 
        or date_created < '2017-04-05') 
    and operate_fee > 1000
    and operate_type='recharge';
```

### in 操作

**查询充值金额为1000 或者 600 的订单**

```sql
select * from trade where operate_fee in (600, 1000) and operate_type='recharge';

-- 等同于 

select * from trade where (operate_fee = 600 or operate_fee = 1000) and operate_type='recharge';
```

为什么要使用IN操作符?其优点为:

* 在有很多合法选项时，IN操作符的语法更清楚，更直观。 
* 在与其他AND和OR操作符组合使用IN时，求值顺序更容易管理。 
* IN操作符一般比一组OR操作符执行得更快(在上面这个合法选项很少的例子中，你看不出性能差异)。 
* IN的最大优点是可以包含其他SELECT语句，能够更动态地建立WHERE子句。

### not 操作符
WHERE子句中的NOT操作符有且只有一个功能，那就是否定其后所跟的任何条件。因为NOT从不单独使用(它总是与其他操作符一起使用)，
所以它的语法与其他操作符有所不同。NOT关键字可以用在要过滤的列前，而不仅是在其后。

> `NOT`
WHERE子句中用来否定其后条件的关键字。

```sql
select * from trade where not operate_fee in (600, 1000) and operate_type='recharge' LIMIT 10;

SELECT * FROM trade WHERE operate_fee NOT IN (600, 1000) AND operate_type='recharge' LIMIT 10;

SELECT * FROM trade WHERE NOT (operate_fee IN (600, 1000) AND operate_type='recharge') LIMIT 10;
```

## like 操作符

前面介绍的所有操作符都是针对已知值进行过滤的。不管是匹配一个值还是多个值，检验大于还是小于已知值，或者检查某个范围的值，其共
同点是过滤中使用的值都是已知的。

但是，这种过滤方法并不是任何时候都好用。例如，我们想找出 `account` 表中 username 以 `fenda` 开头的数据。

这时，就必须使用通配符了。

> `通配符(wildcard)` 用来匹配值的一部分的特殊字符。
> `搜索模式(search pattern)` 由字面值、通配符或两者组合构成的搜索条件。

SQL支持几种通配符。为在搜索子句中使用通配符，必须使用LIKE操作符。LIKE指示数据库，后跟的搜索模式利用通配符匹配而不是简单的相等匹配进行比较。

> `注意：`通配符搜索只能用于文本字段(串)，非文本数据类型字段不能使用通配符搜索。

### 百分号(%)通配符

最常使用的通配符是百分号(%)。在搜索串中，%表示任何字符出现任意次数。

```sql
select * from account where username like 'fenda%';
```

此例子使用了搜索模式'fenda%'。在执行这条子句时，将检索任意以 `fenda` 起头的词。`%``告诉数据库接受 `fenda` 之后的任意字符，不管它有多少字符。

> 搜索模式区分大小写。 `'Fenda%'` 和 `'fenda%'` 是不同的。

`%` 不仅可以放在最后，也可以放在其他位置，比如

```sql
select * from account where username like '%enda%';
```

### 下划线(_)通配符

下划线的用途与%一样，但它只匹配单个字符，而不是多个字符。

```sql
select * from account where username like 'fenda-_bc-9';
```

### 方括号([ ])通配符

方括号([])通配符用来指定一个字符集，它必须匹配指定位置(通配符的位置)的一个字符。

```sql
-- bc 前边的字符只能是 a 或 b
select * from account where username like 'fenda-[ab]bc-9';

-- bc 前边的字符不能是 a 或 b
select * from account where username like 'fenda-[^ab]bc-9';
```

### 通配符转义

```sql
-- abc 前只能是 下划线(_)
select * from account where username like 'fenda[_]abc-9';

-- 使用转义字符声明下划线是一个字符而不是通配符
select * from account where username like 'fenda\_abc-9';
```

### 使用通配符的技巧

通配符搜索一般比前面讨论的其他搜索要耗费更长的处理时间。这里给出一些使用通配符时要记住的技巧。

* 不要过度使用通配符。如果其他操作符能达到相同的目的，应该使用其他操作符。
* 在确实需要使用通配符时，也尽量不要把它们用在搜索模式的开始处。把通配符置于开始处，搜索起来是最慢的。
* 仔细注意通配符的位置。如果放错地方，可能不会返回想要的数据。


## 汇总数据

我们经常需要汇总数据而不用把它们实际检索出来，为此SQL提供了专门的函数。使用这些函数，SQL查询可用于检索数据，以便分析和报表生成。这种类型的检索例子有:

* 确定表中行数(或者满足某个条件或包含某个特定值的行数);
* 获得表中某些行的和;
* 找出表列(或所有行或某些特定的行)的最大值、最小值、平均值。

SQL 提供的常用的聚集函数：

函数 | 说明
-----|----
COUNT()| 返回某列的行数
AVG()| 返回某列的平均值
MAX()| 返回某列的最大值
MIN()| 返回某列的最小值
SUM()| 返回某列的和

### AVG() 函数

AVG()通过对表中行数计数并计算其列值之和，求得该列的平均值。AVG()可用来返回所有列的平均值，也可以用来返回特定列或行的平均值。 

下面的例子使用AVG()返回 trade 表中所有充值数据的均值:

```sql
-- 充值金额的均值
select avg(operate_fee) from trade 
    where operate_type='recharge';
```

> AVG()函数忽略列值为NULL的行。

### COUNT() 函数

COUNT()函数进行计数。可利用COUNT()确定表中行的数目或符合特定条件的行的数目。

COUNT()函数有两种使用方式: 
* 使用COUNT(*)对表中行的数目进行计数，不管表列中包含的是空值(NULL)还是非空值。
* 使用COUNT(column)对特定列中具有值的行进行计数，忽略NULL值。

比如：

```sql
select count(*) from account;  -- 用户数

select count(last_login) from account; -- 登录过的用户数
```

> 如果指定列名，则COUNT()函数会忽略指定列的值为空的行，但如果COUNT()函数中用的是星号(*)，则不忽略。

### MAX() 函数

MAX()返回指定列中的最大值。MAX()要求指定列名，如下所示:

```sql
-- 充值数据中的最高金额
select max(operate_fee) from trade where operate_type='recharge'; 

select operate_fee from trade 
    where operate_type='recharge' 
    order by operate_fee desc limit 1;
```

> MAX()函数忽略列值为NULL的行。

### MIN() 函数

MIN()的功能正好与MAX()功能相反，它返回指定列的最小值。与MAX()一样，MIN()要求指定列名，如下所示:

```sql
-- 充值数据中的最少金额
select min(operate_fee) from trade where operate_type='recharge'; 

select operate_fee from trade 
    where operate_type='recharge' 
    order by operate_fee limit 1;
```

> MIN()函数忽略列值为NULL的行。

### SUM() 函数

```sql
-- 最大的充值金额
SELECT max(operate_fee) FROM trade WHERE operate_type='recharge';

-- 以最大充值金额充值的条数
SELECT count(*) FROM trade 
    WHERE operate_type='recharge' 
    AND operate_fee = (SELECT max(operate_fee) FROM trade 
                       WHERE operate_type='recharge');

SELECT operate_fee * (SELECT count(*) FROM trade 
                          WHERE operate_type='recharge' 
                          AND operate_fee = (SELECT max(operate_fee) FROM trade 
                              WHERE operate_type='recharge')) AS 最大充值金额总和 FROM trade 
    WHERE operate_type='recharge' 
    AND operate_fee=(SELECT max(operate_fee) FROM trade 
                     WHERE operate_type='recharge');

SELECT sum(operate_fee) AS 最大充值金额总和 FROM trade 
    WHERE operate_type='recharge' 
    AND operate_fee = (SELECT max(operate_fee) FROM trade 
                       WHERE operate_type='recharge');
```

SUM()用来返回指定列值的和(总计)。比如:

```sql
-- 充值金额的总和
select sum(operate_fee) from trade where operate_type='recharge'; 

-- 充值金额的总和
select sum(operate_fee) from trade where operate_type='recharge';
```

### 组合聚集函数

SELECT语句可根据需要包含多个聚集函数。请看下面的例子:

```sql
SELECT count(*) AS 总充值条数,
    min(operate_fee) AS 最小充值金额,
    max(operate_fee) AS 最大充值金额,
    avg(operate_fee) AS fee_avg,
    sum(operate_fee) AS fee_sum
FROM trade WHERE operate_type='recharge';
```

#### 练习： 计算最大的充值金额，并统计最大金额的充值次数
```sql
SELECT count(*) FROM trade 
    WHERE operate_type='recharge' 
    AND operate_fee=(
        SELECT max(operate_fee) FROM trade 
            WHERE operate_type='recharge');
```
#### 练习：计算最大的充值金额，并统计以这个金额充值的总金额
```sql
SELECT sum(operate_fee) FROM trade 
    WHERE operate_type='recharge' 
    AND operate_fee = (
        SELECT max(operate_fee) FROM trade 
            WHERE operate_type='recharge');
```

这条 select 语句执行了5个聚合函数，返回5个值（总充值次数，最小值，最大值，平均值，总充值金额）。

> `取别名` 使用聚合函数时，建议使用别名指定计算后的结果。在指定别名时，不应该使用表中实际的列名。


## 分组数据

使用SQL聚集函数可以汇总数据。这样，我们就能够对行进行计数，计算和与平均数，不检索所有数据就获得最大值和最小
值。
目前为止的所有计算都是在表的所有数据或匹配特定的WHERE子句的数据上进行的。比如下面的例子返回供应商DLL01提供的产品数目:

```sql
SELECT COUNT(*) AS num_prods FROM Products
WHERE vend_id = 'DLL01';
```

如果要返回每个供应商提供的产品数目，该怎么办?或者返回只提供一项产品的供应商的产品，或者返回提供10个以上产品的供应商的产品，怎么办?
这就是分组大显身手的时候了。使用分组可以将数据分为多个逻辑组，对每个组进行聚集计算。

### 创建分组

分组是使用SELECT语句的`GROUP BY`子句建立的。理解分组的最好办法是看一个例子:

```sql
-- 查询每个用户充值的次数
select account_id, count(*) AS 充值次数 from trade 
    where operate_type='recharge' 
    group by account_id;
```

上面的`SELECT`语句指定了两个列: account_id 包含用户的ID，`充值次数`为计算字段(用COUNT(*)函数建立)。`GROUP BY`子句指示 数据库按 `account_id`排序并分组数据。这就会对每个`account_id`而不是整个表计算充值次数一次。
因为使用了`GROUP BY`，就不必指定要计算和估值的每个组了。系统会自动完成。`GROUP BY`子句指示数据库分组数据，然后对每个组而不是整个结果集进行聚集。

* GROUP BY子句必须出现在WHERE子句之后，ORDER BY子句之前。
* 除聚集计算语句外，SELECT语句中的每一列都必须在GROUP BY子句中给出。
* 如果分组列中包含具有NULL值的行，则NULL将作为一个分组返回。如果列中有多行NULL值，它们将分为一组。

### 过滤分组

除了能用GROUP BY分组数据外，SQL还允许过滤分组，规定包括哪些分组，排除哪些分组。例如，你可能想要列出至少充值两次的用户。为此，必须基于完整的分组而不是个别的行进行过滤。

SQL为此提供了另一个子句，就是`HAVING`子句。HAVING非常类似于WHERE。WHERE过滤行，而 `HAVING` 过滤分组。

```sql
-- 查询充值的次数大于10的用户
select account_id, count(*) AS 充值次数 from trade 
    where operate_type='recharge' 
    group by account_id
    having count(*) > 10;
```

> WHERE在数据分组前进行过滤，HAVING在数据分组后进行过滤。这是一个重要的区别，WHERE排除的行不包括在分组中。这可能会改变计算值，从而影响HAVING子句中基于这些值过滤掉的分组

### 分组和排序

使用 `GROUP BY` 分组的结果是无序的，我们可以使用 `ORDER BY` 对结果进行排序。

```sql
-- 查询充值的次数大于10的用户 按充值次数排序
SELECT account_id, count(*) AS 充值次数 FROM trade 
    WHERE operate_type='recharge' 
    GROUP BY account_id
    HAVING count(*) > 10
    ORDER BY count(*) desc;;
```

## 参考链接

------


最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
