# 🎁 Reward API Documentation

## Overview
The Reward API allows admins to create, manage, and track rewards for ambassadors, while ambassadors can view their own rewards.

## Base URL
```
/api/rewards
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Endpoints

### 🎁 Admin Endpoints

#### 1. Create Reward
**POST** `/api/rewards`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "ambassador": "ambassador_user_id",
  "amount": 1000,
  "currency": "INR",
  "status": "pending",
  "remarks": "Excellent performance this month"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reward created successfully",
  "data": {
    "_id": "reward_id",
    "ambassador": {
      "_id": "ambassador_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ambassador",
      "profileImage": "path/to/image.jpg"
    },
    "amount": 1000,
    "currency": "INR",
    "status": "pending",
    "remarks": "Excellent performance this month",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get All Rewards
**GET** `/api/rewards`

**Query Parameters:**
- `search` (optional): Search by remarks or amount
- `status` (optional): Filter by status (pending, approved, paid)
- `ambassador` (optional): Filter by ambassador ID

**Example:**
```
GET /api/rewards?status=pending&search=excellent
```

**Response:**
```json
{
  "success": true,
  "message": "All rewards fetched",
  "data": [
    {
      "_id": "reward_id",
      "ambassador": {
        "_id": "ambassador_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ambassador",
        "profileImage": "path/to/image.jpg",
        "phone": "+1234567890"
      },
      "amount": 1000,
      "currency": "INR",
      "status": "pending",
      "remarks": "Excellent performance",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 3. Get Reward Statistics
**GET** `/api/rewards/stats`

**Response:**
```json
{
  "success": true,
  "message": "Reward statistics fetched",
  "data": {
    "statusBreakdown": [
      {
        "_id": "pending",
        "count": 5,
        "totalAmount": 5000
      },
      {
        "_id": "approved",
        "count": 3,
        "totalAmount": 3000
      },
      {
        "_id": "paid",
        "count": 2,
        "totalAmount": 2000
      }
    ],
    "totalRewards": 10,
    "totalAmount": 10000,
    "topAmbassadors": [
      {
        "ambassadorName": "John Doe",
        "ambassadorEmail": "john@example.com",
        "totalRewards": 3,
        "totalAmount": 3000
      }
    ]
  }
}
```

#### 4. Get Reward by ID
**GET** `/api/rewards/:id`

**Response:**
```json
{
  "success": true,
  "message": "Reward fetched",
  "data": {
    "_id": "reward_id",
    "ambassador": {
      "_id": "ambassador_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ambassador",
      "profileImage": "path/to/image.jpg",
      "phone": "+1234567890"
    },
    "amount": 1000,
    "currency": "INR",
    "status": "pending",
    "remarks": "Excellent performance",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 5. Get Rewards by Ambassador
**GET** `/api/rewards/ambassador/:ambassadorId`

**Query Parameters:**
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "message": "Ambassador rewards fetched",
  "data": {
    "ambassador": {
      "id": "ambassador_id",
      "name": "John Doe",
      "email": "john@example.com",
      "profileImage": "path/to/image.jpg"
    },
    "rewards": [
      {
        "_id": "reward_id",
        "ambassador": "ambassador_id",
        "amount": 1000,
        "currency": "INR",
        "status": "pending",
        "remarks": "Excellent performance",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### 6. Update Reward Status
**PATCH** `/api/rewards/:id/status`

**Body:**
```json
{
  "status": "approved",
  "remarks": "Updated remarks (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reward status updated",
  "data": {
    "_id": "reward_id",
    "ambassador": {
      "_id": "ambassador_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ambassador",
      "profileImage": "path/to/image.jpg"
    },
    "amount": 1000,
    "currency": "INR",
    "status": "approved",
    "remarks": "Updated remarks",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

#### 7. Delete Reward
**DELETE** `/api/rewards/:id`

**Response:**
```json
{
  "success": true,
  "message": "Reward deleted successfully"
}
```

### 🎁 Ambassador Endpoints

#### 1. Get My Rewards
**GET** `/api/rewards/my`

**Query Parameters:**
- `status` (optional): Filter by status

**Example:**
```
GET /api/rewards/my?status=approved
```

**Response:**
```json
{
  "success": true,
  "message": "Your rewards fetched",
  "data": [
    {
      "_id": "reward_id",
      "ambassador": {
        "_id": "ambassador_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ambassador",
        "profileImage": "path/to/image.jpg"
      },
      "amount": 1000,
      "currency": "INR",
      "status": "approved",
      "remarks": "Excellent performance",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Valid status is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No authorization token found!"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Only admins can create rewards"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Reward not found"
}
```

## Data Models

### Reward Schema
```javascript
{
  ambassador: ObjectId,     // Reference to User (ambassador)
  amount: Number,           // Reward amount
  currency: String,         // "INR" or "USD"
  status: String,           // "pending", "approved", "paid"
  remarks: String,          // Optional remarks
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

## Usage Examples

### Admin Creating a Reward
```javascript
const response = await fetch('/api/rewards', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ambassador: 'ambassador_user_id',
    amount: 1500,
    currency: 'INR',
    status: 'pending',
    remarks: 'Outstanding performance in Q1'
  })
});
```

### Ambassador Viewing Their Rewards
```javascript
const response = await fetch('/api/rewards/my', {
  headers: {
    'Authorization': 'Bearer ' + ambassadorToken
  }
});
```

### Admin Updating Reward Status
```javascript
const response = await fetch('/api/rewards/reward_id/status', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'paid',
    remarks: 'Payment processed successfully'
  })
});
```

