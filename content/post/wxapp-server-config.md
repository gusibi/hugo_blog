---
categories:
- xxx
- xxxx
date: 2017-10-20T12:11:35+08:00
description: description
draft: true
slug: url-path
tags:
- xx
- xxxx
title: title
---

## 服务器配置

### 关闭ssh密码登录使用密钥登录

#### 安装openssh

因为是新系统，先执行一下apt-get update

```
sudo apt-get update
sudo apt-get install openssh-server
```

#### 启动ssh服务

可以通过sudo su命令来临时切换到root权限(不是所有的账号都可以切换到root权限,只有在/etc/sudoers文件中符合规则的用户能切换root身份)

```
sudo su
/etc/init.d/ssh start
```

#### 使用密钥登录

1. 服务器端生成密钥对：

```
cd 
mkdir .ssh
cd .ssh
ssh-keygen -b 2048 -t rsa
```

ssh-keygen的基本用法：

-b后面是指定加密后的字符串长度

-t后面是指定加密算法，常用的加密算法有rsa,dsa等

默认生成的文件如下：

id_rsa.pub 公钥文件

id_rsa 私钥文件

2. 新建 authorized_keys 文件

将本地机器的 id_rsa.pub 文件内容复制到 authorized_keys 文件

3. 测试使用公钥是否可以登录

```
ssh name@host  # name 是机器的用户名 host 是机器的地址
```

#### 关闭ssh密码登录

确认可以通过私钥进行登录后，关闭ssh密码登录。

```
sudo su
vim /etc/ssh/sshd_config
```

将 PasswordAuthentication yes修改成PasswordAuthentication no

重启系统

```
sudo su
reboot
```

## 搭建开发环境

### 安装 zsh
### 配置 vim

## 参考链接


------


最后，感谢女朋友支持。

欢迎关注(April_Louisa) | 请我喝芬达
------- | -------
![欢迎关注](http://media.gusibi.mobi/Hy8XHexmzppNKuekLuGxWy8LjdGrQAzZA3mH_e9xltoiYgTFWdvlpZwGWxZESrbK)| ![请我喝芬达](http://media.gusibi.mobi/CO9DwU6ZHnXHD5xuG3GqTsY_IYPl-JdpQrDaOo6tl6PiAGEBDeYFHO7sGQi_VVFc)
