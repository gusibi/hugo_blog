---
categories: ["development", "python", "后端"]
date: 2018-05-16T20:17:13+08:00
description:  newrelic python agent 源码分析
draft: false
slug: newrelic-python-agent-source-code-1
tags: ["python", "后端", "weixin", "development"]
title: newrelic python agent 源码分析-1
---

>Newrelic 是APM（Application Performance Management）（应用性能管理/监控）解决方案提供商。项目中，通常用它来追踪应用的性能。最近看了一下 newrelic-python-agent 源码，这是查看源码过程中的一些记录。
 
### 目录结构
newrelic 目录结构如下：

```bash
newrelic
├── admin  # 常用命令
├── api    # 探针
├── bootstrap
├── common  
├── core
├── extras
│   └── framework_django
│       └── templatetags
├── hooks   # 数据库 web 各个库的一些探针
│   ├── framework_tornado
│   ├── framework_tornado_r3
│   └── framework_tornado_r4
├── network
├── packages
│   ├── requests
│   │   └── packages
│   │       ├── chardet
│   │       └── urllib3
│   │           ├── packages
│   │           │   └── ssl_match_hostname
│   │           └── util
│   └── wrapt
└── samplers
```

### 命令

使用 `newrelic-admin help` 可以列出所有命令：

```bash
$ newrelic-admin help

Usage: newrelic-admin command [options]

Type 'newrelic-admin help <command>'for help on a specific command.

Available commands are:
  generate-config
  license-info
  license-key
  local-config
  network-config
  record-deploy
  run-program
  run-python
  server-config
  validate-config
```

通过 setup.py 代码可以知道：

```python
if with_setuptools:
    kwargs['entry_points'] = {
            'console_scripts': ['newrelic-admin = newrelic.admin:main'],
            }
```

`newrelic-admin` 命令调用的是 `newrelic.admin:main`，这是代码的入口。首先看一下 `newrelic/admin/`目录。

#### admin

> admin 目录是 newrelic-admin help 列出的命令脚本所在目录。 

包含文件如下：

```bash
$ tree
admin
├── __init__.py
├── __main__.py
├── debug_console.py
├── generate_config.py
├── license_info.py
├── license_key.py
├── local_config.py
├── network_config.py
├── record_deploy.py
├── run_program.py
├── run_python.py
├── server_config.py
└── validate_config.py
```

`__init__.py` 的 main 函数 是命令执行的入口。

`__init__.py` 文件中代码

```python
load_internal_plugins()
load_external_plugins()
```

用来加载 `_builtin_plugins` 中定义的命令。 

#### run_program

首先看下 run_program 命令，这个命令使用方式如下：

```bash
newrelic-admin run-program your command
```

`newrelic/admin/run_program.py` 中 `run_program` 函数有装饰器 command，用来定义将命令以及相关说明添加到字典 `_commands`。

在 `run_program` 中代码：

```python
root_directory = os.path.dirname(root_directory)
boot_directory = os.path.join(root_directory, 'bootstrap')

if 'PYTHONPATH' in os.environ:
    path = os.environ['PYTHONPATH'].split(os.path.pathsep)
    if not boot_directory in path:
        python_path = "%s%s%s" % (boot_directory, os.path.pathsep, os.environ['PYTHONPATH'])

os.environ['PYTHONPATH'] = python_path
```

可以发现`newrelic/bootstrap/sitecustomize.py` 文件被加入到了 PYTHONPATH。

> python 解释器初始化的时候会自动 import `PYTHONPATH` 下存在的 `sitecustomize` 和 `usercustomize` 模块。

之后的功能比较简单，就是调用 os 模块执行命令。

现在看下`newrelic/bootstrap/sitecustomize.py` 代码。

在 这个文件的最后一行：

```python
newrelic.config.initialize(config_file, environment)
```

这里用来初始化newrelic，具体代码在 `newrelic/config.py`文件。

以下是initialize函数：

