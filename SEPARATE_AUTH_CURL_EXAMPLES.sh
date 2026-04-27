#!/bin/bash

# SEPARATE AUTH FUNCTIONS - CURL TESTING EXAMPLES
# Test the new separate register/login functions for each user type

echo "=== INFLUENCER REGISTRATION ==="
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "influencer@example.com",
    "password": "password123",
    "name": "John Influencer",
    "phone": "+1234567890"
  }'

echo -e "\n\n=== BUSINESS REGISTRATION ==="
curl -X POST "http://localhost:5500/api/auth/business/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business@example.com",
    "password": "password123",
    "companyName": "Test Company Inc",
    "businessDetails": {
      "sector": "Technology",
      "companySize": "11-50",
      "website": "https://testcompany.com",
      "phone": {
        "countryCode": "+1",
        "number": "5551234567"
      }
    },
    "legal": {
      "acceptTerms": true,
      "acceptPrivacyPolicy": true
    }
  }'

echo -e "\n\n=== ADMIN REGISTRATION ==="
curl -X POST "http://localhost:5500/api/auth/admin/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpassword123",
    "name": "Admin User",
    "department": "operations"
  }'

echo -e "\n\n=== INFLUENCER LOGIN ==="
curl -X POST "http://localhost:5500/api/auth/influencer/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "influencer@example.com",
    "password": "password123"
  }'

echo -e "\n\n=== BUSINESS LOGIN ==="
curl -X POST "http://localhost:5500/api/auth/business/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business@example.com",
    "password": "password123"
  }'

echo -e "\n\n=== ADMIN LOGIN ==="
curl -X POST "http://localhost:5500/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpassword123"
  }'

echo -e "\n\n=== TESTING VALIDATION (Missing Email) ==="
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123",
    "name": "Test User"
  }'

echo -e "\n\n=== TESTING VALIDATION (Weak Password) ==="
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123",
    "name": "Test User"
  }'

echo -e "\n\n🎉 SEPARATE AUTH FUNCTIONS TESTING COMPLETE!"
echo "Expected responses:"
echo "- Registration: 201 Created with tokens and user data"
echo "- Login: 200 OK with fresh tokens"
echo "- Validation errors: 400 Bad Request with error details"