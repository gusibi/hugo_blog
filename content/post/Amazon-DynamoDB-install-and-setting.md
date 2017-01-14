+++
date = "2017-01-07T22:57:39+08:00"
draft = false
title = "Amazon DynamoDB 入门1：配置（本地）及python示例"

tags = ["Nosql", "DynamoDB"]
categories = ["Development", "Nosql", "DynamoDB"]
slug = "AmazonDynamoDBInsetallAndSetting"

+++

### 本节主要介绍AmazonDynamoDB 安装配置及Python开发示例"

## 什么是 Amazon DynamoDB
Amazon DynamoDB 是一种完全托管的 NoSQL 数据库服务，提供快速而可预测的性能，能够实现无缝扩展。使用 DynamoDB，您可以免除操作和扩展分布式数据库的管理工作负担，因而无需担心硬件预置、设置和配置、复制、软件修补或集群扩展等问题。

使用 DynamoDB，您可以创建数据库表来存储和检索任意量级的数据，并提供任意级别的请求流量。您可以扩展或缩减您的表的吞吐容量，而不会导致停机或性能下降，还可以使用 AWS 管理控制台来监控资源使用情况和各种性能指标。

## Amazon DynamoDB 特点

DynamoDB 会自动将数据和流量分散到足够数量的服务器上，以满足吞吐量和存储需求，同时保持始终如一的高性能。所有数据均存储在固态硬盘 (SSD) 中，并会自动复制到 AWS 区域中的多个可用区中，从而提供内置的高可用性和数据持久性。

DynamoDB 是 NoSQL 数据库并且无架构，这意味着，与主键属性不同，无需在创建表时定义任何属性或数据类型。与此相对，关系数据库要求在创建表时定义每个列的名称和数据类型。

## Amazon DynamoDB 使用

### AWS 配置

1. 注册 Amazon Web Services 并创建访问密钥
2. 创建 AWS 凭证文件
3. 开启DynamoDB 服务

### 在计算机上运行 DynamoDB

除了 Amazon DynamoDB Web 服务之外，AWS 还提供可本地运行的可下载版本的 DynamoDB。
使用本地版本，在开发应用程序时无需 Internet 连接。

#### 方法1 直接在计算机上安装

> 需要安装java环境

1. 下载 DynamoDB
2. 解压，并将解压后的目录复制到某个位置
3. 打开命令提示符窗口，打开 DynamoDBLocal.jar 的目录，并输入以下命令：

```
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

现在就可以使用了

**命令行选项**

DynamoDB 接受以下命令参数：

* -cors value - 启用适用于 JavaScript 的 CORS 支持（跨源资源共享）。您必须提供特定域的逗号分隔“允许”列表。-cors 的默认设置是星号 (*)，这将允许公开访问。
* -dbPath value - DynamoDB 将用于写入其数据库文件的目录。如果不指定此选项，则文件将写入当前目录。请注意，不能同时指定 -dbPath 和 -inMemory。
* -delayTransientStatuses - 使 DynamoDB 为某些操作引入延迟。DynamoDB 几乎可以即时执行某些任务，例如，对表和索引执行创建/更新/删除操作；但是，实际 DynamoDB 服务需要更多时间才能完成这些任务。设置此参数有助于 DynamoDB 更逼真地模拟 Amazon DynamoDB Web 服务的行为。（目前，此参数仅为处于 CREATING 或 DELETING 状态的global secondary index引入延迟。）
* -help – 打印使用摘要和选项。
* -inMemory – DynamoDB 将在内存中运行，而不使用数据库文件。停止 DynamoDB 时，不会保存任何数据。请注意，不能同时指定 -dbPath 和 -inMemory。
* -optimizeDbBeforeStartup – 在计算机上启动 DynamoDB 之前优化底层数据库表。使用此参数时，必须还要指定 -dbPath。
* -port value - DynamoDB 将用于与应用程序通信的端口号。如果不指定此选项，则默认端口是 8000
* -sharedDb - DynamoDB 将使用单个数据库文件，而不是针对每个证书和区域使用不同的文件。如果指定 -sharedDb，那么所有 DynamoDB 客户端都将与同一组表交互，无论其区域和证书配置如何。

[详细配置可参考官方文档](http://docs.aws.amazon.com/zh_cn/amazondynamodb/latest/developerguide/DynamoDBLocal.html?shortFooter=true)

#### 方法2 使用docker安装

> 需要安装docker

方法一需要我们手动配置，操作也麻烦，如果喜欢docker，可以直接使用docker快速搭建本地环境

```
1. 下载镜像

docker pull ryanratcliff/dynamodb

2. 启动

docker run -d -p 8000:8000 ryanratcliff/dynamodb

```

[详细配置可参考](https://github.com/RyanRatcliff/docker_dynamodb)


### Python 使用 DynamoDB

我们可以使用适用于 Python (Boto 3) 的 AWS 开发工具包进行开发。

1. 安装boto3

```
pip install boto3
```

2. 使用 AWS CLI 配置秘钥

```
# 安装awscli
sudo pip install awscli
# 测试awscli 安装
aws help
# 输入命令
aws configure
# 配置 Access Key ID 和 Secret Access Key

AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: ENTER
# 要更新任何设置，只需再次运行 aws configure 并根据需要输入新值。
```

CLI 将使用 aws configure 指定的证书存储在您主目录中名为 .aws 的文件夹中名为 credentials 的本地文件中
可以使用 以下命令列出 .aws 文件夹内容：
Linux, OS X, or Unix
```
$ ls  ~/.aws
```
[具体配置参考官方文档](http://docs.aws.amazon.com/zh_cn/cli/latest/userguide/cli-chap-getting-started.html?shortFooter=true)


3. 使用以下代码测试 DynamoDB 是否可用
 
```
import boto3
db3 = boto3.resource('dynamodb', endpoint_url='http://localhost:8000', aws_secret_access_key='ticTacToeSampleApp', aws_access_key_id='ticTacToeSampleApp', region_name='us-west-2')

db3.meta.client.list_tables()

# output

{
	'ResponseMetadata': {
	    'HTTPHeaders': {
	    	'content-length': '32',
            'content-type': 'application/x-amz-json-1.0',
            'server': 'Jetty(8.1.12.v20130726)',
            'x-amz-crc32': '2024476575',
            'x-amzn-requestid': '5f0a974a-8900-470d-8b28-a4207247c65e'
	    },
        'HTTPStatusCode': 200,
        'RequestId': '5f0a974a-8900-470d-8b28-a4207247c65e',
        'RetryAttempts': 0
	},
    'TableNames': []
}

```

如果输出以上内容，则说明DynamoDB 正常。

