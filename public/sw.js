// sw.js

self.addEventListener('install', event => {
    console.log('Service Worker installed');
  });
  
  self.addEventListener('activate', event => {
    console.log('Service Worker activated');
  });
  
  // Listen for push events (requires Push API)
  self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || 'New Message';
    const options = {
      body: data.body || '',
      // icon: '/icon.png',
      // badge: '/icon.png'
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // When user clicks the notification
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/') // You can change this to your chat page
    );
  });
  