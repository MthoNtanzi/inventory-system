# 🏪 Inventory and Sales Management System (Backend)

A Node.js + Express + PostgreSQL backend for managing products, stock, users, and sales.  
This API supports authentication (JWT), role-based access (admin/staff), and transaction-safe sales tracking.

---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Token)
- **Environment Variables:** dotenv
- **HTTP Client Testing:** Postman / Thunder Client

---

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend/` folder:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/inventorydb
JWT_SECRET=your_secret_key
```

### 3. Database Setup
In PostgreSQL:

```sql
-- Recreate schema
\i schema.sql
-- (or run manually)
```

To seed initial data:
```sql
\i seed.sql
```

---

## 📦 API ROUTES

### 🔐 Authentication (JWT)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/users/register` | Register a new user (admin only) |
| `POST` | `/users/login` | Login and receive JWT token |

**Login Response Example:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

Include this token in requests that require authentication:
```
Authorization: Bearer <token>
```

---

### 👤 USERS

| Method | Endpoint | Access | Description |
|--------|-----------|--------|-------------|
| `GET` | `/api/users` | Admin | View all users |
| `POST` | `/api/users/register` | Admin | Create a new user |
| `POST` | `/api/users/login` | Public | Authenticate user and get token |

---

### 📦 PRODUCTS

| Method | Endpoint | Access | Description |
|--------|-----------|--------|-------------|
| `GET` | `/api/products` | All | List all products with stock |
| `POST` | `/api/products` | Admin | Add a new product |
| `PUT` | `/api/products/:id` | Admin | Update product info |
| `DELETE` | `/api/products/:id` | Admin | Delete product (and related stock/sales) |

**Example POST body:**
```json
{
  "name": "Laptop",
  "category": "Office",
  "price": 15000.00,
  "image_url": "https://example.com/laptop.jpg",
  "quantity": 10
}
```

---

### 📊 STOCK

| Method | Endpoint | Access | Description |
|--------|-----------|--------|-------------|
| `GET` | `/api/stock` | Admin/Staff | View all stock with product info |
| `PUT` | `/api/stock/:id` | Admin/Staff | Update stock quantity |
| `DELETE` | `/api/stock/:id` | Admin | Delete stock entry |

**Example PUT body:**
```json
{
  "quantity": 15
}
```

---

### 💰 SALES

| Method | Endpoint | Access | Description |
|--------|-----------|--------|-------------|
| `GET` | `/api/sales` | Admin/Staff | View all sales with product + user info |
| `POST` | `/api/sales` | Admin/Staff | Record a new sale |

**Example POST body:**
```json
{
  "product_id": 1,
  "user_id": 2,
  "quantity": 3
}
```

**Example Response:**
```json
{
  "message": "Sale recorded successfully",
  "total_price": 45000
}
```

---

## 🔒 Authentication Middleware

**`authenticateToken`**
- Verifies JWT in the `Authorization` header.
- Attaches `req.user` to the request.

**`isAdmin`**
- Checks if the logged-in user has the role `'admin'`.

Usage Example:
```js
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  // Admin-only logic
});
```

---

## 🧠 Notes

- All DB operations are wrapped in `BEGIN` / `COMMIT` / `ROLLBACK` for safety.
- When a sale is recorded:
  - Stock decreases.
  - A new sales record is added.
  - If stock is insufficient → transaction is rolled back.
- JWT tokens expire in 1 hour by default.

---

## 🧩 Folder Structure

```
backend/
│
├── db.js                   # PostgreSQL pool connection
├── server.js               # Entry point
├── routes/
│   ├── users.js
│   ├── products.js
│   ├── stock.js
│   └── sales.js
│
├── middleware/
│   └── authMiddleware.js
│
├── schema.sql              # Database schema
├── seed.sql                # Example data
└── .env                    # Environment variables
```

---

## 📜 License

This project is open for educational and personal use.

---

## Author
**Mthobisi Ntanzi**  
Passionate fullstack developer building clean, practical systems for real-world problems.
