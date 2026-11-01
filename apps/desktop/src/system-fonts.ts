import { setSystemFonts } from '../../../packages/core/src/fonts';
import {
  systemFontCatalog,
  type SystemFontFace,
} from '../../../packages/core/src/system-fonts';

export function registerSystemFonts(faces: readonly SystemFontFace[]) {
  const catalog = systemFontCatalog(faces);
  for (const font of catalog) {
    for (const face of font.faces) {
      document.fonts.add(
        new FontFace(font.id, `local(${JSON.stringify(face.postscriptName)})`, {
          weight: String(face.weight),
          style: face.style,
        }),
      );
    }
  }
  setSystemFonts(catalog);
}
