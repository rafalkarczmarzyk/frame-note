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

export const brightBackgroundFixture = {
  path: fileURLToPath(
    new URL('./fixtures/20260405-K89A0565.jpg', import.meta.url),
  ),
  sha256: 'e6919b8d0df4aa8203eed43be9a80555fbf65560c6a4723ce51537aed95b314d',
  dimensions: { width: 3232, height: 2155 },
  expectedExif: {
    Artist: 'Rafal Karczmarzyk',
    Model: 'Canon EOS R6m2',
    LensModel: 'RF200-800mm F6.3-9 IS USM',
    ExposureTime: '1/3200',
    FNumber: 'f/10.0',
    ISOSpeedRatings: '1600',
  },
} as const;

export const macroFixture = {
  path: fileURLToPath(
    new URL('./fixtures/20261021-IMG_9959.jpg', import.meta.url),
  ),
  sha256: '171fb830ffe177c611826d380b8c3e54ba060e97df621b51430bc6a06cf3abce',
  dimensions: { width: 3908, height: 2605 },
  expectedExif: {
    Artist: 'Rafal Karczmarzyk',
    Model: 'Canon EOS R6m2',
    LensModel: 'RF100mm F2.8 L MACRO IS USM',
    ExposureTime: '1/100',
    FNumber: 'f/8.0',
    ISOSpeedRatings: '800',
  },
} as const;

export const heliconFixture = {
  path: fileURLToPath(
    new URL(
      './fixtures/20261020-2026-10-20 14-06-39 (A,R8,S4).jpg',
      import.meta.url,
    ),
  ),
  sha256: '41797a80fa91c69330112c21cd5d6b82ef2cb879d266effa6cb745338270c386',
  dimensions: { width: 4835, height: 3275 },
  expectedExif: {
    Artist: 'Rafal Karczmarzyk',
    Model: 'Canon EOS R6m2',
    LensModel: 'RF100mm F2.8 L MACRO IS USM',
    ExposureTime: '1/250',
    FNumber: 'f/9.0',
    ISOSpeedRatings: '400',
    UserComment: 'Stacked from 15 images. Method=A (R=8,S=4)',
  },
} as const;

export const nightFixture = {
  path: fileURLToPath(
    new URL('./fixtures/20210228-IMG_3200.jpg', import.meta.url),
  ),
  sha256: 'f0db5dfce7c2c976a35611605bf17b9672df94c5008ecec04225fa3314221819',
  dimensions: { width: 3856, height: 5784 },
  expectedExif: {
    Artist: 'Rafal Karczmarzyk',
    Model: 'Canon EOS RP',
    LensModel: 'RF24-105mm F4 L IS USM',
    ExposureTime: '3.2',
    FNumber: 'f/4.0',
    ISOSpeedRatings: '2000',
  },
} as const;

export const xmpPortraitFixture = {
  path: fileURLToPath(new URL('./fixtures/Agata-104.jpg', import.meta.url)),
  sha256: 'ac0fbe4f8fd0f6a95d0aebb02c8406d98ce537fa7b14057718a81e39aff960bc',
  dimensions: { width: 4000, height: 6000 },
} as const;
