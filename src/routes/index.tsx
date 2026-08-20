import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";

import { BrowserShell } from "@/components/browser/BrowserShell";
import { SettingsProvider } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frosted — Proxy Browser & Games Hub" },
      {
        name: "description",
        content:
          "Frosted is a web browser and games library in one clean blue-and-black workspace.",
      },
      { property: "og:title", content: "Frosted — Proxy Browser & Games Hub" },
      {
        property: "og:description",
        content:
          "Browse the web through a fast proxy and play games in one clean blue-and-black workspace.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <SettingsProvider>
      <ClientOnly fallback={<div className="h-screen h-[100dvh] w-full bg-background" />}>
        <BrowserShell />
      </ClientOnly>
    </SettingsProvider>
  );
}
