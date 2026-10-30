import { useId, type SVGProps } from 'react';

interface FilmRollLeaderProps extends SVGProps<SVGSVGElement> {
  scale?: number;
}

/** Repeats perforations at their original pitch for any exposed leader length. */
export function FilmRollLeader({ scale = 1, ...props }: FilmRollLeaderProps) {
  const patternId = `film-leader-${useId().replace(/:/g, '')}`;
  return (
    <svg
      width={148 * scale}
      height={129 * scale}
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
          width={148 * scale}
          height={129 * scale}
          patternUnits="userSpaceOnUse"
        >
          <path
            transform={`scale(${scale})`}
            d="M 148 129 H 0 V 0 H 148 V 129 Z M 6 122 H 13 V 113 H 6 V 122 Z M 24 122 H 31 V 113 H 24 V 122 Z M 43 122 H 50 V 113 H 43 V 122 Z M 61 122 H 68 V 113 H 61 V 122 Z M 80 122 H 87 V 113 H 80 V 122 Z M 98 122 H 105 V 113 H 98 V 122 Z M 117 122 H 124 V 113 H 117 V 122 Z M 135 122 H 142 V 113 H 135 V 122 Z M 6 16 H 13 V 7 H 6 V 16 Z M 24 16 H 31 V 7 H 24 V 16 Z M 43 16 H 50 V 7 H 43 V 16 Z M 61 16 H 68 V 7 H 61 V 16 Z M 80 16 H 87 V 7 H 80 V 16 Z M 98 16 H 105 V 7 H 98 V 16 Z M 117 16 H 124 V 7 H 117 V 16 Z M 135 16 H 142 V 7 H 135 V 16 Z"
            fill="var(--color-film-stock)"
            fillOpacity={1}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
