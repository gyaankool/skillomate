#!/bin/bash

# Simple Skillomate AI Test Runner
set -e

echo "🚀 Starting Skillomate AI Tests"
echo "================================"

# Check if in correct directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found. Run from skillomate-AI directory"
    exit 1
fi

# Check if server is running
if ! curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "⚠️  Server not running. Please start with: python3 app.py"
    echo "💡 Starting server in background..."
    python3 app.py &
    sleep 3
fi

# Run tests
echo "🧪 Running comprehensive tests..."
python3 test_complete_ai_flow.py

echo "✅ Test execution complete!"
echo "📊 Check test_results.log for detailed results"
