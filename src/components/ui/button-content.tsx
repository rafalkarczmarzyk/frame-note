import { Children, isValidElement, type ReactNode } from 'react';

/** Label presence determines icon geometry, including fragments in segments. */
export function buttonContentMode(content: ReactNode): 'icon' | 'label' {
  const hasLabel = (nodes: ReactNode): boolean =>
    Children.toArray(nodes).some((node) => {
      if (typeof node === 'string') return node.trim().length > 0;
      if (typeof node === 'number') return true;
      return isValidElement<{ children?: ReactNode }>(node)
        ? hasLabel(node.props.children)
        : false;
    });
  return hasLabel(content) ? 'label' : 'icon';
}
