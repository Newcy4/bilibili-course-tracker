# pm2 启动服务脚本

APP_NAME="bilibili-course-tracker"
APP_FILE="server.js"

echo ">>> 停止并删除旧进程（如果存在）"
pm2 delete $APP_NAME 2>/dev/null

echo ">>> 启动 $APP_NAME"
pm2 start $APP_FILE --name $APP_NAME

echo ">>> 保存进程列表"
pm2 save

echo ">>> 设置开机自启"
pm2 startup -u $USER --hp $HOME
