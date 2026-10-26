import type { SVGProps } from 'react';

export function AlignAuto(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M4 5h16M4 10h10M4 15h6" />
      <path d="m13 20 3.5-9 3.5 9m-5.8-3h4.6" />
    </svg>
  );
}
