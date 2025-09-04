// todo: 解决某些连接解析失败的情况，比如https://www.bilibili.com/video/BV1atCRYsE7x/?spm_id_from=333.337.search-card.all.click

courseIdArr =  [];  //课程id 数组
// 课程数据存储
coursesData = [];

// 本地存储的键名
const STORAGE_KEY = 'bilibili-course-progress';

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

// 保存学习进度到本地存储
function saveProgressToLocal() {
    const progressData = {};
    
    coursesData.forEach((course, courseIndex) => {
        const input = document.querySelector(`input[data-course-index="${courseIndex}"]`);
        const watchedEpisodes = parseInt(input.value) || 0;
        
        // 使用课程名称作为键，保存已看集数
        progressData[course.name] = watchedEpisodes;
    });
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        console.log('学习进度已保存到本地存储');
    } catch (error) {
        console.error('保存学习进度失败:', error);
    }
}

// 从本地存储加载学习进度
function loadProgressFromLocal() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const progressData = JSON.parse(savedData);
            console.log('从本地存储加载学习进度:', progressData);
            return progressData;
        }
    } catch (error) {
        console.error('加载本地学习进度失败:', error);
    }
    return {};
}

// 清除本地存储的学习进度
function clearLocalProgress() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('已清除本地存储的学习进度');
        
        // 重置所有输入框
        document.querySelectorAll('.episode-input').forEach(input => {
            input.value = '';
        });
        
        // 重新计算进度
        calculateProgress();
    } catch (error) {
        console.error('清除本地存储失败:', error);
    }
}

// // 加载课程数据
// async function loadCoursesData() {
//     try {
//         // 尝试加载JSON文件
//         const response = await fetch('courses-data.json');
//         if (response.ok) {
//             coursesData = await response.json();
//             console.log('成功加载课程数据:', coursesData.length, '个课程');
            
//             // 隐藏加载提示，显示内容
//             document.getElementById('loading').style.display = 'none';
//             document.getElementById('content').style.display = 'block';
            
//             renderCoursesTable();
//             updateSummaryStats();
            
//             // 加载保存的学习进度
//             loadAndApplyProgress();
//         } else {
//             throw new Error('无法加载课程数据文件');
//         }
//     } catch (error) {
//         console.error('加载课程数据失败:', error);
        
//         // 显示错误信息
//         document.getElementById('loading').style.display = 'none';
//         document.getElementById('error').style.display = 'block';
//     }
// }

function compareCourseIdArrAndCoursesData() {
    const CoursesDataIdArr = coursesData.map(course => course.courseId);
    console.log("CoursesDataIdArr", CoursesDataIdArr);
    for (let i = 0; i < courseIdArr.length; i++) {
        const courseId = courseIdArr[i];
        if(!CoursesDataIdArr.includes(courseId)) {
            console.log('存在未解析的courseId', courseId);
            return false
        } 
    }
    return true;
}

// 调用http://localhost:8000/api/bilibili，传入{"courseIdArr":["BV1Za4y1r7KE", "BV1ay421q7KG"]}参数，将获取到的课程列表 localstorage 中
async function loadCoursesFromBilibili() {
    console.log('开始加载课程数据', courseIdArr);
    console.log('本地缓存课程数据', coursesData);
    // 如果本地有缓存就不请求了
    if (compareCourseIdArrAndCoursesData()) {
        // 隐藏加载提示，显示内容
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        renderCoursesTable();
        updateSummaryStats();

        // 加载保存的学习进度
        loadAndApplyProgress();
        return;
    }
    try {
        const response = await fetch('http://localhost:8000/api/bilibili', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseIdArr: courseIdArr }),
        });
        console.log("response", response)
        console.log("response.ok", response.ok)
        if (response.ok) {
            coursesHtmlListRes = await response.json();
            let errorIdArr = coursesHtmlListRes.errorList.map(item => item.courseId)
            let errorCourseNameArr = coursesHtmlListRes.errorList.map(item => item.name)
            console.log("errorIdArr", errorIdArr)
            // 如果存在有问题的，就剔除
            if(errorIdArr.length > 0) {
                alert(`以下课程解析失败：\n${errorCourseNameArr.join('\n')}`);
                courseIdArr = courseIdArr.filter(item => !errorIdArr.includes(item))
                localStorage.setItem('courseIdArr', JSON.stringify(courseIdArr))
                console.log("剔除有问题的courseId后，已经剔除，courseIdArr", courseIdArr)
            }
            coursesData = generateCoursesData(coursesHtmlListRes.htmlList)
            console.log('成功加载课程数据:', coursesData.length, '个课程');
            localStorage.setItem('coursesData', JSON.stringify(coursesData));
            
            // 隐藏加载提示，显示内容
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';

            renderCoursesTable();
            updateSummaryStats();
            
            // 加载保存的学习进度
            loadAndApplyProgress();
        } else {
            throw new Error('无法加载课程数据文件');
        }
    } catch (error) {
        console.error('加载课程数据失败:', error);
        
        // 显示错误信息
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
    
}

