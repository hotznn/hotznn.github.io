const DB_META = 'meta';
const DB_MODE_READWRITE = 'readwrite';
const DB_MODE_READONLY = 'readonly';
const Modules = {};
Modules.WooCache = (()=>{
  const DB_NAME = 'woo-cache';
  const DB_STORE_NAME = 'main';
  const DB_VERSION = 2;
  let dbInstance = null;
  return {
    async init() {
      const me = this;
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = event => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(DB_META)) {
            db.createObjectStore(DB_META, { keyPath: ['mod','name'] });
          }
          if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
            db.createObjectStore(DB_STORE_NAME, { keyPath: ['mod', 'name'] }); // 联合主键：mod + name
          }
        };
        request.onsuccess = event => {
          dbInstance = event.target.result;
          resolve(me);
        };
        request.onerror = event => reject(event.target.error);
      });
    },
    save(mod, name, value) {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(DB_STORE_NAME, DB_MODE_READWRITE);
        const store = tx.objectStore(DB_STORE_NAME);
        const data = { mod, name, value, version: Date.now() };
        store.put(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
     },
     load(mod, name) {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(DB_STORE_NAME, DB_MODE_READONLY);
        const store = tx.objectStore(DB_STORE_NAME);
        const request = store.get([mod, name]);
        request.onsuccess = () => resolve(request.result || {value:""} );
        request.onerror = () => reject(request.error);
      });
     },
     remove(mod, name) {
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(DB_STORE_NAME, DB_MODE_READWRITE);
        const store = tx.objectStore(DB_STORE_NAME);
        store.delete([mod, name]);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
     }
  }
})();
Modules.WooMail = (()=>{
  const DB_NAME = 'woo-mail';
  const DB_STORE_MAIL = 'mail';
  const DB_VERSION = 1;
  let dbInstance = null;
  return {
    async init() {
      const me = this;
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = event => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(DB_META)) {
            db.createObjectStore(DB_META, { keyPath: ['mod','name'] });
          }
          if (!db.objectStoreNames.contains(DB_STORE_MAIL)) {
            db.createObjectStore(DB_STORE_MAIL, { keyPath: ['rowid','created'] }); // 联合主键： rowid + created
          }
        };
        request.onsuccess = event => {
          dbInstance = event.target.result;
          resolve(me);
        };
        request.onerror = event => reject(event.target.error);
      });
    },
    save(rowid, sender, content){
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(DB_STORE_MAIL, DB_MODE_READWRITE);
        const store = tx.objectStore(DB_STORE_MAIL);
        const data = { rowid, sender, content, created: Date.now() };
        store.put(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
     },
     load(rowid){
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(DB_STORE_NAME, DB_MODE_READONLY);
        const store = tx.objectStore(DB_STORE_NAME);
        const request = store.get([rowid]);
        request.onsuccess = () => resolve(request.result || {rowid:"", sender:"", content:"", created:""} );
        request.onerror = () => reject(request.error);
      });
     },
     mails(){
        return new Promise((resolve, reject) => {
          const tx = dbInstance.transaction([DB_STORE_MAIL], DB_MODE_READONLY);
          const store = tx.objectStore(DB_STORE_MAIL);
          const request = store.getAll();
          request.onsuccess = () => resolve({name:"mails", items:[...request.result]});
          request.onerror = () => reject(request.error);
        });
     },
     remove(rowid){
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(DB_STORE_MAIL, DB_MODE_READWRITE);
        const store = tx.objectStore(DB_STORE_MAIL);
        store.delete([rowid]);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
     }
  }
})();

export default Object.freeze(await Modules.WooCache.init());
export const WooCache = Object.freeze(await Modules.WooCache.init());
export const WooMail = Object.freeze(await Modules.WooMail.init());