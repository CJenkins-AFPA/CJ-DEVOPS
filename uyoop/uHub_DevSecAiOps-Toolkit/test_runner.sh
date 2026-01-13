#!/bin/bash
set -e

echo "Starting Test..."

# Login
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/login/access-token" -F "username=demo-admin" -F "password=demo-admin" | jq -r .access_token)
echo "Token: ${TOKEN:0:10}..."

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then 
    echo "Login failed"
    exit 1
fi

# Create Job
echo "Creating Job..."
JOB_JSON=$(curl -s -X POST "http://localhost:8000/api/v1/projects/1/jobs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Runner Test Script",
    "command": "echo Success Runner && date",
    "working_dir": "/app",
    "job_type": "ops",
    "command_type": "shell",
    "environment_id": 1,
    "planned_start": "2026-01-20T10:00:00Z"
  }')

JOB_ID=$(echo $JOB_JSON | jq -r .id)
echo "Job ID: $JOB_ID"

if [ "$JOB_ID" == "null" ] || [ -z "$JOB_ID" ]; then
    echo "Job Creation Failed: $JOB_JSON"
    exit 1
fi

# Run Job
echo "Running Job $JOB_ID..."
RUN_RESP=$(curl -s -X POST "http://localhost:8000/api/v1/jobs/$JOB_ID/run" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Run Response: $RUN_RESP"

RUN_ID=$(echo $RUN_RESP | jq -r .id)

# Check
sleep 2
echo "Checking Status..."
JOB_STATUS=$(curl -s -X GET "http://localhost:8000/api/v1/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -r .status)

echo "Job Final Status: $JOB_STATUS"

if [ "$JOB_STATUS" == "success" ]; then
    echo "✅ TEST PASSED"
else
    echo "❌ TEST FAILED"
fi
