---
title: '使用VuePress 搭建个人博客'
date: 2020-06-14 07:48:04
tags: [教程,tutorial]
published: true
hideInList: false
feature: 
isTop: false
---


### 介绍


VuePress 是一个静态网站生成器，包含由Vue驱动的主题系统和插件API，同时还包含一个为书写技术文档而优化的默认主题。此篇文章只介绍如何使用VuePress 搭建个人博客的部分。

### 安装


> 前置条件：VuePress 需要 Node.js >= 8.6


##### 安装 vuepress

VuePress 安装毕竟简单，可以使用以下命令直接安装：

```shell
yarn add -D vuepress # npm install -D vuepress
```



#### 验证安装



为了验证VuePress 的效果，首先创建一篇文档


```shell
mkdir docs && echo '# Hello VuePress' > README.md
```


在当前目录下创建 `package.json` 文件，添加以下内容：


```json
{
  "scripts": {
    "dev": "vuepress dev docs",
    "build": "vuepress build docs"
  }
}
```



在本地启动服务器

```shell
vuepress dev .
```


VuePress 会在 [http://localhost:8080](http://localhost:8080/) 启动一个热重载的开发服务器。

如果没有报错，可在浏览器打开[http://localhost:8080](http://localhost:8080/)，默认加载内容为 README.md 中内容。



### VuePress 目录结构


VuePress 遵循 **“约定优于配置”** 的原则，推荐的目录结构如下：



```shell
.
├── blog
│   ├── .vuepress (可选的)
│   │   ├── components (可选的)
│   │   ├── theme (可选的)
│   │   │   └── Layout.vue
│   │   ├── public (可选的)
│   │   ├── styles (可选的)
│   │   │   ├── index.styl
│   │   │   └── palette.styl
│   │   ├── templates (可选的, 谨慎配置)
│   │   │   ├── dev.html
│   │   │   └── ssr.html
│   │   ├── config.js (可选的)
│   │   └── enhanceApp.js (可选的)
│   │ 
│   ├── README.md
│   └──_post
│       ├── about.md
│       └── README.md 
│ 
└── package.json
```



这里`blog`目录被称作 `targetDir` ，目录下的文件都是相对于 `blog` 目录的。比如此目录下文件的路由地址如下：



| 文件相对路径     | 页面路由地址      |
| ---------------- | ----------------- |
| /README.md       | /                 |
| /_post/README.md | /_post/           |
| /_post/about.md  | /_post/about.html |



### 基本配置



现在 VuePress 已经可以运行，现在添加一些基本的配置。首先在当前目录下创建 `.vuepress` 目录（所有 VuePress 相关的文件都放在此目录下），然后在 `.vuepress` 目录下创建 `config.js` 文件（也可以使用YAML (`.vuepress/config.yml`) 或是 TOML (`.vuepress/config.toml`) 格式的配置文件）。



添加以下配置到config.js：



```javascript
module.exports = {
  title: '顾斯比',  // 网站的标题，它将会被用作所有页面标题的前缀。
  description: '顾斯比的博客', // 网站的描述，它将会以 <meta> 标签渲染到当前页面的 HTML 中。
}
```

####  

其它详细配置参考官方文档：https://vuepress.vuejs.org/zh/config/



### 主题

因为是使用 `VuePress` 作为静态博客使用，需要替换掉默认的主题。这里使用官方主题： `@vuepress/theme-blog` 。

#### 安装


```shell
yarn add @vuepress/theme-blog -D
# OR npm install @vuepress/theme-blog -D
```


#### 使用&配置


在config.js 中添加主题相关配置：

```javascript
 // .vuepress/config.js
module.exports = {
  title: '顾斯比',
  description: '顾斯比的博客 gusibi goodspeed',
  theme: '@vuepress/blog',
  themeConfig: {
     nav: [     // 导航条相关配置
            { text: '首页', link: '/' },
            { text: '标签', link: '/tag/'},
            { text: '关于 ', link: '/about/' },
            { text: 'github ', link: 'https://github.com/gusibi/', target:'_blank' },
        ],
        /**
       * Ref: https://vuepress-theme-blog.ulivz.com/config/#globalpagination
       */
        globalPagination: {
          lengthPerPage: 10,
        },

        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#sitemap
         */
        sitemap: {
            hostname: 'http://blog.gusibi.mobi/'
        },
  }
}
```



#### 目录



默认情況下，所有内容都必须放在 `_posts` 目录內，文件名为`标题.md`，例如`about.md`。

```shell
└── _posts
    ├── ...
    └── about.md
```





#### 博客内容设置



Front matter 是用于指定博客文件的变量，必须放在博客文件的最上方。并且必须采用在三点划线之间书写的有效的 YAML。 这是一个基本的例子：



```yaml
---
title: Blogging Like a Hacker # 博客标题
date: 2020-06-14              # 博客发布日期
tags:                         # 文章标签
    - 前端
  - dart
  - flutter
  - vue
summary: 这里是文章的摘要
---
```

####  

其它变量：https://vuepress.vuejs.org/zh/guide/frontmatter.html



##### URL

默认情况下，path 路径则为文件目录的相对路径，比如：

```shell
├── package.json
└── source
    ├── _post
    │   └── intro-vuepress.md
    ├── index.md
    └── tags.md
```



那么你就会获得以下的可用页面：

```shell
/source/
/source/tags.html
/source/_post/intro-vuepress.html
```



推荐使用 `permalink` 指定文章的永久链接，可以使用全局配置来向所有页面应用永久链接：

```JavaScript
// .vuepress/config.js
module.exports = {
  permalink: "/:year/:month/:day/:slug"
};
```

另外，你也可以只为单独一个页面去设置永久链接。这种方式比全局配置拥有更高的优先级。

📝 **hello.md**:

```yaml
---
title: Hello World
permalink: /hello-world
---
Hello!
```



##### 内容



博客内容格式为 markdown，markdown 语法参考：https://www.markdownguide.org/

### 插件



#### 搜索



`VuePress` 内置搜索，可以通过设置 `themeConfig.search: false` 来禁用默认的搜索框，或是通过 `themeConfig.searchMaxSuggestions` 来调整默认搜索框显示的搜索结果数量：



```
module.exports = {
  themeConfig: {
    search: false,
    searchMaxSuggestions: 10
  }
}
```

你可以通过[在页面的 frontmatter 中设置 `search`](https://vuepress.vuejs.org/zh/guide/frontmatter.html#search) 来对单独的页面禁用内置的搜索框：

```
---
search: false
---
```


**⚠️提示**

**内置搜索只会为页面的标题、****`h2`** **、** **`h3`** **以及** **`tags`** **构建搜索索引。 如果你需要全文搜索，你可以使用** [**Algolia 搜索**](https://vuepress.vuejs.org/zh/theme/default-theme-config.html#algolia-搜索)**。**


#### google-analytics

google-analytics是著名互联网公司Google为网站提供的数据统计服务。可以对目标网站进行访问数据统计和分析，并提供多种参数供网站拥有者使用。这里推荐安装：

##### 安装

使用以下命令安装

```
yarn add -D @vuepress/plugin-google-analytics
# OR npm install -D @vuepress/plugin-google-analytics
```


##### 使用

将ga 配置添加到配置文件

```JavaScript
module.exports = {
  plugins: [
    [
      '@vuepress/google-analytics',
      {
        'ga': '' // UA-00000000-0
      }
    ]
  ]
}
```


更多配置参考文档：https://vuepress.vuejs.org/zh/theme/default-theme-config.html


#### RSS


`vuepress` 包含rss 插件，可以直接在配置中添加以下内容启用：

```JavaScript
module.exports = {
    ...
    themeConfig: {
      ...
      feed: {
         canonical_base: 'http://blog.gusibi.mobi/',
      },
    },
  };
```



### 部署到Github


1. 在 docs/.vuepress/config.js 中设置正确的 base。


> 如果你打算发布到 https://.github.io/，则可以省略这一步，因为 base 默认即是 "/"。


1. 在你的项目中，创建一个如下的 `deploy.sh` 文件:


```
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
vuepress build --dest ./public

# 进入生成的文件夹
cd public

# 如果是发布到自定义域名
# echo 'blog.gusibi.mobi' > CNAME

git add -A
git commit -m 'deploy'

# 发布到 https://<USERNAME>.github.io
git push -f git@github.com:gusibi/gusibi.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```

> 也以使用github ci 在每次提交代码的时候自动部署到github.io，具体步骤可以自行搜索配置


###  

### 参考链接


1. Intro to VuePress 1.x： https://ulivz.com/2019/06/09/intro-to-vuepress-1-x/
2. 默认主题配置： https://vuepress.vuejs.org/zh/theme/default-theme-config.html
3. https://www.markdownguide.org/
4. VuePress front matter 配置： https://vuepress.vuejs.org/zh/guide/frontmatter.html
5. VuePress 配置： https://vuepress.vuejs.org/zh/config/


------


**最后，感谢女朋友支持和包容，比❤️**

也可以在公号输入以下关键字获取历史文章：`公号&小程序` | `设计模式` | `并发&协程`

![扫码关注](http://media.gusibi.mobi/WDz3v4cU4LQq1oyKX-fYK1LxIThzZ1hK931ZaPRC8CdcB0t2oTYJciMDuAws70FY)

---------------

### 内推时间

![](http://media.gusibi.mobi/5FzreeM6IYt55JSQMAV63INPIvuPik75FlJAbP1e7Zdlg1WPe6BrHI-q0jkXskGf)
