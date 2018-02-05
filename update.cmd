@echo off
set execpath=%~0
cd /D "%execpath%/.."
echo In folder %CD%.
echo Script file is %execpath%.
echo Pulling chanages from Git ...
cmd /C git pull
echo.
echo Ready to build:
if not "%1"=="q" if not "%1"=="Q" pause

if not "%VS150ENTCOMNTOOLS%"=="" set VSTools=%VS150ENTCOMNTOOLS%& set VSVer=2017& goto build
if not "%VS150COMNTOOLS%"=="" set VSTools=%VS150COMNTOOLS%& set VSVer=2017& goto build
echo Error: Visual Studio version not detected; could not build the project. Please build manually.
goto :end

:build
call "%VSTools%VsDevCmd.bat"
echo Visual Studio developer prompt environment was setup successfully!
echo.

cd /D "%execpath%/.."

cmd /C msbuild CoreXT.sln /p:Configuration=Debug /clp:ErrorsOnly
echo.
echo Build process completed.

:end
if not "%1"=="q" if not "%1"=="Q" pause
