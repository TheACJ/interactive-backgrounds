import React from 'react';
import AuroraBackground from '../AuroraBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AuroraBackground> = {
  title: 'Backgrounds/AuroraBackground',
  component: AuroraBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof AuroraBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <AuroraBackground {...args} />
    </div>
  ),
  args: { mouseRadius: 150, rippleColor: 'rgba(255,255,255,0.2)', layers: 5, waveSpeed: 1 }
};
