// lib/db.js (classic script)
// Lightweight IndexedDB helper exposing ClaimAiDB on `self` for service-worker importScripts()
(function () {
  class ClaimAiDB {
    constructor() {
      // Use V2 database name to avoid legacy corrupted schemas
      this.dbName = 'ClaimAiDatabaseV2';
      this.dbVersion = 2; // Increment version to apply schema changes
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
            if (!db.objectStoreNames.contains('rules')) {
              db.createObjectStore('rules', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('morbidity_standards')) {
              db.createObjectStore('morbidity_standards', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('metadata')) {
              db.createObjectStore('metadata', { keyPath: 'key' });
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

          transaction.oncomplete = () => {
            console.log(`ClaimAiDB: bulkInsertAll transaction completed successfully for ${items.length} items.`);
            resolve();
          };
          transaction.onerror = (event) => {
            const error = transaction.error || (event.target && event.target.error) || new Error('Transaction failed');
            console.error('ClaimAiDB: bulkInsertAll transaction error:', error);
            reject(error);
          };
          transaction.onabort = (event) => {
            const error = transaction.error || new Error('Transaction aborted');
            console.error('ClaimAiDB: bulkInsertAll transaction aborted:', error);
            reject(error);
          };

          for (const item of items) {
            if (item && item.code) {
              const req = store.put(item);
              req.onerror = (e) => {
                console.error(`ClaimAiDB: Error putting item ${item.code}:`, e.target.error);
              };
            }
          }
        } catch (err) {
          console.error('ClaimAiDB: Exception in bulkInsertAll:', err);
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

    async isFullySeeded(expectedMinCount = 50000) {
      try {
        if (!this.db) await this.init();
        const count = await this.countRecords();
        console.log(`ClaimAiDB: Current database record count is ${count} (expected min: ${expectedMinCount})`);
        return count >= expectedMinCount;
      } catch (err) {
        console.error('ClaimAiDB: Error checking if fully seeded:', err);
        return false;
      }
    }

    storeRules(rulesJson) {
      return this._putItem('rules', { id: 'hard-rules', rules: rulesJson });
    }

    getRules() {
      return this._getItem('rules', 'hard-rules').then(res => res ? res.rules : null);
    }

    storeStandards(sections) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(['morbidity_standards'], 'readwrite');
          const store = transaction.objectStore('morbidity_standards');
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
          for (const sec of sections) {
            store.put(sec);
          }
        } catch (e) {
          reject(e);
        }
      });
    }

    getStandards() {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(['morbidity_standards'], 'readonly');
          const store = transaction.objectStore('morbidity_standards');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    }

    setMetadata(key, value) {
      return this._putItem('metadata', { key, value });
    }

    getMetadata(key) {
      return this._getItem('metadata', key).then(res => res ? res.value : null);
    }

    _putItem(storeName, item) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const req = store.put(item);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    }

    _getItem(storeName, key) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
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
