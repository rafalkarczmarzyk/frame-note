/** Self-contained, validated SVG artwork; no runtime image objects. */
export interface SvgAsset {
  name: string;
  svg: string;
  aspect: number;
}
export interface LogoContent {
  asset: SvgAsset;
  /** Width in the document sizing unit; height follows the SVG aspect ratio. */
  width: number;
  colorMode: 'original' | 'single';
}
