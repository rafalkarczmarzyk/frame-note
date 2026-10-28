export type VerticalAlignment = 'top' | 'center' | 'bottom';
export interface ElementSizing {
  height: number;
  unit: 'font' | 'document';
  alignment?: VerticalAlignment;
}
export interface IconReference extends ElementSizing {
  name: string;
}
export function parseIconToken(token: string): IconReference | null {
  const match =
    /^icon:([^:{}]+?)(?::([\d.e+-]+):(font|document):(top|center|bottom))?$/u.exec(
      token,
    );
  if (!match) return null;
  const height = match[2] === undefined ? 1 : Number(match[2]);
  if (!Number.isFinite(height) || height <= 0 || height > 1e7) return null;
  return {
    name: match[1]!,
    height,
    unit: (match[3] ?? 'font') as ElementSizing['unit'],
    ...(match[4] ? { alignment: match[4] as VerticalAlignment } : {}),
  };
}
export function iconToken(ref: IconReference): string {
  return `icon:${ref.name}:${ref.height}:${ref.unit}:${ref.alignment ?? 'center'}`;
}
