const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;

// 静态文件服务
app.use(express.static('.'));

// 提供courses-data.json的API端点
app.get('/api/courses', (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'courses-data.json');
        
        if (!fs.existsSync(dataPath)) {
            return res.status(404).json({ 
                error: '课程数据文件不存在，请先运行 node parse-courses.js' 
            });
        }
        
        const data = fs.readFileSync(dataPath, 'utf8');
        const coursesData = JSON.parse(data);
        
        res.json(coursesData);
    } catch (error) {
        console.error('读取课程数据失败:', error);
        res.status(500).json({ 
            error: '读取课程数据失败: ' + error.message 
        });
    }
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log('🚀 B站课程学习进度计算器已启动');
    console.log('==============================');
    console.log(`🌐 服务器地址: http://localhost:${PORT}`);
    console.log('📚 请在浏览器中打开上述地址');
    console.log('按 Ctrl+C 停止服务器');
    console.log('==============================');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 服务器已停止');
    process.exit(0);
});
