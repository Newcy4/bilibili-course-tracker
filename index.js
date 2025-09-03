// 课程数据存储
let coursesData = [];

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
function parseCourseHTML(htmlContent, courseName) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const episodes = [];
    const videoItems = doc.querySelectorAll('.video-pod__item');
    
    videoItems.forEach((item, index) => {
        const titleElement = item.querySelector('.title-txt');
        const durationElement = item.querySelector('.stat-item.duration');
        
        if (titleElement && durationElement) {
            const title = titleElement.textContent.trim();
            const duration = durationElement.textContent.trim();
            const durationMinutes = parseDuration(duration);
            
            episodes.push({
                episode: index + 1,
                title: title,
                duration: durationMinutes,
                durationStr: duration
            });
        }
    });
    
    return {
        name: courseName,
        episodes: episodes,
        totalEpisodes: episodes.length,
        totalDuration: episodes.reduce((sum, ep) => sum + ep.duration, 0)
    };
}

// 加载课程数据
async function loadCoursesData() {
    try {
        // 模拟从courses文件夹加载HTML文件
        // 在实际应用中，这里应该通过服务器端API获取文件内容
        const courseFiles = [
            { name: '珠峰vue3课程', file: 'courses/珠峰vue3课程.html' },
            { name: '禹神vue3课程', file: 'courses/禹神vue3课程.html' }
        ];
        
        coursesData = [];
        
        for (const courseFile of courseFiles) {
            try {
                const response = await fetch(courseFile.file);
                if (response.ok) {
                    const htmlContent = await response.text();
                    const courseData = parseCourseHTML(htmlContent, courseFile.name);
                    coursesData.push(courseData);
                } else {
                    console.warn(`无法加载课程文件: ${courseFile.file}`);
                }
            } catch (error) {
                console.error(`加载课程文件失败: ${courseFile.file}`, error);
            }
        }
        
        // 如果没有成功加载任何课程，使用示例数据
        if (coursesData.length === 0) {
            coursesData = getSampleData();
        }
        
        renderCoursesTable();
        updateSummaryStats();
        
    } catch (error) {
        console.error('加载课程数据失败:', error);
        // 使用示例数据作为后备
        coursesData = getSampleData();
        renderCoursesTable();
        updateSummaryStats();
    }
}

// 获取示例数据（基于实际HTML内容）
function getSampleData() {
    const coursesData = [
        {
            name: '珠峰vue3课程',
            episodes: [
                { episode: 1, title: '01.Vue2&3系统课-课程介绍', duration: 23.17, durationStr: '23:10' },
                { episode: 2, title: '02.基于传统操作DOM的方式实现计算器', duration: 42.93, durationStr: '42:56' },
                { episode: 3, title: '03.Vue中的MVVM模式和初步体验', duration: 51.3, durationStr: '51:18' },
                { episode: 4, title: '04.指定视图容器的N种方案', duration: 40.67, durationStr: '40:40' },
                { episode: 5, title: '05.为哈要把数据写在data中', duration: 27.8, durationStr: '27:48' },
                { episode: 6, title: '06.小胡子语法的细节处理', duration: 33.13, durationStr: '33:08' },
                { episode: 7, title: '07.Object.defineProperty的详细运用', duration: 55.22, durationStr: '55:13' },
                { episode: 8, title: '08.Vue2响应式数据的细节处理', duration: 106.17, durationStr: '01:46:10' },
                { episode: 9, title: '09.Vue2响应式源码-数组处理', duration: 41.73, durationStr: '41:44' },
                { episode: 10, title: '10.Vue2响应式源码-对象的处理', duration: 40.68, durationStr: '40:41' }
                // 这里只显示前10集作为示例，实际应该有99集
            ],
            totalEpisodes: 99,
            totalDuration: 0 // 将在下面计算
        },
        {
            name: '禹神vue3课程',
            episodes: [
                { episode: 1, title: '001.教程简介', duration: 5.33, durationStr: '05:20' },
                { episode: 2, title: '002.Vue3简介', duration: 2.72, durationStr: '02:43' },
                { episode: 3, title: '003.创建Vue3工程', duration: 17.02, durationStr: '17:01' },
                { episode: 4, title: '004.编写App组件', duration: 12.15, durationStr: '12:09' },
                { episode: 5, title: '005.一个简单的效果', duration: 9.85, durationStr: '09:51' },
                { episode: 6, title: '006.OptionsAPI 与 CompositionAPI', duration: 7.5, durationStr: '07:30' },
                { episode: 7, title: '007.setup概述', duration: 12.75, durationStr: '12:45' },
                { episode: 8, title: '008.setup的返回值', duration: 2.82, durationStr: '02:49' },
                { episode: 9, title: '009.setup与OptionsAPI', duration: 6.82, durationStr: '06:49' },
                { episode: 10, title: '010.setup的语法糖', duration: 10.42, durationStr: '10:25' }
                // 这里只显示前10集作为示例，实际应该有71集
            ],
            totalEpisodes: 71,
            totalDuration: 0 // 将在下面计算
        }
    ];
    
    // 计算总时长
    coursesData.forEach(course => {
        course.totalDuration = course.episodes.reduce((sum, ep) => sum + ep.duration, 0);
    });
    
    return coursesData;
}

