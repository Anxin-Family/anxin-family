# 安心家庭完整网站 · GitHub Pages 发布包

本包保留当前20题网站的全部源码、图片、样式及结果报告功能。docs 是已经构建好的网站，可直接发布，不需要在电脑安装开发环境。

## 首次上线

1. 登录 GitHub，新建仓库 anxin-family。免费账户使用 Pages 时选择 Public（源码也将公开）；如需源码私有，先确认账户套餐支持私有仓库 Pages。
2. 解压本包，进入 anxin-family 文件夹。在仓库选择 Add file → Upload files，上传该文件夹内的文件和子文件夹，不要上传 ZIP，也不要多套一层 anxin-family。
3. 提交到 main。仓库首页应直接看到 docs、src、public、package.json。
4. Settings → Pages → Source 选择 Deploy from a branch。
5. Branch 选择 main，文件夹选择 /docs，点击 Save。
6. 等待发布完成，使用 Pages 页面给出的网址；通常是 https://您的用户名.github.io/anxin-family/。

## 后续修改

源码在 src/App.tsx 和 src/styles.css。修改源码后，使用 Node.js 22.12 或更高的兼容版本运行 npm ci，然后运行 npm run build -- --outDir docs。将更新后的源码和整个 docs 目录同步到 GitHub。仅修改 src 不会更新线上页面。

## 说明

- 网站采用相对资源路径，支持仓库子目录。
- 不依赖 ChatGPT Sites、业务服务器或数据库。
- 请通过网站网址访问，不能用双击本地HTML代替托管运行。
- 网站访问速度及微信内报告保存效果需要实际测试。
- GitHub Pages 设置参考：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
