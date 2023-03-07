---
categories: ["development", "python", "微信小程序"]
date: 2017-08-27T12:17:13+08:00
description:  微信小程序上传图片到腾讯云
draft: false
slug: wxapp-dev-upload-image-to-tencentyun-cos
tags: ["python", "tutorial", "weixin", "小程序"]
title: 小程序开发：上传图片到腾讯云
---

> 这是小程序开发第二篇，主要介绍如何上传图片到腾讯云，之所以选择腾讯云，是因为腾讯云免费空间大😂

## 准备工作

上传图片主要是将图片上传到腾讯云对象存储（COS）。

要使用对象存储 API，需要先执行以下步骤：

1. 购买腾讯云对象存储（COS）服务
2. 在腾讯云 [对象存储控制台](https://console.qcloud.com/cos4/index) 里创建一个 Bucket
3. 在控制台 [个人 API 密钥](https://console.qcloud.com/capi) 页面里获取 AppID、SecretID、SecretKey 内容
4. 编写一个请求签名算法程序（或使用任何一种服务端 SDK）
5. 计算签名，调用 API 执行操作

所以我们要做的准备工作有：

* 进入[腾讯云官网](https://www.qcloud.com)，注册帐号
* 登录[云对象存储服务（COS）控制台](https://console.qcloud.com/cos4)，开通COS服务，创建资源需要上传的Bucket
* 在小程序官网上配置域名信息（否则无法在小程序中发起对该域名的请求）

![image](http://media.gusibi.mobi/dloLMnRv8lJosOZt_gv9apWHmFRKfBcUtw0bgXR-Q_uSnmuQK5uP822b6lrYqlxq)

这些配置过程这里就不做说明了，接下来主要介绍步骤4、5。

小程序上传图片到 cos 流程如下图：

![图片上传流程图](http://media.gusibi.mobi/LC4VsGph5WEJrKEGK7pbyaJGRpshIMx9H4qh804WDJNiInrIirAmNMvQPXMltb0a)

在这个过程中我们需要实现的是，鉴权服务器返回签名的步骤以及小程序的相关步骤。

## COS鉴权服务

使用对象存储服务 COS 时，可通过 RESTful API 对 COS 发起 HTTP 匿名请求或 HTTP 签名请求，对于签名请求，COS 服务器端将会进行对请求发起者的身份验证。

* 匿名请求：HTTP 请求不携带任何身份标识和鉴权信息，通过 RESTful API 进行 HTTP 请求操作。
* 签名请求：HTTP 请求时添加签名，COS服务器端收到消息后，进行身份验证，验证成功则可接受并执行请求，否则将会返回错误信息并丢弃此请求。
腾讯云COS对象存储，基于密钥 HMAC (Hash Message Authentication Code) 的自定义 HTTP 方案进行身份验证。

上传图片是一个签名请求，需要进行签名验证。之所以我们

### 签名流程

客户通过对 HTTP 请求进行签名，并将签名后的请求发送至腾讯云进行签名验证，具体流程如下图所示。

![签名流程](https://mc.qcloudimg.com/static/img/4a1eb29033caa977c648cb84d9398fdd/image.png)

我们使用 sdk 开发，这个流程大致了解下就行，签名的实现 sdk 已经包含，只需要调用方法即可。

通过签名流程我们可以知道，签名需要 SecretId 和 SecretKey，这两个信息不适合存放在客户端中，这也是我们单独部署一个鉴权服务器的主要原因。

### 签名生成 API

上一篇[小程序开发：python sanic 实现小程序登录注册]() 我们介绍过，服务端使用 [`sanic`](https://github.com/channelcat/sanic) 框架 + [`swagger_py_codegen`](https://github.com/guokr/swagger-py-codegen) 生成 rest-api。

添加签名生成 api 我们需要先在文档中添加 API 的相关描述。[文档代码：https://github.com/gusibi/Metis/blob/master/docs/v1.yml](https://github.com/gusibi/Metis/blob/master/docs/v1.yml)

```yml
    /qc_cos/config:
        get:
            summary: 腾讯云配置
            description: 腾讯云配置
            tags: [Config]
            operationId: get_qc_cos_config
            parameters:
                - $ref: '#/parameters/AccessToken'
                - $ref: '#/parameters/qcos_path_in_query'
            responses:
                200:
                    schema:
                        $ref: '#/definitions/QCOSConfig'
                default:
                    description: Unexpected error
                    schema:
                        $ref: '#/definitions/Error'
            security:
                - OAuth2: [open]
```

> 这个接口我们要求登录才能调用。
文档定义完成之后，调用 
```sh
swagger_py_codegen -s  docs/v1.yml . -p apis -tlp sanic
```
生成代码模板，API 代码实现如下：
```python
    from qcloud_cos.cos_auth import Auth
    
    async def get(self, request):
        auth = Auth(appid=Config.QCOS_APPID,
                    secret_id=Config.QCOS_SECRET_ID,
                    secret_key=Config.QCOS_SECRET_KEY)
        expired = time() + 3600 # 签名有效时间 3600 秒
        # 上传到 cos bucket 的目录
        dir_name = request.raw_args.get('cos_path', '/xrzeti')
        # 生成签名
        sign = auth.sign_more(Config.QCOS_BUCKET_NAME,
                              cos_path=dir_name,
                              expired=expired)
        return {"sign": sign}, 200
```

> 由于 腾讯云COSv4 的Python SDK 只支持 python2，而 sanic 需要 python3.5+ 所以，这里我 fork 出来一份添加了 python3 的支持。
[https://github.com/gusibi/cos-python-sdk-v4](https://github.com/gusibi/cos-python-sdk-v4)。使用 python3 环境的可以使用这个版本。

##  上传图片到 cos

### 选择图片

> `wx.chooseImage(OBJECT)`
从本地相册选择图片或使用相机拍照。

调用这个方法，小程序会把选择的图片放到临时路径（在小程序本次启动期间可以正常使用，如需持久保存，需在主动调用 wx.saveFile，在小程序下次启动时才能访问得到），我们只能将临时路径的文件上传。

核心代码如下：

```js
    uploadToCos: function () {
        var that = this;

        // 选择上传的图片
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 图片类型 original 原图，compressed 压缩图，默认二者都有
            success: function (res) {

                // 获取文件路径
                var file = res.tempFiles[0];
                console.log(file.size);

                // 获取文件名
                var fileName = file.path.match(/(wxfile:\/\/)(.+)/)
                fileName = fileName[2]

                // 获取到图片临时路径后，指定文件名 上传到cos
                upload(file.path, fileName, that);
            }
        })
    }
    
```
这里图片选择成功后，我们取原图上传到 cos。

### 上传图片

cos 上传图片的URL由 cos_region，appid，bucket_name和 cos_dir_name 拼接而成。
把以下字段配置成自己的cos相关信息，详情可看[API文档](https://www.qcloud.com/document/product/436/6066)
```js
cosUrl = "https://" + REGION + ".file.myqcloud.com/files/v2/" + APPID + "/" + BUCKET_NAME + DIR_NAME;
```

> `REGION`: cos上传的地区
> `APPID`: 账号的appid
> `BUCKET_NAME`: cos bucket的名字
> `DIR_NAME`: 上传的文件目录


```js
var config = require('../config.js');
// 先确定上传的 URL
var cosUrl = "https://" + config.cos_region + ".file.myqcloud.com/files/v2/" + config.cos_appid + "/" + config.cos_bucket_name + config.cos_dir_name;

//填写自己的鉴权服务器地址
var cosSignatureUrl = config.host + '/v1/qc_cos/config?cos_path=' + config.cos_dir_name;

/**
 * 上传方法
 * filePath: 上传的文件路径
 * fileName： 上传到cos后的文件名
 * that: 小程序所在当前页面的 object
 */
function upload(filePath, fileName, that) {
    var data;

    // 鉴权获取签名
    wx.request({
        url: cosSignatureUrl,
        header: {
            Authorization: 'JWT' + ' ' + that.data.jwt.access_token
        },
        success: function (cosRes) {
            // 获取签名
            var signature = cosRes.data.sign;

            // 头部带上签名，上传文件至COS
            var uploadTask = wx.uploadFile({
                url: cosUrl + '/' + fileName,
                filePath: filePath,
                header: {
                    'Authorization': signature
                },
                name: 'filecontent',
                formData: {
                    op: 'upload'
                },
                success: function (uploadRes) {
                    // 上传成功后的操作
                    var upload_res = JSON.parse(uploadRes.data)
                    var files = that.data.files;
                    files.push(upload_res.data.source_url);
                    that.setData({
                        upload_res: upload_res,
                        files: files,
                        test_image: upload_res.data.source_url
                    })
                },
                fail: function (e) {
                    console.log('e', e)
                }
            });
            // 上传进度条
            uploadTask.onProgressUpdate((res) => {
                that.setData({
                    upload_progress: res.progress
                })
                if (res.progress === 100){
                    that.setData({
                        upload_progress: 0
                    })
                }
            })
        }
    })
    return data
}
```
小程序提供了 `uploadTask.onProgressUpdate()` 来获取图片的上传进度，这里我将图片的上传进度显示了出来。

完整代码参考：[metis-wxapp: https://github.com/gusibi/Metis-wxapp](https://github.com/gusibi/Metis-wxapp/tree/master/dist)

## 参考链接

* [WeCOS-UGC-DEMO——微信小程序用户资源上传COS示例](https://github.com/tencentyun/wecos-ugc-upload-demo/blob/master/README.md)

------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)