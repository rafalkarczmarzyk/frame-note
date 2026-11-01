import { captionFonts, type CaptionFont } from './fonts';

export interface SystemFontFace {
  family: string;
  style: string;
  postscriptName: string;
  nativeWeight?: number;
  bold?: boolean;
  italic?: boolean;
}
export interface SystemFont extends CaptionFont {
  faces: {
    weight: 400 | 700;
    style: 'normal' | 'italic';
    postscriptName: string;
  }[];
}
/** Group native faces, keeping bundled families authoritative. No synthetic bold/italic. */
export function systemFontCatalog(
  input: readonly SystemFontFace[],
): SystemFont[] {
  const grouped = new Map<string, SystemFontFace[]>();
  for (const face of input) {
    if (
      !face.family.trim() ||
      !face.postscriptName ||
      face.family.startsWith('.') ||
      captionFonts.some(
        (font) => font.id === face.family || font.label === face.family,
      )
    )
      continue;
    grouped.set(face.family, [...(grouped.get(face.family) ?? []), face]);
  }
  return [...grouped]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, entries]) => {
      const faces: SystemFont['faces'] = [];
      const ranked = [...entries].sort((a, b) => {
        const rank = (style: string) =>
          /^(regular|normal|roman|book|plain)$/iu.test(style) ? 0 : 1;
        if (a.nativeWeight !== undefined && b.nativeWeight !== undefined)
          return (
            Math.abs(a.nativeWeight - 5) - Math.abs(b.nativeWeight - 5) ||
            a.postscriptName.localeCompare(b.postscriptName)
          );
        return (
          rank(a.style) - rank(b.style) ||
          a.postscriptName.localeCompare(b.postscriptName)
        );
      });
      for (const italic of [false, true]) {
        const matching = ranked.filter(
          (face) =>
            (face.italic ?? /italic|oblique/iu.test(face.style)) === italic,
        );
        const regular =
          matching.find(
            (face) => !(face.bold ?? /bold|black|heavy/iu.test(face.style)),
          ) ?? matching[0];
        const bold = matching.find(
          (face) =>
            face.bold ?? /^bold(?:\s*(italic|oblique))?$/iu.test(face.style),
        );
        if (regular)
          faces.push({
            weight: 400,
            style: italic ? 'italic' : 'normal',
            postscriptName: regular.postscriptName,
          });
        if (bold)
          faces.push({
            weight: 700,
            style: italic ? 'italic' : 'normal',
            postscriptName: bold.postscriptName,
          });
      }
      // A family containing only italic faces still has a usable default face.
      if (
        !faces.some((face) => face.weight === 400 && face.style === 'normal')
      ) {
        faces.push({
          weight: 400,
          style: 'normal',
          postscriptName: ranked[0]!.postscriptName,
        });
      }
      return {
        id: family,
        label: family,
        category: 'System',
        missingPolish: '',
        bold: faces.some(
          (face) => face.weight === 700 && face.style === 'normal',
        ),
        italic: faces.some((face) => face.style === 'italic'),
        faces,
      };
    });
}
