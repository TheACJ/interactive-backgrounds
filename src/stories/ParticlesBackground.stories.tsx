import React from 'react';
import ParticlesBackground from '../ParticlesBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ParticlesBackground> = {
  title: 'Backgrounds/ParticlesBackground',
  component: ParticlesBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof ParticlesBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <ParticlesBackground {...args} />
    </div>
  ),
  args: { particleCount: 100, connectionDistance: 120 }
};
