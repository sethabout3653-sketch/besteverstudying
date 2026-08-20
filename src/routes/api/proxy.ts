import { createFileRoute } from "@tanstack/react-router";

async function proxyHandler({ request }: { request: Request }) {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get("url");
  if (!targetUrl) {
    return new Response("Missing url param", { status: 400 });
  }

  try {
    const decodedUrl = targetUrl; // searchParams.get already decodes

    const forwardHeaders = new Headers();
    for (const [key, value] of request.headers.entries()) {
      const lKey = key.toLowerCase();
      // Forward everything except hop-by-hop and host-specific headers
      if (
        ![
          "host",
          "connection",
          "forwarded",
          "x-forwarded-for",
          "x-forwarded-proto",
          "x-forwarded-host",
        ].includes(lKey)
      ) {
        forwardHeaders.set(key, value);
      }
    }

    const fetchOpts: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
      redirect: "follow",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOpts.body = request.body;
      // @ts-expect-error - Required for passing ReadableStream in some Node.js versions
      fetchOpts.duplex = "half";
    }

    const res = await fetch(decodedUrl, fetchOpts);

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        ![
          "connection",
          "keep-alive",
          "transfer-encoding",
          "content-encoding",
          "x-frame-options",
          "content-security-policy",
          "content-security-policy-report-only",
          "cross-origin-opener-policy",
          "cross-origin-embedder-policy",
          "cross-origin-resource-policy",
        ].includes(lowerKey)
      ) {
        responseHeaders.set(key, value);
      }
    });

    // Always allow CORS for dynamic HTML5 video/audio streaming requests
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS",
    );
    responseHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("API Proxy Error:", err);
    return new Response("Proxy source failed", { status: 502 });
  }
}

export const Route = createFileRoute("/api/proxy")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const headers = new Headers();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "*");
        return new Response(null, { status: 204, headers });
      },
      GET: proxyHandler,
      POST: proxyHandler,
      PUT: proxyHandler,
      PATCH: proxyHandler,
      DELETE: proxyHandler,
    },
  },
});
