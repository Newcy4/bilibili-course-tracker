# B站课程学习进度计算器

一个简单而强大的工具，帮助您追踪B站课程的学习进度。

## 功能特点

- 📚 自动解析courses目录中的HTML课程文件
- 📊 实时计算学习进度（基于集数和时长）
- 🎯 美观的进度条和统计图表
- 📱 响应式设计，支持移动端
- ⚡ 快速启动，无需复杂配置
- 🌐 支持GitHub Pages在线部署

## 在线体验

🚀 **[在线版本](https://your-username.github.io/bilibili-course-tracker)** (请替换为你的GitHub用户名)

## 使用方法

### 方法一：在线使用（推荐）

1. 访问在线版本链接
2. 在"已看集数"列中输入您已经观看的集数
3. 系统会自动计算学习进度

### 方法二：本地使用

#### 1. 准备课程文件

将B站课程的HTML文件放在 `courses/` 目录中，例如：
```
courses/
├── 珠峰vue3课程.html
├── 禹神vue3课程.html
└── 其他课程.html
```

#### 2. 启动应用

运行启动脚本：
```bash
./start.sh
```

或者手动执行：
```bash
# 解析课程数据
node parse-courses.js

# 启动本地服务器（选择其中一种方式）
python3 -m http.server 8000
# 或者
python -m SimpleHTTPServer 8000
```

#### 3. 使用界面

在浏览器中打开 `http://localhost:8000`，然后：

1. 在"已看集数"列中输入您已经观看的集数
2. 系统会自动计算：
   - 学习时长进度
   - 集数进度
   - 总体完成度
   - 可视化进度条

## GitHub Pages 部署

### 快速部署

1. **Fork 此仓库**
2. **启用 GitHub Pages**：
   - 进入仓库 Settings
   - 找到 Pages 选项
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"
   - 点击 Save

3. **访问你的网站**：
   - 地址格式：`https://your-username.github.io/bilibili-course-tracker`

### 手动部署

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/bilibili-course-tracker.git
cd bilibili-course-tracker

# 2. 准备部署文件
mkdir -p gh-pages
cp index.html index.js courses-data.json README.md gh-pages/

# 3. 推送到 gh-pages 分支
git checkout -b gh-pages
git add gh-pages/
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 4. 在仓库设置中启用 Pages
```

## 文件说明

- `parse-courses.js` - Node.js脚本，用于解析HTML课程文件
- `index.html` - 主界面文件
- `index.js` - 前端JavaScript逻辑
- `courses-data.json` - 解析后的课程数据（自动生成）
- `start.sh` - 一键启动脚本
- `server.js` - 本地开发服务器（仅本地使用）

## 技术栈

- **前端**: 原生JavaScript + HTML5 + CSS3
- **后端**: Node.js (仅用于本地开发，解析HTML文件)
- **部署**: GitHub Pages
- **数据格式**: JSON
- **存储**: localStorage (浏览器本地存储)

## 系统要求

### 在线使用
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

### 本地开发
- Node.js (用于解析HTML文件)
- Python (用于启动本地服务器)

## 注意事项

1. 确保courses目录中的HTML文件格式正确
2. 课程文件应包含视频标题和时长信息
3. 如果解析失败，请检查HTML文件的结构
4. 学习进度会自动保存到浏览器本地存储

## 故障排除

### 课程数据解析失败
- 检查HTML文件是否包含正确的视频信息结构
- 确保文件编码为UTF-8

### 无法启动服务器
- 确保Python已安装
- 尝试手动在浏览器中打开index.html文件

### 页面显示异常
- 检查浏览器控制台是否有错误信息
- 确保courses-data.json文件存在且格式正确

### GitHub Pages 部署问题
- 确保仓库是公开的
- 检查文件路径是否正确
- 等待几分钟让GitHub Pages生效

## 更新课程数据

当您添加新的课程HTML文件后，重新运行：
```bash
node parse-courses.js
```

然后刷新浏览器页面即可看到新课程。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