// 渲染课程表格
function renderCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    tbody.innerHTML = '';
    
    coursesData.forEach((course, courseIndex) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="course-name">${course.name}</td>
            <td>
                <input type="number" 
                       class="episode-input" 
                       min="0" 
                       max="${course.totalEpisodes}" 
                       placeholder="0"
                       data-course-index="${courseIndex}">
            </td>
            <td>
                <div class="progress-text">0分钟 / ${formatDuration(course.totalDuration)}</div>
            </td>
            <td>
                <div class="progress-text">0集/${course.totalEpisodes}集</div>
            </td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">0%</div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 更新汇总统计
function updateSummaryStats() {
    const totalCourses = coursesData.length;
    const totalEpisodes = coursesData.reduce((sum, course) => sum + course.totalEpisodes, 0);
    const totalDuration = coursesData.reduce((sum, course) => sum + course.totalDuration, 0);
    
    document.getElementById('totalCourses').textContent = totalCourses;
    document.getElementById('totalEpisodes').textContent = totalEpisodes;
    document.getElementById('totalDuration').textContent = formatDuration(totalDuration);
}

// 计算学习进度
function calculateProgress() {
    let totalWatchedEpisodes = 0;
    let totalWatchedDuration = 0;
    let totalEpisodes = 0;
    let totalDuration = 0;
    
    coursesData.forEach((course, courseIndex) => {
        const input = document.querySelector(`input[data-course-index="${courseIndex}"]`);
        const watchedEpisodes = parseInt(input.value) || 0;
        
        // 计算已观看的时长
        const watchedDuration = course.episodes
            .slice(0, watchedEpisodes)
            .reduce((sum, ep) => sum + ep.duration, 0);
        
        // 基于时长计算进度百分比
        const progressPercentage = course.totalDuration > 0 ? 
            (watchedDuration / course.totalDuration) * 100 : 0;
        
        // 更新表格显示
        const row = input.closest('tr');
        const progressTexts = row.querySelectorAll('.progress-text');
        const progressFill = row.querySelector('.progress-fill');
        const percentageSpan = row.querySelector('.percentage');
        
        // 更新学习时长比例
        progressTexts[0].textContent = `${formatDuration(watchedDuration)} / ${formatDuration(course.totalDuration)}`;
        
        // 更新学习进度（集数）
        progressTexts[1].textContent = `${watchedEpisodes}集/${course.totalEpisodes}集`;
        
        // 更新进度条和百分比
        progressFill.style.width = `${progressPercentage}%`;
        progressTexts[2].textContent = `${progressPercentage.toFixed(1)}%`;
        
        // 累计总体数据
        totalWatchedEpisodes += watchedEpisodes;
        totalWatchedDuration += watchedDuration;
        totalEpisodes += course.totalEpisodes;
        totalDuration += course.totalDuration;
    });
    
    // 基于时长更新总体进度
    const overallProgress = totalDuration > 0 ? (totalWatchedDuration / totalDuration) * 100 : 0;
    document.getElementById('overallProgress').textContent = `${overallProgress.toFixed(1)}%`;
    
    // 显示详细统计信息
    console.log('学习进度统计:');
    console.log(`已学习集数: ${totalWatchedEpisodes} / ${totalEpisodes}`);
    console.log(`已学习时长: ${formatDuration(totalWatchedDuration)} / ${formatDuration(totalDuration)}`);
    console.log(`基于时长的总体进度: ${overallProgress.toFixed(1)}%`);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadCoursesData();
    
    // 为输入框添加实时计算功能
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('episode-input')) {
            // 延迟计算，避免频繁计算
            clearTimeout(window.calculateTimeout);
            window.calculateTimeout = setTimeout(calculateProgress, 300);
        }
    });
});
