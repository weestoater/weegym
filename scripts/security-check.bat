@echo off
REM Security Check Script for WeeGym (Windows)
REM Run this before committing code

echo 🔒 Running Security Checks...
echo ================================
echo.

REM Check 1: NPM security scripts
echo 🔍 Checking for secrets...
call npm run security:scan
if %ERRORLEVEL% NEQ 0 (
    echo ❌ FAIL: Potential secrets found!
    exit /b 1
)
echo.

REM Check 2: Console.log check
echo 🐛 Checking for console.log statements...
call npm run security:console
echo.

REM Check 3: NPM Audit
echo 🛡️  Running npm audit...
call npm run security:audit
echo.

echo ================================
echo ✅ Security checks complete!
echo.
echo Safe to commit? Review any warnings above.
