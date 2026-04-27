# Influencer Profile Management API Documentation

## Overview
This document describes the API endpoints for managing influencer profiles in the Influencer Connect platform.

## Base URL
```
http://localhost:5500/api/influencer
```

## Authentication
All profile management endpoints require Bearer token authentication with `influencer` role.

## Profile Update Endpoint

### PUT /profile
Update the authenticated influencer's profile information.

#### Request Body
```json
{
  "profileImage": "https://example.com/profile.jpg",
  "username": "influencer_username",
  "bio": "Professional fashion and lifestyle influencer",
  "contentCategories": ["Fashion", "Lifestyle", "Beauty"],
  "contentTypes": ["Posts", "Stories", "Reels"],
  "contactInfo": {
    "secondaryEmail": "contact@example.com",
    "location": "Madrid, Spain",
    "website": "https://mywebsite.com",
    "instagram": "@myinstagram",
    "tiktok": "@mytiktok"
  },
  "location": {
    "city": "Madrid",
    "country": "Spain",
    "state": "Madrid",
    "coordinates": [-3.7038, 40.4168]
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profileImage` | string | No | URL to profile image/avatar |
| `username` | string | No | Unique username (3-30 chars, alphanumeric + underscore) |
| `bio` | string | No | Profile bio/description (max 500 chars) |
| `contentCategories` | array | No | Array of content categories |
| `contentTypes` | array | No | Array of content types (Posts, Stories, Reels, etc.) |
| `contactInfo.secondaryEmail` | string | No | Secondary email address |
| `contactInfo.location` | string | No | Location string for display |
| `contactInfo.website` | string | No | Personal website URL |
| `contactInfo.instagram` | string | No | Instagram username/handle |
| `contactInfo.tiktok` | string | No | TikTok username/handle |
| `location.city` | string | No | City for geolocation |
| `location.country` | string | No | Country for geolocation |
| `location.state` | string | No | State/region for geolocation |
| `location.coordinates` | array | No | [longitude, latitude] coordinates |

#### Validation Rules

- **username**: 3-30 characters, alphanumeric and underscores only, must be unique
- **bio**: Maximum 500 characters
- **contentCategories**: Array of strings
- **contentTypes**: Array of strings
- **secondaryEmail**: Valid email format
- **website**: Valid URL format
- **coordinates**: Array of exactly 2 numbers [lng, lat]

#### Response (200)
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "influencer_id",
    "name": "Full Name",
    "email": "primary@email.com",
    "role": "influencer",
    "profileImage": "https://example.com/profile.jpg",
    "username": "influencer_username",
    "bio": "Professional fashion and lifestyle influencer",
    "contentCategories": ["Fashion", "Lifestyle", "Beauty"],
    "contentTypes": ["Posts", "Stories", "Reels"],
    "contactInfo": {
      "email": "primary@email.com",
      "phone": "+1234567890",
      "secondaryEmail": "contact@example.com",
      "location": "Madrid, Spain",
      "website": "https://mywebsite.com",
      "instagram": "@myinstagram",
      "tiktok": "@mytiktok"
    },
    "location": {
      "city": "Madrid",
      "country": "Spain",
      "state": "Madrid",
      "coordinates": [-3.7038, 40.4168]
    },
    "statistics": {
      "totalFollowers": 50000,
      "totalEngagement": 2500,
      "averageEngagementRate": 5.0,
      "completedCollaborations": 25,
      "activeCollaborations": 3,
      "totalEarnings": 15000,
      "rating": 4.7,
      "ratingCount": 18
    },
    "portfolio": 12,
    "status": "active",
    "isVerified": true,
    "verificationStatus": {
      "emailVerified": true,
      "phoneVerified": true,
      "socialVerified": true,
      "identityVerified": false
    },
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Profile Retrieval Endpoints

### GET /profile
Get the authenticated influencer's full profile information.

### GET /public/profile/:userId
Get a public view of any influencer's profile (limited information).

## Content Categories Endpoint

### GET /categories
Get the list of available content categories for influencers.

#### Response (200)
```json
{
  "categories": [
    "Fashion",
    "Beauty",
    "Lifestyle",
    "Travel",
    "Food",
    "Fitness",
    "Technology",
    "Gaming",
    "Art",
    "Music",
    "Sports",
    "Business",
    "Education",
    "Health",
    "Photography",
    "Dance",
    "Comedy",
    "Motivation",
    "Reviews",
    "DIY"
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 404 Not Found
```json
{
  "message": "Influencer not found"
}
```

### 409 Conflict
```json
{
  "message": "Username already taken"
}
```

## Rate Limiting
- Profile operations: 50 requests per 15 minutes per influencer

## Notes

1. **Statistics Update**: The system automatically updates follower statistics when social media accounts are connected and synced.

2. **Geolocation**: Location coordinates enable geospatial search and filtering capabilities.

3. **Social Media Integration**: Instagram and TikTok handles are stored separately from API-connected accounts for manual entry.

4. **Portfolio**: The portfolio count shows the number of content items in the influencer's portfolio (full portfolio data is available in detailed profile view).

5. **Verification Status**: Multiple verification levels track email, phone, social media, and identity verification status.