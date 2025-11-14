@echo off
REM ========================================
REM GitHub Upload Verification Script
REM Bruno Collection Agent
REM ========================================

echo.
echo ========================================
echo   GitHub Upload Verification
echo ========================================
echo.

REM Check if sensitive files exist
echo [1/5] Checking for sensitive files...
if exist "getContractSummary-config.json" (
    echo    [ERROR] Found: getContractSummary-config.json
    echo    Please delete this file before uploading!
    set ERRORS=1
) else (
    echo    [OK] No sensitive config files found
)

if exist ".playwright-mcp" (
    echo    [ERROR] Found: .playwright-mcp directory
    echo    Please delete this directory before uploading!
    set ERRORS=1
) else (
    echo    [OK] No temporary directories found
)

echo.
echo [2/5] Verifying project structure...
if exist "docs\" (
    echo    [OK] docs/ folder exists
) else (
    echo    [ERROR] docs/ folder missing
    set ERRORS=1
)

if exist "examples\" (
    echo    [OK] examples/ folder exists
) else (
    echo    [ERROR] examples/ folder missing
    set ERRORS=1
)

if exist ".github\workflows\" (
    echo    [OK] .github/workflows/ folder exists
) else (
    echo    [ERROR] .github/workflows/ folder missing
    set ERRORS=1
)

echo.
echo [3/5] Checking essential files...
if exist "README.md" (
    echo    [OK] README.md exists
) else (
    echo    [ERROR] README.md missing
    set ERRORS=1
)

if exist "LICENSE" (
    echo    [OK] LICENSE exists
) else (
    echo    [ERROR] LICENSE missing
    set ERRORS=1
)

if exist "CONTRIBUTING.md" (
    echo    [OK] CONTRIBUTING.md exists
) else (
    echo    [ERROR] CONTRIBUTING.md missing
    set ERRORS=1
)

if exist ".gitignore" (
    echo    [OK] .gitignore exists
) else (
    echo    [ERROR] .gitignore missing
    set ERRORS=1
)

if exist "package.json" (
    echo    [OK] package.json exists
) else (
    echo    [ERROR] package.json missing
    set ERRORS=1
)

echo.
echo [4/5] Checking documentation...
if exist "docs\BRUNO_QUICK_START.md" (
    echo    [OK] Quick Start guide exists
) else (
    echo    [ERROR] Quick Start guide missing
    set ERRORS=1
)

if exist "docs\ARCHITECTURE.md" (
    echo    [OK] Architecture doc exists
) else (
    echo    [ERROR] Architecture doc missing
    set ERRORS=1
)

echo.
echo [5/5] Checking examples...
if exist "examples\sample-config.json" (
    echo    [OK] Sample config exists
) else (
    echo    [ERROR] Sample config missing
    set ERRORS=1
)

echo.
echo ========================================
if defined ERRORS (
    echo   STATUS: FAILED - Please fix errors above
    echo ========================================
    exit /b 1
) else (
    echo   STATUS: PASSED - Ready for GitHub!
    echo ========================================
    echo.
    echo Next Steps:
    echo   1. Run: git init
    echo   2. Run: git add .
    echo   3. Run: git commit -m "Initial commit: v2.0.0"
    echo   4. Create repository on GitHub
    echo   5. Run: git remote add origin YOUR_REPO_URL
    echo   6. Run: git push -u origin main
    echo.
    echo See GITHUB_UPLOAD_GUIDE.md for detailed instructions
    echo.
)

pause
