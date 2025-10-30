@echo off
echo ========================================
echo Building Twin City Updates APK Locally
echo ========================================
echo.

REM Fix JAVA_HOME if needed (remove extra backslashes)
if defined JAVA_HOME (
    set JAVA_HOME=%JAVA_HOME:\\=\%
)

echo Step 1: Building web version...
call npm run build:web
if errorlevel 1 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Syncing with Capacitor...
call npx cap sync
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Building Android APK (Debug)...
echo This may take several minutes on first build...
cd android

REM Clean previous build
echo Cleaning previous build...
call gradlew.bat clean

REM Build debug APK
echo Building APK...
call gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo ERROR: APK build failed!
    echo.
    echo Common fixes:
    echo 1. Make sure JAVA_HOME is set correctly
    echo 2. Make sure ANDROID_HOME is set correctly
    echo 3. Run: cd android ^&^& .\gradlew.bat clean
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on device:
echo adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause


