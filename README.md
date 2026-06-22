# B6A4-Backend

## MediStore — Online Pharmacy Backend API

A RESTful API built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, and **Prisma ORM** for the MediStore online pharmacy platform.

## Tech Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npm run generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### API Base URL
```
http://localhost:5000/api
```

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |
| PUT | /api/auth/profile | Private |

### Medicines
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/medicines | Public |
| GET | /api/medicines/:id | Public |
| POST | /api/medicines | Seller |
| PUT | /api/medicines/:id | Seller |
| DELETE | /api/medicines/:id | Seller |
| GET | /api/medicines/seller/my | Seller |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/orders | Customer |
| GET | /api/orders/my | Customer |
| GET | /api/orders/:id | Auth |
| PATCH | /api/orders/:id/cancel | Customer |
| PATCH | /api/orders/:id/status | Seller/Admin |
| GET | /api/orders/seller/all | Seller |

### Categories
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/categories | Public |
| POST | /api/categories | Admin |
| PUT | /api/categories/:id | Admin |
| DELETE | /api/categories/:id | Admin |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/reviews | Customer |
| GET | /api/reviews/:medicineId | Public |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/admin/stats | Admin |
| GET | /api/admin/users | Admin |
| PATCH | /api/admin/users/:id/ban | Admin |
| PATCH | /api/admin/users/:id/unban | Admin |
| GET | /api/admin/orders | Admin |
| GET | /api/admin/medicines | Admin |

## Admin Credentials
```
Email: admin@medistore.com
Password: Admin@123
```

## Database Schema

5 core tables:
- **User** — Authentication and role management (CUSTOMER, SELLER, ADMIN)
- **Category** — Medicine categories
- **Medicine** — Product listings linked to sellers
- **Order** — Customer transactions (PLACED → PROCESSING → SHIPPED → DELIVERED)
- **OrderItem** — Individual items per order
- **Review** — Customer feedback and ratings
