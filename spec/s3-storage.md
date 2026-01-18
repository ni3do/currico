# S3-Compatible Storage Implementation Plan

## Overview

Add provider-agnostic S3-compatible object storage to Easy-Lehrer, replacing local filesystem storage. Optimized for Infomaniak Object Storage with Swiss data residency.

## Requirements Summary

| Requirement | Decision |
|-------------|----------|
| Provider | Infomaniak Object Storage (S3-compatible, Swiss) |
| Bucket structure | Two buckets: public (previews, avatars) + private (resources) |
| Access control | Signed URLs for paid/private resources |
| Abstraction | Provider-agnostic layer (switchable) |
| Migration | None needed (no existing files) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Routes                           │
│  /api/upload  /api/resources  /api/users/me/avatar     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Storage Abstraction (lib/storage/)         │
│  getStorage() → StorageProvider interface               │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│ LocalAdapter    │      │ S3Adapter       │
│ (development)   │      │ (production)    │
│ fs/promises     │      │ @aws-sdk/s3     │
└─────────────────┘      └─────────────────┘
```

---

## Tasks

### Phase 1: Core Infrastructure

#### Task 1.1: Create storage type definitions
- [ ] Create `lib/storage/types.ts`
- [ ] Define `StorageConfig` interface
- [ ] Define `UploadOptions` interface
- [ ] Define `UploadResult` interface
- [ ] Define `SignedUrlOptions` interface
- [ ] Define `DeleteOptions` interface
- [ ] Define `StorageProvider` interface with methods: `upload`, `getSignedUrl`, `getPublicUrl`, `delete`, `exists`, `getFile`
- [ ] Define `FileCategory` type (`resource` | `preview` | `avatar`)
- [ ] Define `FILE_CATEGORY_CONFIG` mapping categories to buckets/prefixes

#### Task 1.2: Create storage error handling
- [ ] Create `lib/storage/errors.ts`
- [ ] Define `StorageErrorCode` type
- [ ] Create `StorageError` class extending `Error`
- [ ] Create `isStorageError()` type guard

#### Task 1.3: Create local storage adapter
- [ ] Create `lib/storage/adapters/local.ts`
- [ ] Implement `LocalStorageAdapter` class
- [ ] Implement `upload()` - write file with `fs/promises`
- [ ] Implement `getSignedUrl()` - return API proxy URL
- [ ] Implement `getPublicUrl()` - return `/uploads/...` path
- [ ] Implement `delete()` - remove file with `unlink()`
- [ ] Implement `exists()` - check with `access()`
- [ ] Implement `getFile()` - read with `readFile()`

#### Task 1.4: Create storage factory
- [ ] Create `lib/storage/index.ts`
- [ ] Create `getStorageConfig()` to read env vars
- [ ] Create `getStorage()` singleton factory
- [ ] Create `generateStorageKey()` for unique file keys
- [ ] Create `parseStorageUrl()` for legacy URL handling
- [ ] Export all types from `types.ts`

---

### Phase 2: S3 Adapter

#### Task 2.1: Install AWS SDK
- [ ] Run `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- [ ] Verify packages in `package.json`

#### Task 2.2: Create S3 storage adapter
- [ ] Create `lib/storage/adapters/s3.ts`
- [ ] Implement `S3StorageAdapter` class
- [ ] Initialize `S3Client` with endpoint, region, credentials
- [ ] Implement `upload()` using `PutObjectCommand`
- [ ] Set `public-read` ACL for public bucket uploads
- [ ] Implement `getSignedUrl()` using `getSignedUrl` from presigner
- [ ] Implement `getPublicUrl()` - construct CDN URL
- [ ] Implement `delete()` using `DeleteObjectCommand`
- [ ] Implement `exists()` using `HeadObjectCommand`
- [ ] Implement `getFile()` using `GetObjectCommand`

