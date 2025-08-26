import React from 'react';
import type { Preview } from '@storybook/react';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
  layout: 'fullscreen'
};

export const decorators = [
  (Story: any) => (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Story />
    </div>
  )
];

const preview: Preview = {};
export default preview;
