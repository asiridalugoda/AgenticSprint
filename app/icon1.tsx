import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/**
 * The raster icon, rendered with the same engine and face as the share cards
 * so the tab, the home screen and the card carry one mark. 512 pixels is the
 * master; favicon.ico and the smaller sizes are derived from it.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  const newsreader = await readFile(join(process.cwd(), "public", "fonts", "newsreader-medium.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#faf9f6" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "408px",
            height: "408px",
            border: "26px solid #a0361a",
            color: "#a0361a",
            fontFamily: "Newsreader",
            fontSize: "300px",
            fontWeight: 500,
            lineHeight: 1,
            // The line box centres on the ascender, so the cap sits high; push it to the optical centre.
            paddingTop: "64px",
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Newsreader", data: newsreader, weight: 500, style: "normal" }] },
  );
}
