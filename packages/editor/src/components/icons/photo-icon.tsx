import type { SVGProps } from 'react';

export function PhotoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 165 162"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Photo"
      {...props}
    >
      <path
        d="M165 0V161.5H0V0H165ZM16 128.5H149V16H16L16 128.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
