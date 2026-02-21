#!/bin/bash
# Security Check Script for WeeGym
# Run this before committing code

echo "🔒 Running Security Checks..."
echo "================================"
echo ""

# Check 1: Scan for secrets in staged files
echo "🔍 Checking for secrets in staged files..."
if git diff --cached | grep -E "(password|secret|api_key|private_key|token|credential).*=.*['\"]"; then
    echo "❌ FAIL: Potential secrets found in staged files!"
    exit 1
else
    echo "✅ PASS: No secrets found"
fi
echo ""

# Check 2: Find console.log statements
echo "🐛 Checking for console.log statements..."
if git grep -n "console\.log" src/; then
    echo "⚠️  WARNING: console.log statements found"
    echo "   Consider removing these before production"
else
    echo "✅ PASS: No console.log found"
fi
echo ""

# Check 3: Check for .env files in staging
echo "📁 Checking for .env files in staging..."
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$|\.env\.production$"; then
    echo "❌ FAIL: .env file in staged changes!"
    exit 1
else
    echo "✅ PASS: No .env files staged"
fi
echo ""

# Check 4: NPM Audit
echo "🛡️  Running npm audit..."
if npm audit --audit-level=moderate; then
    echo "✅ PASS: No vulnerabilities found"
else
    echo "⚠️  WARNING: Vulnerabilities detected"
    echo "   Run 'npm audit fix' to resolve"
fi
echo ""

echo "================================"
echo "✅ Security checks complete!"
echo ""
echo "Safe to commit? Review any warnings above."
