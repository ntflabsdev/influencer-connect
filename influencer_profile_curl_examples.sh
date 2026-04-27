# Influencer Profile Update - Curl Command Examples
# Replace YOUR_ACCESS_TOKEN_HERE with the actual JWT token

echo "=== Full Profile Update ==="
curl -X PUT "http://localhost:5500/api/influencer/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "profileImage": "https://example.com/new-profile.jpg",
    "username": "fashion_influencer_2024",
    "bio": "Professional fashion and lifestyle influencer | Madrid based | DM for collaborations",
    "contentCategories": ["Fashion", "Lifestyle", "Beauty"],
    "contentTypes": ["Posts", "Stories", "Reels"],
    "contactInfo": {
      "secondaryEmail": "business@fashioninfluencer.com",
      "location": "Madrid, Spain",
      "website": "https://fashioninfluencer.com",
      "instagram": "@fashion_influencer",
      "tiktok": "@fashion_influencer"
    },
    "location": {
      "city": "Madrid",
      "country": "Spain",
      "state": "Madrid",
      "coordinates": [-3.7038, 40.4168]
    }
  }'

echo -e "\n\n=== Minimal Update - Username & Bio Only ==="
curl -X PUT "http://localhost:5500/api/influencer/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "username": "new_username",
    "bio": "Updated bio description"
  }'

echo -e "\n\n=== Update Social Media Handles Only ==="
curl -X PUT "http://localhost:5500/api/influencer/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "contactInfo": {
      "instagram": "@new_instagram_handle",
      "tiktok": "@new_tiktok_handle"
    }
  }'

echo -e "\n\n=== Update Location Only ==="
curl -X PUT "http://localhost:5500/api/influencer/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "contactInfo": {
      "location": "Barcelona, Spain"
    },
    "location": {
      "city": "Barcelona",
      "country": "Spain",
      "coordinates": [2.1734, 41.3851]
    }
  }'

echo -e "\n\n=== Update Content Categories Only ==="
curl -X PUT "http://localhost:5500/api/influencer/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "contentCategories": ["Travel", "Food", "Photography"],
    "contentTypes": ["Posts", "Reels", "Stories"]
  }'

echo -e "\n\n=== Update Profile Image Only ==="
curl -X PUT "http://localhost:5500/api/influencer/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "profileImage": "https://example.com/new-avatar.jpg"
  }'