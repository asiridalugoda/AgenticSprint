import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/** The home-screen icon: the same mark, full bleed, at the size iOS asks for. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const newsreader = await readFile(join(process.cwd(), "public", "fonts", "newsreader-medium.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#faf9f6" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "144px",
            height: "144px",
            border: "9px solid #a0361a",
            color: "#a0361a",
            fontFamily: "Newsreader",
            fontSize: "106px",
            fontWeight: 500,
            lineHeight: 1,
            paddingTop: "22px",
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Newsreader", data: newsreader, weight: 500, style: "normal" }] },
  );
}
