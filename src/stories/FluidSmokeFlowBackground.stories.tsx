import React from 'react';
import FluidSmokeFlowBackground from '../FluidSmokeFlowBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FluidSmokeFlowBackground> = {
  title: 'Backgrounds/FluidSmokeFlowBackground',
  component: FluidSmokeFlowBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof FluidSmokeFlowBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <FluidSmokeFlowBackground {...args} />
    </div>
  ),
  args: { particleCount: 120 }
};
