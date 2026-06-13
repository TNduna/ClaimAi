// lib/db.js (classic script)
// Lightweight IndexedDB helper exposing ClaimAiDB on `self` for service-worker importScripts()
(function () {
  class ClaimAiDB {
    constructor() {
      // Use V2 database name to avoid legacy corrupted schemas
      this.dbName = 'ClaimAiDatabaseV2';
      this.dbVersion = 1;
      this.db = null;
    }

    init() {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(this.dbName, this.dbVersion);

          request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));

          request.onsuccess = () => {
            this.db = request.result;
            resolve();
          };

          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('icd10')) {
              db.createObjectStore('icd10', { keyPath: 'code' });
            }
          };
        } catch (err) {
          reject(err);
        }
      });
    }

    bulkInsertAll(items) {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        try {
          const transaction = this.db.transaction(['icd10'], 'readwrite');
          const store = transaction.objectStore('icd10');

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error || new Error('Transaction failed'));
          transaction.onabort = () => reject(new Error('Transaction aborted'));

          for (const item of items) {
            if (item && item.code) {
              store.put(item);
            }
          }
        } catch (err) {
          reject(err);
        }
      });
    }

    getCode(normalizedCode) {
      return new Promise(async (resolve, reject) => {
        try {
          if (!this.db) await this.init();
          const transaction = this.db.transaction(['icd10'], 'readonly');
          const store = transaction.objectStore('icd10');
          const req = store.get(normalizedCode);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    }

    countRecords() {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }
        try {
          const transaction = this.db.transaction(['icd10'], 'readonly');
          const store = transaction.objectStore('icd10');
          const req = store.count();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  // Expose to global scope for importScripts() consumers
  try {
    self.ClaimAiDB = ClaimAiDB;
  } catch (e) {
    // noop
  }
})();
