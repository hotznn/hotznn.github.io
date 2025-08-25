const Module = {};
((Woo)=>{
  const DBS = ()=>{
    return {
      name:"",
      version: "",
      db: null,
      async init(name, version=1, schemas = []) {
        this.name = name;
        this.version = version;
        this.schemas = schemas;
        return new Promise((resolve, reject) => {
          const x = indexedDB.open(this.name, this.version);
          x.onupgradeneeded = (event) => {
            const db = event.target.result;
            this.schemas.forEach(schema => {
              if (!db.objectStoreNames.contains(schema.name)) {
                const store = db.createObjectStore(schema.name, { keyPath: schema.keyPath || ['rowid', 'mod'], autoIncrement: !!schema.autoIncrement });
                (schema.indexes || []).forEach(index => {
                  store.createIndex(index.name, index.keyPath || index.name, { unique: !!index.unique });
                });
              }
            });
          };
          x.onsuccess = () => {
            this.db = x.result;
            resolve(this);
          };
          x.onerror = () => reject(x.error);
        });
      },
      async getStore(name, mode = 'readonly') {
        const tx = this.db.transaction(name, mode);
        return tx.objectStore(name);
      },
      async save(name, data) {
        const store = await this.getStore(name, 'readwrite');
        return new Promise((resolve, reject) => {
          const x = store.put(data);
          x.onsuccess = () => resolve(x.result);
          x.onerror = () => reject(x.error);
        });
      },
      async load(name, rowid) {
        const store = await this.getStore(name);
        return new Promise((resolve, reject) => {
          const x = store.get(rowid);
          x.onsuccess = () => resolve(x.result);
          x.onerror = () => reject(x.error);
        });
      },
      async all(name) {
        const store = await this.getStore(name);
        return new Promise((resolve, reject) => {
          const x = store.getAll();
          x.onsuccess = () => resolve(x.result);
          x.onerror = () => reject(x.error);
        });
      },
      async remove(name, rowid) {
        const store = await this.getStore(name, 'readwrite');
        return new Promise((resolve, reject) => {
          const x = store.delete(rowid);
          x.onsuccess = () => resolve();
          x.onerror = () => reject(x.error);
        });
      },
      async search(name, { idx, query = null, offset = 0, limit = 10 } = {}) {
        const store = await this.getStore(name);
        const source = idx ? store.index(idx) : store;
        return new Promise((resolve, reject) => {
          const result = [];
          let skipped = 0;
          const x = source.openCursor(query);
          x.onsuccess = () => {
            const cursor = x.result;
            if (!cursor) {
              resolve(result);
              return;
            }
            if (skipped < offset) {
              skipped++;
              cursor.continue();
              return;
            }
            if (result.length < limit) {
              result.push(cursor.value);
              cursor.continue();
            } else {
              resolve(result);
            }
          };
          x.onerror = () => reject(x.error);
        });
      }
    }
  };
  //@schemas: [{ name: 'cache', keyPath: ['rowid','mod'], indexes: [{name: 'name', keyPath: 'name'}] }]
  Woo.Store = (name, version=1, schemas = [])=>{
    return DBS().init(name, version, schemas);
  }
  Object.freeze(Woo);
})(Module);
export default Module.Store;
export const WooStore = Module.Store;
