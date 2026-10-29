/** Production compositions curated for repeatable visual review. */
import * as photos from '../editor-test-photos.stories';
export default { ...photos.default, title: 'Screens/VisualRegression' };
export const Landscape = photos.PresetDefault;
export const Portrait = photos.PresetSignature;
export const Layers = photos.MultipleCaptions;
export const MixedGraphics = photos.MixedImages;
export const Color = photos.ColorLayerBackground;
export const Glass = photos.GlassLayerBackground;
export const GlassPortrait = photos.GlassPortraitBackground;
export const Margins = photos.MarginRulers;
