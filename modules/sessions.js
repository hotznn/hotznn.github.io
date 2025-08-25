const DB_NAME = 'woo-sessions';
const DB_ROWID = 'uid';
const DB_TABLE_LIST = 'list';
const DB_TABLE_CURRENT = 'current';
const DB_MODE_READWRITE = 'readwrite';
const DB_MODE_READONLY = 'readonly';
const DB_ERROR_UserNotFound = 'User not found';
/**
 * WooSessions
 * @typedef {Object} WooSessions
 * @property {string} name - indexedDB database name
 * @property {IDBDatabase} db - indexedDB database object
 * @method init - initialize the database
 * @method at - retrieve a user from the database by uid
 * @method list - retrieve all users from the database
 * @method remove - remove a user from the database
 * @method current - set or retrieve the current user in the database
 * @method clear - clear the current user in the database
 * @method set - add or renew the token for a user in the database
 */
const Modules = {};
((Woo)=>{
  const WooSessions = ()=>{
    const DB_VERSION = 1;
    let dbInstance = null;
    return {
      name: null,
      async init(name = DB_NAME) {
        const me = this;
        this.name = name || DB_NAME;
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.name, DB_VERSION);
          request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(DB_TABLE_LIST)) {
              db.createObjectStore(DB_TABLE_LIST, { keyPath: DB_ROWID });
            }
            if (!db.objectStoreNames.contains(DB_TABLE_CURRENT)) {
              db.createObjectStore(DB_TABLE_CURRENT);
            }
          };
          request.onsuccess = event => {
            dbInstance = event.target.result;
            resolve(me);
          };
          request.onerror = event => reject(event.target.error);
        });
      },
      async at(uid) {
        return new Promise((resolve, reject) => {
          const tx = dbInstance.transaction([DB_TABLE_LIST], DB_MODE_READONLY);
          const store = tx.objectStore(DB_TABLE_LIST);
          const request = store.get(uid);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
      async list() {
        return new Promise((resolve, reject) => {
          const tx = dbInstance.transaction([DB_TABLE_LIST], DB_MODE_READONLY);
          const store = tx.objectStore(DB_TABLE_LIST);
          const request = store.getAll();
          request.onsuccess = () => resolve({name:"sessions", items:[...request.result]});
          request.onerror = () => reject(request.error);
        });
      },
      async remove(uid) {
        const tx = dbInstance.transaction([DB_TABLE_LIST], DB_MODE_READWRITE);
        const store = tx.objectStore(DB_TABLE_LIST);
        await store.delete(uid);
        const cu = await this.current();
        if (cu && cu.uid === uid) {
          await this.clear();
        }
        return tx.complete;
      },
      async current(uid) {
        const x = !!uid;
        if (x) {
          const user = await this.at(uid);
          if (!user) throw new Error(DB_ERROR_UserNotFound);
          const tx = dbInstance.transaction([DB_TABLE_CURRENT], DB_MODE_READWRITE);
          const store = tx.objectStore(DB_TABLE_CURRENT);
          await store.put(user, DB_TABLE_CURRENT);
          return tx.complete;
        }
        else {
          return new Promise((resolve, reject) => {
            const tx = dbInstance.transaction([DB_TABLE_CURRENT], DB_MODE_READONLY);
            const store = tx.objectStore(DB_TABLE_CURRENT);
            const request = store.get(DB_TABLE_CURRENT);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
      },
      async clear() {
        const tx = dbInstance.transaction([DB_TABLE_CURRENT], DB_MODE_READWRITE);
        const store = tx.objectStore(DB_TABLE_CURRENT);
        await store.delete(DB_TABLE_CURRENT);
        return tx.complete;
      },
      async set(uid="", nickname="", token="", sid=null) {
        const { avatarid } = (await this.at(uid) || { avatarid: "" });
        const user = { uid, nickname, token, sid, avatarid } ;
        const tx = dbInstance.transaction([DB_TABLE_LIST], DB_MODE_READWRITE);
        const store = tx.objectStore(DB_TABLE_LIST);
        await store.put(user);
        return tx.complete;
      },
      async avatar(uid="", avatarid=""){
        const  { nickname, token, sid } = ( await this.at(uid) || { nickname:"", token:"", sid:"", avatarid: "" } );
        const user = {uid, nickname, sid, token, avatarid};
        const tx = dbInstance.transaction([DB_TABLE_LIST], DB_MODE_READWRITE);
        const store = tx.objectStore(DB_TABLE_LIST);
        await store.put(user);
        return tx.complete;
      }
    }
  };
  Woo.WooSessions = WooSessions;
})(Modules);

export default Object.freeze(await Modules.WooSessions().init());
export const WooSessions = Object.freeze(await Modules.WooSessions().init());;