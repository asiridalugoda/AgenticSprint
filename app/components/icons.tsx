import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function Icon({ size = 14, className = "", children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Internal navigation: "go to". */
export function ArrowRight(props: IconProps) {
  return (
    <Icon className="icon-arrow-right" {...props}>
      <path d="M2.5 8h11" />
      <path d="M9 3.5 13.5 8 9 12.5" />
    </Icon>
  );
}

/** External destination: "leaves this site". */
export function ArrowUpRight(props: IconProps) {
  return (
    <Icon className="icon-arrow-up-right" {...props}>
      <path d="M4 12 12 4" />
      <path d="M5.5 4H12v6.5" />
    </Icon>
  );
}

/** Return to top. */
export function ArrowUp(props: IconProps) {
  return (
    <Icon className="icon-arrow-up" {...props}>
      <path d="M8 13.5v-11" />
      <path d="M3.5 7 8 2.5 12.5 7" />
    </Icon>
  );
}

/** Feed / subscribe. */
export function FeedIcon(props: IconProps) {
  return (
    <Icon className="icon-feed" {...props}>
      <path d="M3 13a0.5 0.5 0 1 0 0.01 0" fill="currentColor" stroke="none" />
      <path d="M2.5 8.5a5 5 0 0 1 5 5" />
      <path d="M2.5 4.5a9 9 0 0 1 9 9" />
    </Icon>
  );
}
