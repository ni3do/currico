/**
 * IndexedDB storage for upload draft files.
 * File objects can't be serialized to localStorage, so we use IndexedDB
 * to persist them across page refreshes.
 */

const DB_NAME = "currico_drafts";
const STORE_NAME = "draft_files";
const DB_VERSION = 1;

interface StoredFile {
  key: string;
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

/**
 * Save draft files to IndexedDB.
 * @param key - Storage key (e.g., "main_files" or "preview_files")
 * @param files - Array of File objects to persist
 */
export async function saveDraftFiles(key: string, files: File[]): Promise<void> {
  if (!isIndexedDBAvailable() || files.length === 0) return;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const stored: StoredFile = {
      key,
      name: JSON.stringify(files.map((f) => f.name)),
      type: JSON.stringify(files.map((f) => f.type)),
      lastModified: Date.now(),
      blob: new Blob(
        files.map((f) => f),
        { type: "application/octet-stream" }
      ),
    };

    // Store individual files for proper reconstruction
    // Clear existing entries for this key first
    store.delete(key);

    // Store file metadata + blobs as separate entries
    for (let i = 0; i < files.length; i++) {
      const fileEntry: StoredFile = {
        key: `${key}_${i}`,
        name: files[i].name,
        type: files[i].type,
        lastModified: files[i].lastModified,
        blob: files[i],
      };
      store.put(fileEntry);
    }

    // Store the count
    store.put({
      key: `${key}_count`,
      name: String(files.length),
      type: "",
      lastModified: Date.now(),
      blob: new Blob(),
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to save draft files to IndexedDB:", error);
  }
}

/**
 * Load draft files from IndexedDB.
 * @param key - Storage key used when saving
 * @returns Array of reconstructed File objects
 */
export async function loadDraftFiles(key: string): Promise<File[]> {
  if (!isIndexedDBAvailable()) return [];

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    // Get count
    const countEntry = await new Promise<StoredFile | undefined>((resolve, reject) => {
      const req = store.get(`${key}_count`);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!countEntry) {
      db.close();
      return [];
    }

    const count = parseInt(countEntry.name, 10);
    if (isNaN(count) || count === 0) {
      db.close();
      return [];
    }

    const files: File[] = [];
    for (let i = 0; i < count; i++) {
      const entry = await new Promise<StoredFile | undefined>((resolve, reject) => {
        const req = store.get(`${key}_${i}`);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (entry) {
        const file = new File([entry.blob], entry.name, {
          type: entry.type,
          lastModified: entry.lastModified,
        });
        files.push(file);
      }
    }

    db.close();
    return files;
  } catch (error) {
    console.error("Failed to load draft files from IndexedDB:", error);
    return [];
  }
}

/**
 * Clear all draft files from IndexedDB.
 */
export async function clearDraftFiles(): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to clear draft files from IndexedDB:", error);
  }
}
