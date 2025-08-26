import React from 'react';
import DreamyHaloBackground from '../DreamyHaloBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DreamyHaloBackground> = {
  title: 'Backgrounds/DreamyHaloBackground',
  component: DreamyHaloBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof DreamyHaloBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <DreamyHaloBackground {...args} />
    </div>
  ),
  args: { haloCount: 6 }
};
