import React from 'react';
import ConstellationFieldBackground from '../ConstellationFieldBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ConstellationFieldBackground> = {
  title: 'Backgrounds/ConstellationFieldBackground',
  component: ConstellationFieldBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof ConstellationFieldBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <ConstellationFieldBackground {...args} />
    </div>
  ),
  args: { particleCount: 120, maxDistance: 120 }
};
