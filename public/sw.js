/* eslint-disable no-undef */
importScripts("/proxy/baremux-worker.js");
importScripts("/proxy/controller.sw.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const prefix = "/~/scramjet/";
  
  if (url.pathname.startsWith(prefix)) {
    const encodedTarget = event.request.url.split(prefix)[1];
    if (encodedTarget) {
      try {
        const targetUrl = new URL(decodeURIComponent(encodedTarget));
        const host = targetUrl.hostname.toLowerCase();
        
        // Bypass WASM and memory-heavy baremux transports for video streams
        if (
          host.includes("googlevideo") ||
          host.includes("videoplayback") ||
          host.includes("netflix") ||
          host.includes("twitch") ||
          targetUrl.pathname.endsWith(".m3u8") ||
          targetUrl.pathname.endsWith(".mp4") ||
          targetUrl.pathname.endsWith(".webm") ||
          targetUrl.pathname.endsWith(".ts") ||
          targetUrl.pathname.endsWith(".m4s") ||
          targetUrl.pathname.endsWith(".mp3")
        ) {
          const apiProxyUrl = "/api/proxy?url=" + encodeURIComponent(targetUrl.href);
          
          const fetchOpts = {
            method: event.request.method,
            headers: event.request.headers,
          };
          if (event.request.method !== "GET" && event.request.method !== "HEAD") {
            fetchOpts.body = event.request.body;
            // Note: In some older browsers, passing event.request.body requires duplex: 'half'
            fetchOpts.duplex = 'half';
          }
          
          // Forward the request natively to our server-side streaming proxy
          const proxyReq = new Request(apiProxyUrl, fetchOpts);
          
          event.respondWith(fetch(proxyReq));
          return;
        }
      } catch (err) {
        // ignore and fallback to scramjet
      }
    }
  }

  const isProxyPath = url.pathname.startsWith(prefix);
  const controller =
    typeof $scramjetController !== "undefined" ? $scramjetController : self.$scramjetController;
  if (controller) {
    const shouldRoute = isProxyPath || (typeof controller.shouldRoute === "function" && controller.shouldRoute(event));
    if (shouldRoute && typeof controller.route === "function") {
      event.respondWith(controller.route(event));
      return;
    }
  }
});
