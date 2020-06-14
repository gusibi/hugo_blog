---
categories: ["development", "nosql"]
date: 2017-05-18T14:22:49+08:00
draft: false
author: goodspeed
permalink: /post/Elasticsearch-install-and-setting
tags: ["工具","tutorial"]
title: "Elasticsearch 安装和使用"
---

安装使用 Elasticsearch 两种方法：

### 方法1 手动安装 Elasticsearch

##### 安装到ubuntu

Elasticsearch与Logstash需要Java作为运行环境

## 安装Java 8

将甲骨文Java PPA添加至apt：

```shell
sudo add-apt-repository -y ppa:webupd8team/java
```

更新apt软件包数据库：

```shell
sudo apt-get update
```

HUGOMORE42

安装甲骨文Java 8的最新稳定版本，命令如下（在弹出的许可协议中点击接受）：

```shell
sudo apt-get -y install oracle-java8-installer
```

## 安装Elasticsearch

### 方法1 通过添加Elastic的软件包源列表利用软件包管理器安装Elasticsearch。

运行以下命令以将Elasticsearch公共GPG密钥导入apt：

```shell
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
```
接下来，创建Elasticsearch源列表：

```shell
echo "deb http://packages.elastic.co/elasticsearch/${ELASTICSEARCH_VERSION}/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elk.list
```

更新apt软件包数据库：

```shell
sudo apt-get update
```
安装Elasticsearch

```shell
sudo apt-get -y install elasticsearch
```

Elasticsearch已经安装完成。下面编辑其配置文件：

```shell
sudo vi /etc/elasticsearch/elasticsearch.yml
```

限制来自外部的Elasticsearch实例访问活动（端口9200），找到指定network.host的一行，取消其注释并将其值替换为“localhost”：

```shell
elasticsearch.yml excerpt (updated)

network.host: localhost
```
启动elasticsearch

```shell
sudo service elasticsearch restart
```

也可以使用 脚本 安装

```shell
#!/bin/bash

### USAGE
###
### ./ElasticSearch.sh 1.7 will install Elasticsearch 1.7
### ./ElasticSearch.sh will fail because no version was specified (exit code 1)
###
### CLI options Contributed by @janpieper
### Check http://www.elasticsearch.org/download/ for latest version of ElasticSearch

### ElasticSearch version
if [ -z "$1" ]; then
  echo ""
  echo "  Please specify the Elasticsearch version you want to install!"
  echo ""
  echo "    $ $0 1.7"
  echo ""
  exit 1
fi

ELASTICSEARCH_VERSION=$1

if [[ ! "${ELASTICSEARCH_VERSION}" =~ ^[0-9]+\.[0-9]+ ]]; then
  echo ""
  echo "  The specified Elasticsearch version isn't valid!"
  echo ""
  echo "    $ $0 1.7"
  echo ""
  exit 2
fi

### Install Java 8
cd ~
sudo apt-get install python-software-properties -y
sleep 1
sudo add-apt-repository ppa:webupd8team/java -y
sleep 1
sudo apt-get update
sleep 1
sudo apt-get install oracle-java8-installer -y

### Download and install the Public Signing Key
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

### Setup Repository
echo "deb http://packages.elastic.co/elasticsearch/${ELASTICSEARCH_VERSION}/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elk.list

### Install Elasticsearch
sudo apt-get update && sudo apt-get install elasticsearch -y

### Start ElasticSearch
sudo service elasticsearch start

### Lets wait a little while ElasticSearch starts
sleep 5

### Make sure service is running
curl http://localhost:9200

### Should return something like this:
# {
#  "status" : 200,
#  "name" : "Storm",
#  "version" : {
#    "number" : "1.3.1",
#    "build_hash" : "2de6dc5268c32fb49b205233c138d93aaf772015",
#    "build_timestamp" : "2014-07-28T14:45:15Z",
#    "build_snapshot" : false,
#    "lucene_version" : "4.9"
#  },
#  "tagline" : "You Know, for Search"
# }

```

##### 安装到 Mac

1. 到 https://www.elastic.co/downloads/elasticsearch 下载elasticsearch
2. 解压 cd 到目录 执行

```shell
sudo bin/elasticsearch
```

### 方法2 使用 docker

1. 下载 elasticsearch 镜像

```shell
docker pull elasticsearch
```
2. 新建 docker-compose.yml 文件

```yml
es:
   image: elasticsearch
   volumes:
     - /data:/usr/share/elasticsearch/data/
   ports:
     - "9200:9200"
   mem_limit: 2g
   environment:
    ES_JAVA_OPTS: "-Xmx1g -Xms1g"
```

运行命令

```shell
docker-compose -f es-docker-compose.yml up -d
```

启动 elasticsearch

### 测试安装

浏览器中访问http://localhost:9200/，看到一个json结果集，表明安装成功：

```json
{
  "name" : "g1WVNJ8",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "RjwyeM4kRRajDZzE3Tcq8g",
  "version" : {
    "number" : "5.4.0",
    "build_hash" : "780f8c4",
    "build_date" : "2017-04-28T17:43:27.229Z",
    "build_snapshot" : false,
    "lucene_version" : "6.5.0"
  },
  "tagline" : "You Know, for Search"
}

```

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)