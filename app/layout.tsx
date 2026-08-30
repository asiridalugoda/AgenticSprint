import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";

import "./globals.css";
import "./figures.css";
import "./responsive.css";
import { SiteStructuredData } from "./components/structured-data";
import { site } from "@/lib/site";
import { socialImage } from "@/lib/social";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const homeTitle = `Agentic Sprint Manifesto · ${site.name}`;
const homeSocialImage = socialImage("manifesto", "Agentic Sprint Manifesto");

export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    default: homeTitle,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.author, url: site.authorUrl }],
  creator: site.author,
  publisher: site.name,
  category: "Technology",
  classification: "Software delivery methodology",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} · RSS feed` }],
      "application/atom+xml": [{ url: "/atom.xml", title: `${site.name} · Atom feed` }],
    },
  },
  openGraph: {
    type: "website",
    url: site.baseUrl,
    siteName: site.name,
    title: homeTitle,
    description: site.description,
    locale: "en_NZ",
    images: [homeSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: site.description,
    images: [homeSocialImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#faf9f6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ">
      <head>
        <link rel="describedby" href="/llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="Full document index" />
      </head>
      <body className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
        <a className="skip-link" href="#content">Skip to content</a>
        <SiteStructuredData />
        {children}
      </body>
    </html>
  );
}
