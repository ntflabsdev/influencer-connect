# Test phone validation for influencer registration

echo "=== TESTING PHONE VALIDATION ==="

echo -e "\n1. Testing with valid phone number +1234567890:"
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "password123",
    "name": "Test User 1",
    "phone": "+1234567890"
  }'

echo -e "\n\n2. Testing with phone number with spaces: +1 234 567 890:"
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "password123",
    "name": "Test User 2",
    "phone": "+1 234 567 890"
  }'

echo -e "\n\n3. Testing with phone number with dashes: +1-234-567-890:"
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com",
    "password": "password123",
    "name": "Test User 3",
    "phone": "+1-234-567-890"
  }'

echo -e "\n\n4. Testing with parentheses: +1 (234) 567-890:"
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test4@example.com",
    "password": "password123",
    "name": "Test User 4",
    "phone": "+1 (234) 567-890"
  }'

echo -e "\n\n5. Testing without country code: 1234567890:"
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test5@example.com",
    "password": "password123",
    "name": "Test User 5",
    "phone": "1234567890"
  }'

echo -e "\n\n6. Testing invalid phone (too short): 123:"
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test6@example.com",
    "password": "password123",
    "name": "Test User 6",
    "phone": "123"
  }'

echo -e "\n\n7. Testing invalid phone (contains letters): 123ABC789:"
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test7@example.com",
    "password": "password123",
    "name": "Test User 7",
    "phone": "123ABC789"
  }'

echo -e "\n\n🎉 PHONE VALIDATION TESTING COMPLETE!"