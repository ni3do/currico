# Multi-Stage Resource Upload Workflow

## Implementation Status

**Status: UI Only**

- Multi-step wizard UI: Implemented
- Form validation: Implemented
- File upload backend: Not implemented
- Watermarking system: Not implemented
- Resource creation API: Not implemented

---

## Overview

Provide a guided, multi-step upload process for resources with competence code integration.

## Upload Steps

### Step 1: Basics

- Title
- Short description
- Language
- Resource type

### Step 2: Curriculum

- Cycle
- Main subject
- Canton
- Lehrplan 21 competence codes (chosen from searchable dropdowns)

### Step 3: Properties

- Price type (free/paid)
- Price
- Editability
- License scope

### Step 4: Files & Preview

- Upload resource files
- Upload preview files
- Configure watermark/low-res mode for previews
- Publish

## UI Guidelines

### Progress Indicator
- Minimal UI progress indicator
- Steps clearly labeled

### Field Display
- Each step shows only a focused subset of fields
- Prevents form overload

### Navigation Buttons
- "Next" and "Publish" use platform's main accent color
- "Back" and "Cancel" are understated text or ghost buttons

### Competence Code Selection
- Structured selection from Lehrplan 21
- Searchable dropdown interface
- Clear hierarchy display
