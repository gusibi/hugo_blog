---
date: "2018-10-04T21:36:53+08:00"
draft: false
title: "SQLAlchemy in 空列表问题分析"
author: goodspeed
permalink: /post/sqlalchemy_in_empty_list
description: "SQLAlchemy in 空列表问题"
tags: ["后端", "python", "development"]
categories: ["后端", "python", "development"]
---

SQLAlchemy in 空列表问题

### 问题场景

有model `Account`，SQLAlchemy 查询语句如下：

```python
query = Account.query.filter(Account.id.in_(account_ids)).order_by(Account.date_created.desc())
```

这里 account_ids 如果为空，执行查询会有如下警告：

```bash
/usr/local/lib/python2.7/site-packages/sqlalchemy/sql/default_comparator.py:35: SAWarning: The IN-predicate on "account.id" was invoked with an empty sequence. This results in a contradiction, which nonetheless can be expensive to evaluate.  Consider alternative strategies for improved performance.
  return o[0](self, self.expr, op, *(other + o[1:]), **kwargs)
```

> 这里的意思是使用一个空的列表会花费较长的时间，需要优化以提高性能。

**为什么会有这个提示呢？一个空列表为什么会影响性能呢？**

首先打印 query 可得到如下 sql 语句：

```sql
SELECT *   // 字段使用 “*” 代替
FROM account
WHERE account.id != account.id ORDER BY account.date_created DESC
```

会发现生成的语句中过滤条件是 `WHERE account.id != account.id`，使用 `PostgreSQL Explain ANALYZE 命令`，

* EXPLAIN：显示PostgreSQL计划程序为提供的语句生成的执行计划。
* ANALYZE：收集有关数据库中表的内容的统计信息。

分析查询成本结果如下：

```bash
postgres=> EXPLAIN ANALYZE SELECT *
FROM account
WHERE account.id != account.id ORDER BY account.date_created DESC;
                                    QUERY PLAN
----------------------------------------------------------------------------------
 Sort  (cost=797159.14..808338.40 rows=4471702 width=29) (actual time=574.002..574.002 rows=0 loops=1)
   Sort Key: date_created DESC
   Sort Method: quicksort  Memory: 25kB
   ->  Seq Scan on account  (cost=0.00..89223.16 rows=4471702 width=29) (actual time=573.991..573.991 rows=0 loops=1)
         Filter: (id <> id)
         Rows Removed by Filter: 4494173
 Planning time: 0.162 ms
 Execution time: 574.052 ms
(8 rows)
```

先看Postgresql提供的语句生成的执行计划，通过结果可以看到，虽然返回值为空，但是查询成本却还是特别高，执行计划部分几乎所有的时间都耗费在排序上，但是和执行时间相比，查询计划的时间可以忽略不计。（结果是先遍历全表，查出所有数据，然后再使用 `Filter: (id <> id)` 把所有数据过滤。）

按照这个思路，有两种查询方案：

1. 如果 account_ids 为空，那么直接返回空列表不进行任何操作，查询语句变为：

```python
if account_ids:
    query = Account.query.filter(Account.id.in_(account_ids)).order_by(Account.date_created.desc())
```

2. 如果 account_ids 为空，那么过滤方式，查询语句变为：

```python
query = Account.query
if account_ids:
    query = query.filter(Account.id.in_(account_ids))
else:
    query = query.filter(False)
    
query = query.order_by(Account.date_created.desc())
```

如果 account_ids 为空，此时生成的 SQL 语句结果为：

```sql
SELECT *
FROM account
WHERE 0 = 1 ORDER BY account.date_created DESC
```

分析结果为：

```sql
postgres=> EXPLAIN ANALYZE SELECT *
FROM account
WHERE 0 = 1 ORDER BY account.date_created DESC;
                                            QUERY PLAN
---------------------------------------------------------------------------------------------------
 Sort  (cost=77987.74..77987.75 rows=1 width=29) (actual time=0.011..0.011 rows=0 loops=1)
   Sort Key: date_created DESC
   Sort Method: quicksort  Memory: 25kB
   ->  Result  (cost=0.00..77987.73 rows=1 width=29) (actual time=0.001..0.001 rows=0 loops=1)
         One-Time Filter: false
         ->  Seq Scan on account  (cost=0.00..77987.73 rows=1 width=29) (never executed)
 Planning time: 0.197 ms
 Execution time: 0.061 ms
(8 rows)
```

可以看到，查询计划和执行时间都有大幅提高。


#### 一个测试

> 如果只是去掉方案1排序，查看一下分析结果

使用 `PostgreSQL Explain ANALYZE 命令`分析查询成本结果如下：

```sh
postgres=> EXPLAIN ANALYZE SELECT *
FROM account
WHERE account.id != account.id;
                                 QUERY PLAN
----------------------------------------------------------------------------
 Seq Scan on account  (cost=0.00..89223.16 rows=4471702 width=29) (actual time=550.999..550.999 rows=0 loops=1)
   Filter: (id <> id)
   Rows Removed by Filter: 4494173
 Planning time: 0.134 ms
 Execution time: 551.041 ms
```

