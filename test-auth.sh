#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Authentication Endpoints"
echo "==============================="

# 1. Register first user (MAIN_ADMIN)
echo -e "\n${GREEN}1. Testing First User Registration (MAIN_ADMIN)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "MAIN_ADMIN",
    "phoneNumber": "1234567890",
    "username": "adminuser"
  }')

echo "Response: $REGISTER_RESPONSE"

# Extract token from registration response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Login with the admin user
echo -e "\n${GREEN}2. Testing Admin Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 3. Register a new user using admin token
echo -e "\n${GREEN}3. Testing User Registration with Admin Token${NC}"
REGISTER_USER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "PASSENGER",
    "phoneNumber": "1234567890",
    "username": "testuser"
  }')

echo "Response: $REGISTER_USER_RESPONSE"

# 4. Login with the new user
echo -e "\n${GREEN}4. Testing New User Login${NC}"
NEW_USER_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }')

echo "Response: $NEW_USER_LOGIN_RESPONSE"

# Extract token from new user login response
NEW_USER_TOKEN=$(echo $NEW_USER_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 5. Get user profile
echo -e "\n${GREEN}5. Testing Get Profile${NC}"
PROFILE_RESPONSE=$(curl -s -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $NEW_USER_TOKEN")

echo "Response: $PROFILE_RESPONSE"

# 6. Change password
echo -e "\n${GREEN}6. Testing Change Password${NC}"
CHANGE_PASSWORD_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer $NEW_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Test123!",
    "newPassword": "NewTest123!"
  }')

echo "Response: $CHANGE_PASSWORD_RESPONSE"

echo -e "\n${GREEN}Authentication Tests Completed${NC}" 