import React from 'react';
import BinaryMatrixBackground from '../BinaryMatrixBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BinaryMatrixBackground> = {
  title: 'Backgrounds/BinaryMatrixBackground',
  component: BinaryMatrixBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof BinaryMatrixBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <BinaryMatrixBackground {...args} />
    </div>
  ),
  args: { fontSize: 18, density: 0.05, color: 'rgba(0,255,0,0.8)', trailLength: 15 }
};