可以看到，时间和有排序时差别不大。

### 如何计算查询成本

执行一个分析，结果如下：

```sql
postgres=> explain select * from account where date_created ='2016-04-07 18:51:30.371495+08';
                                      QUERY PLAN
--------------------------------------------------------------------------------------
 Seq Scan on account  (cost=0.00..127716.33 rows=1 width=211)
   Filter: (date_created = '2016-04-07 18:51:30.371495+08'::timestamp with time zone)
(2 rows)
```
EXPLAIN引用的数据是：

 1. 0.00 预计的启动开销(在输出扫描开始之前消耗的时间，比如在一个排序节点里做排续的时间)。
 2. 127716.33 预计的总开销。
 3. 1 预计的该规划节点输出的行数。
 4. 211 预计的该规划节点的行平均宽度(单位：字节)。 

这里开销(cost)的计算单位是磁盘页面的存取数量，如1.0将表示一次顺序的磁盘页面读取。其中上层节点的开销将包括其所有子节点的开销。这里的输出行数(rows)并不是规划节点处理/扫描的行数，通常会更少一些。一般而言，顶层的行预计数量会更接近于查询实际返回的行数。
这里表示的就是在只有单 CPU 内核的情况下，评估成本是127716.33;

#### 计算成本，Postgresql 首先看表的字节数大小

这里 account 表的大小为：

```sql
postgres=> select pg_relation_size('account');

pg_relation_size
------------------
        737673216
(1 row)
```

#### 查看块的大小

Postgresql 会为每个要一次读取的快添加成本点，使用 `show block_size`查看块的大小：

```sql
postgres=> show block_size;

block_size
------------
 8192
(1 row)
```

#### 计算块的个数


可以看到每个块的大小为8kb，那么可以计算从表从读取的顺序块成本值为：

```
blocks = pg_relation_size/block_size = 90048
```

`90048` 是account 表所占用块的数量。


#### 查看每个块需要的成本

```sql
postgres=> show seq_page_cost;
 seq_page_cost
---------------
 1
(1 row)
```

这里的意思是 Postgresql 为每个块分配一个成本点，也就是说上面的查询需要从90048个成本点。

#### 处理每条数据 cpu 所需时间

* cpu_tuple_cost：处理每条记录的CPU开销（tuple：关系中的一行记录）
* cpu_operator_cost：操作符或函数带来的CPU开销。

```sql
postgres=> show cpu_operator_cost;
 cpu_operator_cost
-------------------
 0.0025
(1 row)

postgres=> show cpu_tuple_cost;
 cpu_tuple_cost
----------------
 0.01
(1 row)
```

#### 计算

cost 计算公式为：

> cost = 磁盘块个数 * 块成本（1） + 行数 * cpu_tuple_cost（系统参数值）+ 行数 * cpu_operator_cost

现在用所有值来计算explain 语句中得到的值：

```python
number_of_records = 3013466  # account 表 count

block_size = 8192  # block size in bytes

pg_relation_size=737673216

blocks = pg_relation_size/block_size = 90048

seq_page_cost = 1
cpu_tuple_cost = 0.01
cpu_operator_cost = 0.0025

cost = blocks * seq_page_cost + number_of_records * cpu_tuple_cost + number_of_records * cpu_operator_cost
```

#### 如何降低查询成本？

直接回答，使用索引。

```sql
postgres=> explain select * from account where id=20039;
                                       QUERY PLAN
----------------------------------------------------------------------------------------
 Index Scan using account_pkey on account  (cost=0.43..8.45 rows=1 width=211)
   Index Cond: (id = 20039)
(2 rows)
```

通过这个查询可以看到，在使用有索引的字段查询时，查询成本显著降低。

> 索引扫描的计算比顺序扫描的计算要复杂一些。它由两个阶段组成。
PostgreSQL会考虑random_page_cost和cpu_index_tuple_cost 变量，并返回一个基于索引树的高度的值。

### 参考链接

* [sqlalchemy-and-empty-in-clause](https://stackoverflow.com/questions/23523147/sqlalchemy-and-empty-in-clause)
* [PostgreSQL查询性能分析和优化](https://www.linuxidc.com/Linux/2017-07/145768.htm)
* [PostgreSQL学习手册(性能提升技巧)](http://www.cnblogs.com/stephen-liu74/archive/2011/12/25/2301064.html)
* [PostgreSQL 查询成本模型](https://mp.weixin.qq.com/s/iBbVfmrTCxINlrbBS9u1Qw)
* [PostgreSQL 查询计划时间的计算详解](https://blog.csdn.net/luojinbai/article/details/43085383)


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![](http://media.gusibi.mobi/ah0mqMXMtdJb9Yj03suu-NGEyVRxyEuOIT5bXSv7ip5aqtHkiRjTTl8SMRMv3Qp5)
