#!/bin/bash

# StartPoint Health Monitoring Script
# Usage: ./scripts/health-check.sh

# Configuration  
PRODUCTION_URL="https://startpoint-aezovis7y-epoche.vercel.app"
HEALTH_ENDPOINT="$PRODUCTION_URL/api/health"
LOG_FILE="./logs/health-check.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 StartPoint Health Check - $(date)"
echo "========================================"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Test 1: Basic connectivity
echo -n "📡 Testing connectivity... "
if curl -s --connect-timeout 10 "$PRODUCTION_URL" > /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    log_message "✓ Connectivity test passed"
else
    echo -e "${RED}✗ FAIL${NC}"
    log_message "✗ Connectivity test failed"
    exit 1
fi

# Test 2: Health endpoint
echo -n "🏥 Testing health endpoint... "
HEALTH_RESPONSE=$(curl -s --connect-timeout 10 "$HEALTH_ENDPOINT")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status' 2>/dev/null)

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✓ HEALTHY${NC}"
    log_message "✓ Health check passed"
    
    # Extract metrics
    RESPONSE_TIME=$(echo "$HEALTH_RESPONSE" | jq -r '.metrics.responseTime' 2>/dev/null)
    DB_TIME=$(echo "$HEALTH_RESPONSE" | jq -r '.metrics.database.responseTime' 2>/dev/null)
    TOTAL_USERS=$(echo "$HEALTH_RESPONSE" | jq -r '.metrics.system.totalUsers' 2>/dev/null)
    TOTAL_TASKS=$(echo "$HEALTH_RESPONSE" | jq -r '.metrics.system.totalTasks' 2>/dev/null)
    TODO_TASKS=$(echo "$HEALTH_RESPONSE" | jq -r '.metrics.system.todoTasks' 2>/dev/null)
    
    echo "📊 System Metrics:"
    echo "   • Response Time: $RESPONSE_TIME"
    echo "   • Database Time: $DB_TIME"
    echo "   • Total Users: $TOTAL_USERS"
    echo "   • Total Tasks: $TOTAL_TASKS"
    echo "   • Todo Tasks: $TODO_TASKS"
    
    log_message "📊 Metrics - Response: $RESPONSE_TIME, DB: $DB_TIME, Users: $TOTAL_USERS, Tasks: $TOTAL_TASKS, Todo: $TODO_TASKS"
else
    echo -e "${RED}✗ UNHEALTHY${NC}"
    echo "Error: $HEALTH_RESPONSE"
    log_message "✗ Health check failed: $HEALTH_RESPONSE"
    exit 1
fi

# Test 3: Security headers
echo -n "🛡️  Testing security headers... "
HEADERS=$(curl -I -s --connect-timeout 10 "$PRODUCTION_URL")

if echo "$HEADERS" | grep -q "X-Frame-Options: DENY" && 
   echo "$HEADERS" | grep -q "strict-transport-security"; then
    echo -e "${GREEN}✓ PASS${NC}"
    log_message "✓ Security headers present"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    log_message "⚠ Some security headers missing"
fi

# Test 4: Performance check
echo -n "⚡ Performance test... "
START_TIME=$(date +%s%N)
curl -s --connect-timeout 10 "$PRODUCTION_URL" > /dev/null
END_TIME=$(date +%s%N)
LOAD_TIME=$((($END_TIME - $START_TIME)/1000000))

if [ $LOAD_TIME -lt 2000 ]; then
    echo -e "${GREEN}✓ FAST (${LOAD_TIME}ms)${NC}"
    log_message "✓ Performance good: ${LOAD_TIME}ms"
elif [ $LOAD_TIME -lt 5000 ]; then
    echo -e "${YELLOW}⚠ SLOW (${LOAD_TIME}ms)${NC}"
    log_message "⚠ Performance slow: ${LOAD_TIME}ms"
else
    echo -e "${RED}✗ VERY SLOW (${LOAD_TIME}ms)${NC}"
    log_message "✗ Performance poor: ${LOAD_TIME}ms"
fi

echo ""
echo -e "${BLUE}🎉 Health check completed!${NC}"
echo "📄 Logs saved to: $LOG_FILE"
echo "🌐 Production URL: $PRODUCTION_URL"
echo "🔗 Health Endpoint: $HEALTH_ENDPOINT"

log_message "Health check completed successfully" 