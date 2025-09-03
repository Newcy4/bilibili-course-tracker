const express = require('express');
const path = require('path');
const axios = require('axios');


const app = express();
const PORT = 8000;

// 添加JSON解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('.'));

// B站代理API端点
app.post('/api/bilibili', async (req, res) => {
    try {
        console.log("req",req.body)
        const courseIdArr = Array.isArray(req.body.courseIdArr) ? req.body.courseIdArr : JSON.parse(req.body.courseIdArr);
        
        if (!courseIdArr) {
            return res.status(400).json({ error: '缺少courseIdArr参数' });
        }
        let htmlList = [];
        let errorList = []  // 解析错误的列表
        for (let i = 0; i < courseIdArr.length; i++) {
            let url = `https://www.bilibili.com/video/${courseIdArr[i]}`;
            console.log('代理请求B站页面:', url);
            // 使用axios请求B站页面
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 10000, // 10秒超时
                responseType: 'text' // 确保返回文本格式
            });
            if(matchCourseList(response.data)) {
                htmlList.push({htmlContent:matchCourseList(response.data), name: matchCourseName(response.data), courseId: courseIdArr[i]});
            } else {
                errorList.push({htmlContent:matchCourseList(response.data), name: matchCourseName(response.data), courseId: courseIdArr[i]});
            }
        }
        console.log("解析结果➡️htmlList",htmlList, "errorList", errorList)
        
        // 设置CORS头，允许前端访问
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        
        res.send({htmlList, errorList});
        
    } catch (error) {
        console.error('代理请求失败:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            res.status(408).json({ error: '请求超时' });
        } else if (error.response) {
            res.status(error.response.status).json({ 
                error: `B站返回错误: ${error.response.status}` 
            });
        } else {
            res.status(500).json({ 
                error: '代理请求失败: ' + error.message 
            });
        }
    }
});

// 匹配 html 中 <div class="video-pod__list multip list" 开头 <div class="teleport hidden" 结束，之间的标签内容
function matchCourseList(html) {
    try {
        // 使用正则表达式匹配指定区域
        const startPattern = /<div class="video-pod__list multip list"[^>]*>/i;
        const endPattern = /<div class="teleport hidden"[^>]*>/i;
        
        // 找到开始位置
        const startMatch = html.match(startPattern);
        if (!startMatch) {
            console.log('未找到开始标签: <div class="video-pod__list multip list">');
            return null;
        }
        
        const startIndex = startMatch.index;
        console.log('找到开始标签，位置:', startIndex);
        
        // 从开始位置之后查找结束标签
        const remainingHtml = html.substring(startIndex);
        const endMatch = remainingHtml.match(endPattern);
        
        if (!endMatch) {
            console.log('未找到结束标签: <div class="teleport hidden">');
            return null;
        }
        
        const endIndex = startIndex + endMatch.index;
        console.log('找到结束标签，位置:', endIndex);
        
        // 提取中间的内容
        const matchedContent = html.substring(startIndex, endIndex);
        console.log('匹配到的内容长度:', matchedContent.length);
        
        return matchedContent;
        
    } catch (error) {
        console.error('匹配课程列表时出错:', error);
        return null;
    }
}
// 匹配 <h1 data-title="内容"
function matchCourseName(html) {
    const startPattern = /<h1 data-title="([^"]*)"/i;
    const startMatch = html.match(startPattern);
    if (!startMatch) {
        return null;
    }
    return startMatch[1];
}

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
