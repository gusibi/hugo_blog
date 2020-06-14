---
categories: ["微信小程序", "后端"]
date: 2017-10-21T22:11:35+08:00
description: 使用腾讯云配置小程序服务端开发环境
draft:  false
permalink: /post/wxapp-server-config
tags: ["development", "小程序", "后端","tutorial"]
title: 使用腾讯云配置小程序Python开发环境
---

最近做小程序服务器的配置，这一篇是服务器配置的记录，方便以后安装配置。

## 购买服务器

之所以选腾讯云的原因很简单，那就是便宜，`选用成都区`，最低配置每月只需29￥。
在 [腾讯云](https://cloud.tencent.com) 官网注册登录就可以直接购买服务器了。
服务器系统我选择的是 ubuntu。

## 服务器配置

启动服务后使用新用户（此步骤不是必须）。

### 新建用户

首先确认使用的是 root 用户登录如果不是使用以下命令切换

```bash
sudo su
```
使用 `adduser` 命令创建用户
```bash
adduser username # username替换为你自己的用户名
```

接下来的步骤会让你输入密码和个人信息，自己设置就好。

使用`usermod` 命令将新建的用户添加到 `sudo` 组。

```go
usermod -aG sudo username
```

### 关闭ssh密码登录使用密钥登录

#### 安装openssh

因为是新系统，先执行一下 apt-get update

```bash
sudo apt-get update
sudo apt-get install openssh-server
```

#### 启动ssh服务

可以通过sudo su命令来临时切换到root权限(不是所有的账号都可以切换到root权限,只有在/etc/sudoers文件中符合规则的用户能切换root身份)

```bash
sudo su
/etc/init.d/ssh start
```

#### 使用密钥登录

* 服务器端生成密钥对：

```bash
cd /home/gs # 打开新建的用户目录
mkdir .ssh
cd .ssh
ssh-keygen -b 2048 -t rsa
```

> ssh-keygen的基本用法：
-b后面是指定加密后的字符串长度
-t后面是指定加密算法，常用的加密算法有rsa,dsa等

默认生成的文件如下：

``` bash
id_rsa.pub  # 公钥文件
id_rsa      # 私钥文件
```

* 新建 authorized_keys 文件

将本地机器的 id_rsa.pub 文件内容复制到 authorized_keys 文件

* 测试使用公钥是否可以登录

```bash
ssh name@host  # name 是机器的用户名 host 是机器的地址
```

#### 关闭ssh密码登录

确认可以通过私钥进行登录后，关闭ssh密码登录。

```bash
sudo su
vim /etc/ssh/sshd_config
```

将 PasswordAuthentication yes修改成PasswordAuthentication no

重启系统

```bash
sudo su
reboot
```

## 搭建开发环境

### 安装 zsh

在终端中输入下面命令进行安装：

```bash
sudo apt-get install zsh
```

输入下面命令进行替换zsh替换为你的默认shell：

```bash
chsh -s /bin/zsh
```

重启终端使用 zsh

### 安装oh-my-zsh

* 通过curl安装

```bash
curl -L https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh | sh
```

* 通过wget安装

```bash
wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O - | sh
```

### 安装 pip

```bash
sudo apt-get install python-pip  # 安装 pip
pip install --upgrade pip
sudo apt-get install python3-pip  # 安装 pip3
pip3 install --upgrade pip
```

### 安装 virtualenv

因为我使用 python3 作为开发环境，所以这里使用 `pip3`
```bash
sudo pip3 install virtualenv
sudo pip3 install virtualenvwrapper
```

在 .zshrc 添加以下内容
```bash
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
export WORKON_HOME=$HOME/.virtualenvs
source /usr/local/bin/virtualenvwrapper.sh
```
然后执行命令：

```bash
source .zshrc
```

现在可以输入 `workon` 测试 virtualenvwrapper 是否已经安装成功。

#### 创建虚拟环境

```bash
mkvirtualenv py3 -p python3  # -p 参数指定 python 版本
```

测试虚拟环境

```bash
workon py3
```

### 安装 ipython

首先进入 py3 虚拟环境

```bash
workon py3
```
使用 pip 安装 ipython

```bash
pip install ipython # 安装 ipython 
```
### 配置 vim

 python vim 配置使用的是 [py-vim](https://github.com/gusibi/py-vim)

需要先安装 ctags和 cmake

```bash
sudo apt-get install ctags
sudo apt-get install cmake
```

然后将 py-vim clone 到服务器

```bash
git clone https://github.com/gusibi/py-vim
cd py-vim
sh setup.sh 
```

## 使用 Caddy 配置 https

> Caddy是一种新的Web服务器，由 go 编写，默认使用 https 协议。caddy 配置简单，容易上手。

### 安装 caddy 二进制文件

Caddy项目提供了一个安装脚本，可以检索和安装Caddy服务器的二进制文件。 可以执行以下命令直接安装：

```bash
curl -s https://getcaddy.com | bash
```

在安装过程中，脚本将使用sudo获取管理权限，以便将Caddy文件放在系统范围的目录中，因此可能会提示您输入密码。

### 配置 caddy 必要的目录

Caddy的自动TLS支持和unit文件需要特定的目录和文件权限。 我们将在这一步中创建它们。

首先，创建一个目录，该目录将容纳主要的配置文件Caddyfile 。

```bash
# 创建一个目录，该目录将容纳主要的配置文件Caddyfile
sudo mkdir /etc/caddy
# 将此目录的所有者更改为root用户及其组到www-data ，以便Caddy可以读取它
sudo chown -R root:www-data /etc/caddy
# 创建一个空的Caddyfile
sudo touch /etc/caddy/Caddyfile
# 在/etc/ssl创建另一个目录用来存储自动获得的SSL私钥和证书
sudo mkdir /etc/ssl/caddy
# 将此目录的所有者更改为root用户及其组到www-data
sudo chown -R www-data:root /etc/ssl/caddy
# 确保没有人可以通过删除其他人的所有访问权限来读取这些文件。
sudo chmod 0770 /etc/ssl/caddy
# 创建的最终目录是网站的发布目录
sudo mkdir /var/www
# 该目录应由www-data完全拥有。
sudo chown www-data:www-data /var/www
# 创建日志目录
sudo mkdir /var/log/caddy
# 将此目录的所有者更改为root用户及其组到www-data
sudo chown -R www-data:root /var/log/caddy
```

### 将 caddy 配置为系统服务

从官方的Caddy存储库下载文件。 curl命令的附加-o参数会将该文件保存在/etc/systemd/system/目录中，并使其对systemd可见。

```bash
sudo curl -s https://raw.githubusercontent.com/mholt/caddy/master/dist/init/linux-systemd/caddy.service -o /etc/systemd/system/caddy.service
```

reload 系统服务

```bash
sudo systemctl daemon-reload
```
将caddy 设置为开机启动
```bash
sudo systemctl enable caddy.service
```
检查 caddy 服务是否已正式加载
```bash
sudo systemctl status caddy.service
```

### 允许HTTP和HTTPS连接

Caddy使用HTTP和HTTPS协议提供网站，因此我们需要允许访问相应的端口，以便使网路可以从网路获取

```bash
sudo ufw allow http
sudo ufw allow https
```

现在修改caddy 配置 /etc/caddy/Caddyfile

```bash
https://your.domain {  # 启用 https
    gzip
    log /var/log/caddy/access.log  # 指定日志目录
    proxy / http://127.0.0.1:8888 {
        header_upstream Host {host}
        header_upstream X-Real-IP {remote}
        header_upstream X-Forwarded-For {remote}
        header_upstream X-Forwarded-Proto {scheme}
    }
}
```

保存文件，启动 caddy

```bash
sudo systemctl start caddy    # 启动 caddy
sudo systemctl restart caddy  # 重启 caddy
sudo systemctl stop caddy     # 关闭 caddy
```

现在启动服务，访问 `https://your.domain` 应该就能看到数据。
日志文件在 `/var/log/caddy/` 目录下。

## 总结

小程序开发需要 https，这里我们使用了 caddy 作为 web 服务器。服务器配置好后可以直接存储为镜像，以后可以直接从镜像开启服务，就不再需要配置环境。

## 参考链接

* [How To Create a Sudo User on Ubuntu ](https://www.digitalocean.com/community/tutorials/how-to-create-a-sudo-user-on-ubuntu-quickstart)
* [zsh安装和配置](http://blog.csdn.net/ii1245712564/article/details/45843657)
* [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/)
* [py-vim](https://github.com/gusibi/py-vim)
* [Install MongoDB Community Edition on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
* [使用 Caddy 替代 Nginx，全站升级 https，配置更加简单](https://zhuanlan.zhihu.com/p/26839519)
* [how-to-host-a-website-with-caddy-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-host-a-website-with-caddy-on-ubuntu-16-04)
------

**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)