---
categories:
- python
- development
date: 2018-07-23T23:45:46+08:00
description: 使用github+travis将Python包部署到Pypi
draft: false
slug: howto-deploy-python-package-on-pypi-with-github-and-travis.
tags:
- python
- 后端
- tutorial
title: 使用github+travis将Python包部署到Pypi
---

我在 github 托管 Python 代码，然后将包发布到 Pypi，通常的操作步骤是，更新完代码将提交到 github ，然后手动将包更新到 pypi，这样比较繁琐，就想到了使用github+travis-ci 构建一个自动部署环境。


### 注册 pypi

访问[https://pypi.org](https://pypi.org) 点击`Register`注册账号，记住自己的用户名密码。

### 创建 setup.py 文件

setup.py 文件放置于包的根目录，示例内容如下：

```python
#!/usr/bin/env python
from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    long_description = fh.read()

with open('requirements.txt') as f:
    requirements = [l for l in f.read().splitlines() if l]

setup(name="python-weixin",  # 项目名
      version="0.3.2",       # 版本号
      description="Python Weixin API client support wechat-app",  #简介
      long_description=long_description,  # 长简介 这里使用的 readme 内容
      long_description_content_type="text/markdown",
      license="BSD",   # 授权
      install_requires=requirements, # 依赖
      author="gusibi",  # 作者
      author_email="xxx@gmail.com",  # 邮箱
      url="https://github.com/gusibi/python-weixin",  # 地址
      download_url="https://github.com/gusibi/python-weixin/archive/master.zip",
      packages=find_packages(),
      keywords=["python-weixin", "weixin", "wechat", "sdk", "weapp", "wxapp"],
      zip_safe=True)
```



以上特别需要注意的是 `packages`参数，用来申明你的包里面要包含的目录，这里使用setuptools自动决定要包含哪些包。



### 配置 travis-ci



github 提供了多种集成方式，这里我们选择 Travis-ci

![](http://media.gusibi.mobi/WFUXxGYuC2Vsf5A-5ogKxthVs6xR3UU69UvYt4rFTsTn6ngDLEj62Qe05tZfKhpl)



选择后访问 [https://travis-ci.com/profile](https://travis-ci.com/profile)，如果是第一次使用 travis-ci 可以使用 github 账号登录，然后选择对应的 github 库激活。


![](http://media.gusibi.mobi/bRInfNXvDr4_nkBX5hbmRdCMpTLicG2wrXgsWeBEylhKNe1SKiK8KQYeBNP5SwyT)



然后在 github 代码库的根目录添加 `.travis.yml` 文件。



```yml
language: python
python:   # 指定运行环境，这里会分别在 2.7 和 3.5 运行
  - '2.7'
  - '3.5' 
install:
  - pip install -r requirements.txt   # 安装依赖
script: python test_example.py  # 如果有单元测试这里应该执行单元测试
```



> script 是一个必须的命令，通常如果有单元测试的话这里应该执行单元测试

#### 添加 Pypi 部署配置

通过在 `.travis.yml` 中添加 deploy 模块， `Travis CI` 实现自动部署，



```yml
language: python
python:
- '2.7'
- '3.5'
install:
- pip install -r requirements.txt
script: python test_example.py
deploy:
  provider: pypi
  user: goodspeed     # pypi 用户名
  password: password  # pypi 密码
  on:
    python: 2.7
    tags: true
    branch: master
```



在 `deploy` 部分，我们指定 `provider` 为 pypi，然后添加 `user`、`password`。

在 `on` 部分我们声明一些特殊的配置，比如：

* `brance: master` 意思是只有 master 分支才执行打包部署
* `python: 2.7` 意思是只在 python 2.7 版本执行打包部署
* `tags: true` 意思是只有在发布一个新的版本时才执行打包部署

具体配置参考： [Conditional-Releases-with-on](https://docs.travis-ci.com/user/deployment#Conditional-Releases-with-on)



#### 加密密码

上面的配置使用的是明文密码，这样就把pypi 账号公开了，太不安全。这里推荐使用 `travis-encrypt` 加密密码。



##### 安装 travis-encrypt



```bash
pip install travis-encrypt
```

然后在 `.travis.yml` 所在目录执行：



```bash
travis-encrypt --deploy gusibi python-weixin .travis.yml
Password: # 在这里输入pypi 密码
```


>这里 `gusibi` `python-weixin` 需要替换成相对应的 github username 和 repository。
>
>命令参考：[travis-encrypt](https://pypi.org/project/travis-encrypt/)



执行完之后password 部分旧会被加密后的秘钥代替，最终 `.travis.yml` 内容如下：



```yml
language: python
python:
- '2.7'
- '3.5'
install:
- pip install -r requirements.txt
script: python test_example.py
deploy:
  provider: pypi
  user: goodspeed
  password:
    secure: cjQdXGKkNpwKmGgEhONtd2YR+PF44gtZgMegv5O3CRsszocaRqxcBdfwi0qz6KupLMWl/WTq+bYtzf42lpytMe7cB/CPA2sCUDEo6qyIE+Brb5J57GUhd9HIhP5F44BHKWzBnYFbgPsQ2k1ckEDJsUp5yyFvUBkQmv3+LOo9Kf492oCQlgnzaGSRtPQaG56XdLKgCZrxdtfteTalTbjQO7w/GNm5lBn4l7iY1qWiQmzFxkUuZu317yAnohdH84fq9Ozov4S3nPNSTt800HjHkXwaBzxMuJ2SJBadZAW/abCvk34IPyvxjy7upNNLq80/yvgYKzxWBklcP9LxJX2Pwk9NtTY1zUEykkwdBVxZShhBXtWDma/yWQp2RdCVZtLS4GTg4X61PMgH0iwzwzGW8LARj2ZMowQoPipUYCJ7qUfyXrxU05ypizWKIIfrqdRh8Twj9Jhyg/fAoRygCoXNtMqwSmomjkwl6f1i+6lAQENdmVKQTesP56r/olXKb4rhrOgyhj7anJd3F/SZ+g8jQFHHGLcaSkEoVXL6BFPDMxYdMRmx5HKonP9uQO74ZdeevkHK0wFzSbjqpKdVzeuYuyPiHnDyooyjGL+2BzE/Zzo5KCNEflAE22kAuAbjXCuJji7+j47QohrlYjmj2+F7NDBE5sJRp3yLJWIEPqLND/k=
  on:
    python: 2.7
    tags: true
    branch: master
```





将代码提交之后，访问 travis-ci.org 会看到已经触发了 ci ，正在构建：



![](http://media.gusibi.mobi/6yydw0RZ2b26fRKzQXlV-QoRLHaOxrj04pVlFhJTULsF7OPE2Z4msVKV1fGUWkXB)



> 这里有两个 job 正在同时构建，分别是 python2.7 环境和 python3.5 环境。

但是这时并没有把包部署到 pypi，还需要在 `github releases 页面重新发布一个版本来触发部署`。



## 参考链接

* [https://github.com/romgar/5minutes/blob/master/content/articles/howto-deploy-python-package-on-pypi-with-github-and-travis.md][https://github.com/romgar/5minutes/blob/master/content/articles/howto-deploy-python-package-on-pypi-with-github-and-travis.md]
* [https://pypi.org](https://pypi.org) 
* [https://github.com/gusibi/python-weixinn](https://github.com/gusibi/python-weixin)
* [https://pypi.org/project/travis-encrypt/](https://pypi.org/project/travis-encrypt/)
* [https://docs.travis-ci.com/user/deployment#Conditional-Releases-with-on](https://docs.travis-ci.com/user/deployment#Conditional-Releases-with-on)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)