```python
def initialize(config_file=None, environment=None, ignore_errors=None,
            log_file=None, log_level=None):

    if config_file is None:
        config_file = os.environ.get('NEW_RELIC_CONFIG_FILE', None)

    if environment is None:
        environment = os.environ.get('NEW_RELIC_ENVIRONMENT', None)

    if ignore_errors is None:
        ignore_errors = newrelic.core.config._environ_as_bool(
                'NEW_RELIC_IGNORE_STARTUP_ERRORS', True)

    _load_configuration(config_file, environment, ignore_errors,
            log_file, log_level)  # 加载配置

    if _settings.monitor_mode or _settings.developer_mode:
        _settings.enabled = True
        _setup_instrumentation()  # 设置探针
        _setup_data_source()  # TODO
        _setup_extensions()   # TODO
        _setup_agent_console()   # TODO
    else:
        _settings.enabled = False
```

其中第14行 `_load_configuration` 是用来加载 newrelic 的相关配置。比如：日志目录、各种环境变量、秘钥、newrelic host 地址等等。 

`_setup_instrumentation() 中 _process_module_builtin() 用来设置探针。

数据库、外部请求 等监控模块都位于 hook 目录下，通过 `_process_module_builtin` 函数将进程与监控模块进行绑定，包括 django 的主要模块以及常用的数据库等。在核心模块执行的时候触发监控，将数据回传到 `api.time_trace` 模块进行处理。

而对于硬件信息的检测则由 `commo.system_info` 进行。

### newrelic run_program 初始化过程

以下为 flask 应用初始化过程，其它应用类似：

1. `newrelic/admin/__init__.py main()`
2. `newrelic/admin/run_program.py` 代码中会把 `newrelic/bootstrap/sitecustomize.py` 添加到 `PYTHONPATH`,python 解释器初始化的时候会自动 import `PYTHONPATH` 下存在的 `sitecustomize` 和 `usercustomize` 模块
3. `newrelic/bootstrap/sitecustomize.py` 调用 `newrelic.config.initialize()`，`_setup_instrumentation()` 函数被调用，`_process_module_builtin`会把需要 wrap 的包先添加到_import_hooks。
4. `newrelic/config.py` 中  `sys.meta_path.insert(0, newrelic.api.import_hook.ImportHookFinder())` 执行
5. `newrelic/api/import_hook.py  ImportHookFinder().find_model()`
6. `newrelic/api/import_hook.py  _ImportHookLoader() or _ImportHookChainedLoader()`
7. `newrelic/api/import_hook.py  _notify_import_hooks`  `callable` 为 `newrelic/config _module_import_hook  _instrument`
8. `newrelic/hooks/framework_flask.py instrument_flask_app`
9. `newrelic/api/web_transaction.py wrap_wsgi_application`
10. `newrelic/common/object_wrapper.py wrap_object`

在代码中，使用到了第三方包 `wrapt`，以下是 wrapt 的官方描述（[文档地址](https://wrapt.readthedocs.io/en/latest/index.html))。

> wrapt模块的目的是为Python提供一个透明的对象代理，它可以作为构建函数包装器和装饰函数的基础。wrapt 提供了一个简单易用的decorator工厂，利用它你可以简单地创建decorator，并且在任何情况下都可以正确地使用它们。

`wrapt`简单示例如下：

```python
import wrapt
# 普通装饰器
@wrapt.decorator
def pass_through(wrapped, instance, args, kwargs):
    return wrapped(*args, **kwargs)

@pass_through
def function():
    pass

# 带参数的装饰器
import wrapt

def with_arguments(myarg1, myarg2):
    @wrapt.decorator
    def wrapper(wrapped, instance, args, kwargs):
        return wrapped(*args, **kwargs)
    return wrapper

@with_arguments(1, 2)
def function():
    pass
```

要实现decorator，需要首先定义一个装饰器函数。这将在每次调用修饰函数时调用。装饰器函数需要使用四个位置参数:

- wrapped - The wrapped function which in turns needs to be called by your wrapper function.
- instance - The object to which the wrapped function was bound when it was called.
- args - The list of positional arguments supplied when the decorated function was called.
- kwargs - The dictionary of keyword arguments supplied when the decorated function was called.

具体使用参考文档吧。 [文档地址](https://wrapt.readthedocs.io/en/latest/index.html)

------

newrelic 源码仔细看下去，太...复杂了。下一篇再分析一个 flask 请求到结束探针工作的完整过程吧。


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/zHqNew3j1brVxSoTkjOerslhnB_ZpchcOXf60lFUxiZ5YtnCHs5HrJNOP14go6Ea)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)