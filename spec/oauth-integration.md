# OAuth Integration Plan for Easy-Lehrer

## Executive Summary

**Good news:** Google and Microsoft OAuth are already fully implemented in the codebase. They just need credentials to activate. Switch edu-ID requires adding a new custom OIDC provider.

## Current State

### Already Implemented (just need credentials)

| Provider | Status | Environment Variables |
|----------|--------|----------------------|
| Google OAuth | Code ready | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Microsoft Entra ID | Code ready | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` |

Files involved:
- `lib/auth.ts:20-30` - Provider configuration
- `app/[locale]/login/page.tsx` - Google button
- `app/[locale]/register/page.tsx` - Google + Microsoft buttons

### Needs Implementation

| Provider | Protocol | Effort |
|----------|----------|--------|
| Switch edu-ID | OIDC (authorization code flow) | ~1 hour |

---

## Issues Found in Current Implementation

| Issue | Location | Problem | Fix |
|-------|----------|---------|-----|
| Wrong provider ID | `register/page.tsx:289` | Uses `signIn("azure-ad")` but provider is `microsoft-entra-id` | Change to `signIn("microsoft-entra-id")` |
| Missing Microsoft button | `login/page.tsx` | Only shows Google, inconsistent with register page | Add Microsoft button |
| Missing edu-ID | All auth files | Not yet implemented | Add provider + UI |

---

## Implementation Decisions

| Decision | Choice |
|----------|--------|
| Providers to enable | Google + Microsoft + edu-ID (all three) |
| Pages with OAuth | Both login AND register pages |
| Button order | Google → Microsoft → edu-ID |
| edu-ID logo | Official Switch edu-ID logo |
| edu-ID setup | Add code now (ready for credentials) |

---

## Implementation Tasks

### Phase 1: Fix Existing Issues

- [x] **Task 1:** Fix Microsoft button on register page
  - File: `app/[locale]/register/page.tsx:289`
  - Change: `signIn("azure-ad")` → `signIn("microsoft-entra-id")`

- [x] **Task 2:** Add Microsoft button to login page
  - File: `app/[locale]/login/page.tsx`
  - Add Microsoft button after Google button

### Phase 2: Add edu-ID Provider

- [x] **Task 3:** Add EduID custom OIDC provider function
  - File: `lib/auth.ts`
  - Add `EduID()` function with issuer `login.eduid.ch`

- [x] **Task 4:** Register EduID in providers array
  - File: `lib/auth.ts`
  - Add `EduID()` to providers array after MicrosoftEntraID

- [x] **Task 5:** Add edu-ID environment variables
  - File: `.env.example`
  - Add: `EDUID_CLIENT_ID`, `EDUID_CLIENT_SECRET`, `EDUID_USE_TEST`

### Phase 3: Add edu-ID UI

- [x] **Task 6:** Add edu-ID button to login page
  - File: `app/[locale]/login/page.tsx`
  - Add button with official logo after Microsoft

- [x] **Task 7:** Add edu-ID button to register page
  - File: `app/[locale]/register/page.tsx`
  - Add button with official logo after Microsoft

- [x] **Task 8:** Add edu-ID logo
  - File: `public/eduid-logo.svg`
  - Add official Switch edu-ID logo

### Phase 4: Translations

- [x] **Task 9:** Check/add Microsoft translation (German)
  - File: `messages/de.json`

- [x] **Task 10:** Check/add Microsoft translation (English)
  - File: `messages/en.json`

- [x] **Task 11:** Add edu-ID translation (German)
  - File: `messages/de.json`
  - Add: `"continueWithEduID": "Mit edu-ID fortfahren"`

- [x] **Task 12:** Add edu-ID translation (English)
  - File: `messages/en.json`
  - Add: `"continueWithEduID": "Continue with edu-ID"`

---

## Files Summary

### Files to Modify (6)

| File | Changes |
|------|---------|
| `lib/auth.ts` | Add EduID provider function + register in array |
| `app/[locale]/login/page.tsx` | Add Microsoft + edu-ID buttons |
| `app/[locale]/register/page.tsx` | Fix Microsoft ID, add edu-ID button |
| `messages/de.json` | Add Microsoft (if missing) + edu-ID translations |
| `messages/en.json` | Add Microsoft (if missing) + edu-ID translations |
| `.env.example` | Add edu-ID environment variables |

### Files to Create (1)

| File | Content |
|------|---------|
| `public/eduid-logo.svg` | Official Switch edu-ID logo |

---

## Part 1: Activating Google OAuth

### Step 1.1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name:** Easy-Lehrer
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (dev)
     - `https://your-production-domain.ch` (prod)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-production-domain.ch/api/auth/callback/google`

### Step 1.2: Add Credentials to Environment

```bash
# .env (local)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

Add same variables to Dokploy production environment.

---

## Part 2: Activating Microsoft OAuth

### Step 2.1: Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory > App registrations**
3. Click **New registration**
4. Configure:
   - **Name:** Easy-Lehrer
   - **Supported account types:** "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI:** Web - `http://localhost:3000/api/auth/callback/microsoft-entra-id`

### Step 2.2: Create Client Secret

1. In app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Copy the secret value immediately

### Step 2.3: Add Credentials to Environment

