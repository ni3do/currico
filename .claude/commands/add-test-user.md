# Add Test User

Add a simple test user to the database for development/testing purposes.

## Instructions

Run this command to create a test user via docker exec:

```bash
docker exec easy-lehrer-db psql -U postgres -d easy_lehrer -c "
INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  role,
  subjects,
  cycles,
  cantons,
  is_seller,
  seller_verified,
  payout_enabled,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'test-user-id',
  'test@test.com',
  'test',
  'Test User',
  'BUYER',
  '{}',
  '{}',
  '{}',
  false,
  false,
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = 'test',
  updated_at = NOW();
"
```

This creates a test user with:
- **Email:** test@test.com
- **Password:** test
- **Display Name:** Test User
- **Role:** BUYER

If the user already exists, it will update the password to "test".
