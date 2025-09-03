#!/bin/bash

echo "�� 启动B站课程学习进度计算器"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js已安装"

# 检查courses目录是否存在
if [ ! -d "courses" ]; then
    echo "❌ 错误: courses目录不存在"
    echo "请确保courses目录存在并包含HTML文件"
    exit 1
fi

echo "✅ courses目录存在"

# 解析课程数据
echo "📚 正在解析课程数据..."
node parse-courses.js

if [ $? -eq 0 ]; then
    echo "✅ 课程数据解析完成"
    echo ""
    echo "🌐 启动Express服务器..."
    echo "请在浏览器中打开: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo ""
    
    # 启动Express服务器
    node server.js
else
    echo "❌ 课程数据解析失败"
    exit 1
fi
