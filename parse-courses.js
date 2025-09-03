// 解析时长字符串为分钟数
function parseDuration(durationStr) {
    if (!durationStr) return 0;
    
    // 移除所有空格和换行符
    durationStr = durationStr.trim().replace(/\s+/g, '');
    
    // 匹配格式：HH:MM:SS 或 MM:SS
    const timeMatch = durationStr.match(/(\d+):(\d+)(?::(\d+))?/);
    if (timeMatch) {
        const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
        const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
        const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
        
        return hours * 60 + minutes + seconds / 60;
    }
    
    return 0;
}

// 格式化时长为可读字符串
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
        return `${hours}小时${mins}分钟`;
    } else {
        return `${mins}分钟`;
    }
}

// 解析HTML文件中的课程数据
function parseCourseHTML(htmlContent, courseName, courseId) {
    const episodes = [];
    
    // 使用正则表达式匹配每个视频项
    // 匹配从 <div data-key= 开始到对应的 </div> 结束的整个视频项
    const videoItemRegex = /<div data-key="[^"]*" class="[^"]*video-pod__item[^"]*"[^>]*>[\s\S]*?<\/div><\/div><\/div>/g;
    const matches = htmlContent.match(videoItemRegex) || [];
    
    console.log(`找到 ${matches.length} 个视频项`);
    
    matches.forEach((match, index) => {
        // 提取标题 - 匹配 <div class="title-txt">标题内容</div>
        const titleMatch = match.match(/<div class="title-txt">([^<]+)<\/div>/);
        // 提取时长 - 匹配 <div class="stat-item duration">\n  时长\n</div>
        const durationMatch = match.match(/<div class="stat-item duration">\s*([^<\n]+)/);
        
        if (titleMatch && durationMatch) {
            const title = titleMatch[1].trim();
            const duration = durationMatch[1].trim();
            const durationMinutes = parseDuration(duration);
            
            episodes.push({
                episode: index + 1,
                title: title,
                duration: durationMinutes,
                durationStr: duration
            });
        } else {
            console.log(`第${index + 1}个视频项解析失败:`, {
                titleMatch: titleMatch ? titleMatch[1] : 'null',
                durationMatch: durationMatch ? durationMatch[1] : 'null'
            });
        }
    });
    
    return {
        name: courseName,
        episodes: episodes,
        totalEpisodes: episodes.length,
        totalDuration: episodes.reduce((sum, ep) => sum + ep.duration, 0),
        courseId: courseId
    };
}




// 参数 coursesHtmlList: [{htmlContent: string, name: string}]
function loadAllCoursesData(coursesHtmlList) {
    coursesData = localStorage.getItem('courseData') || [];
    // localStorage 有东西就返回
    if (coursesData && coursesData.length > 0) return coursesData;

    coursesHtmlList.forEach(courseItem => {
        try {
            const courseData = parseCourseHTML(courseItem.htmlContent, courseItem.name, courseItem.courseId);
            coursesData.push(courseData);
            console.log(`成功加载课程: ${courseItem.name} (${courseData.totalEpisodes}集, 总时长: ${formatDuration(courseData.totalDuration)})`);
        } catch (error) {
            console.error(`加载课程文件失败: ${courseItem.name}`, error);
        }
    });
    
    return coursesData;
}

// 生成课程数据JSON文件
function generateCoursesData(coursesHtmlList) {
    console.log('开始解析courses目录中的课程文件...');
    
    const coursesData = loadAllCoursesData(coursesHtmlList);
    
    if (coursesData.length === 0) {
        console.log('没有找到任何课程文件');
        return;
    }
    
    // 生成统计信息
    const totalCourses = coursesData.length;
    const totalEpisodes = coursesData.reduce((sum, course) => sum + course.totalEpisodes, 0);
    const totalDuration = coursesData.reduce((sum, course) => sum + course.totalDuration, 0);
    
    console.log('\n=== 课程统计信息 ===');
    console.log(`总课程数: ${totalCourses}`);
    console.log(`总集数: ${totalEpisodes}`);
    console.log(`总时长: ${formatDuration(totalDuration)}`);
    
    console.log('\n=== 各课程详情 ===');
    coursesData.forEach(course => {
        console.log(`\n课程: ${course.name}`);
        console.log(`  集数: ${course.totalEpisodes}集`);
        console.log(`  总时长: ${formatDuration(course.totalDuration)}`);
        console.log(`  平均每集时长: ${formatDuration(course.totalDuration / course.totalEpisodes)}`);
        
        // 显示前5集信息
        console.log('  前5集:');
        course.episodes.slice(0, 5).forEach(ep => {
            console.log(`    ${ep.episode}. ${ep.title} (${ep.durationStr})`);
        });
        
        if (course.episodes.length > 5) {
            console.log(`    ... 还有${course.episodes.length - 5}集`);
        }
    });
    
    return coursesData;
}
