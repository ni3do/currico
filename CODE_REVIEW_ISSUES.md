# Code Review Issues

Review date: 2026-01-13
Branch: `feature/new-feature` vs `main`

---

## Critical Issues (Score >= 80)

### 1. Missing authentication on admin resources endpoint

**Severity:** Critical (Score: 85)
**File:** `app/api/admin/resources/route.ts`

**Problem:** The `/api/admin/resources` endpoint has no authentication checks. Both GET and PATCH handlers allow any unauthenticated user to:
- List all resources (including drafts and pending approvals)
- Approve or reject any resource

**Current code (lines 1-5):**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // No requireAdmin() check
```

**Fix:** Add `requireAdmin()` check at the start of both handlers.

---

### 2. Missing authentication on admin stats endpoint

**Severity:** Critical (Score: 90)
**File:** `app/api/admin/stats/route.ts`

**Problem:** The `/api/admin/stats` endpoint exposes sensitive business metrics without authentication:
- Total revenue
- User counts and breakdown
- Transaction data
- Weekly revenue trends

**Current code (lines 1-5):**
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // No requireAdmin() check
```

**Fix:** Add `requireAdmin()` check at the start of the GET handler.

---

### 3. `.env` file committed to git with secrets

**Severity:** Critical (Score: 80)
**Files:** `.env`, `.gitignore`

**Problem:** The `.env` file is committed to version control and contains real secrets:
```
AUTH_SECRET="ygwvb4HasL39kqR+0IOFI6AsQahlra81rm16Xaxa6Qk="
```

The `.gitignore` only excludes `.env*.local` but not `.env` itself.

**Fix:**
1. Add `.env` to `.gitignore`
2. Remove `.env` from git tracking
3. Rotate the exposed `AUTH_SECRET`

---

## High Priority Issues (Score 75)

### 4. Missing password validation in registration

**Severity:** High (Score: 75)
**File:** `app/api/auth/register/route.ts`

**Problem:** The registration endpoint only checks if password exists, but doesn't validate strength. A `registerSchema` with proper validation exists in `lib/validations/user.ts` but is not used.

**Fix:** Import and use `registerSchema.safeParse()` to validate registration input.

---

### 5. Avatar upload MIME type can be spoofed

**Severity:** High (Score: 75)
**File:** `app/api/users/me/avatar/route.ts`

**Problem:** File type validation only checks the client-provided MIME type (`file.type`), which can be spoofed. No magic byte validation is performed.

**Fix:** Add file content validation using magic bytes to verify actual file type.

---

### 6. Admin user update field name mismatch

**Severity:** High (Score: 75)
**File:** `app/api/admin/users/[id]/route.ts`

**Problem:** The `allowedFields` array contains `"email_verified"` (snake_case) but the Prisma schema uses `emailVerified` (camelCase). This causes the feature to silently fail.

**Current code (line 89):**
```typescript
const allowedFields = ["seller_verified", "role", "email_verified"];
```

**Fix:** Change `"email_verified"` to `"emailVerified"` to match the schema.

---

## Implementation Todo List

### Phase 1: Critical Security Fixes

- [ ] **Fix admin/resources auth**
  - Import `requireAdmin` from `@/lib/admin-auth`
  - Add `await requireAdmin()` at start of GET handler
  - Add `await requireAdmin()` at start of PATCH handler
  - Test both endpoints return 401/403 without admin session

- [ ] **Fix admin/stats auth**
  - Import `requireAdmin` from `@/lib/admin-auth`
  - Add `await requireAdmin()` at start of GET handler
  - Test endpoint returns 401/403 without admin session

- [ ] **Remove .env from git**
  - Add `.env` to `.gitignore` (before the `.env*.local` line)
  - Run `git rm --cached .env`
  - Commit the changes
  - Generate new AUTH_SECRET: `openssl rand -base64 32`
  - Update production/staging environments with new secret

### Phase 2: High Priority Fixes

- [ ] **Add password validation to registration**
  - Import `registerSchema` from `@/lib/validations/user`
  - Replace manual validation with `registerSchema.safeParse(body)`
  - Return validation errors if parsing fails
  - Test registration rejects weak passwords

- [ ] **Improve avatar upload validation**
  - Add magic byte checking for image types (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`)
  - Reject files where magic bytes don't match claimed MIME type
  - Test upload rejects non-image files with spoofed MIME types

- [ ] **Fix admin user update field name**
  - Change `"email_verified"` to `"emailVerified"` in allowedFields array
  - Also verify `"seller_verified"` matches schema (should be `seller_verified` per Prisma naming)
  - Test admin can update email verification status

### Phase 3: Verification

- [ ] Run full test suite
- [ ] Manual testing of all affected endpoints
- [ ] Security scan of authentication flows
