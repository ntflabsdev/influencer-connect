# SEPARATE AUTH FUNCTIONS - INFLUENCER CONNECT

## Overview
The authentication system has been refactored to use separate functions for each user type (Influencer, Business, Admin) instead of a single generic function with role overrides. This improves code maintainability, type safety, and separation of concerns.

## Architecture Changes

### Before (Generic Functions)
```javascript
// Single function with role override
register(req, res, next, 'influencer')  // Old way
login(req, res, next, 'business')       // Old way
```

### After (Separate Functions)
```javascript
// Dedicated functions for each role
registerInfluencer(req, res, next)      // New way
registerBusiness(req, res, next)        // New way
registerAdmin(req, res, next)           // New way
loginInfluencer(req, res, next)         // New way
loginBusiness(req, res, next)           // New way
loginAdmin(req, res, next)              // New way
```

---

## 1. REGISTRATION FUNCTIONS

### 1.1 Influencer Registration
**Function:** `registerInfluencer`  
**Route:** `POST /api/auth/influencer/register`

#### Request Body
```json
{
  "email": "john.smith@example.com",
  "password": "password123",
  "name": "John Smith",
  "phone": "+1234567890",
  "meta": {
    "instagram": "@johnsmith",
    "tiktok": "@johnsmith",
    "followers": 50000
  }
}
```

#### Process
1. **Email Uniqueness Check** - Verifies email doesn't exist in any user type
2. **Data Validation** - Validates all input fields
3. **User Creation** - Creates Influencer document with complete schema
4. **Username Generation** - Auto-generates unique username (e.g., "johnsmith")
5. **Token Issuance** - Creates access & refresh tokens
6. **Email Verification** - Sends verification email (commented out)

#### Response (201)
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "influencer",
    "status": "adminpending",
    "username": "johnsmith",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 1.2 Business Registration
**Function:** `registerBusiness`  
**Route:** `POST /api/auth/business/register`

#### Request Body
```json
{
  "email": "contact@company.com",
  "password": "securepass123",
  "companyName": "Fashion Brand Inc",
  "businessDetails": {
    "sector": "Fashion & Retail",
    "companySize": "11-50",
    "website": "https://fashionbrand.com",
    "phone": {
      "countryCode": "+1",
      "number": "5551234567"
    }
  },
  "legal": {
    "acceptTerms": true,
    "acceptPrivacyPolicy": true
  }
}
```

#### Process
1. **Email Uniqueness Check** - Verifies email doesn't exist in any user type
2. **Business Data Validation** - Validates company details and legal info
3. **User Creation** - Creates Business document with complete schema
4. **Contact Info Setup** - Properly structures address and contact information
5. **Token Issuance** - Creates access & refresh tokens
6. **Email Verification** - Sends verification email

#### Response (201)
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "business_id",
    "name": "Fashion Brand Inc",
    "email": "contact@company.com",
    "role": "business",
    "status": "adminpending",
    "businessName": "Fashion Brand Inc",
    "category": "Fashion & Retail",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 1.3 Admin Registration
**Function:** `registerAdmin`  
**Route:** `POST /api/auth/admin/register`

#### Request Body
```json
{
  "email": "admin@company.com",
  "password": "verysecurepassword123",
  "name": "Admin User",
  "department": "operations",
  "adminData": {
    "role": "admin"
  }
}
```

#### Process
1. **Email Uniqueness Check** - Verifies email doesn't exist in any user type
2. **Admin Data Validation** - Validates department and admin role
3. **User Creation** - Creates Admin document with proper permissions
4. **Auto-Activation** - Admin accounts are active immediately (no admin approval needed)
5. **Token Issuance** - Creates access & refresh tokens

#### Response (201)
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "admin_id",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "admin",
    "status": "active",
    "adminRole": "admin",
    "department": "operations",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 2. LOGIN FUNCTIONS

### 2.1 Influencer Login
**Function:** `loginInfluencer`  
**Route:** `POST /api/auth/influencer/login`

#### Request Body
```json
{
  "email": "john.smith@example.com",
  "password": "password123"
}
```

#### Process
1. **Email Lookup** - Finds influencer by email
2. **Password Verification** - Compares hashed passwords
3. **Status Check** - Verifies account is active (not suspended/adminpending)
4. **Login Tracking** - Updates lastActive and loginCount
5. **Token Issuance** - Creates new access & refresh tokens

