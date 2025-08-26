import React from 'react';
import QuantumWebBackground from '../QuantumWebBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof QuantumWebBackground> = {
  title: 'Backgrounds/QuantumWebBackground',
  component: QuantumWebBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof QuantumWebBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <QuantumWebBackground {...args} />
    </div>
  ),
  args: { densityDivisor: 5000, glowMultiplier: 3 }
};
