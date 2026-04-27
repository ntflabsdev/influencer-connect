# Influencer Registration with Auto-Generated Username

## Overview
When an influencer registers on the platform, a unique username is automatically generated and assigned to their account. This username is guaranteed to be unique across all user types (admin, business, and influencer).

## How It Works

### Username Generation Process

1. **Base Username Creation**: The system takes the influencer's name and cleans it:
   - Converts to lowercase
   - Removes special characters and spaces
   - Limits to 15 characters maximum

2. **Uniqueness Check**: The system checks if the generated username already exists across:
   - All Influencer accounts
   - All Business accounts
   - All Admin accounts

3. **Conflict Resolution**: If the username exists, the system appends a number:
   - `johnsmith` → `johnsmith1` → `johnsmith2` → etc.

4. **Fallback**: If all attempts fail (unlikely), uses `user{last8digitsofuserid}`

### Examples

| Full Name | Generated Username |
|-----------|-------------------|
| "John Smith" | `johnsmith` |
| "María González" | `mariagonzalez` |
| "John Smith" (when `johnsmith` exists) | `johnsmith1` |
| "John Smith" (when `johnsmith1` exists) | `johnsmith2` |
| "A" | `a` |
| "Very Long Name With Spaces" | `verylongnamewit` (15 chars) |

## API Changes

### Registration Endpoints

#### POST /auth/register (with role: "influencer")
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "influencer",
  "name": "John Smith",
  "phone": "+1234567890",
  "meta": {}
}
```

**Response**: Username is now included in the response
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "influencer",
    "status": "adminpending",
    "username": "johnsmith",  // ← Auto-generated unique username
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Google OAuth Registration
When registering via Google OAuth, the username is also auto-generated:
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "name": "John Smith",
    "email": "john@gmail.com",
    "role": "influencer",
    "status": "active",
    "username": "johnsmith",  // ← Auto-generated unique username
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

## Technical Implementation

### Code Location
- **File**: `src/controllers/auth.controller.js`
- **Functions**:
  - `generateUniqueUsername()` - Generates unique usernames
  - `register()` - Updated to generate username after user creation
  - `googleAuthCallback()` - Updated for Google OAuth users

### Database Changes
No schema changes required. The `username` field already exists in the Influencer model with proper indexing.

### Validation Rules
- Username must be unique across all user types
- Username format: 3-30 characters, alphanumeric + underscores only
- Auto-generated usernames follow the same validation rules

## Benefits

1. **No Manual Input Required**: Users don't need to think of a username
2. **Guaranteed Uniqueness**: No conflicts across all user types
3. **Consistent Format**: All usernames follow the same cleaning rules
4. **SEO Friendly**: Clean, readable usernames
5. **Scalable**: Handles high volumes of registrations

## Edge Cases Handled

1. **Duplicate Names**: Multiple "John Smith" users get `johnsmith`, `johnsmith1`, `johnsmith2`, etc.
2. **Special Characters**: Names like "María José" become `mariajose`
3. **Very Long Names**: Truncated to 15 characters + numbers if needed
4. **Very Short Names**: Minimum 1 character, but validation ensures 3+ chars
5. **Unicode Characters**: Properly handled through regex cleaning

## Testing

### Manual Testing
```bash
# Test registration
curl -X POST "http://localhost:5500/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "influencer",
    "name": "Test User"
  }'
```

### Expected Response
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "influencer",
    "status": "adminpending",
    "username": "testuser",
    "createdAt": "..."
  }
}
```

## Migration Notes

Existing influencers without usernames will keep their accounts as-is. New registrations will automatically get unique usernames.

The system is backward compatible and doesn't affect existing functionality.