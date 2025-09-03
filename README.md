# B站课程学习进度计算器

一个简单而强大的工具，帮助您追踪B站课程的学习进度。

## 功能特点

- 📚 自动解析courses目录中的HTML课程文件
- 📊 实时计算学习进度（基于集数和时长）
- 🎯 美观的进度条和统计图表
- 📱 响应式设计，支持移动端
- ⚡ 快速启动，无需复杂配置

## 使用方法

### 1. 准备课程文件

将B站课程的HTML文件放在 `courses/` 目录中，例如：
```
courses/
├── 珠峰vue3课程.html
├── 禹神vue3课程.html
└── 其他课程.html
```

### 2. 启动应用

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

### 3. 使用界面

在浏览器中打开 `http://localhost:8000`，然后：

1. 在"已看集数"列中输入您已经观看的集数
2. 系统会自动计算：
   - 学习时长进度
   - 集数进度
   - 总体完成度
   - 可视化进度条

## 文件说明

- `parse-courses.js` - Node.js脚本，用于解析HTML课程文件
- `index.html` - 主界面文件
- `index.js` - 前端JavaScript逻辑
- `courses-data.json` - 解析后的课程数据（自动生成）
- `start.sh` - 一键启动脚本

## 技术栈

- **后端**: Node.js (文件解析)
- **前端**: 原生JavaScript + HTML5 + CSS3
- **数据格式**: JSON

## 系统要求

- Node.js (用于解析HTML文件)
- Python (用于启动本地服务器)
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

## 注意事项

1. 确保courses目录中的HTML文件格式正确
2. 课程文件应包含视频标题和时长信息
3. 如果解析失败，请检查HTML文件的结构

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

## 更新课程数据

当您添加新的课程HTML文件后，重新运行：
```bash
node parse-courses.js
```

然后刷新浏览器页面即可看到新课程。