// 加载并应用保存的学习进度
function loadAndApplyProgress() {
    const savedProgress = loadProgressFromLocal();
    
    coursesData.forEach((course, courseIndex) => {
        const input = document.querySelector(`input[data-course-index="${courseIndex}"]`);
        const savedEpisodes = savedProgress[course.name];
        
        if (savedEpisodes && savedEpisodes > 0) {
            input.value = savedEpisodes;
        }
    });
    
    // 计算并显示进度
    calculateProgress();
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
            <td>
                <button class="control-btn delete-btn" onclick="deleteCourse(${courseIndex})">🗑️</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 删除课程
function deleteCourse(courseIndex) {
    if (confirm('确定要删除这个课程吗？此操作不可撤销。')) {
        // 从coursesData数组中删除课程
        coursesData.splice(courseIndex, 1);
        
        // 从courseIdArr数组中删除对应的课程ID
        if (courseIndex < courseIdArr.length) {
            courseIdArr.splice(courseIndex, 1);
        }
        
        // 更新本地存储
        localStorage.setItem('coursesData', JSON.stringify(coursesData));
        localStorage.setItem('courseIdArr', JSON.stringify(courseIdArr));
        
        // 重新渲染表格
        renderCoursesTable();
        
        // 重新计算进度
        calculateProgress();
        
        // 更新汇总统计
        updateSummaryStats();
        
        console.log('课程已删除，剩余课程数:', coursesData.length);
    }
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
    document.getElementById('totalWatchedDuration').textContent = `${formatDuration(totalWatchedDuration)}`;
    
    // 显示详细统计信息
    console.log('学习进度统计:');
    console.log(`已学习集数: ${totalWatchedEpisodes} / ${totalEpisodes}`);
    console.log(`已学习时长: ${formatDuration(totalWatchedDuration)} / ${formatDuration(totalDuration)}`);
    console.log(`基于时长的总体进度: ${overallProgress.toFixed(1)}%`);
}

function initGlobalData() {
    courseIdArr = JSON.parse(localStorage.getItem('courseIdArr')) || [];  //课程id 数组
    coursesData = JSON.parse(localStorage.getItem('coursesData')) || [];  //课程数据 数组
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initGlobalData()
    
    loadCoursesFromBilibili();
    
    // 初始化控制按钮
    initializeControlButtons();    
    // 为输入框添加实时计算和保存功能
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('episode-input')) {
            // 延迟计算，避免频繁计算
            clearTimeout(window.calculateTimeout);
            window.calculateTimeout = setTimeout(() => {
                calculateProgress();
                saveProgressToLocal(); // 自动保存到本地存储
            }, 300);
        }
    });
    
    // 添加清除按钮事件监听器
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+C 清除所有进度
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            if (confirm('确定要清除所有学习进度吗？此操作不可撤销。')) {
                clearLocalProgress();
            }
        }
    });
});

// 导出学习进度为JSON文件
function exportProgress() {
    const progressData = {};
    
    coursesData.forEach((course, courseIndex) => {
        const input = document.querySelector(`input[data-course-index="${courseIndex}"]`);
        const watchedEpisodes = parseInt(input.value) || 0;
        progressData[course.name] = watchedEpisodes;
    });
    
    // 添加导出时间戳
    const exportData = {
        exportTime: new Date().toISOString(),
        progress: progressData
    };
    
    // 创建下载链接
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bilibili-course-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('学习进度已导出');
}

// 导入学习进度
function importProgress(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            let progressData = importData.progress || importData; // 兼容旧格式
            
            let importedCount = 0;
            coursesData.forEach((course, courseIndex) => {
                const input = document.querySelector(`input[data-course-index="${courseIndex}"]`);
                const savedEpisodes = progressData[course.name];
                
                if (savedEpisodes && savedEpisodes > 0) {
                    input.value = savedEpisodes;
                    importedCount++;
                }
            });
            
            // 重新计算进度并保存
            calculateProgress();
            saveProgressToLocal();
            
            alert(`成功导入 ${importedCount} 个课程的学习进度！`);
            console.log('学习进度导入成功:', progressData);
        } catch (error) {
            alert('导入失败：文件格式不正确');
            console.error('导入进度失败:', error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // 清空文件选择
}

// 添加按钮事件监听器
function initializeControlButtons() {
    // 保存按钮
    document.getElementById('saveProgressBtn').addEventListener('click', function() {
        saveProgressToLocal();
        // 显示保存成功提示
        const btn = this;
        const originalText = btn.textContent;
        btn.textContent = '✅ 已保存';
        btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    });
    
    // 清除按钮
    document.getElementById('clearProgressBtn').addEventListener('click', function() {
        if (confirm('确定要清除所有学习进度吗？此操作不可撤销。')) {
            clearLocalProgress();
            
            // 显示清除成功提示
            const btn = this;
            const originalText = btn.textContent;
            btn.textContent = '✅ 已清除';
            
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    });

    // 添加课程逻辑，传入 b 站链接（如：https://www.bilibili.com/video/BV1Za4y1r7KE/?spm_id_from=333.1391.0.0&p=7&vd_source=284f93eab7baf424a1744805616450dc），自动匹配BV1Za4y1r7KE
    function addCourse(event) {
        const input = document.getElementById('addCourseInput');
        const courseUrl = input.value;
        // 匹配video/内容/ 之间的内容
        const courseId = courseUrl.match(/video\/([^/]+)\//)[1];
        console.log('当前课程组内容：', typeof courseIdArr, courseIdArr);
        if(courseIdArr.includes(courseId)) {
            alert('课程已存在');
            input.value = '';
            return;
        }
        courseIdArr.push(courseId);
        console.log('添加课程:', courseId, '当前课程组:', courseIdArr);
        localStorage.setItem('courseIdArr', JSON.stringify(courseIdArr))
        input.value = '';
        // 刷新页面
        window.location.reload();
    }
    
    // 导出按钮
    document.getElementById('exportProgressBtn').addEventListener('click', exportProgress);

    // 添加课程按钮添加课程按钮
    document.getElementById('addCourseBtn').addEventListener('click', addCourse);
    
    // 导入按钮
    document.getElementById('importProgressBtn').addEventListener('click', function() {
        document.getElementById('importProgressFile').click();
    });
    
    // 文件选择器
    document.getElementById('importProgressFile').addEventListener('change', importProgress);
}
