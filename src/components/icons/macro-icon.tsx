import { useId, type SVGProps } from 'react';
import { macroPath } from './macro-artwork';

export function MacroIcon(props: SVGProps<SVGSVGElement>) {
  const clipId = useId();
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="12" height="12" />
        </clipPath>
      </defs>
      <path clipPath={`url(#${clipId})`} d={macroPath} fill="currentColor" />
    </svg>
  );
}
