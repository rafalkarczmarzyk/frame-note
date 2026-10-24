import { createCaption } from './document';
import { createCaptionLayout, addCaption } from './caption-layout';
import { createPreset } from './presets';

export const defaultTemplate = '{author}\n{lens}\n{exposure}';
const defaultLayout = createCaptionLayout({
  ...createCaption(),
  template: defaultTemplate,
});
const darkLayout = structuredClone(defaultLayout);
darkLayout.containers.forEach((container) => {
  container.style.color = 'charcoal';
});
const macroLayout = addCaption(defaultLayout, 'helicon-stack');
macroLayout.containers[1]!.template = '{heliconStack}';
macroLayout.containers[1]!.style.textAlign = 'right';
export const builtinPresets = [
  createPreset('builtin-default', 'Default', defaultLayout, []),
  createPreset('builtin-default-dark', 'Default dark', darkLayout, []),
  createPreset('builtin-macro', 'Macro', macroLayout, []),
];
