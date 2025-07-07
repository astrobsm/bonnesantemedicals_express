// Service worker for offline/PWA support. This file is copied from the root service-worker directory during deployment.

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('astrobsm-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/scripts.js',
                // '/api/*', // Removed: wildcard caching is not supported and causes 404s
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-crud-operations') {
        event.waitUntil(syncCRUDOperations());
    }
});

async function syncCRUDOperations() {
    const db = await openDB('AstroBSM', 1);
    const tx = db.transaction('formData', 'readonly');
    const allData = await tx.store.getAll();

    // Example: Send data to the server
    await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(allData),
    });

    console.log('Data synced successfully.');
}
