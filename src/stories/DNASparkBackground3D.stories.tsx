import React from 'react';
import DNASparkBackground3D from '../DNASparkBackground3D';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DNASparkBackground3D> = {
  title: 'Backgrounds/DNASparkBackground3D (three.js)',
  component: DNASparkBackground3D,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof DNASparkBackground3D>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <DNASparkBackground3D {...args} />
    </div>
  ),
  args: { basePairCount: 40, helixRadius: 25, particleCount: 150 }
};