```bash
# .env (local)
MICROSOFT_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MICROSOFT_CLIENT_SECRET="xxx"
MICROSOFT_TENANT_ID="common"  # or specific tenant ID
```

---

## Part 3: Adding Switch edu-ID

Switch edu-ID is a Swiss educational identity provider supporting standard OIDC. It's particularly relevant for Swiss teachers and educational institutions.

### Technical Details

- **Protocol:** OpenID Connect (authorization code flow only)
- **Production Issuer:** `https://login.eduid.ch`
- **Test Issuer:** `https://login.test.eduid.ch`
- **Well-known Config:** `https://login.eduid.ch/.well-known/openid-configuration`
- **Documentation:** https://help.switch.ch/eduid/docs/services/openid-connect/

### Step 3.1: Register Service with SWITCH

1. Go to [AAI Resource Registry](https://rr.aai.switch.ch/)
2. Login with your organization or Switch edu-ID
3. Click **Resources > Add a Resource Description > OpenID Connect resource**
4. Configure:
   - **Redirect URIs:**
     - `http://localhost:3000/api/auth/callback/eduid` (dev)
     - `https://your-production-domain.ch/api/auth/callback/eduid` (prod)
   - **Requested scopes:** `openid`, `profile`, `email`

### Step 3.2: Add edu-ID Provider to NextAuth

**File:** `lib/auth.ts`

Add a custom OIDC provider:

```typescript
import type { OIDCConfig } from "next-auth/providers";

// Custom edu-ID provider
function EduID(): OIDCConfig<{
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
}> {
  const isTest = process.env.EDUID_USE_TEST === "true";
  const baseUrl = isTest
    ? "https://login.test.eduid.ch"
    : "https://login.eduid.ch";

  return {
    id: "eduid",
    name: "Switch edu-ID",
    type: "oidc",
    issuer: baseUrl,
    clientId: process.env.EDUID_CLIENT_ID!,
    clientSecret: process.env.EDUID_CLIENT_SECRET!,
    authorization: {
      params: {
        scope: "openid profile email",
      },
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: null,
      };
    },
  };
}
```

Add to providers array:

```typescript
providers: [
  Google({ ... }),
  MicrosoftEntraID({ ... }),
  EduID(),  // Add this
  Credentials({ ... }),
],
```

### Step 3.3: Add Environment Variables

**File:** `.env.example`

```bash
# Switch edu-ID
EDUID_CLIENT_ID=""
EDUID_CLIENT_SECRET=""
EDUID_USE_TEST="true"  # Set to "false" for production
```

### Step 3.4: Add UI Button

**Files:** `app/[locale]/login/page.tsx` and `app/[locale]/register/page.tsx`

Add edu-ID sign-in button alongside Google/Microsoft:

```tsx
<Button
  variant="outline"
  className="w-full"
  onClick={() => signIn("eduid", { callbackUrl: "/" })}
>
  <Image
    src="/eduid-logo.svg"
    alt="edu-ID"
    width={20}
    height={20}
    className="mr-2"
  />
  {t("continueWithEduID")}
</Button>
```

### Step 3.5: Add Translations

**File:** `messages/de.json`
```json
{
  "continueWithEduID": "Mit edu-ID fortfahren"
}
```

**File:** `messages/en.json`
```json
{
  "continueWithEduID": "Continue with edu-ID"
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/auth.ts` | Add EduID provider function and include in providers array |
| `.env.example` | Add `EDUID_CLIENT_ID`, `EDUID_CLIENT_SECRET`, `EDUID_USE_TEST` |
| `app/[locale]/login/page.tsx` | Add edu-ID button |
| `app/[locale]/register/page.tsx` | Add edu-ID button |
| `messages/de.json` | Add translation |
| `messages/en.json` | Add translation |
| `public/eduid-logo.svg` | Add Switch edu-ID logo |

---

## Verification

### Google OAuth
1. Add credentials to `.env`
2. Run `docker compose up`
3. Click "Continue with Google" on login page
4. Verify redirect to Google, then back to app with session

### Microsoft OAuth
1. Add credentials to `.env`
2. Click "Continue with Microsoft" on register page
3. Verify redirect to Microsoft, then back to app with session

### edu-ID (after implementation)
1. Register test app at SWITCH Resource Registry
2. Set `EDUID_USE_TEST=true` with test credentials
3. Click "Continue with edu-ID"
4. Verify redirect to `login.test.eduid.ch`, then back with session

### Account Linking
1. Login with Google
2. Logout
3. Login with edu-ID using same email
4. Verify both accounts link to same user (via `Account` table)

---

## Production Checklist

- [ ] Add all OAuth credentials to Dokploy environment
- [ ] Update redirect URIs in all provider consoles to production domain
- [ ] Set `EDUID_USE_TEST=false` for production
- [ ] Test each provider end-to-end on production

---

## References

- [Switch edu-ID OIDC Documentation](https://help.switch.ch/eduid/docs/services/openid-connect/)
- [Service Registration](https://help.switch.ch/eduid/docs/services/openid-connect/registration/)
- [Scopes and Claims](https://help.switch.ch/eduid/docs/services/openid-connect/scopes/)
- [Development and Testing](https://help.switch.ch/eduid/docs/services/openid-connect/dev/)
- [NextAuth.js Custom Provider](https://authjs.dev/guides/configuring-oauth-providers)
