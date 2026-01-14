# Teacher & School Account Management

## Implementation Status

**Status: Partial**

- Teacher account registration and login: Implemented
- Teacher profile management: Implemented
- School accounts: Not implemented
- School admin features: Not implemented

---

## Overview

Provide registration and login for both individual teachers and school accounts.

## Teacher Accounts

- Teachers create personal accounts with profile data:
  - Name
  - Canton
  - Preferred cycles
  - Subjects
- Users can belong to a school account while maintaining their personal profile

## School Accounts

- School accounts are created by a school admin
- School admin manages school details
- School admin invites teacher users
- School accounts can purchase resources and bundles with a "school/team license"
- Team licenses grant access to all teachers in that school

## School Admin Features

- Invite or remove teachers
- View which resources and bundles the school owns in a shared "School Library"
- Manage school details and billing

## UI Guidelines

- Forms are visually simple and vertically stacked
- Ample whitespace and minimal fields on each screen
- Primary actions like "Create Account" or "Save Changes" use a distinct primary color
- Cancel or secondary actions are subdued
- Interface is kept clean with grouped sections (Members, Licenses, Billing)
- Only essential information shown by default
- Optional details placed in expandable rows or secondary screens