#### Task 2.3: Add environment variables
- [ ] Update `.env.example` with `STORAGE_PROVIDER`
- [ ] Add `S3_ENDPOINT`, `S3_REGION`
- [ ] Add `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- [ ] Add `S3_PUBLIC_BUCKET`, `S3_PRIVATE_BUCKET`
- [ ] Add `S3_PUBLIC_BUCKET_URL` (optional CDN)
- [ ] Add `NEXT_PUBLIC_STORAGE_PUBLIC_URL` for frontend

---

### Phase 3: Update Upload Routes

#### Task 3.1: Refactor `/api/upload/route.ts`
- [ ] Import `getStorage`, `generateStorageKey` from `lib/storage`
- [ ] Remove direct `fs/promises` imports
- [ ] Replace `writeFile()` with `storage.upload()`
- [ ] Determine bucket from `fileType` parameter (preview → public, resource → private)
- [ ] Generate key using `generateStorageKey()`
- [ ] Return storage key in response (not local path)
- [ ] Update error handling with `StorageError`

#### Task 3.2: Refactor `/api/resources/route.ts` POST handler
- [ ] Import storage utilities
- [ ] Remove `mkdir()` and `writeFile()` calls
- [ ] Upload main file to private bucket with `storage.upload()`
- [ ] Upload preview to public bucket if provided
- [ ] Store storage keys in `file_url` and `preview_url` fields
- [ ] Update cleanup logic on failure to use `storage.delete()`

#### Task 3.3: Refactor `/api/users/me/avatar/route.ts`
- [ ] Import storage utilities
- [ ] Remove direct filesystem operations
- [ ] Upload avatar to public bucket
- [ ] Store public URL in `user.image` field
- [ ] Update DELETE handler to call `storage.delete()`

---

### Phase 4: Update Download Routes

#### Task 4.1: Refactor `/api/resources/[id]/download/route.ts`
- [ ] Import storage utilities
- [ ] Parse stored URL with `parseStorageUrl()`
- [ ] For S3 provider: generate signed URL and return `redirect()`
- [ ] For local provider: read file and return `new Response()`
- [ ] Set `Content-Disposition` header with sanitized filename
- [ ] Handle legacy `/uploads/...` URLs for backward compatibility

#### Task 4.2: Refactor `/api/download/[token]/route.ts`
- [ ] Import storage utilities
- [ ] Same pattern as authenticated download
- [ ] Generate signed URL with filename for Content-Disposition
- [ ] Return redirect to signed URL (S3) or stream file (local)

#### Task 4.3: Create local storage proxy route (optional)
- [ ] Create `app/api/storage/download/[...key]/route.ts`
- [ ] Validate authentication
- [ ] Read file from local storage
- [ ] Return file as response
- [ ] This handles signed URLs from LocalAdapter

---

### Phase 5: Frontend Updates

#### Task 5.1: Create client-side URL resolver
- [ ] Create `lib/storage/client.ts`
- [ ] Create `resolveStorageUrl(url, bucket)` function
- [ ] Handle full URLs (passthrough)
- [ ] Handle legacy `/uploads/...` URLs
- [ ] Handle storage keys (prepend CDN URL)
- [ ] Read `NEXT_PUBLIC_STORAGE_PUBLIC_URL` env var

#### Task 5.2: Update resource preview display
- [ ] Find components displaying `Resource.preview_url`
- [ ] Import `resolveStorageUrl` from client module
- [ ] Wrap preview URLs with resolver
- [ ] Test preview images load correctly

#### Task 5.3: Update avatar display
- [ ] Find components displaying `User.image`
- [ ] Import `resolveStorageUrl` from client module
- [ ] Wrap avatar URLs with resolver
- [ ] Test avatars load correctly

---

### Phase 6: Testing

#### Task 6.1: Write unit tests for LocalStorageAdapter
- [ ] Create `__tests__/lib/storage/local.test.ts`
- [ ] Test `upload()` creates file at correct path
- [ ] Test `getSignedUrl()` returns API proxy URL
- [ ] Test `delete()` removes file
- [ ] Test `exists()` returns correct boolean
- [ ] Test `getFile()` returns buffer

#### Task 6.2: Write unit tests for S3StorageAdapter
- [ ] Create `__tests__/lib/storage/s3.test.ts`
- [ ] Mock `@aws-sdk/client-s3`
- [ ] Test `upload()` calls `PutObjectCommand` with correct params
- [ ] Test public bucket uploads include `ACL: public-read`
- [ ] Test `getSignedUrl()` generates valid URL
- [ ] Test `delete()` calls `DeleteObjectCommand`

#### Task 6.3: Write integration tests for upload routes
- [ ] Test `/api/upload` with mock storage
- [ ] Test `/api/resources` POST with file upload
- [ ] Test `/api/users/me/avatar` upload
- [ ] Verify storage keys stored in database

#### Task 6.4: Write integration tests for download routes
- [ ] Test `/api/resources/[id]/download` returns file or redirect
- [ ] Test `/api/download/[token]` for guest downloads
- [ ] Test access control (purchased vs not purchased)

#### Task 6.5: Manual testing checklist
- [ ] Local storage: upload resource, verify file in `public/uploads/`
- [ ] Local storage: download resource, verify file streams correctly
- [ ] Local storage: upload avatar, verify displays correctly
- [ ] S3 storage: upload resource, verify in Infomaniak console
- [ ] S3 storage: download resource, verify signed URL redirect
- [ ] S3 storage: preview images load via CDN

---

## Files to Create

| Path | Description |
|------|-------------|
| `lib/storage/types.ts` | Type definitions |
| `lib/storage/errors.ts` | Error classes |
| `lib/storage/adapters/local.ts` | Local filesystem adapter |
| `lib/storage/adapters/s3.ts` | S3-compatible adapter |
| `lib/storage/index.ts` | Factory and utilities |
| `lib/storage/client.ts` | Client-side URL resolver |
| `app/api/storage/download/[...key]/route.ts` | Local proxy route (optional) |

## Files to Modify

| Path | Changes |
|------|---------|
| `app/api/upload/route.ts` | Use storage abstraction |
| `app/api/resources/route.ts` | Use storage for file upload |
| `app/api/users/me/avatar/route.ts` | Use storage for avatars |
| `app/api/resources/[id]/download/route.ts` | Signed URLs or proxy |
| `app/api/download/[token]/route.ts` | Signed URLs for guest |
| `.env.example` | Add storage config vars |
| `package.json` | Add AWS SDK dependencies |

---

## Database URL Strategy

| Field | Stored Value | Resolution |
|-------|--------------|------------|
| `Resource.file_url` | `resources/user123/abc.pdf` | Private: signed URL on demand |
| `Resource.preview_url` | `previews/user123/xyz.png` | Public: CDN URL |
| `User.image` | `avatars/user123/avatar.jpg` | Public: CDN URL |

Legacy URLs (`/uploads/...`) continue working via backward-compatible parsing.

---

## Infomaniak Setup (Production)

1. Create Object Storage in Infomaniak console
2. Create two buckets: `easylehrer-public`, `easylehrer-private`
3. Set public bucket policy to allow public read
4. Generate access keys (Access Key ID + Secret)
5. Configure environment variables in Dokploy
