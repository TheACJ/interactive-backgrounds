import React from 'react';
import TextParticlesBackground from '../TextParticlesBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TextParticlesBackground> = {
  title: 'Backgrounds/TextParticlesBackground',
  component: TextParticlesBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof TextParticlesBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <TextParticlesBackground {...args} />
    </div>
  ),
  args: { /* default args depend on component implementation */ }
};
