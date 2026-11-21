/* NadaAI — service worker: แค่ช่วยให้ "ติดตั้งลงหน้าจอหลัก" ได้ และเปิดแอปได้เร็วขึ้น/ออฟไลน์บางส่วน
   ไม่แตะคำขอไปยัง API ภายนอก (เช่น Google AI) เลย ปล่อยให้วิ่งผ่านเน็ตตามปกติเสมอ */
const CACHE = 'nadaai-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // ปล่อยผ่าน: เรียก AI, ฟอนต์ ฯลฯ ตามปกติ

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});