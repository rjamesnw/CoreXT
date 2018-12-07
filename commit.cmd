@echo off
set msg=%~1
if "%msg%"=="" echo Usage: commit "message" && pause && goto :EOF
echo About to commit using message "%msg%".
echo Make sure you included quotes if your whole message doesn't show above.
pause
REM Note: commit does an add as well (-a). [https://stackoverflow.com/questions/19595067/git-add-commit-and-push-commands-in-one]
git commit -a -m "%msg%" && git push