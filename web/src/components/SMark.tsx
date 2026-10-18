import React from "react";

interface SMarkProps {
  size?: number;
  className?: string;
}

export const SMark: React.FC<SMarkProps> = ({ size = 38, className = "" }) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: "#0C0C0C",
      }}
      aria-label="BYSAAD Logo Mark"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        {/* Background square #0C0C0C */}
        <rect width="40" height="40" fill="#0C0C0C" />

        {/* Outer Frame: Open outline square in #C8F135 (strokeWidth="2.6")
            Top-right corner intentionally open with a clear, sharp gap.
            Path moves from top gap point (25, 4.5) -> top-left (4.5, 4.5) ->
            bottom-left (4.5, 35.5) -> bottom-right (35.5, 35.5) -> right gap point (35.5, 14.5).
            The top-right corner from (25, 4.5) to (35.5, 14.5) is open. */}
        <path
          d="M 25 4.5 L 4.5 4.5 L 4.5 35.5 L 35.5 35.5 L 35.5 14.5"
          stroke="#C8F135"
          strokeWidth="2.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* Center letter: Uppercase S rendered in DM Sans Bold 700 in #F2F2F2 */}
        <text
          x="20"
          y="22"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#F2F2F2"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "19px",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          S
        </text>

        {/* Accent dash: A short horizontal white (#F2F2F2) dash positioned in the bottom-left inside the frame, tight below the S */}
        <line
          x1="9"
          y1="30.5"
          x2="16.5"
          y2="30.5"
          stroke="#F2F2F2"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
};

export default SMark;
