import { openDB } from 'idb';

const DB_NAME = 'AstroBSM';
const DB_VERSION = 1;
const STORE_NAME = 'formData';

export const initDB = async () => {
    try {
        return openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    // Add indexes for frequently queried fields
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('email', 'email', { unique: true });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            },
        });
    } catch (error) {
        console.error('Failed to initialize the database:', error);
        throw error;
    }
};

export const saveFormData = async (data) => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.store.add(data);
        await tx.done;
    } catch (error) {
        console.error('Failed to save form data:', error);
        throw error;
    }
};

export const fetchFormData = async () => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const allData = await tx.store.getAll();
        await tx.done;
        return allData;
    } catch (error) {
        console.error('Failed to fetch form data:', error);
        throw error;
    }
};

export const deleteFormData = async (id) => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.store.delete(id);
        await tx.done;
    } catch (error) {
        console.error('Failed to delete form data:', error);
        throw error;
    }
};
