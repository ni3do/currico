# Production Environment Variables

This document lists all environment variables required for production deployment of Currico.

## Required Variables

These variables **must** be set for the application to function in production.

### Database

| Variable       | Description             | Example                               |
| -------------- | ----------------------- | ------------------------------------- |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/currico` |

### Authentication

| Variable      | Description                                                  | Example              |
| ------------- | ------------------------------------------------------------ | -------------------- |
| `AUTH_SECRET` | NextAuth secret key. Generate with `openssl rand -base64 32` | `abc123...`          |
| `AUTH_URL`    | Public URL of your application                               | `https://currico.ch` |

### Storage (S3/Infomaniak Object Storage)

For production, set `STORAGE_PROVIDER=s3` and configure all S3 variables.

| Variable                         | Description                                      | Example                                           |
| -------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `STORAGE_PROVIDER`               | Storage backend: `local` or `s3`                 | `s3`                                              |
| `S3_ENDPOINT`                    | S3-compatible endpoint URL                       | `https://s3.pub1.infomaniak.cloud`                |
| `S3_REGION`                      | S3 region                                        | `pub1`                                            |
| `S3_ACCESS_KEY_ID`               | Access key from Infomaniak console               | `your-access-key`                                 |
| `S3_SECRET_ACCESS_KEY`           | Secret key from Infomaniak console               | `your-secret-key`                                 |
| `S3_PUBLIC_BUCKET`               | Bucket name for public files (previews, avatars) | `currico-public`                                  |
| `S3_PRIVATE_BUCKET`              | Bucket name for private files (resources)        | `currico-private`                                 |
| `S3_PUBLIC_BUCKET_URL`           | Public CDN URL for the public bucket             | `https://currico-public.s3.pub1.infomaniak.cloud` |
| `NEXT_PUBLIC_STORAGE_PUBLIC_URL` | Same as S3_PUBLIC_BUCKET_URL (client-side)       | `https://currico-public.s3.pub1.infomaniak.cloud` |

### Email (Resend)

| Variable         | Description                   | Example           |
| ---------------- | ----------------------------- | ----------------- |
| `RESEND_API_KEY` | API key from Resend dashboard | `re_abc123...`    |
| `EMAIL_FROM`     | Sender email address          | `info@currico.ch` |
| `ADMIN_EMAIL`    | Admin notification email      | `info@currico.ch` |

### Stripe Payments

| Variable                             | Description                          | Example             |
| ------------------------------------ | ------------------------------------ | ------------------- |
| `STRIPE_SECRET_KEY`                  | Stripe secret key (sk*live*...)      | `sk_live_abc123...` |
| `STRIPE_WEBHOOK_SECRET`              | Webhook signing secret (whsec\_...)  | `whsec_abc123...`   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk*live*...) | `pk_live_abc123...` |

### Application URL

| Variable              | Description                            | Example              |
| --------------------- | -------------------------------------- | -------------------- |
| `NEXT_PUBLIC_APP_URL` | Public application URL (for redirects) | `https://currico.ch` |

---

## Optional Variables

These enable additional features but are not required.

### OAuth Providers

#### Google

| Variable               | Description                               |
| ---------------------- | ----------------------------------------- |
| `GOOGLE_CLIENT_ID`     | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret                       |

#### Microsoft

| Variable                  | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `MICROSOFT_CLIENT_ID`     | OAuth client ID from Azure AD                     |
| `MICROSOFT_CLIENT_SECRET` | OAuth client secret                               |
| `MICROSOFT_TENANT_ID`     | Azure AD tenant ID (or `common` for multi-tenant) |

#### Switch edu-ID (Swiss Educational Identity)

| Variable              | Description                             |
| --------------------- | --------------------------------------- |
| `EDUID_CLIENT_ID`     | Client ID from Switch AAI               |
| `EDUID_CLIENT_SECRET` | Client secret                           |
| `EDUID_USE_TEST`      | `false` for production (login.eduid.ch) |

---

## Infomaniak S3 Setup Guide

### 1. Create Object Storage

1. Log into [Infomaniak Manager](https://manager.infomaniak.com)
2. Navigate to **Web & Domain** → **Object Storage**
3. Create a new Object Storage product

### 2. Create Buckets

Create two buckets:

- `currico-public` - For preview images and avatars
- `currico-private` - For resource files (PDFs, documents)

### 3. Configure Public Bucket

Set a bucket policy on `currico-public` to allow public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::currico-public/*"
    }
  ]
}
```

### 4. Generate Access Keys

1. Go to Object Storage settings
2. Create a new access key pair
3. Save both the Access Key ID and Secret Access Key securely

### 5. Configure Environment

```env
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://s3.pub1.infomaniak.cloud
S3_REGION=pub1
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_PUBLIC_BUCKET=currico-public
S3_PRIVATE_BUCKET=currico-private
S3_PUBLIC_BUCKET_URL=https://currico-public.s3.pub1.infomaniak.cloud
NEXT_PUBLIC_STORAGE_PUBLIC_URL=https://currico-public.s3.pub1.infomaniak.cloud
```

---

## Example Production .env

```env
# Database
DATABASE_URL="mysql://produser:securepassword@db.example.com:3306/currico"

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://currico.ch"

# Storage
STORAGE_PROVIDER="s3"
S3_ENDPOINT="https://s3.pub1.infomaniak.cloud"
S3_REGION="pub1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_PUBLIC_BUCKET="currico-public"
S3_PRIVATE_BUCKET="currico-private"
S3_PUBLIC_BUCKET_URL="https://currico-public.s3.pub1.infomaniak.cloud"
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://currico-public.s3.pub1.infomaniak.cloud"

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="info@currico.ch"
ADMIN_EMAIL="info@currico.ch"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# App URL
NEXT_PUBLIC_APP_URL="https://currico.ch"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
EDUID_CLIENT_ID=""
EDUID_CLIENT_SECRET=""
EDUID_USE_TEST="false"
```

---

## Security Notes

1. **Never commit secrets** to version control
2. **Use environment-specific values** - don't reuse development secrets in production
3. **Rotate secrets regularly** - especially after any suspected breach
4. **Restrict access** - limit who can view production environment variables in Dokploy
5. **Use HTTPS** - ensure `AUTH_URL` and `NEXT_PUBLIC_APP_URL` use HTTPS
