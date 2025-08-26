import React from 'react';
import DNASparkBackground from '../DNASparkBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DNASparkBackground> = {
  title: 'Backgrounds/DNASparkBackground (2D)',
  component: DNASparkBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof DNASparkBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <DNASparkBackground {...args} />
    </div>
  ),
  args: { basePairCount: 40, helixRadius: 25 }
};
