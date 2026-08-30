#!/usr/bin/env node
/**
 * Refresh the font files the Open Graph image renderer uses.
 *
 * next/font serves the site's type, but the image renderer needs raw TTF
 * files, so the faces the card uses are vendored under public/fonts. Google
 * Fonts serves TTF to a sufficiently old user agent, one face per request.
 *
 *   node scripts/fetch-og-fonts.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = join(fileURLToPath(new URL("..", import.meta.url)), "public", "fonts");
const userAgent = "Mozilla/5.0 (Windows NT 6.1; rv:8.0) Gecko/20100101 Firefox/8.0";

const faces = [
  ["Newsreader:wght@400", "newsreader-regular.woff"],
  ["Newsreader:wght@500", "newsreader-medium.woff"],
  ["Newsreader:ital,wght@1,400", "newsreader-italic.woff"],
  ["IBM+Plex+Mono:wght@500", "plex-mono-medium.woff"],
];

async function text(url) {
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response.text();
}

async function bytes(url) {
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

mkdirSync(directory, { recursive: true });
for (const [family, file] of faces) {
  const sheet = await text(`https://fonts.googleapis.com/css2?family=${family}`);
  const urls = [...sheet.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
  if (!urls.length) throw new Error(`No font URL returned for ${family}`);
  const data = await bytes(urls[urls.length - 1]);
  // The renderer reads TrueType, OpenType (CFF) and WOFF, but not WOFF2.
  const magic = data.subarray(0, 4);
  const kind = magic.equals(Buffer.from([0, 1, 0, 0])) ? "TrueType" : { OTTO: "OpenType", true: "TrueType", wOFF: "WOFF" }[magic.toString("latin1")];
  if (!kind) throw new Error(`${file} is not a TrueType, OpenType or WOFF file (magic ${JSON.stringify(magic.toString("latin1"))}); the renderer cannot use it`);
  writeFileSync(join(directory, file), data);
  console.log(`${file}: ${data.length} bytes, ${kind}`);
}
