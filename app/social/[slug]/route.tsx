import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getSocialPage, SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH, socialPages } from "@/lib/social";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;
export const contentType = "image/png";
export const size = { width: SOCIAL_IMAGE_WIDTH, height: SOCIAL_IMAGE_HEIGHT };

export function generateStaticParams() {
  return socialPages.map((page) => ({ slug: page.slug }));
}

const paper = "#faf9f6";
const ink = "#1a1917";
const muted = "#5c5955";
const rule = "#c9c3b7";
const accent = "#a0361a";

/**
 * The renderer needs font files rather than CSS, so the three faces the card
 * uses are vendored under public/fonts. If a file is missing the card still
 * renders in the renderer's default face rather than failing the build.
 */
async function loadFonts() {
  const directory = join(process.cwd(), "public", "fonts");
  const faces = [
    { name: "Newsreader", file: "newsreader-regular.woff", weight: 400 as const, style: "normal" as const },
    { name: "Newsreader", file: "newsreader-medium.woff", weight: 500 as const, style: "normal" as const },
    { name: "Newsreader", file: "newsreader-italic.woff", weight: 400 as const, style: "italic" as const },
    { name: "IBM Plex Mono", file: "plex-mono-medium.woff", weight: 500 as const, style: "normal" as const },
  ];
  const loaded = await Promise.all(
    faces.map(async (face) => {
      try {
        const data = await readFile(join(directory, face.file));
        return { name: face.name, data, weight: face.weight, style: face.style };
      } catch {
        return undefined;
      }
    }),
  );
  return loaded.filter((face): face is NonNullable<typeof face> => Boolean(face));
}

function pathLabel(path: string) {
  return path === "/" ? site.domain : `${site.domain}${path}`;
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const page = getSocialPage(slug);
  if (!page) return new Response("Social image not found", { status: 404 });

  const fonts = await loadFonts();
  const serif = fonts.some((font) => font.name === "Newsreader") ? "Newsreader" : "serif";
  const mono = fonts.some((font) => font.name === "IBM Plex Mono") ? "IBM Plex Mono" : "monospace";
  const kicker = page.documentId ? `${page.documentId} · ${page.type}` : page.type;
  const long = page.title.length > 44;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: paper,
          color: ink,
          padding: "56px 64px 52px",
          fontFamily: serif,
          border: `1px solid ${rule}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: mono, fontSize: "20px", letterSpacing: "3px", textTransform: "uppercase" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", border: `2px solid ${accent}`, color: accent, fontFamily: serif, fontSize: "22px", fontWeight: 500, letterSpacing: 0 }}>A</div>
            <div style={{ display: "flex", color: ink }}>{site.name}</div>
          </div>
          <div style={{ display: "flex", color: accent }}>{kicker}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "26px", maxWidth: "1040px", marginTop: "24px" }}>
          <div style={{ display: "flex", fontSize: long ? "58px" : "72px", lineHeight: 1.04, fontWeight: 400, letterSpacing: long ? "-1.5px" : "-2px" }}>
            {page.title}
          </div>
          <div style={{ display: "flex", maxWidth: "960px", color: muted, fontSize: "27px", lineHeight: 1.32, fontStyle: "italic" }}>
            {page.description}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "24px", borderTop: `1px solid ${rule}`, color: muted, fontFamily: mono, fontSize: "18px", letterSpacing: "1px" }}>
          <div style={{ display: "flex", gap: "18px" }}>
            <span style={{ color: ink }}>v{site.version}</span>
            <span>{site.author}</span>
          </div>
          <div style={{ display: "flex" }}>{pathLabel(page.canonicalPath)}</div>
        </div>
      </div>
    ),
    {
      width: SOCIAL_IMAGE_WIDTH,
      height: SOCIAL_IMAGE_HEIGHT,
      fonts: fonts.length ? fonts : undefined,
    },
  );
}
