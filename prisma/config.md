# Database Setup Guide

## PostgreSQL Setup

### Local Development
1. Install PostgreSQL 14+
2. Create a database:
   ```sql
   CREATE DATABASE medistore;
   ```
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/medistore?schema=public"
   ```

### Migration Commands
```bash
# Push schema changes (development)
npm run db:push

# Create and apply migration (production)
npm run db:migrate

# Seed sample data
npm run db:seed

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

## Order Status Flow
```
PLACED → PROCESSING → SHIPPED → DELIVERED
          ↓
       CANCELLED (only from PLACED)
```

## User Roles
- **CUSTOMER**: Browse, cart, checkout, order tracking, reviews
- **SELLER**: Manage inventory, fulfill orders
- **ADMIN**: Platform oversight, user management, categories
