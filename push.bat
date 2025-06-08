@echo off
echo Adding all changes...
git add .
echo.
echo Enter your commit message:
set /p commit_message=
echo.
echo Committing changes...
git commit -m "%commit_message%"
echo.
echo Pushing to GitHub...
git push
echo.
echo Done!
pause 