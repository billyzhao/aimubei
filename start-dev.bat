@echo off
chcp 65001 >nul 2>&1
set NODE_OPTIONS=--input-type=UTF-8
cd /d "D:\my program\workbuddy\start\aimubei"
"C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2\node.exe" node_modules\next\dist\bin\next dev