#### Response (200)
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "user": {
    "id": "user_id",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "influencer",
    "status": "active",
    "username": "johnsmith",
    "verificationStatus": {
      "emailVerified": true,
      "phoneVerified": false,
      "socialVerified": false,
      "identityVerified": false
    },
    "lastActive": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2.2 Business Login
**Function:** `loginBusiness`  
**Route:** `POST /api/auth/business/login`

#### Process
1. **Email Lookup** - Finds business by email
2. **Password Verification** - Compares hashed passwords
3. **Status Check** - Verifies account is active
4. **Login Tracking** - Updates lastActive and loginCount
5. **Token Issuance** - Creates new tokens

#### Response (200)
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "user": {
    "id": "business_id",
    "name": "Fashion Brand Inc",
    "email": "contact@company.com",
    "role": "business",
    "status": "active",
    "businessName": "Fashion Brand Inc",
    "category": "Fashion & Retail",
    "verificationStatus": {
      "emailVerified": true,
      "businessVerified": false,
      "paymentVerified": false
    },
    "lastActive": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2.3 Admin Login
**Function:** `loginAdmin`  
**Route:** `POST /api/auth/admin/login`

#### Process
1. **Email Lookup** - Finds admin by email
2. **Password Verification** - Compares hashed passwords
3. **Active Check** - Verifies admin.isActive is true
4. **Login Tracking** - Updates lastActive, loginCount, and adminStats
5. **Token Issuance** - Creates new tokens

#### Response (200)
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "user": {
    "id": "admin_id",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "admin",
    "status": "active",
    "adminRole": "admin",
    "department": "operations",
    "lastActive": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 3. LEGACY FUNCTIONS (DEPRECATED)

### Legacy Registration
**Function:** `register(req, res, next, roleOverride)`  
**Status:** Deprecated - Use specific functions above

### Legacy Login
**Function:** `login(req, res, next, roleOverride)`  
**Status:** Deprecated - Use specific functions above

---

## 4. ERROR RESPONSES

### 400 Bad Request (Validation Error)
```json
{
  "errors": [
    {
      "msg": "Valid email address is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized (Invalid Credentials)
```json
{
  "message": "Invalid credentials"
}
```

### 403 Forbidden (Account Issues)
```json
{
  "message": "Account pending admin approval",
  "status": "adminpending"
}
```
```json
{
  "message": "Account suspended",
  "status": "suspended"
}
```

### 409 Conflict (Email Exists)
```json
{
  "message": "Email already registered"
}
```

---

## 5. API ENDPOINTS SUMMARY

### Registration Endpoints
```
POST /api/auth/influencer/register  → registerInfluencer()
POST /api/auth/business/register    → registerBusiness()
POST /api/auth/admin/register       → registerAdmin()
```

### Login Endpoints
```
POST /api/auth/influencer/login    → loginInfluencer()
POST /api/auth/business/login      → loginBusiness()
POST /api/auth/admin/login         → loginAdmin()
```

### Legacy Endpoints (Still Work)
```
POST /api/auth/register             → Legacy auto-detect
POST /api/auth/login                → Legacy auto-detect
```

---

## 6. BENEFITS OF SEPARATE FUNCTIONS

### 1. **Type Safety**
- Each function has clear, specific parameters
- No role override confusion
- Better TypeScript support potential

### 2. **Maintainability**
- Easier to modify logic for specific user types
- Clear separation of concerns
- Simpler debugging and testing

### 3. **Performance**
- No conditional logic based on role parameter
- Direct database queries for specific models
- Optimized code paths

### 4. **Code Clarity**
- Function names clearly indicate purpose
- No ambiguity about which user type is being handled
- Self-documenting code

### 5. **Future Extensibility**
- Easy to add role-specific features
- Can modify one user type without affecting others
- Clear upgrade path for new user types

---

## 7. MIGRATION GUIDE

### For Frontend Developers
```javascript
// Old way (still works)
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    role: 'influencer',
    email: 'user@example.com',
    // ... other fields
  })
});

// New recommended way
const response = await fetch('/api/auth/influencer/register', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    // ... influencer-specific fields only
  })
});
```

### For Backend Developers
```javascript
// Old way (still works)
app.post('/register', (req, res, next) => register(req, res, next, 'influencer'));

// New recommended way
app.post('/influencer/register', registerInfluencer);
```

---

## 8. TESTING

### Influencer Registration Test
```bash
curl -X POST "http://localhost:5500/api/auth/influencer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Business Registration Test
```bash
curl -X POST "http://localhost:5500/api/auth/business/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business@example.com",
    "password": "password123",
    "companyName": "Test Company",
    "businessDetails": {
      "sector": "Technology",
      "companySize": "11-50",
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
```

### Login Test
```bash
curl -X POST "http://localhost:5500/api/auth/influencer/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 9. SCHEMA INITIALIZATION

### Influencer Schema Defaults
- ✅ Complete notification preferences
- ✅ Privacy settings (public profile)
- ✅ Empty portfolio and statistics
- ✅ Auto-generated unique username
- ✅ Proper verification status structure

### Business Schema Defaults
- ✅ Business statistics initialized to 0
- ✅ Proper contact info structure
- ✅ Legal information fields
- ✅ Verification status for business processes

### Admin Schema Defaults
- ✅ Admin statistics tracking
- ✅ Department and role assignments
- ✅ Permission structure
- ✅ Auto-activation (no admin approval needed)

---

This refactoring provides a clean, maintainable, and scalable authentication system with clear separation between different user types while maintaining backward compatibility.