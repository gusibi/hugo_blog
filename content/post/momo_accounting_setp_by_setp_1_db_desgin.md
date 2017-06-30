---
categories:
- xxx
- xxxx
date: 2017-06-26T22:14:10+08:00
description: description
draft: true
slug: url-path
tags:
- xx
- xxxx
title: title
---

## mongodb 

|SQL术语/概念	|MongoDB术语/概念	|解释/说明|
|------|------|------|
|database	|database	|数据库
|table	|collection	|数据库表/集合
|row	|document	|数据记录行/文档
|column	|field	|数据字段/域
|index	|index	|索引
|table |joins	 	|表连接,MongoDB不支持
|primary key	|primary key	|主键,MongoDB自动将_id字段设置为主键
## 安装mongo
```bash
brew install mongodb
mkdir /data/db
sudo mongod
sudo mongod --fork --logpath=/usr/local/var/log/mongodb/mongo.log
```

## 数据库
## 集合（collection）
## 创建文档（insert document）
## 修改
## 查询
## 删除
## python 使用 mongodb
## 表结构

```python
{
    'account': {  # 用户表
        '_id': '用户ID',
        'nickname': '用户昵称',
        'username': '用户名 用于登录',
        'avatar': '头像',
        'password': '密码',
        'created_time': '创建时间',
    },
    'bill': { # 账单表
        '_id': '账单ID',
        'uid': '用户ID',
        'money': '金额 精确到分',
        'tag_id': '标签ID',
        'remark': '备注',
        'created_time': '创建时间',
    },
    'tag': {  # 账单标签
        '_id': '标签ID',
        'name': '标签名',
        'icon': '标签图标',
        'uid': '创建者ID（默认是管理员）',
        'created_time': '创建时间',
    },
    'keyword': {  # 特殊关键字
        '_id': '关键字ID',
        'word': '关键字',
        'data': {
            'value': '返回值',
            'type': '返回值类型 url|pic|text',
            },
        'action': '关键字返回的动作',
        'created_time': '创建时间',
    }
}
```


-------
最后，感谢女朋友支持。

| >欢迎关注 | >请我喝芬达
|------- | -------
|![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
