# Report Resource & Admin Review Dashboard

## Implementation Status

**Status: Complete**

All features specified below are implemented.

---

## Overview

Enable users to report problematic resources and provide admins with tools to review and resolve reports.

## User Reporting

### Report Button
- "Report Resource" button on resource and bundle detail pages
- Opens compact report form

### Report Form
- Reason selector (predefined options)
- Optional comment field
- Submit button
- Minimal design

## Admin Review Dashboard

### Report List View

#### Columns Displayed
- Resource title
- Report reason
- Status
- Date

#### Features
- Simple, filterable view
- Clean design (avoid dense data tables)
- Minimal visible elements by default

### Report Status Values
1. **Open** - New report, needs review
2. **In Review** - Admin is investigating
3. **Resolved** - Issue addressed
4. **Dismissed** - Report not actionable

### Report Detail View

When admin opens a report:
- Full report details
- Resource information
- Reporter comment
- Status change controls
- Action buttons

## UI Guidelines

- Adhere to clean UI philosophy
- Keep number of visible elements small
- Primary actions use accent color
- Secondary elements understated
- Mobile-friendly card layout when appropriate
