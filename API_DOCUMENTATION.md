# One Pocket API Documentation

Base URL: `http://localhost:3000`

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "67774a1b2c5d8e3f4a1b2c3d",
    "username": "john",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzc0YTFiMmM1ZDhlM2Y0YTFiMmMzZCIsImlhdCI6MTcwNDMwMjQwMCwiZXhwIjoxNzM1ODM4NDAwfQ.abcdefghijklmnopqrstuvwxyz"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Username already taken"
}
```

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`

**Description:** Login and get JWT token (valid for 365 days)

**Request Body:**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "67774a1b2c5d8e3f4a1b2c3d",
    "username": "john",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzc0YTFiMmM1ZDhlM2Y0YTFiMmMzZCIsImlhdCI6MTcwNDMwMjQwMCwiZXhwIjoxNzM1ODM4NDAwfQ.abcdefghijklmnopqrstuvwxyz"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User
**Endpoint:** `GET /api/auth/me`

**Description:** Get logged in user information

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "67774a1b2c5d8e3f4a1b2c3d",
    "username": "john"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### 4. Logout User
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user (client should delete token)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully. Please delete token from client."
}
```

---

## Expense Endpoints (Protected - Requires JWT Token)

### 5. Get All Expenses
**Endpoint:** `GET /api/expenses` or `GET /api/expenses?month={YYYY-MM}`

**Description:** Get all expenses for the logged-in user, optionally filtered by month

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `month` (optional) - Filter by month in "YYYY-MM" format (e.g., "2025-01")

**Example Requests:**
```
GET /api/expenses                    # Get all expenses
GET /api/expenses?month=2025-01      # Get only January 2025 expenses
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 150.50,
    "reason": "Food & Dining",
    "date": "2025-01-03T00:00:00.000Z",
    "paymentMethod": "cash",
    "note": "Lunch meeting",
    "reimbursable": false,
    "createdAt": "2025-01-03T10:30:45.123Z",
    "updatedAt": "2025-01-03T10:30:45.123Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 2500.00,
    "reason": "Rent",
    "date": "2025-01-01T00:00:00.000Z",
    "paymentMethod": "credit_card",
    "note": "",
    "reimbursable": false,
    "createdAt": "2025-01-01T08:00:00.000Z",
    "updatedAt": "2025-01-01T08:00:00.000Z"
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid month format. Use YYYY-MM"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### 6. Create Expense
**Endpoint:** `POST /api/expenses`

**Description:** Create a new expense for logged-in user (userId added automatically from JWT)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "amount": 150.50,
  "reason": "Food & Dining",
  "date": "2025-01-03",
  "paymentMethod": "credit_card",
  "note": "Lunch with team",
  "reimbursable": true
}
```

**Note:** `paymentMethod`, `note`, and `reimbursable` are optional fields and default to `"upi"`, `""`, and `false` respectively if not provided. `paymentMethod` must be one of: `"cash"`, `"credit_card"`, or `"upi"`.

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 150.50,
    "reason": "Food & Dining",
    "date": "2025-01-03T00:00:00.000Z",
    "paymentMethod": "credit_card",
    "note": "Lunch with team",
    "reimbursable": true,
    "createdAt": "2025-01-03T10:30:45.123Z",
    "updatedAt": "2025-01-03T10:30:45.123Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Please provide amount, reason, and date"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### 7. Search Expenses by Note
**Endpoint:** `GET /api/expenses/search?query={searchText}`

**Description:** Search expenses by note content (case-insensitive partial match)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `query` (required) - Search text to find in notes

**Example Request:**
```
GET /api/expenses/search?query=uber
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 323,
    "reason": "Transportation",
    "date": "2025-09-30T00:00:00.000Z",
    "paymentMethod": "credit_card",
    "note": "Uber ride to airport",
    "reimbursable": true,
    "createdAt": "2025-01-03T10:30:45.123Z",
    "updatedAt": "2025-01-03T10:30:45.123Z"
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "userId": "67774a1b2c5d8e3f4a1b2c3d",
    "amount": 45.50,
    "reason": "Transportation",
    "date": "2025-09-28T00:00:00.000Z",
    "paymentMethod": "cash",
    "note": "Uber to office",
    "reimbursable": false,
    "createdAt": "2025-01-02T08:15:30.000Z",
    "updatedAt": "2025-01-02T08:15:30.000Z"
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Please provide a search query"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

## Budget Endpoints (Protected - Requires JWT Token)

### 8. Get All Budgets
**Endpoint:** `GET /api/budgets` or `GET /api/budgets?month={YYYY-MM}`

**Description:** Get all budgets for the logged-in user, optionally filtered by month

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `month` (optional) - Filter by month in "YYYY-MM" format (e.g., "2025-01")

**Example Requests:**
```
GET /api/budgets                    # Get all budgets
GET /api/budgets?month=2025-01      # Get only January 2025 budgets
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "category": "Food & Dining",
    "amount": 10000,
    "month": "2025-01",
    "userId": "507f191e810c19729de860ea",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "category": "Transportation",
    "amount": 5000,
    "month": "2025-01",
    "userId": "507f191e810c19729de860ea",
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
]
```

