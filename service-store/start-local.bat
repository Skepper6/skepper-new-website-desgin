@echo off
rem Starts the store on this computer. Its database is its own: port 3399, data in .local\mysql
cd /d "%~dp0"
netstat -ano | findstr /r /c:"127.0.0.1:3399 .*LISTENING" >nul || start "Skepper store database" /min C:\xampp\mysql\bin\mysqld.exe --defaults-file="%~dp0.local\mysql\my.ini" --console
timeout /t 5 /nobreak >nul
if not exist dist\index.html call npm run build
start "" http://127.0.0.1:8099/
C:\xampp\php\php.exe -d upload_max_filesize=50M -d post_max_size=220M -S 127.0.0.1:8099 router.php
