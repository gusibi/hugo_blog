---
date: 2020-06-06T17:07:20+08:00
lastmod: 2020-06-06T17:07:20+08:00
draft: false
title: "Flutter 安装配置"
slug: flutter-install-and-setting
description: "Flutter 安装配置 flutter install and setting"
tags: ["Flutter", "前端", "教程"]
categories: ["Flutter", "tutorial"]

# 用户自定义
# 你可以选择 关闭(false) 或者 打开(true) 以下选项
comment: false   # 关闭评论
toc: false       # 关闭文章目录
# 你同样可以自定义文章的版权规则
contentCopyright: '<a rel="license noopener" href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">CC BY-NC-ND 4.0</a>'
reward: true	 # 关闭打赏
mathjax: false    # 打开 mathjax
---

## 安装

1. 下载SDK：

1. 1. Windows SDK：[Stable 1.17.3](https://storage.flutter-io.cn/flutter_infra/releases/stable/windows/flutter_windows_1.17.3-stable.zip)
   2. macOS SDK：[Stable 1.17.3](https://storage.flutter-io.cn/flutter_infra/releases/stable/macos/flutter_macos_1.17.3-stable.zip)
   3. Linux SDK：[Stable 1.17.3](https://storage.flutter-io.cn/flutter_infra/releases/stable/linux/flutter_linux_1.17.3-stable.tar.xz)
   4. 其它版本列表：[SDK 版本列表](https://flutter.cn/docs/development/tools/sdk/archive)[2]



1. 将文件解压到目标路径, 比如:

```
cd ~/flutter
unzip ~/Downloads/flutter_macos_1.17.3-stable.zip
```



也可以从Github上获取源代码：

```
git clone https://github.com/flutter/flutter.git
```



1. 配置 `flutter` 的 PATH 环境变量：

```
export PATH="$PATH:~/flutter/flutter/bin"
```



**`~/flutter/flutter/bin 需要替换成你设置的目录。`**



如果bash 使用的是 zsh，需要把这行代码写入到 `~/.zsh_rc` 文件，如果是bash，则需要写入 `~/.bash_profile` ，文件更新后需要执行 

```
source ~/.zsh_rc
```





1. `flutter` 命令行工具会下载不同平台的开发二进制文件，如果需要一个封闭式的构建环境，或在网络可用性不稳定的情况下使用等情况，你可能需要通过下面这个命令预先下载 iOS 和 Android 的开发二进制文件：



```
flutter precache
```



1. flutter doctor 命令



运行flutter doctor命令可以查看当前环境是否需要安装其他的依赖，输出结果如下：



```
➜  ~ flutter doctor

Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, v1.17.1, on Mac OS X 10.15.5 19F96, locale zh-Hans-CN)

[✓] Android toolchain - develop for Android devices (Android SDK version 29.0.3)
[✓] Xcode - develop for iOS and macOS (Xcode 11.4.1)
[✓] Android Studio (version 4.0)
[!] IntelliJ IDEA Ultimate Edition (version 2020.1.1)
    ✗ Flutter plugin not installed; this adds Flutter specific functionality.
    ✗ Dart plugin not installed; this adds Dart specific functionality.
[✓] VS Code (version 1.45.1)
[✓] Connected device (1 available)

! Doctor found issues in 1 category.
```



从上述结果可以看出，IntelliJ IDEA Ultimate Edition 没有安装flutter plugin 和 dart plugin 没有安装。



1. 配置编辑器



### 设置 iOS 开发环境



1. 安装Xocde
2. 配置 Xcode command-line tools:

```
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

1. 运行一次 Xcode 或者通过输入命令 `sudo xcodebuild -license` 来确保已经同意 Xcode 的许可协议



安装了 Xcode 之后，你就可以在 iOS 真机或者模拟器上运行 Flutter 应用了。



#### 配置iOS 模拟器



输入命令运行模拟器

```
open -a Simulator
```



如果你想把 Flutter 应用部署到 iOS 的真机上，你还需要一个 Apple 开发者账号。另外，你还需要在 Xcode 上针对你的机器做一些设置。



1. 安装和设置 CocoaPods

```
sudo gem install cocoapods
pod setup
```



1. 按照下面 Xcode 签名流程来配置你的项目：

1. 1. 通过在命令行中于你当前 Flutter 项目目录下运行 `open ios/Runner.xcworkspace` 命令来打开默认的 Xcode 工程。
   2. 在运行按钮的下拉列表里选择你想要部署到的设备；
   3. 在左侧的导航面板中选择 `Runner` 项目；
   4. 在 `Runner` 项目的设置页面，请确保勾选你的开发团队。在不同的 Xcode 版本里，这一部分的操作界面不同：

1. 1. 1. 在 Xcode 10 版本中，请在这里设置：General > Signing > Team
      2. 在 Xcode 11 版本以后，请在这里设置 Signing & Capabilities > Team

1. 1. 在 Runner 项目的设置页面中，确保 General > Signing > Team 选项下的 Development Team 选中状态。

1. 1. 1. 在开始你的第一个 iOS 项目开发之前，你需要先在 Xcode 中登陆你的 Apple 开发者账号
      2. 任何 Apple ID 都可以进行开发和测试。如果想将应用上架 App Store，你需要加入 Apple Developer Program，你可以在 [Choosing a Membership](https://developer.apple.com/support/compare-memberships) 页面中查看详细的说明。

1. 1. 当你第一次将设备连接到开发机用于开发时，你需要分别在 Mac 和开发机上进行信任设备的操作。当你第一次连接时，会有个弹窗，点击 `Trust` 即可。

1. 1. 1. 然后在 iOS 开发机上进入 Settings 应用，选择 **General > Device Management** 然后信任相应的证书

1. 1. 如果 Xcode 的自动签名失败了，你可以检查以下项目中 **General > Identity > Bundle Identifier** 里的值是否是唯一的。



1. 执行 `flutter run` 命令来运行你的应用。



### 设置Android 开发环境



android 开发建议使用 Android Studio，也可以使用其它编辑器。



1. 下载 Android Studio
2. 运行Android Studio，安装android SDK， Android SDK Platform-Tools 以及 Android SDK Build-Tools。



#### 配置 Android 设备

在 Android 设备上运行或测试 Flutter 应用之前，你需要一个运行 Android 4.1（API 版本 16）或者更高的设备。

1. 在设备上打开 **Developer options** 和 **USB debugging** 选项，你可以在 [Android documentation](https://developer.android.google.cn/studio/debug/dev-options) 上查看更详细的方法介绍。
2. 如果是在 Windows 平台上使用，需要安装 [Google USB Driver](https://developer.android.google.cn/studio/run/win-usb)
3. 通过 USB 接口连接手机和电脑，如果在设备上弹出需要授权弹窗，允许授权以便让电脑能够访问你的开发设备。
4. 在命令行中，使用 `flutter devices` 命令来确保 Flutter 能够识别出你所连接的 Android 设备。

默认情况下，Flutter 会使用当前版本 `adb` 工具所依赖的 Android SDK 版本，如果你想让 Flutter 使用别的 Android SDK，你可以通过设置 `ANDROID_HOME` 环境变量来达到这个目的。

####  

#### 配置 Android 模拟器



根据以下步骤来将 Flutter 应用运行或测试于你的 Android 模拟器上：

1. 激活机器上的 [VM acceleration](https://developer.android.google.cn/studio/run/emulator-acceleration) 选项。
2. 启动 **Android Studio > Tools > Android > AVD Manager**，然后选择 **Create Virtual Device** 选项。（只有在 Android 项目中才会显示 **Android** 子选项。）
3. 选择相应的设备并选择 **Next** 选项。
4. 选择一个或多个你想要模拟的 Android 版本的系统镜像，然后选择 **Next** 选项。推荐选择 **x86** 或者 **x86_64** 镜像。
5. 在 Emulated Performance 下选择 **Hardware - GLES 2.0** 选项来开启 [硬件加速](https://developer.android.google.cn/studio/run/emulator-acceleration)。
6. 确保 AVD 选项配置正确，并选择 **Finish** 选项。
   想要查看上述步骤的更多详细信息，请查看 [Managing AVDs](https://developer.android.google.cn/studio/run/managing-avds) 页面。
7. 在 Android Virtual Device Manager 中，点击工具栏中的 **Run** 选项，模拟器会启动并为你所选择的系统版本和设备显示出相应的界面。



## 常见问题



#### Waiting for another flutter command to release the startup lock



打开AndroidStudio的时候顶部的模拟器一直是loading状态，运行flutter doctor 提示：

```
Waiting for another flutter command to release the startup lock
```

解决方法，如下： 



1. 打开flutter的安装目录/bin/cache/ 
2. 删除lockfile文件 
3. 重启AndroidStudio



#### **Flutter 卡在 package get 的解决办法**

运行 flutter run 或者新建flutter 项目时卡在：



```
Running "flutter packages get" in project_name...
```

大概率是遇到了防火墙，解决方案毕竟简单，添加两个环境变量即可，环境变量如下：

```
# linux mac 添加代理到 　.zsh_rc 或 .bash_profile
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```



官方解决方案文档：[Using Flutter in China](https://links.jianshu.com/go?to=https://github.com/flutter/flutter/wiki/Using-Flutter-in-China) https://flutter.dev/community/china[3]



### 参考链接

1. [安装和环境配置 https://flutter.cn/docs/get-started/install](https://flutter.cn/docs/get-started/install)
2. [SDK 版本列表 https://flutter.cn/docs/development/tools/sdk/archive](https://flutter.cn/docs/development/tools/sdk/archive)
3. [Using Flutter in China](https://links.jianshu.com/go?to=https://github.com/flutter/flutter/wiki/Using-Flutter-in-China) https://flutter.dev/community/china


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)
