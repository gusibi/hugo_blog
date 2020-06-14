module.exports = {
    title: '顾斯比',
    description: '顾斯比的博客 gusibi goodspeed',
    plugins: [
        [
            "@vuepress/google-analytics",
            {
                ga: 'UA-76238744-1'
            }
        ]
    ],
    theme: '@vuepress/blog',
    themeConfig: {

        nav: [
            { text: '首页', link: '/' },
            { text: '标签', link: '/tag/'},
            { text: '关于 ', link: '/about/' },
            { text: 'github ', link: 'https://github.com/gusibi/' },
        ],
      // lastUpdated: '上次更新时间', // string | boolean
        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#footer
         */
        footer: {
            contact: [
                {
                    type: 'github',
                    link: 'https://github.com/gusibi',
                },
                {
                    type: 'twitter',
                    link: 'https://twitter.com/gusibix',
                },
                // {
                //     type: 'codepen',
                //     link: '/',
                // },
                // {
                //     type: 'codesandbox',
                //     link: '/',
                // },
                // {
                //     type: 'facebook',
                //     link: '/',
                // },
                // {
                //     type: 'gitlab',
                //     link: '/',
                // },
                // {
                //     type: 'instagram',
                //     link: '/',
                // },
                // {
                //     type: 'linkedin',
                //     link: '/',
                // },
                // {
                //     type: 'mail',
                //     link: '/',
                // },
                // {
                //     type: 'messenger',
                //     link: '/',
                // },
                // {
                //     type:'music',
                //     link:'/'
                // },
                // {
                //     type: 'phone',
                //     link: '/',
                // },
                // {
                //     type:'video',
                //     link:'/'
                // },
                // {
                //     type: 'web',
                //     link: '/',
                // },
                // {
                //     type: 'youtube',
                //     link: '/'
                // }
            ],
            copyright: [
                {
                    text: 'Powered by VuePress',
                    link: 'https://github.com/vuepressjs',
                },
                {
                    text: 'Theme - vuepress-theme-blog',
                    link: 'https://github.com/vuepressjs/vuepress-theme-blog',
                },
            ],
        },
        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#directories
         */

        // directories:[
        //   {
        //     id: 'post',
        //     dirname: '_posts',
        //     path: '/',
        //     itemPermalink: '/:year/:month/:day/:slug',
        //   },
        //   {
        //     id: 'writing',
        //     dirname: '_writings',
        //     path: '/',
        //     itemPermalink: '/:year/:month/:day/:slug',
        //   },
        // ],

        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#frontmatters
         */

        // frontmatters: [
        //   {
        //     id: "tag",
        //     keys: ['tag', 'tags'],
        //     path: '/tag/',
        //   },
        //   {
        //     id: "location",
        //     keys: ['location'],
        //     path: '/location/',
        //   },
        // ],

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
            hostname: 'http://blog.gusibi.site/'
        },
        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#comment
         */
        comment: {
            service: 'disqus',
            shortname: 'gu-si-bi',
        },
        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#newsletter
         */
        // newsletter: {
        //     endpoint: ''
        // },
        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#feed
         */
        feed: {
            canonical_base: 'http://blog.gusibi.site/',
        },

        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#summary
         */

        // summary:false,

        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#summarylength
         */

        // summaryLength:100,

        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#pwa
         */

        // pwa:true,

        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#paginationcomponent
         */

        // paginationComponent: 'SimplePagination'

        /**
         * Ref: https://vuepress-theme-blog.ulivz.com/config/#smoothscroll
         */
        smoothScroll: true
    }
  }