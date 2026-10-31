import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { parsePreset } from '../packages/core/src/presets';
import { validateSvgAsset } from '../packages/core/src/svg-validation';

export function readPreset(source: string) {
  return parsePreset(source, (name, svg) =>
    validateSvgAsset(name, svg, {
      parse: (value) =>
        new DOMParser({
          onError: () => {
            throw Error('Invalid SVG XML.');
          },
        }).parseFromString(value, 'image/svg+xml') as unknown as Document,
      serialize: (element) =>
        new XMLSerializer().serializeToString(element as never),
    }),
  );
}
