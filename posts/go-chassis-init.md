---
title: 'chassis 运行时做了什么？'
date: 2020-11-29 14:01:24
tags: [go,golang,development,后端,微服务]
published: true
hideInList: false
feature: http://media.gusibi.mobi/wfCxiW0ZpOJ81qw83qINP9jrRtAiFGlJ9jw3lko7L0w5eY79ojwhOw0rGhd3BXpk
isTop: true
---

## 什么是 chassis?


   Chassis，是一种微服务模式。在这种模式中，用户并不需要自己去处理构建微服务过程中外部配置、日志、健康检查、分布式追踪等，而是将他们交给专门的框架来处理。用户可以更聚焦业务逻辑本身，简单、快速的开发微服务。

**阅读此文，你可以得到什么？**

> 1. chassis 运行时做了什么
> 2. chassis 运行时的隐藏操作。
> 3. chassis 设计思路的一些理解


### Go-Chassis 是什么？

   

 Go-Chassis 是一个go语言的微服务开发框架，采用插件化设计，原生提供了可插拔的注册发现，加密解密，调用链追踪等组件。协议也是插件化的，支持http和grpc，也支持开发者定制私有协议， 开发者只需要专注于实现云原生应用即可。

   

 > 云原生应用，基于云服务开发或者针对云服务开发部署的应用。

   

 ![chassis 架构图.png](http://media.gusibi.mobi/nOId8YPFqTTV2Ha8kEB9gVaSG9zAEIBgJe7rp2GK7ZsgyHd4vsX8OMrewCuUb3hs)

   

 上图是go-chassis 的架构图，可以看出配置管理（Archaius）、服务注册（Registry）、Metrics、日志（Logger）都是独立的组件，分布式追踪、负载均衡、限流等都是以中间件（Handler Chain）的方式实现的。一个请求进来后会先通过server 转换成chassis invoker，然后经过Handler Chain，最后由Transport 转换成对应协议的response返回。

   

此篇文章主要关注go-chassis 启动过程时做了什么，以及做这些事情的用途。


### 一个例子

   

 首先从 hello world 开始， 目录结构如下：

   

```
   .
   ├── conf                       # 配置目录，必须
   │   ├── chassis.yaml           #
   │   ├── microservice.yaml      # 微服务相关配置，比如server name，注册中心地址
   └── rest
       └── main.go                
```

   

chassis.yaml 内容为：

   

```
   ---
   cse:
     protocols:
       rest:
         listenAddress: "127.0.0.1:5001"
     transport:
       timeout:
         rest: 1
     handler:
       chain:
         Provider:
           default: tracing-provider
```

   

microservice.yaml 内容为：

   

```
   cse:
     service:
       registry:
           address: http://127.0.0.1:30100
   
   service_description:
     name: test-rest-server
```

   

main.go


```
package main
   
import (
       rf "github.com/go-chassis/go-chassis/v2/server/restful"
       "log"
       "net/http"
   
       "github.com/go-chassis/go-chassis/v2"
   )
   
//RestFulHello is a struct used for implementation of restfull hello program
type RestFulHello struct {
}
   
//Sayhi is a method used to reply user with hello world text
func (r *RestFulHello) Sayhi(b *rf.Context) {
       b.Write([]byte( "hello world"))
       return
}
   
//URLPatterns helps to respond for corresponding API calls
func (r *RestFulHello) URLPatterns() []rf.Route {
       return []rf.Route{
           {Method: http.MethodGet, Path: "/sayhi", ResourceFunc: r.Sayhi,
               Returns: []*rf.Returns{{Code: 200}}},
       }
}
   
func main() {
   chassis.RegisterSchema("rest", &RestFulHello{})
   if err := chassis.Init(); err != nil {
       log.Fatal("Init failed." + err.Error())
       return
   }
    chassis.Run()
}
```


先来看一下这段代码具体做了什么。

   

   - 11~27  声明了 一个 RestFulHello struct，这个struct 有两个方法 Sayhi 和 URLPatterns，其中URLPatterns 返回一个 Route 列表。 这段代码声明了一个http handler 和 对应的路由，那具体为什么这么写等下再做说明。


```
type Schema struct {
    serverName string
    schema     interface{}
    opts       []server.RegisterOption
}
```

   

- 30行 `chassis.RegisterSchema("rest", &RestFulHello{})` 将前面声明的 RestFulHello 注册到 "rest" 服务。

   这里内部只是简单的使用传入的参数创建一个 `chassis.Schema` 然后append到 `chassis.schemas` 中。

- 31行 chassis运行前的初始化工作。
- 35行 运行chassis 服务。

   


![chassis_start.png](http://media.gusibi.mobi/ti_WF2mI4lC_8F_aeZF7-FxgsBcSkcRMZBrjrKv_vAZ87MV0q3P0Uo7Ukk4d9PW_)

   

执行 `go run rest/main.go` 运行代码，会发现启动失败，日志输出内容为：

   

```
   INFO: Install client plugin, protocol: rest
   INFO: Install Provider Plugin, name: default
   INFO: Installed Server Plugin, protocol:rest
   
   ERROR: add file source error [[/var/folders/rr/rzqnl9h10y577rch1nsx_jww0000gp/T/go-build725280265/b001/exe/conf/chassis.yaml] file not exist].
   file:go-chassis@v1.8.3/chassis_init.go:106,msg:failed to initialize conf: [/var/folders/rr/rzqnl9h10y577rch1nsx_jww0000gp/T/go-build725280265/b001/exe/conf/chassis.yaml] file not exist
   init chassis fail: [/var/folders/rr/rzqnl9h10y577rch1nsx_jww0000gp/T/go-build725280265/b001/exe/conf/chassis.yaml] file not exist
   Init failed.[/var/folders/rr/rzqnl9h10y577rch1nsx_jww0000gp/T/go-build725280265/b001/exe/conf/chassis.yaml] file not exist
```

   

通过日志可以看到两个问题：


1. 为什么添加了配置还会提示配置找不到？
2. 为什么配置没有加载成功插件却可以安装成功？


## chassis init


下图是chassis init 的执行流程：

![chassis_init.png](http://media.gusibi.mobi/RWJvZfc7AZGccP6ML_wP80QLr1_OQVUCccAoGHpdY3RcD2xqeFTmso34HzIL1_iP)

   

### 配置初始化


首先看一下chassis 初始化的过程中配置是如何加载的。




![config_init.png](http://media.gusibi.mobi/BruF3mWEA0c2KEh5wqP92EU_c9d44RVFHfYEIkzb5f0IwJ05xYpM_dd6PKb7y-TG)

   

   查看 config.Init() 代码可以看到 配置目录是通过 `fileutil.RouterConfigPath()` 来获取的，目录初始化方法为：

   

```
   func initDir() {
       if h := os.Getenv(ChassisHome); h != "" {
           homeDir = h
       } else {
           wd, err := GetWorkDir()
           if err != nil {
               panic(err)
           }
           homeDir = wd
       }
   
       // set conf dir, CHASSIS_CONF_DIR has highest priority
       if confDir := os.Getenv(ChassisConfDir); confDir != "" {
           configDir = confDir
       } else {
           // CHASSIS_HOME has second most high priority
           configDir = filepath.Join(homeDir, "conf")
       }
   }
```

   

> 如果使用  `ChassisHome`  环境变量指定应用目录，chassis 运行时，会从该目录下的 `ChassisHome/conf/`  目录中读取配置
>
> 也可以使用 `ChassisConfDir` 直接指定配置目录，ChassisConfDir 优先级高于 `ChassisHome/conf`

   


chassis 使用 archaius 来管理配置，*archaius* 初始化时，会从文件、环境变量、命令行、内存中初始化配置。

   

```
   // InitArchaius initialize the archaius
   func InitArchaius() error {
       var err error
   
       requiredFiles := []string{
           fileutil.GlobalConfigPath(),
           fileutil.MicroServiceConfigPath(),
       }
       optionalFiles := []string{
           fileutil.CircuitBreakerConfigPath(),
           fileutil.LoadBalancingConfigPath(),
           fileutil.RateLimitingFile(),
           fileutil.TLSConfigPath(),
           fileutil.MonitoringConfigPath(),
           fileutil.AuthConfigPath(),
           fileutil.TracingPath(),
           fileutil.LogConfigPath(),
           fileutil.RouterConfigPath(),
       }
   
       err = archaius.Init( // 初始化配置
           archaius.WithCommandLineSource(),
           archaius.WithMemorySource(),
           archaius.WithENVSource(),
           archaius.WithRequiredFiles(requiredFiles),
           archaius.WithOptionalFiles(optionalFiles))
   
       return err
```



从代码可以看出，global config 和 microservice config 是必须要有的，

   

> global config 对应  conf_path/chassis.yaml
>
> microservice config 对应 conf_path/microservice.yaml

   

接下来读出配置后，给初始化runtime 的值：

> runtime 中的数据可以认为是运行时的全局变量


```
...
       // runtime 中的数据可以认为是运行时的全局变量
       runtime.ServiceName = MicroserviceDefinition.ServiceDescription.Name
       runtime.Version = MicroserviceDefinition.ServiceDescription.Version
       runtime.Environment = MicroserviceDefinition.ServiceDescription.Environment
       runtime.MD = MicroserviceDefinition.ServiceDescription.Properties
       if MicroserviceDefinition.AppID != "" { //microservice.yaml has first priority
           runtime.App = MicroserviceDefinition.AppID
       } else if GlobalDefinition.AppID != "" { //chassis.yaml has second priority
           runtime.App = GlobalDefinition.AppID
       }
       if runtime.App == "" {
           runtime.App = common.DefaultApp
       }
   
       runtime.HostName = MicroserviceDefinition.ServiceDescription.Hostname
   ...
```

   

archaius 也支持从配置中心读取配置，通过这种方式，chassis 也提供了运行时配置热加载的功能。

   

**对于第二个问题，为什么插件会先于配置安装？**

### 插件初始化

![init_plugin.png](http://media.gusibi.mobi/Tx6hEjesBGf6eV5S9Yb-T5RCCqkTqNEllvVIUdOeVG73j6FLz_OFXCsFWHWpYGYA)



从图中可以看出init 做了预先初始化了很多的插件，比如 client、provider、server、log、router rule、register、load balance、service discover、treporter等，并且chassis init 方法中并没有做显式的初始化调用。通过查看代码会发现，这个步骤是使用各自的init 方法自动执行的，类似这样：

```
// restful server
func init() {
    server.InstallPlugin(Name, newRestfulServer)
}

// route rule plugin
func init() { 
    router.InstallRouterService("cse", newRouter)
}

// init initialize the plugin of service center registry
func init() {
    registry.InstallRegistrator(ServiceCenter, NewRegistrator)
    registry.InstallServiceDiscovery(ServiceCenter, NewServiceDiscovery)
    registry.InstallContractDiscovery(ServiceCenter, newContractDiscovery)

}

// init install plugin of new file registry
func init() {
    registry.InstallRegistrator(Name, newFileRegistry)
    registry.InstallServiceDiscovery(Name, newDiscovery)
}
```



之所以隐式加载是因为 chassis 是插件式设计，使用 init 方式加载插件，可以做到对插件的即插即用，需要使用的插件只需要在代码中添加包的import 即可，比如加载grpc 插件，只需要在main.go 中添加 

```
import _ "github.com/go-chassis/go-chassis-extension/protocol/grpc/server"
```


> 从这一系列插件安装方式也能看出，对于chassis 来说，注册中心，协议，负载均衡等都是插件，这也就意味着这些插件都是可替换的，方便二次开发。



以上两个问题现在都解决了，现在执行以下命令运行服务：



```
CHASSIS_CONF_DIR=`pwd`/conf go run rest/main.go
```



### 初始化handler chain



Handler是微服务在运行过程中在框架层面里的一个最小处理单元。go chassis通过handler和handler的组装实现组件化的运行模型架构。其基本的使用方式就是实现接口、注册逻辑：



Handler 定义非常简单，实现了Handler 接口就可以认为创建了一个Handler。


```
// Handler interface for handlers
type Handler interface {
    // handle invocation transportation,and tr response
    Handle(*Chain, *invocation.Invocation, invocation.ResponseCallBack)
    Name() string
}
```

使用RegisterHandler 函数将添加到HandlerFuncMap 中即可在CreateHandler 调用时使用。

```
// RegisterHandler Let developer custom handler
func RegisterHandler(name string, f func() Handler) error {
    if stringutil.StringInSlice(name, buildIn) {
        return errViolateBuildIn
    }
    _, ok := HandlerFuncMap[name]
    if ok {
        return ErrDuplicatedHandler
    }
    HandlerFuncMap[name] = f
    return nil
}
```

对于chassis 来说，协议转换，权限验证，全链路追踪等都可以认为是一个handler（中间件），这里会从配置中读取声明的handler，并且初始化。请求调用时，会按照配置文件中的定义的顺序进入handler进行处理。



![handler_chain_init.png](http://media.gusibi.mobi/wxzssdKUklFg3Z1mY7QH_9cfBPIfBT3JwGb99ZwfBYcMQ_Rw_TILJWCD0rUPDh99)



在服务初始化的过程中，go-chassis 会根据配置文件中的定义加载需要的handler，handler 分为provider、consumer和 default 三种，配置内容示例如下：

```
handler:
    chain:
      Provider:
        default: tracing-provider
        rest: jwt
```



> **如果配置了非default 的type，服务启动的时候只会执行此特定的handler，比如上述配置，handler 只会执行 jwt，而忽略tracing-provider**





这是因为chassis 使用map存储 handler chain，map 的key 为 chainType+chainName， `default` 也是一种chainType，如果name(即chain type)有值则使用对应的 chain，否则使用default。


```
type Chain struct {
    ServiceType string
    Name string
    Handlers []Handler
}

// GetChain is to get chain
func GetChain(serviceType string, name string) (*Chain, error) {
    if name == "" {
        name = common.DefaultChainName
    }
    origin, ok := ChainMap[serviceType+name]
    if !ok {
        return nil, fmt.Errorf("get chain [%s] failed", serviceType+name)
    }
    return origin, nil
}

// 
chainMap := chaninMap[strint]*Chain{
    "Provider+rest":  &Chain{
          ServiceType: "Provider",
          Name: "rest",
          Handlers: []Handler{jwt},},
    "Provider+default": &Chain{
          ServiceType: "Provider",
          Name: "default",
          Handlers: []Handler{tracing-provider}},,
}
```





### 初始化 server



![init_server.png](http://media.gusibi.mobi/ilHWFRDKFGZBxP7BCpvqHoDGaiYco4M6Rbzi5kDvyNQBtx5X7nRK1Hz9rv9fMulU)


初始化的前提是服务已经加载，加载的步骤在init 之前就已经通过 init 方法载入了。



```
//Init initializes
func Init() error {
    var err error
    for k, v := range config.GlobalDefinition.Cse.Protocols {
        if err = initialServer(config.GlobalDefinition.Cse.Handler.Chain.Provider, v, k); err != nil {
            log.Println(err)
            return err
        }
    }
    return nil
}
```



这里初始化的是配置文件中 `protocols` 指定的服务。


```
//获取服务的方法
func GetServerFunc(protocol string) (NewFunc, error) {
    f, ok := serverPlugins[protocol]
    if !ok {
        return nil, fmt.Errorf("unknown protocol server [%s]", protocol)
    }
    return f, nil
}
```

> 这里会从 `*var* serverPlugins = make(*map*[string]NewFunc)`  读取server，所以在初始化时需要先安装server 对应的插件
>
> chassis 会 默认安装rest 插件，对于grpc 需要首先指定



```
// p 对应 protocal 中的配置
if p.Listen == "" {
        if p.Advertise != "" {
            p.Listen = p.Advertise
        } else {
            p.Listen = iputil.DefaultEndpoint4Protocol(name)
        }
    }
```



> 服务的Listen Advertise 优先级最高，如果 Advertise 和 Listen 都没有配置，使用默认配置。

初始化 server options，其中chainName 如果Provider 配置了对应 protocol  name 的值，则使用protocol name。

```
chainName := common.DefaultChainName
    if _, ok := providerMap[name]; ok {
        chainName = name
    }

o := Options{
        Address:            p.Listen,  // 配置中监听的端口
        ProtocolServerName: name,      // protocal provider 中的名字，比如 rest grpc
        ChainName:          chainName, // protocal provider 中的名字，比如 rest grpc
        TLSConfig:          tlsConfig,
        BodyLimit:          config.GlobalDefinition.Cse.Transport.MaxBodyBytes["rest"],
    }
```



### 其它



几个初始化外，init 还包括 register、configcenter、router、contorl、tracing、metric、reporter、熔断器、事件监听等就不再细说了。



为止，chassis 所需要的初始化步骤已经结束，接下来就是 服务运行的步骤。



## chassis run



首先看一下 chassis.Run() 启动的整体流程



![chassis_run.png](http://media.gusibi.mobi/DSd1K4nvCFlb-5U-hTfqby7OxsN_wf7uhOP6Xm1qb3zNAYa_Owp1C7YTotwlDW4q)





**chassis 运行**主要分为三个动作：

1. 根据schema 找到服务，将对应的handle func 使用 handler chain 封装
2. 启动服务，将服务注册到服务中心
3. 监听退出信号



**这里使用rest 服务作为例子看一下 chassis 启动服务的时候做了哪些操作。**


### 服务注册



首先回顾一下hello world 代码：

```
//RestFulHello is a struct used for implementation of restfull hello program
type RestFulHello struct {
}

//Sayhi is a method used to reply user with hello world text
func (r *RestFulHello) Sayhi(b *rf.Context) {
    b.Write([]byte( "hello world"))
    return
}

//URLPatterns helps to respond for corresponding API calls
func (r *RestFulHello) URLPatterns() []rf.Route {
    return []rf.Route{
        {Method: http.MethodGet, Path: "/sayhi", ResourceFunc: r.Sayhi,
            Returns: []*rf.Returns{{Code: 200}}},
    }
}

chassis.RegisterSchema("rest", &RestFulHello{}) // 第一个参数即是服务名，第二个参数是 Router
```



`RestFulHello` ，其中有一个 `URLPatterns() []Route` 方法，实现了 `Router ` 接口。 



**Router 定义**



```
//Router is to define how route the request
type Router interface {
    //URLPatterns returns route
    URLPatterns() []Route
}
```



![chassis_restful_register.png](http://media.gusibi.mobi/diDeLEpGlaS-hEyv60YQc2s6jb5AmxfMBLIqiAsAU7W72KQ94umSLJpr7U_sMH1n)


```
// HTTPRequest2Invocation convert http request to uniform invocation data format
func HTTPRequest2Invocation(req *restful.Request, schema, operation string, resp *restful.Response) (*invocation.Invocation, error) {
    inv := &invocation.Invocation{
        MicroServiceName:   runtime.ServiceName,
        SourceMicroService: common.GetXCSEContext(common.HeaderSourceName, req.Request),
        Args:               req,
        Reply:              resp,
        Protocol:           common.ProtocolRest,
        SchemaID:           schema,
        OperationID:        operation,
        URLPathFormat:      req.Request.URL.Path,
        Metadata: map[string]interface{}{
            common.RestMethod: req.Request.Method,
        },
    }
    //set headers to Ctx, then user do not  need to consider about protocol in handlers
    m := make(map[string]string)
    inv.Ctx = context.WithValue(context.Background(), common.ContextHeaderKey{}, m)
    for k := range req.Request.Header {
        m[k] = req.Request.Header.Get(k)
    }
    return inv, nil
}
```


启动的服务注册流程中包含了将schemas 中所有Router 取出遍历，调用 `WrapHandlerChain()` 函数，这个函数主要做了以下工作：

1. 取出 Route 中 ResourceFunc （即real handler func）
2. 将 HttpRequest 转换成 chassis Invocation，
3. 将Invocation 再添加回 request 中添加到 handler chain 中
4. 返回一个闭包函数。


最后会把使用 `WrapHandlerChain` 封装后的handler 注册到go-restful 框架中。

响应请求时，调用关系类似以下操作:

```
func handle(){
    func handle1(){
        func handle2(){
            func handle3(){
                real_handle_func()
            }()
        }()
    }()
}
```


**为什么需要转换成统一的invocation？**



不同协议请求进入到对应的Server，Server将具体的协议请求转换为Invocation统一抽象模型，并传入Handler chain，由于handler根据统一模型Invocation进行处理，不必每个协议开发出来都自己开发一套治理。处理链可通过配置更新，再进入Transport handler，使用目标微服务的协议客户端传输到目标。

这种方式实际上真正提供业务处理的还是各个server 插件，chassis 只是中间商，可以对request 和 response 做它想要的处理，比如限流，熔断，路由更新等。

![server.png](http://media.gusibi.mobi/5RO9xrwmzFuRH1wVtncbC4R3Z9FNr283opNevd5yCeAar0tFDIw_fsTeFUkud1xV)



1. 接收到协议请求后，由各协议Server转为统一的Invocation模型
2. Invocation进入处理链处理
3. 处理结束后，进入具体的业务处理逻辑



### 信号监听



当服务需要关闭或重启时，应当处理完当前的请求或者设置为超时，而不是粗暴的断开链接，chassis 这里使用了信号监听的方式来处理关闭信号。

![gracefully_shutdown.png](http://media.gusibi.mobi/qipE63KL-Tjhy6DubK_iyF7W_Rjqae2HrsB3bUFy-FlNVnaAme5qjgyIBEZK1BlB)

```
func waitingSignal() {
    //Graceful shutdown
    c := make(chan os.Signal) // 创建一个os.Signal channel
    // 注册要接收的信号
    signal.Notify(c, syscall.SIGINT, syscall.SIGHUP, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGILL, syscall.SIGTRAP, syscall.SIGABRT)
    select {
    case s := <-c:
        openlogging.Info("got os signal " + s.String())
    case err := <-server.ErrRuntime:
        openlogging.Info("got server error " + err.Error())
    }

    // 判断服务是否有注册
    if !config.GetRegistratorDisable() {
        registry.HBService.Stop()// 停掉心跳服务
        openlogging.Info("unregister servers ...")
        // 从server center 中退出
        if err := server.UnRegistrySelfInstances(); err != nil {
            openlogging.GetLogger().Warnf("servers failed to unregister: %s", err)
        }
    }

    for name, s := range server.GetServers() {
        // 遍历服务，调用服务的 stop 方法
        openlogging.Info("stopping server " + name + "...")
        err := s.Stop()
        if err != nil {
            openlogging.GetLogger().Warnf("servers failed to stop: %s", err)
        }
        openlogging.Info(name + " server stop success")
    }

    openlogging.Info("go chassis server gracefully shutdown")
}
```



这里使用go信号通知机制通过往一个channel中发送`os.Signal`实现的。创建一个os.Signal channel，然后使用`signal.Notify`注册要接收的信号，chassis 关注以下信号：



| 信号    | 值   | 动作 | 说明                                         |
| ------- | ---- | ---- | -------------------------------------------- |
| SIGHUP  | 1    | Term | 终端控制进程结束(终端连接断开)               |
| SIGINT  | 2    | Term | 用户发送INTR字符(Ctrl+C)触发                 |
| SIGQUIT | 3    | Core | 用户发送QUIT字符(Ctrl+/)触发                 |
| SIGILL  | 4    | Core | 非法指令(程序错误、试图执行数据段、栈溢出等) |
| SIGTRAP | 5    | Core | Trap指令触发(如断点，在调试器中使用)         |
| SIGABRT | 6    | Core | 调用abort函数触发                            |
| SIGTERM | 15   | Term | 结束程序(可以被捕获、阻塞或忽略)             |


接收到信号后，首先判断是否注册到服务中心，如果注册，停掉心跳发送，退出注册，然后调用 server.Shutdown() 来优雅退出。




> go http Server 从1.8 之后支持优雅退出。

   

具体实现可以参考此文章：http://xiaorui.cc/archives/5803

   

## 总结


这篇文章介绍了 chassis 服务启动的过程，主要介绍了init 中 配置 、插件、handler chain 、server 的初始化流程，然后分析了服务启动时做了哪些操作以及对服务退出的处理。

   

## 参考链接

1. [使用ServiceComb Go-chassis构建微服务](https://www.infoq.cn/article/ServiceComb-Go-chassis-micro-service)
2. [Pattern: Microservice chassis](http://microservices.io/patterns/microservice-chassis.html)
3. [Linux Signal及Golang中的信号处理](https://colobu.com/2015/10/09/Linux-Signals/)
4. [源码分析golang http shutdown优雅退出的原理](http://xiaorui.cc/archives/5803)
5. [Go语言微服务开发框架实践-go chassis](https://juejin.im/post/6844903682362834952)