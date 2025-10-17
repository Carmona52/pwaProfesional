import { openDB } from 'idb';

const DB_NAME = 'mensajes-db';
const STORE_NAME = 'mensajes';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function addMessage(text: string, contact: string) {
  const db = await getDB();
  await db.add(STORE_NAME, {
    text,
    contact,
    timestamp: new Date().toISOString(),
  });
}

export async function getMessages() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deleteMessage(id: number) {
  const db = await getDB();
  await db.delete(STORE_NAME,id)
}

export async function clearMessages() {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
}