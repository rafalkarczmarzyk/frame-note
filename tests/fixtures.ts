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

export const portraitFixture = {
  path: fileURLToPath(
    new URL('./fixtures/20261021-IMG_0469.jpg', import.meta.url),
  ),
  sha256: '9f652d99e098c448d8568b87e2a1cf1cbea133bb917f70182dc589c1417e36c2',
  dimensions: { width: 4000, height: 6000 },
  expectedExif: {
    Artist: 'Rafal Karczmarzyk',
    Model: 'Canon EOS R6m2',
    LensModel: 'RF200-800mm F6.3-9 IS USM + EXTENDER RF1.4x',
    ExposureTime: '1/1250',
    FNumber: 'f/13',
    ISOSpeedRatings: '1000',
  },
} as const;
