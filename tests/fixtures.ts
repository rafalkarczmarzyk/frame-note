import { fileURLToPath } from 'node:url';

export const wildlifeFixture = {
  path: fileURLToPath(
    new URL('./fixtures/20260520-IMG_3843.jpg', import.meta.url),
  ),
  sha256: '9d34c8751b3dded336bd05da6502a9782c300bea789565e6a55b3a7d6fe3b849',
  dimensions: { width: 5964, height: 3976 },
  expectedExif: {
    Artist: 'Rafal Karczmarzyk',
    Model: 'Canon EOS R6m2',
    LensModel: 'RF100-500mm F4.5-7.1 L IS USM + EXTENDER RF1.4x',
    ExposureTime: '1/1600',
    FNumber: 'f/10',
    ISOSpeedRatings: '20000',
  },
} as const;