---

### 9. Create Budget
**Endpoint:** `POST /api/budgets`

**Description:** Create a new budget for logged-in user (userId added automatically from JWT)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "category": "Food & Dining",
  "amount": 10000,
  "month": "2025-01"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "category": "Food & Dining",
    "amount": 10000,
    "month": "2025-01",
    "userId": "507f191e810c19729de860ea",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Please provide category, amount, and month"
}
```

**Error Response (400 Bad Request - Duplicate):**
```json
{
  "success": false,
  "message": "Budget already exists for this category and month"
}
```

---

### 10. Update Budget
**Endpoint:** `PUT /api/budgets/:id`

**Description:** Update an existing budget

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "category": "Food & Dining",
  "amount": 15000,
  "month": "2025-01"
}
```

**Note:** All fields are optional. Provide only the fields you want to update.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "category": "Food & Dining",
    "amount": 15000,
    "month": "2025-01",
    "userId": "507f191e810c19729de860ea",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:45:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Budget not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to update this budget"
}
```

---

### 11. Delete Budget
**Endpoint:** `DELETE /api/budgets/:id`

**Description:** Delete a budget

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Budget not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to delete this budget"
}
```

---

## History Endpoints (Protected - Requires JWT Token)

### 12. Get Months with Expense Data
**Endpoint:** `GET /api/history/months`

**Description:** Get list of months that have expense data for the logged-in user

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
[
  "2025-01",
  "2024-12",
  "2024-11",
  "2024-10"
]
```

**Notes:**
- Returns array of strings in "YYYY-MM" format
- Sorted from most recent to oldest
- Empty array if no expenses found

---

### 13. Get Monthly Summary
**Endpoint:** `GET /api/history/summary?month={YYYY-MM}`

**Description:** Get summary data for a specific month including category breakdown and budget comparisons

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `month` (required) - Month in "YYYY-MM" format (e.g., "2024-12")

**Example Request:**
```
GET /api/history/summary?month=2024-12
```

**Response (200 OK):**
```json
{
  "month": "2024-12",
  "totalSpent": 45230.50,
  "categoryBreakdown": [
    {
      "category": "Food & Dining",
      "amount": 15000,
      "percentage": 33.2
    },
    {
      "category": "Transportation",
      "amount": 8500,
      "percentage": 18.8
    }
  ],
  "budgetComparisons": [
    {
      "category": "Food & Dining",
      "budgetAmount": 10000,
      "actualSpent": 15000,
      "difference": -5000,
      "percentageUsed": 150.0
    }
  ]
}
```

**Notes:**
- `categoryBreakdown`: All categories with expenses in that month
- `budgetComparisons`: Only categories that have budgets set
- `difference`: Negative = over budget, Positive = under budget
- `percentageUsed`: Percentage of budget used
- Both arrays can be empty if no data

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Please provide month in YYYY-MM format"
}
```

---

## Utility Endpoints

### 14. Welcome/Home
**Endpoint:** `GET /`

**Description:** Welcome message

**Response (200 OK):**
```json
{
  "message": "Welcome to One Pocket API",
  "status": "Server is running successfully",
  "timestamp": "2025-01-04T10:30:45.123Z"
}
```

---

### 15. Health Check
**Endpoint:** `GET /api/health`

**Description:** Check server health and uptime

**Response (200 OK):**
```json
{
  "status": "OK",
  "uptime": 12345.678,
  "timestamp": "2025-01-04T10:30:45.123Z"
}
```

---

### 16. Greet
**Endpoint:** `GET /api/greet?name=John`

**Description:** Sample greeting endpoint

**Query Parameters:**
- `name` (optional) - Name to greet (default: "Guest")

**Response (200 OK):**
```json
{
  "message": "Hello, John!",
  "timestamp": "2025-01-04T10:30:45.123Z"
}
```

---

## Error Responses

### 404 Not Found
When accessing a non-existent route:
```json
{
  "error": "Route not found",
  "path": "/api/invalid-route"
}
```

### 500 Internal Server Error
When a server error occurs:
```json
{
  "error": "Something went wrong!",
  "message": "Error details here"
}
```

---

## Authentication Flow

1. **Register:** `POST /api/auth/register` with username and password
2. **Login:** `POST /api/auth/login` to get JWT token (valid for 365 days)
3. **Store Token:** Save the token in client (localStorage, AsyncStorage, etc.)
4. **Use Token:** Include token in `Authorization: Bearer <token>` header for all protected routes
5. **Logout:** `POST /api/auth/logout` and delete token from client

---

## Notes

- JWT token is valid for **365 days** - users stay logged in for 1 year
- All expense endpoints require authentication (JWT token in header)
- userId is automatically extracted from JWT token when creating expenses
- Expenses are filtered by logged-in user (users only see their own expenses)
- Passwords are hashed using bcrypt before storing in database
- Username is unique and case-insensitive

---

## Environment Variables Required

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onepocket?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
```
