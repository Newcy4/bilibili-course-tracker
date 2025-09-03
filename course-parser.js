/*
 * @Author: Newcy4 newcy44@gmail.com
 * @Date: 2025-09-03 18:05:36
 * @LastEditors: Newcy4 newcy44@gmail.com
 * @LastEditTime: 2025-09-03 18:09:11
 * @FilePath: /bilibili课程计算助手/course-parser.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 课程数据解析器
// 课程数据解析器
class CourseParser {
    constructor() {
        this.coursesData = [];
    }

    // 解析时长字符串为分钟数
    parseDuration(durationStr) {
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

    // 解析HTML文件中的课程数据
    parseCourseHTML(htmlContent, courseName) {
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
                const durationMinutes = this.parseDuration(duration);
                
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

    // 从实际HTML文件加载课程数据
    async loadFromHTMLFiles() {
        const courseFiles = [
            { name: '珠峰vue3课程', file: 'courses/珠峰vue3课程.html' },
            { name: '禹神vue3课程', file: 'courses/禹神vue3课程.html' }
        ];
        
        this.coursesData = [];
        
        for (const courseFile of courseFiles) {
            try {
                const response = await fetch(courseFile.file);
                if (response.ok) {
                    const htmlContent = await response.text();
                    const courseData = this.parseCourseHTML(htmlContent, courseFile.name);
                    this.coursesData.push(courseData);
                    console.log(`成功加载课程: ${courseFile.name}, 共${courseData.totalEpisodes}集`);
                } else {
                    console.warn(`无法加载课程文件: ${courseFile.file}`);
                }
            } catch (error) {
                console.error(`加载课程文件失败: ${courseFile.file}`, error);
            }
        }
        
        return this.coursesData;
    }

    // 获取课程数据
    getCoursesData() {
        return this.coursesData;
    }
}