@echo off
echo Starting..
:main
node -r dotenv/config ./prod/index.js
echo Restarting Bot..
goto main