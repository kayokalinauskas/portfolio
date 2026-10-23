import { ImageResponse } from "next/og";

// O ícone da tela inicial do iPhone: o mesmo desenho do icon.svg, sem os cantos
// arredondados (o iOS arredonda sozinho) e com o fundo até a borda.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function IconeDoIphone() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#073642" }}>
      <svg width="180" height="180" viewBox="0 0 64 64">
        <path d="M15 22l11 10-11 10" fill="none" stroke="#fdf6e3" strokeWidth="5" strokeLinecap="square" />
        <rect x="31" y="39" width="18" height="5" fill="#b58900" />
      </svg>
    </div>,
    size,
  );
}
