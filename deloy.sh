#!/usr/bin/env sh
echo -e '\033[0;32m'Deploying updates to GitHub...'\033[0m'

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
vuepress build --dest ./dist

# 进入生成的文件夹
cp -rf dist/* ../gusibi.github.io/
cd ../gusibi.github.io/

# 如果是发布到自定义域名
# echo 'blog.gusibi.mobi' > CNAME

git add -A
git commit -m 'deploy'

# 发布到 https://<USERNAME>.github.io
git push -f git@github.com:gusibi/gusibi.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -