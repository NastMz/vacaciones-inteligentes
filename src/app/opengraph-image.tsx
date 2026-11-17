import { ImageResponse } from "next/og";

export const alt = "Vacaciones Inteligentes Colombia — vacation planner for Colombian holidays";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse cannot read CSS custom properties; these mirror src/app/tokens.css.
const PAPER = "#f7eee0";
const INK = "#142335";
const SUN_STRONG = "#a83c18";
const SUN = "#e9743a";
const SEA = "#0a7474";

/** Fetch the display face as TTF; fall back to the default font if offline. */
async function loadDisplayFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&text=${encodeURIComponent(text)}`,
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

const HEADLINE = "Estira tus vacaciones.";
const TAGLINE = "Festivos y puentes de Colombia · vacaciones inteligentes";

export default async function OpengraphImage() {
  const display = await loadDisplayFont(HEADLINE + TAGLINE);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: PAPER,
          color: INK,
          fontFamily: display ? "Bricolage" : "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 90,
            width: 150,
            height: 150,
            borderRadius: 9999,
            background: SUN,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4 }}>
          <span>Estira tus</span>
          <span style={{ color: SUN_STRONG }}>vacaciones.</span>
        </div>
        <div style={{ fontSize: 34, marginTop: 36, color: SEA, fontWeight: 800 }}>
          {TAGLINE}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: display ? [{ name: "Bricolage", data: display, weight: 800, style: "normal" }] : [],
    },
  );
}
