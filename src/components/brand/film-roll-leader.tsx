import { useId, type SVGProps } from 'react';

interface FilmRollLeaderProps extends SVGProps<SVGSVGElement> {
  scale?: number;
}

/** Repeats perforations at their original pitch for any exposed leader length. */
export function FilmRollLeader({ scale = 1, ...props }: FilmRollLeaderProps) {
  const patternId = `film-leader-${useId().replace(/:/g, '')}`;
  return (
    <svg
      width={64 * scale}
      height={56 * scale}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          x="100%"
          width={64 * scale}
          height={56 * scale}
          patternUnits="userSpaceOnUse"
        >
          <path
            transform={`scale(${scale})`}
            d="M64 56H0V0H64V56ZM2.5 53H5.5V49H2.5V53ZM10.5 53H13.5V49H10.5V53ZM18.5 53H21.5V49H18.5V53ZM26.5 53H29.5V49H26.5V53ZM34.5 53H37.5V49H34.5V53ZM42.5 53H45.5V49H42.5V53ZM50.5 53H53.5V49H50.5V53ZM58.5 53H61.5V49H58.5V53ZM2.5 7H5.5V3H2.5V7ZM10.5 7H13.5V3H10.5V7ZM18.5 7H21.5V3H18.5V7ZM26.5 7H29.5V3H26.5V7ZM34.5 7H37.5V3H34.5V7ZM42.5 7H45.5V3H42.5V7ZM50.5 7H53.5V3H50.5V7ZM58.5 7H61.5V3H58.5V7Z"
            fill="var(--color-film-stock)"
            fillOpacity={1}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
